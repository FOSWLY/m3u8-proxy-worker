import { Router, Status } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { yandexUserAgent } from "../config.js";

const proxyRouter = new Router()
  .get("/", async (ctx) => {
    const searchParams = ctx.request.url.searchParams;
    const refererUrl = decodeURIComponent(searchParams.get("referer") ?? "");
    const originUrl = decodeURIComponent(searchParams.get("origin") ?? "");
    const proxyAll = decodeURIComponent(searchParams.get("all") ?? "");

    let targetUrl = searchParams.get("url") ?? "";
    if (targetUrl.match(/[^https:]\/\//)) {
      const realPath = targetUrl.split("//")[2];
      targetUrl = `${originUrl}/${realPath}`;
    }

    targetUrl = decodeURIComponent(targetUrl);

    if (!targetUrl) {
      ctx.response.status = Status.BadRequest;
      ctx.response.headers.append("Content-Type", "application/json");
      ctx.response.body = JSON.stringify({
        error: "Invalid URL"
      });
      return;
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          Referer: refererUrl || "",
          Origin: originUrl || "",
          "User-Agent": yandexUserAgent,
        },
      });

      let modifiedM3u8;
      if (targetUrl.includes(".m3u8")) {
        modifiedM3u8 = await response.text();
        const targetUrlTrimmed = `${encodeURIComponent(
          targetUrl.replace(/([^/]+\.m3u8)$/, "").trim()
        )}`;
        const encodedUrl = encodeURIComponent(refererUrl);
        const encodedOrigin = encodeURIComponent(originUrl);
        modifiedM3u8 = modifiedM3u8
          .split("\n")
          .map((line) => {
            if (line.startsWith("#") || line.trim() == '') {
              return line;
            } else if(proxyAll == 'yes' && line.startsWith('http')){ // https://yourproxy.com/?url=https://somevideo.m3u8&all=yes
              return `${ctx.request.url.origin}?url=${line}`;
            }
            return `?url=${targetUrlTrimmed}${line}${originUrl ?`&origin=${encodedOrigin}` : ""}${refererUrl ? `&referer=${encodedUrl}` : ""}${proxyAll ? `&all=${proxyAll}` : ""}`;
          })
          .join("\n");
      }

      ctx.response.status = response.status;
      ctx.response.statusText = response.statusText;
      ctx.response.headers.append("Content-Type", response.headers?.get("Content-Type") || "application/vnd.apple.mpegurl");
      ctx.response.body = modifiedM3u8 || response.body
    } catch (e) {
      ctx.response.status = Status.InternalServerError;
      ctx.response.headers.append("Content-Type", "application/json");
      ctx.response.body = JSON.stringify({
        error: e.message
      });
    }
  });

export default proxyRouter;
