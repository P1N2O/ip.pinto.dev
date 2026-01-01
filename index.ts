const server = Bun.serve({
  port: process.env.BAR || "3000",

  fetch(req, server) {
    const url = new URL(req.url)
    const format = url.searchParams.get("format")
    const callback = url.searchParams.get("callback") || "callback"

    const ip = req.headers.get("cf-connecting-ip")?.trim() ??
      (req.headers.has("cf-ray") ? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : undefined) ??
      server.requestIP(req)?.address ??
      "unknown"

    const timestamp = new Date().toISOString()

    // DEBUG
    if (process.env.DEBUG !== "false") {
        console.log(`[${timestamp}] ✅ ${req.method} request from ${ip}`)
    }

    // JSON
    if (format === "json") {
      return new Response(`${JSON.stringify({ ip })}\n`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // JSONP
    if (format === "jsonp") {
      return new Response(`${callback}(${JSON.stringify({ ip })});\n`, {
        headers: {
          "Content-Type": "application/javascript",
        },
      })
    }

    // XML
    if (format === "xml") {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<response><ip>${ip}</ip></response>\n`,
        {
          headers: {
            "Content-Type": "application/xml",
          },
        }
      )
    }
      
    // TEXT
      return new Response(`${ip}\n`, {
        headers: {
          "Content-Type": "text/plain",
        },
      })

  },
})

console.log(
  `🚀 Server running at http://${server.hostname}:${server.port}\n`
)
