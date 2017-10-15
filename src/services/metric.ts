// imports interfaces
import { IMetricRepository } from "./../repositories/metric";

// import metric types
import { Data } from "./../metric-types/data";
import { Gauge } from "./../metric-types/gauge";
import { Timing } from "./../metric-types/timing";

// imports models
import { Counter as CounterModel } from "./../models/counter";
import { Gauge as GaugeModel } from "./../models/gauge";
import { Timing as TimingModel } from "./../models/timing";

// imports services
import { StatsService } from "./stats";

export class MetricService {

    private statsService: StatsService = new StatsService();

    constructor(private metricRepository: IMetricRepository) {

    }

    public async log(metric: Data): Promise<boolean> {
        await this.metricRepository.saveMetric(metric);

        return true;
    }

    public async getCounter(name: string): Promise<CounterModel> {
        const sum: number = await this.metricRepository.calculateCounterSum(name);
        const model: CounterModel = new CounterModel(
            name,
            sum,
            null,
        );

        return model;
    }

    public async getGauge(name: string): Promise<GaugeModel> {
        const value: number = await this.metricRepository.calculateGaugeValue(name);
        const model: GaugeModel = new GaugeModel(
            name,
            value,
            null,
        );

        return model;
    }

    public async getTiming(name: string): Promise<TimingModel> {
        const mean: number = await this.metricRepository.calculateTimingMean(name);
        const median: number = null;
        const minimum: number = await this.metricRepository.calculateTimingMinimum(name);
        const maximum: number = await this.metricRepository.calculateTimingMaximum(name);
        const standardDeviation: number = await this.metricRepository.calculateTimingStandardDeviation(name);

        const model: TimingModel = new TimingModel(
            name,
            mean,
            median,
            minimum,
            maximum,
            standardDeviation,
            null,
        );

        return model;
    }

    public async listCounterNames(): Promise<string[]> {
        return this.metricRepository.listCounterNames();
    }

    public async listGaugeNames(): Promise<string[]> {
        return this.metricRepository.listGaugeNames();
    }

    public async listTimingNames(): Promise<string[]> {
        return this.metricRepository.listTimingNames();
    }

    public async getSeriesData(name: string, timestamp: number): Promise<Array<{x: number, y: number}>> {
        return this.metricRepository.getSeriesData(name, timestamp);
    }
}
