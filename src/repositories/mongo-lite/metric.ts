// imports
import * as mongo from "mongodb";

// imports interfaces
import { IMetricRepository } from "./../metric";

import { StatsService } from "./../../services/stats";

// imports metric types
import { Counter } from "./../../metric-types/counter";
import { Data } from "./../../metric-types/data";
import { Gauge } from "./../../metric-types/gauge";
import { Timing } from "./../../metric-types/timing";

export class MetricRepository implements IMetricRepository {

    private static counters: {} = {};
    private static gauges: {} = {};
    private static timings: {} = {};

    private statsService: StatsService = new StatsService();

    constructor(private uri: string) {

    }

    public async saveMetric(metric: Data): Promise<boolean> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        if (metric.type === "counter") {
            const collection: mongo.Collection = db.collection("counters");

            const existingMetric = await collection.findOne({ name: metric.name });

            if (existingMetric) {
                await collection.updateOne({
                    name: metric.name,
                },
                    {
                        name: metric.name,
                        value: existingMetric.value + metric.value,
                    });
            } else {
                await collection.insertOne({
                    name: metric.name,
                    value: metric.value,
                });
            }
        } else if (metric.type === "gauge") {
            const collection: mongo.Collection = db.collection("gauges");

            const existingMetric = await collection.findOne({ name: metric.name });

            if (existingMetric) {

                if (metric.value) {
                    await collection.updateOne({
                        name: metric.name,
                    },
                        {
                            name: metric.name,
                            value: metric.value,
                        });
                } else if (metric.offset) {
                    await collection.updateOne({
                        name: metric.name,
                    },
                        {
                            name: metric.name,
                            value: existingMetric.value + metric.offset,
                        });
                }
            } else {
                await collection.insertOne({
                    name: metric.name,
                    value: metric.value,
                });
            }
        } else if (metric.type === "timing") {
            const collection: mongo.Collection = db.collection("timings");

            const existingMetric = await collection.findOne({ name: metric.name });

            if (existingMetric) {
                await collection.updateOne({
                    name: metric.name,
                },
                    {
                        count: existingMetric.count + 1,
                        maximum: metric.value > existingMetric.maximum ? metric.value : existingMetric.maximum,
                        minimum: metric.value < existingMetric.minimum ? metric.value : existingMetric.minimum,
                        sum: existingMetric.sum + metric.value,
                        sumSquared: existingMetric.sumSquared + Math.pow(metric.value, 2),
                    });
            } else {
                await collection.insertOne({
                    count: 1,
                    maximum: metric.value,
                    minimum: metric.value,
                    sum: metric.value,
                    sumSquared: Math.pow(metric.value, 2),
                });
            }
        }

        return true;
    }

    public async calculateCounterSum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);
        const collection: mongo.Collection = db.collection("counters");

        const metric = await collection.findOne({ name });

        return metric ? metric.value : 0;
    }

    public async listCountersPerSecond(name: string): Promise<Counter[]> {
        return [];
    }

    public async listCountersPerMinute(name: string): Promise<Counter[]> {
        return [];
    }

    public async listCountersPerHour(name: string): Promise<Counter[]> {
        return [];
    }

    public async listCountersPerDay(name: string): Promise<Counter[]> {
        return [];
    }

    public async calculateGaugeValue(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);
        const collection: mongo.Collection = db.collection("gauges");

        const metric = await collection.findOne({ name });

        return metric ? metric.value : 0;
    }

    public async calculateTimingMean(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);
        const collection: mongo.Collection = db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? metric.sum / metric.count : 0;
    }

    public async calculateTimingMinimum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);
        const collection: mongo.Collection = db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? metric.minimum : 0;
    }

    public async calculateTimingMaximum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);
        const collection: mongo.Collection = db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? metric.maximum : 0;
    }

    public async calculateTimingStandardDeviation(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);
        const collection: mongo.Collection = db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? this.statsService.recalculateStandardDeviation(metric.sum, metric.count, metric.sumSquared) : 0;
    }
}
