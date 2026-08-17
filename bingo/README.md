# בינגו הבוגרים 🎓 — LEADERS Alumni Bingo

A self-contained Hebrew (RTL) "Alumni Bingo" icebreaker game for LEADERS Alumni Association events. Built to match the branding of the main [leadersalumni.org](https://leadersalumni.org) site (gradient blue→teal, Heebo font, 🎓 mark) but has **zero dependency** on the rest of the repo — it's a single static page that can be copied into its own repository or hosting at any time.

## How it works

1. **Landing screen** — visitor types their name and clicks "בואו נתחיל!".
2. **5×5 bingo grid** — every square has a task (e.g. "מישהו שעבד בהייטק") and a signature line to note who they found. The center square is a free space.
3. **Click a square** to mark it — a translucent red **X** is drawn over the square, but the task text and signature line stay visible underneath it. Click again to unmark.
4. Completing a full row, column, or diagonal triggers a "🎉 בינגו!" toast.
5. A progress bar tracks how many of the 25 squares are marked.

## Data persistence

This is a static page with **no backend**, so participant data (name, join time, board progress) is saved to the browser's `localStorage` on whatever device the visitor used:

- Reloading the page on the same device resumes that player's board automatically.
- The **"מי שיחק במכשיר הזה?"** link at the bottom opens a panel listing everyone who has played *on that specific browser/device*, with a **CSV export** button — handy if you run the game from one shared kiosk/tablet at an event.
- Because storage is per-device, this does **not** give organizers a single central list across every visitor's own phone. If you need that, swap `saveStore()`/`loadStore()` in `index.html` for a call to a small backend (e.g. a Google Apps Script Web App writing to a Google Sheet, matching the pattern already used elsewhere in this repo for `data/alumni.csv`).

## Customizing the tasks

Edit the `TASKS` array near the top of the `<script>` block in `index.html` — it's a flat list of 25 strings, with index `12` (the center) reserved as the free space.

## Running locally

It's a single HTML file with no build step:

```bash
cd bingo
python -m http.server 3000
# open http://localhost:3000
```

## Deploying

Drop the `bingo/` folder anywhere static files can be served (GitHub Pages, Netlify, S3, etc.). If deployed alongside the main site on GitHub Pages, it will be reachable at `leadersalumni.org/bingo/`.
