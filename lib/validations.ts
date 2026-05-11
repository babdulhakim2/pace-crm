import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  agreedToTerms: z.literal(true, { message: "You must agree to the Terms of Use and Privacy Policy" }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const visitItemSchema = z.object({
  svc: z.string().min(1).max(20),
  out: z.string().min(1).max(20),
});

export const addVisitSchema = z.object({
  id: z.string().min(1).max(50),
  bizId: z.string().min(1).max(50),
  date: z.string().min(1),
  via: z.string().min(1).max(20),
  notes: z.string().max(5000).default(""),
  items: z.array(visitItemSchema).min(1),
});

export const addBusinessSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  area: z.string().min(1).max(100),
  contact: z.string().min(1).max(200),
  role: z.string().min(1).max(100),
});

export const updateStageSchema = z.object({
  bizId: z.string().min(1).max(50),
  stage: z.string().min(1).max(20),
});

export const updateBusinessSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  area: z.string().min(1).max(100),
  contact: z.string().min(1).max(200),
  role: z.string().min(1).max(100),
});

export const serviceSchema = z.object({
  code: z.string().min(1).max(20),
  label: z.string().min(1).max(200),
});

export const areaSchema = z.object({
  name: z.string().min(1).max(100),
});

export const userNameSchema = z.object({
  name: z.string().max(20),
});

export const outcomeSchema = z.object({
  code: z.string().min(1).max(6).transform((v) => v.toUpperCase()),
  label: z.string().min(1).max(200),
  dm: z.boolean(),
  sale: z.boolean(),
  tone: z.enum(["muted", "accent", "success", "danger", "warning", "purple", "orange"]),
});
