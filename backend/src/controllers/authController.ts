import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios',
        } as ApiResponse);
      }

      const resultado = await authService.login(email, senha);

      return res.json({
        success: true,
        data: resultado,
      } as ApiResponse);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Erro ao fazer login',
      } as ApiResponse);
    }
  }

  // Agora usamos apenas createUser para registrar/criar usuário
  async createUser(req: Request, res: Response) {
    try {
      const { nome, email, senha, tipo_usuario } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          success: false,
          error: 'Nome, email e senha são obrigatórios',
        } as ApiResponse);
      }

      const usuario = await authService.createUser(
        nome,
        email,
        senha,
        tipo_usuario || 'atendente'
      );

      return res.status(201).json({
        success: true,
        data: usuario,
      } as ApiResponse);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao criar usuário',
      } as ApiResponse);
    }
  }
}
