import { z } from "zod";
import { normalizePhone } from "@/lib/auth/phone";

const phoneSchema = z.string().trim().transform((value, ctx) => {
  if (!value) return "";
  const phone = normalizePhone(value);
  if (!phone) {
    ctx.addIssue({ code: "custom", message: "Enter a valid phone number with country code (or a Saudi mobile number)." });
    return z.NEVER;
  }
  return phone;
}).optional();

const ROLES = ["admin", "real_estate_officer", "sales_officer", "project_manager"] as const;

export const createUserSchema = z.object({
  phone: phoneSchema,
  name: z.string().trim().min(2, "Name is required.").max(160),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(ROLES).default("real_estate_officer"),
});

export const updateUserSchema = z.object({
  phone: phoneSchema,
  name: z.string().trim().min(2, "Name is required.").max(160).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").optional().or(z.literal("")),
});

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    if (!out[path]) out[path] = issue.message;
  }
  return out;
}
