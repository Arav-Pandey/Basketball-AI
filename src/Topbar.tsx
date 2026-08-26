import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  ChartNoAxesCombined,
  House,
  Video,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface TopbarProps {
  pathname: string;
}

const mainPages = [
  { label: "Home", to: "/home", icon: House, end: true },
  { label: "Shot Analysis", to: "/form-home", icon: Activity },
  { label: "Live Analysis", to: "/form-live", icon: Video },
  { label: "Career Progress", to: "/career", icon: ChartNoAxesCombined },
  { label: "Instructions", to: "/demo", icon: BookOpen },
];

export default function Topbar({ pathname }: TopbarProps) {
  const [isTopbarVisible, setIsTopbarVisible] = useState(true);
  const previousScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDifference = currentScrollY - previousScrollYRef.current;

      if (currentScrollY <= 40) {
        setIsTopbarVisible(true);
      } else if (scrollDifference > 6) {
        setIsTopbarVisible(false);
      } else if (scrollDifference < -6) {
        setIsTopbarVisible(true);
      }

      previousScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 hidden w-full border-b border-orange-400/20 bg-slate-950/90 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform duration-300 ease-in-out lg:block ${
          isTopbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-3 py-2 sm:px-6">
          <NavLink
            to="/home"
            end
            className="flex shrink-0 items-center gap-2 text-sm font-bold tracking-wide text-white sm:text-base"
          >
            <img
              src="/BasketballAI_Logo.png"
              alt=""
              className="h-9 w-9 object-contain"
              aria-hidden="true"
            />
            <span className="lg:hidden xl:inline">Basketball AI</span>
          </NavLink>

          <nav
            aria-label="Main navigation"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 xl:gap-2"
          >
            {mainPages.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => {
                  const isShotAnalysisActive =
                    to === "/form-home" && pathname === "/form";

                  return `relative inline-flex shrink-0 items-center gap-2 px-3 py-3 text-base font-semibold transition-colors duration-300 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-[calc(100%-1.5rem)] after:-translate-x-1/2 after:scale-x-0 after:rounded-full after:bg-linear-to-r after:from-orange-400 after:to-amber-200 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 sm:px-3.5 sm:text-lg lg:px-2 lg:text-base xl:px-3.5 xl:text-lg ${
                    isActive || isShotAnalysisActive
                      ? "text-orange-200 after:scale-x-100"
                      : "text-slate-300 hover:text-orange-100"
                  }`;
                }}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <nav
        aria-label="Main navigation"
        className="mobile-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-orange-400/20 bg-slate-950/95 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:hidden"
      >
        {mainPages.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) => {
              const isShotAnalysisActive =
                to === "/form-home" && pathname === "/form";

              return `flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold leading-tight transition-colors ${
                isActive || isShotAnalysisActive
                  ? "text-orange-200"
                  : "text-slate-400 hover:text-orange-100"
              }`;
            }}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              {label === "Shot Analysis"
                ? "Shots"
                : label === "Live Analysis"
                  ? "Live"
                  : label === "Career Progress"
                    ? "Career"
                    : label === "Instructions"
                      ? "Guide"
                      : label}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
