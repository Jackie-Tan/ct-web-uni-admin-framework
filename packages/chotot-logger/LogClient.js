import log4js from 'log4js'
import log_config from './log_config.js'

const TEST_ENV = 'staging';

let appenders = []
appenders.push(log_config('info'));
appenders.push(log_config('error'));
appenders.push(log_config('warn'));

let _log_info, _log_error, _console;
log4js.configure({
    appenders: appenders
})
_log_info = log4js.getLogger('info')
_log_error = log4js.getLogger('error')
_log_warn = log4js.getLogger('warn')
_console = console;

class LogClient {
    constructor() {
        this._log_info = _log_info;
        this._log_error = _log_error;
        this._console = _console;
        this.error = this.error.bind(this);
        this.warning = this.warning.bind(this);
        this.info = this.info.bind(this);
        this.close = this.close.bind(this);
        this.exit = this.exit.bind(this);
    }
    error(str, ...error) {
        this._log_error.error(str, ...error);
    }
    info(str, ...obj) {
        this._log_info.info(str, ...obj);
    }
    warning(str, ...obj) {
        this._log_info.warn(str, ...obj);
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
