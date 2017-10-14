// imports interfaces
import { IMetricRepository } from "./../metric";

import { StatsService } from "./../../services/stats";

// imports metric types
import { Counter } from "./../../metric-types/counter";
import { Data } from "./../../metric-types/data";
import { Gauge } from "./../../metric-types/gauge";
import { Timing } from "./../../metric-types/timing";

export class MetricRepository implements IMetricRepository {

    private static counters: {} = {};
    private static gauges: {} = {};
    private static timings: {} = {};

    private statsService: StatsService = new StatsService();

    public async saveMetric(metric: Data): Promise<boolean> {

        if (metric.type === "counter") {
            const existingMetric = MetricRepository.counters[metric.name];

            if (existingMetric) {
                MetricRepository.counters[metric.name] += metric.value;
            } else {
                MetricRepository.counters[metric.name] = metric.value;
            }
        } else if (metric.type === "gauge") {
            const existingMetric = MetricRepository.gauges[metric.name];

            if (existingMetric) {
                if (metric.value) {
                    MetricRepository.gauges[metric.name] = metric.value;
                } else if (metric.offset) {
                    MetricRepository.gauges[metric.name] += metric.offset;
                }
            } else {
                MetricRepository.gauges[metric.name] = metric.value;
            }
        } else if (metric.type === "timing") {
            const existingMetric = MetricRepository.timings[metric.name];
            if (existingMetric) {
                MetricRepository.timings[metric.name].sum += metric.value;
                MetricRepository.timings[metric.name].sumSquared += Math.pow(metric.value, 2);
                MetricRepository.timings[metric.name].minimum = metric.value < existingMetric.minimum ? metric.value : existingMetric.minimum;
                MetricRepository.timings[metric.name].maximum = metric.value > existingMetric.maximum ? metric.value : existingMetric.maximum;
                MetricRepository.timings[metric.name].count += 1;
            } else {
                MetricRepository.timings[metric.name] = {
                    count: 1,
                    maximum: metric.value,
                    minimum: metric.value,
                    sum: metric.value,
                    sumSquared: Math.pow(metric.value, 2),
                };
            }
        }

        return true;
    }

    public async calculateCounterSum(name: string): Promise<number> {

        const metric = MetricRepository.counters[name];

        return metric ? metric : 0;
    }

    public async listCountersPerSecond(name: string): Promise<Counter[]> {
        return [];
    }

    public async listCountersPerMinute(name: string): Promise<Counter[]> {
        return [];
    }

    public async listCountersPerHour(name: string): Promise<Counter[]> {
        return [];
    }

    public async listCountersPerDay(name: string): Promise<Counter[]> {
        return [];
    }

    public async calculateGaugeValue(name: string): Promise<number> {
        const metric = MetricRepository.gauges[name];

        return metric ? metric : 0;
    }

    public async calculateTimingMean(name: string): Promise<number> {
        const metric = MetricRepository.timings[name];

        return metric ? metric.sum / metric.count : 0;
    }

    public async calculateTimingMinimum(name: string): Promise<number> {
        const metric = MetricRepository.timings[name];

        return metric ? metric.minimum : 0;
    }

    public async calculateTimingMaximum(name: string): Promise<number> {
        const metric = MetricRepository.timings[name];

        return metric ? metric.maximum : 0;
    }

    public async calculateTimingStandardDeviation(name: string): Promise<number> {
        const metric = MetricRepository.timings[name];

        return metric ? this.statsService.recalculateStandardDeviation(metric.sum, metric.count, metric.sumSquared) : 0;
    }
}