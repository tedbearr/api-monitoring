const { createLogger, transports, format, level } = require("winston");

const request = createLogger({
  transports: [
    new transports.File({
      filename: "log.log",
      format: format.combine(
        format.printf((info) => {
          console.log(info);
          return `[${info.timestamp}] [${info.label}]@[${info.level}]: ${info.message}`;
        })
      ),
    }),
  ],
});

module.exports = request;
