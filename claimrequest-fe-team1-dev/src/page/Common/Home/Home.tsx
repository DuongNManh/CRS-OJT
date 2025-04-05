import { useState, useMemo } from "react";
import "animate.css";
import { useAppSelector } from "@/services/store/store";
import ClaimerChart from "@/components/StatusChart/ClaimerChart";
import ApproverChart from "@/components/StatusChart/ApproverChart";
import AdminChart from "@/components/StatusChart/AdminChart";
import FinanceChart from "@/components/StatusChart/FinanceChart";
import FPTGlobalInfo from "@/components/GlobalGeo/FPTGlobalInfo";
import WeatherTable from "@/components/WeatherTable/WeatherTable";
import { SystemRole } from "@/interfaces/auth.interface";
import "./Home.css";
import CommonLayout from "@/layouts/CommonLayout";

function Home() {
  const user = useAppSelector((state) => state.auth.user);

  // Define slides based on user role
  const slides = useMemo(() => {
    switch (user?.systemRole) {
      case SystemRole.STAFF:
        return [
          { component: FPTGlobalInfo, label: "Global Info" },
          { component: ClaimerChart, label: "Claim Status" },
          { component: WeatherTable, label: "Weather" },
        ];
      case SystemRole.APPROVER:
        return [
          { component: FPTGlobalInfo, label: "Global Info" },
          { component: ClaimerChart, label: "My Claims" },
          { component: ApproverChart, label: "Pending Approvals" },
          { component: WeatherTable, label: "Weather" },
        ];
      case SystemRole.FINANCE:
        return [
          { component: FPTGlobalInfo, label: "Global Info" },
          { component: FinanceChart, label: "Finance Status" },
          { component: WeatherTable, label: "Weather" },
        ];
      case SystemRole.ADMIN:
        return [
          { component: FPTGlobalInfo, label: "Global Info" },
          { component: AdminChart, label: "Admin Dashboard" },
          { component: WeatherTable, label: "Weather" },
        ];
      default:
        return [
          { component: FPTGlobalInfo, label: "Global Info" },
          { component: WeatherTable, label: "Weather" },
        ];
    }
  }, [user?.systemRole]);

  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Navigate to previous slide
  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Get slide class based on active slide and current index
  const getSlideClass = (index: number) => {
    if (index === activeSlide) {
      return "carousel-slide active";
    }

    // Calculate the shortest distance between slides considering wrap-around
    const distance = Math.min(
      Math.abs(index - activeSlide),
      Math.abs(index - activeSlide - slides.length),
      Math.abs(index - activeSlide + slides.length),
    );

    if (
      distance === 1 ||
      (activeSlide === 0 && index === slides.length - 1) ||
      (activeSlide === slides.length - 1 && index === 0)
    ) {
      // Check if it should be prev or next
      if (
        (index < activeSlide &&
          !(activeSlide === slides.length - 1 && index === 0)) ||
        (activeSlide === 0 && index === slides.length - 1)
      ) {
        return "carousel-slide prev";
      }
      return "carousel-slide next";
    }

    // All other slides
    return "carousel-slide";
  };

  return (
    <CommonLayout>
      <div className="relative min-h-screen w-full dark:bg-[#121212] bg-gray-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 dark:bg-gradient-to-b from-blue-600/20 to-transparent" />
        <div className="relative container mx-auto px-4 py-8 flex flex-col items-center justify-center bg-circle dark:bg-circle">
          {/* Left Navigation Button */}
          <div className="fixed left-0 top-0 h-full flex items-center z-10">
            <button
              onClick={prevSlide}
              className="group h-full w-24 flex items-center justify-center bg-gradient-to-r from-black/5 to-transparent hover:from-black/10 dark:from-white/5 dark:hover:from-white/10 backdrop-blur-sm transition-all duration-300"
              aria-label="Previous slide"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 dark:bg-black/20 dark:group-hover:bg-black/30 backdrop-blur-sm transition-all duration-300">
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-200 transform group-hover:-translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Dynamic Carousel */}
          <div className="carousel-container w-full relative min-h-[800px]">
            {slides.map((Slide, index) => (
              <div key={index} className={getSlideClass(index)}>
                <Slide.component
                  userId={user?.id}
                  userRole={user?.systemRole}
                  isActive={activeSlide === index}
                />
              </div>
            ))}
          </div>

          {/* Right Navigation Button */}
          <div className="fixed right-0 top-0 h-full flex items-center z-5">
            <button
              onClick={nextSlide}
              className="group h-full w-24 flex items-center justify-center bg-gradient-to-l from-black/5 to-transparent hover:from-black/10 dark:from-white/5 dark:hover:from-white/10 backdrop-blur-sm transition-all duration-300"
              aria-label="Next slide"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 dark:bg-black/20 dark:group-hover:bg-black/30 backdrop-blur-sm transition-all duration-300">
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-200 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </CommonLayout>
  );
}

export default Home;
