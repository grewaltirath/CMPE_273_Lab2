
/*
 * GET users listing.
 */
//var mysql = require('./mysql');
var mysql = require('mysql');
var mysql1= require('./mysql');
var user;
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var crypto = require('crypto'),
algorithm = 'aes-256-ctr',
password1 = 'd6F3Efeq';
var winston = require('winston');
var bCrypt = require('bcrypt');
var mq_client = require('../rpc/client');
var dbconn =  mysql.createConnection({
	host     : '127.0.0.1',
    user     : 'root',
    password : 'Canam@001',
    database : 'ebay',
    port	 : 3306
  });
dbconn.connect(function(err){
	  if(err){
	    console.log('Database connection error');
	  }else{
	    console.log('Database connection successful');
	  }
	});
var register_schema = mongoose.Schema({
	first: String,
	last: String,
	email: String,
	password: String,
	phone_number: String,
	birthday: String,
	address: String,
	city: String,
	state: String,
	zip: String,
	last_login_time: String
});
var sell_item_schema = mongoose.Schema({
item_id:String,	
email_id:String,
item_name:String,
item_price:String,
item_description:String,
quantity:String,
bid_flag:String,
maximum_bid:String,
email_bid:String,
add_time:String,
expire_time:String
});
var cart_schema = mongoose.Schema({
	email:String,
	item_name:String,
	item_desc:String,
	item_price:String,
	quantity:String,
	subtotal:String,
	item_id:String
	});
var bid_schema = mongoose.Schema({
	user_id:String,
	item_id:String,
	timestamp:String,
	bid_amount:String
});
var purchase_item_schema = mongoose.Schema({
	emailID:String,
	item_name:String,
	item_description:String,
	quantity:String,
	subtotal:String,
	date:String
	});
var sold_item_schema = mongoose.Schema({
	item_name:String,
	item_description:String,
	item_price:String,
	quantity:String,
	em:String
	});
exports.cart_schema=cart_schema;
exports.sell_item_schema=sell_item_schema;

var registerModel = mongoose.model("register", register_schema);
var sell_itemModel= mongoose.model("sell_item", sell_item_schema);
var bidModel = mongoose.model("bid", bid_schema);
var cartModel = mongoose.model("cart", cart_schema);
var purchase_itemModel = mongoose.model("purchase_item", purchase_item_schema);
var sold_itemModel = mongoose.model("sold_item", sold_item_schema);






passport.serializeUser(function(user, done) {
	  done(null, user._id);
	});
	 
	passport.deserializeUser(function(id, done) {
	  registerModel.findById(id, function(err, user) {
	    done(err, user);
	  });
	});
	
	





exports.list = function(req, res){
  res.send("respond with a resource");
};
exports.sold = function(req, res){
	winston.log('info',req.session.email+' is the user.',new Date(), 'User has clicked on sold items.');
	var em=req.session.email;
	var op="sold";
	var msg_payload = { "operation": op,"email":em};
	mq_client.make_request('item_queue',msg_payload, function(err,results){
		//console.log("YES:"+results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == "200"){
				
				res.render('sold', { title: 'Express', user: req.session.user,rec:results.records, handle:req.session.handle });
				}
			else{
				console.log("ERROR");
			}
		}
	});
};

exports.purchase = function(req, res){
	winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on purchase history button in My eBay.');
	var op="purchase";  
	var emailID=req.session.email;
	var msg_payload = { "operation": op,"email":emailID};
	mq_client.make_request('item_queue',msg_payload, function(err,results){
		//console.log("YES:"+results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == "200"){
				
				res.render('purchase', { title: 'Express', user: req.session.user,rec:results.records, handle:req.session.handle });
				}
			else{
				console.log("ERROR");
			}
		}
	});
};
	
	
	
//	purchase_itemModel.find({ emailID:req.session.email }, function (err,result) {
//		if(err){
//			throw err;
//		}
//		else{
//			res.render('purchase', { title: 'Express', user: req.session.user,rec:result, handle:req.session.handle });
//		}
//	});	
//	};

