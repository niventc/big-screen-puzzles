import { v4 as uuidv4 } from 'uuid';
import { CosmosClient, Container, StatusCodes } from '@azure/cosmos';
import { Player } from './database/player';

export declare class WebSocketClient extends WebSocket {
    uuid: string;
}

export class PlayerService {

    private players: Container;

    constructor(
        cosmosClient: CosmosClient
    ) {
        const database = cosmosClient.database("bsp");
        this.players = database.container("players");
    }

    public async getPlayer(privateId: string): Promise<Player> {
        const player = await this.players
            .item(privateId, "player")
            .read<Player>();

        console.log("[GetPlayer] " + player.requestCharge + "RU");

        if (player.statusCode === StatusCodes.Ok) {
            return player.resource;
        }
        console.error("[GetPlayer] Failed", player.statusCode);
    }

    public async createPlayer(id: string, name: string, colour: string): Promise<Player> {
        const player = new Player();
        player.id = id;
        player.privateId = uuidv4();
        player.name = name;
        player.colour = colour;

        const response = await this.players.items.create(player);

        console.log("[CreatePlayer] " + response.requestCharge + "RU");

        if (response.statusCode === StatusCodes.Created) {
            return response.resource;
        }
        console.error("[CreatePlayer] Failed", response.statusCode);
    }

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

    private playerService: PlayerService;

    constructor(
        cosmosClient: CosmosClient
    ) {
        this.playerService = new PlayerService(cosmosClient);
    }

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