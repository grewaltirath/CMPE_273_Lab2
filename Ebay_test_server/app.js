
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
var amqp = require('amqp')
, util = require('util');
//mongoose.connect('mongodb://localhost/twitter?poolsize=6');
mongoose.connect('mongodb://localhost/ebay?poolsize=10');
var cnn = amqp.createConnection({ host: "localhost", port: 5672 });

cnn.on('ready', function(){
	console.log("listening on login_queue");
	cnn.queue('register_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			if(message.operation == "about")
				{
				console.log("Go to about");
				user.about(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
			else if(message.operation == "update_about")
				{
				console.log("Update about");
				user.updateAbout(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
			else if(message.operation == "insert")
			{
			console.log("Go to insert user");
			user.insertuser(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "signin")
			{
			console.log("Go to signin user");
			user.signin(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "home")
			{
			console.log("inside home");
			user.home(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			});
	});
	cnn.queue('item_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			if(message.operation == "add_item")
				{
				console.log("Add item.");
				user.add(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
			else if(message.operation == "item_display")
				{
				console.log("Item Display");
				user.itemDisplay(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
			else if(message.operation == "place_bid")
			{
			console.log("Place Bid");
			user.placeBid(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "display_cart")
			{
			console.log("display cart");
			user.displayCart(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "cart")
			{
			console.log("inside cart");
			user.cart(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "delete_cart")
			{
			console.log("inside delete cart");
			user.delete_cart(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "refresh")
			{
			console.log("inside refresh");
			user.refresh(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "purchase")
			{
			console.log("inside purchase item");
			user.purchase(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "sold")
			{
			console.log("inside sold item");
			user.sold(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "checkout")
			{
			console.log("inside checkout");
			user.checkout(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			else if(message.operation == "confirm")
			{
			console.log("inside home");
			user.confirm(message, function(err,res){
			cnn.publish(m.replyTo, res, {
				contentType:'application/json',
				contentEncoding:'utf-8',
				correlationId:m.correlationId
			});
		
		});
			}
			});
	});
});



winston.add(
		  winston.transports.File, {
		    filename: 'log_file.log',
		    level: 'info',
		    json: true,
		    eol: 'rn', // for Windows, or `eol: ‘n’,` for *NIX OSs
		    timestamp: true
		  }
		);

//app.use(session({   
//	  
//	cookieName: 'session',    
//	secret: 'cmpe273_test_string',    
//	duration: 30 * 60 * 1000,    //setting the time for active session
//	activeDuration: 5 * 60 * 1000,  }));
////winston.log('info','table added',new Date(), 'Hello log files!');
////winston.info('Hello again log files!');
//// all environments
//app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//cronjob.setJobsPath(__dirname + '/routes/job.js');
//app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
////app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.cookieParser());
//app.use(express.bodyParser());
//app.use(express.session({ secret: 'SECRET' }));
//app.use(passport.initialize());
//app.use(passport.session());
//app.use(flash());
//
//app.use(app.router);
//// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}
//cronjob.startJob('first_job');
////app.get('/', routes.index);
////app.get('/users', user.list);
//app.get('/',user.signin);
//app.get('/afterLogin',user.redirectToHomepage);
////app.post('/insertuser',user.insertUser);
//app.get('/insertuser',function(req,res){
//	res.render('signin',message="User already exists.");
//});
//app.post('/insertuser', passport.authenticate('insert', {
//	successRedirect : '/',
//	failureRedirect : '/insertuser',
//	failureFlash : true 
//	}));
//
//app.post('/afterLogin', passport.authenticate('signin', {
//	successRedirect : '/home',
//	failureRedirect : '/',
//	failureFlash : true 
//	}));
////app.post('/afterLogin',user.afterLogin);
//app.get('/logout',user.logout);
//app.get('/about',user.about);
//app.post('/updateAbout',user.updateAbout);
//app.get('/addItem',user.addItem);
//app.post('/item',user.add);
//app.get('/itemDisplay',user.itemDisplay);
//app.get('/home',user.home);
//app.post('/cart',user.cart);
//app.get('/displayCart',user.displayCart);
//app.get('/refresh',user.refresh);
//app.get('/delete',user.delete_cart);
//app.post('/checkout',user.checkout);
//app.post('/confirm',user.confirm);
//app.get('/purchase',user.purchase);
////app.get('/updateEdit',user.updateEdit);
//app.get('/sold',user.sold);
//app.post('/placeBid',user.placeBid);
////app.get('/homeItem',user.homeItem);
//
//
//
//  // Absolute path to the jobs module. 
// 
//
//
//
//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
