export default async function handler(req, res) {
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  const paper = process.env.ALPACA_PAPER !== "false"; // default to paper trading

  const connected = !!(apiKey && apiSecret);

  if (req.method === "GET") {
    return res.status(200).json({ 
      connected,
      mode: paper ? "paper" : "live"
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
