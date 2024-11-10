var winston = require('winston');
require('winston-daily-rotate-file');
const { splat, combine, timestamp, printf } = winston.format;

const myFormat = printf(({ timestamp, level, message, meta }) => {
    return `${timestamp}:${level}:${message};${meta ? JSON.stringify(meta) : ''}`;
});



class Logger {
    #loggers = []
    #main_Log_transport
    #error_Log_transport
    constructor() {
        this.#main_Log_transport = new winston.transports.DailyRotateFile({
            filename: 'info_%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            dirname: './Logs/info',
            prepend: true,
            json: true,
            prettyPrint: true
        });
        this.#main_Log_transport.setMaxListeners(0)

        this.#loggers.push(
            {
                log: winston.createLogger({
                    format: combine(
                        timestamp(),
                        splat(),
                        myFormat
                    ),
                    transports: [
                        this.#main_Log_transport,
                        //  new winston.transports.Console()
                    ]
                }),
                level: 'info',
                logName: 'info'
            }

        )

        this.#error_Log_transport = new winston.transports.DailyRotateFile({
            filename: 'error_Log_%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            dirname: './Logs/error',
            prepend: true,
            json: true,
            prettyPrint: true
        });
        this.#error_Log_transport.setMaxListeners(0)

        this.#loggers.push(
            {
                log: winston.createLogger({
                    format: combine(
                        timestamp(),
                        splat(),
                        myFormat
                    ),
                    transports: [
                        this.#error_Log_transport,
                        new winston.transports.Console()
                    ]
                }),
                level: 'error',
                logName: 'error'
            }

        )

    }

    writeLog(logName) {

        return {
            info: (message) => {
                let log = this.#searchLogger(logName, 'info')
                if (!log) {
                    log = this.#createLogger(logName, 'info')
                }
                log.info(message)
            },
            error: (message) => {
                let log = this.#searchLogger(logName, 'error')
                if (!log) {
                    log = this.#createLogger(logName, 'error')
                }
                log.error(message)
            }
        }

    }

    #searchLogger(logName, level) {
        const logger = this.#loggers.find(logger => 
            {
                return logger.logName === logName && logger.level === level
            }
            )
        if (logger) {
            return logger.log
        }

        return
    }

    #createLogger(logName, level) {
        const log_transport = new winston.transports.DailyRotateFile({
            filename: `${logName}_%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            dirname: `./Logs/${logName}`,
            prepend: true,
            json: true,
            prettyPrint: true
        });
        log_transport.setMaxListeners(0)
        let additionTransport
        if (level === 'error') {
            additionTransport = this.#error_Log_transport
        }
        else {
            additionTransport = this.#main_Log_transport
        }
        let newLog = winston.createLogger({
            format: combine(
                timestamp(),
                splat(),
                myFormat
            ),
            transports: [
                additionTransport,
                log_transport,
                // new winston.transports.Console()
            ]
        });

        this.#loggers.push(
            {
                level: level,
                logName: logName,
                log: newLog
            }
        )
        return newLog
    }


}


module.exports = new Logger()