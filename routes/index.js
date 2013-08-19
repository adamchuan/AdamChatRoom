
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user.js'),
    UserHandle=require('../handle/user.js'),
    Post = require('../models/post.js');
 
module.exports = function(app){
 app.get('/', function(req,res){
  Post.get(null, function(err, posts){
    if(err){
      posts = [];
    } 
    res.render('index',{
      title: '主页',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});


  app.get('/reg', checkNotLogin);
  app.get('/reg',function(req,res){
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.get('/chat',checkLogin)
  app.get('/chat',function(req,res){
    res.render('chat',{
      title:'聊天室',
      user:req.session.user
    });
  });


  app.post('/reg', checkNotLogin);
  app.post('/reg', function(req,res){
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if(password_re != password){
      req.flash('error','两次输入的密码不一致!'); 
      return res.redirect('/reg');
    }
    //生成密码的散列值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: req.body.name,
        password: password,
        email: req.body.email
    });
    //检查用户名是否已经存在 
    User.get(newUser.name, function(err, user){
      if(user){
        err = '用户已存在!';
      }
      if(err){
        req.flash('error', err);
        return res.redirect('/reg');
      }
      //如果不存在则新增用户
      newUser.save(function(err){
        if(err){
          req.flash('error',err);
          return res.redirect('/reg');
        }
        req.session.user = newUser;//用户信息存入session
        req.flash('success','注册成功!');
        res.redirect('/');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res){
    res.render('login',{
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    }); 
  });

  app.post('/login', checkNotLogin);

  app.post('/login', function(req, res){
   // 生成密码的散列值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
   
    User.get(req.body.name,function(err,user){
      res.writeHead(200, {'Content-Type': 'text/plain'});
      if(user==null)
        res.end('data(\'1\')');     
      else if(user.password != password)
        res.end('data(\'2\')');
      else{
        req.session.user = user;//用户名密码都匹配后，将用户信息存入 session
        res.end('data(\'0\')');
      }
    });
  });

  app.get('/post', checkLogin);
  app.get('/post',function(req,res){
    return res.render('post',{title:'写博客'});
  });
  app.post('/post', function(req, res){
  var currentUser = req.session.user,
      post = new Post(currentUser.name, req.body.title, req.body.post);
  post.save(function(err){
    if(err){
      req.flash('error', err); 
      return res.redirect('/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/');
  });
});

  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res){
    req.session.user = null;
    req.flash('success','登出成功!');
    res.redirect('/');
  });
};

function checkLogin(req, res, next){
  if(!req.session.user){
    req.flash('error','未登录!'); 
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','已登录!'); 
    return res.redirect('/');
  }
  next();
}
