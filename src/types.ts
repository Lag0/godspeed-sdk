import type { z } from "zod";
import type {
  CreateTaskRequestSchema,
  DuplicateListRequestSchema,
  DuplicateListResponseSchema,
  LabelSchema,
  ListSchema,
  ListsResponseSchema,
  ListTasksQuerySchema,
  MetadataSchema,
  SignInRequestSchema,
  SignInResponseSchema,
  TaskLocationSchema,
  TaskResponseSchema,
  TaskSchema,
  TasksResponseSchema,
  TaskStatusSchema,
  UpdateTaskRequestSchema,
} from "./schemas.js";

// ─── Common ───────────────────────────────────────────────────────────────────

export type Metadata = z.infer<typeof MetadataSchema>;
export type Label = z.infer<typeof LabelSchema>;
export type TaskLocation = z.infer<typeof TaskLocationSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type SignInResponse = z.infer<typeof SignInResponseSchema>;

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;
export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
export type TasksResponse = z.infer<typeof TasksResponseSchema>;

// ─── Lists ────────────────────────────────────────────────────────────────────

export type List = z.infer<typeof ListSchema>;
export type ListsResponse = z.infer<typeof ListsResponseSchema>;
export type DuplicateListRequest = z.infer<typeof DuplicateListRequestSchema>;
export type DuplicateListResponse = z.infer<typeof DuplicateListResponseSchema>;

// ─── Client ───────────────────────────────────────────────────────────────────

export interface ClientConfig {
  token: string;
  baseUrl?: string;
}
