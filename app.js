
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , settings = require('./settings')
  , flash = require('connect-flash')
  , socketio=require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db
  })
}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
routes(app);
var server=http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io=socketio.listen(server);


//socket模块

var chatInfra = io.of("/chat_infra").on("connection", function(socket){
        socket.send(JSON.stringify({
                type:'user_entered',
                message:'Welcome to the most interesting ' +'chat room on earth!'
         }));
  
     
        socket.on('message',function(data){
            data=JSON.parse(data);
            console.log(data);
            switch(data.type){
              case 'chatmessage':
                  socket.join(data.roomName);
                 
                  socket.in(data.roomName).broadcast.send(JSON.stringify({
                    type:'chatmessage',
                    message:data.message
                  }));
                break;
              case 'chooseroom':
                  var room=data;

                  socket.join(room.roomName);
                  var comSocket=chatInfra.sockets[socket.id];
                  comSocket.join(room.roomName);
                  comSocket.room = room.roomName;
                  socket.in(room.roomName).send(JSON.stringify({
                    type:'chooseroom',
                    result:true
                  }));
              default:
                break;
            }
        })
       
});