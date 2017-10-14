// Imports
import * as WebSocket from 'ws';

// Imports services
import { MetricService } from './services/metric';

// Imports models
import { Data } from './metric-types/data';

export class WebSocketInterface {
    
    private server: any;

    constructor(private httpServer: any, private metricService: MetricService) {
        this.server = new WebSocket.Server({
            server: this.httpServer,
            path: '/open-stats'
        });

        this.server.on('connection', this.onConnect);
    }

    private onConnect(ws: any): void {
        ws.on('message', this.onMessage);
    }

    private onMessage(message: string): void {
        const data: Data = JSON.parse(message);
        this.metricService.log(data);
    }
}