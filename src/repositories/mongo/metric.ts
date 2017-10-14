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

    public listCountersPerSecond(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: "$date.day",
            hour: "$date.hour",
            minute: "$date.minute",
            month: "$date.month",
            second: "$date.second",
            year: "$date.year",
        });
    }

    public listCountersPerMinute(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: "$date.day",
            hour: "$date.hour",
            minute: "$date.minute",
            month: "$date.month",
            second: 0,
            year: "$date.year",
        });
    }

    public listCountersPerHour(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: "$date.day",
            hour: "$date.hour",
            minute: 0,
            month: "$date.month",
            second: 0,
            year: "$date.year",
        });
    }

    public listCountersPerDay(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: "$date.day",
            hour: 0,
            minute: 0,
            month: "$date.month",
            second: 0,
            year: "$date.year",
        });
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

    private async listCounters(name: string, group: { day: string | number, month: string | number, year: string | number, hour: string | number, minute: string | number, second: string | number }): Promise<Counter[]> {

                const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

                const collection: mongo.Collection = db.collection("metrics");

                const result: any[] = await collection.aggregate([
                    {
                        $match: { name, type: "counter" },
                    },
                    {
                        $group: {
                            _id: group,
                            count: { $sum: 1 },
                            sum: { $sum: "$value" },
                        },
                    },
                ])
                    .toArray();

                db.close();

                return result.map((x) => new Counter(name, x.sum, null, new Date(x._id.year, x._id.month - 1, x._id.day, x._id.hour, x._id.minute, x._id.second).getTime()));
            }
}
