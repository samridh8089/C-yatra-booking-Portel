import { z } from "zod";

// Safe URL validator ensuring only http and https protocols
export const safeUrlSchema = z
  .string()
  .min(1, "URL is required")
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid HTTP or HTTPS URL (e.g., https://example.com)" }
  );

export const optionalUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:" || val.startsWith("/");
      } catch {
        return val.startsWith("/");
      }
    },
    { message: "Must be a valid URL or relative path" }
  );

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters").max(50),
  slug: z.string().min(2).max(50).optional(),
  icon: z.string().min(1, "Icon identifier is required"),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const portalSchema = z.object({
  id: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  name: z.string().min(2, "Portal name must be at least 2 characters").max(100),
  website_url: safeUrlSchema,
  logo_url: optionalUrlSchema,
  description: z.string().max(255).optional().nullable(),
  internal_notes: z.string().max(1000).optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
