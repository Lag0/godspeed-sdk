import { toGodspeedApiError } from "./errors.js";
import type { ClientConfig } from "./types.js";

export interface GodspeedClient {
  get: (path: string, query?: Record<string, string>) => Promise<unknown>;
  post: (path: string, body?: unknown) => Promise<unknown>;
  patch: (path: string, body?: unknown) => Promise<unknown>;
  delete: (path: string) => Promise<void>;
}

const DEFAULT_BASE_URL = "https://api.godspeedapp.com";

export const createClient = (config: ClientConfig): GodspeedClient => {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const headers = {
    "Authorization": `Bearer ${config.token}`,
    "Content-Type": "application/json",
  };

  const buildUrl = (path: string, query?: Record<string, string>): string => {
    const url = new URL(path, baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  };

  const handleResponse = async (response: Response): Promise<unknown> => {
    if (!response.ok) {
      throw await toGodspeedApiError(response);
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined;
    }
    return response.json();
  };

  const get = async (
    path: string,
    query?: Record<string, string>,
  ): Promise<unknown> => {
    const response = await fetch(buildUrl(path, query), {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  };

  const post = async (path: string, body?: unknown): Promise<unknown> => {
    const init: RequestInit = { method: "POST", headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    const response = await fetch(buildUrl(path), init);
    return handleResponse(response);
  };

  const patch = async (path: string, body?: unknown): Promise<unknown> => {
    const init: RequestInit = { method: "PATCH", headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    const response = await fetch(buildUrl(path), init);
    return handleResponse(response);
  };

  const del = async (path: string): Promise<void> => {
    const response = await fetch(buildUrl(path), {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      throw await toGodspeedApiError(response);
    }
  };

  return { get, post, patch, delete: del };
};
