import { useEffect, useState, type ReactNode } from "react";
import { House, PlayCircle } from "lucide-react";
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
import type { PoseModel } from "./Form/Backend/detect";

function AuthGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isPublicRoute =
    location.pathname === "/" || isAuthPage;
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
  const navigate = useNavigate();
  const [videoURL, setVideoURL] = useState<string>("");
  const [poseModel, setPoseModel] = useState<PoseModel>("mediapipe");

  return (
    <BackgroundLayout>
      <div>
        <div className="min-h-screen w-full overflow-x-hidden text-white">
          <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-2 text-center sm:px-2 lg:px-4">
            <AuthGate>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/form-home"
                  element={
                    <FormHome
                      setVideoURL={setVideoURL}
                      videoURL={videoURL}
                      model={poseModel}
                      setModel={setPoseModel}
                    />
                  }
                />
                <Route
                  path="/form"
                  element={
                    <Form
                      videoURL={videoURL}
                      setVideoURL={setVideoURL}
                      model={poseModel}
                    />
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

      <a
        href={"/demo"}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-3 top-3 z-40 inline-flex items-center gap-1 rounded-2xl border border-orange-400/40 bg-linear-to-r from-orange-500 to-amber-400 px-3.5 py-2 text-lg text-slate-950 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 sm:right-4 sm:top-4 sm:px-4 font-semibold"
      >
        <PlayCircle size={20} />
        Instructions Page
      </a>
      <button
        onClick={() => navigate("/")}
        className="cursor-pointer fixed left-3 top-3 z-40 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-zinc-900/70 px-3.5 py-2 text-lg font-semibold text-zinc-100 shadow-md shadow-black/20 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-zinc-800/80 hover:text-white active:scale-95 sm:left-4 sm:top-4 sm:px-4"
      >
        <House className="h-4 w-4" />
        Home
      </button>
    </BackgroundLayout>
  );
}
