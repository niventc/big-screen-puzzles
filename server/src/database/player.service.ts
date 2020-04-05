import { v4 as uuidv4 } from 'uuid';
import { Container, StatusCodes, Database } from '@azure/cosmos';
import { Player } from './player';

export class PlayerService {
    private players: Container;
    
    constructor(private database: Database) {
    }

    // Pretty gross singleton setup for the container!
    private async getPlayersContainer(): Promise<Container> {
        if (!this.players) {
            const container = await this.database.containers
                .createIfNotExists({
                    id: "players",
                    partitionKey: {
                        paths: [
                            "/type"
                        ]
                    }
                });
            console.log("[GetOrCreateContainer] players " + container.requestCharge + "RU");
            if (container.statusCode === StatusCodes.Ok || container.statusCode === StatusCodes.Created) {
                this.players = container.container;
            }
            else {
                console.error("[GetOrCreateContainer] players failed " + container.statusCode);
            }
        }
        return this.players;
    }

    public async getPlayer(id: string): Promise<Player> {
        const player = await (await this.getPlayersContainer())
            .item(id, "player")
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
        player.publicId = uuidv4();
        player.name = name;
        player.colour = colour;
        const response = await (await this.getPlayersContainer()).items.create(player);
        console.log("[CreatePlayer] " + response.requestCharge + "RU");
        if (response.statusCode === StatusCodes.Created) {
            return response.resource;
        }
        console.error("[CreatePlayer] Failed", response.statusCode);
    }

    public async updatePlayer(id: string, name?: string, colour?: string): Promise<Player> {
        const player = await this.getPlayer(id);
        if (!player) {
            return null;
        }
        if (name) {
            player.name = name;
        }
        if (colour) {
            player.colour = colour;
        }
        const response = await (await this.getPlayersContainer())
            .item(id, "player")
            .replace<Player>(player);
        console.log("[UpdatePlayer] " + response.requestCharge + "RU");
        if (response.statusCode === StatusCodes.Ok) {
            return response.resource;
        }
        console.error("[CreatePlayer] Failed", response.statusCode);
    }
}
