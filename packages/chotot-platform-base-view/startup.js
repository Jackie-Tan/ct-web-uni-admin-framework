
Error.prototype.error = function () {
return this.reason || this.message
}
Meteor.Error.prototype.error = function () {
return this.reason || this.message
}