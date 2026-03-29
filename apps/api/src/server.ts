import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { env } from "./config/env";
import { tenantMiddleware } from "./middleware/tenant";
import { apiRateLimit } from "./middleware/rate-limit";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(apiRateLimit);
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/billing/webhooks/stripe") {
    return next();
  }

  return express.json({ limit: "1mb" })(req, res, next);
});
app.use(tenantMiddleware);
app.use("/api/v1", routes);

app.listen(env.port, () => {
  console.log(`Kluje API listening on http://localhost:${env.port}`);
});
