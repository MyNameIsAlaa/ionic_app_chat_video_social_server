var app = require("express")();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', (req, res)=>{
   res.send('welcome!');
})


var listener = http.listen(null,null,()=>{
  console.log('listening on port ' + listener.address().port);
});