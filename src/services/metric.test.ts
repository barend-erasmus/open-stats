import { expect } from "chai";
import "mocha";

import { MetricService } from "./metric";

import { Aggregate } from './../models/aggregate';

describe("MetricService", () => {
    describe("log - Counter", () => {
        it("should return value given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('counter', 'simple.counter', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.counters[0].value).to.be.eq(5);
        });

        it("should return rate given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('counter', 'simple.counter', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.counters[0].rate).to.be.eq(0.5);
        });

        it("should return value given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('counter', 'simple.counter', 5, 'token', {});
            await metricService.log('counter', 'simple.counter', -2, 'token', {});
            await metricService.log('counter', 'simple.counter', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.counters[0].value).to.be.eq(13);
        });

        it("should return rate given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('counter', 'simple.counter', 5, 'token', {});
            await metricService.log('counter', 'simple.counter', -2, 'token', {});
            await metricService.log('counter', 'simple.counter', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.counters[0].rate).to.be.eq(1.3);
        });

        it("should clear counters when aggregate is called", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('counter', 'simple.counter', 5, 'token', {});

            metricService.aggerate(10);

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.counters.length).to.be.eq(0);
        });
    });

    describe("log - Gauge", () => {
        it("should return value given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('gauge', 'simple.gauge', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.gauges[0].value).to.be.eq(5);
        });

        it("should return value given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('gauge', 'simple.gauge', 5, 'token', {});
            await metricService.log('gauge', 'simple.gauge', -2, 'token', {});
            await metricService.log('gauge', 'simple.gauge', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.gauges[0].value).to.be.eq(10);
        });

        it("should not clear gauges when aggregate is called", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('gauge', 'simple.gauge', 5, 'token', {});

            metricService.aggerate(10);

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.gauges.length).to.be.eq(1);
        });
    });

    describe("log - Timing", () => {
        it("should return mimimum given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].minimum).to.be.eq(5);
        });

        it("should return minimum given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});
            await metricService.log('timing', 'simple.timing', -2, 'token', {});
            await metricService.log('timing', 'simple.timing', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].minimum).to.be.eq(-2);
        });

        it("should return maximum given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].maximum).to.be.eq(5);
        });

        it("should return maximum given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});
            await metricService.log('timing', 'simple.timing', -2, 'token', {});
            await metricService.log('timing', 'simple.timing', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].maximum).to.be.eq(10);
        });

        it("should return mean given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].mean).to.be.eq(5);
        });

        it("should return mean given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});
            await metricService.log('timing', 'simple.timing', -2, 'token', {});
            await metricService.log('timing', 'simple.timing', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].mean).to.be.eq(4.333333333333333);
        });

        it("should return median given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].median).to.be.eq(5);
        });

        it("should return median given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});
            await metricService.log('timing', 'simple.timing', -2, 'token', {});
            await metricService.log('timing', 'simple.timing', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].median).to.be.eq(5);
        });

        it("should return standard deviation given single log value", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].standardDeviation).to.be.eq(0);
        });

        it("should return standard deviation given multiple log values", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});
            await metricService.log('timing', 'simple.timing', -2, 'token', {});
            await metricService.log('timing', 'simple.timing', 10, 'token', {});

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings[0].standardDeviation).to.be.eq(4.9216076867444665);
        });

        it("should clear timings when aggregate is called", async () => {
            const metricService: MetricService = new MetricService(null, null);

            await metricService.log('timing', 'simple.timing', 5, 'token', {});

            metricService.aggerate(10);

            const aggregate: Aggregate = metricService.aggerate(10);

            expect(aggregate.timings.length).to.be.eq(0);
        });
    });
});
