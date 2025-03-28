import FPTGlobalGeo from "@/components/GlobalGeo/FPTGlobalGeo";

function Home() {
  return (
    <div className="relative min-h-screen w-full dark:bg-[#121212] bg-gray-50 overflow-hidden">
      {/* Hero Section */}
      <div className="absolute top-0 left-0 w-full h-24 dark:bg-gradient-to-b from-blue-600/20 to-transparent" />

      <div className="container mx-auto px-4 py-8 flex flex-row items-center justify-center">
        {/* Title Section */}
        <div className="text-center mb-8 z-10">
          <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm w-64 h-40 flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-[#1169B0]">26+</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Countries & Territories
            </p>
          </div>
        </div>

        {/* Globe Visualization */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-8 z-10">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#1169B0] via-[#F27227] to-[#16B14B] text-transparent bg-clip-text">
              FPT Global Presence
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Connecting Innovation Across Continents
            </p>
          </div>
          <div className="relative max-w-[600px] h-[600px] mt-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full animate-pulse dark:bg-gradient-to-b dark:from-transparent dark:via-blue-700/5 bg-gradient-to-b from-transparent via-gray-500/5 to-transparent" />
            <FPTGlobalGeo />
          </div>
          <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm w-64 h-40 flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-[#F27227]">40+</h3>
            <p className="text-gray-600 dark:text-gray-300">Global Offices</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm w-64 h-40 flex flex-col items-center justify-center">
          <h3 className="text-3xl font-bold text-[#16B14B]">100K+</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Employees Worldwide
          </p>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-24 dark:bg-gradient-to-t from-blue-600/20 to-transparent" />
    </div>
  );
}

export default Home;
