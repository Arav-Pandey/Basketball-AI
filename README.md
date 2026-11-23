# Basketball AI

Basketball AI is a browser-based basketball shooting form analyzer built with React, TypeScript, and Vite. It uses pose-estimation computer vision to examine a recorded or uploaded jump-shot video, highlight the player's body landmarks, calculate shooting mechanics, and show targeted coaching feedback.

The app compares the user's form with a reference shot by Stephen Curry and presents individual scores for foot placement, elbow alignment, knee bend, knee spacing/alignment, and overall shot similarity. Signed-in users can save and review completed analyses in a Career History page, while guest users can use the analysis tools without an account.

> This project was created for the Congressional App Challenge. It is an educational training aid, not a medical or professional coaching system.

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Application pages](#application-pages)
- [Form metrics](#form-metrics)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment configuration](#environment-configuration)
- [Running the project](#running-the-project)
- [Using the app](#using-the-app)
- [Auth0 and MongoDB setup](#auth0-and-mongodb-setup)
- [Deploying to Netlify](#deploying-to-netlify)
- [Build and quality checks](#build-and-quality-checks)
- [Privacy and data storage](#privacy-and-data-storage)
- [Troubleshooting](#troubleshooting)
- [Known considerations](#known-considerations)
- [Sources and citations](#sources-and-citations)

## Features

### Shot capture and upload

- Record a shot directly from a connected camera.
- Switch between front and rear-facing cameras when the browser and device support it.
- Upload a video through a file picker or drag-and-drop area.
- Supported file formats include MP4, MOV, WebM, M4V, AVI, and MKV, subject to browser codec support.
- Preview the chosen video and remove or replace it before analysis.
- Use the included example shot without recording or uploading a file.

### Pose-based shot analysis

- Preprocesses the video frame by frame at 10 FPS.
- Runs the YOLO26s-Pose ONNX model in the browser with ONNX Runtime Web and WebAssembly.
- Draws a pose skeleton and selected body landmarks over the video.
- Evaluates the shooting motion throughout the clip instead of relying on only one live camera frame.
- Uses median and averaged measurements to reduce the impact of isolated pose-estimation errors.
- Produces per-metric scores and human-readable feedback.

### Live form view

- The `/form-live` page opens a live camera feed and runs MediaPipe Pose Landmarker in the browser.
- It overlays pose connections and selected landmarks on the camera canvas.
- It can report ankle, knee, elbow flare, and knee-bend feedback from live measurements.
- Camera access is only requested after the user selects the shooting hand.

### Account and career tracking

- Auth0 Universal Login is used for account sign-in and registration.
- App session state is stored in a signed, HttpOnly, same-site cookie.
- Completed analyses can be persisted to MongoDB for authenticated users.
- The Career page shows the latest form score, the previous score, the score change, and the total number of saved sessions.
- Individual career sessions can be deleted, or all history can be cleared.
- Career history is also cached in browser `localStorage` for a faster local view and offline fallback.
- Guest mode disables career saving and keeps the core analysis experience accessible.

### Educational information

- The Instructions/Demo page explains the analysis workflow.
- Dedicated citation pages explain each measured form component.
- External coaching articles and videos are linked for additional learning.

## How it works

### 1. Capture or select a shot

The user starts on the sign-in or guest landing page, then opens the Shot Workspace:

1. Record a shot with the browser camera.
2. Upload or drag-and-drop a video.
3. Preview the recording.
4. Choose **Use This Video**.
5. Select whether the shooter is right- or left-handed.

The app needs a full-body, front-facing view where the shoulders, elbows, wrists, hips, knees, and ankles are visible. Good lighting and minimal camera movement improve pose-estimation quality.

### 2. Detect the shooting pose

For recorded analysis, the app:

1. Loads the YOLO26s-Pose ONNX model from Hugging Face.
2. Loads ONNX Runtime Web from jsDelivr.
3. Seeks through the selected video.
4. Preprocesses each sampled frame as a padded 640 x 480 RGB tensor.
5. Runs pose inference using the browser's WebAssembly execution provider.
6. Extracts the 17 COCO pose keypoints.
7. Normalizes keypoint coordinates and caches the results by video frame.

The YOLO model returns person detections and keypoints for the shoulder, elbow, wrist, hip, knee, and ankle regions. The app chooses the best pose in each frame and discards weak or invalid detections.

The live `/form-live` flow is separate: it uses MediaPipe Pose Landmarker directly through the camera stream instead of preprocessing a saved video.

### 3. Calculate shooting mechanics

The analysis code calculates 2D geometric measurements from the pose keypoints. Aspect ratio is used to prevent portrait or landscape dimensions from distorting distance calculations.

Examples include:

- Distances between the feet, knees, hips, and shoulders.
- Elbow and shoulder alignment.
- Knee angles using the hip-knee-ankle triangle.
- High-point frame selection from wrist positions.
- Lowest-knee-angle sampling for bend measurements.
- Knee direction and flare measurements.

The app combines multiple frames instead of trusting a single frame. Median and averaged values make the feedback more stable when one keypoint is misdetected.

### 4. Score and explain the form

Each available measurement is converted to a 0-100 score. The UI labels scores as:

- 85-100: Excellent
- 65-84: Above Average
- 41-64: Mediocre
- 0-40: Poor

The feedback table also links to an educational page for that metric. Measurements that are not reliable enough are not shown instead of presenting misleading feedback.

### 5. Compare with Stephen Curry

The app has a reference dataset derived from the included Stephen Curry shot video. It compares normalized elbow flare and knee angle measurements from the user's selected high-point frames.

The Curry similarity calculation is based on:

- Elbow flare difference, weighted at 65%.
- Knee-angle difference, weighted at 35%.

The resulting similarity is displayed as a percentage. It is a form similarity estimate, not a guarantee that the player shoots like or will perform like a professional athlete.

### 6. Save career history

After a completed recorded analysis:

1. The frontend sends the analysis ID and available scores to a Netlify Function.
2. The server verifies the signed-in session cookie.
3. The function creates a career session and calculates the overall form score.
4. MongoDB receives the new session under the user's Auth0-derived profile.
5. The browser caches the returned session for the Career page.

Guest analyses are not saved.

## Application pages

| Route | Purpose |
| --- | --- |
| `/` | Sign-in and guest entry page |
| `/login` | Redirects to the main sign-in page |
| `/register` | Opens Auth0 Universal Login in sign-up mode |
| `/home` | Project introduction and navigation |
| `/form-home` | Camera, upload, drag-and-drop, and sample-video workspace |
| `/form` | Recorded-video pose analysis and feedback |
| `/form-live` | MediaPipe camera-based live analysis |
| `/career` | Signed-in career history, trends, and session management |
| `/demo` | Instructions and source overview |
| `/sections/:id` | Educational page for an individual form metric |

Unknown routes redirect to `/`.

## Form metrics

| Metric | What is measured |
| --- | --- |
| Feet distance | Spacing between the feet compared with shoulder and stance measurements |
| Elbow alignment / flare | Whether the shooting elbow stays under the ball and near the body |
| Knee bend | The hip-knee-ankle angle while the player prepares and releases the shot |
| Knee distance | The spacing and alignment of the knees throughout the motion |
| Knee flare | Whether the knees remain aligned instead of flaring excessively |
| Knee direction | Whether the knees point toward the target rather than inward or sideways |
| Curry similarity | Normalized similarity of elbow flare and knee angle to the Curry baseline |

Metric calculations and feedback are implemented primarily in:

- `src/Form/Backend/calculations.ts`
- `src/Form/Backend/feedbackFunctions.ts`
- `src/Form/Backend/updatePoseMeasurements.ts`
- `src/Form/Backend/scoringFunctions.ts`
- `src/Form/Backend/finalizePoseAnalysis.ts`

## Technology stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Lucide React and React Icons
- TanStack React Query

### Pose analysis

- YOLO26s-Pose ONNX model
- ONNX Runtime Web
- MediaPipe Pose Landmarker
- WebAssembly
- Canvas 2D API

### Backend and services

- Netlify Functions
- Auth0 OpenID Connect and PKCE
- MongoDB
- bcrypt utilities
- JOSE JWT and signed session cookies

### Media and utilities

- Browser MediaRecorder API
- Browser camera and video APIs
- FFmpeg and Fluent FFmpeg dependencies
- Axios

## Project structure

```text
src/
  App.tsx                    App routing and authentication gate
  Home.tsx                   Signed-in/guest home page
  Authentication/            Auth0 login/register UI
  Career/                    Career history, caching, charts, and summaries
  Citations/                 Educational metrics and source pages
  Form/
    Backend/                 Measurements, scoring, YOLO integration, feedback
    Frontend/                Shot workspace, video player, overlays, controls
  FormLive/                  MediaPipe live-camera analysis
  utils/                     Shared pose and browser storage hooks
  yolo26Pose.ts              YOLO model loading and inference
  assets/                    Images and sample video
public/                      Public images and static assets
netlify/functions/           Server-side auth, career, and pose proxy handlers
  utils/auth0.ts             Auth0 server helpers
  utils/mongodb.ts           MongoDB connection helper
  utils/session.ts           Signed app-session verification
```

## Requirements

- Node.js 20 or newer is recommended.
- npm, which is included with Node.js.
- A modern browser:
  - Camera upload/recording: Chrome, Edge, or another browser with MediaRecorder and camera support.
  - Secure `localhost` or HTTPS for browser camera access.
- Netlify CLI for the full application, especially Auth0 and MongoDB routes.
- Optional external services:
  - An Auth0 tenant and application.
  - A MongoDB Atlas or other MongoDB deployment.
  - A YOLO26m-Pose-compatible inference endpoint if the optional proxy is used.

## Local setup

### 1. Clone and enter the repository

```powershell
git clone https://github.com/Arav-Pandey/HoopCorrector.git
cd HoopCorrector
```

If the repository is already present, open a PowerShell terminal in the project root.

### 2. Install dependencies

```powershell
npm install
```

The `node_modules` directory is ignored and should not be committed.

### 3. Create local environment configuration

Create a root `.env` file. The repository already ignores `.env`, but never commit secrets to source control.

```dotenv
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_CALLBACK_URL=http://localhost:8888/.netlify/functions/auth0-callback
AUTH_SECRET=replace-with-a-long-random-secret
MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/
MONGODB_DB=BasketballAI

# Optional proxy for a hosted YOLO26m-Pose endpoint
YOLO26M_POSE_ENDPOINT=https://your-pose-service.example/analyze
YOLO26M_POSE_API_KEY=your-server-only-api-key
```

Generate a strong session-signing secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 4. Install the Netlify CLI

```powershell
npm install --save-dev netlify-cli
```

Or run Netlify CLI through `npx` without adding it to the project.

## Environment configuration

| Variable | Required | Where used |
| --- | --- | --- |
| `AUTH0_DOMAIN` | Authenticated accounts | Auth0 login and callback |
| `AUTH0_CLIENT_ID` | Authenticated accounts | Auth0 authorization and PKCE |
| `AUTH0_CLIENT_SECRET` | Authenticated accounts | Server-side Auth0 code exchange |
| `AUTH0_CALLBACK_URL` | Authenticated accounts | Exact callback URL registered in Auth0 |
| `AUTH_SECRET` | Authenticated accounts and career history | Signs app login-state and session cookies |
| `MONGODB_URI` | Career history | MongoDB server connection |
| `MONGODB_DB` | Optional; defaults to `BasketballAI` | MongoDB database name |
| `YOLO26M_POSE_ENDPOINT` | Optional proxy | Hosted YOLO pose inference endpoint |
| `YOLO26M_POSE_API_KEY` | Optional proxy | Bearer key sent only from the Netlify Function |

Do not add `VITE_` to secret environment variable names. Variables beginning with `VITE_` can be exposed to browser code.

The main recorded-video implementation downloads its YOLO model directly in the browser. The `yolo26m-pose` Netlify function is a proxy for an optional hosted inference service and is not required by the browser's default YOLO loader.

## Running the project

### Full application with Netlify Functions

Use this mode for login, career history, and all routes:

```powershell
npx netlify dev
```

Open `http://localhost:8888`.

Netlify Dev serves both:

- The Vite frontend
- Files in `netlify/functions`
- The SPA fallback configured in `netlify.toml`

### Frontend-only development

```powershell
npm run dev
```

Vite prints a local address, usually `http://localhost:5173`.

Use this mode for UI and local pose-analysis work only. Auth, career, and server-backed routes will not work correctly without Netlify Functions.

### Preview a production build locally

```powershell
npm run build
npm run preview
```

The preview command serves the built `dist` directory, not the Netlify Functions.

## Using the app

1. Open the app and sign in, register, or continue as a guest.
2. Open **Get Started**.
3. Record or upload a shot.
4. Keep the full body in frame and the camera stable.
5. Use a clear, front-facing view.
6. Select **Use This Video**.
7. Choose left- or right-handed shooting.
8. Wait for pose preprocessing and analysis to finish.
9. Review the overall and per-metric scores.
10. Pause or seek through the video to inspect the pose overlay.
11. Open **Learn More** for educational metric explanations.
12. Retake the shot or return to the Career page if signed in.

For the best pose quality:

- Use a side or full-body view with every relevant landmark visible.
- Use bright, even lighting.
- Avoid heavy motion blur or fast digital zoom.
- Keep the player in the center of the frame.
- Avoid loose clothing that hides the knees or elbows.
- Record a complete setup and shooting motion, not only the release frame.

## Auth0 and MongoDB setup

### Auth0

1. Create an Auth0 tenant.
2. Create a **Regular Web Application**.
3. Copy the domain, client ID, and client secret.
4. Register callback URLs:
   - Local: `http://localhost:8888/.netlify/functions/auth0-callback`
   - Production: `https://YOUR-SITE.netlify.app/.netlify/functions/auth0-callback`
5. Register logout and web origins:
   - Local: `http://localhost:8888`
   - Production: `https://YOUR-SITE.netlify.app`
6. Enable at least one database or social connection.
7. Set the environment variables listed above.

The `/register` page starts the Auth0 login flow with sign-up mode enabled. The server exchanges the authorization code, validates the ID token, creates a signed app cookie, and upserts the user in MongoDB on successful login.

### MongoDB

MongoDB is accessed only by Netlify Functions. The browser never receives the MongoDB connection string.

The user document stores a `careerSessions` array in the configured database. Netlify Dev may access your local network and does not guarantee that the cluster or Atlas network rules permit traffic from deployed Netlify infrastructure.

For MongoDB Atlas:

- Allow outbound traffic from the deployed environment as required by your Atlas network-access configuration.
- Use a least-privilege database user.
- Store `MONGODB_URI` as a server-side Netlify environment variable.
- Use the 7-second server-selection timeout for the serverless environment unless your deployment requirements justify a change.

## Deploying to Netlify

The repository includes `netlify.toml` with:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- SPA redirect: sends unknown frontend routes to `index.html`

Deploy by connecting the GitHub repository to Netlify or by using:

```powershell
npx netlify deploy --build
```

For a production deployment:

```powershell
npx netlify deploy --build --prod
```

Before deploying, configure all required environment variables in the Netlify site settings:

- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_CALLBACK_URL`
- `AUTH_SECRET`
- `MONGODB_URI`
- `MONGODB_DB`, if not using `BasketballAI`
- Optional YOLO proxy variables

Redeploy after changing environment variables. Also update Auth0 callback, logout, and web-origin URLs to match the deployed Netlify domain.

## Build and quality checks

Build the production bundle:

```powershell
npm run build
```

Run the configured ESLint check:

```powershell
npm run lint
```

For a normal validation pass:

```powershell
npm run lint
npm run build
```

There is no automated test runner configured in `package.json` at this time. Browser tests should cover at minimum:

- Sign-in, guest mode, and protected-route behavior.
- Video upload, drag-and-drop, and sample-video loading.
- Camera start, stop, and camera switching.
- Dominant-hand selection.
- Recorded-video pose loading and finalization.
- Live-camera permission success and failure.
- Career save, load, delete, and clear actions.
- Mobile and desktop layouts.

## Privacy and data storage

- Uploaded and recorded videos are loaded through browser object URLs for local analysis.
- The browser pose model is loaded from Hugging Face and jsDelivr.
- The YOLO pose model does not receive the user's video through MongoDB or the Auth0 flow in the default browser implementation.
- Auth0 handles account authentication.
- MongoDB stores the user's career sessions and profile cache data.
- Career sessions are also copied to browser `localStorage` by a profile-specific key.
- Guest mode does not save completed recorded analyses to a career profile.
- `AUTH0_CLIENT_SECRET`, `AUTH_SECRET`, MongoDB credentials, and any YOLO API key must remain server-side.

Before public deployment, audit the repository history and hosting environment for accidentally committed credentials. If any `.env` secret was committed or shared, rotate that secret in the original service and update Netlify.

## Troubleshooting

### Camera does not open

- Allow camera and, when applicable, microphone permissions.
- Use `localhost` or HTTPS.
- Confirm another app is not exclusively using the camera.
- Try a desktop browser or switch camera devices.
- On mobile, avoid unsupported embedded browser contexts.

### The page reports that keypoints are not visible

- Move farther enough from the camera to show the full body.
- Face the camera more directly.
- Improve lighting.
- Remove obstructions around the shoulders, hips, knees, and ankles.
- Use an uninterrupted setup-to-release video.

### Auth fails locally

- Confirm `AUTH0_CALLBACK_URL` exactly matches the callback URL in Auth0.
- Start the app with `npx netlify dev`, not only `npm run dev`.
- Confirm Auth0's callback, web origin, and logout URL allow `http://localhost:8888`.
- Restart Netlify Dev after changing `.env`.

### Career history cannot be saved

- Confirm the user is signed in and not in guest mode.
- Check `AUTH_SECRET`, `MONGODB_URI`, and `MONGODB_DB`.
- Confirm MongoDB network access and credentials.
- Inspect Netlify Function logs.
- If MongoDB unreachable errors occur only in production, verify the production environment variables and deployed Atlas network rules.

### YOLO pose analysis fails

- Check browser network access to Hugging Face and jsDelivr.
- Wait for the initial model download and browser WebAssembly initialization.
- Refresh the page if the model session failed after a network interruption.
- Try a lower-resolution, shorter, and MP4/H.264-encoded video.
- Confirm the browser supports WebAssembly and canvas video frame access.

### MongoDB returns `MongoServerSelectionError`

- Verify the production `MONGODB_URI`.
- Verify the Atlas network access configuration.
- Confirm the database user credentials.
- Check DNS and outbound-network availability.
- Review `auth0-callback` or `career-sessions` function logs for the failing phase.

## Known considerations

- 2D pose landmarks can be affected by camera angle, occlusion, and video quality.
- Similarity to a professional athlete is a reference estimate, not a validated clinical or coaching diagnosis.
- Browser codecs and `MediaRecorder` support vary by operating system and browser.
- The live mode uses MediaPipe while recorded analysis uses YOLO26s-Pose.
- The YOLO model initially downloads assets, so the first analysis may be slower.
- The app may need more memory or processing time for long, high-resolution videos.
- An expensive or unavailable pose model can make analysis fail even if the rest of the UI works.
- Career cache synchronization is eventually refreshed from MongoDB after the Career page loads.

## Sources and citations

The app includes a `/demo` page and dedicated source pages under `/sections/:id`. Those sections link to coaching references and videos for:

- Feet direction
- Elbow flare
- Knee bend
- Feet distance
- Knee distance
- Knee flare
- Knee direction
- Comparison to Stephen Curry

All third-party media and source ownership remains with its respective creators and publishers.
