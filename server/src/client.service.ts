import { v4 as uuidv4 } from 'uuid';

export declare class WebSocketClient extends WebSocket {
    uuid: string;
}

export class ClientService {

    private clients = new Map<string, WebSocketClient>();

    public addClient(client: WebSocket): string {
        const webSocketClient = client as WebSocketClient;
        const uuid = uuidv4();
        webSocketClient.uuid = uuid;
        this.clients.set(uuid, webSocketClient);
        console.log(`Added client with uuid ${uuid}`);
        return uuid;
    }

    public getClient(uuid: string): WebSocketClient {
        return this.clients.get(uuid);
    }

    public removeClient(uuid: string): void {
        this.clients.delete(uuid);
    }

}