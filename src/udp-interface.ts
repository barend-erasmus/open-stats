// imports
import * as dgram from "dgram";

import { TCPAdminInterface } from "./tcp-admin-interface";

// imports services
import { MetricService } from "./services/metric";

// imports models
import { Data } from "./metric-types/data";

export class UDPInterface {

    private server: any;

    constructor(
        private host: string,
        private port: number,
        private metricService: MetricService,
        private tcpAdminInterface: TCPAdminInterface,
    ) {

        this.server = dgram.createSocket("udp4");

        this.server.on("message", (data: Buffer, remote: any) => this.onMessage(data, remote));
    }

    public start(): void {
        this.server.bind(this.port, this.host);
    }

    private async onMessage(dataBuffer: Buffer, remote: any): Promise<void> {
        const messages: string[] = dataBuffer.toString().split(/\n/g);

        for (const message of messages) {
            const name: string = message.substring(0, message.indexOf(":"));
            const value: string = message.substring(message.indexOf(":") + 1, message.indexOf("|"));
            const letter: string = message.substring(message.indexOf("|") + 1);

            let type: string = null;

            switch (letter) {
                case "c":
                    type = "counter";
                    break;
                case "g":
                    type = "gauge";
                    break;
                case "ms":
                    type = "timing";
                    break;
            }

            const data: Data = new Data(
                type,
                name,
                type === "gauge" && (value.startsWith("+") || value.startsWith("-")) ? null : parseFloat(value),
                type === "gauge" && (value.startsWith("+") || value.startsWith("-")) ? parseFloat(value) : null,
                null,
                new Date().getTime(),
            );

            await this.metricService.log(data);

            await this.tcpAdminInterface.sendUpdateToAllSockets(data);
        }
    }
}
