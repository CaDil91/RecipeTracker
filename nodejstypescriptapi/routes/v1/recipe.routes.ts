import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateJson, validateRequired } from '../../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/recipe:
 *   get:
 *     summary: Get all recipes
 *     description: Retrieve a list of all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 */
router.get('/', (req, res) => {
    res.json({ message: 'Get all recipes', data: [] });
});

/**
 * @swagger
 * /api/v1/recipe/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     description: Retrieve a specific recipe by its ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.get('/:id', (req, res) => {
    res.json({ message: `Get recipe ${req.params.id}` });
});

/**
 * @swagger
 * /api/v1/recipe:
 *   post:
 *     summary: Create a new recipe
 *     description: Create a new recipe (requires authentication)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - instructions
 *               - servings
 *             properties:
 *               title:
 *                 type: string
 *                 description: Recipe title
 *               instructions:
 *                 type: string
 *                 description: Cooking instructions
 *               servings:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of servings
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Authentication required
 */
router.post(
    '/',
    requireAuth,
    validateJson,
    validateRequired(['title', 'instructions', 'servings']),
    (req, res) => {
        res.status(201).json({ message: 'Recipe created', data: req.body });
    }
);

/**
 * @swagger
 * /api/v1/recipe/{id}:
 *   put:
 *     summary: Update a recipe
 *     description: Update an existing recipe (requires authentication)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - instructions
 *               - servings
 *             properties:
 *               title:
 *                 type: string
 *               instructions:
 *                 type: string
 *               servings:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recipe not found
 */
router.put(
    '/:id',
    requireAuth,
    validateJson,
    validateRequired(['title', 'instructions', 'servings']),
    (req, res) => {
        res.json({ message: `Recipe ${req.params.id} updated` });
    }
);

/**
 * @swagger
 * /api/v1/recipe/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     description: Delete a recipe by ID (requires authentication)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recipe not found
 */
router.delete('/:id', requireAuth, (req, res) => {
    res.json({ message: `Recipe ${req.params.id} deleted` });
});

export { router as recipeRoutes };
