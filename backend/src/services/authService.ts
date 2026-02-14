import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Usuario, LoginResponse, JWTPayload } from '../types';

const usuarioRepository = new UsuarioRepository();

export class AuthService {
  async login(email: string, senha: string): Promise<LoginResponse> {
    const usuario = await usuarioRepository.findByEmail(email);

    if (!usuario) throw new Error('Usuário não encontrado');

    // Verificar status do usuário
    if (usuario.status === 'pendente') {
      throw new Error('Seu cadastro ainda está pendente de aprovação por um administrador.');
    }
    if (usuario.status === 'bloqueado') {
      throw new Error('Sua conta foi bloqueada. Entre em contato com o administrador.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha || '');
    if (!senhaValida) throw new Error('Senha incorreta');

    const token = this.generateToken(usuario);
    const { senha: _, ...usuarioSemSenha } = usuario;

    return { token, usuario: usuarioSemSenha as Usuario };
  }

  async register(nome: string, email: string, senha: string, tipo_usuario: any): Promise<Usuario> {
    const usuarioExistente = await usuarioRepository.findByEmail(email);
    if (usuarioExistente) throw new Error('Email já cadastrado');

    const senhaHash = await bcrypt.hash(senha, 10);
    return await usuarioRepository.create(nome, email, senhaHash, tipo_usuario);
  }

  async listPendingUsers(): Promise<Usuario[]> {
    return await usuarioRepository.findPending();
  }

  async approveUser(id: number): Promise<void> {
    await usuarioRepository.updateStatus(id, 'ativo');
  }

  async rejectUser(id: number): Promise<void> {
    await usuarioRepository.delete(id);
  }

  private generateToken(usuario: Usuario): string {
    const payload: JWTPayload = {
      id: usuario.id,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    };

    const secret = (process.env.JWT_SECRET || 'sua_chave_secreta_aqui') as Secret;
    const options: SignOptions = { expiresIn: '1d' };

    return jwt.sign(payload, secret, options);
  }
}