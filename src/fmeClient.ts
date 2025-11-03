import axios, { AxiosInstance } from "axios";

const FME_BASE_URL = process.env.FME_BASE_URL!;
const FME_TOKEN = process.env.FME_TOKEN!;
const HTTP_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS || 20000);

if (!FME_BASE_URL || !FME_TOKEN) {
  throw new Error("FME_BASE_URL and FME_TOKEN are required env vars.");
}

export const fme: AxiosInstance = axios.create({
  baseURL: FME_BASE_URL.replace(/\/+$/, ""), // no trailing slash
  timeout: HTTP_TIMEOUT_MS,
  headers: {
    // FME Flow token style
    Authorization: `fmetoken token=${FME_TOKEN}`,
    "Content-Type": "application/json"
  }
});

// Helpers
export function ok<T>(data: T) {
  return { ok: true, data };
}
export function fail(status: number, message: string) {
  const e: any = new Error(message);
  e.status = status;
  return e;
}
