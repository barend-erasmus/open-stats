// imports
import * as moment from "moment";
import * as mongo from "mongodb";

// imports interfaces
import { ISeriesRepository } from "./../series";

import { StatsService } from "./../../services/stats";

export class MetricRepository implements ISeriesRepository {

    private db: mongo.Db;

    constructor(private uri: string, private onSaveData: (name: string, value: number) => void) {

    }

    public async saveData(name: string, value: number, timestamp: number): Promise<boolean> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const result: any = await collection.insertOne({
            name,
            timestamp,
            value,
        });

        this.onSaveData(name, value);

        return true;
    }

    public async listNames(): Promise<string[]> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const result: any[] = await collection.distinct('name', {});

        return result;
    }

    public async getData(name: string, timestamp: number): Promise<Array<{ timestamp: string, x: number, y: number }>> {

        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const result: any[] = await collection.find({
            name,
            timestamp: { $gt: timestamp },
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
