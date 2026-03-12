import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TRADINGVIEW WIDGET LOADERS (FREE - NO API KEY NEEDED)
// These embed real-time market data directly from TradingView
// ═══════════════════════════════════════════════════════════════════════

function TradingViewChart({ symbol, theme = "dark" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const container = document.createElement("div");
    container.className = "tradingview-widget-container__widget";
    container.style.height = "100%";
    container.style.width = "100%";
    ref.current.appendChild(container);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "5",
      timezone: "America/New_York",
      theme: theme,
      style: "1",
      locale: "en",
      backgroundColor: "rgba(6, 10, 28, 1)",
      gridColor: "rgba(30, 41, 59, 0.4)",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      studies: [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "MACD@tv-basicstudies",
        "BB@tv-basicstudies"
      ],
      hide_volume: false,
    });
    ref.current.appendChild(script);
  }, [symbol, theme]);

  return (
    <div ref={ref} className="tradingview-widget-container" style={{ height: "100%", width: "100%" }} />
  );
}

function TradingViewTechnicalAnalysis({ symbol, theme = "dark" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const container = document.createElement("div");
    container.className = "tradingview-widget-container__widget";
    ref.current.appendChild(container);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "5m",
      width: "100%",
      isTransparent: true,
      height: "100%",
      symbol: symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "en",
      colorTheme: theme,
    });
    ref.current.appendChild(script);
  }, [symbol, theme]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}

function TradingViewTopMovers({ theme = "dark" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const container = document.createElement("div");
    container.className = "tradingview-widget-container__widget";
    ref.current.appendChild(container);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: theme,
      dateRange: "1D",
      exchange: "US",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: "100%",
    });
    ref.current.appendChild(script);
  }, [theme]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}

function TradingViewNews({ symbol, theme = "dark" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const container = document.createElement("div");
    container.className = "tradingview-widget-container__widget";
    ref.current.appendChild(container);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: "symbol",
      symbol: symbol,
      colorTheme: theme,
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      locale: "en",
    });
    ref.current.appendChild(script);
  }, [symbol, theme]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}

// ═══════════════════════════════════════════════════════════════════════
// AI ANALYSIS ENGINE (CLAUDE API POWERED)
// ═══════════════════════════════════════════════════════════════════════

// Extracts JSON from text even if Claude wraps it in prose
function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}

  // Strip markdown code fences
  const stripped = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(stripped); } catch {}

  // Find the first { and last } and try parsing that
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSlice = stripped.substring(firstBrace, lastBrace + 1);
    try { return JSON.parse(jsonSlice); } catch {}
  }

  return null;
}

