import app from '../server.js'; // Importas tu app usando import
import serverless from 'serverless-http';

// Exportas la app envuelta para Vercel
export default serverless(app);