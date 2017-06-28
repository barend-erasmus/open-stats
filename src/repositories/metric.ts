// Imports
import * as co from 'co';
import * as mongo from 'mongodb';

// Imports metric types
import { Counter } from './../metric-types/counter';
import { Gauge } from './../metric-types/gauge';
import { Sampling } from './../metric-types/sampling';
import { Timing } from './../metric-types/timing';

export class MetricRepository {

    constructor(private uri: string) {

    }

    public saveCounter(counter: Counter): Promise<boolean> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('counters');

            const result: any = yield collection.insertOne(counter);

            db.close();

            return true;
        });
    }

    public calculateCounterSum(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('counters');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        sum: { $sum: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].sum;
        });
    }

    public saveGauge(gauge: Gauge): Promise<boolean> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('gauges');

            const result: any = yield collection.insertOne(gauge);

            db.close();

            return true;
        });
    }

    public calculateGaugeValue(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('gauges');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        value: { $sum: "$offset" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].value;
        });
    }

    public saveSampling(sampling: Sampling): Promise<boolean> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('samplings');

            const result: any = yield collection.insertOne(sampling);

            db.close();

            return true;
        });
    }

    public calculateSamplingMean(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('samplings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        mean: { $avg: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].mean;
        });
    }

    public calculateSamplingMinimum(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('samplings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        minimum: { $min: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].minimum;
        });
    }


    public calculateSamplingMaximum(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('samplings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        maximum: { $max: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].maximum;
        });
    }

    public calculateSamplingStandardDeviation(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('samplings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        standardDeviation: { $stdDevPop: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].standardDeviation;
        });
    }

    public saveTiming(timing: Timing): Promise<boolean> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('timings');

            const result: any = yield collection.insertOne(timing);

            db.close();

            return true;
        });
    }

    public calculateTimingMean(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('timings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        mean: { $avg: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].mean;
        });
    }

    public calculateTimingMinimum(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('timings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        minimum: { $min: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].minimum;
        });
    }


    public calculateTimingMaximum(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('timings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        maximum: { $max: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].maximum;
        });
    }

    public calculateTimingStandardDeviation(name: string): Promise<number> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('timings');

            const result: any[] = yield collection.aggregate([
                {
                    $match: { name: name }
                },
                {
                    $group: {
                        _id: null,
                        standardDeviation: { $stdDevPop: "$value" },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].standardDeviation;
        });
    }

}