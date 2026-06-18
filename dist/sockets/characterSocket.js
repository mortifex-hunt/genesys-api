import jwt from 'jsonwebtoken';
import { characterService } from '../services/characterService.js';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
export function initializeCharacterSockets(io) {
    // Socket.io Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error: Invalid token'));
            }
            socket.user = decoded;
            next();
        });
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`Socket client connected: ${socket.id}, user: ${user.username}`);
        // Join a specific character room
        socket.on('join-character', async (characterId) => {
            const character = await characterService.get(characterId);
            if (!character)
                return;
            // Access control
            if (user.role !== 'admin' && character.userId !== user.id) {
                socket.emit('error', { message: 'Access denied to this character' });
                return;
            }
            socket.join(`character:${characterId}`);
            console.log(`Socket ${socket.id} joined room: character:${characterId}`);
            socket.emit('character-state', character);
        });
        // Leave a specific character room
        socket.on('leave-character', (characterId) => {
            socket.leave(`character:${characterId}`);
            console.log(`Socket ${socket.id} left room: character:${characterId}`);
        });
        // Listen for real-time character changes
        socket.on('update-character', async (data) => {
            if (!data.id)
                return;
            const existing = await characterService.get(data.id);
            if (existing && user.role !== 'admin' && existing.userId !== user.id) {
                socket.emit('error', { message: 'Access denied to edit this character' });
                return;
            }
            // Update the state in memory
            const updatedCharacter = await characterService.createOrUpdate({
                id: data.id,
                characterName: data.characterName,
                speciesArchetype: data.speciesArchetype,
                career: data.career,
                player: data.player,
                soakValue: data.soakValue,
                woundsThreshold: data.woundsThreshold,
                woundsCurrent: data.woundsCurrent,
                strainThreshold: data.strainThreshold,
                strainCurrent: data.strainCurrent,
                defenseRanged: data.defenseRanged,
                defenseMelee: data.defenseMelee,
                skills: data.skills,
                weapons: data.weapons,
                motivations: data.motivations,
                description: data.description,
                equipment: data.equipment,
                notes: data.notes,
                criticalInjuries: data.criticalInjuries,
                talents: data.talents,
                lastUpdatedBy: socket.id,
                userId: existing?.userId || user.id
            });
            // Broadcast the update to everyone else in the room
            const roomName = `character:${data.id}`;
            socket.to(roomName).emit('character-updated', updatedCharacter);
            console.log(`Character ${data.id} updated by ${socket.id}. Broadcast to room ${roomName}.`);
        });
        socket.on('disconnect', () => {
            console.log(`Socket client disconnected: ${socket.id}`);
        });
    });
}
