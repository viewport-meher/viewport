# 📱 ViewPort: Live Responsive Device Preview for VS Code

**ViewPort** is a powerful VS Code extension that lets web developers preview their HTML/CSS/JS files inside real device frames—just like Flutter's Device Preview, but built specifically for web developers. It opens directly in your browser with a sleek device sidebar, updating instantly as you code.

---

## ✨ Key Features

## 🥔 Built for "Potato PCs" (Ultra-Optimized)

If your computer can run VS Code, it can run ViewPort. Period. 

Many responsive testing tools launch entirely separate Chromium instances, heavy Electron wrappers, or use bloated UI frameworks that consume massive amounts of RAM and spike CPU usage. We engineered ViewPort with extreme constraints to ensure zero performance degradation on low-end hardware:

* **Zero UI Overhead:** The ViewPort UI is written in 100% Vanilla JS, HTML, and CSS. No React, no virtual DOMs, no heavy build steps. It renders instantly.
* **Uses Your Existing Browser:** Instead of launching a heavy internal browser window, ViewPort opens seamlessly in your default lightweight browser, utilizing the memory footprint you're already using.
* **Tiny Package Size:** At just ~1 MB, it installs in seconds and takes up virtually no disk space.
* **Aggressive Garbage Collection:** The moment you click `viewport.stop`, our `cleanupAll()` routine instantly kills the Express server, terminates SSE connections, drops file watchers, and frees up your RAM completely. No ghost processes left behind.

### 🚀 Instant Launch & Controls
* **Status Bar Button:** A `Go ViewPort` button sits quietly in your bottom status bar. Click it to launch. When running, it displays `ViewPort: filename.html`. Click again to stop.
* **Right-Click Support:** Simply right-click any HTML file in your editor and select **Open with ViewPort** to launch instantly.

### ⚡ Lightning Fast Live Reload
* **Powered by SSE:** Uses Server-Sent Events (no heavy polling).
* **Zero Flickering:** Save any file in your project folder and the browser updates instantly. It only reloads on actual file saves, preserving your scroll state and workflow.

### 🎯 True 1:1 Device Testing
* **"Your Screen" (Auto Detect):** The very first option automatically detects your actual hardware monitor resolution (e.g., 1366x768) and defaults to it when ViewPort opens.
* **Auto Scale Engine:** Device frames automatically scale to fit your browser window. Resize your browser, and the frames adjust seamlessly.
* **Native Frame Styling:** Mobile and tablet views feature rounded bezels, while Desktop/MacBook views mimic a laptop-style frame with realistic borders.

### 🔒 100% Offline, Private & Optimized
* **No Internet Needed:** Runs entirely on `localhost`. No data is ever sent out. No tracking, no analytics.
* **Deep RAM Cleanup:** We respect your machine's memory. The `cleanupAll()` function rigorously disposes of all resources on stop—SSE clients are closed, file watchers are disposed, and the Express server is completely shut down.
* **Dynamic Port Handling:** Defaults to port `3579`. If it's busy, ViewPort recursively scans and binds to the next available port automatically.

---

## 📱 27+ Verified Device Frames
*Real CSS viewport dimensions carefully verified against blisk.io and screensizechecker.com.*

<details>
<summary><strong>View Full Device List</strong></summary>

* **Your Screen:** Auto-detected native resolution
* **Android (Samsung):** Galaxy S25, Galaxy S20, Galaxy A54, Note 20 Ultra
* **Android (Google Pixel & Nexus):** Pixel 6a, Pixel 8, Pixel 8 Pro, Nexus 5
* **Android (Others):** OnePlus 8 Pro, Sony Xperia 1 II
* **iPhone:** 16 Pro, 16 Pro Max, 14 Pro, 13 Mini, 11 Pro Max, SE (3rd Gen)
* **iPad:** Air 11" M2, Air 13" M2, Pro 11" M4, Pro 13" M4, 10th Gen, 11th Gen / Air 5
* **MacBook:** Air 13", Pro 15", Pro 14" M3, Pro 16" M3
* **Desktop:** Laptop HD (720p), Desktop FHD (1080p), Desktop QHD (1440p)
</details>

---

## 🛠️ Tech Stack & Package Info

ViewPort is intentionally built to be ultra-lightweight.

| Component | Technology |
| :--- | :--- |
| **Extension** | VS Code Extension API (JavaScript) |
| **Local Server** | Express.js |
| **Live Reload** | SSE (Server-Sent Events) |
| **UI** | Pure HTML + CSS (Injected via Strings) |

**Package Footprint:**
* `extension.js`: ~14 KB
* `package.json`: ~1.4 KB
* `viewport_logo.png`: ~95 KB
* `node_modules/`: ~2.6 MB
* **Total `.vsix` Size:** ~1.09 MB

---

## 🔧 How It Works Under the Hood

```text
User opens HTML file in VS Code 
       ↓
Clicks "Go ViewPort" in status bar 
       ↓
Extension starts Express server on port 3579 
       ↓
Browser opens localhost:3579/viewport-ui 
       ↓
ViewPort UI loads with dark-themed, 4px thin scrollbars 
       ↓
iframe serves the HTML file 
       ↓
User saves file → SSE sends reload signal → iframe reloads instantly


📋 Commands & Activation
viewport.start: Starts ViewPort / Open with ViewPort

viewport.stop: Stops the ViewPort server and runs memory cleanup.

Note: The extension activates smoothly on onStartupFinished, ensuring the status bar button is ready without delaying your editor's boot time.

☕ Support the Project
ViewPort is completely open-source and free to use. It was built to solve a genuine frustration for web developers.

If this tool saves you time, prevents headaches during responsive testing, or makes your workflow smoother, consider supporting its development!


(You can also sponsor the project via GitHub Sponsors)

Your support helps me keep the extension updated with the latest device frames and bug fixes. ❤️