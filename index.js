var app = require("express")();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', (req, res)=>{
   res.send('welcome!');
})




http.listen(9999,null,()=>{
  console.log('listening on port 9999');
});