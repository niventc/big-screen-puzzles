import { Container, Database, StatusCodes } from '@azure/cosmos';
import { Game } from 'big-screen-puzzles-contract';

export class GameService {
    private templates: Container;

    constructor(private database: Database) {}

    private async getTemplatesContainer(): Promise<Container> {
        if (!this.templates) {
            const container = await this.database.containers
                .createIfNotExists({
                    id: "templates",
                    partitionKey: {
                        paths: [
                            "/type"
                        ]
                    }
                });

            console.log("[GetOrCreateContainer] templates " + container.requestCharge + "RU");

            if (container.statusCode === StatusCodes.Ok || container.statusCode === StatusCodes.Created) {
                this.templates = container.container;
            }
            else {
                console.error("[GetOrCreateContainer] templates failed " + container.statusCode);
            }
        }
        return this.templates;
    }

    public async getTemplate(type: string, id: string): Promise<Game> {
        const container = await this.getTemplatesContainer();
        const game = await container.item(id, type).read<Game>();
        
        console.log("[GetTemplate] " + game.requestCharge + "RU");

        if (game.statusCode === StatusCodes.Ok) {
            return game.resource;
        }
        console.error("[GetTemplate] Failed", game.statusCode);
    }

    public async getTemplateIdsFor(type: string): Promise<string[]> {
        const container = await this.getTemplatesContainer();
        try {
            const ids = await container.items
                .query({
                    query: "SELECT c.id FROM c WHERE c.type = @type",
                    parameters: [
                        {name: "@type", value: type}
                    ]
                })
                .fetchAll();
                
            console.log("[GetTemplatesForId] " + ids.requestCharge + "RU");

            return ids.resources.map(x => x.id);
        } catch (e) {
            console.error("[GetTemplatesForId] Failed", e);
            return [];
        }
    }

    public async insertTemplate(template: Game): Promise<void> {
        const container = await this.getTemplatesContainer();
        const response = await container.items.create(template);

        console.log("[InsertTemplate] " + response.requestCharge + "RU");

        if (response.statusCode !== StatusCodes.Created) {
            console.error("[InsertTemplate] Failed", response.statusCode);
        }
    }
}
