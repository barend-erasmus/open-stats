import { expect } from "chai";
import "mocha";

import { StatsService } from "./stats";

describe("StatsService", () => {
    describe("calculateMaximum", () => {
        it("should return maximum", () => {
            const statsService: StatsService = new StatsService();

            const result: number = statsService.calculateMaximum([10, 5, 50, 1]);
            expect(result).to.be.eq(50);
        });
    });

    describe("calculateMean", () => {
        it("should return mean", () => {
            const statsService: StatsService = new StatsService();

            const result: number = statsService.calculateMean([10, 5, 50, 1]);
            expect(result).to.be.eq(16.5);
        });
    });

    describe("calculateMedian", () => {
        it("should return median", () => {
            const statsService: StatsService = new StatsService();

            const result: number = statsService.calculateMedian([10, 5, 50, 1]);
            expect(result).to.be.eq(7.5);
        });
    });

    describe("calculateMinimum", () => {
        it("should return minimum", () => {
            const statsService: StatsService = new StatsService();

            const result: number = statsService.calculateMinimum([10, 5, 50, 1]);
            expect(result).to.be.eq(1);
        });
    });

    describe("calculateStandardDeviation", () => {
        it("should return standard deviation", () => {
            const statsService: StatsService = new StatsService();

            const result: number = statsService.calculateStandardDeviation([10, 5, 50, 1]);
            expect(result).to.be.eq(19.60229578391266);
        });
    });

    describe("recalculateStandardDeviation", () => {
        it("should return standard deviation", () => {
            const statsService: StatsService = new StatsService();

            const result: number = statsService.recalculateStandardDeviation(
                statsService.calculateSum([10, 5, 50, 1]),
                [10, 5, 50, 1].length,
                statsService.calculateSum([10, 5, 50, 1].map((x) => Math.pow(x, 2))),
            );
            expect(result).to.be.eq(19.60229578391266);
        });
    });

    describe("calculateSum", () => {
        it("should return sum", () => {
            const statsService: StatsService = new StatsService();

            const result: number = statsService.calculateSum([10, 5, 50, 1]);
            expect(result).to.be.eq(66);
        });
    });
});
