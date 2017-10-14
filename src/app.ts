// Imports
import * as express from 'express';
import * as http from 'http';

import { TCPAdminInterface } from './tcp-admin-interface';
import { WebSocketInterface } from './web-socket-interface';
import { UDPInterface } from './udp-interface';

import { IMetricRepository } from './repositories/metric';

// Imports models
import { Data } from './metric-types/data';
import { Counter } from './models/counter';
import { Gauge } from './models/gauge';
import { Timing } from './models/timing';

// Imports middleware
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

// Imports services
import { MetricService } from './services/metric';

// Imports repositories
import { MetricRepository } from './repositories//memory-lite/metric';

const metricRepository: IMetricRepository = new MetricRepository();

const metricService: MetricService = new MetricService(metricRepository);

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({}));

// HTTP Server
const httpServer = http.createServer(app);

// TCP Admin Interface
const tcpAdminInterface: TCPAdminInterface = new TCPAdminInterface('127.0.0.1', 8126, metricService);
tcpAdminInterface.start();

// Web Socket Interface
const websocketInterface: WebSocketInterface = new WebSocketInterface(httpServer, metricService);

// UDP Interface
const udpInterface: UDPInterface = new UDPInterface('127.0.0.1', 8125, metricService, tcpAdminInterface);
udpInterface.start();


// REST Interface
app.post('/log', async (req, res) => {
  const data: Data = req.body;
  await metricService.log(data);
  res.send('OK');
});

app.get('/counter', async (req, res) => {
  const result: Counter = await metricService.getCounter(req.query.name);
  res.json(result);
});

app.get('/gauge', async (req, res) => {
  const result: Gauge = await metricService.getGauge(req.query.name);
  res.json(result);
});

app.get('/timing', async (req, res) => {
  const result: Timing = await metricService.getTiming(req.query.name);
  res.json(result);
});

app.get('/list/counters/second', async (req, res) => {
  const result: Counter[] = await metricService.listCountersPerSecond(req.query.name);
  res.json(result);
});

app.get('/list/counters/minute', async (req, res) => {
  const result: Counter[] = await metricService.listCountersPerMinute(req.query.name);
  res.json(result);
});

app.get('/list/counters/hour', async (req, res) => {
  const result: Counter[] = await metricService.listCountersPerHour(req.query.name);
  res.json(result);
});

app.get('/list/counters/day', async (req, res) => {
  const result: Counter[] = await metricService.listCountersPerDay(req.query.name);
  res.json(result);
});

httpServer.listen(3000);