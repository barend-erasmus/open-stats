// Imports
import * as co from 'co';

// Imports repositories
import { MetricRepository } from './../repositories/metric';

// Import metric types
import { Counter } from './../metric-types/counter';
import { Gauge } from './../metric-types/gauge';

// Imports models
import { Counter as CounterModel } from './../models/counter';
import { Gauge as GaugeModel } from './../models/gauge';

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
}