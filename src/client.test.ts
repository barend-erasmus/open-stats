import * as StatsdClient from "statsd-client";

const client = new StatsdClient({ host: "localhost" });

client.counter("simple.counter", 12);       // 12
client.counter("simple.counter", 9);        // 21
client.counter("simple.counter", 15);       // 36
client.counter("simple.counter", 20);       // 56

client.gauge("simple.gauge", 12);           // 12
client.gauge("simple.gauge", 10);           // 10

client.gauge("simple.gaugeDelta", 12);      // 12
client.gaugeDelta("simple.gaugeDelta", 10); // 22
client.gaugeDelta("simple.gaugeDelta", -2); // 20

client.timing("simple.timing", 200);
client.timing("simple.timing", 350);
