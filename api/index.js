import app from '../backend/server.js';
import serverless from 'serverless-http';


export default serverless(app);