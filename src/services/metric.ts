// Imports
import * as co from 'co';

// Imports repositories
import { MetricRepository } from './../repositories/metric';

// Import metric types
import { Counter } from './../metric-types/counter';
import { Gauge } from './../metric-types/gauge';
import { Sampling } from './../metric-types/sampling';
import { Timing } from './../metric-types/timing';

// Imports models
import { Counter as CounterModel } from './../models/counter';
import { Gauge as GaugeModel } from './../models/gauge';
import { Sampling as SamplingModel } from './../models/sampling';
import { Timing as TimingModel } from './../models/timing';

// Imports services
import { StatsService } from './stats';

export class MetricService {

    private statsService: StatsService = new StatsService();

    constructor(private metricRepository: MetricRepository) {

    }

    public log(metric: any): Promise<boolean> {

        if (metric.type === 'counter') {
            const counter = new Counter(metric.name, metric.value, metric.unit, metric.timestamp);
            this.metricRepository.saveCounter(counter);
        } else if (metric.type === 'gauge') {
            const gauge = new Gauge(metric.name, metric.offset, metric.unit, metric.timestamp);
            this.metricRepository.saveGauge(gauge);
        } else if (metric.type === 'sampling') {
            const sampling = new Sampling(metric.name, metric.value, metric.unit, metric.timestamp);
            this.metricRepository.saveSampling(sampling);
        } else if (metric.type === 'timing') {
            const timing = new Timing(metric.name, metric.value, metric.unit, metric.timestamp);
            this.metricRepository.saveTiming(timing);
        } else {
            throw new Error('Invalid metric type');
        }

        return Promise.resolve(true);
    }

    public getCounter(name: string): Promise<CounterModel> {
        const self = this;
        return co(function* () {
            const sum: number = yield self.metricRepository.calculateCounterSum(name);
            const model: CounterModel = new CounterModel(
                name,
                sum,
                null
            );

            return model;
        });
    }

    public getGauge(name: string): Promise<GaugeModel> {
        const self = this;
        return co(function* () {
            const value: number = yield self.metricRepository.calculateGaugeValue(name);
            const model: GaugeModel = new GaugeModel(
                name,
                value,
                null
            );

            return model;
        });
    }

    public getSampling(name: string): Promise<SamplingModel> {
        const self = this;
        return co(function* () {
            const mean: number = yield self.metricRepository.calculateSamplingMean(name);
            const median: number = null;
            const minimum: number = yield self.metricRepository.calculateSamplingMinimum(name);
            const maximum: number = yield self.metricRepository.calculateSamplingMaximum(name);
            const standardDeviation: number = yield self.metricRepository.calculateSamplingStandardDeviation(name);

            const model: SamplingModel = new SamplingModel(
                name,
                mean,
                median,
                minimum,
                maximum,
                standardDeviation,
                null
            );

            return model;
        });
    }

    public getTiming(name: string): Promise<TimingModel> {
        const self = this;
        return co(function* () {
            const mean: number = yield self.metricRepository.calculateTimingMean(name);
            const median: number = null;
            const minimum: number = yield self.metricRepository.calculateTimingMinimum(name);
            const maximum: number = yield self.metricRepository.calculateTimingMaximum(name);
            const standardDeviation: number = yield self.metricRepository.calculateTimingStandardDeviation(name);

            const model: TimingModel = new TimingModel(
                name,
                mean,
                median,
                minimum,
                maximum,
                standardDeviation,
                null
            );

            return model;
        });
    }
}