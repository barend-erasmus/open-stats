// https://github.com/etsy/statsd/blob/master/docs/metric_types.md

// https://github.com/sivy/node-statsd

// Imports
import * as co from 'co';
import * as WebSocket from 'ws'; 

// Imports services
import { MetricService } from './services/metric';

// Imports repositories
import { MetricRepository } from './repositories/metric';

const metricService = new MetricService(new MetricRepository('mongodb://localhost:27017/open-stats'));


co(function* () {
  yield metricService.log({
    type: 'counter',
    name: 'requests',
    value: 1,
    unit: null,
    timestamp: new Date().getTime()
  });

  console.log('DONE');

  const a = yield metricService.getCounter('requests');

  console.log(a);

});

// const wss = new WebSocket.Server({ port: 3000 });

// wss.on('connection', (ws: any) => {
//   ws.on('message', (message: string) => {
//         metricService.log(JSON.parse(message));
//   });
// });

