const ws = new WebSocket("ws://localhost:3000/open-stats");

ws.onopen = function () {
    console.log('Connected');
};

ws.onmessage = function (evt: { data: any }) {
    var received_msg = evt.data;
    console.log(evt.data);
};

ws.onclose = function () {
    console.log('Disconnected');
};


function sendCounterMetric(name: string, value: number, unit: string) {
    ws.send(JSON.stringify({
        type: 'counter',
        name: name,
        value: value,
        unit: unit,
        timestamp: new Date().getTime()
    }));
}

function sendGaugeMetric(name: string, offset: number, unit: string) {
    ws.send(JSON.stringify({
        type: 'gauge',
        name: name,
        offset: offset,
        unit: unit,
        timestamp: new Date().getTime()
    }));
}

function sendSamplingMetric(name: string, value: number, unit: string) {
    ws.send(JSON.stringify({
        type: 'sampling',
        name: name,
        value: value,
        unit: unit,
        timestamp: new Date().getTime()
    }));
}


function sendTimingMetric(name: string, value: number, unit: string) {
    ws.send(JSON.stringify({
        type: 'timing',
        name: name,
        value: value,
        unit: unit,
        timestamp: new Date().getTime()
    }));
}

window.onclick = function() {
   sendCounterMetric('number.of.clicks', 1, 'clicks');
}

setInterval(function () {
    sendSamplingMetric('demo.sampling', Math.random() * 1000, '#');
}, 1000);

