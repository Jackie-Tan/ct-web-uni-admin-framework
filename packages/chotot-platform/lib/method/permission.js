import Role from 'meteor/chotot:role/role.js';
const TIME_RELEASE = {};
//CHECK PERMISSION FOR A METHOD
class Permission {
  constructor(userId){
    this.userId= userId;
  }
  static of(userId){
    return new Permission(userId);
  }
  checkMethod(method, opts){
    const role = Role.of(this.userId);
    const refType = (opts && opts.type) || 'method';
    const ref = (opts && opts[opts.type]) || method;
    logger.info(`check method, user ${this.userId} refType ${refType} ref ${ref}`)
    role.pass(refType, ref);
  }
  isPassMethod(method, opts){
    //TODO avoid duplicate call the method;
    if (!Permission.userIdDoMethod[method])
      Permission.userIdDoMethod[method] = {};
    if (Permission.userIdDoMethod[method] && Permission.userIdDoMethod[method][this.userId])
        throw new Meteor.Error('Please do not repeat an action so fast!');
    const methodSplit = method.split('/');
    const methodType  = methodSplit[methodSplit.length-1];
    const methodTime = TIME_RELEASE[methodType]
    if (methodTime) {
      Permission.userIdDoMethod[method][this.userId] = true;
      let self = this;
      Meteor.setTimeout(function(){
        delete Permission.userIdDoMethod[method][self.userId]
      }, methodTime || 3000);
    }
    //TODO avoid access to not having permission methods;
    this.checkMethod(method, opts);
    return this;
  }
}

Permission.userIdDoMethod = {};

export default Permission
