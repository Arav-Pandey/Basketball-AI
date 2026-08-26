const MODEL_URL =
  "https://huggingface.co/unileon-robotics/YOLO26-ONNX/resolve/main/yolo26s-pose.onnx";
const RUNTIME_URL =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.all.min.js";
const RUNTIME_BASE_URL =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
export const YOLO_INPUT_WIDTH = 640;
export const YOLO_INPUT_HEIGHT = 480;

export type PosePoint = {
  x: number;
  y: number;
  z: number;
  visibility: number;
};

type Tensor = { data: Float32Array; dims: readonly number[] };
type InferenceSession = {
  inputNames: string[];
  outputNames: string[];
  run: (feeds: Record<string, unknown>) => Promise<Record<string, Tensor>>;
};
type ExecutionProvider = "webgpu + wasm fallback" | "wasm";
type LoadedSession = {
  session: InferenceSession;
  executionProvider: ExecutionProvider;
};
type Ort = {
  Tensor: new (type: string, data: Float32Array, dims: number[]) => unknown;
  InferenceSession: {
    create: (
      url: string,
      options?: Record<string, unknown>,
    ) => Promise<InferenceSession>;
  };
  env: { wasm: { wasmPaths?: string } };
};

export interface YoloInferenceTimings {
  executionProvider: ExecutionProvider;
  sessionLoadMs: number;
  preprocessingMs: number;
  inferenceMs: number;
}

export const COCO_KEYPOINT_NAMES = [
  "Nose",
  "Left eye",
  "Right eye",
  "Left ear",
  "Right ear",
  "Left shoulder",
  "Right shoulder",
  "Left elbow",
  "Right elbow",
  "Left wrist",
  "Right wrist",
  "Left hip",
  "Right hip",
  "Left knee",
  "Right knee",
  "Left ankle",
  "Right ankle",
] as const;

export interface YoloCocoKeypoint {
  name: (typeof COCO_KEYPOINT_NAMES)[number];
  x: number | null;
  y: number | null;
  confidence: number | null;
}

let sessionPromise: Promise<LoadedSession> | null = null;

function loadRuntime(): Promise<Ort> {
  const existing = (window as Window & { ort?: Ort }).ort;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RUNTIME_URL;
    script.async = true;
    script.onload = () => {
      const runtime = (window as Window & { ort?: Ort }).ort;
      if (runtime) {
        resolve(runtime);
      } else {
        reject(new Error("ONNX Runtime did not load."));
      }
    };
    script.onerror = () => reject(new Error("Unable to download ONNX Runtime."));
    document.head.appendChild(script);
  });
}

async function getSession(): Promise<LoadedSession> {
  if (!sessionPromise) {
    sessionPromise = loadRuntime().then(async (ort) => {
      ort.env.wasm.wasmPaths = RUNTIME_BASE_URL;

      try {
        const session = await ort.InferenceSession.create(MODEL_URL, {
          executionProviders: ["webgpu", "wasm"],
        });
        console.info("YOLO26s-Pose is using WebGPU with WASM fallback.");
        return { session, executionProvider: "webgpu + wasm fallback" };
      } catch (webgpuError) {
        console.warn(
          "Unable to initialize the WebGPU provider; falling back to WASM.",
          webgpuError,
        );
      }

      try {
        const session = await ort.InferenceSession.create(MODEL_URL, {
          executionProviders: ["wasm"],
        });
        console.info("YOLO26s-Pose is using WASM.");
        return { session, executionProvider: "wasm" };
      } catch (wasmError) {
        console.error("Unable to initialize the WASM provider.", wasmError);
        throw wasmError;
      }
    });

    sessionPromise = sessionPromise.catch((error: unknown) => {
      sessionPromise = null;
      throw error;
    });
  }

  return sessionPromise;
}

