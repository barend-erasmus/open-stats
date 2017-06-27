// https://github.com/etsy/statsd/blob/master/docs/metric_types.md

// https://github.com/sivy/node-statsd

// Imports
import * as WebSocket from 'ws'; 

// Imports services
import { MetricService } from './services/metric';

const metricService = new MetricService();

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws: any) => {
  ws.on('message', (message: string) => {
        metricService.log(JSON.parse(message));
  });
});