import * as express from 'express';
import * as expressWs from 'express-ws';
import { v4 as uuidv4 } from 'uuid';

import { WordController } from './words/word.controller';
import { WordService } from './words/word.service';
import { SessionController } from './sessions/session.controller';
import { ClientService } from './client.service';
import { ClientConnected } from 'big-screen-puzzles-contract';

export interface Controller {
    router: express.Router;
}

export interface WebSocketController {
    setup(router: expressWs.Router): void;
}

class Server {
    public app: express.Application;
    private wsInstance: expressWs.Instance;

    constructor(
        private clientService: ClientService,
        private controllers: Controller[], 
        private webSocketControllers: WebSocketController[], 
        private port: number
    ) {
        const app = express();

        this.wsInstance = expressWs(app);
        this.app = this.wsInstance.app;

        this.initializeControllers(controllers);
        this.initializeWebSocketControllers(webSocketControllers);
    }

    private initializeWebSocketControllers(controllers: WebSocketController[]): void {
        controllers.forEach(controller => {
            const router = express.Router();
            this.wsInstance.applyTo(router);

            controller.setup(router);

            this.app.use('/', router);
        });

        const wss = this.wsInstance.getWss();
        wss.on('connection', (ws: WebSocket, req, client) => {
            const uuid = clientService.addClient(ws);

            const clientConnected = new ClientConnected();
            clientConnected.clientId = uuid;
            ws.send(JSON.stringify(clientConnected));

            ws.onopen = (e) => {
                // console.log(e);
            }

            ws.onclose = (e) => {
                // console.log(e);
            }
        })
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach(controller => {
            this.app.use('/', controller.router);
        });
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log('Listening on port 3000');
        });
    }
}

const clientService = new ClientService();
const wordService = new WordService();
new Server(
    clientService,
    [new WordController(wordService)], 
    [new SessionController(clientService, wordService)], 
    3000
).listen();