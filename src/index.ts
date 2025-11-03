import { Router } from "express";
import { fme } from "./fmeClient.js";

const router = Router();

// Pass-through for testing: GET /proxy/automations/workflows?limit=10
router.all("/*", async (req, res) => {
  try {
    const path = req.path; // begins with /
    const method = req.method.toLowerCase();
    const r = await (fme as any)[method](path, ["get","delete"].includes(method) ? { params: req.query } : req.body);
    res.status(r.status).set(r.headers).send(r.data);
  } catch (err: any) {
    res.status(err?.response?.status || 500).send(err?.response?.data || { message: err.message });
  }
});

export default router;
