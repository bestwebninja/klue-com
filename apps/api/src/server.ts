import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { env } from "./config/env";
import { tenantMiddleware } from "./middleware/tenant";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(tenantMiddleware);
app.use("/api/v1", routes);

app.listen(env.port, () => {
  console.log(`Kluje API listening on http://localhost:${env.port}`);
});
