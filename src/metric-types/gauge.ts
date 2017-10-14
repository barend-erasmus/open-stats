import { Data } from './data';

export class Gauge extends Data {
    constructor(
        name: string,
        value: number,
        offset: number,
        unit: string,
        timestamp: number
    ) {
        super('gauge', name, value, offset, unit, timestamp);
    }
}