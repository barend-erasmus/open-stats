// https://github.com/etsy/statsd/blob/master/docs/metric_types.md

// https://github.com/sivy/node-statsd

// Imports
import * as express from 'express';
import * as http from 'http';
import * as co from 'co';
import * as WebSocket from 'ws';

// Imports middleware
import * as cors from 'cors';

// Imports services
import { MetricService } from './services/metric';

// Imports repositories
import { MetricRepository } from './repositories/metric';

const metricService = new MetricService(new MetricRepository('mongodb://mongo:27017/open-stats'));

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

app.get('/log', (req, res) => {
  co(function* () {
    const data = req.body;
    metricService.log(data);
  });
});

app.get('/counter', (req, res) => {
  co(function* () {
    const result = yield metricService.getCounter(req.query.name);
    res.json(result);
  });
});

app.get('/gauge', (req, res) => {
  co(function* () {
    const result = yield metricService.getGauge(req.query.name);
    res.json(result);
  });
});

app.get('/sampling', (req, res) => {
  co(function* () {
    const result = yield metricService.getSampling(req.query.name);
    res.json(result);
  });
});

app.get('/timing', (req, res) => {
  co(function* () {
    const result = yield metricService.getTiming(req.query.name);
    res.json(result);
  });
});


app.get('/list/counters/second', (req, res) => {
  co(function* () {
    const result = yield metricService.listCountersPerSecond(req.query.name);
    res.json(result);
  });
});

app.get('/list/counters/minute', (req, res) => {
  co(function* () {
    const result = yield metricService.listCountersPerMinute(req.query.name);
    res.json(result);
  });
});

app.get('/list/counters/hour', (req, res) => {
  co(function* () {
    const result = yield metricService.listCountersPerHour(req.query.name);
    res.json(result);
  });
});

app.get('/list/counters/day', (req, res) => {
  co(function* () {
    const result = yield metricService.listCountersPerDay(req.query.name);
    res.json(result);
  });
});

server.listen(3000);