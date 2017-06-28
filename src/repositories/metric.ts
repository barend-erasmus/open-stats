// Imports metric types
import { Counter } from './../metric-types/counter';

export class MetricRepository {

    private static counters: Counter[] = [];

    constructor() {
        
    }

    public saveCounter(counter: Counter): Promise<boolean> {
        MetricRepository.counters.push(counter);
        return Promise.resolve(true);
    }

    public listCounters(name: string): Promise<Counter[]> {
        return Promise.resolve(MetricRepository.counters);
    }
}