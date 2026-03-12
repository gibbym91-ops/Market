export default async function handler(req, res) {
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  const paper = process.env.ALPACA_PAPER !== "false";

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ 
      error: "Alpaca API keys not configured. Add ALPACA_API_KEY and ALPACA_API_SECRET in Vercel → Settings → Environment Variables." 
    });
  }

  // Determine which Alpaca endpoint to call
  const { endpoint, params } = req.method === "GET" ? req.query : req.body;

  if (!endpoint) {
    return res.status(400).json({ error: "Missing 'endpoint' parameter" });
  }

  // Allowed endpoints to prevent misuse
  const allowedPrefixes = [
    "/v2/stocks/",
    "/v2/options/",
    "/v1beta1/",
    "/v2/account",
    "/v2/positions",
    "/v2/orders",
    "/v2/assets",
  ];

  const isAllowed = allowedPrefixes.some(prefix => endpoint.startsWith(prefix));
  if (!isAllowed) {
    return res.status(403).json({ error: "Endpoint not allowed" });
  }

  const dataBaseUrl = "https://data.alpaca.markets";
  const tradingBaseUrl = paper
    ? "https://paper-api.alpaca.markets"
    : "https://api.alpaca.markets";

  // Data endpoints go to data URL, trading endpoints go to trading URL
  const isDataEndpoint = endpoint.startsWith("/v2/stocks/") || 
                          endpoint.startsWith("/v2/options/") || 
                          endpoint.startsWith("/v1beta1/");
  const baseUrl = isDataEndpoint ? dataBaseUrl : tradingBaseUrl;

  // Build URL with query params
  let url = `${baseUrl}${endpoint}`;
  if (params && typeof params === "object") {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  } else if (req.method === "GET" && req.query) {
    // Pass through any extra query params (excluding endpoint and params)
    const extraParams = { ...req.query };
    delete extraParams.endpoint;
    delete extraParams.params;
    if (Object.keys(extraParams).length > 0) {
      url += `?${new URLSearchParams(extraParams).toString()}`;
    }
  }

  try {
    const fetchOptions = {
      method: req.method === "GET" ? "GET" : (req.body?.method || "GET"),
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Alpaca proxy error:", error);
    return res.status(500).json({ error: "Failed to reach Alpaca API" });
  }
}
