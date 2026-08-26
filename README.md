# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Auth0 authentication

The `/login` and `/register` pages use Auth0 Universal Login. The Netlify
functions start the OpenID Connect authorization-code flow with PKCE, verify
the Auth0 ID token, and issue a signed, HttpOnly app session cookie. Auth0
credentials and tokens are never put in frontend code.

### Auth0 dashboard setup

1. Create an Auth0 tenant and an application with type **Regular Web
   Application**.
2. In the application settings, copy the **Domain**, **Client ID**, and
   **Client Secret**.
3. Add the following URLs to the application's corresponding allowlists,
   replacing the example production domain with the deployed Netlify site URL:
   - **Allowed Callback URLs**:
     `https://YOUR-SITE.netlify.app/.netlify/functions/auth0-callback`
   - **Allowed Logout URLs**:
     `https://YOUR-SITE.netlify.app`
   - **Allowed Web Origins**:
     `https://YOUR-SITE.netlify.app`
4. Enable the database or social connections you want to offer in Auth0.
   The registration page opens Universal Login in sign-up mode.

For local development with `netlify dev` (usually at
`http://localhost:8888`), add
`http://localhost:8888/.netlify/functions/auth0-callback` to the Allowed
Callback URLs and `http://localhost:8888` to Allowed Logout URLs and Allowed
Web Origins. Use the local callback URL in your local environment.

### Environment variables

Set these in **Netlify → Site configuration → Environment variables** for
production, and in a Git-ignored root `.env` file for local development:

| Variable | Value |
| --- | --- |
| `AUTH0_DOMAIN` | Auth0 application **Domain**, such as `tenant.us.auth0.com` (no `https://`) |
| `AUTH0_CLIENT_ID` | Auth0 application's **Client ID** |
| `AUTH0_CLIENT_SECRET` | Auth0 application's **Client Secret**; keep this server-side |
| `AUTH0_CALLBACK_URL` | Exact callback URL above, including `/.netlify/functions/auth0-callback` |
| `AUTH_SECRET` | Long random server-side signing key for app session and login state cookies |
| `MONGODB_URI` | Server-side MongoDB connection string |
| `MONGODB_DB` | MongoDB database name; defaults to `BasketballAI` |

Generate `AUTH_SECRET` locally with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Never use a `VITE_` prefix for these values, commit them, or expose the client
secret or MongoDB connection string in browser code. After setting production
variables, redeploy the site. On each successful Auth0 login, the callback
upserts the user's Auth0 ID and available profile information into the
`users` collection, updating `lastLoginAt` while preserving the original
`createdAt`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
