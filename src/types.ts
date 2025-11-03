export type Json = any;

export type McpRequest =
  | { jsonrpc: "2.0"; id?: string | number | null; method: "tools/list" }
  | {
      jsonrpc: "2.0";
      id?: string | number | null;
      method: "tools/call";
      params: { name: string; arguments?: Record<string, unknown> };
    };

export type McpResponse =
  | { jsonrpc: "2.0"; id?: string | number | null; result: any }
  | { jsonrpc: "2.0"; id?: string | number | null; error: { code: number; message: string } };

export interface ListWorkflowsArgs {
  enabled?: boolean;
  limit?: number;
  offset?: number;
  ownership?: "Owned" | "Shared";
  tag?: string;
}

export interface TriggerAutomationArgs {
  id: string;
  body?: any; // forwarded as payload, optional per swagger
}

export interface GetJobByIdArgs {
  jobid: number;
}

export interface ListSchedulesArgs {
  category?: string;
  includeAutomations?: "true" | "false";
  limit?: number;
  offset?: number;
  owner?: string;
  sort?: string; // +name, -name, +begin, -begin (per swagger)
}