exports.confirm = function(req, res){
	winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on checkout to place the order.');
var sell_quantity;
var op="confirm";
var item_name=[];
var item_desc=[];
var quantity=[];
var subtotal=[];
var item_id=[];
var currentdate = new Date();
var datetime = currentdate.getDate() + "/"
+ (currentdate.getMonth()+1)  + "/" 
+ currentdate.getFullYear(); 
var email=req.session.email;
var a=typeof(req.session.quantity);
var i=typeof(item_name);
console.log("TYPE OF:"+a+"    "+i);
console.dir(req.session.quantity);
console.dir(req.session.item_id);
 //var q=req.session.quantity;
var se=req.session.se;
 //var id=req.session.item_id;
var msg_payload = { "operation": op,"email":email,"datetime":datetime,"item_id":req.session.item_id,"quantity":req.session.quantity,"se":req.session.se};
mq_client.make_request('item_queue',msg_payload, function(err,results){
	console.log(results);
	if(err){
		throw err;
	}
	else 
	{
		if(results.code == "200"){
			console.log("enetered the right if.");
			res.render('confirm', { title: 'Express', user: req.session.user, handle:req.session.handle });
			}
		else{
			console.log("ERROR");
		}
	}
});	

};
//cartModel.find({ email:req.session.email }, function (err,records) {
//	if(err){
//		throw err;
//	}
//	else{
//		var pur=new purchase_itemModel();
//		var sol=new sold_itemModel();
//		var item_name=[];
//		var item_desc=[];
//		var quantity=[];
//		var subtotal=[];
//		var item_id=[];
//		
//		for(var i=0;i<records.length;i++)
//			{
//			item_name[i]=records[i].item_name;
//			item_desc[i]=records[i].item_desc;
//			quantity[i]=records[i].quantity;
//			subtotal[i]=records[i].subtotal;
//			item_id[i]=records[i].itemid;
//			}
//		console.log(item_name);
//		var record;
//		var currentdate = new Date();
//		pur.date = currentdate.getDate() + "/"
//        + (currentdate.getMonth()+1)  + "/" 
//        + currentdate.getFullYear();            
//		for(var j=0;j<records.length;j++)
//			{
//			pur.emailID=req.session.email;
//			pur.item_name=records[j].item_name;
//			pur.item_description=records[j].item_desc;
//			pur.quantity=records[j].quantity;
//			pur.subtotal=records[j].subtotal;
//			
//			pur.save(function(err, ans) {
//				if(err)
//					{
//					throw err;
//					}
//				else
//					{
//					
//			}
//			});
//			}
//		for(var m=0;m<records.length;m++)
//		{
//			sol.em=req.session.email;
//			sol.item_name=records[m].item_name;
//			sol.item_description=records[m].item_desc;
//			sol.quantity=records[m].quantity;
//			sol.item_price=records[m].subtotal;
//			sol.em=req.session.se[m];
//			sol.save(function(err, ans) {
//				if(err)
//					{
//					throw err;
//					}
//				else
//					{
//					
//			}
//			});
//		
//		}
//		cartModel.find({ email:req.session.email }, function (err,records) {
//			if(err){
//				throw err;
//			}
//			else{
//				var q;
//				for(var k=0;k<records.length;k++)
//				{
//					console.log("jlnds:"+records[k].quantity);
//				q=records[k].quantity;
//				console.log("before Q1:"+q);
//				sell_quantity=parseInt(req.session.quantity[k]);
//				
//				q=sell_quantity-q;
//				console.log("Q1:"+q);
//				if(q==0)
//					{
//					console.log("Inside confirm if");
//					console.log("ERROR:"+req.session.item_id[k]);
//					
//					sell_itemModel.remove({_id:req.session.item_id[k]});
//					}
//				else
//					{
//					console.log("Inside confirm if,where q is:"+q);
//					q=q.toString();
//					console.log("Q:"+typeof(q));
//					console.log("ERROR:"+req.session.item_id[k]);
//					sell_itemModel.update({_id:req.session.item_id[k]},
//			    			{
//			    				$set: { quantity:q
//			    				}
//			    			},function(err, newuser) {
//			    				if(err)
//			    				{
//			    				throw err;
//			    				}
//			    				else
//			    					{
//			    					console.log("QUANTITY UPDATED"+q);
//			    					}
//			    				});}} 
//				 }
//			cartModel.remove({email:req.session.email},function(err,result){
//				if(err){
//					throw err;
//				}
//				else{
//					console.log("deleted the mother fucking element");
//				}});
//});
//}
//});
//
//res.render('confirm', { title: 'Express', user: req.session.user, handle:req.session.handle });
//
//};


