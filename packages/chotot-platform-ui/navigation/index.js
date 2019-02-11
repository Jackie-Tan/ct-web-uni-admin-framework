function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
class Item {
  constructor(id, name, config, parent) {
    this.id = id;
    config = config || {_regex: '#'};
    this.alias = config.display || name;
    this.regex = config.router || config.display || name;
    this.name = this.alias.split('_').map(capitalizeFirstLetter).join(' ');
    this.href = config.redirect || config._regex || '/'+this.regex;
    this.attr = config.attr;
    this.icon = config.icons || 'fa-tasks';
    this.children = [];
    this.hidden = config.hidden;
    if (!parent)
      return;
    parent.children.push(this);
    parent.regex += '|'+id;
  }
  changeId(id) {
    if (id)
      this.id = id;
    return this;
  }
  changeIcon(icon){
    if (icon)
      this.icon = icon;
    return this;
  }
  changeHref(href){
    if (href)
      this.href = href;
    return this;
  }
}



class Navigation {
  constructor(name, config){
    let regex = config? config.router || config.display || name: name;
    let key = config.prefix.toLowerCase() + '/' + regex.toLowerCase();
    if (Navigation.instances[key])
      return Navigation.instances[key];
    if (!Navigation.items.home)
      Navigation.items.home = new Item('home','home');
    Navigation.instances[key] = this;
    let keyArr = key.split('/');
    let keyLength = keyArr.length;
    let parentKey = 'home';
    for (let pos = 1; pos < keyLength; pos++){
      let itemKey = parentKey + '/'+ keyArr[pos];
      if (Navigation.items[itemKey]){
        if (pos == keyLength -1)
          Navigation.items[itemKey].changeId(name).changeIcon(config.icon).changeHref(config.href);
        parentKey = itemKey;
        continue;
      }
      Navigation.items[itemKey] = new Item(name, keyArr[pos], (pos == keyLength -1) ? config : null, Navigation.items[parentKey]);
      parentKey = itemKey;
    }
  }
}
Navigation.instances = {};
Navigation.items = {};

export default Navigation;
