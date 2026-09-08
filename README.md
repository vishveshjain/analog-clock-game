# ⏰ Tick-Tock Hero: Analog Clock Learning Game

[![YouTube Playable](https://img.shields.io/badge/YouTube-Playable%20Ready-red?logo=youtube)](https://support.google.com/youtube/answer/13837968)
[![HTML5](https://img.shields.io/badge/HTML5-Pure%20Vanilla-orange?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-blue)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive, kid-friendly educational web game designed for **YouTube Playables** to help children learn how to read and set an analog clock.

---

## 🌟 Game Highlights

- **Child-Friendly Hand Controls**:
  - 🔵 **Small Tick (Hour Hand)**: Chubby cobalt-blue hand marked with an **"H"** badge.
  - 🟠 **Large Tick (Minute Hand)**: Long bright-orange hand marked with an **"M"** badge.
  - Rotate hands smoothly via touch/pointer drag, or tap numbers directly on the clock face.
- **Example Scenario (`3:40`)**:
  - The game prompts the child with target time **3:40**.
  - The child points the **small tick to 3** and the **large tick to 8**.
  - Outer 5-minute badges display `:40` right next to the number `8`, visually teaching children how minute markers correlate to hours.
  - Real-time status display shows: `Your Clock: Small: 3 • Large: 8 (:40)`.
- **Celebrations & Rewards**:
  - 🎉 Full-screen canvas confetti & star particle explosion.
  - 🎺 Synthetic arpeggio fanfare and chime via the Web Audio API.
  - 🗣️ Spoken voice praise (*"Super! You got it right!"*, *"Awesome job!"*) using the Web Speech API.
  - 🏆 Congratulatory pop-up modal awarding **+10 Points**, tracking streaks, and unlocking the next challenge!
- **Helpful Guidance & Hints**:
  - If a child misplaces a hand, gentle constructive feedback appears:
    - *e.g.* *"Small blue tick is on 3 (Great!). Now point the long orange tick to 8 (40 min)!"*
  - Includes a dedicated **💡 Hint** button.
- **Difficulty Modes**:
  - **Hours (1-12)**: Whole hours (:00) for beginners.
  - **Half / Quarters**: Common fractions (:00, :15, :30, :45).
  - **5-Minute Steps**: 5-minute increments (:05, :10, :40, etc.).

---

## 🎮 YouTube Playables Architecture

Built specifically to satisfy YouTube Playables platform requirements:

- **Zero External Dependencies**: All vector graphics are pure inline SVG; all audio effects are generated in real-time via the browser's Web Audio API synth (no external audio files to buffer or fail).
- **Responsive Layout**: Adapts cleanly to both **9:16 Portrait** (mobile phones) and **16:9 Landscape** (desktop & tablet iframe embedding).
- **Touch & Mouse Support**: Fully unified with `PointerEvent` (`pointerdown`, `pointermove`, `pointerup`) and `setPointerCapture` for uninterrupted drag tracking.
- **Playables SDK Lifecycle Ready**: Includes [`yt-playable-sdk.js`](./yt-playable-sdk.js) providing:
  - `Playables.firstFrameReady()`
  - `Playables.gameReady()`
  - `Playables.sendScore(score)`
  - Background tab pause/resume listeners (`onPause`, `onResume`).

---

## 📂 Project Structure

```text
analog-clock-game/
├── index.html          # Main HTML5 entry point & SVG clock layout
├── style.css           # Responsive kid-friendly styles & animations
├── game.js             # Core game engine, drag-and-snap math & logic
├── audio.js            # Web Audio synth sound generator & Speech Synthesis
├── confetti.js         # Canvas-based confetti particle engine
├── yt-playable-sdk.js  # YouTube Playables API bridge & fallback
└── README.md           # Project documentation
```

---

## 🚀 Quick Start / Local Testing

### Option 1: Direct Browser Launch
Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Local HTTP Server
Run a lightweight local server:

```bash
# Python 3
python -m http.server 8080

# Or with Node.js
npx serve .
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📦 Deploying as a YouTube Playable

1. Ensure all files (`index.html`, `style.css`, `game.js`, `audio.js`, `confetti.js`, `yt-playable-sdk.js`) are kept together in the root directory.
2. Zip the contents of the directory into a `.zip` archive.
3. Test your build using the official YouTube Playables Test Suite / iframe previewer.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
