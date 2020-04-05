import * as express from 'express';
import * as expressWs from 'express-ws';
import * as http from 'http';

import { WordController } from './words/word.controller';
import { WordService } from './words/word.service';
import { SessionController } from './sessions/session.controller';
import { ClientService, WebSocketClient } from './client.service';
import { PlayerConnected } from 'big-screen-puzzles-contract';
import { CosmosDatabaseFactory } from './database/factory';

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
        controllers: Controller[], 
        webSocketControllers: WebSocketController[], 
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
        wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
            const clientId = (<any>req).query['clientId'];
            const player = await this.clientService.addClient(ws, clientId);

            const playerConnected = new PlayerConnected();
            playerConnected.player = player;
            ws.send(JSON.stringify(playerConnected));

            ws.onclose = () => {
                const clientId = (<WebSocketClient><unknown>ws).uuid;
                this.clientService.removeClient(clientId)
                console.log(`Client '${clientId}' disconnected`);
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

CosmosDatabaseFactory.setupDatabase()
    .then(database => {
        const clientService = new ClientService(database);
        const wordService = new WordService();
        new Server(
            clientService,
            [new WordController(wordService)], 
            [new SessionController(clientService, wordService)], 
            process.env.PORT ? parseInt(process.env.PORT) : 3000
        ).listen();
    });
