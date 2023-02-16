const winston = require("winston");
require("winston-daily-rotate-file");
const expressWinston = require("express-winston");
const fs = require("fs");
const moment = require("moment");
// const { monitor_count_request, monitor_response_time, getRoutesMonitoring, getIssuerMonitoring } = require('../../app_v3/config/prometheus/index');
const {
  count_request_replaceredeem_category,
  test_gauge,
} = require("./prometheus");

const filename = () => {
  if (!fs.existsSync(`./logs`)) {
    fs.mkdirSync(`./logs`);
  }
  if (!fs.existsSync(`./logs/${moment().format("YYYY")}`)) {
    fs.mkdirSync(`./logs/${moment().format("YYYY")}`);
  }
  if (
    !fs.existsSync(`./logs/${moment().format("YYYY")}/${moment().format("MM")}`)
  ) {
    fs.mkdirSync(`./logs/${moment().format("YYYY")}/${moment().format("MM")}`);
  }

  return `logs/${moment().format("YYYY")}-${moment().format(
    "MM"
  )}-${moment().format("DD")}.log`;
};

filename();

const logger = {
  response: expressWinston.logger({
    transports: [
      // new winston.transports.File({ filename: filename() }),
      new winston.transports.DailyRotateFile({
        filename: "./logs/%DATE%.log",
        frequency: "24h",
        datePattern: "YYYY/MM/DD",
        zippedArchive: true,
        // maxSize: '300670kb',
        // maxFiles: '1d'
      }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((info) => {
        let body = {};
        body.id = info.meta.req.id;
        body.tag = "RES";
        body.from = info.meta.req.ip;
        body.method = info.meta.req.method;
        body.endpoint = info.meta.req.originalUrl;
        body.time = moment().format();
        body.responseTime = `${info.meta.responseTime} ms`;
        // body.header = info.meta.req.headers;
        body.payload = info.meta.res.body || {};

        var header_auth = info.meta.req.headers["authorization"];
        // var routes_name = getRoutesMonitoring(info.meta.req.originalUrl);
        var issuer_name =
          header_auth === undefined
            ? "Web"
            : getIssuerMonitoring(header_auth.split(" ")[1]);
        if (!issuer_name)
          return `[${moment().format()}] | ${JSON.stringify(body)}`;

        // add data for prometheus
        // monitor_count_request.labels({
        //     route: routes_name,
        //     status_code: info.meta.res.statusCode,
        //     issuer_name: issuer_name
        // }).inc(1);
        // monitor_response_time.labels({
        //     route: routes_name,
        //     status_code: info.meta.res.statusCode,
        //     issuer_name: issuer_name
        // }).observe(info.meta.responseTime);
        count_request_replaceredeem_category
          .labels({
            route: info.meta.req.originalUrl,
            status_code: info.meta.res.statusCode,
            issuer_name: issuer_name,
          })
          .observe(info.meta.responseTime);

        test_gauge
          .labels({
            route: info.meta.req.originalUrl,
            status_code: info.meta.res.statusCode,
            issuer_name: issuer_name,
          })
          .inc(1);

        return `[${moment().format()}] | ${JSON.stringify(body)}`;
        // return `[${moment().format()}] | ${JSON.stringify(info.meta.req.id)} | ${JSON.stringify(info.meta.res.body)}`;
      })
    ),
    responseWhitelist: [...expressWinston.responseWhitelist, "body"],
    requestWhitelist: [...expressWinston.requestWhitelist, "body", "id", "ip"],
  }),
  request: expressWinston.logger({
    transports: [
      // new winston.transports.File({ filename: filename() }),
      new winston.transports.DailyRotateFile({
        filename: "./logs/%DATE%.log",
        frequency: "24h",
        datePattern: "YYYY/MM/DD",
        zippedArchive: true,
        // maxFiles: '1d'
      }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((info) => {
        let body = {};
        body.id = info.meta.req.id;
        body.tag = "REQ";
        body.from = info.meta.req.ip;
        body.method = info.meta.req.method;
        body.endpoint = info.meta.req.originalUrl;
        body.time = moment().format();
        // body.header = info.meta.req.headers;
        body.payload = info.meta.req.body || {};
        return `[${moment().format()}] | ${JSON.stringify(body)}`;
        // return `[${moment().format()}] | "id": "${JSON.stringify(info.meta)}" | ${JSON.stringify(info.meta.req.body)}`
      })
    ),
    requestWhitelist: [...expressWinston.requestWhitelist, "body", "id", "ip"],
  }),
};

module.exports = { logger, filename };
