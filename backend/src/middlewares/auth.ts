import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production');
    req.user = decoded as JWTPayload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
    });
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas administradores podem acessar este recurso.',
    });
  }
  next();
}

export function cozinhaMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.tipo_usuario !== 'cozinha' && req.user.tipo_usuario !== 'admin')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas cozinha e administradores podem acessar este recurso.',
    });
  }
  next();
}
