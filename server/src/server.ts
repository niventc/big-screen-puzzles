import * as express from 'express';
import * as expressWs from 'express-ws';
import * as http from 'http';

import { WordController } from './words/word.controller';
import { WordService } from './words/word.service';
import { SessionController } from './sessions/session.controller';
import { ClientService } from './client.service';
import { PlayerConnected } from 'big-screen-puzzles-contract';

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
        wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
            const clientId = (<any>req).query['clientId'];
            const player = clientService.addClient(ws, clientId);

            const playerConnected = new PlayerConnected();
            playerConnected.player = player;
            ws.send(JSON.stringify(playerConnected));

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
            console.log(`Listening on port ${this.port}`);
        });
    }
}

const clientService = new ClientService();
const wordService = new WordService();
new Server(
    clientService,
    [new WordController(wordService)], 
    [new SessionController(clientService, wordService)], 
    process.env.PORT ? parseInt(process.env.PORT) : 3000
).listen();