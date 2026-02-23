import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import ideaRoutes from './routes/ideas.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
    res.send('QuickReply Innovation Portal API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { prisma };
