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

    public async _onMessage(dataBuffer: Buffer, remote: any): Promise<void> {
        return this.onMessage(dataBuffer, remote);
    }

    private async onMessage(dataBuffer: Buffer, remote: any): Promise<void> {
        const messages: string[] = dataBuffer.toString().split(/\n/g);

        for (const message of messages) {

            const splittedMessage: string[] = message.split('|');

            const name: string = splittedMessage[0].split(':')[0];
            const value: string = splittedMessage[0].split(':')[1];
            const letter: string = splittedMessage[1];

            const tags: {} = {};

            const rawTags: string[] = splittedMessage[2] ? splittedMessage[2].substring(1).split(',') : [];

            for (const item of rawTags) {
                tags[item.split(':')[0]] = item.split(':')[1];
            }

            const token: string = tags.token;
            tags.token = undefined;

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
                case "s":
                    type = "series";
                    break;
            }

            await this.metricService.log(type, name, parseFloat(value), token, tags);
        }
    }
}
