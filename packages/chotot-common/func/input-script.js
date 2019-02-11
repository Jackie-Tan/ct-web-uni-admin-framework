
module.exports = function (opt) {
  let name = opt.name
  let input = this.another(name);
  if (!input) {
    dsLog.debug(`please check config for key ${name}`)
    return
  }
  let data = opt.data;
  let action = opt.action;
  switch (action) {
    case "show":
      input.show()
      break;
    case "hidden":
      input.hide()
      break;
    case "required":
      input.prop('required', true);
      break;
    case "optional":
      input.prop('required', false);
      break;
    case "disabled":
      input.prop('disabled', true);
      break;
    case "undisabled":
      input.prop('disabled', false);
      break;
    case "assign":
      input.forceSet(data[name])
      break;
    case "unassign":
      input.forceSet("");
  }
}