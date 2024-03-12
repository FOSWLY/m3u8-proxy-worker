const version = "1.0.0";

function healthResponse() {
  return new Response(
    JSON.stringify({
      status: "ok",
      version
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

addEventListener("fetch", (event) => {
  event.respondWith(respondfetch(event.request));
});

async function respondfetch(request) {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return healthResponse();
    }

    const refererUrl = decodeURIComponent(url.searchParams.get("referer") || "");
    const targetUrl = decodeURIComponent(url.searchParams.get("url") || "");
    const originUrl = decodeURIComponent(url.searchParams.get("origin") || "");
    const proxyAll = decodeURIComponent(url.searchParams.get("all") || "");

    if (!targetUrl) {
      return new Response("Invalid URL", { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Referer: refererUrl || "",
        Origin: originUrl || "",
      },
    });

    let modifiedM3u8;
    if (targetUrl.includes(".m3u8")) {
      modifiedM3u8 = await response.text();
      modifiedM3u8 = modifiedM3u8.replaceAll(/https:\/\/([^.]+).strm.yandex.net/gi, ''); // replacing yandex balancer with emptiness. It may be fixed soon, but it's still working
      const encodedUrl = encodeURIComponent(refererUrl);
      const encodedOrigin = encodeURIComponent(originUrl);
      modifiedM3u8 = modifiedM3u8.split("\n").map((line) => {
        if (line.startsWith("#") || line.trim() == '') {
          return line;
        } else if (proxyAll == 'yes' && line.startsWith('http')){ // https://yourproxy.com/?url=https://somevideo.m3u8&all=yes
          return `${url.origin}?url=${line}`;
        }
        return `?url=${encodedOrigin}${line}${originUrl ? `&origin=${encodedOrigin}` : ""}${refererUrl ? `&referer=${encodedUrl}` : ""}`;
      }).join("\n");
    }

    return new Response(modifiedM3u8 || response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type":
          response.headers?.get("Content-Type") ||
          "application/vnd.apple.mpegurl",
      },
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
