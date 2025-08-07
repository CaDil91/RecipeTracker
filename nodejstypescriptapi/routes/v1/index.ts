import { Router } from 'express';
import { recipeRoutes } from './recipe.routes';

const router = Router();

// Mount v1 routes
router.use('/recipe', recipeRoutes);

export { router as v1Routes };