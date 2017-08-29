// https://github.com/etsy/statsd/blob/master/docs/metric_types.md

// https://github.com/sivy/node-statsd

// Imports
import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

// Imports middleware
import * as cors from 'cors';

// Imports services
import { MetricService } from './services/metric';

// Imports repositories
import { MetricRepository } from './repositories/metric';

const metricService = new MetricService(new MetricRepository('mongodb://localhost:27017/open-stats'));

const app = express();

app.use(cors());

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server: server,
  path: '/open-stats'
});

wss.on('connection', (ws: any) => {
  ws.on('message', (message: string) => {

    const data = JSON.parse(message);

    if (data.type === 'test') {
      console.log(message);
    } else {
      console.log(data.type);
      metricService.log(data);
    }
  });
});

app.get('/write', async (req, res) => {
  const data = req.body;
  await metricService.log(data);
  res.send('OK');
});

app.get('/counter', async (req, res) => {
  const result = await metricService.getCounter(req.query.name);
  res.json(result);
});

app.get('/gauge', async (req, res) => {
  const result = await metricService.getGauge(req.query.name);
  res.json(result);
});

app.get('/sampling', async (req, res) => {
  const result = await metricService.getSampling(req.query.name);
  res.json(result);
});

app.get('/timing', async (req, res) => {
  const result = await metricService.getTiming(req.query.name);
  res.json(result);
});


app.get('/list/counters/minute', async (req, res) => {
  const result = await metricService.listCountersPerMinute(req.query.name);
  res.json(result);
});

server.listen(3000);