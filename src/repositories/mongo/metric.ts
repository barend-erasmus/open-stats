// imports
import * as moment from "moment";
import * as mongo from "mongodb";

// imports interfaces
import { IMetricRepository } from "./../metric";

// imports metric types
import { Counter } from "./../../metric-types/counter";
import { Data } from "./../../metric-types/data";
import { Gauge } from "./../../metric-types/gauge";
import { Timing } from "./../../metric-types/timing";

export class MetricRepository implements IMetricRepository {

    constructor(private uri: string) {

    }

    public async saveMetric(metric: Data): Promise<boolean> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const date: moment.Moment = moment(metric.timestamp);

        const result: any = await collection.insertOne({
            date: {
                day: date.date(),
                hour: date.hour(),
                minute: date.minute(),
                month: date.month() + 1,
                second: date.second(),
                year: date.year(),
            },
            name: metric.name,
            timestamp: metric.timestamp,
            type: metric.type,
            unit: metric.unit,
            value: metric.value,
        });

        db.close();

        return true;
    }

    public async listCounterNames(): Promise<string[]> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: string[] = await collection.distinct('name', { type: 'counter' });

        return result;
    }

    public async listGaugeNames(): Promise<string[]> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: string[] = await collection.distinct('name', { type: 'gauge' });

        return result;
    }

    public async listTimingNames(): Promise<string[]> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: string[] = await collection.distinct('name', { type: 'timing' });

        return result;
    }

    public async saveSeriesData(name: string, value: number, timestamp: number): Promise<boolean> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("series");

        const result: any = await collection.insertOne({
            name,
            timestamp,
            value,
        });

        db.close();

        return true;
    }

    public async getSeriesData(name: string, timestamp: number): Promise<{ x: number, y: number }[]> {

        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("series");

        const result: any[] = await collection.find({
            name,
            timestamp: { $gt: timestamp }
        })
        .sort({
            timestamp: 1
        }).toArray();

        db.close();

        return result.map((x) => {
            return {
                timestamp: moment(x.timestamp).format('YYYY/MM/DD HH:mm:ss'),
                x: x.timestamp,
                y: x.value,
            };
        });
    }

    public async calculateCounterSum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: any[] = await collection.aggregate([
            {
                $match: { name, type: "counter" },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    sum: { $sum: "$value" },
                },
            },
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].sum;
    }

    public async calculateGaugeValue(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: any[] = await collection.aggregate([
            {
                $match: { name, type: "gauge" },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    value: { $sum: "$offset" },
                },
            },
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].value;
    }

    public async calculateTimingMean(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: any[] = await collection.aggregate([
            {
                $match: { name, type: "timing" },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    mean: { $avg: "$value" },
                },
            },
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].mean;
    }

    public async calculateTimingMinimum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: any[] = await collection.aggregate([
            {
                $match: { name, type: "timing" },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    minimum: { $min: "$value" },
                },
            },
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].minimum;
    }

    public async calculateTimingMaximum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: any[] = await collection.aggregate([
            {
                $match: { name, type: "timing" },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    maximum: { $max: "$value" },
                },
            },
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].maximum;
    }

    public async calculateTimingStandardDeviation(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection("metrics");

        const result: any[] = await collection.aggregate([
            {
                $match: { name, type: "timing" },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    standardDeviation: { $stdDevPop: "$value" },
                },
            },
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].standardDeviation;
    }
}
