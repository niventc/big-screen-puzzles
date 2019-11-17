import * as express from 'express';
import * as expressWs from 'express-ws';

import { WordController } from './words/word.controller';
import { WordService } from './words/word.service';
import { SessionController } from './sessions/session.controller';

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
        wss.on('connection', (ws, req, client) => {
            console.log(client);
            console.log(wss.clients);
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

new Server([new WordController(new WordService())], [new SessionController()], 3000).listen();