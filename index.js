// mergesortstream
var through = require('through')
var binarysearch = require('binarysearch')

module.exports = function(comparitor,streams){
  var t = through()
  , active = streams.length
  , check = {}
  , drain = 0
  , buf = []
  , paused = {}
  , ended = {}

  t.highWaterMark = 1;
  t.lowWaterMark = 0;

  streams.forEach(function(s,id){
    
    s.on('data',function(data){
      binarysearch.insert(buf,[id,data],function(d1,d2){
        return comparitor(d1[1],d2[1]);
      })

      if(!check[id]) {
        check[id] = 0
        drain++;
      }
      check[id]++;

      // if i have already buffered extra data events for this stream lets pause
      if(!write() && check[id] > t.highWaterMark){
        s.pause()
        paused[id] = 1;
      }
    }).on('end',function(){
      if(!check[id]) active--;
      else ended[id] = 1;
      write();
    }).on('drain',function(){ 
      paused[id] = 0;
    })

  })

  t.on('drain',function(){
    write();
    var pauses = Object.keys(paused);
    while(pauses.length) {
      streams[pauses[0]].resume()
      delete paused[pauses.shift()]
    }
  })

  function write(){
    while(drain >= active && buf.length) {
      var toWrite = buf.shift()
      check[toWrite[0]]--
      t.queue(toWrite[1])

      if(!check[toWrite[0]]) {
        if(ended[toWrite[0]] == 1) {
          active--;
          delete ended[toWrite[0]];
        }
        drain--;
      }

      if(check[toWrite[0]] <= t.lowWaterMark && paused[toWrite[0]]) {
        streams[toWrite[0]].resume()
      }
    }

    if(!active && !drain) t.end();
    return t.paused;
  }

  return t;
}
