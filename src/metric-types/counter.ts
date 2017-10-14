import { Data } from './data';

export class Counter extends Data {
    constructor(
        name: string,
        value: number,
        unit: string,
        timestamp: number
    ) {
        super('counter', name, value, null, unit, timestamp);
    }
}