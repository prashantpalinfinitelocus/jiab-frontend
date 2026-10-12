export const LoadingSpinner: React.FC<{ mobileHeight?: string }> = ({
  mobileHeight = "100vh",
}) => {
  return (
    <div
      className="relative md:w-fit md:h-full w-full flex items-center justify-center"
      style={{
        height:
          typeof window !== "undefined" && window.innerWidth >= 768
            ? "100vh"
            : mobileHeight,
      }}
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-[8px] border-[#08C270] border-t-[#009639] rounded-full animate-spin mb-4"></div>
      </div>
    </div>
  );
};
