import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import healthRouter from "./health.js";
import proxyRouter from "./proxy.js";

const mainRouter = new Router();
mainRouter.use(
  "/health",
  healthRouter.routes(),
  healthRouter.allowedMethods(),
);
mainRouter.use(
  "/",
  proxyRouter.routes(),
  proxyRouter.allowedMethods(),
)

export default mainRouter;
