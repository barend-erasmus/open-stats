import { expect } from "chai";
import "mocha";
import * as sinon from 'sinon';

import { MetricService } from "./services/metric";
import { UDPInterface } from "./udp-interface";

describe("UDPInterface", () => {
    describe("onMessage", () => {
        it("should call MetricService.log once given valid message", async () => {

            const metricService: MetricService = new MetricService(null, null);

            const logSpy = sinon.spy(metricService, 'log');

            const udpInterface: UDPInterface = new UDPInterface('', 0, metricService);

            await udpInterface._onMessage(Buffer.from('simple.counter:5|c'), null);

            expect(logSpy.calledOnce).to.be.true;
        });

        it("should call MetricService.log twice given valid messages", async () => {

            const metricService: MetricService = new MetricService(null, null);

            const logSpy = sinon.spy(metricService, 'log');

            const udpInterface: UDPInterface = new UDPInterface('', 0, metricService);

            await udpInterface._onMessage(Buffer.from('simple.counter:5|c\r\nsimple.counter:5|c'), null);

            expect(logSpy.calledTwice).to.be.true;
        });

        it("should call MetricService.log once given valid message with tags", async () => {

            const metricService: MetricService = new MetricService(null, null);

            const logSpy = sinon.spy(metricService, 'log');

            const udpInterface: UDPInterface = new UDPInterface('', 0, metricService);

            await udpInterface._onMessage(Buffer.from('simple.counter:5|c|#tag1:abc,tag2:def'), null);

            expect(logSpy.calledOnce).to.be.true;
        });
    });
});
