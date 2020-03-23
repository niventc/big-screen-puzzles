import { v4 as uuidv4 } from 'uuid';
import { Player } from 'big-screen-puzzles-contract';

export declare class WebSocketClient extends WebSocket {
    uuid: string;
}

export class ClientService {

    static getRandomColor(): string {
        const r = Math.round(Math.random() * 255);
        const g = Math.round(Math.random() * 255);
        const b = Math.round(Math.random() * 255);
        return `rgb(${r}, ${g}, ${b})`;
      }

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
            player.colour = ClientService.getRandomColor();
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

    public updatePlayer(clientId: string, name?: string, colour?: string): Player {
        let player = this.clientPlayers.get(clientId);
        if (!player) {
            console.error(`Unable to set name ${name} as unable to find client with id ${clientId}`);
            return;
        }
        if (name) {
            player.name = name;
        }
        if (colour) {
            player.colour = colour;
        }
        return player;
    }

}