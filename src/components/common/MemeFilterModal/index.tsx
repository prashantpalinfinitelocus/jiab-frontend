import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SvgIcons from "@/components/common/SvgIcons";
import { ICONS_NAMES } from "@/constants";
import { IUgcFilterModal } from "@/interfaces";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import AktivGroteskText from "@/components/common/AktivGroteskText";
import GreenCTA from "@/components/GreenCTA";
import useAppSelector from "@/hooks/useSelector";
import { useCMSData } from "@/data";
import { cn } from "@/lib/utils";
import useAlloyEvents from "@/hooks/useAlloyEvents";

export interface IOption {
  id: number;
  value: string;
  label: string;
  languageCode?: string;
}

const MemeFilterModal: React.FC<IUgcFilterModal> = ({
  open,
  onClose,
  onApply,
  isTamil,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [languageOptions, setLanguageOptions] = useState<IOption[]>([]);

  const { languages } = useAppSelector((state) => state.reference);
  const {trackClick, CDP_EVENT_SUB_TYPES} = useAlloyEvents()

  const { jokeBoxFilter } = useCMSData();

  useEffect(() => {
    const modifiedLanguages = languages?.map((language) => ({
      id: language.id,
      value: language.name,
      label: language.vernacual_name,
      languageCode: language.language_key,
    }));
    const newModifiedLanguages = [
      {
        id: -1,
        value: jokeBoxFilter.select_language_placeholder,
        label: jokeBoxFilter.select_language_placeholder,
        languageCode: "",
      },
      ...modifiedLanguages,
    ];
    setLanguageOptions(newModifiedLanguages);
  }, [languages, jokeBoxFilter]);

  const trigger_CDP_UGC_FILTER = (language?: string, category?: string) => {
    if (language || category) {
      trackClick(`${CDP_EVENT_SUB_TYPES.UGC_FILTER}_${language ?? ""}_${category ?? ""}`);
    }
  };

  const handleApply = () => {
    if (onApply) {
      const selectedOption = languageOptions.find((opt) => opt.value === selectedLanguage);
      const languageCode = selectedOption?.languageCode || "";
      trigger_CDP_UGC_FILTER(languageCode, selectedCategory);
      onApply({
        language: languageCode,
        category: selectedCategory,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-[343px] md:max-w-[398px] gap-0 rounded-[10px] p-0",
          isTamil && "max-w-[343px] md:max-w-[460px] gap-0 rounded-[10px] p-0"
        )}
      >
        <div className="flex items-center justify-end px-[12px] py-[16px]">
          <button
            onClick={onClose}
            className="border-none outline-none bg-transparent hover:opacity-70 transition-opacity"
          >
            <SvgIcons name={ICONS_NAMES.CROSS} className="w-[20px] h-[20px]" />
          </button>
        </div>
        <div className="px-[20px] pb-[32px]">
          <div className="flex flex-col">
            <AktivGroteskText
              text={jokeBoxFilter.pick_your_filter}
              fontSize="md:text-[20px] text-[16px] leading-tight"
              fontWeight="font-[700]"
            />
            <div className="w-full flex justify-end">
              <button
                onClick={() => {
                  setSelectedLanguage("");
                  setSelectedCategory("");
                  setIsLanguageOpen(false);
                  // category removed
                }}
                className="border-none outline-none bg-transparent"
              >
                <AktivGroteskText
                  className="text-[#1985D3]"
                  text={jokeBoxFilter.clear_filters_tag}
                  fontSize="md:text-[20px] text-[10px] leading-tight"
                  fontWeight="font-[700]"
                />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <div
                  className="flex items-center justify-between py-[16px] px-[20px] border-[1px] border-black rounded-full cursor-pointer"
                  onClick={() => {
                    setIsLanguageOpen(!isLanguageOpen);
                  }}
                >
                  <span className={!selectedLanguage ? "text-black" : ""}>
                    {selectedLanguage
                      ? languageOptions.find(
                          (opt) => opt.value === selectedLanguage
                        )?.label
                      : jokeBoxFilter.select_language_placeholder}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isLanguageOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isLanguageOpen && (
                  <RadioGroup
                    value={selectedLanguage}
                    onValueChange={(value) => {
                      if (value === jokeBoxFilter.select_language_placeholder) {
                        setSelectedLanguage("");
                        setIsLanguageOpen(false);
                        return;
                      }
                      setSelectedLanguage(value);
                      setIsLanguageOpen(false);
                    }}
                    className="flex flex-col gap-[8px] px-[15px] py-[13px] border border-gray-200 rounded-[10px] "
                  >
                    {languageOptions?.length > 0 &&
                      languageOptions?.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`language-${option.value}`}
                          />
                          <Label
                            htmlFor={`language-${option.value}`}
                            className="flex-grow cursor-pointer text-[12px] font-[400]"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                )}
              </div>
            </div>

            <div className="flex w-full md:justify-center">
              <GreenCTA
                onClick={handleApply}
                text={jokeBoxFilter.applty_button_text}
                className="w-full md:w-auto"
                paddingClass="md:px-[105px] md:py-[21px] py-[12px] "
                fontSize="md:text-[24px] text-[16px]"
                fontWeight="font-[700]"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemeFilterModal;
