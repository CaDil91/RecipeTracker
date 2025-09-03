/**
 * Core domain models matching C# entities
 */

/**
 * Represents a cooking recipe in the food budget system
 */
export interface Recipe {
  /** Unique identifier for the recipe */
  id: string; // Guid in C#
  
  /** Title of the recipe (required) */
  title: string;
  
  /** Cooking instructions (optional) */
  instructions?: string | null;
  
  /** Number of servings the recipe makes (required, must be greater than zero) */
  servings: number;
  
  /** Date and time when the recipe was created (automatically set) */
  createdAt: string; // DateTime in C# - using ISO string
  
  /** Optional identifier of the user who created this recipe */
  userId?: string | null; // Guid? in C#
}