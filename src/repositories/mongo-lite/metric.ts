// imports
import * as moment from "moment";
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

    private db: mongo.Db;

    private statsService: StatsService = new StatsService();

    constructor(private uri: string) {

    }

    public async saveMetric(metric: Data): Promise<boolean> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        if (metric.type === "counter") {
            const collection: mongo.Collection = this.db.collection("counters");

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
            const collection: mongo.Collection = this.db.collection("gauges");

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
            const collection: mongo.Collection = this.db.collection("timings");

            const existingMetric = await collection.findOne({ name: metric.name });

            if (existingMetric) {

                let count: number = existingMetric.count + 1;
                const minimum: number = existingMetric.minimum === null? metric.value : (metric.value < existingMetric.minimum ? metric.value : existingMetric.minimum);
                const maximum: number = existingMetric.maximum === null? metric.value : metric.value > existingMetric.maximum ? metric.value : existingMetric.maximum;
                let sum: number = existingMetric.sum + metric.value;
                let sumSquared: number = existingMetric.sumSquared + Math.pow(metric.value, 2);

                const canScaleDownValues: boolean = count % 5 === 0;
                const shouldScaleDownValues: boolean = sum > Math.pow(2, 30) || sumSquared > Math.pow(2, 30);

                if (canScaleDownValues && shouldScaleDownValues) {
                    count /= 5;
                    sum /= 5;
                    sumSquared /= 5;
                }

                await collection.updateOne({
                    name: metric.name,
                },
                    {
                        count: count,
                        maximum: maximum,
                        minimum: minimum,
                        name: metric.name,
                        sum: sum,
                        sumSquared: sumSquared,
                    });
            } else {
                await collection.insertOne({
                    count: 1,
                    maximum: metric.value,
                    minimum: metric.value,
                    name: metric.name,
                    sum: metric.value,
                    sumSquared: Math.pow(metric.value, 2),
                });
            }
        }

        return true;
    }

    public async listCounterNames(): Promise<string[]> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("counters");

        const result: any[] = await collection.find({}, { name: 1 }).toArray();

        return result.map((x) => x.name);
    }

    public async listGaugeNames(): Promise<string[]> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("gauges");

        const result: any[] = await collection.find({}, { name: 1 }).toArray();

        return result.map((x) => x.name);
    }

    public async listTimingNames(): Promise<string[]> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("timings");

        const result: any[] = await collection.find({}, { name: 1 }).toArray();

        return result.map((x) => x.name);
    }

    public async saveSeriesData(name: string, value: number, timestamp: number): Promise<boolean> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("series");

        const result: any = await collection.insertOne({
            name,
            timestamp,
            value,
        });

        return true;
    }

    public async getSeriesData(name: string, timestamp: number): Promise<Array<{ x: number, y: number }>> {

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

    public async calculateCounterSum(name: string): Promise<number> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("counters");

        const metric = await collection.findOne({ name });

        return metric ? metric.value : 0;
    }

    public async calculateGaugeValue(name: string): Promise<number> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("gauges");

        const metric = await collection.findOne({ name });

        return metric ? metric.value : 0;
    }

    public async calculateTimingMean(name: string): Promise<number> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? metric.sum / metric.count : 0;
    }

    public async calculateTimingMinimum(name: string): Promise<number> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? metric.minimum : 0;
    }

    public async calculateTimingMaximum(name: string): Promise<number> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? metric.maximum : 0;
    }

    public async calculateTimingStandardDeviation(name: string): Promise<number> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("timings");

        const metric = await collection.findOne({ name });

        return metric ? this.statsService.recalculateStandardDeviation(metric.sum, metric.count, metric.sumSquared) : 0;
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

    public async resetTimingMinimumAndMaximum(name: string): Promise<boolean> {
        if (!this.db) {
            this.db = await mongo.MongoClient.connect(this.uri);
        }

        const collection: mongo.Collection = this.db.collection("timings");

        const existingMetric = await collection.findOne({ name });

        if (existingMetric) {

            await collection.updateOne({
                name,
            },
                {
                    count: existingMetric.count,
                    maximum: null,
                    minimum: null,
                    name,
                    sum: existingMetric.sum,
                    sumSquared: existingMetric.sumSquared,
                });
        }

        return true;
    }
}