function inputFromFrame(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = YOLO_INPUT_WIDTH;
  canvas.height = YOLO_INPUT_HEIGHT;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Could not prepare a frame for YOLO26s-Pose.");

  context.fillStyle = "#000";
  context.fillRect(0, 0, YOLO_INPUT_WIDTH, YOLO_INPUT_HEIGHT);
  const scale = Math.min(
    YOLO_INPUT_WIDTH / sourceWidth,
    YOLO_INPUT_HEIGHT / sourceHeight,
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  context.drawImage(
    source,
    (YOLO_INPUT_WIDTH - width) / 2,
    (YOLO_INPUT_HEIGHT - height) / 2,
    width,
    height,
  );

  const image = context.getImageData(
    0,
    0,
    YOLO_INPUT_WIDTH,
    YOLO_INPUT_HEIGHT,
  ).data;
  const pixels = YOLO_INPUT_WIDTH * YOLO_INPUT_HEIGHT;
  const data = new Float32Array(3 * pixels);
  for (let index = 0; index < pixels; index += 1) {
    data[index] = image[index * 4] / 255;
    data[pixels + index] = image[index * 4 + 1] / 255;
    data[pixels * 2 + index] = image[index * 4 + 2] / 255;
  }
  return data;
}

async function runYolo(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  onTimings?: (timings: YoloInferenceTimings) => void,
): Promise<Tensor> {
  const sessionLoadStarted = performance.now();
  const ort = await loadRuntime();
  const { session, executionProvider } = await getSession();
  const sessionLoadMs = performance.now() - sessionLoadStarted;

  const preprocessingStarted = performance.now();
  const tensor = new ort.Tensor(
    "float32",
    inputFromFrame(source, sourceWidth, sourceHeight),
    [1, 3, YOLO_INPUT_HEIGHT, YOLO_INPUT_WIDTH],
  );
  const preprocessingMs = performance.now() - preprocessingStarted;

  const inferenceStarted = performance.now();
  const outputs = await session.run({ [session.inputNames[0]]: tensor });
  const inferenceMs = performance.now() - inferenceStarted;
  onTimings?.({
    executionProvider,
    sessionLoadMs,
    preprocessingMs,
    inferenceMs,
  });

  return outputs[session.outputNames[0]];
}

function point(x: number, y: number, confidence: number): PosePoint {
  return {
    x: x / YOLO_INPUT_WIDTH,
    y: y / YOLO_INPUT_HEIGHT,
    z: 0,
    visibility: confidence,
  };
}

function bestPose(output: Tensor): PosePoint[] | null {
  const [batch, channels, candidates] = output.dims;
  if (batch !== 1 || channels < 56 || !candidates) {
    throw new Error("Unexpected YOLO26s-Pose output format.");
  }

  let best = -1;
  let bestConfidence = 0.25;
  for (let candidate = 0; candidate < candidates; candidate += 1) {
    const confidence = output.data[4 * candidates + candidate];
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      best = candidate;
    }
  }
  if (best === -1) return null;

  const keypoint = (index: number) => {
    const offset = 5 + index * 3;
    return point(
      output.data[offset * candidates + best],
      output.data[(offset + 1) * candidates + best],
      output.data[(offset + 2) * candidates + best],
    );
  };

  const landmarks = Array.from({ length: 33 }, () => point(0, 0, 0));
  landmarks[11] = keypoint(5);
  landmarks[12] = keypoint(6);
  landmarks[13] = keypoint(7);
  landmarks[14] = keypoint(8);
  landmarks[15] = keypoint(9);
  landmarks[16] = keypoint(10);
  landmarks[23] = keypoint(11);
  landmarks[24] = keypoint(12);
  landmarks[25] = keypoint(13);
  landmarks[26] = keypoint(14);
  landmarks[27] = keypoint(15);
  landmarks[28] = keypoint(16);
  return landmarks;
}

export async function detectYolo26Pose(
  video: HTMLVideoElement,
  onTimings?: (timings: YoloInferenceTimings) => void,
): Promise<PosePoint[] | null> {
  const output = await runYolo(
    video,
    video.videoWidth,
    video.videoHeight,
    onTimings,
  );
  return bestPose(output);
}

export async function detectYolo26PoseOnCanvas(
  canvas: HTMLCanvasElement,
  onTimings?: (timings: YoloInferenceTimings) => void,
): Promise<YoloCocoKeypoint[] | null> {
  const output = await runYolo(canvas, canvas.width, canvas.height, onTimings);
  const [batch, channels, candidates] = output.dims;
  if (batch !== 1 || channels < 56 || !candidates) {
    throw new Error("Unexpected YOLO26s-Pose output format.");
  }

  let best = -1;
  let bestConfidence = 0.25;
  for (let candidate = 0; candidate < candidates; candidate += 1) {
    const confidence = output.data[4 * candidates + candidate];
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      best = candidate;
    }
  }
  if (best === -1) return null;

  const scale = Math.min(
    YOLO_INPUT_WIDTH / canvas.width,
    YOLO_INPUT_HEIGHT / canvas.height,
  );
  const letterboxedWidth = canvas.width * scale;
  const letterboxedHeight = canvas.height * scale;
  const offsetX = (YOLO_INPUT_WIDTH - letterboxedWidth) / 2;
  const offsetY = (YOLO_INPUT_HEIGHT - letterboxedHeight) / 2;

  return COCO_KEYPOINT_NAMES.map((name, index) => {
    const channel = 5 + index * 3;
    const x = output.data[channel * candidates + best];
    const y = output.data[(channel + 1) * candidates + best];
    const confidence = output.data[(channel + 2) * candidates + best];
    return {
      name,
      x: Number.isFinite(x) ? (x - offsetX) / scale : null,
      y: Number.isFinite(y) ? (y - offsetY) / scale : null,
      confidence: Number.isFinite(confidence) ? confidence : null,
    };
  });
}
