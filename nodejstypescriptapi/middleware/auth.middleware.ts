import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    // TODO: Implement authentication
    // For now, just pass through
    next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({ error: 'Authorization token required' });
        return;
    }

    // TODO: Validate token (JWT verification)
    // For now, just check if token exists
    next();
}