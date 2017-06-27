export class Gauge {
    constructor(
        public name: string,
        public value: number,
        public offset: number,
        public unit: string,
        public timestamp: number
    ) {

    }
}