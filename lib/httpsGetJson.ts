import https from "https"

/** Fetches a URL and parses the JSON body. Uses Node's `https` module rather than
 * `fetch` — some third-party hosts (e.g. legacy IIS/ASP.NET servers) are unreliable
 * over undici's HTTP/2 negotiation but work fine over plain HTTP/1.1. */
export function httpsGetJson<T = any>(url: string, headers?: Record<string, string>, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, timeout: timeoutMs }, (res) => {
      let body = ""
      res.on("data", (chunk) => { body += chunk })
      res.on("end", () => {
        try {
          resolve(JSON.parse(body))
        } catch (err) {
          reject(err)
        }
      })
    })
    req.on("timeout", () => { req.destroy(new Error("Request timed out")) })
    req.on("error", reject)
  })
}
