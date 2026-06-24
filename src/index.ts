import { httpServer, app, io, PORT } from './server.js';
import characterRoutes from './routes/characterRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import weaponRoutes from './routes/weaponRoutes.js';
import criticalInjuryRoutes from './routes/criticalInjuryRoutes.js';
import armorRoutes from './routes/armorRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import { initializeCharacterSockets } from './sockets/characterSocket.js';

// Health and root check routes for container liveness/readiness
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Genesys RPG API is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register REST API routes
app.use('/api/auth', authRoutes);
app.use('/api', characterRoutes);
app.use('/api', adminRoutes);
app.use('/api', weaponRoutes);
app.use('/api', criticalInjuryRoutes);
app.use('/api', armorRoutes);
app.use('/api', contentRoutes);

// Register Socket.io events
initializeCharacterSockets(io);

// Start the server
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Genesys RPG Reactive Backend is running! `);
  console.log(`📡 REST API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSockets: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
