// Imports
import * as co from 'co';

// Imports repositories
import { MetricRepository } from './../repositories/metric';

// Import metric types
import {Counter } from './../metric-types/counter';

// Imports models
import { Counter as CounterModel } from './../models/counter';

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
        } else {
            throw new Error('Invalid metric type');
        }

        return Promise.resolve(true);
    }

    public getCounter(name: string): Promise<CounterModel> {
        const self = this;
       return co(function* () {
         const counters: Counter[] = yield self.metricRepository.listCounters(name);
         const model: CounterModel = new CounterModel(
            name,
            self.statsService.calculateSum(counters.map((x) => x.value)),
            counters[0].unit
         );

         return model;
       });
    }
}