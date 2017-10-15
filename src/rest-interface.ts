import * as path from 'path';

import { TCPAdminInterface } from "./tcp-admin-interface";

import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as exphbs from 'express-handlebars';

// imports services
import { MetricService } from "./services/metric";

// imports models
import { Data } from "./metric-types/data";
import { Counter } from "./models/counter";
import { Gauge } from "./models/gauge";
import { Timing } from "./models/timing";

export class RESTInterface {

  constructor(
    private app: any,
    private metricService: MetricService,
    private tcpAdminInterface: TCPAdminInterface,
  ) {

    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json({}));

    app.engine('handlebars', exphbs({
      defaultLayout: 'main',
      layoutsDir: path.join(__dirname, 'views/layouts'),
    }));

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'handlebars');

    this.initialize();
  }

  private initialize(): void {
    this.app.post("/log", async (req, res) => {
      const data: Data = req.body;
      await this.metricService.log(data);
      await this.tcpAdminInterface.sendUpdateToAllSockets(data);

      res.send("OK");
    });

    this.app.get("/series", async (req, res) => {
      const result: Array<{ x: number, y: number }> = await this.metricService.getSeriesData(req.query.name, parseInt(req.query.timestamp, undefined));
      res.json(result);
    });

    this.app.get("/counter", async (req, res) => {
      const result: Counter = await this.metricService.getCounter(req.query.name);
      res.json(result);
    });

    this.app.get("/counters", async (req, res) => {
      const result: string[] = await this.metricService.listCounterNames();
      res.json(result);
    });

    this.app.get("/gauge", async (req, res) => {
      const result: Gauge = await this.metricService.getGauge(req.query.name);
      res.json(result);
    });

    this.app.get("/gauges", async (req, res) => {
      const result: string[] = await this.metricService.listGaugeNames();
      res.json(result);
    });

    this.app.get("/timing", async (req, res) => {
      const result: Timing = await this.metricService.getTiming(req.query.name);
      res.json(result);
    });

    this.app.get("/timings", async (req, res) => {
      const result: string[] = await this.metricService.listTimingNames();
      res.json(result);
    });

    this.app.get("/chart", async (req, res) => {
      res.render('home');
    });
  }
}
