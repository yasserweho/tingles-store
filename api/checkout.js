const CATALOG = {
  cloudline: { name: "Cloudline High-Rise Legging", price: 98 },
  still: { name: "Still Long-Sleeve Crop", price: 78 },
  drift: { name: "Drift Oversized Hoodie", price: 128 },
  northshell: { name: "Northshell Crop Jacket", price: 168 },
  ease: { name: "Ease Bike Short", price: 68 },
  pace: { name: "Pace Shell Jacket", price: 148 },
  runshort: { name: "Run Short 7\"", price: 78 },
  rest: { name: "Rest Heavyweight Hoodie", price: 118 },
  daytee: { name: "Day Train Tee", price: 58 },
  belt: { name: "Carry Run Belt", price: 38 },
  mat: { name: "Studio Mat 5mm", price: 88 },
  bottle: { name: "Tide Bottle 24oz", price: 42 }
};

function originFrom(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    res.status(500).json({ error: "Stripe is not configured. Add STRIPE_SECRET_KEY in the Vercel project settings." });
    return;
  }

  const incoming = (req.body && req.body.items) || [];
  if (!Array.isArray(incoming) || !incoming.length) {
    res.status(400).json({ error: "Your bag is empty." });
    return;
  }

  const lines = [];
  for (const item of incoming) {
    const product = CATALOG[item.id];
    const qty = Math.min(10, Math.max(1, Number(item.qty) || 1));
    if (!product) {
      res.status(400).json({ error: "Unknown product in bag." });
      return;
    }
    lines.push({
      name: `${product.name}${item.size ? ` — ${item.size}` : ""}`,
      amount: Math.round(product.price * 100),
      qty
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount * line.qty, 0);
  const shipping = subtotal >= 15000 ? 0 : 800;
  const origin = originFrom(req);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/cart.html?canceled=1`);
  params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.set("shipping_options[0][shipping_rate_data][display_name]", shipping === 0 ? "Free shipping" : "Standard shipping");
  params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shipping));
  params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");
  lines.forEach((line, i) => {
    params.set(`line_items[${i}][quantity]`, String(line.qty));
    params.set(`line_items[${i}][price_data][currency]`, "usd");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(line.amount));
    params.set(`line_items[${i}][price_data][product_data][name]`, line.name);
  });

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const session = await stripeRes.json();
  if (!stripeRes.ok) {
    res.status(502).json({ error: session.error && session.error.message ? session.error.message : "Stripe could not start checkout." });
    return;
  }
  res.status(200).json({ url: session.url });
};
