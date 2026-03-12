export const config = { runtime: "edge" };

export default async function handler(req) {
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  const paper = process.env.ALPACA_PAPER !== "false";
  const connected = !!(apiKey && apiSecret);

  return new Response(
    JSON.stringify({ connected, mode: paper ? "paper" : "live" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
