import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  BookOpen,
  ChartNoAxesCombined,
  House,
  Video,
} from "lucide-react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Form from "./Form/Backend/Form.tsx";
import Home from "./Home.tsx";
import FormHome from "./Form/Frontend/FormHome.tsx";
import BackgroundLayout from "./BackgroundLayout.tsx";
import FormLive from "./FormLive/FormLive.tsx";
import Login from "./Authentication/Login.tsx";
import Register from "./Authentication/Register.tsx";
import Demo from "./Demo.tsx";
import SectionPageRoute from "./Citations/SectionPageRoute.tsx";
import Career from "./Career/Career.tsx";
import { createAnalysisId } from "./Career/careerSessions";

const ModelComparison = lazy(
  () => import("./ModelComparison/ModelComparison.tsx"),
);

const mainPages = [
  { label: "Home", to: "/", icon: House, end: true },
  { label: "Shot Analysis", to: "/form-home", icon: Activity },
  { label: "Live Analysis", to: "/form-live", icon: Video },
  { label: "Career Progress", to: "/career", icon: ChartNoAxesCombined },
  { label: "Instructions", to: "/demo", icon: BookOpen },
];

function AuthGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isPublicRoute = location.pathname === "/" || isAuthPage;
  const [status, setStatus] = useState<
    "checking" | "authenticated" | "unauthenticated" | "unavailable"
  >("checking");

  useEffect(() => {
    let active = true;

    fetch("/.netlify/functions/auth", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((response) => {
        if (!active) return;
        if (response.ok) {
          setStatus("authenticated");
        } else if (response.status === 401) {
          setStatus("unauthenticated");
        } else {
          setStatus("unavailable");
        }
      })
      .catch(() => {
        if (active) setStatus("unavailable");
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") return isPublicRoute ? children : null;

  if (status === "unavailable" && !isPublicRoute) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === "unauthenticated" && !isPublicRoute) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === "authenticated" && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const [videoURL, setVideoURL] = useState<string>("");
  const [analysisId, setAnalysisId] = useState(createAnalysisId);
  const [isTopbarVisible, setIsTopbarVisible] = useState(true);
  const videoURLRef = useRef(videoURL);
  const previousScrollYRef = useRef(0);
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  useLayoutEffect(() => {
    previousScrollYRef.current = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.key]);

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

  const updateVideoURL = useCallback<
    React.Dispatch<React.SetStateAction<string>>
  >((nextValue) => {
    const nextURL =
      typeof nextValue === "function"
        ? nextValue(videoURLRef.current)
        : nextValue;
    if (nextURL !== videoURLRef.current) {
      videoURLRef.current = nextURL;
      setAnalysisId(createAnalysisId());
    }
    setVideoURL(nextURL);
  }, []);

  return (
    <BackgroundLayout>
      <div>
        {!isAuthPage && (
          <header
            className={`sticky top-0 z-50 w-full border-b border-orange-400/20 bg-slate-950/90 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform duration-300 ease-in-out ${
              isTopbarVisible ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-3 py-2 sm:px-6">
              <NavLink
                to="/"
                end
                className="flex shrink-0 items-center gap-2 text-sm font-bold tracking-wide text-white sm:text-base"
              >
                <img
                  src="/BasketballAI_Logo.png"
                  alt=""
                  className="h-9 w-9 object-contain"
                  aria-hidden="true"
                />
                <span>Basketball AI</span>
              </NavLink>

              <nav
                aria-label="Main navigation"
                className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto ml-20"
              >
                {mainPages.map(({ label, to, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => {
                      const isShotAnalysisActive =
                        to === "/form-home" && location.pathname === "/form";
                      return `relative inline-flex shrink-0 items-center gap-2 px-3 py-3 text-base font-semibold transition-colors duration-300 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-[calc(100%-1.5rem)] after:-translate-x-1/2 after:scale-x-0 after:rounded-full after:bg-linear-to-r after:from-orange-400 after:to-amber-200 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 sm:px-3.5 sm:text-lg ${
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
        )}
        <div className="min-h-screen w-full overflow-x-hidden text-white">
          <main className="flex min-h-screen w-full flex-col items-center px-0 text-center">
            <AuthGate>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/form-home"
                  element={
                    <FormHome
                      setVideoURL={updateVideoURL}
                      videoURL={videoURL}
                    />
                  }
                />
                <Route
                  path="/form"
                  element={
                    <Form
                      videoURL={videoURL}
                      setVideoURL={updateVideoURL}
                      analysisId={analysisId}
                    />
                  }
                />
                <Route path="/career" element={<Career />} />
                <Route
                  path="/model-comparison"
                  element={
                    <Suspense
                      fallback={
                        <p role="status" className="mt-24 text-orange-200">
                          Loading the model comparison page…
                        </p>
                      }
                    >
                      <ModelComparison />
                    </Suspense>
                  }
                />
                <Route path="/form-live" element={<FormLive />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/sections/:id" element={<SectionPageRoute />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthGate>
          </main>
        </div>
      </div>
    </BackgroundLayout>
  );
}
