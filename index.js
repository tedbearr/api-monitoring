const express = require("express");
const app = express();
const client = require("prom-client");
const register = new client.Registry();
const knex = require("./config/db");
const replaceRedeemCategoryRoute = require("./router/CardReplaceRedeemCategory");
const cardProduct = require("./router/CardProduct");
const { logger, filename } = require("./config/log");
const {
  count_request_replaceredeem_category,
  test_gauge,
} = require("./config/prometheus");

register.setDefaultLabels({ app: "testing" });
client.collectDefaultMetrics({ register });
register.registerMetric(count_request_replaceredeem_category, test_gauge);

app.get("/metrics", (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  register.metrics().then((data) => res.send(data));
});

app.use(logger.request);
app.use(logger.response);
// app.use(filename);

let msg = {
  code: "",
  msg: "",
  data: [],
};

app.use("/api/replaceredeem", replaceRedeemCategoryRoute);

app.use("/api/cardproduct", cardProduct);

app.listen(3008, () => {
  console.log("run at 3008");
});
