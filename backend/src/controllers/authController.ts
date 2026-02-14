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
          error: 'Email e senha são obrigatórios'
        } as ApiResponse);
      }

      const resultado = await authService.login(email, senha);

      return res.json({
        success: true,
        data: resultado
      } as ApiResponse);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Erro ao fazer login'
      } as ApiResponse);
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { nome, email, senha, tipo_usuario } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          success: false,
          error: 'Nome, email e senha são obrigatórios'
        } as ApiResponse);
      }

      const usuario = await authService.register(nome, email, senha, tipo_usuario);

      return res.status(201).json({
        success: true,
        data: {
          message: 'Cadastro realizado com sucesso! Aguarde a aprovação de um administrador.',
          usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        }
      } as ApiResponse);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao realizar cadastro'
      } as ApiResponse);
    }
  }

  async getPendingUsers(req: Request, res: Response) {
    try {
      const users = await authService.listPendingUsers();
      return res.json({
        success: true,
        data: users
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao listar usuários pendentes'
      } as ApiResponse);
    }
  }

  async approveUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await authService.approveUser(Number(id));
      return res.json({
        success: true,
        message: 'Usuário aprovado com sucesso'
      } as ApiResponse);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: 'Erro ao aprovar usuário'
      } as ApiResponse);
    }
  }

  async rejectUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await authService.rejectUser(Number(id));
      return res.json({
        success: true,
        message: 'Usuário rejeitado e removido'
      } as ApiResponse);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: 'Erro ao rejeitar usuário'
      } as ApiResponse);
    }
  }
}