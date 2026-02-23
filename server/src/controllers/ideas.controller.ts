import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createIdea = async (req: Request, res: Response) => {
    const {
        title, problemStatement, currentWorkaround, proposedSolution,
        category, beneficiaries, expectedImpact, exampleScenario, priority
    } = req.body;
    const ownerId = req.user?.id;

    if (!ownerId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const idea = await prisma.idea.create({
            data: {
                title,
                problemStatement,
                currentWorkaround,
                proposedSolution,
                category,
                beneficiaries: JSON.stringify(beneficiaries),
                expectedImpact: JSON.stringify(expectedImpact),
                exampleScenario,
                priority,
                ownerId,
                status: 'SUBMITTED',
            },
        });

        // Create status history entry
        await prisma.ideaStatusHistory.create({
            data: {
                ideaId: idea.id,
                status: 'SUBMITTED',
                changedBy: ownerId,
                comment: 'Idea submitted',
            },
        });

        res.status(201).json(idea);
    } catch (error) {
        res.status(500).json({ message: 'Error creating idea', error });
    }
};

export const getAllIdeas = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    try {
        const where: any = {};

        // Regular employees can only see their own ideas
        if (role === 'EMPLOYEE') {
            where.ownerId = userId;
        }

        const ideas = await prisma.idea.findMany({
            where,
            include: {
                owner: { select: { name: true, email: true, department: true } },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(ideas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ideas', error });
    }
};

export const getMyIdeas = async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    try {
        const ideas = await prisma.idea.findMany({
            where: { ownerId },
            include: { _count: { select: { comments: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(ideas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your ideas', error });
    }
};

export const getIdeaById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const idea = await prisma.idea.findUnique({
            where: { id: id as string },
            include: {
                owner: { select: { name: true, email: true, department: true } },
                comments: {
                    include: { author: { select: { name: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                statusHistory: {
                    include: { changedByUser: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                scores: true,
            },
        });
        if (!idea) return res.status(404).json({ message: 'Idea not found' });
        res.json(idea);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching idea details', error });
    }
};

export const updateIdeaStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, comment } = req.body;
    const changedBy = req.user?.id;

    if (!changedBy) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const updatedIdea = await prisma.idea.update({
            where: { id: id as string },
            data: { status },
        });

        await prisma.ideaStatusHistory.create({
            data: {
                ideaId: id as string,
                status,
                changedBy,
                comment,
            },
        });

        res.json(updatedIdea);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error });
    }
};

export const deleteIdea = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Delete related records first if not using cascade deletes in prisma
        // Using transactions or sequential deletes
        await prisma.ideaStatusHistory.deleteMany({ where: { ideaId: id as string } });
        await prisma.comment.deleteMany({ where: { ideaId: id as string } });

        await prisma.idea.delete({ where: { id: id as string } });
        res.json({ message: 'Idea deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting idea', error });
    }
};
