// imports
import * as net from "net";

// imports models
import { Data } from "./metric-types/data";
import { Counter } from "./models/counter";
import { Gauge } from "./models/gauge";
import { Timing } from "./models/timing";

// imports services
import { MetricService } from "./services/metric";

export class TCPAdminInterface {

    private server: any;
    private sockets: any[] = [];

    constructor(
        private host: string,
        private port: number,
        private metricService: MetricService,
    ) {
        this.server = net.createServer((socket: any) => this.onConnect(socket));
    }

    public start(): void {
        this.server.listen(this.port, this.host);
    }

    public async sendUpdateToAllSockets(data: Data): Promise<void> {
        for (const socket of this.sockets) {
            try {
                if (data.type === "counter") {
                    const metric: Counter = await this.metricService.getCounter(data.name);
                    socket.write(`${metric.name}: ${metric.value}\r\n`);
                } else if (data.type === "gauge") {
                    const metric: Gauge = await this.metricService.getGauge(data.name);
                    socket.write(`${metric.name}: ${metric.value}\r\n`);
                } else if (data.type === "timing") {
                    const metric: Timing = await this.metricService.getTiming(data.name);
                    socket.write(`${metric.name}.minimum: ${metric.minimum}\r\n`);
                    socket.write(`${metric.name}.maximum: ${metric.maximum}\r\n`);
                    socket.write(`${metric.name}.mean: ${metric.mean}\r\n`);
                    socket.write(`${metric.name}.stdDev: ${metric.standardDeviation}\r\n`);
                }
            } catch (error) {
                this.sockets.splice(this.sockets.indexOf(socket) , 1);
            }
        }
    }

    private onConnect(socket: any): void {
        this.sockets.push(socket);
    }
}
