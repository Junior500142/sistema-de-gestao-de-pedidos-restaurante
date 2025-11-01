import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pedidoRoutes from './routes/pedidoRoutes';

dotenv.config();

const app: Express = express();

// Middlewares
// --- CORREÇÃO DO CORS AQUI ---
const allowedOrigins = [
  'http://localhost:3000', // Acesso pelo navegador
  'http://backend:3000',   // Acesso interno do container web
];

app.use(cors({
  origin: (origin, callback ) => {
    // Permite requisições sem 'origin' (como apps mobile ou curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
// --- FIM DA CORREÇÃO DO CORS ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Tratamento de rotas não encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
  });
});

export default app;
