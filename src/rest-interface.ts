import * as express from 'express';
import * as path from 'path';

import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as exphbs from 'express-handlebars';

// imports services
import { MetricService } from "./services/metric";

// imports models
import { Counter } from "./models/counter";
import { Gauge } from "./models/gauge";
import { Timing } from "./models/timing";

export class RESTInterface {

  constructor(
    private app: any,
    private metricService: MetricService,
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
    this.app.use('/coverage', express.static(path.join(__dirname, './../coverage/lcov-report')));

    this.app.post("/api/metrics/log", async (req, res) => {
      const data: any = req.body;
      await this.metricService.log(data.type, data.name, data.value, data.token, data.tags);

      res.send("OK");
    });

    this.app.get("/api/metrics/names", async (req, res) => {
      const result: string[] = await this.metricService.listNames(req.query.token);
      res.json(result);
    });

    this.app.post("/api/metrics/series", async (req, res) => {
      const result: Array<{ timestamp: string, x: number, y: number }> = await this.metricService.getData(req.body.name, parseInt(req.body.timestamp, undefined), req.body.token, req.body.tags);
      res.json(result);
    });

    this.app.post("/api/metrics/seriesAggregated", async (req, res) => {
      const result: Array<{ timestamp: string, x: number, y: number }> = await this.metricService.getAggregatedData(req.body.name, parseInt(req.body.timestamp, undefined), req.body.token, req.body.tags, req.body.aggregate, parseInt(req.body.intervalInMinutes, undefined));
      res.json(result);
    });

    this.app.get("/api/metrics/chart", async (req, res) => {
      res.render('api/metrics/chart');
    });
  }
}