//var query= "SELECT * FROM cart WHERE email='"+req.session.email+"';";
//mysql1.get(function(err,records){
//	if(err){
//		throw err;
//	}
//	else{
//		console.log('Inside confirm');
//		//console.log(records);
//		var item_name=[];
//		var item_desc=[];
//		var quantity=[];
//		var subtotal=[];
//		var item_id=[];
//		
//		for(var i=0;i<records.length;i++)
//			{
//			item_name[i]=records[i].item_name;
//			item_desc[i]=records[i].item_desc;
//			quantity[i]=records[i].quantity;
//			subtotal[i]=records[i].subtotal;
//			item_id[i]=records[i].itemid;
//			
//			}
//		console.log(item_name);
//		var record;
//		var currentdate = new Date();
//		var datetime = currentdate.getDate() + "/"
//        + (currentdate.getMonth()+1)  + "/" 
//        + currentdate.getFullYear(); 
//		for(var j=0;j<records.length;j++)
//			{
//		record={emailID:req.session.email,item_name:item_name[j],item_description:item_desc[j],quantity:quantity[j],subtotal:subtotal[j],date:datetime};
//		var query= "insert into purchase_item (emailID,item_name,item_description,quantity,subtotal,date) VALUES ('"+req.session.email+"','"+item_name[j]+"','"+item_desc[j]+"','"+quantity[j]+"','"+subtotal[j]+"','"+datetime+"');";
//		mysql1.add(function(err,res){
//			if(err){
//				throw err;
//			}
//			else{
//				console.log("Purchase item inserted.");
//			}
//		},query);
//			}
//		for(var m=0;m<records.length;m++)
//		{
//		var query= "insert into sold_item (item_name,item_description,item_price,quantity,em) VALUES ('"+item_name[m]+"','"+item_desc[m]+"','"+subtotal[m]+"','"+quantity[m]+"','"+req.session.se[m]+"');";
//		mysql1.add(function(err,res){
//			if(err){
//				throw err;
//			}
//			else{
//				console.log("Sold item inserted.");
//			}
//		},query);
//		
//	}
//		var query= "SELECT * FROM cart WHERE email='"+req.session.email+"';";
//		mysql1.get(function(err,records){
//			if(err){
//				throw err;
//			}
//			else{
//				console.log('Inside cart select');
//				var q;
//				for(var k=0;k<records.length;k++)
//				{
//					console.log("jlnds:"+records[k].quantity);
//				q=records[k].quantity;
//				console.log("before Q1:"+q);
//				sell_quantity=parseInt(req.session.quantity[k]);
//				
//				//sell_quantity=parseInt(sell_quantity);
//				//console.log("SELL_QUANT2:"+sell_quantity);
//				q=sell_quantity-q;
//				console.log("Q1:"+q);
//				if(q==0)
//					{
//					console.log("Inside confirm if");
//					var query= "DELETE FROM sell_item WHERE item_id='"+req.session.item_id[k]+"';";
//					mysql1.add(function(err,result){
//						if(err){
//							throw err;
//						}
//						else{
//							console.log("Sell item deleted.");
//						}
//					},query);
//					}
//				else
//					{
//					console.log("Inside confirm if,where q is:"+q);
//					var query= "UPDATE sell_item SET quantity='"+q+"' WHERE item_id='"+req.session.item_id[k]+"';";
//
//					mysql1.add(function(err,result){
//						if(err){
//							throw err;
//						}
//						else{
//							console.log("Updated");
//						}
//					},query);
//							
//					}} 
//				 }
//		//},query);
//		
////		var query= "DELETE FROM cart WHERE email='"+req.session.email+"';";
////		mysql1.add(function(err,result){
////			if(err){
////				throw err;
////			}
////			else{
////				console.log("hogaya kaam");
////			}
////		},query);	
//	
//
//
//};

	exports.checkout = function(req, res){
		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on Proceed to checkout button in the cart page.');
		var email=req.session.email;
		var op="checkout";
		var msg_payload = { "operation": op,"email":email};
		mq_client.make_request('item_queue',msg_payload, function(err,results){
			//console.log("YES:"+results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					
					res.render('checkout', { title: 'Express', user: req.session.user, handle:req.session.handle,first:results.first,last:results.last,address:results.address,phone:results.phone,total:results.total,city:results.city,state:results.state,zip:results.zip });
					}
				else{
					console.log("ERROR");
				}
			}
		});
	};
		
//		registerModel.find({ email:req.session.email }, function (err,records) {
//			if(err){
//				throw err;
//			}
//			else{
//				var first=records[0].first;
//				var last=records[0].last;
//				var phone=records[0].phone_number;
//				var address=records[0].address;
//				var city=records[0].city;
//				var state=records[0].state;
//				var zip=records[0].zip;
//				var q;
//				console.log('Inside checkout');
//				cartModel.find({ email:req.session.email }, function (err,records) {
//					if(err){
//						throw err;
//					}
//					else{
//						var total=0;
//						
//						for( var i=0;i<records.length;i++)
//							{
//							total= +total + +records[i].subtotal;
//							}
//						
//							res.render('checkout', { title: 'Express', user: req.session.user, handle:req.session.handle,first:first,last:last,address:address,phone:phone,total:total,city:city,state:state,zip:zip });
//}
//				});}
//		});

//		var query= "SELECT * FROM register WHERE email='"+req.session.email+"';";
//		mysql1.get(function(err,records){
//			if(err){
//				throw err;
//			}
//			else{
//				var first=records[0].first_name;
//				var last=records[0].last_name;
//				var phone=records[0].phone_number;
//				var address=records[0].address;
//				var city=records[0].city;
//				var state=records[0].state;
//				var zip=records[0].zip;
//				var q;
//				console.log('Inside checkout');
//				var query= "SELECT * FROM cart WHERE email='"+req.session.email+"';";
//				
//				mysql1.get(function(err,records){
//					if(err){
//						throw err;
//					}
//					else{
//						
//						var total=0;
//						
//						for( var i=0;i<records.length;i++)
//							{
//							total= +total + +records[i].subtotal;
//							}
//						
//	res.render('checkout', { title: 'Express', user: req.session.user, handle:req.session.handle,first:first,last:last,address:address,phone:phone,total:total,city:city,state:state,zip:zip });
//						
//						
//					}
//				},query);
//				
//				
//			}
//		},query);
//};
	
