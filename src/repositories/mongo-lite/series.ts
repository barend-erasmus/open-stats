// imports
import * as moment from "moment";
import * as mongo from "mongodb";

// imports interfaces
import { ISeriesRepository } from "./../series";

import { StatsService } from "./../../services/stats";

export class MetricRepository implements ISeriesRepository {

    private db: mongo.Db;

    constructor(private uri: string, private onSaveData: (name: string, value: number, tags: {}) => void) {

    }

    public async saveData(name: string, value: number, timestamp: number, token: string, tags: {}): Promise<boolean> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const result: any = await collection.insertOne({
            name,
            tags: tags || {},
            timestamp,
            token,
            value,
        });

        this.onSaveData(name, value, tags);

        return true;
    }

    public async listNames(token: string): Promise<string[]> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const result: any[] = await collection.distinct('name', {
            token,
        });

        return result;
    }

    public async getData(name: string, timestamp: number, token: string, tags: {}): Promise<Array<{ timestamp: string, x: number, y: number }>> {

        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const result: any[] = await collection.find({
            name,
            tags: tags || {},
            timestamp: { $gt: timestamp },
            token,
        })
            .sort({
                timestamp: 1,
            })
            .toArray();

        return result.map((x) => {
            return {
                timestamp: moment(x.timestamp).format('YYYY/MM/DD HH:mm:ss'),
                x: x.timestamp,
                y: x.value,
            };
        });
    }

    public async clearStaleData(hours: number): Promise<boolean> {

        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        await collection.remove({
            timestamp: { $lt: moment().subtract(hours, 'hour').toDate().getTime() },
        });

        return true;
    }
}
