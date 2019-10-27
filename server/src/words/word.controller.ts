import * as express from 'express';
import { Controller } from 'src/server';
import { WordService } from './word.service';

export class WordController implements Controller {

    private path = '/api/words';
    public router = express.Router(); 

    constructor(
        private wordService: WordService
    ) {
        this.router.get(this.path, this.getWord.bind(this));
    }

    public getWord(request: express.Request, response: express.Response): void {
        response.send(this.wordService.findWord(request.query["word"]));
    }

}
