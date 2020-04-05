import { v4 as uuidv4 } from 'uuid';
import { Database } from '@azure/cosmos';
import { Player } from './database/player';
import { PlayerService } from './database/player.service';

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

    private playerService: PlayerService;

    constructor(
        database: Database
    ) {
        this.playerService = new PlayerService(database);
    }

    public async addClient(client: WebSocket, clientId: string): Promise<Player> {
        const webSocketClient = client as WebSocketClient;
        if (!clientId) {
            clientId = uuidv4();
        }
        webSocketClient.uuid = clientId;
        this.clients.set(clientId, webSocketClient);

        let player = await this.playerService.getPlayer(clientId);
        if (!player) {
            player = await this.playerService.createPlayer(clientId, null, ClientService.getRandomColor());
        }

        console.log(`Added client/player`, player);
        return player;
    }

    public getClient(clientId: string): WebSocketClient {
        return this.clients.get(clientId);
    }

    public async getPlayer(clientId: string): Promise<Player> {
        return await this.playerService.getPlayer(clientId);
    }

    public removeClient(clientId: string): void {
        this.clients.delete(clientId);
    }

    public async updatePlayer(clientId: string, name?: string, colour?: string): Promise<Player> {
        return await this.playerService.updatePlayer(clientId, name, colour);
    }

}