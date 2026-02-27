import { Router } from 'express';
import { PedidoController } from '../controllers/pedidoController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const pedidoController = new PedidoController();

router.use(authMiddleware);

router.get('/', (req, res) => pedidoController.getAllPedidos(req, res));
router.get('/:id', (req, res) => pedidoController.getPedidoById(req, res));
router.post('/', (req, res) => pedidoController.createPedido(req, res));
router.patch('/:id/status', (req, res) => pedidoController.updatePedidoStatus(req, res));
router.delete('/:id', (req, res) => pedidoController.deletePedido(req, res));

router.post('/:id_pedido/itens', (req, res) => pedidoController.addItemPedido(req, res));
router.patch('/itens/:id', (req, res) => pedidoController.updateItemPedido(req, res));
router.patch('/itens/:id/status', (req, res) => pedidoController.updateItemStatus(req, res));
router.delete('/itens/:id', (req, res) => pedidoController.deleteItemPedido(req, res));
router.get('/pedidos/relatorio', pedidoController.generateReport);
export default router;