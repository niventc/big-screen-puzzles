import * as express from 'express';

import { WordController } from './words/word.controller';
import { WordService } from './words/word.service';

export interface Controller {
    router: express.Router;
}

class Server {
    public app: express.Application;

    constructor(
        controllers: Controller[], 
        private port: number
    ) {
        this.app = express();

        this.initializeControllers(controllers);
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

new Server([new WordController(new WordService())], 3000).listen();