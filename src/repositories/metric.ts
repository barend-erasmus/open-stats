// Imports
import * as co from 'co';
import * as mongo from 'mongodb';

// Imports metric types
import { Counter } from './../metric-types/counter';
import { Gauge } from './../metric-types/gauge';

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

            return result.length === 0? 0 : result[0].sum;
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

            return result.length === 0? 0 : result[0].value;
        });
    }

    public listCounters(name: string): Promise<Counter[]> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('counters');

            const result: Counter[] = yield collection.find({
                name: name
            }).toArray();

            db.close();

            return result;
        });
    }
}