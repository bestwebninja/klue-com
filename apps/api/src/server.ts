import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { env } from "./config/env";
import { tenantMiddleware } from "./middleware/tenant";

const app = express();

app.use(helmet());
app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/billing/webhooks/stripe") {
    return next();
  }

  return express.json()(req, res, next);
});
app.use(tenantMiddleware);
app.use("/api/v1", routes);

app.listen(env.port, () => {
  console.log(`Kluje API listening on http://localhost:${env.port}`);
});
