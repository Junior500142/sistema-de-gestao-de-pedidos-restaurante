import { Request, Response } from 'express';
import { ProdutoService } from '../services/produtoService';
import { ApiResponse } from '../types';

const produtoService = new ProdutoService();

export class ProdutoController {
  async getAllProdutos(req: Request, res: Response) {
    try {
      const { id_categoria, disponivel } = req.query;
      
      const filtro: any = {};
      if (id_categoria) filtro.id_categoria = parseInt(id_categoria as string);
      if (disponivel !== undefined) filtro.disponivel = disponivel === 'true';
      
      const produtos = await produtoService.getAllProdutos(filtro);
      
      return res.json({
        success: true,
        data: produtos,
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar produtos',
      } as ApiResponse);
    }
  }

  async getProdutoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = await produtoService.getProdutoById(parseInt(id));
      
      if (!produto) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
        } as ApiResponse);
      }
      
      return res.json({
        success: true,
        data: produto,
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar produto',
      } as ApiResponse);
    }
  }
}