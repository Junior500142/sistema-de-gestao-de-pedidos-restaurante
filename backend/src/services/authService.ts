import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { Usuario, LoginResponse, JWTPayload } from '../types';

const usuarioRepository = new UsuarioRepository();

export class AuthService {
  async login(email: string, senha: string): Promise<LoginResponse> {
    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario) throw new Error('Usuário não encontrado');

    const senhaValida = await bcrypt.compare(senha, usuario.senha || '');
    if (!senhaValida) throw new Error('Senha incorreta');

    const token = this.generateToken(usuario);
    const { senha: _, ...usuarioSemSenha } = usuario;

    return { token, usuario: usuarioSemSenha };
  }

  async createUser(
    nome: string,
    email: string,
    senha: string,
    tipo_usuario: 'atendente' | 'cozinha' | 'admin' = 'atendente'
  ): Promise<Usuario> {
    const usuarioExistente = await usuarioRepository.findByEmail(email);
    if (usuarioExistente) throw new Error('Email já cadastrado');

    const senhaHash = await bcrypt.hash(senha, 10);
    return await usuarioRepository.create(nome, email, senhaHash, tipo_usuario);
  }

  private generateToken(usuario: Usuario): string {
  const payload: JWTPayload = {
    id: usuario.id,
    email: usuario.email,
    tipo_usuario: usuario.tipo_usuario,
  };

  const secret: Secret = process.env.JWT_SECRET || 'default_secret';

  // 🔧 converte para tipo aceito explicitamente
  const expiresIn: jwt.SignOptions['expiresIn'] =
    (process.env.JWT_EXPIRATION as jwt.SignOptions['expiresIn']) || '24h';

  const options: jwt.SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
}

}
