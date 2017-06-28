export class Gauge {
    constructor(
        public name: string,
        public offset: number,
        public unit: string,
        public timestamp: number
    ) {

    }
}