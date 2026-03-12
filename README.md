# ⚡ SignalForge — Real-Time Trading Analysis Engine

A powerful stock & options trading indicator that combines TradingView's real-time charts, AI-powered sentiment analysis (via Claude), and configurable trading strategies.

---

## What It Does

- **Live Charts** — Real-time candlestick charts with RSI, MACD, Bollinger Bands, and volume (powered by TradingView, free)
- **Technical Analysis** — Real-time buy/sell/neutral signals across multiple timeframes
- **AI Deep Analysis** — Claude searches the web for live news, analyzes sentiment, and generates entry/exit points, stop losses, options strategies, and risk assessment
- **Top Movers** — See the biggest gainers, losers, and most active stocks right now
- **Live News** — Headlines for any ticker, updated in real-time
- **Strategy Config** — Set your max loss, profit target, trading style, and position type
- **Alpaca Ready** — Connect Alpaca API for historical data and eventually automated execution

---

## How to Deploy (Step by Step)

You're going to put this code on GitHub, then connect it to Vercel so it becomes a live website. Here's exactly how:

### Step 1: Create a GitHub Account (skip if you have one)
1. Go to [github.com](https://github.com)
2. Click **Sign Up** and create an account

### Step 2: Create a New Repository
1. Click the **+** icon in the top right → **New repository**
2. Name it `signal-forge`
3. Set it to **Public** (Vercel free tier needs public repos, or you can use private with Vercel Pro)
4. **Do NOT** check "Add a README" (we already have one)
5. Click **Create repository**

### Step 3: Upload the Files
**Option A — Easy way (drag and drop):**
1. On your new repo page, click **"uploading an existing file"** link
2. Drag ALL the files and folders from this project into the upload area:
   - `package.json`
   - `vite.config.js`
   - `index.html`
   - `.gitignore`
   - `README.md`
   - `src/` folder (containing `main.jsx` and `App.jsx`)
3. Click **Commit changes**

**Option B — Using Git (if you're comfortable with terminal):**
```bash
cd signal-forge
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/signal-forge.git
git push -u origin main
```

### Step 4: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New → Project**
3. Find `signal-forge` in your repo list and click **Import**
4. Vercel will auto-detect it's a Vite project — you don't need to change anything
5. Click **Deploy**
6. Wait about 60 seconds — Vercel will give you a live URL like `signal-forge.vercel.app`

### Step 5: Done!
Open your URL and you've got a live trading dashboard. Bookmark it and use it during market hours.

---

## How to Use It

1. **Pick a ticker** from the watchlist or type any symbol in the search box
2. **Check the Chart tab** for real-time price action with indicators
3. **Check Technicals** for TradingView's buy/sell signals
4. **Go to Strategy tab** and set your risk tolerance and trading style
5. **Hit AI Analysis** — Claude will search for real news and give you a complete trading brief with entry/exit points
6. **Watch the Signal Log** on the right for alerts

---

## Folder Structure

```
signal-forge/
├── index.html          ← The HTML page that loads everything
├── package.json        ← Lists the project dependencies
├── vite.config.js      ← Build tool configuration
├── .gitignore          ← Tells Git which files to skip
├── README.md           ← This file
└── src/
    ├── main.jsx        ← React entry point (boots up the app)
    └── App.jsx         ← The entire SignalForge application
```

---

## Optional: Connect Alpaca

1. Go to [alpaca.markets](https://alpaca.markets) and create a free account
2. In your Alpaca dashboard, go to **API Keys**
3. Generate a new key pair
4. In SignalForge, go to the **Setup** tab and paste your keys
5. Start with **Paper Trading** mode to practice without real money

---

## Disclaimer

⚠️ **This is for educational purposes only. This is not financial advice. Always do your own research before making any trades. Past performance and AI analysis do not guarantee future results.**
