import { ZodError } from "zod";
import type { GodspeedClient } from "./client.js";
import { GodspeedValidationError } from "./errors.js";
import {
  CreateTaskRequestSchema,
  DuplicateListRequestSchema,
  DuplicateListResponseSchema,
  ListsResponseSchema,
  ListTasksQuerySchema,
  SignInRequestSchema,
  SignInResponseSchema,
  TaskResponseSchema,
  TasksResponseSchema,
  UpdateTaskRequestSchema,
} from "./schemas.js";
import type {
  CreateTaskRequest,
  DuplicateListRequest,
  DuplicateListResponse,
  List,
  ListsResponse,
  ListTasksQuery,
  SignInRequest,
  SignInResponse,
  Task,
  TaskResponse,
  TasksResponse,
  UpdateTaskRequest,
} from "./types.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseOrThrow = <T>(
  schema: { parse: (data: unknown) => T },
  data: unknown,
  context: string,
): T => {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new GodspeedValidationError(err, context);
    }
    throw err;
  }
};

const toStringRecord = (
  obj: Record<string, string | undefined>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signIn = async (
  client: GodspeedClient,
  request: SignInRequest,
): Promise<SignInResponse> => {
  const body = parseOrThrow(SignInRequestSchema, request, "signIn:request");
  const raw = await client.post("/sessions/sign_in", body);
  return parseOrThrow(SignInResponseSchema, raw, "signIn:response");
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const createTask = async (
  client: GodspeedClient,
  request: CreateTaskRequest,
): Promise<Task> => {
  const body = parseOrThrow(
    CreateTaskRequestSchema,
    request,
    "createTask:request",
  );
  const raw = await client.post("/tasks", body);
  const parsed = parseOrThrow(TaskResponseSchema, raw, "createTask:response");
  return parsed.task;
};

export const listTasks = async (
  client: GodspeedClient,
  query?: ListTasksQuery,
): Promise<TasksResponse> => {
  const validQuery = query
    ? parseOrThrow(ListTasksQuerySchema, query, "listTasks:query")
    : undefined;

  const queryParams = validQuery
    ? toStringRecord({
        status: validQuery.status,
        list_id: validQuery.list_id,
        updated_before: validQuery.updated_before,
        updated_after: validQuery.updated_after,
      })
    : undefined;

  const raw = await client.get("/tasks", queryParams);
  return parseOrThrow(TasksResponseSchema, raw, "listTasks:response");
};

export const getTask = async (
  client: GodspeedClient,
  taskId: string,
): Promise<Task> => {
  const raw = await client.get(`/tasks/${taskId}`);
  const parsed = parseOrThrow(TaskResponseSchema, raw, "getTask:response");
  return parsed.task;
};

export const updateTask = async (
  client: GodspeedClient,
  taskId: string,
  request: UpdateTaskRequest,
): Promise<Task> => {
  const body = parseOrThrow(
    UpdateTaskRequestSchema,
    request,
    "updateTask:request",
  );
  const raw = await client.patch(`/tasks/${taskId}`, body);
  const parsed = parseOrThrow(TaskResponseSchema, raw, "updateTask:response");
  return parsed.task;
};

export const deleteTask = async (
  client: GodspeedClient,
  taskId: string,
): Promise<void> => {
  await client.delete(`/tasks/${taskId}`);
};

// ─── Lists ────────────────────────────────────────────────────────────────────

export const listLists = async (
  client: GodspeedClient,
): Promise<ListsResponse> => {
  const raw = await client.get("/lists");
  return parseOrThrow(ListsResponseSchema, raw, "listLists:response");
};

export const duplicateList = async (
  client: GodspeedClient,
  listId: string,
  request?: DuplicateListRequest,
): Promise<DuplicateListResponse> => {
  const body = request
    ? parseOrThrow(
        DuplicateListRequestSchema,
        request,
        "duplicateList:request",
      )
    : undefined;
  const raw = await client.post(`/lists/${listId}/duplicate`, body);
  return parseOrThrow(
    DuplicateListResponseSchema,
    raw,
    "duplicateList:response",
  );
};
