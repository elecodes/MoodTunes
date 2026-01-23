import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { securityMiddleware } from './config/security.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// --- Global Middleware ---
app.use(express.json()); // Parse JSON bodies
app.use(cors({
    origin: 'http://localhost:5173', // Allow Frontend (Vite default)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(securityMiddleware); // Helmet headers

// --- Routes ---
app.use('/api/auth', authRoutes);

// --- Health Check ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Unhandled Errors ---
app.use((err, req, res, next) => {
    console.error("[SERVER ERROR]", err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// --- Start Server ---
app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`🛡️  Environment: ${env.NODE_ENV}`);
});
