import Permission from './permission.js'
MethodList = {}
Meteor.secureMethods = function(methods, opts){
  let methodsConvert = {};
  for (let key in methods){
    if (MethodList[key])
      dsLog.error(`duplicate init method`)
    MethodList[key] = methods[key];
    methodsConvert[key] = (async function(){
      const user = Meteor.user();
      const userId = user && user._id
      if (!userId)
        throw new Meteor.Error('You do not have permission!');
      let startTime = new Date();
      try {
        Permission.of(userId).isPassMethod(key, opts);
        logger.stats(`${key}_permission`, 200, new Date() - startTime);
      } catch (e){
        logger.stats(`${key}_permission`, 403, new Date() - startTime);
        throw new Meteor.Error(e.message);
      }
      startTime = new Date();
      try {
        let data = await methods[key].apply(this, arguments);
        logger.stats(key, 200, new Date() - startTime);
        logger.action(key, this.connection.clientAddress, {arguments, result: "success"})
        return data;
      }
      catch (e) {
        logger.stats(key, e.statusCode || 400, new Date() - startTime);
        logger.error(e)
        logger.action(key, this.connection.clientAddress, {arguments, error: e.message})
        throw new Meteor.Error(e.message);
      }
    })
  }
  Meteor.methods(methodsConvert);
}
