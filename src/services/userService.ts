import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
}

class UserService {
  constructor() {
    // Seed an admin user if it doesn't exist
    this.seedAdmin();
  }

  private async seedAdmin() {
    const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!adminExists) {
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash: bcrypt.hashSync('adminpassword', 10),
          role: 'admin',
        }
      });
      console.log('Seeded admin user');
    }
  }

  async register(username: string, passwordRaw: string, role: 'user' | 'admin' = 'user'): Promise<{ user?: Omit<User, 'passwordHash'>, token?: string, error?: string }> {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return { error: 'Username already exists' };
    }

    const passwordHash = bcrypt.hashSync(passwordRaw, 10);
    const userRecord = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
      }
    });
    
    const user: User = { ...userRecord, role: userRecord.role as 'user' | 'admin' };
    const token = this.generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  async login(username: string, passwordRaw: string): Promise<{ user?: Omit<User, 'passwordHash'>, token?: string, error?: string }> {
    const userRecord = await prisma.user.findUnique({ where: { username } });
    if (!userRecord) {
      return { error: 'Invalid credentials' };
    }

    const isValid = bcrypt.compareSync(passwordRaw, userRecord.passwordHash);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    const user: User = { ...userRecord, role: userRecord.role as 'user' | 'admin' };
    const token = this.generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
  
  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return { ...record, role: record.role as 'user' | 'admin' };
  }

  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await prisma.user.findMany();
    return users.map(u => {
      const { passwordHash: _, ...userWithoutPassword } = u;
      return { ...userWithoutPassword, role: u.role as 'user' | 'admin' };
    });
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

export const userService = new UserService();
