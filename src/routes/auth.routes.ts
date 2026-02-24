import { Router } from 'express';
import { signupUser, loginUser, verifyUser, logoutUser } from '../controllers/auth.controllers';
import verifyToken from '../middlewares/verifyToken';

const router = Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/verify', verifyToken, verifyUser);
router.post('/logout', verifyToken, logoutUser);

export default router;
