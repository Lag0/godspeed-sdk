import type { ZodError } from "zod";

// ─── Base ─────────────────────────────────────────────────────────────────────

export class GodspeedError extends Error {
  public readonly name: string = "GodspeedError";

  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── API Error ────────────────────────────────────────────────────────────────

export class GodspeedApiError extends GodspeedError {
  public override readonly name: string = "GodspeedApiError";

  public constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`Godspeed API error ${status}: ${statusText}`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Auth Error ───────────────────────────────────────────────────────────────

export class GodspeedAuthError extends GodspeedApiError {
  public override readonly name: string = "GodspeedAuthError";

  public constructor() {
    super(401, "Unauthorized", null);
    this.message = "Authentication failed. Check your GODSPEED_TOKEN.";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Rate Limit Error ─────────────────────────────────────────────────────────

export class GodspeedRateLimitError extends GodspeedApiError {
  public override readonly name: string = "GodspeedRateLimitError";

  public constructor() {
    super(429, "Too Many Requests", null);
    this.message =
      "Rate limit exceeded. Max 10 req/min or 200/hr for reads; 60 req/min or 1000/hr for writes.";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Validation Error ─────────────────────────────────────────────────────────

export class GodspeedValidationError extends GodspeedError {
  public override readonly name: string = "GodspeedValidationError";

  public constructor(
    public readonly zodError: ZodError,
    context?: string,
  ) {
    const prefix = context ? `[${context}] ` : "";
    super(`${prefix}Validation failed: ${zodError.message}`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const toGodspeedApiError = async (
  response: Response,
): Promise<GodspeedAuthError | GodspeedRateLimitError | GodspeedApiError> => {
  if (response.status === 401) {
    return new GodspeedAuthError();
  }
  if (response.status === 429) {
    return new GodspeedRateLimitError();
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = await response.text();
  }
  return new GodspeedApiError(response.status, response.statusText, body);
};
