import { v4 as uuidv4 } from 'uuid';
import { Player } from 'big-screen-puzzles-contract';

export declare class WebSocketClient extends WebSocket {
    uuid: string;
}

export class ClientService {

    private clients = new Map<string, WebSocketClient>();
    private clientPlayers = new Map<string, Player>();

    public addClient(client: WebSocket, clientId: string): Player {
        const webSocketClient = client as WebSocketClient;
        if (!clientId) {
            clientId = uuidv4();
        }
        webSocketClient.uuid = clientId;
        this.clients.set(clientId, webSocketClient);

        let player = this.clientPlayers.get(clientId);
        if (!player) {
            player = new Player();
            player.id = clientId;
            this.clientPlayers.set(clientId, player);
        }

        console.log(`Added client/player`, player);
        return player;
    }

    public getClient(clientId: string): WebSocketClient {
        return this.clients.get(clientId);
    }

    public getPlayer(clientId: string): Player {
        return this.clientPlayers.get(clientId);
    }

    public removeClient(clientId: string): void {
        this.clients.delete(clientId);
    }

    public setPlayerName(clientId: string, name: string): void {
        let player = this.clientPlayers.get(clientId);
        if (!player) {
            console.error(`Unable to set name ${name} as unable to find client with id ${clientId}`);
            return;
        }
        player.name = name;
    }

}