async function runAIAnalysis(ticker, strategy, setResult, setLoading) {
  setLoading(true);
  try {
    const resp = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: `You are a trading analysis API endpoint. You MUST respond with ONLY a raw JSON object. No prose, no explanations, no markdown, no text before or after the JSON. Your entire response must be parseable by JSON.parse(). If you cannot find data, use your best estimate and mark confidence as LOW.`,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Search the web for the latest news, price, and sentiment on ${ticker}, then respond with ONLY this JSON object (no other text):

{"current_price":"latest price or check chart","sentiment":"VERY_BULLISH|BULLISH|NEUTRAL|BEARISH|VERY_BEARISH","sentiment_score":0.0,"action":"STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL","confidence":"HIGH|MEDIUM|LOW","summary":"2-3 sentence overview","entry_zone":"entry price range","exit_target":"profit target","stop_loss":"stop loss level","risk_reward":"ratio like 1:2.5","options_play":"options strategy or null","catalysts":["bullish factors"],"risks":["bearish risks"],"key_levels":[{"price":"level","label":"description"}],"news_summary":["headline summaries"],"intraday_bias":"expected direction","volume_analysis":"volume trends","sector_context":"sector performance"}

Strategy: ${strategy.style}, max loss ${strategy.maxLoss}%, target ${strategy.profitTarget}%, position type: ${strategy.positionType}.

CRITICAL: Output ONLY the JSON object. No text before it. No text after it. Start with { and end with }.`
        }]
      })
    });

    const data = await resp.json();

    // If our serverless function returned an error
    if (data.error) {
      setResult({
        summary: `API Error: ${data.error}`,
        action: "HOLD", confidence: "LOW", sentiment: "NEUTRAL",
        catalysts: [], risks: ["See error above"], news_summary: []
      });
      setLoading(false);
      return;
    }

    // If Anthropic returned an API error
    if (data.type === "error") {
      setResult({
        summary: `Claude API Error: ${data.error?.message || JSON.stringify(data)}`,
        action: "HOLD", confidence: "LOW", sentiment: "NEUTRAL",
        catalysts: [], risks: ["See error above"], news_summary: []
      });
      setLoading(false);
      return;
    }

    // Extract text from response (skip tool_use and tool_result blocks from web search)
    const text = data.content?.filter(i => i.type === "text").map(i => i.text).join("\n") || "";
    
    if (!text) {
      setResult({
        summary: "Claude used all its output on web search and didn't return analysis text. Try again — it usually works on retry.",
        action: "HOLD", confidence: "LOW", sentiment: "NEUTRAL",
        catalysts: [], risks: ["Empty response — retry"], news_summary: []
      });
      setLoading(false);
      return;
    }

    // Robust JSON extraction — handles prose around JSON
    const parsed = extractJSON(text);
    
    if (parsed) {
      setResult(parsed);
    } else {
      // Couldn't parse JSON at all — show what Claude actually said
      setResult({
        summary: text.substring(0, 500),
        action: "HOLD", confidence: "LOW", sentiment: "NEUTRAL",
        catalysts: [], risks: ["Response wasn't valid JSON — showing raw text above"], news_summary: []
      });
    }
  } catch (e) {
    console.error("AI Analysis error:", e);
    setResult({
      summary: `Error: ${e.message}. Try running the analysis again.`,
      action: "HOLD",
      confidence: "LOW",
      sentiment: "NEUTRAL",
      catalysts: [],
      risks: [`Technical error: ${e.message}`],
      news_summary: []
    });
  }
  setLoading(false);
}

// ═══════════════════════════════════════════════════════════════════════
// SCORE GAUGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════

function ActionBadge({ action }) {
  const config = {
    STRONG_BUY: { bg: "#064e3b", border: "#10b981", text: "#6ee7b7", icon: "▲▲" },
    BUY: { bg: "#064e3b88", border: "#10b98188", text: "#6ee7b7", icon: "▲" },
    HOLD: { bg: "#78350f88", border: "#f59e0b88", text: "#fcd34d", icon: "◆" },
    SELL: { bg: "#7f1d1d88", border: "#ef444488", text: "#fca5a5", icon: "▼" },
    STRONG_SELL: { bg: "#7f1d1d", border: "#ef4444", text: "#fca5a5", icon: "▼▼" },
  };
  const c = config[action] || config.HOLD;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "10px 22px", borderRadius: 8,
      background: c.bg, border: `2px solid ${c.border}`,
      fontSize: 20, fontWeight: 900, color: c.text,
      fontFamily: "var(--mono)", letterSpacing: 1
    }}>
      <span>{c.icon}</span> {action?.replace("_", " ")}
    </div>
  );
}

function SentimentMeter({ sentiment, score }) {
  const config = {
    VERY_BULLISH: { color: "#10b981", pct: 90 },
    BULLISH: { color: "#34d399", pct: 70 },
    NEUTRAL: { color: "#f59e0b", pct: 50 },
    BEARISH: { color: "#f87171", pct: 30 },
    VERY_BEARISH: { color: "#ef4444", pct: 10 },
  };
  const c = config[sentiment] || config.NEUTRAL;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "var(--mono)", letterSpacing: 1 }}>BEARISH</span>
        <span style={{ fontSize: 12, color: c.color, fontFamily: "var(--mono)", fontWeight: 700 }}>{sentiment?.replace("_", " ")}</span>
        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "var(--mono)", letterSpacing: 1 }}>BULLISH</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "#1e293b", overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", height: "100%", borderRadius: 4,
          width: `${c.pct}%`, background: `linear-gradient(90deg, #ef4444, #f59e0b, #10b981)`,
          transition: "width 1s ease"
        }} />
        <div style={{
          position: "absolute", top: -3, left: `${c.pct}%`, transform: "translateX(-50%)",
          width: 14, height: 14, borderRadius: "50%", background: c.color,
          border: "2px solid #0a0f1e", transition: "left 1s ease"
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ALERT ITEM
// ═══════════════════════════════════════════════════════════════════════

function AlertItem({ alert, isNew }) {
  const colors = {
    ENTRY: { bg: "rgba(16,185,129,0.08)", border: "#10b981", text: "#6ee7b7", icon: "▲" },
    EXIT: { bg: "rgba(239,68,68,0.08)", border: "#ef4444", text: "#fca5a5", icon: "▼" },
    WATCH: { bg: "rgba(245,158,11,0.08)", border: "#f59e0b", text: "#fcd34d", icon: "◆" },
    AI: { bg: "rgba(34,211,238,0.08)", border: "#22d3ee", text: "#67e8f9", icon: "⚡" },
  };
  const c = colors[alert.type] || colors.WATCH;
  return (
    <div style={{
      padding: "10px 14px", marginBottom: 6, borderRadius: 8,
      background: c.bg, borderLeft: `3px solid ${c.border}`,
      animation: isNew ? "slideIn 0.4s ease" : "none"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: c.text, fontWeight: 800, fontSize: 11, fontFamily: "var(--mono)" }}>
          {c.icon} {alert.type}
        </span>
        <span style={{ color: "#475569", fontSize: 9, fontFamily: "var(--mono)" }}>
          {new Date(alert.time).toLocaleTimeString()}
        </span>
      </div>
      <div style={{ color: "#cbd5e1", fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{alert.message}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SETUP GUIDE PANEL
// ═══════════════════════════════════════════════════════════════════════

function SetupGuide({ alpacaStatus }) {
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: "#f1f5f9", fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        Connection Status
      </h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Your API keys are stored securely as environment variables in Vercel — they never touch the browser.
      </p>

      {/* Anthropic Status */}
      <div style={{
        padding: 16, borderRadius: 10, border: "1px solid #1e293b",
        background: "rgba(15,23,42,0.5)", marginBottom: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "rgba(167,139,250,0.1)",
            border: "1px solid #a78bfa33", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16
          }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>Claude AI (Anthropic)</div>
            <div style={{ color: "#475569", fontSize: 11 }}>Powers AI Analysis tab • Web search + sentiment + trade signals</div>
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 4, fontSize: 10,
            fontFamily: "var(--mono)", fontWeight: 700,
            background: "rgba(16,185,129,0.15)", color: "#10b981",
          }}>ENV VAR SET</div>
        </div>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: "#0a0f1e", border: "1px solid #0f172a" }}>
          <div style={{ color: "#475569", fontSize: 10, fontFamily: "var(--mono)" }}>
            Vercel → Settings → Environment Variables → <span style={{ color: "#a78bfa" }}>ANTHROPIC_API_KEY</span>
          </div>
        </div>
      </div>

      {/* Alpaca Status */}
      <div style={{
        padding: 16, borderRadius: 10, border: "1px solid #1e293b",
        background: "rgba(15,23,42,0.5)", marginBottom: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "rgba(34,211,238,0.1)",
            border: "1px solid #22d3ee33", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16
          }}>🦙</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>Alpaca Markets</div>
            <div style={{ color: "#475569", fontSize: 11 }}>
              {alpacaStatus.connected
                ? `Connected • ${alpacaStatus.mode === "paper" ? "Paper Trading" : "Live Trading"} mode`
                : "Not connected • Add keys in Vercel env vars"
              }
            </div>
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 4, fontSize: 10,
            fontFamily: "var(--mono)", fontWeight: 700,
            background: alpacaStatus.connected ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            color: alpacaStatus.connected ? "#10b981" : "#f59e0b",
          }}>
            {alpacaStatus.connected ? "CONNECTED" : "NOT CONNECTED"}
          </div>
        </div>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: "#0a0f1e", border: "1px solid #0f172a" }}>
          <div style={{ color: "#475569", fontSize: 10, fontFamily: "var(--mono)", display: "grid", gap: 4 }}>
            <div>Vercel → Settings → Environment Variables →</div>
            <div><span style={{ color: "#22d3ee" }}>ALPACA_API_KEY</span> = your Alpaca API key ID</div>
            <div><span style={{ color: "#22d3ee" }}>ALPACA_API_SECRET</span> = your Alpaca secret key</div>
            <div><span style={{ color: "#22d3ee" }}>ALPACA_PAPER</span> = <span style={{ color: "#94a3b8" }}>true</span> (set to false for live trading)</div>
          </div>
        </div>
      </div>

      {/* How to add env vars */}
      <div style={{ padding: 16, borderRadius: 10, border: "1px solid #1e293b55", background: "rgba(15,23,42,0.3)", marginBottom: 12 }}>
        <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>How to Add / Change Keys</div>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { step: "1", text: "Go to vercel.com and open your signal-forge project" },
            { step: "2", text: "Click Settings → Environment Variables" },
            { step: "3", text: "Add each key name and value shown above" },
            { step: "4", text: "Click Save, then go to Deployments → Redeploy" },
            { step: "5", text: "Done! Keys are stored securely and loaded automatically" },
          ].map(item => (
            <div key={item.step} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: "rgba(34,211,238,0.1)", border: "1px solid #22d3ee33",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#22d3ee", fontSize: 11, fontWeight: 800, fontFamily: "var(--mono)"
              }}>{item.step}</div>
              <span style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.4 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status summary */}
      <div style={{
        padding: 12, borderRadius: 8,
        background: "rgba(34,211,238,0.05)", border: "1px solid #22d3ee22"
      }}>
        <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>💡 What's working right now</div>
        <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>
          TradingView charts, technicals, top movers, and news are live with zero setup.
          AI Analysis uses your Anthropic key to search real-time news and generate trade signals.
          Alpaca connection enables historical bar data, options flow, and future automated execution.
          All API keys are stored server-side in Vercel — they never appear in your browser.
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════════════

