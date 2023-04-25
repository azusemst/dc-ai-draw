const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp, caller }) => {
  return `[${level.toUpperCase()}] | ${timestamp} | ${caller.file}:${caller.line} (${caller.method}) || msg= ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    format((info) => {
      info.caller = getCaller();
      return info;
    })(),
    myFormat
  ),
  transports: [new transports.Console()]
});

function getCaller() {
  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  Error.captureStackTrace(err, getCaller);
  const stack = err.stack.slice(1);
  Error.prepareStackTrace = oldPrepareStackTrace;
  return {
    file: stack[0].getFileName(),
    line: stack[0].getLineNumber(),
    method: stack[1].getFunctionName()
  };
}

module.exports = logger;
