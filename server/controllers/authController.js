import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// --- In-Memory DB (Simulated Persistence) ---
// Key: email, Value: User Object { id, email, passwordHash, username }
const usersDB = new Map();

// --- Validation Schemas (Zod) ---
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain number"),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric only")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

/**
 * Secure Authentication Controller
 */
export const authController = {
  
  /**
   * Register User
   */
  async register(req, res) {
    try {
      const validation = registerSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          status: 'error',
          errors: validation.error.issues.map(e => ({ field: e.path[0] || 'custom', message: e.message }))
        });
      }

      const { email, password, username } = validation.data;

      // Check DB
      if (usersDB.has(email)) {
        return res.status(409).json({ status: 'error', message: 'User already exists.' });
      }

      // Secure Hashing
      const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

      // Persist (In-Memory)
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        username,
        passwordHash: hashedPassword
      };
      usersDB.set(email, newUser);

      console.log(`[AUDIT] User registered: ${email}`);

      return res.status(201).json({
        status: 'success',
        data: {
          id: newUser.id,
          username: newUser.username,
          message: "Registration successful. Please login."
        }
      });

    } catch (error) {
      console.error("[INTERNAL ERROR] Register:", error);
      return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
  },

  /**
   * Login User
   */
  async login(req, res) {
    try {
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
         return res.status(400).json({ status: 'error', message: 'Invalid format.' });
      }

      const { email, password } = validation.data;

      // 1. Find User
      const user = usersDB.get(email);
      if (!user) {
         // Security: Generic message
         return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
      }

      // 2. Verify Password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
         console.warn(`[SECURITY] Failed login attempt for ${email}`);
         return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
      }

      // 3. Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log(`[AUDIT] User logged in: ${email}`);

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
       console.error("[INTERNAL ERROR] Login:", error);
       return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
  }
};
