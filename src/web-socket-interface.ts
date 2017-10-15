// imports
import * as WebSocket from "ws";

import { TCPAdminInterface } from "./tcp-admin-interface";

// imports services
import { MetricService } from "./services/metric";

// imports models
import { Data } from "./metric-types/data";

export class WebSocketInterface {

    private server: any;

    constructor(
        private httpServer: any,
        private metricService: MetricService,
        private tcpAdminInterface: TCPAdminInterface) {
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
        const data: Data = JSON.parse(message);
        await this.metricService.log(data);

        await this.tcpAdminInterface.sendUpdateToAllSockets(data);
    }
}
