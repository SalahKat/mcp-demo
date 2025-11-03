import { Router, Request, Response } from "express";
import { fme } from "./fmeClient.js";
import { McpRequest, McpResponse } from "./types.js";

// Simple auth middleware for MCP endpoint
function requireMcpAuth(req: Request, res: Response, next: Function) {
  const auth = req.headers.authorization || "";
  const expected = `Bearer ${process.env.MCP_API_KEY}`;
  if (auth !== expected) {
    return res
      .status(401)
      .json({ jsonrpc: "2.0", error: { code: -32600, message: "Unauthorized" } });
  }
  next();
}

const router = Router();
router.post("/", requireMcpAuth, async (req: Request, res: Response) => {
  const payload = req.body as McpRequest;
  const id = (payload as any)?.id ?? null;

  try {
    if (payload.method === "tools/list") {
      // Advertise 5 tools
      const result = {
        tools: [
          {
            name: "list_automations_workflows",
            description:
              "List automation workflows. Optional filters: enabled(bool), limit, offset, ownership('Owned'|'Shared'), tag(string).",
            inputSchema: {
              type: "object",
              properties: {
                enabled: { type: "boolean" },
                limit: { type: "number" },
                offset: { type: "number" },
                ownership: { type: "string", enum: ["Owned", "Shared"] },
                tag: { type: "string" }
              }
            }
          },
          {
            name: "list_automations_tags",
            description: "List automation workflow tags.",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "trigger_automation",
            description: "Trigger the Manual node for an enabled automation workflow by ID.",
            inputSchema: {
              type: "object",
              required: ["id"],
              properties: {
                id: { type: "string" },
                body: { type: "object" }
              }
            }
          },
          {
            name: "get_job_by_id",
            description: "Retrieve a job by numeric ID.",
            inputSchema: {
              type: "object",
              required: ["jobid"],
              properties: { jobid: { type: "number" } }
            }
          },
          {
            name: "list_schedules",
            description:
              "List schedules. Optional filters: category, includeAutomations ('true'|'false'), limit, offset, owner, sort.",
            inputSchema: {
              type: "object",
              properties: {
                category: { type: "string" },
                includeAutomations: { type: "string", enum: ["true", "false"] },
                limit: { type: "number" },
                offset: { type: "number" },
                owner: { type: "string" },
                sort: { type: "string" }
              }
            }
          }
        ]
      };
      const resp: McpResponse = { jsonrpc: "2.0", id, result };
      return res.json(resp);
    }

    if (payload.method === "tools/call") {
      const { name, arguments: args = {} } = (payload as any).params || {};
      let result: any;

      switch (name) {
        case "list_automations_workflows": {
          // maps to GET /automations/workflows with filters
          const { enabled, limit, offset, ownership, tag } = args as any;
          const r = await fme.get("/automations/workflows", {
            params: { enabled, limit, offset, ownership, tag }
          });
          result = r.data;
          break;
        }

        case "list_automations_tags": {
          const r = await fme.get("/automations/workflows/tags");
          result = r.data;
          break;
        }

        case "trigger_automation": {
          const { id, body } = args as any;
          if (!id) throw new Error("id is required");
          const r = await fme.post(`/automations/workflows/${encodeURIComponent(id)}/trigger`, body ?? "");
          // returns 202 on success per docs – no body required
          result = { status: r.status, statusText: r.statusText };
          break;
        }

        case "get_job_by_id": {
          const { jobid } = args as any;
          if (typeof jobid !== "number") throw new Error("jobid (number) is required");
          const r = await fme.get(`/transformations/jobs/id/${jobid}`);
          result = r.data;
          break;
        }

        case "list_schedules": {
          const { category, includeAutomations, limit, offset, owner, sort } = args as any;
          const r = await fme.get("/schedules", {
            params: { category, includeAutomations, limit, offset, owner, sort }
          });
          result = r.data;
          break;
        }

        default:
          return res.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Unknown tool: ${name}` }
          });
      }

      const resp: McpResponse = { jsonrpc: "2.0", id, result: { content: [{ type: "json", json: result }] } };
      return res.json(resp);
    }

    // Unknown method
    return res.json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Unknown method" } });
  } catch (err: any) {
    // bubble FME errors
    const status = err?.response?.status || 500;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error?.message ||
      err?.message ||
      "Internal error";
    return res.status(200).json({ jsonrpc: "2.0", id, error: { code: -32000 - status, message } });
  }
});

export default router;
