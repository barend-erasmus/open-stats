// https://github.com/etsy/statsd/blob/master/docs/metric_types.md

// https://github.com/sivy/node-statsd

// Imports
import * as co from 'co';
import * as WebSocket from 'ws';

// Imports services
import { MetricService } from './services/metric';

// Imports repositories
import { MetricRepository } from './repositories/metric';

const metricService = new MetricService(new MetricRepository('mongodb://mongo:27017/open-stats'));

const wss = new WebSocket.Server({ port: 3000, path: '/open-stats' });

wss.on('connection', (ws: any) => {
  ws.on('message', (message: string) => {


    const data = JSON.parse(message);

    if (data.type === 'test') {
      console.log(message);
    } else {
      metricService.log(data);
    }
  });
});

