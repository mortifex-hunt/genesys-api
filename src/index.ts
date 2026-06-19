import { httpServer, app, io, PORT } from './server.js';
import characterRoutes from './routes/characterRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import weaponRoutes from './routes/weaponRoutes.js';
import criticalInjuryRoutes from './routes/criticalInjuryRoutes.js';
import armorRoutes from './routes/armorRoutes.js';
import { initializeCharacterSockets } from './sockets/characterSocket.js';

// Register REST API routes
app.use('/api/auth', authRoutes);
app.use('/api', characterRoutes);
app.use('/api', adminRoutes);
app.use('/api', weaponRoutes);
app.use('/api', criticalInjuryRoutes);
app.use('/api', armorRoutes);

// Register Socket.io events
initializeCharacterSockets(io);

// Start the server
httpServer.listen(PORT as number, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Genesys RPG Reactive Backend is running!`);
  console.log(`📡 REST API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSockets: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
