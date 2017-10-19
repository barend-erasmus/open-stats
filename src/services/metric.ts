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
                this.updateCounter(name, value, token || 'default', tags);
                break;
            case 'gauge':
                this.updateGauge(name, value, token || 'default', tags);
                break;
            case 'timing':
                this.updateTiming(name, value, token || 'default', tags);
                break;
            case 'series':
                await this.seriesRepository.saveData(name, value, new Date().getTime(), token || 'default', tags);
                break;
        }

        this.updateCounter('open-stats.metrics', 1, token || 'default', tags);

        if (this.onLog) {
            this.onLog(type, name, value, tags);
        }
    }

    public async sendAggerate(intervalInSeconds: number): Promise<void> {

        const timestamp: number = new Date().getTime();

        const aggregate: Aggregate = this.aggerate(intervalInSeconds);

        for (const counter of aggregate.counters) {
            await this.seriesRepository.saveData(counter.name, counter.value, timestamp, counter.token, counter.tags);
            await this.seriesRepository.saveData(`${counter.name}.rate`, counter.value / intervalInSeconds, timestamp, counter.token, counter.tags);
        }

        for (const gauge of aggregate.gauges) {
            await this.seriesRepository.saveData(gauge.name, gauge.value, timestamp, gauge.token, gauge.tags);
        }

        for (const timing of aggregate.timings) {
            await this.seriesRepository.saveData(`${timing.name}.maximum`, timing.maximum, timestamp, timing.token, timing.tags);
            await this.seriesRepository.saveData(`${timing.name}.mean`, timing.mean, timestamp, timing.token, timing.tags);
            await this.seriesRepository.saveData(`${timing.name}.median`, timing.median, timestamp, timing.token, timing.tags);
            await this.seriesRepository.saveData(`${timing.name}.minimum`, timing.minimum, timestamp, timing.token, timing.tags);
            await this.seriesRepository.saveData(`${timing.name}.standardDeviation`, timing.standardDeviation, timestamp, timing.token, timing.tags);
        }
    }

    public aggerate(intervalInSeconds: number): Aggregate {

        const aggregateCounters: Counter[] = [];

        for (const token in this.counters) {
            for (const tagBucket in this.counters[token]) {
                for (const name in this.counters[token][tagBucket]) {
                    aggregateCounters.push(new Counter(name, this.counters[token][tagBucket][name].value, this.counters[token][tagBucket][name].value / intervalInSeconds, token, this.counters[token][tagBucket][name].tags));
                }
            }
        }

        this.counters = {};

        const aggregateGauges: Gauge[] = [];

        for (const token in this.gauges) {
            for (const tagBucket in this.gauges[token]) {
                for (const name in this.gauges[token][tagBucket]) {
                    aggregateGauges.push(new Gauge(name, this.gauges[token][tagBucket][name].value, token, this.gauges[token][tagBucket][name].tags));
                }
            }
        }

        const aggregateTimings: Timing[] = [];

        for (const token in this.timings) {
            for (const tagBucket in this.timings[token]) {
                for (const name in this.timings[token][tagBucket]) {
                    aggregateTimings.push(new Timing(
                        name,
                        this.statsService.calculateMean(this.timings[token][tagBucket][name].values),
                        this.statsService.calculateMedian(this.timings[token][tagBucket][name].values),
                        this.statsService.calculateMinimum(this.timings[token][tagBucket][name].values),
                        this.statsService.calculateMaximum(this.timings[token][tagBucket][name].values),
                        this.statsService.calculateStandardDeviation(this.timings[token][tagBucket][name].values),
                        token,
                        this.timings[token][tagBucket][name].tags,
                    ));
                }
            }
        }

        this.timings = {};

        return new Aggregate(aggregateCounters, aggregateGauges, aggregateTimings);
    }

    public async getData(name: string, timestamp: number, token: string, tags: {}): Promise<Array<{ timestamp: string, x: number, y: number, tags: {} }>> {
        return this.seriesRepository.getData(name, timestamp, token || 'default', tags);
    }

    public async getAggregatedData(name: string, timestamp: number, token: string, tags: {}, aggregate: string, intervalInMinutes: number): Promise<Array<{ timestamp: string, x: number, y: number, tags: {} }>> {
        return this.seriesRepository.getAggregatedData(name, timestamp, token || 'default', tags, aggregate || 'average', intervalInMinutes || 1);
    }

    public async listNames(token: string): Promise<string[]> {
        return this.seriesRepository.listNames(token || 'default');
    }

    public async clearStaleData(hours: number): Promise<boolean> {
        return this.seriesRepository.clearStaleData(hours);
    }

    private updateCounter(name: string, value: number, token: string, tags: {}): void {

        const tagBucket: string = tags && Object.keys(tags).length > 0 ? Object.keys(tags).map((x) => `${x}:${tags[x]}`).sort().join(',') : 'default';

        if (!this.counters[token]) {
            this.counters[token] = {};
        }

        if (!this.counters[token][tagBucket]) {
            this.counters[token][tagBucket] = {};
        }

        if (!this.counters[token][tagBucket][name]) {
            this.counters[token][tagBucket][name] = {
                tags,
                value,
            };
        } else {
            this.counters[token][tagBucket][name].value += value;
        }
    }

    private updateGauge(name: string, value: number, token: string, tags: {}): void {

        const tagBucket: string = tags && Object.keys(tags).length > 0 ? Object.keys(tags).map((x) => `${x}:${tags[x]}`).sort().join(',') : 'default';

        if (!this.gauges[token]) {
            this.gauges[token] = {};
        }

        if (!this.gauges[token][tagBucket]) {
            this.gauges[token][tagBucket] = {};
        }

        if (!this.gauges[token][tagBucket][name]) {
            this.gauges[token][tagBucket][name] = {
                tags,
                value,
            };
        } else {
            this.gauges[token][tagBucket][name].value = value;
        }
    }

    private updateTiming(name: string, value: number, token: string, tags: {}): void {

        const tagBucket: string = tags && Object.keys(tags).length > 0 ? Object.keys(tags).map((x) => `${x}:${tags[x]}`).sort().join(',') : 'default';

        if (!this.timings[token]) {
            this.timings[token] = {};
        }

        if (!this.timings[token][tagBucket]) {
            this.timings[token][tagBucket] = {};
        }

        if (!this.timings[token][tagBucket][name]) {
            this.timings[token][tagBucket][name] = {
                tags,
                values: [value],
            };
        } else {
            this.timings[token][tagBucket][name].values.push(value);
        }
    }
}
