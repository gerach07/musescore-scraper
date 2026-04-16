# musescore-scraper

Web app that takes a MuseScore score URL and returns a downloadable MIDI file link from a hosted serverless API.

## Project Structure

- `index.html`: frontend UI where users paste a MuseScore link.
- `api/get-midi.js`: serverless API that resolves MIDI URLs and can proxy the MIDI file download.
- `vercel.json`: function runtime config for API duration/memory.

## Install

```bash
npm install
```

## Run Locally

This project uses Playwright and requires a local Chromium binary path.

1. Install a Chromium binary for Playwright:

```bash
npx playwright-core install chromium
```

2. Set `CHROMIUM_PATH` to the downloaded Chromium binary path.

You can find it with:

```bash
find ~/.cache/ms-playwright -type f -name chrome | head -n 1
```

3. Run with your serverless runtime (for example `vercel dev`).

Example:

```bash
export CHROMIUM_PATH="$(find ~/.cache/ms-playwright -type f -name chrome | head -n 1)"
npx vercel dev
```

Note: `vercel dev` may require Vercel authentication in local environments.

Then open `index.html` via your local web server and call:

`/api/get-midi?scoreUrl=<encoded_musescore_url>`

## Deploy For Public Use

To make this work for everyone without any user installation:

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Deploy.
4. Share the Vercel domain.

After deployment, users only need to:

1. Open your website.
2. Paste a MuseScore URL.
3. Click Download MIDI File.

No browser extensions or local setup are required for users.

## Anti-Bot Reliability (Important)

MuseScore can block some server environments with anti-bot checks (Cloudflare). For best public reliability, connect this API to a managed remote browser provider.

Set these environment variables in your deployment:

- `BROWSER_WS_ENDPOINT`: Playwright or CDP websocket endpoint from your browser provider.
- `BROWSER_WS_PROTOCOL`: `playwright` (default) or `cdp`.

When `BROWSER_WS_ENDPOINT` is set, the API uses that remote browser instead of local Chromium.

## API Behavior

- `GET /api/get-midi?scoreUrl=...` returns JSON with:
	- `midiUrl`: detected source URL
	- `downloadUrl`: API proxy download URL for direct file download
- `GET /api/get-midi?scoreUrl=...&download=1` returns the MIDI file as an attachment.

## Notes

- The frontend uses same-origin API by default. You can set `window.MIDI_API_BASE` to point to a different API host.
- Some MuseScore pages are protected by anti-bot checks; if you receive a `403` response, configure `BROWSER_WS_ENDPOINT`.