const host = "0.0.0.0"; // 0.0.0.0 - for global access, localhost - for local access
const port = 7699;
const version = "1.0.0";
const isSupportHTTPS = true;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const yandexUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 YaBrowser/23.7.1.1140 Yowser/2.5 Safari/537.36";

export { corsHeaders, version, host, port, isSupportHTTPS, yandexUserAgent };
