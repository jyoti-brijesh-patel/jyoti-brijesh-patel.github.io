# Birthday Surprise Website

A fully static HTML, CSS, and JavaScript birthday surprise website for your wife. It includes an animated opening gift, background music, photo gallery, love letter, relationship counter, interactive heart, birthday cake, quotes, and a final celebration.

## How To Run

Open `index.html` in a browser.

If your browser blocks local audio or images, serve the folder with a simple local server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Customize

Edit `config.js`:

- `wifeName`: name shown throughout the page.
- `birthdayDate`: birthday date in `YYYY-MM-DD` format.
- `relationshipDate`: start date for the relationship counter.
- `musicPath`: background music file.
- `heartbeatPath`: heart click sound.
- `loadingQuote`, `heroSubtitle`, `loveLetter`, `birthdayWish`, `finalMessage`, `finaleSubtitle`: personal text.
- `photos`: gallery image paths.
- `reasonsLoveYou`, `romanticQuotes`, `timelineEvents`: section content.

## Files

```text
Birthday/
├── index.html
├── style.css
├── script.js
├── config.js
├── README.md
├── images/
│   ├── hero-bg.jpg
│   ├── photo1.jpg
│   ├── photo2.jpg
│   ├── photo3.jpg
│   ├── photo4.jpg
│   ├── photo5.jpg
│   └── photo6.jpg
├── music/
│   └── romantic-song.mp3
└── sounds/
    └── heartbeat.mp3
```

## Notes

All visual content and behavior are controlled by the static files above. No Node package or build step is required.
