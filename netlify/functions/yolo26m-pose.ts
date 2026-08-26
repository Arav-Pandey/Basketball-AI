import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const endpoint = process.env.YOLO26M_POSE_ENDPOINT;
  if (!endpoint) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        error:
          "YOLO26m-Pose is not configured. Set YOLO26M_POSE_ENDPOINT in Netlify to your inference service.",
      }),
    };
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.YOLO26M_POSE_API_KEY
          ? { Authorization: `Bearer ${process.env.YOLO26M_POSE_API_KEY}` }
          : {}),
      },
      body: event.body ?? "{}",
    });
    const body = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
      body,
    };
  } catch (error) {
    console.error("YOLO26m-Pose request failed", error);
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Unable to reach the YOLO26m-Pose inference service.",
      }),
    };
  }
};
