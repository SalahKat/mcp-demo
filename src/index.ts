import "dotenv/config";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import mcpRouter from "./mcpRouter.js";
import proxyRouter from "./proxyRouter.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(morgan("tiny"));

app.get("/healthz", (_req: Request, res: Response) => res.json({ ok: true }));
app.use("/mcp", mcpRouter);
app.use("/proxy", proxyRouter);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MCP-FME listening on :${port}`);
});
