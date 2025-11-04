import { ProdutoRepository } from '../repositories/produtoRepository';
import { Produto } from '../types';

const produtoRepository = new ProdutoRepository();

export class ProdutoService {
  async getAllProdutos(filtro?: { id_categoria?: number; disponivel?: boolean }): Promise<Produto[]> {
    return produtoRepository.findAll(filtro);
  }

  async getProdutoById(id: number): Promise<Produto | null> {
    return produtoRepository.findById(id);
  }
}