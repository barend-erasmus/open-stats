// imports
import * as WebSocket from "ws";

// imports services
import { MetricService } from "./services/metric";

export class WebSocketInterface {

    private server: any;

    constructor(
        private httpServer: any,
        private metricService: MetricService,
    ) {
        this.server = new WebSocket.Server({
            path: '/open-stats',
            server: this.httpServer,
        });

        this.server.on("connection", this.onConnect);
    }

    private onConnect(ws: any): void {
        ws.on("message", (message) => this.onMessage(message));
    }

    private async onMessage(message: string): Promise<void> {
        const data: any = JSON.parse(message);
        await this.metricService.log(data.type, data.name, data.value, data.token);

    }
}
