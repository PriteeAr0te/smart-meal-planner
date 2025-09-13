import z from "zod";

export const ingredientSchema = z.object({
    name: z.string().trim().min(1, "Ingredient name is required"),
    quantity: z.number().min(0, "Quantity must be non-negative"),
    unit: z.string().trim().optional().default(""),
    note: z.string().trim().optional(),
    isOptional: z.boolean().optional().default(false),
    alternatives: z.array(z.string().trim()).optional().default([]),
  });

  export const stepSchema = z.object({
    order: z.number().min(1, "Step order must start at 1"),
    text: z.string().trim().min(1, "Step description is required"),
    mediaUrls: z.array(z.string().url()).optional().default([]),
    timerSec: z.number().min(0).optional(),
  });

  export const nutritionSchema = z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fats: z.number().min(0).optional(),
  });

  export const createRecipeSchema = z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(2000),
    cuisine: z.string().trim().optional().default(""),
    tags: z.array(z.string().trim()).optional().default([]),
    dietTags: z.array(z.enum(["vegetarian", "vegan", "keto", "paleo", "balanced", "none"])).optional().default(["none"]),
    allergens: z.array(z.string().trim()).optional().default([]),
    ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
    steps: z.array(stepSchema).min(1, "At least one step is required"),
    servings: z.number().min(1).default(2),
    prepTime: z.number().min(0).default(0),
    cookTime: z.number().min(0).default(0),
    nutrition: nutritionSchema.optional().default({}),
    coverImage: z.string().url("Cover image must be a valid URL").optional().default(""),
    images: z.array(z.string().url()).optional().default([]),
    videoUrl: z.string().url().optional(),
    household: z.string().optional(),
    source: z.enum(["user", "ai", "curated"]).optional().default("user"),
    isPublic: z.boolean().optional().default(false),
    status: z.enum(["draft", "published", "archived"]).optional().default("published"),
  });

  export const getRecipesQuerySchema = z.object({
    q: z.string().optional(),
    householdId: z.string().optional(),
    isPublic: z.enum(["true", "false"]).optional(),
    limit: z.string().optional().default("20"),
    page: z.string().optional().default("1"),
  });  