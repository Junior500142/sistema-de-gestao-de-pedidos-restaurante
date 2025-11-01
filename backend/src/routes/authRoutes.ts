import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Rotas públicas
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.createUser(req, res));

// Rotas protegidas (admin only)
router.post('/users', authMiddleware, adminMiddleware, (req, res) => authController.createUser(req, res));

export default router;
