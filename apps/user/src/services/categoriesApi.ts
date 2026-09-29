import { apiGet } from "@/lib/axios";

export type CategoryType = "CONDITION" | "ESSENTIAL" | "CHRONIC" | "GENERAL";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  iconName?: string;
  badgeText?: string;
  type: CategoryType;
  itemCount?: number;
  featured?: boolean;
}

// Icon inferrer helper based on category name or slug
export function inferIconName(nameOrSlug: string): string {
  const s = nameOrSlug.toLowerCase();
  if (s.includes("fever") || s.includes("temp") || s.includes("flu")) return "Thermometer";
  if (s.includes("cough") || s.includes("cold") || s.includes("respiratory")) return "Stethoscope";
  if (s.includes("acidity") || s.includes("digest") || s.includes("gastro")) return "Zap";
  if (s.includes("pain") || s.includes("analgesic")) return "Activity";
  if (s.includes("diabet") || s.includes("sugar") || s.includes("insulin")) return "Syringe";
  if (s.includes("heart") || s.includes("cardiac")) return "Heart";
  if (s.includes("blood") || s.includes("pressure") || s.includes("hypertension")) return "ShieldAlert";
  if (s.includes("kidney") || s.includes("liver") || s.includes("renal")) return "Droplet";
  if (s.includes("baby") || s.includes("mother") || s.includes("pediatric")) return "Baby";
  if (s.includes("skin") || s.includes("derma") || s.includes("hair")) return "UserCheck";
  if (s.includes("vitamin") || s.includes("supplement") || s.includes("personal")) return "Sparkles";
  return "Pill";
}

// Category type inferrer helper
export function inferCategoryType(nameOrSlug: string): CategoryType {
  const s = nameOrSlug.toLowerCase();
  if (s.includes("fever") || s.includes("cough") || s.includes("pain") || s.includes("acidity") || s.includes("cold")) {
    return "CONDITION";
  }
  if (s.includes("diabet") || s.includes("heart") || s.includes("blood") || s.includes("kidney") || s.includes("liver")) {
    return "CHRONIC";
  }
  if (s.includes("baby") || s.includes("skin") || s.includes("first aid") || s.includes("essential")) {
    return "ESSENTIAL";
  }
  return "GENERAL";
}

export async function getCategories(): Promise<Category[]> {
  try {
    // 1. Try active in-stock categories endpoint first
    const activeRes = await apiGet<{ success: boolean; categories: Category[] }>(
      "/api/customer/v1/categories/active-in-stock"
    );

    if (activeRes && activeRes.success && Array.isArray(activeRes.categories) && activeRes.categories.length > 0) {
      return activeRes.categories.map((c) => ({
        id: c.id || c.slug,
        slug: c.slug,
        name: c.name,
        description: c.description || "Active in-stock medicines & healthcare products",
        iconName: c.iconName || inferIconName(c.name || c.slug),
        badgeText: c.badgeText || (c.itemCount && c.itemCount > 10 ? "Popular" : "In Stock"),
        type: c.type || inferCategoryType(c.name || c.slug),
        itemCount: c.itemCount || 0,
        featured: c.featured ?? true,
      }));
    }
  } catch (err) {
    console.warn("Active in-stock categories endpoint query skipped/failed, trying primary endpoint:", err);
  }

  try {
    // 2. Fall back to standard active categories endpoint
    const res = await apiGet<{ success: boolean; categories: Category[] }>(
      "/api/customer/v1/categories"
    );

    if (res && res.success && Array.isArray(res.categories) && res.categories.length > 0) {
      return res.categories.map((c) => ({
        id: c.id || (c as unknown as { _id?: string })._id || c.slug,
        slug: c.slug,
        name: c.name,
        description: c.description || "Healthcare & remedy category",
        iconName: c.iconName || inferIconName(c.name || c.slug),
        badgeText: c.badgeText || "Available",
        type: c.type || inferCategoryType(c.name || c.slug),
        itemCount: c.itemCount || 0,
        featured: c.featured ?? true,
      }));
    }
  } catch (err) {
    console.error("Failed to load categories from backend:", err);
  }

  return [];
}
