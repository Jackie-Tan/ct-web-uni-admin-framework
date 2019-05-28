import log4js from 'log4js'
import log_config from './log_config.js'

const TEST_ENV = 'staging';

let appenders = []
appenders.push(log_config('info'));
appenders.push(log_config('error'));

let _log_info, _log_error, _console;
log4js.configure({
    appenders: appenders
})
_log_info = log4js.getLogger('info')
_log_error = log4js.getLogger('error')
_console = console;

class LogClient {
    constructor() {
        this._show_console = process.env.LOG_ENV !== 'production';
        this._log_info = _log_info;
        this._log_error = _log_error;
        this._console = _console;
        this._log_env = process.env.LOG_ENV;
        this.error = this.error.bind(this);
        this.warning = this.warning.bind(this);
        this.info = this.info.bind(this);
        this.debug = this.debug.bind(this);
        this.trace = this.trace.bind(this);
        this.close = this.close.bind(this);
        this.exit = this.exit.bind(this);
    }
    enableConsoleLog() {
        this._show_console = (process.env.ENABLE_CONSOLE_LOG == 1);
    }
    error(str, ...error) {
        this._log_error.error(str, ...error);
        if (this._show_console) {
            this._console.error(str, ...error);
        }
    }
    info(str, ...obj) {
        this._log_info.info(str, ...obj);
        if (this._show_console) {
            this._console.info(str, ...obj);
        }
    }
    debug(str, ...obj) {
        if (process.env.LOG_ENV === TEST_ENV) {
            this._console.info(str, ...obj)
        }
    }
    warning(str, ...obj) {
        this._log_info.warn(str, ...obj);
    }
    trace(method, requestUrl, body, responseBody, responseStatus) {
        if (process.env.LOG_ENV === TEST_ENV) {
            this._console.info({
                method: method,
                requestUrl: requestUrl,
                body: body,
                responseBody: responseBody,
                responseStatus: responseStatus
            });
        }
    }
    close() {
        this.exit();
    }
    exit(cb) {
        cb = cb || (() => {
            // console.log('log4js exited');
        });
        setTimeout(() => {
            log4js.shutdown(cb);
        }, 2000);
    }
}

export default new LogClient()
