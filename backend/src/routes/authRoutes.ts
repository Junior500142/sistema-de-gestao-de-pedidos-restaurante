import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Rotas públicas
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));

// Rotas protegidas (admin only)
router.get('/pending-users', authMiddleware, adminMiddleware, (req, res) => authController.getPendingUsers(req, res));
router.patch('/approve-user/:id', authMiddleware, adminMiddleware, (req, res) => authController.approveUser(req, res));
router.delete('/reject-user/:id', authMiddleware, adminMiddleware, (req, res) => authController.rejectUser(req, res));

export default router;
