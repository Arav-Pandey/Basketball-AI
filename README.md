# 🏀 Basketball AI

<div align="center">

**AI-powered basketball shooting form analysis in your browser**

Record or upload a jump shot. Detect your form. Improve every shot.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)

</div>

<br>

<div align="center">

| 🎥 Capture | 🧠 Analyze | 📊 Improve | 🏆 Track |
|:---:|:---:|:---:|:---:|
| Record or upload | Detect body pose | Receive form scores | Review career progress |

</div>

---

## Overview

Basketball AI uses computer vision to evaluate basketball shooting form directly in the browser. The app detects body landmarks throughout a recorded or uploaded video, then calculates scores for:

- Feet distance
- Elbow alignment
- Knee bend
- Knee distance and flare
- Knee direction
- Similarity to a Stephen Curry reference shot

Users can continue as a guest or sign in to save analysis history. The Career page tracks progress over time and uses MongoDB for signed-in profiles.

> [!IMPORTANT]
> Basketball AI is an educational training tool, not a medical or professional coaching system.

## ✨ What You Can Do

- Record a shot with your camera
- Upload or drag-and-drop an MP4, MOV, WebM, M4V, AVI, or MKV video
- Preview and replace a selected video
- Analyze the shot with an AI-generated pose overlay
- View overall and individual form scores
- Pause and inspect the video at any point
- Learn about each form metric through linked educational pages
- Analyze a live camera feed
- Save, review, delete, or clear career analysis history

## 🔄 How It Works

1. **Select or record a shot** in the Shot Workspace.
2. **Choose shooting hand**: left or right.
3. **Detect the pose**:
   - Recorded videos use YOLO26s-Pose with ONNX Runtime Web.
   - Live analysis uses MediaPipe Pose Landmarker.
4. **Measure the form** using distances and angles from the detected joints.
5. **Calculate scores** for the different shooting mechanics.
6. **Compare** elbow flare and knee angle with a Stephen Curry reference shot.
7. **Display feedback** and save completed analyses for signed-in users.

The analysis uses median and averaged frame measurements to reduce the impact of an incorrectly detected landmark.

## 🗺️ Main Pages

| Page | Route | Description |
| --- | --- | --- |
| Sign in | `/` | Auth0 sign-in or guest access |
| Home | `/home` | App introduction and navigation |
| Shot Workspace | `/form-home` | Record or upload a shot |
| Shot Analysis | `/form` | Pose overlay and detailed feedback |
| Live Analysis | `/form-live` | Real-time camera-based form analysis |
| Career | `/career` | Saved progress and session history |
| Instructions | `/demo` | App overview and metric sources |
| Metric Guides | `/sections/:id` | Details about one form metric |

## 📊 Form Metrics

| Metric | What is checked |
| --- | --- |
| Feet Distance | Foot spacing and stance balance |
| Elbow Alignment | Whether the shooting elbow stays near the body |
| Knee Bend | Hip-knee-ankle angle |
| Knee Distance | Knee spacing and alignment |
| Knee Flare | Whether the knees move away from a stable position |
| Knee Direction | Whether the knees face the target |
| Curry Comparison | Elbow flare and knee angle similarity |

<br>

<div align="center">

| Excellent | Above Average | Mediocre | Poor |
|:---:|:---:|:---:|:---:|
| 🟢 **85-100** | 🟡 **65-84** | 🟠 **41-64** | 🔴 **0-40** |

</div>

<br>

## 🛠️ Technology

- React 19 and TypeScript
- Vite
- React Router
- Tailwind CSS
- YOLO26s-Pose and ONNX Runtime Web
- MediaPipe Pose Landmarker
- Netlify Functions
- Auth0
- MongoDB
- Browser Camera and MediaRecorder APIs

## 📁 Project Structure

```text
src/
  App.tsx                 Routing and authentication
  Home.tsx                Main landing page
  Authentication/         Auth0 login and registration UI
  Career/                 Career history and progress charts
  Citations/              Educational metric guides
  Form/
    Backend/              Calculations, pose processing, and scoring
    Frontend/             Upload, recording, video, and feedback UI
  FormLive/               Real-time MediaPipe analysis
  utils/                  Shared hooks and local storage
  yolo26Pose.ts           YOLO model loading and inference

netlify/functions/        Auth, career storage, and pose proxy functions
public/                   Public images and static assets
```

