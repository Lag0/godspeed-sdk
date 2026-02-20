import { z } from "zod";

// ─── Common ──────────────────────────────────────────────────────────────────

export const MetadataSchema = z
  .record(z.string(), z.string())
  .refine(
    (m) => JSON.stringify(m).length <= 1024,
    { message: "Metadata must not exceed 1024 characters when stringified" },
  );

export const LabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const SignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SignInResponseSchema = z.object({
  token: z.string(),
  success: z.union([z.boolean(), z.string()]),
  user: z.record(z.string(), z.unknown()).optional(),
});

// ─── Task ─────────────────────────────────────────────────────────────────────

export const TaskLocationSchema = z.enum(["start", "end"]);

export const TaskStatusSchema = z.enum(["incomplete", "complete"]);

export const TaskSchema = z.preprocess(
  (val: any) => {
    if (!val || typeof val !== "object") return val;
    return {
      ...val,
      is_complete: val.is_complete ?? (val.completed_at != null),
      is_cleared: val.is_cleared ?? (val.cleared_at != null),
    };
  },
  z.object({
    id: z.string(),
    title: z.string(),
    notes: z.string().nullable().optional(),
    list_id: z.string().nullable().optional(),
    is_complete: z.boolean().optional().default(false),
    is_cleared: z.boolean().optional().default(false),
    due_at: z.string().nullable().optional(),
  timeless_due_at: z.string().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  timeless_starts_at: z.string().nullable().optional(),
  snoozed_until: z.string().nullable().optional(),
  timeless_snoozed_until: z.string().nullable().optional(),
  duration_minutes: z.number().int().nullable().optional(),
  label_ids: z.array(z.string()).optional(),
  metadata: MetadataSchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}));

export const CreateTaskRequestSchema = z
  .object({
    title: z.string().min(1),
    list_id: z.string().optional(),
    location: TaskLocationSchema.optional(),
    notes: z.string().optional(),
    due_at: z.string().optional(),
    timeless_due_at: z.string().optional(),
    starts_at: z.string().optional(),
    timeless_starts_at: z.string().optional(),
    duration_minutes: z.number().int().positive().optional(),
    label_names: z.array(z.string()).optional(),
    label_ids: z.array(z.string()).optional(),
    metadata: MetadataSchema.optional(),
  })
  .refine(
    (d) => !(d.due_at && d.timeless_due_at),
    { message: "Cannot specify both due_at and timeless_due_at" },
  )
  .refine(
    (d) => !(d.starts_at && d.timeless_starts_at),
    { message: "Cannot specify both starts_at and timeless_starts_at" },
  );

export const UpdateTaskRequestSchema = z
  .object({
    title: z.string().min(1).optional(),
    notes: z.string().optional(),
    due_at: z.string().optional(),
    timeless_due_at: z.string().optional(),
    snoozed_until: z.string().optional(),
    timeless_snoozed_until: z.string().optional(),
    starts_at: z.string().optional(),
    timeless_starts_at: z.string().optional(),
    duration_minutes: z.number().int().positive().optional(),
    is_complete: z.boolean().optional(),
    is_cleared: z.boolean().optional(),
    add_label_names: z.array(z.string()).optional(),
    add_label_ids: z.array(z.string()).optional(),
    remove_label_names: z.array(z.string()).optional(),
    remove_label_ids: z.array(z.string()).optional(),
    metadata: MetadataSchema.optional(),
  })
  .refine(
    (d) => !(d.due_at && d.timeless_due_at),
    { message: "Cannot specify both due_at and timeless_due_at" },
  )
  .refine(
    (d) => !(d.starts_at && d.timeless_starts_at),
    { message: "Cannot specify both starts_at and timeless_starts_at" },
  )
  .refine(
    (d) => !(d.snoozed_until && d.timeless_snoozed_until),
    { message: "Cannot specify both snoozed_until and timeless_snoozed_until" },
  );

export const ListTasksQuerySchema = z.object({
  status: TaskStatusSchema.optional(),
  list_id: z.string().optional(),
  updated_before: z.string().optional(),
  updated_after: z.string().optional(),
});

export const TaskResponseSchema = z.object({
  task: TaskSchema,
});

export const TasksResponseSchema = z.object({
  tasks: z.array(TaskSchema),
  lists: z.array(z.record(z.string(), z.unknown())).optional(),
  labels: z.array(LabelSchema).optional(),
});

// ─── List ─────────────────────────────────────────────────────────────────────

export const ListSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_shared: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const ListsResponseSchema = z.object({
  lists: z.array(ListSchema),
});

export const DuplicateListRequestSchema = z.object({
  name: z.string().optional(),
});

export const DuplicateListResponseSchema = z.object({
  list: ListSchema,
});
