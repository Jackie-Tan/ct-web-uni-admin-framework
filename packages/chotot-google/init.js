ServiceConfiguration.configurations.remove({
  service: "google"
});
ServiceConfiguration.configurations.insert({
  service: "google",
  clientId: process.env.APP_GOOGLE_CLIENT_ID,
  secret: process.env.APP_GOOGLE_SECRET
});
if (!Accounts.serviceMap) {
  Accounts.serviceMap = {}
}
Accounts.serviceMap.google = function (options, user) {
  let sv = user.services
  let email= sv.google.email, username = sv.google.email
  let emailSp = email.split('@')
  if (emailSp[1] != 'chotot.vn')
    throw new Meteor.Error(
        new Accounts.LoginCancelledError("ERROR_AUTH_LOGIN"),
        "Không hổ trợ email ngoài Chợ Tốt!")
  user.username = username;
  user.emails = [{
    address: email
  }];
}
  // return true