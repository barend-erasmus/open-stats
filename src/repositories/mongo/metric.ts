// Imports
import * as mongo from 'mongodb';
import * as moment from 'moment';

// Imports interfaces
import { IMetricRepository } from './../metric';

// Imports metric types
import { Data } from './../../metric-types/data';
import { Counter } from './../../metric-types/counter';
import { Gauge } from './../../metric-types/gauge';
import { Timing } from './../../metric-types/timing';

export class MetricRepository implements IMetricRepository {

    constructor(private uri: string) {

    }

    public async saveMetric(metric: Data): Promise<boolean> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const date: moment.Moment = moment(metric.timestamp);

        const result: any = await collection.insertOne({
            type: metric.type,
            name: metric.name,
            timestamp: metric.timestamp,
            unit: metric.unit,
            value: metric.value,
            date: {
                day: date.date(),
                month: date.month() + 1,
                year: date.year(),
                hour: date.hour(),
                minute: date.minute(),
                second: date.second()
            }
        });

        db.close();

        return true;
    }

    public async calculateCounterSum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const result: any[] = await collection.aggregate([
            {
                $match: { name: name, type: 'counter' }
            },
            {
                $group: {
                    _id: null,
                    sum: { $sum: '$value' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].sum;
    }

    public listCountersPerSecond(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: '$date.day',
            month: '$date.month',
            year: '$date.year',
            hour: '$date.hour',
            minute: '$date.minute',
            second: '$date.second'
        });
    }

    public listCountersPerMinute(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: '$date.day',
            month: '$date.month',
            year: '$date.year',
            hour: '$date.hour',
            minute: '$date.minute',
            second: 0
        });
    }

    public listCountersPerHour(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: '$date.day',
            month: '$date.month',
            year: '$date.year',
            hour: '$date.hour',
            minute: 0,
            second: 0
        });
    }

    public listCountersPerDay(name: string): Promise<Counter[]> {
        return this.listCounters(name, {
            day: '$date.day',
            month: '$date.month',
            year: '$date.year',
            hour: 0,
            minute: 0,
            second: 0
        });
    }

    private async listCounters(name: string, group: { day: string | number, month: string | number, year: string | number, hour: string | number, minute: string | number, second: string | number }): Promise<Counter[]> {

        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const result: any[] = await collection.aggregate([
            {
                $match: { name: name, type: 'counter' }
            },
            {
                $group: {
                    _id: group,
                    sum: { $sum: '$value' },
                    count: { $sum: 1 }
                }
            }
        ])
            .toArray();

        db.close();

        return result.map((x) => new Counter(name, x.sum, null, new Date(x._id.year, x._id.month - 1, x._id.day, x._id.hour, x._id.minute, x._id.second).getTime()));
    }


    public async calculateGaugeValue(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const result: any[] = await collection.aggregate([
            {
                $match: { name: name, type: 'gauge' }
            },
            {
                $group: {
                    _id: null,
                    value: { $sum: '$offset' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].value;
    }

    public async calculateTimingMean(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const result: any[] = await collection.aggregate([
            {
                $match: { name: name, type: 'timing' }
            },
            {
                $group: {
                    _id: null,
                    mean: { $avg: '$value' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].mean;
    }

    public async calculateTimingMinimum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const result: any[] = await collection.aggregate([
            {
                $match: { name: name, type: 'timing' }
            },
            {
                $group: {
                    _id: null,
                    minimum: { $min: '$value' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].minimum;
    }

    public async calculateTimingMaximum(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const result: any[] = await collection.aggregate([
            {
                $match: { name: name, type: 'timing' }
            },
            {
                $group: {
                    _id: null,
                    maximum: { $max: '$value' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].maximum;
    }

    public async calculateTimingStandardDeviation(name: string): Promise<number> {
        const db: mongo.Db = await mongo.MongoClient.connect(this.uri);

        const collection: mongo.Collection = db.collection('metrics');

        const result: any[] = await collection.aggregate([
            {
                $match: { name: name, type: 'timing' }
            },
            {
                $group: {
                    _id: null,
                    standardDeviation: { $stdDevPop: '$value' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        db.close();

        return result.length === 0 ? 0 : result[0].standardDeviation;
    }
}