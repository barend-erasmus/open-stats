// imports
import * as cron from 'cron';
import * as express from "express";
import * as http from "http";
import * as yargs from 'yargs';

import { RESTInterface } from "./rest-interface";
import { TCPAdminInterface } from "./tcp-admin-interface";
import { UDPInterface } from "./udp-interface";
import { WebSocketInterface } from "./web-socket-interface";

// imports services
import { MetricService } from "./services/metric";

// imports repositories
import { MetricRepository as MemoryLiteMetricRepository } from "./repositories//memory-lite/metric";
import { MetricRepository } from "./repositories//mongo-lite/metric";
import { IMetricRepository } from "./repositories/metric";

const argv = yargs.argv;

// const metricRepository: IMetricRepository = new MemoryLiteMetricRepository();
const metricRepository: IMetricRepository = new MetricRepository('mongodb://localhost:27017/open-stats-003');

const metricService: MetricService = new MetricService(metricRepository);

// HTTP Server
const app = express();
const httpServer = http.createServer(app);

// TCP Admin Interface
const tcpAdminInterface: TCPAdminInterface = new TCPAdminInterface("0.0.0.0", 8126, metricService);
tcpAdminInterface.start();

// Web Socket Interface
const websocketInterface: WebSocketInterface = new WebSocketInterface(httpServer, metricService, tcpAdminInterface);

// UDP Interface
const udpInterface: UDPInterface = new UDPInterface("0.0.0.0", 8125, metricService, tcpAdminInterface);
udpInterface.start();

// REST Interface
const restInterface: RESTInterface = new RESTInterface(app, metricService, tcpAdminInterface);

httpServer.listen(argv.port || 3000);

const jobAggregate = new cron.CronJob('0 */1 * * * *', async () => {

    const counterNames: string[] = await metricService.listCounterNames();
    const gaugeNames: string[] = await metricService.listGaugeNames();
    const timingNames: string[] = await metricService.listTimingNames();

    for (const name of counterNames) {
        const counter = await metricService.getCounter(name);

        await metricRepository.saveSeriesData(name, counter.value, new Date().getTime());
    }

    for (const name of gaugeNames) {
        const gauge = await metricService.getGauge(name);

        await metricRepository.saveSeriesData(name, gauge.value, new Date().getTime());
    }

    for (const name of timingNames) {
        const timing = await metricService.getTiming(name);
        const timestamp: number = new Date().getTime();

        await metricRepository.saveSeriesData(`${name}.minimum`, timing.minimum, timestamp);
        await metricRepository.saveSeriesData(`${name}.maximum`, timing.maximum, timestamp);
        await metricRepository.saveSeriesData(`${name}.mean`, timing.mean, timestamp);
        await metricRepository.saveSeriesData(`${name}.stdDev`, timing.standardDeviation, timestamp);
    }

}, null, true);

const jobClearStaleData = new cron.CronJob('0 0 */3 * * *', async () => {

    await metricRepository.clearStaleData(5);

}, null, true);

jobAggregate.start();
jobClearStaleData.start();

metricRepository.clearStaleData(5).then(() => {
    console.log('clearStaleData - Done');
});
