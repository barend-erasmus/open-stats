import { expect } from "chai";
import "mocha";
import * as moment from 'moment';
import * as uuid from 'uuid';

import { SeriesRepository } from "./series";

describe("SeriesRepository", () => {
    describe("getData", () => {
        it("should return data with greater timestamp", async () => {
            const timestamp = new Date();

            const seriesRepository: SeriesRepository = new SeriesRepository('mongodb://localhost:27017/open-stats-testdb', null);

            const randomId = uuid.v4();

            await seriesRepository.saveData(`simple.data-${randomId}`, 10, moment(timestamp).subtract(4, 'minute').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 15, moment(timestamp).subtract(3, 'minute').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 20, moment(timestamp).subtract(2, 'minute').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(1, 'minute').toDate().getTime(), 'token', {});

            const result = await seriesRepository.getData(`simple.data-${randomId}`, moment(timestamp).subtract(5, 'minute').toDate().getTime(), 'token', {});

            expect(result.length).to.be.eq(4);
        });

        it("should return no data given other token", async () => {
            const timestamp = new Date();

            const seriesRepository: SeriesRepository = new SeriesRepository('mongodb://localhost:27017/open-stats-testdb', null);

            const randomId = uuid.v4();

            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(1, 'minute').toDate().getTime(), 'token', {});

            const result = await seriesRepository.getData(`simple.data-${randomId}`, moment(timestamp).subtract(2, 'minute').toDate().getTime(), 'other-token', {});

            expect(result.length).to.be.eq(0);
        });

        it("should return no data given other name", async () => {
            const timestamp = new Date();

            const seriesRepository: SeriesRepository = new SeriesRepository('mongodb://localhost:27017/open-stats-testdb', null);

            const randomId = uuid.v4();

            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(1, 'minute').toDate().getTime(), 'token', {});

            const result = await seriesRepository.getData(`other.simple.data-${randomId}`, moment(timestamp).subtract(2, 'minute').toDate().getTime(), 'token', {});

            expect(result.length).to.be.eq(0);
        });

        it("should return data given tag", async () => {
            const timestamp = new Date();

            const seriesRepository: SeriesRepository = new SeriesRepository('mongodb://localhost:27017/open-stats-testdb', null);

            const randomId = uuid.v4();

            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(1, 'minute').toDate().getTime(), 'token', {
                hostname: 'my-hostname',
            });

            const result = await seriesRepository.getData(`simple.data-${randomId}`, moment(timestamp).subtract(2, 'minute').toDate().getTime(), 'token', {
                hostname: 'my-hostname',
            });

            expect(result.length).to.be.eq(1);
        });

        it("should return data given parital tag match", async () => {
            const timestamp = new Date();

            const seriesRepository: SeriesRepository = new SeriesRepository('mongodb://localhost:27017/open-stats-testdb', null);

            const randomId = uuid.v4();

            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(1, 'minute').toDate().getTime(), 'token', {
                hostname: 'my-hostname-1',
                environment: 'live'
            });

            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(1, 'minute').toDate().getTime(), 'token', {
                hostname: 'my-hostname-2',
                environment: 'live'
            });

            const result = await seriesRepository.getData(`simple.data-${randomId}`, moment(timestamp).subtract(2, 'minute').toDate().getTime(), 'token', {
                environment: 'live',
            });

            expect(result.length).to.be.eq(2);
        });

        it("should return no data given other tag", async () => {
            const timestamp = new Date();

            const seriesRepository: SeriesRepository = new SeriesRepository('mongodb://localhost:27017/open-stats-testdb', null);

            const randomId = uuid.v4();

            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(1, 'minute').toDate().getTime(), 'token', {
                hostname: 'my-hostname',
            });

            const result = await seriesRepository.getData(`simple.data-${randomId}`, moment(timestamp).subtract(2, 'minute').toDate().getTime(), 'token', {
                hostname: 'my-other-hostname',
            });

            expect(result.length).to.be.eq(0);
        });
    });

    describe("getAggregatedData", () => {
        it("should return data with greater timestamp", async () => {
            const timestamp = new Date(2017, 1, 1, 13, 40, 0);

            const seriesRepository: SeriesRepository = new SeriesRepository('mongodb://localhost:27017/open-stats-testdb', null);

            const randomId = uuid.v4();

            await seriesRepository.saveData(`simple.data-${randomId}`, 6, moment(timestamp).subtract(180, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 5, moment(timestamp).subtract(170, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 4, moment(timestamp).subtract(160, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 3, moment(timestamp).subtract(150, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 2, moment(timestamp).subtract(140, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 1, moment(timestamp).subtract(130, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 2, moment(timestamp).subtract(120, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 3, moment(timestamp).subtract(110, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 4, moment(timestamp).subtract(100, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 5, moment(timestamp).subtract(90, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 6, moment(timestamp).subtract(80, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 7, moment(timestamp).subtract(70, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 8, moment(timestamp).subtract(60, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 9, moment(timestamp).subtract(50, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 10, moment(timestamp).subtract(40, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 15, moment(timestamp).subtract(30, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 20, moment(timestamp).subtract(20, 'second').toDate().getTime(), 'token', {});
            await seriesRepository.saveData(`simple.data-${randomId}`, 25, moment(timestamp).subtract(10, 'second').toDate().getTime(), 'token', {});

            const result = await seriesRepository.getAggregatedData(`simple.data-${randomId}`, moment(timestamp).subtract(5, 'minute').toDate().getTime(), 'token', {}, 'average', 1);

            expect(result.length).to.be.eq(3);
        });
        
    });
});
