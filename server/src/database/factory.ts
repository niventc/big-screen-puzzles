import { Database, CosmosClient, StatusCodes } from "@azure/cosmos";

export class CosmosDatabaseFactory {

    static async setupDatabase(): Promise<Database> {
        const endpoint = process.env.COSMOS_ENDPOINT ? process.env.COSMOS_ENDPOINT : "https://localhost:8081";
        const key = process.env.COSMOS_KEY ? process.env.COSMOS_KEY : "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";

        console.log("Connecting using endpoint " + endpoint);

        // Turn off SSL when using local emulator
        if (endpoint.includes("localhost")) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const cosmosClient = new CosmosClient({
            endpoint: endpoint,
            key: key
        });

        const database = await cosmosClient.databases.createIfNotExists({ id: "bsp" });

        console.log("[GetOrCreateDatabase] " + database.requestCharge + "RU");

        if (database.statusCode === StatusCodes.Ok || database.statusCode === StatusCodes.Created) {
            return database.database;
        }
        console.error("[GetOrCreateDatabase] Failed " + database.statusCode);
    }

}
