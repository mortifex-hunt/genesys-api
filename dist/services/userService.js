import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
class UserService {
    constructor() {
        // Seed an admin user if it doesn't exist
        this.seedAdmin();
    }
    async seedAdmin() {
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
    async register(username, passwordRaw, role = 'user') {
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
        const user = { ...userRecord, role: userRecord.role };
        const token = this.generateToken(user);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async login(username, passwordRaw) {
        const userRecord = await prisma.user.findUnique({ where: { username } });
        if (!userRecord) {
            return { error: 'Invalid credentials' };
        }
        const isValid = bcrypt.compareSync(passwordRaw, userRecord.passwordHash);
        if (!isValid) {
            return { error: 'Invalid credentials' };
        }
        const user = { ...userRecord, role: userRecord.role };
        const token = this.generateToken(user);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async findById(id) {
        const record = await prisma.user.findUnique({ where: { id } });
        if (!record)
            return null;
        return { ...record, role: record.role };
    }
    async getAllUsers() {
        const users = await prisma.user.findMany();
        return users.map(u => {
            const { passwordHash: _, ...userWithoutPassword } = u;
            return { ...userWithoutPassword, role: u.role };
        });
    }
    generateToken(user) {
        return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    }
}
export const userService = new UserService();