exports.delete_cart = function(req, res){
	winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on delete button to delete item in the cart.');
	console.log("Inside delete cart");
var id=req.param("id");
console.log("Cart ID:"+id);
var op="delete_cart";  
var msg_payload = { "operation": op,"item_id":id,"email":req.session.email};
mq_client.make_request('item_queue',msg_payload, function(err,results){
	console.log("YES:"+results);
	if(err){
		throw err;
	}
	else 
	{
		if(results.code == "200"){
			console.log("enetered if."+results.total);
			res.render('cart', { title: 'Express',rec:results.records, user: req.session.user, handle:req.session.handle,total:results.total });
			}
		else{
			console.log("ERROR");
		}
	}
});
};
//cartModel.remove({item_id:id},function(err,result){
//	if(err){
//		throw err;
//	}
//	else{
//		console.log("deleted the mother fucking element");
//	}
//});
//cartModel.find({ email:req.session.email }, function (err,records) {
//	if(err){
//		throw err;
//	}
//	else{
//		console.log('Inside cart select');
//		
//		var total=0;
//		for( var i=0;i<records.length;i++)
//			{
//			total= +total + +records[i].subtotal;
//			}
//		
//		console.log("Total:"+total);
//		console.log(records);
//		res.render('cart', { title: 'Express',rec:records, user: req.session.user, handle:req.session.handle,total:total });
//}
//});
//	};

exports.displayCart = function(req, res){
	
	winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on cart button to display items in the cart.');
	var email=req.session.email;
	var op="display_cart";  
	var msg_payload = { "operation": op,"email":email};
	mq_client.make_request('item_queue',msg_payload, function(err,results){
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == "200"){
				console.log("DISPLAY enetered the right if.");
				
				res.render('cart', { title: 'Express',rec:results.records, user: req.session.user, handle:req.session.handle,total:results.total });
				}
			else{
				console.log("ERROR");
			}
		}
	});	
	
	
	
//	cartModel.find({ email:req.session.email }, function (err,records) {
//		if(err){
//			throw err;
//		}
//		else{
//			console.log('Inside cart select');
//			
//			var total=0;
//			for( var i=0;i<records.length;i++)
//				{
//				total= +total + +records[i].subtotal;
//				}
//			
//			console.log("Total:"+total);
//			console.log(records);
//			res.render('cart', { title: 'Express',rec:records, user: req.session.user, handle:req.session.handle,total:total });
//}
//	});
	};
exports.cart = function(req, res){
	winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on Add to cart button to put the items to the cart.');
	  console.log("Inside cart");
	  var item_name=req.param("item_name");
	  var item_price=req.param("item_price");
	  var quantity=req.param("quantity");
	  console.log("QUANTITY:"+quantity);
	  //var quantity=quantity;
	  var item_desc=req.param("item_desc");
	  var item_id=req.param("item_id");
	  
	  var email=req.param("email");
	  console.log("EMAIL:"+email);
	  req.session.item_id.push(item_id);
	  console.log("ITEM ID:");
	  console.dir(req.session.item_id);
		//req.session.quantity=[];
		req.session.quantity.push(quantity);
		req.session.se.push(email);
		console.dir(req.session.quantity);
		console.log("I:"+req.session.item_id);
		console.log("Add tiem:"+req.session.se);

		var subtotal=quantity*item_price;
	  email=req.session.email;
	  var op="cart";  
		var msg_payload = { "operation": op,"email":email,"item_name":item_name,"item_price":item_price,"quantity":quantity,"item_desc":item_desc,"item_id":item_id,"subtotal":subtotal};
		mq_client.make_request('item_queue',msg_payload, function(err,results){
			console.log("YES:"+results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					console.log("enetered if."+results.total);
					res.redirect('/displayCart');
//					res.render('cart', { title: 'Express',rec:results.records, user: req.session.user, handle:req.session.handle,total:results.total });
					}
				else{
					console.log("ERROR");
				}
			}
		});
};
	  
	  
	  
	  
	  
	  
//	  add.save(function(err, ans) {
//			if(err)
//				{
//				throw err;
//				}
//			else
//				{
//				console.log(ans);
//				cartModel.find({ email:req.session.email }, function (err,records) {
//					if(err){
//						throw err;
//					}
//					else{
//						console.log('Inside cart select');
//						
//						var total=0;
//						for( var i=0;i<records.length;i++)
//							{
//							total= +total + +records[i].subtotal;
//							}
//						
//						console.log("Total:"+total);
//						console.log(records);
//						res.redirect('/displayCart');}
//				});
//				
//				}
//		});
//};
	
	
exports.signin = function(req, res){
	var message="";
	res.render('signin', { title: 'Express',message:message });
	};
	
	exports.home = function(req, res){
		var handle,message,json;
		var email=req.session.email;
		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on home button.');
		console.log("In /home");
		var item_name,item_price,item_description,quantity;
		var timestamp;
		
		var currentdate = new Date(); 
		var datetime = currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes() + ":" 
		                + currentdate.getSeconds();

		    console.log("Timestamp:"+datetime);
		var op = "home";
		var msg_payload = { "operation": op,"email":email,"datetime":datetime };
		mq_client.make_request('register_queue',msg_payload, function(err,results){
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					console.log("enetered the right if.");
					console.log("RESULTS:");
					//console.dir(results);
					req.session.user=results.user;
					req.session.handle=results.handle;
					res.render('afterLogin', { title: 'Express',user: req.session.user,handle:req.session.handle,rec:results.records });
				
				}
				else{
					console.log("ERROR");
				}
			}
		});
	};	
		
		
		
