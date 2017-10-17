// imports
import * as cron from 'cron';
import * as express from "express";
import * as http from "http";
import * as path from 'path';
import * as winston from 'winston';
import * as yargs from 'yargs';

import { RESTInterface } from "./rest-interface";
import { TCPAdminInterface } from "./tcp-admin-interface";
import { UDPInterface } from "./udp-interface";
import { WebSocketInterface } from "./web-socket-interface";

// imports services
import { MetricService } from "./services/metric";

// imports repositories
import { MetricRepository } from "./repositories//mongo-lite/series";
import { ISeriesRepository } from "./repositories/series";

const argv = yargs.argv;

const logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: path.join(__dirname, 'open-stats.log'),
        level: 'info',
      }),
    ],
  });

// HTTP Server
const app = express();
const httpServer = http.createServer(app);

// TCP Admin Interface
const tcpAdminInterface: TCPAdminInterface = new TCPAdminInterface("0.0.0.0", 8126);
tcpAdminInterface.start();

const seriesRepository: ISeriesRepository = new MetricRepository('mongodb://localhost:27017/open-stats-005', (name: string, value: number) => {
    // tcpAdminInterface.sendUpdateToAllSockets(name, value);
});

const metricService: MetricService = new MetricService(seriesRepository, (type: string, name: string, value: number) => {
    tcpAdminInterface.sendUpdateToAllSockets(name, value);
});

// Web Socket Interface
const websocketInterface: WebSocketInterface = new WebSocketInterface(httpServer, metricService);

// UDP Interface
const udpInterface: UDPInterface = new UDPInterface("0.0.0.0", 8125, metricService);
udpInterface.start();

// REST Interface
const restInterface: RESTInterface = new RESTInterface(app, metricService);

httpServer.listen(argv.port || 3000);

const jobAggregate = new cron.CronJob('0 */1 * * * *', async () => {

    await metricService.sendAggerate(60);

    logger.info('metricService.sendAggerate');

}, null, true);

const jobClearStaleData = new cron.CronJob('0 0 */3 * * *', async () => {

    await metricService.clearStaleData(5);

    logger.info('metricService.clearStaleData');

}, null, true);

jobAggregate.start();
jobClearStaleData.start();

metricService.clearStaleData(5).then(() => {
    logger.info('metricService.clearStaleData');
});
