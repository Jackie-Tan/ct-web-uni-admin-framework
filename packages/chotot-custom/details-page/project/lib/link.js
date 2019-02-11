
class Link {
  constructor(name, id, rVar){
    this.name = name;
    this.id = id;
    this.data = {};
    this.rVar = rVar
    let details = BaseTemplate.of()._config.details
    this.linkTable = (details && details.linkTable) || [];
    this.load()
    Link.instance = this;
  }
  load(){
    const self = this;
    let count = 0;
    this.linkTable.map(function(item){
      item.index = count++;
      self.updateRVar(item)
      return item;
    })
  }
  reloadAll(){
    this.load()
  }
  reload(index) {
    this.updateRVar(this.linkTable[index])
  }
  getAddHeads(index){
    const item = this.linkTable[index];
    return item.heads
  }
  updateRVar(item){
    let rVar = this.rVar
    const self = this;
    self.data[item.name] = []
    const itemName = item.name;
    const query = {
      [item.ref]: self.id
    }
    BaseTemplate.of().post("GetLink", [item.index, query], {silent: true}, function(error, result){
      if (error){
        dsLog.error(error.message)
        return;
      }
      result.rows.map(function(row){
        self.data[item.name].push({
          id: row[item.to],
          name: itemName,
          index: item.index,
          to: item.to,
          parentName: self.name
        })
      })
      rVar.set(self.data);
    })
  }
}
Link.instance = null

export default Link