//		registerModel.find({email:req.session.email},function(err,ans){
//			if(err){
//				throw err;
//			}
//			else{
//				console.log("I AM HERE.");
//				console.log("FIRST:"+ans[0].first);
//				//req.session.email=req.param('email');
//				 console.log("EMAIL:"+req.session.email);
//				 var user=ans[0].first;
//				 req.session.user=user;
//				 var result = user.substring(0, user.length-1);
//					handle=result+"-0";
//					console.log('Handle:'+handle);
//					req.session.handle=handle;
//					
//				console.log("Session initialized");
//					
//					   console.log('user1:'+user);
//					   var timestamp;
//						
//						var currentdate = new Date(); 
//						var datetime = currentdate.getDate() + "/"
//						                + (currentdate.getMonth()+1)  + "/" 
//						                + currentdate.getFullYear() + " @ "  
//						                + currentdate.getHours() + ":"  
//						                + currentdate.getMinutes() + ":" 
//						                + currentdate.getSeconds();
//
//						    console.log("Timestamp:"+datetime);
//						    //var reg = new registerModel();	
//						    registerModel.update({email:req.session.email},
//	                    			{
//	                    				$set: { last_login_time:datetime
//	                    				}
//	                    			},function(err, newuser) {
//	                    				if(err)
//	                    				{
//	                    				throw err;
//	                    				}}
//	                    		);
//						    var email,item_name,item_price,item_description,quantity;
//							sell_itemModel.find({ quantity: { $gt: 0 } }, function (err,result) {
//								if(err){
//									throw err;
//								}
//								else{
//									console.log("RESULT:"+result);
//									res.render('afterLogin', { title: 'Express',user: req.session.user,handle:req.session.handle,rec:result });
//								}
//							}); 
//	}
//			
//			});
//		sell_itemModel.find({ quantity: { $gt: 0 } }, function (err,result) {
//			if(err){
//				throw err;
//			}
//			else{
//				console.log("RESULT:"+result);
//				res.render('afterLogin', { title: 'Express',user: req.session.user,handle:req.session.handle,rec:result });
//			}
//		});
	//};
//exports.afterLogin = function(req, res){
//	
//	req.session.se=[];
//	req.session.quantity=[];
//	req.session.item_id=[];
//	var email=req.param("email");
//	var password=req.param("password");
//	var handle,message,json;
//	winston.log('info',email+' has logged in.',new Date(), 'Logged in after clicking the sign in button, its handle is generated, timestamp inserted to DB');
//	
//	};
	var isValidPassword = function(user, password){
		  return bCrypt.compareSync(password, user.password);
		};
	
	passport.use('signin', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
	    passReqToCallback : true
	  },
	  function(req, username, password, done) {
		  var op = "signin";
		   req.session.se=[];
		   	req.session.quantity=[];
		   	req.session.item_id=[];
		   	req.session.email=username;
		   	console.log("P1:"+password);
			var msg_payload = { "operation": op,"email":username,"password":password };
			mq_client.make_request('register_queue',msg_payload, function(err,results){
				console.log(results);
				if(err){
					throw err;
				}
				else 
				{
					if(results.code == "200"){
						console.log("enetered the right if.");
						console.log("RESULTS:");
						
					    
						return done(null,results);
					
					}
					else{
						console.log("ERROR");
					}
				}
			});
	  }));
		  
