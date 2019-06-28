var autoValue = {
  'date': function () {
    if (this.value) {
      if (this.input && this.input.subtype == 'number') {
        return this.value
      }
      const mInstance = moment(this.value);
      if (!mInstance.isValid())
        return null;
      return mInstance.format('MM-DD-YYYY')
    }
  },
  'datetime': function () {
    if (this.value) {
      if (this.input && this.input.subtype == 'number') {
        return this.value
      }
      const mInstance = moment(this.value);
      if (!mInstance.isValid())
        return null;
      return mInstance.format('MM-DD-YYYY HH:mm:ssZ')
    }
  },
  'datetimevn': function () {
    if (this.value) {
      if (this.input && this.input.subtype == 'number') {
        return this.value
      }
      const mInstance = moment(this.value);
      if (!mInstance.isValid())
        return null;
      return mInstance.format('MM-DD-YYYY HH:mm:ssZ')
    }
  },
  'array': function () {
    if (this.value) {
      try {
        if (typeof this.value == "string") {
          if (this.value.trim() == "")
            return null
          return JSON.stringify(JSON.parse(this.value))
        }
        return JSON.stringify(this.value)
      } catch (e) {
        logger.error(e)
      }
    }
  },
  'json': function () {
    if (this.value) {
      try {
        if (typeof this.value == "string") {
          if (this.value.trim() == "")
            return null
          return JSON.stringify(JSON.parse(this.value))
        }
        return JSON.stringify(this.value)
      } catch (e) {
        logger.error(e)
      }
    }
  },
  'ojson': function () {
    if (this.value) {
      try {
        if (typeof this.value == "string") {
          if (this.value.trim() == "")
            return null
          return JSON.stringify(JSON.parse(this.value))
        }
        return JSON.stringify(this.value)
      } catch (e) {
        logger.error(e)
      }
    }
  },
  'json.geo': function () {
    if (this.value) {
      if (!this.value.x && this.value.x !== 0)
        return this.unset();
      return `(${this.value.x},${this.value.y})`
    }
  },
}
module.exports = autoValue
