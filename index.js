
var through = require('through2');
var bs = require('binarysearch')
var Readable = require("readable-stream");


module.exports = function(comparitor,streams,options){

  options = options||{};

  var events = [];
  var pending = 0;
  var active = streams.length;

  // each time the buffer has one event for each stream.
  // send the lowest value.
  // attempt to read another form the stream that just provided the value.
  // repeat

  var check = [];
  var ready = 0;

  var buf = [];

  var out = through.obj(function(chunk,enc,cb){
    this.push(chunk);
    cb();
  });

  var send = function(){
    if(buf.length >= active && buf.length){
      // one event for each stream.
      var d = buf.shift();
      check[d[0]] = 0;
      ready--;
      out.write(d[1]);
      return d[0];
    }
    return false;
  }

  var cmp = function(d1,d2){
    return comparitor(d1[1],d2[1]);
  }

  var read = function(id){

    // already have data buffered for this stream.
    if(check[id]){
      //console.log('already have data id:',id,' ',active,buf.length,' 0:',buf);
      return false;
    }

    var working = true,read;
    while((data = streams[id].read())){
      //console.log('read data!');
      check[id] = 1;

      bs.insert(buf,[id,data],cmp);

      ready++;
      if(ready < active) {
        //console.log('not all stream have had a readable event');
        break;
      }

      id = send();

      //console.log('sent data ', id);
      if(id === false) break;
    }
  }

  streams.forEach(function(stream,id){
    // streams1 support.
    if(!stream.read) {
      stream = (new Readable({objectMode:true,highWaterMark:options.highWaterMark||500,lowWaterMark:options.lowWaterMark||20})).wrap(stream);
      streams[id] = stream;
    }

    stream.on('readable',function(c){
      //console.log('readable!',id);
      read(id); 
    }).on('end',function(){
      active--;

      // if i end i have no more data events to send.
      // the other streams may be waiting for my read to continue.
      // i have to send the next value.
      if(active) {
        var id = send();
        if(id) read(id);
      } else {
        out.end();
      }
    });

    //a readable event happened before the call too ms make sure i start pulling data right away.
    read(id);

  });

  return out

}







