import { Router } from 'express';
import { getAllUsers, updateUserRole } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
const router = Router();

// Only SUPER_ADMIN can manage users
router.get('/', authenticate, authorize(['SUPER_ADMIN']), getAllUsers);
router.patch('/:userId/role', authenticate, authorize(['SUPER_ADMIN']), updateUserRole);

export default router;
