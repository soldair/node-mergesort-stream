var test = require('tape');
var mergey = require('../');
var through = require('through');

test("can unique result correctly",function(t){
  var t1 = through()
  var t2 = through()

  var s = mergey(function(data1,data2){
    if(data1.v > data2.v) return 1
    else if(data1.v < data2.v) return -1
    return 0
  },[t1,t2],{unique:true})

  var a = []

  s.on('data',a.push.bind(a)).on('end',function(){
    t.ok(1,'end should be called')

    console.log(a);
    t.equals(a.map(function(d){ return d.v}).join(''),'123');
    t.end();
  });

  t1.write({v:'1',i:1});
  t1.write({v:'2',i:2});

  t2.write({v:'2',i:3});
  t2.write({v:'3',i:4});

  t1.write({v:'3',i:5});

  t2.end();
  t1.end();
  

})


