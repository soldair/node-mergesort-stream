mergesort-stream
================

Merge multiple sorted streams into one sorted stream. Each stream itself must be sorted.


```js

var mergestream = require('mergesort-stream')

var toMerge = [stream1,stream2,stream3,...]

mergestream(function(value1,value2){
  // compare values just like [].sort
  if(value1 > value2) return 1
  else if(value1 < value2) return -1
  return 0
},toMerge)

```
