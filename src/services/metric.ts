// imports interfaces
import { ISeriesRepository } from "./../repositories/series";

// imports models
import { Aggregate } from "./../models/aggregate";
import { Counter } from "./../models/counter";
import { Gauge } from "./../models/gauge";
import { Timing } from "./../models/timing";

// imports services
import { StatsService } from "./stats";

export class MetricService {

    private statsService: StatsService = new StatsService();

    private counters: {} = {};
    private gauges: {} = {};
    private timings: {} = {};

    constructor(private seriesRepository: ISeriesRepository, private onLog: (type: string, name: string, value: number) => void) {

    }

    public log(type: string, name: string, value: number): void {
        switch (type) {
            case 'counter':
                this.updateCounter(name, value);
                break;
            case 'gauge':
                this.updateGauge(name, value);
                break;
            case 'timing':
                this.updateTiming(name, value);
                break;

        }
        this.updateCounter('open-stats.metrics', 1);

        this.onLog(type, name, value);
    }

    public async sendAggerate(intervalInSeconds: number): Promise<void> {

        const timestamp: number = new Date().getTime();

        const aggregate: Aggregate = this.aggerate(intervalInSeconds);

        for (const counter of aggregate.counters) {
            await this.seriesRepository.saveData(counter.name, counter.value, timestamp);
            await this.seriesRepository.saveData(`${counter.name}.rate`, counter.value / intervalInSeconds, timestamp);
        }

        for (const gauge of aggregate.gauges) {
            await this.seriesRepository.saveData(gauge.name, gauge.value, timestamp);
        }

        for (const timing of aggregate.timings) {
            await this.seriesRepository.saveData(`${timing.name}.maximum`, timing.maximum, timestamp);
            await this.seriesRepository.saveData(`${timing.name}.mean`, timing.mean, timestamp);
            await this.seriesRepository.saveData(`${timing.name}.median`, timing.median, timestamp);
            await this.seriesRepository.saveData(`${timing.name}.minimum`, timing.minimum, timestamp);
            await this.seriesRepository.saveData(`${timing.name}.standardDeviation`, timing.standardDeviation, timestamp);
        }
    }

    public aggerate(intervalInSeconds: number): Aggregate {

        const aggregateCounters: Counter[] = [];

        for (const name in this.counters) {
            aggregateCounters.push(new Counter(name, this.counters[name], this.counters[name] / intervalInSeconds));

            this.counters[name] = 0;
        }

        const aggregateGauges: Gauge[] = [];

        for (const name in this.gauges) {
            aggregateGauges.push(new Gauge(name, this.gauges[name]));
        }

        const aggregateTimings: Timing[] = [];

        for (const name in this.timings) {
            aggregateTimings.push(new Timing(
                name,
                this.statsService.calculateMean(this.timings[name]),
                this.statsService.calculateMedian(this.timings[name]),
                this.statsService.calculateMinimum(this.timings[name]),
                this.statsService.calculateMaximum(this.timings[name]),
                this.statsService.calculateStandardDeviation(this.timings[name]),
            ));

            this.timings[name] = [];
        }

        return new Aggregate(aggregateCounters, aggregateGauges, aggregateTimings);
    }

    public async getData(name: string, timestamp: number): Promise<Array<{ timestamp: string, x: number, y: number }>> {
        return this.seriesRepository.getData(name, timestamp);
    }

    public async listNames(): Promise<string[]> {
        return this.seriesRepository.listNames();
    }

    public async clearStaleData(hours: number): Promise<boolean> {
        return this.seriesRepository.clearStaleData(hours);
    }

    private updateCounter(name: string, value: number): void {
        if (!this.counters[name]) {
            this.counters[name] = value;
        } else {
            this.counters[name] += value;
        }
    }

    private updateGauge(name: string, value: number): void {
        if (!this.gauges[name]) {
            this.gauges[name] = value;
        } else {
            this.gauges[name] = value;
        }
    }

    private updateTiming(name: string, value: number): void {
        if (!this.timings[name]) {
            this.timings[name] = [value];
        } else {
            this.timings[name].push(value);
        }
    }
}
