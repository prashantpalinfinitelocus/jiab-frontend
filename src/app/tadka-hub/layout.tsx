import { Metadata } from 'next';

// Force dynamic rendering since we use searchParams in generateMetadata
export const dynamic = 'force-dynamic';

type Props = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = searchParams || {};
  const selectedJoke = params.selected_joke as string | undefined;
  const langId = params.langId as string | undefined;

  // Default metadata
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://jiab-staging.coke2home.com';

 
  
  let title = 'Tadka Hub | Sprite Joke-In-A-Bottle';
  let description = 'Check out this spicy video on Tadka Hub!';
  let ogImage = `${baseUrl}/assets/spicy-kv/skv-english.jpg`; // English banner for preview card
  let url = `${baseUrl}/tadka-hub`;

  // Fetch dynamic metadata for selected joke
  if (selectedJoke) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (apiUrl) {
        const queryParams = new URLSearchParams({
          selected_joke: selectedJoke,
          limit: '1',
        });
        
        if (langId) {
          queryParams.append('language', langId as string);
        }

        const response = await fetch(`${apiUrl}/joke/spicy-tray?${queryParams.toString()}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

      if (response.ok) {
        const result = await response.json()
        
        // Backend returns: { success: true, data: [...jokes] }
        if (result?.success && result?.data && Array.isArray(result.data) && result.data.length > 0) {
          const joke = result.data[0]
          
          title = joke.title || 'Amazing Video on Tadka Hub'
          description = `Watch this spicy video${joke.artist ? ` by ${joke.artist}` : ''} on Tadka Hub - Sprite Joke-In-A-Bottle`
          
          // Use thumbnail_url from API if available
          // CRITICAL FIX: Ensure thumbnail URL is absolute (required by social platforms)
          if (joke.thumbnail_url) {
            // If already absolute URL, use as is
            if (joke.thumbnail_url.startsWith('http://') || joke.thumbnail_url.startsWith('https://')) {
              ogImage = joke.thumbnail_url
            } 
            // If relative URL starting with /, prepend base URL
            else if (joke.thumbnail_url.startsWith('/')) {
              ogImage = `${baseUrl}${joke.thumbnail_url}`
            } 
            // If relative URL without /, prepend base URL with /
            else {
              ogImage = `${baseUrl}/${joke.thumbnail_url}`
            }
          }
          
          url = `${baseUrl}/tadka-hub?selected_joke=${selectedJoke}${langId ? `&langId=${langId}` : ''}`
        }
      }
      }
    } catch (error) {
      console.error('Error fetching dynamic metadata for Tadka Hub:', error);
    }
  }

  // Ensure ogImage is always an absolute URL for proper preview card display
  // This is critical for social media platforms like WhatsApp to display thumbnails
  const absoluteOgImage = ogImage.startsWith('http://') || ogImage.startsWith('https://') 
    ? ogImage 
    : `${baseUrl}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

  return {
    title,
    description,
    // Testing environment: nothing here belongs in search results.
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description, // WhatsApp uses this for preview card description
      url,
      siteName: 'Sprite Joke-In-A-Bottle',
      images: [
        {
          url: absoluteOgImage, // Use absolute URL for WhatsApp preview
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
      locale: 'en_US',
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@Sprite',
      site: '@Sprite',
    },
    other: {
      // Additional meta tags for better social media support
      'og:image': ogImage,
      'og:image:secure_url': ogImage,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title,
      'twitter:image': ogImage,
      'twitter:image:alt': title,
      'twitter:player': url,
      // WhatsApp specific
      'og:video': url,
      'og:video:secure_url': url,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function TadkaHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}