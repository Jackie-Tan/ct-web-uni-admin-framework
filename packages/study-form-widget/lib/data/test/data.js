var Data = require('./../index')
require('should');

describe("DATA test",function(){

  it("Parse Key",function(done){
    let data1 = new Data({})
    data1.add('p1.p2', 'v1')
    data1.add('p1.p2', 'v2')
    data1.exec().should.eql({'p1': {'p2': ['v1','v2']}})
    data1.add('p1.p3', 'v2')
    data1.exec().should.eql({'p1': {'p2': ['v1','v2'], 'p3': 'v2'}})
    let data2 = new Data({})
    data2.add('p1.p2.p3', 'v1')
    data2.add('p1.p2.p5', 'v2')
    data2.exec().should.eql({'p1': {'p2': {'p3': 'v1', 'p5': 'v2'}}})
    data2.add('p1.p3.p1', 'v32')
    data2.exec().should.eql({'p1': {'p2': {'p3': 'v1', 'p5': 'v2'}, 'p3': {'p1': 'v32'}}})
    done()
  });
  it("Tính giao hoán",function(done){
    let data3 = new Data()
    data3.add('p1.p2', 'v1')
    data3.add('p1.p3', 'v2')
    data3.add('p1', 'v3')
    data3.exec().should.eql({'p1': [{'p2': 'v1'}, {'p3': 'v2'},'v3']})
    let data4 = new Data()
    data4.add('p1', 'v3')
    data4.add('p1.p2', 'v1')
    data4.add('p1.p3', 'v2')
    data4.exec().should.eql({'p1': ['v3', {'p2': 'v1'}, {'p3': 'v2'}]})
    let data5 = new Data()
    data5.add('p1.p2', 'v1')
    data5.add('p1', 'v3')
    data5.add('p1.p3', 'v2')
    data5.exec().should.eql({'p1': [{'p2': 'v1'},'v3', {'p3': 'v2'}]})
    done()
  });
  it("__break__ for create array",function(done){
    let data3 = new Data()
    data3.add('p1.p2', 'v1')
    data3.add('p1.p3', 'v2')
    data3.add('p1', '__break__')
    data3.exec().should.eql({'p1': [{'p2': 'v1'}, {'p3': 'v2'}]})
    data3 = new Data()
    data3.add('p1', '__break__')
    data3.add('p1.p2', 'v1')
    data3.add('p1.p3', 'v2')
    data3.exec().should.eql({'p1': [{'p2': 'v1'}, {'p3': 'v2'}]})
    data3 = new Data()
    data3.add('p1.p2', 'v1')
    data3.add('p1', '__break__')
    data3.add('p1.p3', 'v2')
    data3.exec().should.eql({'p1': [{'p2': 'v1'}, {'p3': 'v2'}]})
    done()
  });
  it("__join__ for create list string",function(done){
    let data3 = new Data()
    data3.add('p1.p2', 'v1')
    data3.add('p1.p2', 'v2')
    data3.add('p1.p2', '__join__')
    data3.exec().should.eql({'p1': {'p2': 'v1,v2'}})
    //only support join in last key
    done()
  });
  it("for creating list string",function(done){
    let data3 = new Data()
    data3.add('p1.p2', 'v1')
    data3.add('p1.p3', 'v1')
    data3.add('p1', '__next__')
    data3.add('p1.p2', 'v2')
    data3.add('p1.p3', 'v2')
    data3.add('p1', '__next__')
    data3.add('p1.p2', 'v3')
    data3.add('p1.p3', 'v3')
    data3.add('p1', '__next__')
    data3.add('p1.p4', 'v4')
    data3.add('p1.p5', 'v4')
    data3.add('p1.p1', 'v4')
    data3.add('p1.p2', 'v4')
    data3.add('p1', '__end_next__')
    data3.exec().should.eql({'p1': [{'p2': 'v1', 'p3': 'v1'}, { p2: 'v2', p3: 'v2' }, { p2: 'v3', p3: 'v3' }, { p4: 'v4', p5: 'v4' , p1: 'v4', p2: 'v4' }]})
    //only support join in last key
    done()
  });
  it("accepted value in array ", function (done) {
    let data3 = new Data()
    data3.add('p1', null)
    data3.add('p1', false)
    // data3.add('p1', '__break__')
    data3.add('p1', '__next__')
    data3.add('p1', '__end_next__')

    data3.exec().should.eql({p1:[]})
    done()

  })
  it("no null in object with func value", function (done) {
    let data3 = new Data()
    // data3.add('p1.p1', false)
    // data3.add('p1.p2', false)
    // data3.add('p1', '__next__')
    data3.add('p1', '__end_next__')
    // data3.add('p1', '__break__')

    data3.exec().should.eql({p1:[]})
    done()

  })
  it("no NaN in object with next", function (done) {
    let data3 = new Data()
    data3.add('p1.p1', NaN)
    data3.add('p1.p2', NaN)

    data3.exec().should.eql({})
    done()

  })
  it("no false array", function (done) {
    let data3 = new Data()
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', false)
    data3.add('p1', '__break__')
    data3.exec().should.eql({p1: []})
    done()

  })
});


