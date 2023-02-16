const client = require("prom-client");
const register = new client.Registry();

const count_request_replaceredeem_category = new client.Histogram({
  name: "testprom",
  help: "this is the metric for getting request data based on code status",
  labelNames: ["route", "status_code", "issuer_name"],
});

const test_gauge = new client.Counter({
  name: "testGauge",
  help: "just testing",
  labelNames: ["route", "status_code", "issuer_name"],
});

module.exports = { count_request_replaceredeem_category, test_gauge };
