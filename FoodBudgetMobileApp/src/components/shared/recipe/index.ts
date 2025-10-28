/**
 * Recipe Components - Barrel Export
 *
 * Co-located VIEW and EDIT components following Kent C. Dodds' Colocation Principle
 *
 * Each file exports both modes:
 * - VIEW mode: Static display components (ViewRecipe*)
 * - EDIT mode: Interactive editable components (EditableRecipe*)
 *
 * Benefits:
 * - Guaranteed spacing/layout consistency between modes
 * - Easier testing of VIEW/EDIT transitions
 * - Shared styles and constants
 * - Semantic cohesion (related code lives together)
 */

// RecipeImage - Image display and picker
export {
  ViewRecipeImage,
  EditableRecipeImage,
  type ViewRecipeImageProps,
  type EditableRecipeImageProps,
} from './RecipeImage';

// RecipeTitle - Recipe title display and editing
export {
  ViewRecipeTitle,
  EditableRecipeTitle,
  type ViewRecipeTitleProps,
  type EditableRecipeTitleProps,
} from './RecipeTitle';

// RecipeInstructions - Cooking instructions display and editing
export {
  ViewRecipeInstructions,
  EditableRecipeInstructions,
  type ViewRecipeInstructionsProps,
  type EditableRecipeInstructionsProps,
} from './RecipeInstructions';

// RecipeCategory - Category chip display and picker
export {
  ViewRecipeCategory,
  EditableRecipeCategory,
  RECIPE_CATEGORIES,
  type ViewRecipeCategoryProps,
  type EditableRecipeCategoryProps,
} from './RecipeCategory';

// RecipeServings - Servings display and stepper
export {
  ViewRecipeServings,
  EditableRecipeServings,
  type ViewRecipeServingsProps,
  type EditableRecipeServingsProps,
} from './RecipeServings';

// RecipeForm - Main form part
export { RecipeForm, type RecipeFormProps, type RecipeFormRef } from './RecipeForm';
