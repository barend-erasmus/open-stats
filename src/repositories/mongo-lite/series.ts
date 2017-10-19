// imports
import * as moment from "moment";
import * as mongo from "mongodb";

// imports interfaces
import { ISeriesRepository } from "./../series";

import { StatsService } from "./../../services/stats";

export class SeriesRepository implements ISeriesRepository {

    private db: mongo.Db;

    constructor(private uri: string, private onSaveData: (name: string, value: number, tags: {}) => void) {

    }

    public async saveData(name: string, value: number, timestamp: number, token: string, tags: {}): Promise<boolean> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const timestampMomentjs = moment(timestamp);

        const result: any = await collection.insertOne({
            name,
            tags: tags || {},
            timestamp,
            timestampDate: new Date(timestamp),
            timestampElements: {
                day: timestampMomentjs.date(),
                hours: timestampMomentjs.hours(),
                minutes: timestampMomentjs.minutes(),
                month: timestampMomentjs.month() + 1,
                seconds: timestampMomentjs.seconds(),
                year: timestampMomentjs.year(),
            },
            token,
            value,
        });

        if (this.onSaveData) {
            this.onSaveData(name, value, tags);
        }

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

    public async getData(name: string, timestamp: number, token: string, tags: {}): Promise<Array<{ timestamp: string, x: number, y: number, tags: {} }>> {

        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const query = {
            name,
            timestamp: { $gt: timestamp },
            token,
        };

        if (tags) {
            for (const tag in tags) {
                query[`tags.${tag}`] = tags[tag];
            }
        }

        const result: any[] = await collection.find(query)
            .sort({
                timestamp: 1,
            })
            .toArray();

        return result.map((x) => {
            return {
                tags: x.tags,
                timestamp: moment(x.timestamp).format('YYYY/MM/DD HH:mm:ss'),
                x: x.timestamp,
                y: x.value,
            };
        });
    }

    public async getAggregatedData(name: string, timestamp: number, token: string, tags: {}, aggregate: string, intervalInMinutes: number): Promise<Array<{ timestamp: string, x: number, y: number, tags: {} }>> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const query = {
            name,
            timestamp: { $gt: timestamp },
            token,
        };

        if (tags) {
            for (const tag in tags) {
                query[`tags.${tag}`] = tags[tag];
            }
        }

        const result: any[] = await collection.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: {
                        day: '$timestampElements.day',
                        hours: '$timestampElements.hours',
                        // minutes: '$timestampElements.minutes',
                        minutes: {
                            $subtract: [
                                { $minute: '$timestampDate' },
                                { $mod: [{ $minute: '$timestampDate' }, intervalInMinutes] },
                            ],
                        },
                        month: '$timestampElements.month',
                        // seconds: '$timestampElements.seconds',
                        year: '$timestampElements.year',
                    },
                    average: {
                        $avg: '$value',
                    },
                    maximum: {
                        $max: '$value',
                    },
                    minimum: {
                        $min: '$value',
                    },
                    sum: {
                        $sum: '$value',
                    },
                },
            },
        ]).toArray();

        return result.map((x) => {
            return {
                tags,
                timestamp: moment(new Date(x._id.year, x._id.month - 1, x._id.day, x._id.hours, x._id.minutes, 0)).format('YYYY/MM/DD HH:mm:ss'),
                x: new Date(x._id.year, x._id.month - 1, x._id.day, x._id.hours, x._id.minutes, 0).getTime(),
                y: x[aggregate],
            };
        }).sort((a, b) => {
            if (a.timestamp < b.timestamp) {
                return -1;
            }

            if (a.timestamp > b.timestamp) {
                return 1;
            }

            return 0;
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
