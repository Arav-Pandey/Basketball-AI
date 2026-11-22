import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
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
import Topbar from "./Topbar.tsx";

type AuthStatus =
  | "checking"
  | "authenticated"
  | "guest"
  | "unauthenticated"
  | "unavailable";

function AuthGate({
  children,
  setStatus,
  status,
}: {
  children: ReactNode;
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  status: AuthStatus;
}) {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const isPublicRoute = isAuthPage;

  useEffect(() => {
    let active = true;

    if (sessionStorage.getItem("guestMode") === "true") {
      setStatus("guest");

      return () => {
        active = false;
      };
    }

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
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (status === "authenticated" && isAuthPage) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [videoURL, setVideoURL] = useState<string>("");
  const [analysisId, setAnalysisId] = useState(createAnalysisId);

  const videoURLRef = useRef(videoURL);

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const [status, setStatus] = useState<AuthStatus>("checking");

  const handleCareerNavigation = useCallback(() => {
    if (status !== "authenticated") {
      window.alert("Career is only available to logged-in users, not guests.");
      return;
    }

    navigate("/career");
  }, [navigate, status]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.key]);

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
          <Topbar
            pathname={location.pathname}
            onCareerClick={handleCareerNavigation}
          />
        )}

        <div className="min-h-screen w-full overflow-x-hidden text-white">
          <main
            className={`flex w-full flex-col items-center px-0 text-center ${
              isAuthPage ? "min-h-dvh" : "min-h-screen"
            } ${isAuthPage ? "" : "app-main"}`}
          >
            <AuthGate status={status} setStatus={setStatus}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route
                  path="/home"
                  element={<Home onCareerClick={handleCareerNavigation} />}
                />

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
                      onCareerClick={handleCareerNavigation}
                    />
                  }
                />

                <Route
                  path="/career"
                  element={status === "authenticated" ? <Career /> : null}
                />

                <Route path="/form-live" element={<FormLive />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
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