const WATCHLIST = ["AAPL", "NVDA", "TSLA", "SPY", "QQQ", "AMZN", "MSFT", "META", "AMD", "GOOGL"];

export default function SignalForge() {
  const [ticker, setTicker] = useState("NVDA");
  const [customTicker, setCustomTicker] = useState("");
  const [activeTab, setActiveTab] = useState("chart");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [alerts, setAlerts] = useState([
    { type: "WATCH", time: Date.now(), message: "SignalForge initialized. Select a ticker and run AI Analysis to begin." }
  ]);
  const [strategy, setStrategy] = useState({
    maxLoss: 5,
    profitTarget: 15,
    style: "Day Trading",
    positionType: "Options (Calls/Puts)"
  });
  const [alpacaStatus, setAlpacaStatus] = useState({
    connected: false,
    mode: "paper",
    loading: true
  });

  // Auto-check Alpaca connection on load
  useEffect(() => {
    fetch("/api/alpaca-status")
      .then(r => r.json())
      .then(data => setAlpacaStatus({ ...data, loading: false }))
      .catch(() => setAlpacaStatus({ connected: false, mode: "paper", loading: false }));
  }, []);

  const tvSymbol = `NASDAQ:${ticker}`;

  const handleRunAI = useCallback(() => {
    setAlerts(a => [
      { type: "AI", time: Date.now(), message: `Running deep analysis on ${ticker}... searching news, sentiment, and technicals.` },
      ...a.slice(0, 29)
    ]);
    runAIAnalysis(ticker, strategy, (result) => {
      setAiResult(result);
      if (result?.action) {
        const typeMap = { STRONG_BUY: "ENTRY", BUY: "ENTRY", SELL: "EXIT", STRONG_SELL: "EXIT", HOLD: "WATCH" };
        setAlerts(a => [
          {
            type: typeMap[result.action] || "WATCH",
            time: Date.now(),
            message: `AI Signal: ${result.action.replace("_", " ")} on ${ticker} (${result.confidence} confidence). ${result.entry_zone ? "Entry: " + result.entry_zone : ""}`
          },
          ...a.slice(0, 29)
        ]);
      }
    }, setAiLoading);
  }, [ticker, strategy]);

  const handleTickerSubmit = useCallback(() => {
    if (customTicker.trim()) {
      setTicker(customTicker.trim().toUpperCase());
      setCustomTicker("");
      setAiResult(null);
    }
  }, [customTicker]);

  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      background: "#060a1c",
      color: "#e2e8f0",
      minHeight: "100vh",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        :root {
          --mono: 'IBM Plex Mono', monospace;
          --body: 'IBM Plex Sans', sans-serif;
          --display: 'Syne', sans-serif;
          --cyan: #22d3ee;
          --green: #10b981;
          --red: #ef4444;
          --amber: #f59e0b;
          --surface: rgba(15,23,42,0.5);
          --border: #1e293b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        input:focus { border-color: var(--cyan) !important; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(6,10,28,0.95)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #22d3ee22, #3b82f622)",
            border: "1px solid #22d3ee33",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 17, letterSpacing: -0.5, lineHeight: 1 }}>
              SIGNAL<span style={{ color: "var(--cyan)" }}>FORGE</span>
            </div>
            <div style={{ fontSize: 8, color: "#475569", letterSpacing: 2.5, fontFamily: "var(--mono)", marginTop: 2 }}>
              REAL-TIME ANALYSIS ENGINE
            </div>
          </div>
        </div>

        {/* Ticker input */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 20 }}>
          <input
            type="text"
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleTickerSubmit()}
            placeholder="TICKER"
            style={{
              width: 90, padding: "6px 10px", borderRadius: 6,
              background: "#0a0f1e", border: "1px solid var(--border)",
              color: "#f1f5f9", fontSize: 13, fontFamily: "var(--mono)", fontWeight: 600,
              outline: "none", textTransform: "uppercase"
            }}
          />
          <button onClick={handleTickerSubmit} style={{
            padding: "6px 12px", borderRadius: 6, border: "1px solid var(--cyan)33",
            background: "rgba(34,211,238,0.08)", color: "var(--cyan)",
            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--mono)"
          }}>GO</button>
        </div>

        {/* Quick watchlist */}
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginLeft: "auto" }}>
          {WATCHLIST.map(t => (
            <button key={t} onClick={() => { setTicker(t); setAiResult(null); }} style={{
              padding: "4px 8px", borderRadius: 4, border: "1px solid",
              borderColor: t === ticker ? "var(--cyan)" : "#0f172a",
              background: t === ticker ? "rgba(34,211,238,0.08)" : "transparent",
              color: t === ticker ? "var(--cyan)" : "#475569",
              fontSize: 10, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--mono)", transition: "all 0.15s"
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ═══ ACTIVE TICKER BAR ═══ */}
      <div style={{
        padding: "10px 20px", borderBottom: "1px solid #0f172a",
        background: "rgba(15,23,42,0.3)",
        display: "flex", alignItems: "center", gap: 16
      }}>
        <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 26, color: "#f1f5f9" }}>
          {ticker}
        </span>
        {aiResult?.action && <ActionBadge action={aiResult.action} />}
        {aiResult?.confidence && (
          <span style={{ color: "#475569", fontSize: 11, fontFamily: "var(--mono)" }}>
            {aiResult.confidence} CONFIDENCE
          </span>
        )}
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", background: "rgba(15,23,42,0.2)" }}>
        {[
          { id: "chart", label: "📈 CHART", desc: "Live TradingView" },
          { id: "technicals", label: "📊 TECHNICALS", desc: "Real-time signals" },
          { id: "ai", label: "⚡ AI ANALYSIS", desc: "Claude-powered" },
          { id: "movers", label: "🔥 TOP MOVERS", desc: "Market scanner" },
          { id: "news", label: "📰 NEWS", desc: "Live headlines" },
          { id: "strategy", label: "🎯 STRATEGY", desc: "Your parameters" },
          { id: "setup", label: "⚙️ SETUP", desc: "Connect APIs" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 16px", border: "none", background: "transparent",
            borderBottom: activeTab === t.id ? "2px solid var(--cyan)" : "2px solid transparent",
            color: activeTab === t.id ? "#f1f5f9" : "#475569",
            fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
            fontFamily: "var(--mono)", transition: "all 0.15s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1
          }}>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ display: "flex", height: "calc(100vh - 160px)" }}>

        {/* LEFT: Main panel */}
        <div style={{ flex: "1 1 0", minWidth: 0, overflow: "auto" }}>

          {activeTab === "chart" && (
            <div style={{ height: "100%" }}>
              <TradingViewChart symbol={tvSymbol} />
            </div>
          )}

          {activeTab === "technicals" && (
            <div style={{ height: "100%" }}>
              <TradingViewTechnicalAnalysis symbol={tvSymbol} />
            </div>
          )}

          {activeTab === "movers" && (
            <div style={{ height: "100%" }}>
              <TradingViewTopMovers />
            </div>
          )}

          {activeTab === "news" && (
            <div style={{ height: "100%" }}>
              <TradingViewNews symbol={tvSymbol} />
            </div>
          )}

          {activeTab === "ai" && (
            <div style={{ padding: 20, overflow: "auto", height: "100%" }}>
              <button onClick={handleRunAI} disabled={aiLoading} style={{
                width: "100%", padding: "14px 24px", borderRadius: 10,
                border: "1px solid var(--cyan)44",
                background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(59,130,246,0.08))",
                color: "var(--cyan)", fontSize: 14, fontWeight: 700, cursor: aiLoading ? "wait" : "pointer",
                fontFamily: "var(--mono)", marginBottom: 20,
                opacity: aiLoading ? 0.6 : 1, transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10
              }}>
                {aiLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid var(--cyan)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    SEARCHING NEWS & ANALYZING {ticker}...
                  </>
                ) : (
                  <>⚡ RUN AI DEEP ANALYSIS ON {ticker}</>
                )}
              </button>

              {aiResult && (
                <div style={{ display: "grid", gap: 14, animation: "slideIn 0.5s ease" }}>
                  {/* Verdict */}
                  <div style={{ padding: 20, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                      <ActionBadge action={aiResult.action} />
                      {aiResult.confidence && (
                        <div style={{ color: "#64748b", fontSize: 12, fontFamily: "var(--mono)" }}>
                          Confidence: <span style={{ color: "#94a3b8", fontWeight: 700 }}>{aiResult.confidence}</span>
                        </div>
                      )}
                      {aiResult.current_price && (
                        <div style={{ color: "#64748b", fontSize: 12, fontFamily: "var(--mono)" }}>
                          Price: <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{aiResult.current_price}</span>
                        </div>
                      )}
                    </div>
                    {aiResult.sentiment && <SentimentMeter sentiment={aiResult.sentiment} />}
                    <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginTop: 14 }}>{aiResult.summary}</p>
                  </div>

                  {/* Trade Levels */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                    {[
                      { label: "ENTRY ZONE", value: aiResult.entry_zone, color: "#10b981", bg: "#064e3b" },
                      { label: "PROFIT TARGET", value: aiResult.exit_target, color: "#3b82f6", bg: "#1e3a5f" },
                      { label: "STOP LOSS", value: aiResult.stop_loss, color: "#ef4444", bg: "#7f1d1d" },
                      { label: "RISK:REWARD", value: aiResult.risk_reward, color: "#a78bfa", bg: "#4c1d95" },
                    ].filter(l => l.value).map(level => (
                      <div key={level.label} style={{
                        padding: 14, borderRadius: 8,
                        background: `${level.bg}22`, border: `1px solid ${level.color}33`
                      }}>
                        <div style={{ fontSize: 9, color: level.color, letterSpacing: 1.5, fontFamily: "var(--mono)", fontWeight: 700 }}>{level.label}</div>
                        <div style={{ color: level.color, fontSize: 16, fontWeight: 800, marginTop: 6, fontFamily: "var(--mono)" }}>{level.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Options Play */}
                  {aiResult.options_play && (
                    <div style={{ padding: 14, borderRadius: 8, background: "rgba(167,139,250,0.06)", border: "1px solid #a78bfa22" }}>
                      <div style={{ fontSize: 9, color: "#a78bfa", letterSpacing: 1.5, fontFamily: "var(--mono)", fontWeight: 700 }}>OPTIONS STRATEGY</div>
                      <div style={{ color: "#c4b5fd", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{aiResult.options_play}</div>
                    </div>
                  )}

                  {/* Intraday + Volume + Sector */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "INTRADAY BIAS", value: aiResult.intraday_bias, color: "#22d3ee" },
                      { label: "VOLUME TREND", value: aiResult.volume_analysis, color: "#f59e0b" },
                      { label: "SECTOR CONTEXT", value: aiResult.sector_context, color: "#a78bfa" },
                    ].filter(i => i.value).map(item => (
                      <div key={item.label} style={{ padding: 12, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, color: item.color, letterSpacing: 1, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Key Levels */}
                  {aiResult.key_levels?.length > 0 && (
                    <div style={{ padding: 14, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1.5, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 }}>KEY PRICE LEVELS</div>
                      {aiResult.key_levels.map((lvl, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < aiResult.key_levels.length - 1 ? "1px solid #0f172a" : "none" }}>
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>{lvl.label}</span>
                          <span style={{ color: "var(--cyan)", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)" }}>${lvl.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* News found */}
                  {aiResult.news_summary?.length > 0 && (
                    <div style={{ padding: 14, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1.5, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 }}>LATEST NEWS FOUND</div>
                      {aiResult.news_summary.map((news, i) => (
                        <div key={i} style={{ padding: "6px 0", borderBottom: i < aiResult.news_summary.length - 1 ? "1px solid #0f172a" : "none", color: "#94a3b8", fontSize: 12, lineHeight: 1.5, display: "flex", gap: 8 }}>
                          <span style={{ color: "#475569" }}>•</span> {news}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Catalysts + Risks */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {aiResult.catalysts?.length > 0 && (
                      <div style={{ padding: 14, borderRadius: 8, background: "rgba(16,185,129,0.04)", border: "1px solid #10b98118" }}>
                        <div style={{ fontSize: 9, color: "var(--green)", letterSpacing: 1.5, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 8 }}>BULLISH CATALYSTS</div>
                        {aiResult.catalysts.map((c, i) => (
                          <div key={i} style={{ color: "#6ee7b7", fontSize: 11, padding: "3px 0", display: "flex", gap: 6, lineHeight: 1.4 }}>
                            <span style={{ color: "var(--green)", flexShrink: 0 }}>+</span> {c}
                          </div>
                        ))}
                      </div>
                    )}
                    {aiResult.risks?.length > 0 && (
                      <div style={{ padding: 14, borderRadius: 8, background: "rgba(239,68,68,0.04)", border: "1px solid #ef444418" }}>
                        <div style={{ fontSize: 9, color: "var(--red)", letterSpacing: 1.5, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 8 }}>RISKS TO WATCH</div>
                        {aiResult.risks.map((r, i) => (
                          <div key={i} style={{ color: "#fca5a5", fontSize: 11, padding: "3px 0", display: "flex", gap: 6, lineHeight: 1.4 }}>
                            <span style={{ color: "var(--red)", flexShrink: 0 }}>!</span> {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!aiResult && !aiLoading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#475569" }}>AI Analysis Ready</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 400, margin: "0 auto" }}>
                    Click above to have Claude search real-time news, analyze sentiment and technicals, then generate
                    entry/exit signals with options strategies for <span style={{ color: "var(--cyan)", fontWeight: 700 }}>{ticker}</span>.
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "strategy" && (
            <div style={{ padding: 20, overflow: "auto", height: "100%" }}>
              <h3 style={{ color: "#f1f5f9", fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Trading Parameters</h3>
              <p style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>Configure your risk tolerance and trading style. The AI analysis will use these to tailor its recommendations.</p>

              <div style={{ display: "grid", gap: 16, maxWidth: 500 }}>
                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 11, fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
                    MAX LOSS TOLERANCE: <span style={{ color: "var(--red)" }}>{strategy.maxLoss}%</span>
                  </label>
                  <input type="range" min="1" max="20" value={strategy.maxLoss}
                    onChange={(e) => setStrategy(s => ({ ...s, maxLoss: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: "var(--red)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: 10, fontFamily: "var(--mono)" }}>
                    <span>1% (conservative)</span><span>20% (aggressive)</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 11, fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
                    PROFIT TARGET: <span style={{ color: "var(--green)" }}>{strategy.profitTarget}%</span>
                  </label>
                  <input type="range" min="5" max="100" value={strategy.profitTarget}
                    onChange={(e) => setStrategy(s => ({ ...s, profitTarget: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: "var(--green)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: 10, fontFamily: "var(--mono)" }}>
                    <span>5% (quick scalp)</span><span>100% (swing play)</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 11, fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
                    TRADING STYLE
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Scalping", "Day Trading", "Swing Trading", "Position Trading"].map(style => (
                      <button key={style} onClick={() => setStrategy(s => ({ ...s, style }))} style={{
                        padding: "8px 14px", borderRadius: 6,
                        border: `1px solid ${strategy.style === style ? "var(--cyan)" : "var(--border)"}`,
                        background: strategy.style === style ? "rgba(34,211,238,0.08)" : "transparent",
                        color: strategy.style === style ? "var(--cyan)" : "#64748b",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--body)"
                      }}>{style}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 11, fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
                    POSITION TYPE
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Options (Calls/Puts)", "Stock Only", "Both"].map(pt => (
                      <button key={pt} onClick={() => setStrategy(s => ({ ...s, positionType: pt }))} style={{
                        padding: "8px 14px", borderRadius: 6,
                        border: `1px solid ${strategy.positionType === pt ? "var(--cyan)" : "var(--border)"}`,
                        background: strategy.positionType === pt ? "rgba(34,211,238,0.08)" : "transparent",
                        color: strategy.positionType === pt ? "var(--cyan)" : "#64748b",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--body)"
                      }}>{pt}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 24, padding: 16, borderRadius: 10,
                background: "var(--surface)", border: "1px solid var(--border)"
              }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 }}>CURRENT STRATEGY PROFILE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <span style={{ color: "#475569", fontSize: 11 }}>Risk per trade:</span>
                    <span style={{ color: "var(--red)", fontFamily: "var(--mono)", fontWeight: 700, marginLeft: 6 }}>{strategy.maxLoss}%</span>
                  </div>
                  <div>
                    <span style={{ color: "#475569", fontSize: 11 }}>Target profit:</span>
                    <span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontWeight: 700, marginLeft: 6 }}>{strategy.profitTarget}%</span>
                  </div>
                  <div>
                    <span style={{ color: "#475569", fontSize: 11 }}>Risk:Reward:</span>
                    <span style={{ color: "var(--cyan)", fontFamily: "var(--mono)", fontWeight: 700, marginLeft: 6 }}>1:{(strategy.profitTarget / strategy.maxLoss).toFixed(1)}</span>
                  </div>
                  <div>
                    <span style={{ color: "#475569", fontSize: 11 }}>Style:</span>
                    <span style={{ color: "#94a3b8", fontWeight: 600, marginLeft: 6 }}>{strategy.style}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "setup" && (
            <SetupGuide alpacaStatus={alpacaStatus} />
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR: ALERTS ═══ */}
        <div style={{
          width: 280, flexShrink: 0,
          borderLeft: "1px solid var(--border)",
          background: "rgba(6,10,28,0.6)",
          display: "flex", flexDirection: "column",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, fontFamily: "var(--mono)", fontWeight: 700 }}>
              SIGNAL LOG
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 9, color: "#475569", fontFamily: "var(--mono)" }}>LIVE</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "10px 10px" }}>
            {alerts.map((a, i) => (
              <AlertItem key={`${a.time}-${i}`} alert={a} isNew={i === 0} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{
        padding: "6px 20px", borderTop: "1px solid #0a0f1e",
        background: "rgba(6,10,28,0.8)", textAlign: "center"
      }}>
        <span style={{ color: "#1e293b", fontSize: 9, fontFamily: "var(--mono)" }}>
          ⚠ FOR EDUCATIONAL PURPOSES ONLY — NOT FINANCIAL ADVICE — ALWAYS DO YOUR OWN RESEARCH
        </span>
      </div>
    </div>
  );
}
