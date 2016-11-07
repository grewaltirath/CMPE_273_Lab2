
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , index = require('./routes/index')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
   , mongoose = require('mongoose')
  , job = require('./routes/job')
  , session = require('express-session');
var bCrypt = require('bcrypt');
var winston = require('winston');	
var cronjob = require('node-cron-job');
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var app = express();
var flash= require('connect-flash');
//var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(session);
winston.add(
		  winston.transports.File, {
		    filename: 'log_file.log',
		    level: 'info',
		    json: true,
		    eol: 'rn', // for Windows, or `eol: ‘n’,` for *NIX OSs
		    timestamp: true
		  }
		);
mongoose.connect('mongodb://localhost/ebay');
app.use(session({   
	  
	cookieName: 'session',    
	secret: 'cmpe273_test_string',    
	duration: 30 * 60 * 1000,
	resave:false,
	saveUninitialized:false,
	store: new mongoStore({url: 'mongodb://localhost/ebay'}),//setting the time for active session
	activeDuration: 5 * 60 * 1000,
	//store: new mongoStore(options)
	}));

//app.use(require('express-session')({
//    key: 'session',
//    secret: 'SUPER SECRET SECRET',
//    store: require('mongoose-session')(mongoose)
//}));
//winston.log('info','table added',new Date(), 'Hello log files!');
//winston.info('Hello again log files!');
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
cronjob.setJobsPath(__dirname + '/routes/job.js');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(app.router);
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
cronjob.startJob('first_job');
//app.get('/', routes.index);
//app.get('/users', user.list);
app.get('/',user.signin);
app.get('/afterLogin',user.redirectToHomepage);
//app.post('/insertuser',user.insertUser);
app.get('/insertuser',function(req,res){
	res.render('signin',message="User already exists.");
});
app.post('/insertuser', passport.authenticate('insert', {
	successRedirect : '/',
	failureRedirect : '/insertuser',
	failureFlash : true 
	}));

app.post('/afterLogin', passport.authenticate('signin', {
	successRedirect : '/home',
	failureRedirect : '/',
	failureFlash : true,
	session: false
	}));
//app.post('/afterLogin',user.afterLogin);
app.get('/logout',user.logout);
app.get('/about',user.about);
app.post('/updateAbout',user.updateAbout);
app.get('/addItem',user.addItem);
app.post('/item',user.add);
app.get('/itemDisplay',user.itemDisplay);
app.get('/home',user.home);
app.post('/cart',user.cart);
//app.get('/cart',user.displayCart);
app.get('/displayCart',user.displayCart);
app.get('/refresh',user.refresh);
app.get('/delete',user.delete_cart);
app.post('/checkout',user.checkout);
app.post('/confirm',user.confirm);
app.get('/purchase',user.purchase);
//app.get('/updateEdit',user.updateEdit);
app.get('/sold',user.sold);
app.post('/placeBid',user.placeBid);
//app.get('/homeItem',user.homeItem);



  // Absolute path to the jobs module. 
 



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
