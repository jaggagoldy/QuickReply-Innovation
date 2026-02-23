import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    // Prevention: Cannot change own role (to prevent super admin from lock themselves out)
    if (req.user?.id === userId) {
        return res.status(400).json({ message: 'Cannot change your own role' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId as string },
            data: { role },
            select: { id: true, email: true, name: true, role: true },
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error });
    }
};