//	    registerModel.findOne({ 'email' : username }, 
//	      function(err, user) {
//	        if (err)
//	          return done(err);
//	        if (!user){
//	          console.log('User Not Found with email '+username);
//	          return done(null, false, 
//	                req.flash('message', 'User Not found.'));                 
//	        }
//	        // User exists but wrong password, log the error 
//	        if (!isValidPassword(user, password)){
//	          console.log('Invalid Password');
//	          return done(null, false, 
//	              req.flash('message', 'Invalid Password'));
//	        }
//	       console.log("MATCHED.");
//	       console.log("Email:"+req.param('email'));
//	       req.session.email=req.param('email');
//	       req.session.se=[];
//	   	req.session.quantity=[];
//	   	req.session.item_id=[];
//	        return done(null, user);
//	      }
//	    );
//	}));
//	var op="insert";
//	var msg_payload = { "operation": op};
//	mq_client.make_request('register_queue',msg_payload, function(err,results){
//		
//		if(err){
//			throw err;
//		}
//		else 
//		{
//			if(results.code == "200"){
//				
//				res.render('checkout', { title: 'Express', user: req.session.user, handle:req.session.handle,first:results.first,last:results.last,address:results.address,phone:results.phone,total:results.total,city:results.city,state:results.state,zip:results.zip });
//				}
//			else{
//				console.log("ERROR");
//			}
//		}
//	});
//	
	
	
//exports.insert = function(req, res){
	//winston.log('info','insert user',new Date(), 'user has clicked on register button to register.');
	passport.use('insert', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
	    passReqToCallback : true
	  },
	  function(req,username, password, done) {
		  console.log("bulla");
		  var findOrCreateUser = function(){
	    	console.log("ENTERED findorcreate");
	    	winston.log('info','insert user',new Date(), 'user has clicked on register button to register.');
	    	var op = "insert";
			var msg_payload = { "operation": op,"email":username,"password":password, "first":req.param('firstname'),"last":req.param('lastname') };
			mq_client.make_request('register_queue',msg_payload, function(err,results){
				console.log(results);
				if(err){
					throw err;
				}
				else 
				{
					if(results.code == "200"){
						console.log("enetered the right if.");
						console.log("RESULTS:");
						return done(null,results);
					
					}
					else{
						console.log("ERROR");
					}
				}
			});
	    	
	    	
	    	
	    	
	    	
	    	
	    	
	    	
	    	
	    	
	      registerModel.findOne({'email':username},function(err, user) {
	
	        if (err){
	          console.log('Error in SignUp: '+err);
	          return done(err);
	        }
	     
	        if (user) {
	          console.log('User already exists');
	          var message="User already exists.";
			  console.log(message);
			  //res.render('signin', { title: 'Express', message:message});
			  return done(null, false, 
			             req.flash('message','User Already Exists'));
	          //return done(null, false);
	        } else {
	        	console.log("ENTERED the right else");
	        	var sign = new registerModel();
	          sign.password = createHash(password);
	          sign.email = req.param('email');
	          sign.first = req.param('firstname');
	          sign.last = req.param('lastname');
	      	sign.phone_number=null;
	    	sign.birthday=null;
	    	sign.address=null;
	    	sign.city=null;
	    	sign.state=null;
	    	sign.zip=null;
	    	sign.last_login_time=null;
	    	
	          sign.save(function(err) {
	            if (err){
	              console.log('Error in Saving user: '+err);  
	              throw err;  
	            }
	            console.log('User Registration succesful'); 
	            return done(null, sign);
	            
	          });
	        }
	});
	    };
	    process.nextTick(findOrCreateUser);
	  }));
	
	
	
	
	
	
	
	
	
	
//};
	
	
	
	
	
//	var email=req.param("email");
//	registerModel.findOne({email:email},function(err,ans){
//		if(err){
//			throw err;
//		}
//		else{
//			if(ans!=null){
//				  var message="User already exists.";
//				  console.log(message);
//				  res.render('signin', { title: 'Express', message:message});
//			  }
//			else{
//				var sign = new registerModel();		
//				sign.first=req.param("firstname");
//				sign.last=req.param("lastname");
//				
//	sign.email=email;
//	sign.password=req.param("password");
//	sign.phone_number=null;
//	sign.birthday=null;
//	sign.address=null;
//	sign.city=null;
//	sign.state=null;
//	sign.zip=null;
//	sign.last_login_time=null;
//	sign.save(function(err, newuser) {
//		if(err)
//			{
//			throw err;
//			}
//		else
//			{
//			console.log(newuser);
//		
//			res.redirect('/');
//			res.end();
//			}
//	});
//			}
//		}});
	//};	
	
