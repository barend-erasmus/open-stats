// Imports
import * as co from 'co';
import * as mongo from 'mongodb';
import * as moment from 'moment';

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

            const date: moment.Moment = moment(counter.timestamp);

            const result: any = yield collection.insertOne({
                name: counter.name,
                timestamp: counter.timestamp,
                unit: counter.unit,
                value: counter.value,
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
                        sum: { $sum: '$value' },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].sum;
        });
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

    public listCounters(name: string, group: { day: string | number, month: string | number, year: string | number, hour: string | number, minute: string | number, second: string | number }): Promise<Counter[]> {
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
                        _id: group,
                        sum: { $sum: '$value' },
                        count: { $sum: 1 }
                    }
                }
            ])
                .toArray();

            db.close();

            return result.map((x) => new Counter(name, x.sum, null, new Date(x._id.year, x._id.month - 1, x._id.day, x._id.hour, x._id.minute, x._id.second).getTime()));
        });
    }

    public saveGauge(gauge: Gauge): Promise<boolean> {
        const self = this;

        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('gauges');

            const date: moment.Moment = moment(gauge.timestamp);

            const result: any = yield collection.insertOne({
                name: gauge.name,
                timestamp: gauge.timestamp,
                unit: gauge.unit,
                offset: gauge.offset,
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
                        value: { $sum: '$offset' },
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

            const date: moment.Moment = moment(sampling.timestamp);

            const result: any = yield collection.insertOne({
                name: sampling.name,
                timestamp: sampling.timestamp,
                unit: sampling.unit,
                value: sampling.value,
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
                        mean: { $avg: '$value' },
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
                        minimum: { $min: '$value' },
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
                        maximum: { $max: '$value' },
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
                        standardDeviation: { $stdDevPop: '$value' },
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

            const date: moment.Moment = moment(timing.timestamp);

            const result: any = yield collection.insertOne({
                name: timing.name,
                timestamp: timing.timestamp,
                unit: timing.unit,
                value: timing.value,
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
                        mean: { $avg: '$value' },
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
                        minimum: { $min: '$value' },
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
                        maximum: { $max: '$value' },
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
                        standardDeviation: { $stdDevPop: '$value' },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            return result.length === 0 ? 0 : result[0].standardDeviation;
        });
    }

}