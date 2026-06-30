import { createServer } from 'node:http';
import { handler } from './build/handler.js';
import { attachWebSocketServer } from './server/index.js';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

const server = createServer(handler);
attachWebSocketServer(server);

server.listen(port, host, () => {
	console.log(`[street_seekr] listening on http://${host}:${port}`);
});
