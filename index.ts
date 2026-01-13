const server = Bun.serve({
  port: process.env.PORT || "3000",

  fetch(req, server) {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || url.searchParams.get("fmt") || url.pathname.split(".")[1] || "text";
    const callback = url.searchParams.get("callback") || url.searchParams.get("cb") || "callback";
    const isGeo = url.pathname !== "/";

    const ip = req.headers.get("cf-connecting-ipv6") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") ||
      server.requestIP(req)?.address || "localhost";

    const country = req.headers.get("cf-ipcountry") || undefined;
    const asRegion = req.headers.get("cf-ray")?.split("-")[1] || undefined;
    const geo = isGeo? {
        flag: country && getFlag(country),
        continent: req.headers.get("cf-ipcontinent") || undefined,
        country,
        region: req.headers.get("cf-region") || undefined,
        regionCode: req.headers.get("cf-region-code") || undefined,
        city: req.headers.get("cf-ipcity") || undefined,
        postalCode: req.headers.get("cf-postal-code") || undefined,
        latitude: req.headers.get("cf-iplatitude") || undefined,
        longitude: req.headers.get("cf-iplongitude") || undefined,
        timezone: req.headers.get("cf-timezone") || undefined,
        asRegion,
        asn: req.headers.get("x-asn") || undefined,
        asOrganization: req.headers.get("cf-asorganization") || undefined,
        userAgent: req.headers.get("user-agent") || undefined
      } : undefined;

    const payload = { ip, ...geo };

    const timestamp = new Date().toISOString();

    // DEBUG
    if (process.env.DEBUG !== "false") {
      console.log(`[${timestamp}] ✅ ${req.method} request from ${ip}`);
    }

    const commonHeaders = {
      "Connection": "keep-alive",
      "Keep-Alive": "timeout=5, max=1000",
      "Access-Control-Allow-Origin": "*",
      "X-Powered-By": `${process.env.POWERED_BY || req.headers.get("host")}`,
      "X-Client-IP": ip,
    };

    // JSON
    if (format === "json") {
      return new Response(`${JSON.stringify(payload)}\n`, { headers: { ...commonHeaders, "Content-Type": "application/json" } });
    }

    // JSONP
    if (format === "jsonp") {
      return new Response(`${callback}(${JSON.stringify(payload)});\n`, { headers: { ...commonHeaders, "Content-Type": "application/javascript" } });
    }

    // XML
    if (format === "xml") {
      return new Response(serializeXML(payload), { headers: { ...commonHeaders, "Content-Type": "application/xml" } });
    }

    // TEXT
    return new Response(serializeText(payload), { headers: { ...commonHeaders, "Content-Type": "text/plain" } });

  },
});

console.log(`🚀 Server running at http://${server.hostname}:${server.port}\n`);

// --- Utils ---
// -------------

const FLAG_UNICODE_POSITION = 127397;
//  Get Country Flag
export function getFlag(countryCode: string) {
  const regex = new RegExp("^[A-Z]{2}$").test(countryCode);
  if (!countryCode || !regex) return undefined;
  try {
    return String.fromCodePoint(
      ...countryCode.split("").map((char) =>
        FLAG_UNICODE_POSITION + char.charCodeAt(0)
      ),
    );
  } catch (error) {
    return undefined;
  }
}

// Serialize Text
function serializeText(payload: Record<string, unknown>): string {
  const entries = Object.entries(payload).filter(
    ([, value]) => value != null,
  );

  if (entries.length === 1) {
    const [, value] = entries[0]!;
    return `${String(value)}\n`;
  }

  const sorted = entries.sort(([a], [b]) =>
    a === "ip" ? -1 : b === "ip" ? 1 : 0,
  );

  let out = "";
  for (const [key, value] of sorted) {
    out += `${key}: ${value}\n`;
  }

  return out;
}

// Serialize XML
function serializeXML(payload: Record<string, unknown>): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<response>`;

  for (const [key, value] of Object.entries(payload)) {
    if (value == null) continue;

    xml += `\n  <${key}>${Bun.escapeHTML(String(value))}</${key}>`;
  }

  xml += `\n</response>\n`;
  return xml;
}
