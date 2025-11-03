import { Router, Request, Response } from "express";
import { fme } from "./fmeClient.js";

const router = Router();

// Pass-through for testing: GET /proxy/automations/workflows?limit=10
router.all("/*", async (req: Request, res: Response) => {
  try {
    const path = req.path; // begins with /
    const method = req.method.toLowerCase();
    const isQuery = method === "get" || method === "delete";

    // Axios method indexing needs a cast
    const fn = (fme as any)[method] as Function;

    const r = await (isQuery
      ? fn(path, { params: req.query })
      : fn(path, req.body));

    res.status(r.status).set(r.headers).send(r.data);
  } catch (err: any) {
    res.status(err?.response?.status || 500).send(err?.response?.data || { message: err?.message });
  }
});

export default router;
