import React, { useEffect } from "react";
import Image from "next/image";

interface LoadingModalProps {
  isOpen: boolean;
  text?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  text = "Refreshing lols" 
}) => {
  // Disable scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex justify-center items-center"
      style={{ background: '#12121266' }}
    >
      <div className="relative bg-white md:w-[401px] md:h-[243px] w-[300px] h-[180px] rounded-[5px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[10px] md:gap-[14px] absolute md:top-[-120px] top-[-84px]">
          <Image
            src="/assets/images/bottle-sprite-t.gif"
            alt="Loading Animation"
            width={400}
            height={400}
            className="object-contain w-[200px] h-[200px] md:w-[300px] md:h-[300px]"
            unoptimized
            priority
          />
          <p className="text-black text-[16px] md:text-[20px] font-[500] text-center">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;

