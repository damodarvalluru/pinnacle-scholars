# CareerAI live deployment

The CareerAI API server also serves the `career-ai` front end, so the simplest
production setup is a **single origin** for both the page and its `/api` feeds.

## Recommended (single origin)

1. Deploy `career-ai/server` to any Node host (Render, Railway, VPS, etc.).
   `npm install` then `npm start` is enough; `PORT` is respected.
2. Open the deployment at its root URL, for example `https://career.example.com/`.
   `express.static` serves `career-ai/index.html`, and the same host serves
   `/api/jobs`, `/api/internships`, `/api/courses` and `/api/deadlines`.
3. No client configuration is needed. `js/api.js` detects that the API is on the
   same origin and uses relative `/api/...` calls automatically.

## If the front end is hosted separately (e.g. GitHub Pages)

Set the API base in `career-ai/js/config.js` (already loaded before `api.js`):

```js
window.CAREER_AI_API = "https://career-api.example.com";
```

`api.js` will try that API first, then the current origin. If every endpoint is
unavailable, the curated catalogue is shown so the buttons stay usable.

## Local development

Run `node server.js` in this folder (port 3001) and open either:

- `http://localhost:3001/` — single-origin mode, or
- the main static site on another port — `api.js` automatically falls back to
  `http://localhost:3001`.

`CACHE_TTL_MS` controls how long aggregated upstream feeds are cached.
