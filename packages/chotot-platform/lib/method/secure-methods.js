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
      try {
        Permission.of(userId).isPassMethod(key, opts)
        let data = await methods[key].apply(this, arguments);
        logger.action(key, this.connection.clientAddress, {arguments, result: "success"})
        logger.trace(data)
        return data
      } catch (e){
        logger.error(e)
        logger.action(key, this.connection.clientAddress, {arguments, error: e.message})
        throw new Meteor.Error(e.message);
      }
    })
  }
  Meteor.methods(methodsConvert);
}
