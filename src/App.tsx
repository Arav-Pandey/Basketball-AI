import { useState } from "react";
import { House, PlayCircle } from "lucide-react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Form from "./Form/Backend/Form.tsx";
import Home from "./Home.tsx";
import FormHome from "./Form/Frontend/FormHome.tsx";
import BackgroundLayout from "./BackgroundLayout.tsx";
import FormLive from "./FormLive/FormLive.tsx";
import Playmaking from "./PlayMaking/Playmaking.tsx";
import Demo from "./Demo.tsx";
import SectionPageRoute from "./Citations/SectionPageRoute.tsx";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const [videoURL, setVideoURL] = useState<string>("");

  return (
    <BackgroundLayout>
      <div>
        <div className="min-h-screen w-full overflow-x-hidden text-white">
          <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-2 text-center sm:px-2 lg:px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/form-home"
                element={
                  <FormHome setVideoURL={setVideoURL} videoURL={videoURL} />
                }
              />
              <Route
                path="/form"
                element={<Form videoURL={videoURL} setVideoURL={setVideoURL} />}
              />
              <Route path="/form-live" element={<FormLive />} />
              <Route path="/playmaking" element={<Playmaking />} />
              <Route path="/sections/:id" element={<SectionPageRoute />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
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
