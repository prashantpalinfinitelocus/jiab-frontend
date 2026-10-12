import React from "react";
import { 
  BOTTLE_SHAPE_PATH, 
  WAVE_PATHS, 
  DOTS_PATTERN_PATH, 
  BOTTLE_LABEL_PATH 
} from "./svgData";

interface AnimatedBottleProps {
  label: string;
  bottleId: number;
  fillPercentage: number;
  isAnimating: boolean;
  animationDirection: "normal" | "reverse";
  ariaLabel: string;
  onClick?: () => void;
}
export const AnimatedBottle: React.FC<AnimatedBottleProps> = ({ label, bottleId, fillPercentage, isAnimating, animationDirection, ariaLabel, onClick }) => {
  const totalHeight = 120;
  const padding = 10;
  const yValue = totalHeight - (fillPercentage * (totalHeight + padding) / 100);
  

  return (
    <div
      className={`relative flex-shrink-0 transition-all opacity-100 cursor-pointer`}
      aria-label={ariaLabel}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative w-[28.66px] h-[100px] md:w-[34.39px] md:h-[120px] overflow-hidden">
        
        <svg
          viewBox="0 0 35 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <clipPath id={`bottle-mask-${bottleId}`}>
              <path d={BOTTLE_SHAPE_PATH} />
            </clipPath>
          </defs>

          <path d={BOTTLE_SHAPE_PATH} fill="#D9D9D9"/>

          <g clipPath={`url(#bottle-mask-${bottleId})`}>
            <g
              id={`liquid-vertical-group-${bottleId}`}
              style={{
                transform: `translate(0px, ${yValue}px)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              <g
                className={`wave-horizontal-group-${bottleId}`}
                style={{
                  animationPlayState: 'running',
                  animationDirection: animationDirection
                }}
              >
                {WAVE_PATHS.map((wave, index) => (
                  <path 
                    key={index} 
                    d={wave.d} 
                    fill={wave.fill} 
                    transform={wave.transform} 
                  />
                ))}
              </g>
            </g>
          </g>

          {BOTTLE_LABEL_PATH.map((pathData, index) => (
            <path key={index} d={pathData.d} fill={pathData.fill} />
          ))}
          
          <g opacity="0.3">
            <path d={DOTS_PATTERN_PATH} fill="white"/>
          </g>
        </svg>

        <span className={`absolute inset-0 flex items-center justify-center font-aktiv font-black leading-normal z-20 transition-colors duration-1000 ease-in-out ${
          fillPercentage === 100 ? "text-white" : "text-[#121212]"
        } ${
          label === "7+" ? "text-[10px] md:text-[18.194px]" : "text-[12px] md:text-[18.194px]"
        }`}>
          {label}
        </span>
      </div>
    </div>
  );
};