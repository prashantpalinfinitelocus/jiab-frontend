"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MemeTemplate } from "@/types/meme";
import useAppSelector from "@/hooks/useSelector";
import { ILanguage } from "@/store/reference";
import GreenCTA from "@/components/GreenCTA";
import MemePreviewCard from "@/components/MemePreviewCard";
import { useSubmitMeme, useGenerateMeme } from "@/api/hooks/MemeHooks";
import LoadingModal from "@/components/common/LoadingModal";
import MemeSubmitSuccessModal from "@/components/MemeSubmitSuccessModal";
import { MEME_TEMPLATES, isAllowedMemeSourceUrl } from "@/constants";



// Language options will be rendered from reference store (state.reference.languages)

// POST /meme-generator/generate rejects text longer than 20 characters
// The generator API enforces its own cap; keep this in step with it or a
// submission over the limit comes back as a 400.
const MAX_CHAR_LIMIT = 40;
// Smaller than it once was so the longer line still fits the two-line box.
const MEME_FONT_SIZE = 20;
const MEME_LINE_HEIGHT = 22;
const MEME_TEXT_MAX_LINES = 2;
// The Sprite logo sits on the meme like a watermark.
const LOGO_OPACITY = 0.25;

const MemeEditorPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { languages } = useAppSelector((state) => state.reference);
  const { user } = useAppSelector((state) => state.profile);
  const { mutateAsync: submitMeme, isPending: isSubmitting } = useSubmitMeme();
  const { mutateAsync: generateMeme, isPending: isGenerating } = useGenerateMeme();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [languageOptions, setLanguageOptions] = useState<{
    id: number;
    value: string;
    label: string;
  }[]>([]);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [template, setTemplate] = useState<MemeTemplate | undefined>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const getPreviewStorageKey = (templateId: string) => `meme-preview-${templateId}`;

  // Load template data from sessionStorage or static data
  useEffect(() => {
    try {
      const storedTemplate = sessionStorage.getItem(`template-${id}`);
      if (storedTemplate) {
        const parsed = JSON.parse(storedTemplate) as MemeTemplate;
        setTemplate(parsed);
        return;
      }
    } catch (e) {
      console.error("Failed to load template from storage", e);
    }
    // Fallback to static templates
    const staticTemplate = MEME_TEMPLATES.find((t: MemeTemplate) => t.id === id);
    setTemplate(staticTemplate);
  }, [id]);

  // Cleanup object URL when component unmounts or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Keep URL in sync with preview state
  const setPreviewQuery = (value: boolean) => {
    const paramsCopy = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      paramsCopy.set("preview", "true");
    } else {
      paramsCopy.delete("preview");
    }
    const qs = paramsCopy.toString();
    router.replace(`/create-memes/${id}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // Initialize preview mode from query param
  useEffect(() => {
    const qpPreview = searchParams.get("preview") === "true";
    setShowPreview(qpPreview);
  }, [searchParams]);

  // Restore preview URL from session storage on mount/ID change
  useEffect(() => {
    try {
      const key = getPreviewStorageKey(id);
      const storedPreview = sessionStorage.getItem(key);
      if (storedPreview && /^https?:\/\//i.test(storedPreview)) {
        setPreviewUrl(storedPreview);
        setShowPreview(true);
      }
    } catch (e) {
      // ignore storage errors but log for debugging
      console.debug("Failed to restore preview URL from sessionStorage", e);
    }
  }, [id]);

  // Prepare language options from reference store when available
  useEffect(() => {
    if (languages && languages.length > 0) {
      const opts = languages.map((item: ILanguage) => ({
        id: item.id,
        value: item.language_key,
        label: item.vernacual_name ?? item.name,
      }));
      setLanguageOptions(opts);
      // If current selection not found in new options, default to first
      if (!opts.find((o) => o.value === selectedLanguage)) {
        setSelectedLanguage(opts[0]?.value ?? "english");
      }
    }
  }, [languages, selectedLanguage]);

  // No canvas rendering needed; preview uses CSS layering
  useEffect(() => {
    // Placeholder to keep similar effect structure if needed later
  }, [template, topText, bottomText]);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-[24px] font-[600] mb-[12px]">
            Template not found
          </h2>
          <p className="text-[16px] text-mediumGray">
            The meme template you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateMeme = async () => {
    if (isGenerating) {
      return;
    }
    // Validate inputs
    if (!topText.trim() && !bottomText.trim()) {
      setShowValidation(true);
      return;
    }

    setGenerateError(null);

    if (!template?.imageURL) {
      console.error("Template image not found");
      setGenerateError("This template couldn't be loaded. Please go back and pick another one.");
      return;
    }

    // Why the backend rejected us, in its own words. The response interceptor
    // resolves failed requests instead of rejecting them, so a 400 arrives here
    // looking like a successful response whose body happens to be the error
    // JSON - this is the only place that reason survives.
    let serverMessage: string | undefined;

    try {
      // Prefer sending the template's own URL: the backend fetches it
      // server-to-server instead of the browser downloading it just to
      // re-upload the same bytes back to us, which is what made generation
      // slow (and prone to timing out) on larger GIF templates. Only known,
      // backend-fetchable hosts qualify; anything else (e.g. a local static
      // fallback asset) still goes through the client fetch-then-upload path.
      const resultBlob = isAllowedMemeSourceUrl(template.imageURL)
        ? await generateMeme({
            memeUrl: template.imageURL,
            top_text: topText,
            bottom_text: bottomText,
          })
        : await generateMeme({
            meme: await (await fetch(template.imageURL)).blob(),
            top_text: topText,
            bottom_text: bottomText,
          });

      // POST /meme-generator/generate responds with JSON { imageUrl, message },
      // wrapped in a { data, status, success } envelope on some deployments.
      // Only /meme-generator/generate-stream returns raw image bytes.
      let usedUrl: string | undefined = undefined;
      let jsonWithoutImageUrl = false;
      try {
        // Attempt to parse JSON when content-type is JSON or unknown
        const isMaybeJson = !resultBlob.type || resultBlob.type.includes("application/json");
        if (isMaybeJson) {
          const text = await resultBlob.text();
          const parsed = JSON.parse(text);
          const imageUrl: string | undefined =
            parsed?.imageUrl ||
            parsed?.data?.imageUrl ||
            parsed?.data?.image_url ||
            parsed?.image_url;
          if (imageUrl && typeof imageUrl === "string") {
            usedUrl = imageUrl;
          } else {
            jsonWithoutImageUrl = true;
            const reason = parsed?.message ?? parsed?.data?.message;
            if (typeof reason === "string" && reason.trim()) {
              serverMessage = reason.trim();
            }
          }
        }
      } catch (err) {
        // Not JSON; proceed with binary
        console.debug("Generator response is not JSON; using binary blob.", err);
      }

      if (jsonWithoutImageUrl) {
        // Never fall through to the binary branch holding a JSON body: it would
        // render as a broken preview and then be uploaded as the meme asset,
        // which the backend rejects - so no meme would ever be created.
        throw new Error(
          serverMessage ?? "Generator returned JSON without an image URL"
        );
      }

      if (usedUrl) {
        // Prefer rendering directly from remote URL (e.g., animated GIF)
        setGeneratedBlob(null);
        setPreviewUrl(usedUrl);
        // Persist preview URL to survive refresh
        try {
          sessionStorage.setItem(getPreviewStorageKey(id), usedUrl);
        } catch (err) {
          console.debug("Failed to persist preview URL", err);
        }
      } else {
        // Create object URL for binary preview
        const url = URL.createObjectURL(resultBlob);
        setGeneratedBlob(resultBlob);
        setPreviewUrl(url);
      }

      // Show preview screen and persist via query param
      setShowPreview(true);
      setPreviewQuery(true);
    } catch (e) {
      console.error("Failed to generate meme", e);
      // Blaming the connection for a rejection the backend explained is how
      // people end up retrying the same too-long caption forever.
      setGenerateError(
        serverMessage ??
          "Couldn't create your meme. Please check your connection and try again."
      );
    }
  };

  const handleRetry = () => {
    setShowPreview(false);
    setTermsAccepted(false);
    setPreviewQuery(false);
    // Reset editor inputs to restart state
    setTopText("");
    setBottomText("");
    setShowValidation(false);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(undefined);
    setGeneratedBlob(null);
    // Clear persisted preview URL
    try {
      sessionStorage.removeItem(getPreviewStorageKey(id));
    } catch (e) {
      // ignore storage errors but log for debugging
      console.debug("Failed to clear preview URL from sessionStorage", e);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/create-memes");
  };

  // Loads an image for canvas compositing. Giphy serves
  // access-control-allow-origin: *, so requesting it anonymously keeps the
  // canvas untainted and toBlob() usable.
  const loadImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });

  // Composites the meme on a canvas and exports compressed JPEG bytes.
  //
  // This previously built an SVG with the backdrop, template and logo inlined
  // as base64 data URLs. With a 3.4MB backdrop and a multi-MB template GIF that
  // produced a ~16MB image/svg+xml upload, which the 10s axios timeout
  // cancelled before it ever reached the backend. Rasterising here keeps the
  // upload to tens of KB. Note this flattens animated GIFs to their first
  // frame; the animated asset comes from the generator API's own output.
  const generateMemeBlob = async (
    templateUrl: string,
    top: string,
    bottom: string
  ) => {
    const width = 450;
    const height = 440.56;
    const topMargin = 32;
    const bottomMargin = 45;
    const fontSize = MEME_FONT_SIZE;
    const lineHeight = MEME_LINE_HEIGHT;
    // Matches the preview's "width: calc(100% - 40px)".
    const maxTextWidth = width - 40;
    const scale = 2; // render at 2x so text stays crisp

    const [bg, template, logo] = await Promise.all([
      loadImage("/assets/temp/backdrop-image-ugc.png"),
      loadImage(templateUrl),
      loadImage("/assets/meme-burst/sprite-logo-white.png"),
    ]);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable");
    }
    ctx.scale(scale, scale);

    // Backdrop stretched to fill, matching preserveAspectRatio="none"
    ctx.drawImage(bg, 0, 0, width, height);

    // Template contained and centred, matching preserveAspectRatio="xMidYMid meet"
    const fit = Math.min(width / template.width, height / template.height);
    const tW = template.width * fit;
    const tH = template.height * fit;
    ctx.drawImage(template, (width - tW) / 2, (height - tH) / 2, tW, tH);

    // Only draw lines the user actually typed - an empty field must not
    // burn a "TOP/BOTTOM TEXT HERE" placeholder into the meme.
    const safeTop = top.trim().toUpperCase();
    const safeBottom = bottom.trim().toUpperCase();

    ctx.font = `700 ${fontSize}px AktivGroteskCorp, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    ctx.lineJoin = "round";
    // Wrap to the same two-line box the preview uses. Without this the text
    // was drawn as a single line and ran off both edges of the canvas as soon
    // as it grew past a handful of words.
    const wrapText = (text: string): string[] => {
      const lines: string[] = [];
      let line = "";

      const pushWordWise = (word: string) => {
        // A single word wider than the box has to break mid-word, the way the
        // preview's overflow-wrap: anywhere does.
        let chunk = "";
        for (const char of word) {
          if (ctx.measureText(chunk + char).width > maxTextWidth && chunk) {
            lines.push(chunk);
            chunk = char;
          } else {
            chunk += char;
          }
        }
        line = chunk;
      };

      for (const word of text.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxTextWidth) {
          line = candidate;
          continue;
        }
        if (line) {
          lines.push(line);
          line = "";
        }
        if (ctx.measureText(word).width > maxTextWidth) {
          pushWordWise(word);
        } else {
          line = word;
        }
      }
      if (line) lines.push(line);
      return lines.slice(0, MEME_TEXT_MAX_LINES);
    };

    // stroke beneath fill, matching paint-order: stroke fill
    const drawLine = (text: string, y: number) => {
      ctx.strokeText(text, width / 2, y);
      ctx.fillText(text, width / 2, y);
    };

    const topLines = wrapText(safeTop);
    topLines.forEach((line, i) => {
      drawLine(line, topMargin + fontSize + i * lineHeight);
    });

    // The bottom block grows upward so its last line keeps the same baseline.
    const bottomLines = wrapText(safeBottom);
    bottomLines.forEach((line, i) => {
      const fromBottom = bottomLines.length - 1 - i;
      drawLine(line, height - bottomMargin - fromBottom * lineHeight);
    });

    // Logo contained in a 64px box with a 12px margin, bottom-right.
    // Preserve its aspect ratio (it is 320x108, not square) - forcing it into a
    // square box stretched it. Mirrors preserveAspectRatio="xMaxYMax meet".
    const logoBox = 64;
    const logoFit = Math.min(logoBox / logo.width, logoBox / logo.height);
    const lW = logo.width * logoFit;
    const lH = logo.height * logoFit;
    // Semi-transparent, like a watermark (matches the preview).
    ctx.globalAlpha = LOGO_OPACITY;
    ctx.drawImage(logo, width - 12 - lW, height - 12 - lH, lW, lH);
    ctx.globalAlpha = 1;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) {
      throw new Error("Failed to encode meme image");
    }
    return blob;
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      return;
    }
    
    try {
      // Get language_id from selected language
      const selectedLang = languageOptions.find(
        (lang) => lang.value === selectedLanguage
      );
      if (!selectedLang) {
        console.error("Selected language not found");
        return;
      }

      // Prefer generated binary from generator API
      let blobToUpload: Blob | null = generatedBlob;

      // If preview is a remote URL (e.g., generator returned data.image_url), fetch it
      if (!blobToUpload && previewUrl && /^https?:\/\//i.test(previewUrl)) {
        try {
          const fetched = await fetch(previewUrl);
          const fetchedBlob = await fetched.blob();
          blobToUpload = fetchedBlob;
        } catch (err) {
          console.warn("Failed to fetch preview URL for upload; will fallback to SVG.", err);
        }
      }

      // Fallback to local SVG generation if nothing to upload yet
      if (!blobToUpload) {
        if (!template?.imageURL) {
          console.error("Template image not found");
          return;
        }
        blobToUpload = await generateMemeBlob(template.imageURL, topText, bottomText);
      }

      // Submit meme
      const result = await submitMeme({
        language_id: selectedLang.id,
        template_id: id,
        text1: topText,
        text2: bottomText,
        asset: blobToUpload as Blob,
      });

      // On success, show modal
      if (result) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Failed to submit meme:", error);
      // You can add error handling UI here if needed
    }
  };

  // Get selected language label
  const selectedLanguageLabel = languageOptions.find(
    (lang) => lang.value === selectedLanguage
  )?.label || "English";

  // If in preview mode, show preview screen
  if (showPreview) {
    return (
      <>
        {/* Tab Navigation (matches /create-memes) */}
        <div className="flex w-full border-b border-gray-200">
          <Link
            href="/create-memes"
            className={`flex-1 md:py-4 py-2 text-center md:text-[20px] text-[12px] leading-[100%] transition-all duration-200 relative text-black font-[700]`}
          >
            Create
            <div className="absolute bottom-0 left-0 right-0 md:h-1 h-0.5 bg-green" />
          </Link>
          <Link
            href="/create-memes?tab=myMemes"
            className={`flex-1 md:py-4 py-2 text-center md:text-[20px] text-[12px] leading-[100%] transition-all duration-200 border-l relative text-black font-[400]`}
          >
            My Memes
          </Link>
        </div>

        <div className="md:mt-[24px] mt-[12px] md:mx-0 mx-4">
            {/* Title */}
            <h1 className="text-center md:text-[20px] text-[14px] font-[500] md:mb-8 mb-[20px]">
            Unleash your inner meme-lord👇 
            </h1>

            {/* Meme Preview Card Component */}
            <MemePreviewCard
              userName={user?.name || "User"}
              selectedLanguage={selectedLanguageLabel}
              avatarUrl={user?.userImage || user?.profile_picture || "/profile-images/profile-image-guest.svg"}
              imageSrc={previewUrl}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              onRetry={handleRetry}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            {/* Progress modal during generation/submission */}
            <LoadingModal isOpen={isGenerating} text="Creating your meme..." />
            <LoadingModal isOpen={isSubmitting} text="Submitting your meme..." />
            <MemeSubmitSuccessModal
              open={showSuccessModal}
              onClose={handleCloseSuccessModal}
              onDropAnother={() => {
                router.push("/create-memes");
              }}
              onViewVault={() => {
                router.push("/create-memes?tab=myMemes");
              }}
            />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Tab Navigation (matches /create-memes) */}
      <div className="flex w-full border-b border-gray-200">
        <Link
          href="/create-memes"
          className={`flex-1 md:py-4 py-2 text-center md:text-[20px] text-[12px] leading-[100%] transition-all duration-200 relative text-black font-[700]`}
        >
          Create
          <div className="absolute bottom-0 left-0 right-0 md:h-1 h-0.5 bg-green" />
        </Link>
        <Link
          href="/create-memes?tab=myMemes"
          className={`flex-1 md:py-4 py-2 text-center md:text-[20px] text-[12px] leading-[100%] transition-all duration-200 border-l relative text-black font-[400]`}
        >
          My Memes
        </Link>
      </div>

      <div className="md:mt-[24px] mt-[12px] md:mx-0 mx-4">
      <div className="max-w-[450px] mx-auto">
        {/* Title */}
        <h1 className="text-center md:text-[20px] text-[14px] font-[500] md:mb-8 mb-[20px]">
          Unleash your inner meme-lord 👇
        </h1>

        {/* Language Selector (from reference store) */}
        <div className="mb-6">
          <label htmlFor="language-select" className="block text-[16px] font-[600] mb-2 text-center">
            Select Language*
          </label>
          <div className="relative">
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-black rounded-full appearance-none cursor-pointer text-[16px] font-[400] focus:outline-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              {languageOptions.map((lang) => (
                <option key={lang.id} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        
        <div 
          className="mb-6 relative w-full h-[380px] md:w-[450px] md:h-[440.56px] mx-auto overflow-hidden"
          style={{
            backgroundImage: `url('/assets/temp/backdrop-image-ugc.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Template image contained between the text bands (56px top, 96px
              bottom for the text and logo) so the text never covers the GIF. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template?.imageURL}
            alt="template"
            className="absolute inset-x-0 top-[56px] h-[calc(100%-152px)] w-full object-contain"
          />

          {/* Top text */}
          <div className="absolute inset-x-0 top-0 h-[56px] flex items-center justify-center">
          <div
            className="text-white text-center font-[700]"
            style={{
              WebkitTextStroke: "1px #000",
              fontSize: `${MEME_FONT_SIZE}px`,
              lineHeight: `${MEME_LINE_HEIGHT}px`,
              width: "calc(100% - 40px)",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: MEME_TEXT_MAX_LINES,
              overflow: "hidden",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              letterSpacing: "0%",
            }}
          >
            {(topText && topText.trim()) ? topText.toUpperCase() : ""}
          </div>
          </div>

          {/* Bottom text, above the logo */}
          <div className="absolute inset-x-0 bottom-[46px] h-[50px] flex items-center justify-center">
          <div
            className="text-white text-center font-[700]"
            style={{
              WebkitTextStroke: "1px #000",
              fontSize: `${MEME_FONT_SIZE}px`,
              lineHeight: `${MEME_LINE_HEIGHT}px`,
              width: "calc(100% - 40px)",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: MEME_TEXT_MAX_LINES,
              overflow: "hidden",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              letterSpacing: "0%",
            }}
          >
            {(bottomText && bottomText.trim()) ? bottomText.toUpperCase() : ""}
          </div>
          </div>

          {/* Sprite logo at bottom-right, 64px wide with a 12px margin (matches the canvas export) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/meme-burst/sprite-logo-white.png"
            alt="sprite-logo"
            className="absolute"
            style={{ right: 12, bottom: 12, width: 64, height: "auto", opacity: LOGO_OPACITY }}
          />
        </div>

        {/* Top Text Input */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={topText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHAR_LIMIT) {
                  setTopText(e.target.value);
                  if (showValidation && e.target.value.trim()) {
                    setShowValidation(false);
                  }
                  setGenerateError(null);
                }
              }}
              placeholder="Add Top Text"
              maxLength={MAX_CHAR_LIMIT}
              className="w-full px-4 py-3 bg-white border-2 border-black rounded-full text-[16px] font-[400] focus:outline-none focus:border-green placeholder:text-black"
            />
          </div>
          <div className="text-right md:text-[12px] text-[8px] text-mediumGray mt-1 pr-2">
            Max. limit: {topText.length}/{MAX_CHAR_LIMIT}
          </div>
          {showValidation && !topText.trim() && (
            <div className="text-center md:text-[12px] text-[8px] text-red mt-1">
              Text is required
            </div>
          )}
        </div>

        {/* Bottom Text Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={bottomText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHAR_LIMIT) {
                  setBottomText(e.target.value);
                  if (showValidation && e.target.value.trim()) {
                    setShowValidation(false);
                  }
                  setGenerateError(null);
                }
              }}
              placeholder="Add Bottom Text"
              maxLength={MAX_CHAR_LIMIT}
              className="w-full px-4 py-3 bg-white border-2 border-black rounded-full text-[16px] font-[400] focus:outline-none focus:border-green placeholder:text-black"
            />
          </div>
          <div className="text-right md:text-[12px] text-[8px] text-mediumGray mt-1 pr-2">
            Max. limit: {bottomText.length}/{MAX_CHAR_LIMIT}
          </div>
          {showValidation && !bottomText.trim() && (
            <div className="text-center md:text-[12px] text-[8px] text-red mt-1">
              Text is required
            </div>
          )}
        </div>

        {generateError && (
          <div className="text-center md:text-[14px] text-[12px] text-red mb-3">
            {generateError}
          </div>
        )}

        {/* Create Meme Button */}
        <GreenCTA
          text={isGenerating ? "Creating..." : "Create Meme"}
          onClick={handleCreateMeme}
          className="w-full md:mb-[86.34px] mb-[48px]"
          disabled={isGenerating}
        />
        <LoadingModal isOpen={isGenerating} text="Creating your meme..." />
      </div>
      </div>
    </>
  );
};

export default MemeEditorPage;