//	exports.insertuser = function(req,res)
//	{
//			var op = "insert_user";
//			var msg_payload = { "operation": op, "email": req.param("email"),"first_name": req.param("firstname"), "password": req.param("password"), "lastname": req.param("last_name")};
//			mq_client.make_request('register_queue',msg_payload, function(err,results){
//				console.log(results);
//				if(err){
//					throw err;
//				}
//				else 
//				{
//					if(results.code == 200){
//						console.log("Registration Successfull.");
//						res.redirect('/');
//						
//					}
//					else {
//						console.log("Invalid Login");
//						
//					}
//				}  
//			});		
//		};
exports.redirectToHomepage = function(req,res)
	{
		//Checks before redirecting whether the session is valid
		if(req.session.email)
		{
			//Set these headers to notify the browser not to maintain any cache for the page being loaded
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			res.render('afterLogin',{user:req.session.user});
		}
		else
		{
			res.redirect('/');
		}
	};
	exports.logout = function(req,res)
	{
		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on logout button to logout.');
		req.session.destroy();
		res.redirect('/');
	};
	
	exports.addItem = function(req,res)
	{
		
		console.log("additem");
		console.log(req.session.user);
		console.log(req.session.handle);
		res.render('addItem', { title: 'Express',user:req.session.user, handle:req.session.handle });	
	};
	exports.itemDisplay = function(req,res)
	{
		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on item name which takes it to item display page.');
		console.log("Inside item display");
		var id,item_name,item_price,quantity,bid_flag,item_desc,email,item_id,current;
		id=req.param("id");
		console.log("Item id:"+id);
		var op="item_display";  
		var msg_payload = { "operation": op,"id":id};
		mq_client.make_request('item_queue',msg_payload, function(err,results){
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					console.log("enetered the right if.");
					console.log("RESULTS:");
					console.dir(results);
					item_name = results.records[0].item_name;
					 item_price= results.records[0].item_price;
					 quantity=results.records[0].quantity;
					 item_desc=results.records[0].item_description;
					 bid_flag=results.records[0].bid_flag;
					 email=results.records[0].email_id;
					 current=results.records[0].maximum_bid;
			
					 if(current==null)
						 {
						 current=item_price;
						 }
					res.render('itemDisplay', { title: 'Express',current:current,item_id:id,item_name:item_name,item_price:item_price,quantity:quantity,item_desc:item_desc,bid_flag:bid_flag,email:email,user:req.session.user,handle:req.session.handle,id:id });
					}
				else{
					console.log("ERROR");
				}
			}
		});	
	};

	exports.add = function(req,res)
	{
		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on sell button to add item.');
		var email_id=req.session.email;
		var item_id=req.param("item_id");
		var item_name=req.param("itemName");
		var item_price=req.param("price");
		var item_description=req.param("itemDesc");
		var quantity=req.param("quantity");
		var bid_flag=req.param("bid");
		var timestamp;
		var currentdate = new Date(); 
		var add_time = currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes();
		    var expire=new Date();
		    var days=4;
		    expire.setDate(expire.getDate() + days);
		    var expire_time= expire.getDate() + "/"
            + (expire.getMonth()+1)  + "/" 
            + expire.getFullYear() + " @ "  
            + expire.getHours() + ":"  
            + expire.getMinutes();
		    if(bid_flag=="fixed")
			{
			expire_time=null;
			}
		  var op="add_item";  
		var msg_payload = { "operation": op,"email_id":email_id,"item_id":item_id,"item_name":item_name,"item_price":item_price,"item_description":item_description,"quantity":quantity,"bid_flag":bid_flag,"add_time":add_time,"expire_time":expire_time};
		mq_client.make_request('item_queue',msg_payload, function(err,results){
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					console.log("enetered the right if.");
					res.redirect('/home');
					}
				else{
					console.log("ERROR");
				}
			}
		});		  
};
	exports.about = function(req, res){
		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on about button to see its profile.');
		console.log("Inside about");
		var email=req.session.email;
		var first,last,em;
		console.log(email);
		var op = "about";
		var msg_payload = { "operation": op,"email":email };
		mq_client.make_request('register_queue',msg_payload, function(err,results){
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					console.log("enetered the right if.");
					console.log("RESULTS:");
					console.dir(results);
					res.render('about', { title: 'Express', address:results.records[0].address, city:results.records[0].city, zip:results.records[0].zip,state:results.records[0].state, phone_number:results.records[0].phone_number, user: results.records[0].first, last:results.records[0].last,email:results.records[0].email,handle:req.session.handle,birthday:results.records[0].birthday, });
					//res.render('homepage', { title: 'home',user:results.user.email,phone:results.user.phone,first:results.user.first_name,last:results.user.last_name });
				}
				else{
					console.log("ERROR");
				}
			}
		});
	};

