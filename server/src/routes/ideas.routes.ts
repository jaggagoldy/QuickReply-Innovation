import { Router } from 'express';
import { createIdea, getAllIdeas, getMyIdeas, getIdeaById, updateIdeaStatus, deleteIdea } from '../controllers/ideas.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createIdea);
router.get('/', authenticate, getAllIdeas);
router.get('/my', authenticate, getMyIdeas);
router.get('/:id', authenticate, getIdeaById);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'PM', 'REVIEWER', 'SUPER_ADMIN']), updateIdeaStatus);
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), deleteIdea);

export default router;
