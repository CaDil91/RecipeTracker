import { Request, Response, NextFunction } from 'express';

export function validateJson(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({ error: 'Request body is required' });
            return;
        }
    }
    next();
}

// Generic validation middleware
export function validateRequired(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const missing = fields.filter(field => !req.body[field]);

        if (missing.length > 0) {
            res.status(400).json({
                error: 'Missing required fields',
                fields: missing
            });
            return;
        }

        next();
    };
}