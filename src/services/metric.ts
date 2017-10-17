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

    constructor(private seriesRepository: ISeriesRepository, private onLog: (type: string, name: string, value: number, tags: {}) => void) {

    }

    public async log(type: string, name: string, value: number, token: string, tags: {}): Promise<void> {
        switch (type) {
            case 'counter':
                this.updateCounter(name, value, token || 'default');
                break;
            case 'gauge':
                this.updateGauge(name, value, token || 'default');
                break;
            case 'timing':
                this.updateTiming(name, value, token || 'default');
                break;
            case 'series':
                await this.seriesRepository.saveData(name, value, new Date().getTime(), token || 'default', tags);
                break;
        }

        this.updateCounter('open-stats.metrics', 1, token || 'default');

        this.onLog(type, name, value, tags);
    }

    public async sendAggerate(intervalInSeconds: number): Promise<void> {

        const timestamp: number = new Date().getTime();

        const aggregate: Aggregate = this.aggerate(intervalInSeconds);

        for (const counter of aggregate.counters) {
            await this.seriesRepository.saveData(counter.name, counter.value, timestamp, counter.token, {});
            await this.seriesRepository.saveData(`${counter.name}.rate`, counter.value / intervalInSeconds, timestamp, counter.token, {});
        }

        for (const gauge of aggregate.gauges) {
            await this.seriesRepository.saveData(gauge.name, gauge.value, timestamp, gauge.token, {});
        }

        for (const timing of aggregate.timings) {
            await this.seriesRepository.saveData(`${timing.name}.maximum`, timing.maximum, timestamp, timing.token, {});
            await this.seriesRepository.saveData(`${timing.name}.mean`, timing.mean, timestamp, timing.token, {});
            await this.seriesRepository.saveData(`${timing.name}.median`, timing.median, timestamp, timing.token, {});
            await this.seriesRepository.saveData(`${timing.name}.minimum`, timing.minimum, timestamp, timing.token, {});
            await this.seriesRepository.saveData(`${timing.name}.standardDeviation`, timing.standardDeviation, timestamp, timing.token, {});
        }
    }

    public aggerate(intervalInSeconds: number): Aggregate {

        const aggregateCounters: Counter[] = [];

        for (const token in this.counters)
            for (const name in this.counters[token]) {
                aggregateCounters.push(new Counter(name, this.counters[token][name], this.counters[token][name] / intervalInSeconds, token));
            }

        this.counters = {};

        const aggregateGauges: Gauge[] = [];

        for (const token in this.gauges)
            for (const name in this.gauges[token]) {
                aggregateGauges.push(new Gauge(name, this.gauges[token][name], token));
            }

        const aggregateTimings: Timing[] = [];

        for (const token in this.timings)
            for (const name in this.timings[token]) {
                aggregateTimings.push(new Timing(
                    name,
                    this.statsService.calculateMean(this.timings[token][name]),
                    this.statsService.calculateMedian(this.timings[token][name]),
                    this.statsService.calculateMinimum(this.timings[token][name]),
                    this.statsService.calculateMaximum(this.timings[token][name]),
                    this.statsService.calculateStandardDeviation(this.timings[token][name]),
                    token,
                ));
            }

        this.timings = {};

        return new Aggregate(aggregateCounters, aggregateGauges, aggregateTimings);
    }

    public async getData(name: string, timestamp: number, token: string, tags: {}): Promise<Array<{ timestamp: string, x: number, y: number }>> {
        return this.seriesRepository.getData(name, timestamp, token || 'default', tags);
    }

    public async listNames(token: string): Promise<string[]> {
        return this.seriesRepository.listNames(token || 'default');
    }

    public async clearStaleData(hours: number): Promise<boolean> {
        return this.seriesRepository.clearStaleData(hours);
    }

    private updateCounter(name: string, value: number, token: string): void {

        if (!this.counters[token]) {
            this.counters[token] = {};
        }

        if (!this.counters[token][name]) {
            this.counters[token][name] = value;
        } else {
            this.counters[token][name] += value;
        }
    }

    private updateGauge(name: string, value: number, token: string): void {

        if (!this.gauges[token]) {
            this.gauges[token] = {};
        }

        if (!this.gauges[token][name]) {
            this.gauges[token][name] = value;
        } else {
            this.gauges[token][name] = value;
        }
    }

    private updateTiming(name: string, value: number, token: string): void {
        if (!this.timings[token]) {
            this.timings[token] = {};
        }

        if (!this.timings[token][name]) {
            this.timings[token][name] = [value];
        } else {
            this.timings[token][name].push(value);
        }
    }
}
