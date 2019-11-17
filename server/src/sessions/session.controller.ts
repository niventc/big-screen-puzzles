import * as express from 'express';
import { Router } from 'express-ws';
import { WebsocketRequestHandler } from 'express-ws';

import { WebSocketController } from 'src/server';
import { OpenEvent } from 'ws';

export class SessionController implements WebSocketController {

    private path = '/api/sessions';

    constructor() {
    }

    public setup(router: Router): void {
        router.ws(this.path, this.onWebSocket);
    }

    public onWebSocket: WebsocketRequestHandler = (ws, req, next) => {

        // console.log("req", req);

        ws.on('connection', (x, y) => {
            console.log("connected");
        })

        ws.on('message', (message) => {
            console.log(message);
            ws.send(JSON.stringify({message: "hello"}));
        });
    }

}
