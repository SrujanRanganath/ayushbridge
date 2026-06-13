import 'dotenv/config';
import mongoose from 'mongoose';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import searchRouter from './routes/search.js';
import mapRouter from './routes/map.js';
import fhirRouter from './routes/fhir.js';
import authRouter from './routes/auth.js';
import { protect } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT ?? 5000;

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Public routes
app.use('/api/v1/auth', authRouter);

// Protected routes
app.use('/api/v1/search', protect, searchRouter);
app.use('/api/v1/map', protect, mapRouter);
app.use('/api/v1/fhir', protect, fhirRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
await connectDB();
app.listen(PORT, () => {
  console.log(`✅  AyushBridge server running on http://localhost:${PORT}`);
});

export default app;