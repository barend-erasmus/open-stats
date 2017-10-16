import { Counter } from "./../models/counter";
import { Gauge} from "./../models/gauge";
import { Timing } from "./../models/timing";

export class Aggregate {
    constructor(public counters: Counter[], public gauges: Gauge[], public timings: Timing[]) {

    }
}
