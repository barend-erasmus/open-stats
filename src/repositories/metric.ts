// imports
import * as moment from "moment";
import * as mongo from "mongodb";

// imports metric types
import { Counter } from "./../metric-types/counter";
import { Data } from "./../metric-types/data";
import { Gauge } from "./../metric-types/gauge";
import { Timing } from "./../metric-types/timing";

export interface IMetricRepository {

    saveMetric(metric: Data): Promise<boolean>;

    listCounterNames(): Promise<string[]>;

    listGaugeNames(): Promise<string[]>;

    listTimingNames(): Promise<string[]>;

    saveSeriesData(name: string, value: number, timestamp: number): Promise<boolean>;

    getSeriesData(name: string, timestamp: number): Promise<Array<{x: number, y: number}>>;

    calculateCounterSum(name: string): Promise<number>;

    calculateGaugeValue(name: string): Promise<number>;

    calculateTimingMean(name: string): Promise<number>;

    calculateTimingMinimum(name: string): Promise<number>;

    calculateTimingMaximum(name: string): Promise<number>;

    calculateTimingStandardDeviation(name: string): Promise<number>;
}
