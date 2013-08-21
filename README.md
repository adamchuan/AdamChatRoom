AdamChatRoom
============

npm install express
npm install stock.io
这两个就不多说了。

然后是创建服务器的部分
socketio=require('socket.io');
引用这个之后
注意启用socket监听

var server=http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io=socketio.listen(server);
这里的是server，网上有的写是app 误导了我。
然后再客户端中引用
 var socket = io.connect(url);
这样就建立了一个socket连接

然后写下遇到的一些麻烦吧
1.  socket.on（name，function）
这里的name有些是内置的比如
connection
连接成功时事件
message
收到任意消息事件，我现在的理解是调用socket.send发放会触发这个事件，而socket.emat不会
disconnects.
连接断开时事件

当然你也可以任意命名这个name，比如"m1","m2"。

2  关于socket.send(str);
这个方法发送的一定只能是字符串， 
socket.send({
   type:'message';
})
这个方法传送过去解析不出来（至少我现在没找到办法解析）
可以用
JSON.parse(str)
JSON.stringify(Object)
来互相转换。

而使用socket.emit方法传递的对象 可以被直接解析。 

3 stock room使用
         socket.join(room.roomName);
         var comSocket=chatInfra.sockets[socket.id];
         comSocket.join(room.roomName);
         comSocket.room = room.roomName;
说明 chatInfra 为使用 socketio对象监听，设置的变量
var chatInfra = io.of("/chat_infra").on("connection", function(socket){});

socket.join 我的理解是 如果名为room.roomName的房间存在， 则将现在的stock连接到这个房间，否则就创建这个房间
   comSocket.join(room.roomName);
   comSocket.room = room.roomName;

我还是没能理解到。

然后如果之后要在在这个房间内发言
需要先设置socket.join(room.roomName);
然后调用socket.in(room.roomName).emit或者socket.in(room.roomName).send


深度吐槽。！！我擦 bae不支持 socket.io。。。。。。。。。。。。。。。
