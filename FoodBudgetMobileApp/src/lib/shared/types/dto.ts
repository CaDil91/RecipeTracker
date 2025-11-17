/**
 * Data Transfer Objects (DTOs) matching C# API models
 */

/**
 * Request DTO for creating or updating a recipe
 */
export interface RecipeRequestDto {
  /** Recipe title (required, max 200 characters) */
  title: string;

  /** Cooking instructions (optional, max 5000 characters) */
  instructions?: string | null;

  /** Number of servings (required, 1-100 range) */
  servings: number;

  /** Recipe category (optional, max 100 characters) */
  category?: string | null;

  /** Image URL for the recipe (optional, must be valid URL) */
  imageUrl?: string | null;
}

/**
 * Response DTO for recipe data from API
 */
export interface RecipeResponseDto {
  /** Unique identifier */
  id: string;

  /** Recipe title */
  title: string;

  /** Cooking instructions */
  instructions?: string | null;

  /** Number of servings */
  servings: number;

  /** Recipe category */
  category?: string | null;

  /** Image URL for the recipe */
  imageUrl?: string | null;

  /** Creation timestamp */
  createdAt: string;

  /** User ID who created the recipe (required for security) */
  userId: string;
}

/**
 * Request DTO for generating an image upload token
 */
export interface ImageUploadTokenRequestDto {
  /** The original file name with extension (e.g., "photo.jpg") */
  fileName: string;

  /** The MIME type of the file (e.g., "image/jpeg", "image/png") */
  contentType: string;

  /** The size of the file in bytes (max 10MB = 10,485,760 bytes) */
  fileSizeBytes: number;
}

/**
 * Response DTO for image upload token
 */
export interface ImageUploadTokenResponseDto {
  /** SAS URL for uploading the image to Azure Blob Storage */
  uploadUrl: string;

  /** Public URL to use after a successful upload */
  publicUrl: string;

  /** Expiration timestamp of the upload token (ISO 8601 format) */
  expiresAt: string;
}

/**
 * RFC 9457 Problem Details for error responses
 */
export interface ProblemDetails {
  /** A URI reference that identifies the problem type */
  type?: string;
  
  /** A short, human-readable summary of the problem type */
  title?: string;
  
  /** The HTTP status code */
  status?: number;
  
  /** A human-readable explanation specific to this occurrence */
  detail?: string;
  
  /** A URI reference that identifies the specific occurrence */
  instance?: string;
  
  /** Additional problem-specific extensions */
  [key: string]: any;
}