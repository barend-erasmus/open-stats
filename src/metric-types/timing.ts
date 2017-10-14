import { Data } from './data';

export class Timing extends Data {
    constructor(
        name: string,
        value: number,
        unit: string,
        timestamp: number
    ) {
        super('timing', name, value, null, unit, timestamp);
    }
}