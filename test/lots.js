
var through = require('through2');
var merge = require('../');
var fs = require('fs');

var test = require('tape');

test('can handle masses of awesome event data',function(t){

  var ledEvents = fs.readFileSync(__dirname+'/led.json').toString().trim().split("\n");
  var powerEvents = fs.readFileSync(__dirname+'/power.json').toString().trim().split("\n");

  ledEvents = parse(ledEvents);
  powerEvents = parse(powerEvents);

  console.log('led: ',ledEvents.length)
  console.log('power: ',powerEvents.length)

  var led = through.obj(function(data,enc,cb){
    this.push(data);
    cb();
  });

  var power = through.obj(function(data,enc,cb){
    this.push(data);
    cb();
  });

  var ms = merge(function(v1,v2){
    if(v1.data.time > v2.data.time) return 1
    else if(v1.data.time < v2.data.time) return -1
    return 0;
  },[led,power]);

  var totalEvents = ledEvents.length+powerEvents.length;

  while(ledEvents.length){
    led.write(ledEvents.shift());
  }

  while(powerEvents.length){
    power.write(powerEvents.shift());
  }

  var i = 0;
  ms.on('data',function(data){
    ++i;
    //console.log(i);
  });

  ms.on('end',function(){
    console.log('END ',i,' events');
    t.equals(i,totalEvents,'should have correct number of events all sorted and awesome');
    t.end();
  });

  led.end();
  power.end(); 

});

function parse(lines){
  var out = [];
  lines.forEach(function(l){
    try{
      out.push(JSON.parse(l));
    } catch (e){}
  })
  return out;
}