## 🚀 Getting Started

### ✅ Requirements

- Node.js 20 or newer
- npm
- Modern browser with camera support
- Netlify CLI for authentication and career features

### 📦 Install

```powershell
git clone https://github.com/Arav-Pandey/HoopCorrector.git
cd HoopCorrector
npm install
```

## 🔐 Environment Setup

Create a root `.env` file for Netlify development:

```dotenv
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_CALLBACK_URL=http://localhost:8888/.netlify/functions/auth0-callback
AUTH_SECRET=generate-a-long-random-secret
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=BasketballAI
```

Generate a session secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Optional hosted-YOLO variables:

```dotenv
YOLO26M_POSE_ENDPOINT=https://your-pose-service.example/analyze
YOLO26M_POSE_API_KEY=your-server-only-api-key
```

> [!CAUTION]
> Never commit `.env` or add these secrets to `VITE_` variables. The default recorded-video analysis loads YOLO directly in the browser.

## ▶️ Run Locally

For the complete app, including authentication and career history:

```powershell
npx netlify dev
```

Open <http://localhost:8888>.

For frontend-only development:

```powershell
npm run dev
```

Vite normally serves this on <http://localhost:5173>. Auth and career routes require Netlify Dev.

## 🏀 Using the App

1. Sign in or continue as a guest.
2. Open **Get Started**.
3. Record or upload a jump-shot video.
4. Preview the video and select **Use This Video**.
5. Choose the shooting hand.
6. Wait for pose analysis to finish.
7. Review the scores and feedback.
8. Use the linked metric guides to learn how to improve.

### 🎯 For the best results

- Use a full-body, front-facing view
- Keep the shoulders, elbows, wrists, hips, knees, and ankles visible
- Use bright, even lighting
- Keep the camera stable
- Use an uninterrupted setup-to-release recording

## 🔑 Auth0 Setup

Create a regular web application in Auth0, then register:

- Local callback: `http://localhost:8888/.netlify/functions/auth0-callback`
- Production callback: `https://YOUR-SITE.netlify.app/.netlify/functions/auth0-callback`
- Local web origin and logout URL: `http://localhost:8888`
- Production web origin and logout URL: `https://YOUR-SITE.netlify.app`

Set the Auth0 and session variables locally and in Netlify's production environment settings.

## 💾 MongoDB and Career History

Career history is available only to signed-in users. Netlify Functions verify the app session cookie, then store career sessions in MongoDB.

The browser also caches profile history in `localStorage`. Guest analysis is never saved to a career profile.

For MongoDB Atlas:

- Configure database and network access
- Use a least-privilege database user
- Store `MONGODB_URI` only on the server
- Redeploy after environment changes

## ☁️ Deploy to Netlify

The repository is configured with:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- SPA fallback for React Router

Deploy:

```powershell
npx netlify deploy --build
npx netlify deploy --build --prod
```

Add all required environment variables in Netlify, then update the Auth0 URLs to match the production domain.

## 🧪 Build and Quality Checks

```powershell
npm run lint
npm run build
npm run preview
```

There is no automated test runner configured in `package.json`.

## 🩺 Troubleshooting

| Problem | Check |
| --- | --- |
| Camera unavailable | Allow browser camera access and use localhost or HTTPS |
| Keypoints not visible | Improve lighting and show the full body directly in frame |
| Auth fails locally | Use `npx netlify dev` and match Auth0 callback URLs exactly |
| Career history fails | Verify `AUTH_SECRET`, MongoDB credentials, and network access |
| Pose analysis fails | Check network access to Hugging Face/jsDelivr and refresh the page |
| Video codec unsupported | Try MP4/H.264 or WebM |

## 🔒 Privacy

- Videos are processed locally for the default recorded-video analysis.
- Auth0 manages account authentication.
- MongoDB stores signed-in career history.
- Auth secrets and database credentials stay on the server.
- Guest mode does not save career data.
- Never commit `.env`, API keys, passwords, or database credentials.

## ⚠️ Limitations

Pose measurements can be affected by camera angle, clothing, lighting, motion blur, and video quality. Professional comparisons are educational estimates, not validated medical or coaching diagnoses.

All third-party coaching media remains the property of its respective creators and publishers.
