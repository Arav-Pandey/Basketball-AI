import { useEffect } from "react";
import type { HelperProps } from "../../interfaces";

export default function useHelper({
  setVideoURL,
  setVideoFile,
  streamRef,
  videoRef,
  facingMode,
  setRecording,
  chunksRef,
  mediaRecorderRef,
}: HelperProps) {
  const onCameraDenied = () => {
    alert(
      "Camera access is required to record your form. Please allow camera access and refresh the page.",
    );
  };

  // Get the best supported MIME type for video recording
  const getSupportedMimeType = (): string => {
    const candidates = [
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/quicktime",
    ];

    for (const mimeType of candidates) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log("Using MIME type:", mimeType);
        return mimeType;
      }
    }

    // Fallback - let the browser choose
    console.log("No specific MIME type supported, using default");
    return "";
  };

  useEffect(() => {
    async function setupCamera() {
      try {
        // Stop previous stream if exists
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          // broswer API that asks for permission to get live camera feed and then returns that data
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: facingMode,
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream; //Displays the live camera feed
        }

        streamRef.current = stream;

        const mimeType = getSupportedMimeType();
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : {},
        );

        recorder.onerror = (event) => {
          console.error("MediaRecorder error:", event.error);
          alert("Recording error: " + event.error);
          setRecording(false);
        };

        recorder.ondataavailable = (event) => {
          // When the stream is stopped, the media recorder returns chunks
          if (event.data.size > 0) {
            chunksRef.current.push(event.data); // Pushes all the chunks into the array of blobs
          }
        };

        recorder.onstop = () => {
          const mimeType = recorder.mimeType || "video/webm";
          const blob = new Blob(chunksRef.current, { type: mimeType }); // Makes a video that is recorded
          console.log(
            "Recording complete. MIME type:",
            mimeType,
            "Blob size:",
            blob.size,
          );

          if (blob.size === 0) {
            alert("Recording failed - no data captured. Please try again.");
            chunksRef.current = [];
            return;
          }

          // Create a File object for processing (better for iPad/Safari compatibility)
          const file = new File([blob], "video.mp4", { type: mimeType });
          setVideoFile?.(file);

          const url = URL.createObjectURL(blob); // Makes a url link to the video in memory. For example, blob:http://localhost:5713/{random generated link}
          setVideoURL(url);
          chunksRef.current = []; // clears data from the array
        };

        mediaRecorderRef.current = recorder; // makes so that the mediaRecorderRef can access the recorder
      } catch (error) {
        onCameraDenied();
        console.log("Error accessing camera:", error);
      }
    }

    setupCamera();
  }, [facingMode]);

  return null;
}
