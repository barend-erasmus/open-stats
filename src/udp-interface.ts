// imports
import * as dgram from "dgram";

// imports services
import { MetricService } from "./services/metric";

export class UDPInterface {

    private server: any;

    constructor(
        private host: string,
        private port: number,
        private metricService: MetricService,
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

            await this.metricService.log(type, name, parseFloat(value));
        }
    }
}
