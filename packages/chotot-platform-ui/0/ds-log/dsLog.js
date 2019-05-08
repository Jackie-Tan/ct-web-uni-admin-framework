LogBySession = [];
import './toastr.css';
toastr = require('./toastr.js');
dsLog = {
    info: function (message) {
        LogBySession.push(`<p class="info-log">[INFO] ${new Date().toString()} ${message} </p>`)
        Session.set('LogActionChange', !Session.get('LogActionChange'));
    },
    error: function (message, toastrOptions = {}) {
        LogBySession.push(`<p class="error-log">[ERROR] ${new Date().toString()} ${message} </p>`)
        toastr.error(message, '', toastrOptions);
        Session.set('LogActionChange', !Session.get('LogActionChange'));
    },
    success: function (message, toastrOptions = {}) {
        // toastrOptions = {timeOut: 1000} // set timeout for alert
        LogBySession.push(`<p class="success-log">[SUCCESS] ${new Date().toString()} ${message} </p>`)
        toastr.success(message, '', toastrOptions);
        Session.set('LogActionChange', !Session.get('LogActionChange'));
    },
    warning: function (message, toastrOptions = {}) {
        LogBySession.push(`<p class="warn-log">[WARN] ${new Date().toString()}${message} </p>`)
        toastr.success(message, '', toastrOptions);
        Session.set('LogActionChange', !Session.get('LogActionChange'));
    },
    debug: function () {
        if (dsLog.LEVEL == 'debug')
            console.log.apply(this, arguments)

    },
    race: function (id, opt = {}) {
        if (Race[id]) {
            let duration = new Date().getTime() - Race[id];
            if (opt.tracing) {
                Meteor.call("Global/Tracing/Action", { id, args: { duration, data: opt.data } })
            }
            console.log(`${id} delta time is`, duration)
            delete Race[id];
            return;
        }
        Race[id] = new Date().getTime()
    },
    LEVEL: 'info'
}

var Race = {}