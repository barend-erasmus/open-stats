// Imports
import * as mongo from 'mongodb';
import * as moment from 'moment';

// Imports metric types
import { Data } from './../metric-types/data';
import { Counter } from './../metric-types/counter';
import { Gauge } from './../metric-types/gauge';
import { Timing } from './../metric-types/timing';

export interface IMetricRepository {

    saveMetric(metric: Data): Promise<boolean>;

    calculateCounterSum(name: string): Promise<number>;

    listCountersPerSecond(name: string): Promise<Counter[]>;

    listCountersPerMinute(name: string): Promise<Counter[]>;

    listCountersPerHour(name: string): Promise<Counter[]>;

    listCountersPerDay(name: string): Promise<Counter[]>;

    calculateGaugeValue(name: string): Promise<number>;

    calculateTimingMean(name: string): Promise<number>;

    calculateTimingMinimum(name: string): Promise<number>;

    calculateTimingMaximum(name: string): Promise<number>;

    calculateTimingStandardDeviation(name: string): Promise<number>;
}