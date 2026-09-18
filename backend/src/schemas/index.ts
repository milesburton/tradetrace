import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["reviewer", "tradesman", "admin"]),
  created_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true, created_at: true });

export const TradersmanSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  business_name: z.string().min(1),
  trade_category: z.string().min(1),
  description: z.string().optional(),
  created_at: z.string().datetime(),
});

export type Tradesman = z.infer<typeof TradersmanSchema>;

export const CreateTradersmanSchema = TradersmanSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
});

export const ReviewSchema = z.object({
  id: z.number(),
  tradesman_id: z.number(),
  reviewer_id: z.number(),
  rating: z.number().int().min(1).max(5),
  text: z.string().optional(),
  created_at: z.string().datetime(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const CreateReviewSchema = ReviewSchema.omit({
  id: true,
  created_at: true,
});

export const RelationshipSchema = z.object({
  person1_id: z.number(),
  person2_id: z.number(),
  type: z.enum(["spouse", "friend", "family", "colleague"]),
});

export type Relationship = z.infer<typeof RelationshipSchema>;
