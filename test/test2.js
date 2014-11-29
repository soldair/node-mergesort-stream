var test = require('tape');
var mergey = require('../');
var through = require('through')

test("can use streams 1 streams",function(t){
  var t1 = through()
  var t2 = through()

  var s = mergey(function(data1,data2){
    if(data1 > data2) return 1
    else if(data1 < data2) return -1
    return 0
  },[t1,t2])

  var a = []

  s.on('data',a.push.bind(a)).on('end',function(){
    t.ok(1,'end should be called')
    t.equals(a.join(''),'123456789')
    
    t.end();
  });

  t1.write('2')
  t1.write('4')
  t2.write('1')
  t2.write('3')
  t2.write('6')
  t2.write('8')
  t2.write('9')

  t2.end()

  t1.write('5')
  t1.write('7')

  t1.end()
})