exports.updateAbout = function(req, res){
		
		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on update button in about.');
		var first,last,em,phone_number;
		var birthday=req.param("birth");
		var phone=req.param("phone");
		var address=req.param("address");
		var city=req.param("city");
		var state=req.param("state");
		var zip=req.param("zip");
		var op = "update_about";
		console.log("Update About before payload");
		var msg_payload = { "operation": op,"email":req.session.email,"birthday":birthday,"phone":phone,"address":address,"city":city,"state":state,"zip":zip };
		mq_client.make_request('register_queue',msg_payload, function(err,results){
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					console.log("enetered the right if.");
					console.log("RESULTS:");
					console.dir(results);
					res.render('about', { title: 'Express', address:results.records[0].address, city:results.records[0].city, zip:results.records[0].zip,state:results.records[0].state, phone_number:results.records[0].phone_number, user: results.records[0].first, last:results.records[0].last,email:results.records[0].email,handle:req.session.handle,birthday:results.records[0].birthday, });
					//res.render('about', { title: 'Express', address:address, city:city, zip:zip,state:state, phone_number:phone_number, user: first, last:last,email:em,handle:req.session.handle,birthday:birthday, });
					
				}
				else{
					console.log("ERROR");
				}
			}
		});
};
exports.refresh = function(req, res){
			winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on refresh button in the cart.');
			var sub,quant,msg;
		var q=req.param("quantity");
		console.log("QUANTITY:"+q);
		var id=req.param("id");
		id=id.substring(1,id.length-1);
		console.log("ID:"+id);
		var op="refresh";
		var msg_payload = { "operation": op,"q":q,"id":id};
		mq_client.make_request('item_queue',msg_payload, function(err,results){
			console.log("yo:"+results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == "200"){
					console.log("enetered the right if.");
					res.redirect('/displayCart');
					//res.send('200');
					}
				else{
					console.log("ERROR");
				}
			}
		});	
};
//		cartModel.findOne({item_id:id}, function (err,result) {
//			if(err){
//				throw err;
//			}
//			else{
//				//console.log(result);
//				console.log("INSIDE ELSE");
//				sub=result.subtotal;
//			    quant=result.quantity;
//			    sub=sub/quant;
//			    sub=sub*q;
//			    console.log("NEW QUANT:"+q);
//			    console.log("NEW SUB:"+sub);
//			    cartModel.update({item_id:id},
//		    			{
//		    				$set: { quantity:q,
//		    					subtotal:sub
//		    					
//		    				}
//		    			},function(err, newuser) {
//		    				if(err)
//		    				{
//		    				throw err;
//		    				}
//		    			else{
//		    				//console.log("refresh button end:" + req.session.se);
//					    	res.send('200');}
//		    			}
//		    		);
//		}
//		});
//};
		
		
//		var query= "SELECT subtotal,quantity FROM cart WHERE cart_id='"+id+"';"; 
//		mysql1.get(function(err,result){
//			if(err){
//				throw err;
//			}
//			else{
//				console.log("i am here in first else");
//			    sub=result[0].subtotal;
//			    quant=result[0].quantity;
//			    sub=sub/quant;
//			    sub=sub*q;
// var query= "UPDATE cart SET quantity='"+q+"',subtotal='"+sub+"',cart_id='"+id+"' WHERE cart_id='"+id+"';";
//
//				mysql1.add(function(err,res){
//					if(err){
//						throw err;
//					}
//					else{
//						console.log("refresh button end:" + req.session.se);
//				    	res.send('200');
//					}
//				},query);
//			}
//
//
//		},query);  
//			};
			
			exports.placeBid = function(req, res){
				
				var bid_amount=req.param('bid');
				var user_id=req.session.email;
				var item_id=req.param('item_id');
				var currentdate = new Date(); 
				winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on place bid button to place the bid:'+bid_amount);
				var timestamp = currentdate.getDate() + "/"
				                + (currentdate.getMonth()+1)  + "/" 
				                + currentdate.getFullYear() + " @ "  
				                + currentdate.getHours() + ":"  
				                + currentdate.getMinutes();
				    
				  var op="place_bid";  
				var msg_payload = { "operation": op,"user_id":user_id,"item_id":item_id,"bid_amount":bid_amount,"timestamp":timestamp};
				mq_client.make_request('item_queue',msg_payload, function(err,results){
					console.log(results);
					if(err){
						throw err;
					}
					else 
					{
						if(results.code == "200"){
							console.log("enetered the right if.");
							res.redirect('/home');
							}
						else{
							console.log("ERROR");
						}
					}
				});	
				
				
//				var first,last,em,phone_number;
//				var b=new bidModel();
//				b.bid_amount=req.param("bid");
//				winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on place bid button to place the bid:'+b.bid_amount);
//				b.item_id=req.param("item_id");
//			
//				var currentdate = new Date(); 
//				b.user_id=req.session.email;
//				b.timestamp = currentdate.getDate() + "/"
//				                + (currentdate.getMonth()+1)  + "/" 
//				                + currentdate.getFullYear() + " @ "  
//				                + currentdate.getHours() + ":"  
//				                + currentdate.getMinutes();
//				b.save(function(err, ans) {
//					if(err)
//						{
//						throw err;
//						}
//					else
//						{
//						console.log("Bid Inserted.");
//						}
//});			
//
//				
//				sell_itemModel.update({_id:b.item_id},
//		    			{
//		    				$set: { maximum_bid:b.bid_amount,
//            					email_bid:req.session.email
//		    					
//		    				}
//		    			},function(err, newuser) {
//		    				if(err)
//		    				{
//		    				throw err;
//		    				}
//		    			else{
//		    				
//		    				res.redirect('/home');}
//		    			
//			});

};


	var createHash = function(password){
		 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
		};
