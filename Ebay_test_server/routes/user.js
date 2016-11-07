
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
exports.sold = function(msg, callback){
	var res={};
	var em=msg.email;
	//winston.log('info',req.session.email+' is the user.',new Date(), 'User has clicked on sold items.');
	sold_itemModel.find({ em:em }, function (err,records) {
		if(err){
			res.code = "401";
			res.value = "Failed Login";
			console.log("ENTERED WRONG IF.");
			throw err;
			
		}
		else{
			res.code = "200";
			res.value = "Sucess About";
			res.records=records;
			callback(null,res);
			
		}
	});
	};

exports.purchase = function(msg, callback){
	var res={};
	var em=msg.email;
	//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on purchase history button in My eBay.');
	purchase_itemModel.find({ emailID:em }, function (err,records) {
		if(err){
			res.code = "401";
			res.value = "Failed Login";
			console.log("ENTERED WRONG IF.");
			throw err;
		}
		else{
			res.code = "200";
			res.value = "Sucess About";
			res.records=records;
			callback(null,res);
			//res.render('purchase', { title: 'Express', user: req.session.user,rec:result, handle:req.session.handle });
		}
	});	
	};

exports.confirm = function(msg, callback){
	//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on checkout to place the order.');
var sell_quantity;
var res={};
//var quantity=[];
var quant=msg.quantity;
console.log("QUANTITY SESSION:"+quant);
var email=msg.email;
var datetime=msg.datetime;
//var item_id=[];
var id=msg.item_id;
console.log("Item ID SESSION:"+id);
var se=msg.se;
console.log("QUANTITY_server:"+quant);
//var id=msg.id;
cartModel.find({ email:email }, function (err,records) {
	if(err){
		throw err;
	}
	else{
		var pur=new purchase_itemModel();
		var sol=new sold_itemModel();
		var item_name=[];
		var item_desc=[];
		var quantity=[];
		var subtotal=[];
		var item_id=[];
		console.log("Before shit happened:");
		console.dir(records);
		var c=0;
		for(var i=0;i<records.length;i++)
			{
			
			item_name[i]=records[i].item_name;
			item_desc[i]=records[i].item_desc;
			quantity[i]=records[i].quantity;
			subtotal[i]=records[i].subtotal;
			item_id[i]=records[i].itemid;
			}
		console.log("count:"+c);
		console.dir(item_name);
		var record;          
		for(var j=0;j<records.length;j++)
			{
			c++;
			//var flag=0;
			pur.emailID=email;
			pur.item_name=records[j].item_name;
			pur.item_description=records[j].item_desc;
			pur.quantity=records[j].quantity;
			pur.subtotal=records[j].subtotal;
			pur.date=datetime;
			
			console.log("Pur.item_nmae:"+pur.item_name);
			console.log("Pur.quantity:"+pur.quantity);
			//console.log("before wile");
			//while(flag==0){
				//console.log("in while.");
			pur.save(function(err, ans) {
				if(err)
					{
					throw err;
					}
				else
					{
					console.log("Data inserted:"+c);
					//flag=1;
				
					}
			});
			}
			//}
		console.log("count:"+c);
		var c1=0;
		for(var m=0;m<records.length;m++)
		{
			//sol.em=email;
			c1++;
			sol.item_name=records[m].item_name;
			sol.item_description=records[m].item_desc;
			sol.quantity=records[m].quantity;
			sol.item_price=records[m].subtotal;
			console.log("SOl.item_nmae:"+sol.item_name);
			console.log("SOl.EM:"+se[m]);
			sol.em=se[m];
			sol.save(function(err, ans) {
				if(err)
					{
					throw err;
					}
				else
					{
					//continue;
					console.log("Seeler console:"+c1);
			}
			});
		
		}
		cartModel.find({ email:email }, function (err,records) {
			if(err){
				throw err;
			}
			else{
				var q;
				for(var k=0;k<records.length;k++)
				{
					console.log("jlnds:"+records[k].quantity);
				q=records[k].quantity;
				console.log("before Q1:"+q);
				sell_quantity=parseInt(quant[k]);
				console.log("Sell quantity:"+sell_quantity);
				q=sell_quantity-q;
				console.log("Q1:"+q);
				if(q==0)
					{
					console.log("Inside confirm if");
					console.log("ERROR:"+id[k]);
					
					sell_itemModel.remove({_id:id[k]});
					}
				else
					{
					console.log("Inside confirm if,where q is:"+q);
					q=q.toString();
					console.log("Q:"+typeof(q));
					console.log("ERROR:"+id[k]);
					sell_itemModel.update({_id:id[k]},
			    			{
			    				$set: { quantity:q
			    				}
			    			},function(err, newuser) {
			    				if(err)
			    				{
			    				throw err;
			    				}
			    				else
			    					{
			    					console.log("QUANTITY UPDATED"+q);
			    					}
			    				});}} 
				 }
			cartModel.remove({email:email},function(err,result){
				if(err){
					res.code = "401";
					res.value = "Failure";
					throw err;
				}
				else{
					res.code = "200";
					res.value = "Sucess About";
					//res.records=records;
					console.log("deleted the mother fucking element");
					callback(null,res);
					
				}});
});
}
});

//res.render('confirm', { title: 'Express', user: req.session.user, handle:req.session.handle });

};


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

	exports.checkout = function(msg, callback){
		var res={};
		var email=msg.email;
		//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on Proceed to checkout button in the cart page.');
		registerModel.find({ email:email }, function (err,records) {
			if(err){
				throw err;
			}
			else{
				var first=records[0].first;
				var last=records[0].last;
				var phone=records[0].phone_number;
				var address=records[0].address;
				var city=records[0].city;
				var state=records[0].state;
				var zip=records[0].zip;
				var q;
				console.log('Inside checkout');
				cartModel.find({ email:email }, function (err,records) {
					if(err){
						res.code = "401";
						res.value = "Failed Login";
						console.log("ENTERED WRONG IF.");
						throw err;
					}
					else{
						res.code = "200";
						res.value = "Sucess About";
						var total=0;
						for( var i=0;i<records.length;i++)
							{
							total= +total + +records[i].subtotal;
							}
						console.log("Total:"+total);
						res.records=records;
						res.first=first;
						res.last=last;
						res.phone=phone;
						res.address=address;
						res.city=city;
						res.state=state;
						res.zip=zip;
						res.total=total;
						callback(null,res);
						
							//res.render('checkout', { title: 'Express', user: req.session.user, handle:req.session.handle,first:first,last:last,address:address,phone:phone,total:total,city:city,state:state,zip:zip });
}
				});}
		});
	};
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
	
exports.delete_cart = function(msg, callback){
	//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on delete button to delete item in the cart.');
	console.log("Inside delete cart");
var id=msg.item_id;
var email=msg.email;
var res={};
console.log("Cart ID:"+id);
cartModel.remove({item_id:id},function(err,result){
	if(err){
		throw err;
	}
	else{
		console.log("deleted the mother fucking element");
	}
});
cartModel.find({ email:email }, function (err,records) {
	if(err){
		res.code = "401";
		res.value = "Failed Login";
		console.log("ENTERED WRONG IF.");
		throw err;
	}
	else{
		console.log('Inside cart select');
		
		res.code = "200";
		res.value = "Sucess About";
		var total=0;
		for( var i=0;i<records.length;i++)
			{
			total= +total + +records[i].subtotal;
			}
		console.log("Total:"+total);
		res.records=records;
		res.total=total;
		callback(null,res);
}
});
	};

exports.displayCart = function(msg, callback){
	
	//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on cart button to display items in the cart.');
	var email=msg.email;
	var res={};
	cartModel.find({ email:email }, function (err,records) {
		if(err){
			res.code = "401";
			res.value = "Failed Login";
			console.log("ENTERED WRONG IF.");
			throw err;
		}
		else{
			res.code = "200";
			res.value = "Sucess About";
			var total=0;
			for( var i=0;i<records.length;i++)
				{
				total= +total + +records[i].subtotal;
				}
			console.log("Total:"+total);
			res.records=records;
			res.total=total;
			callback(null,res);

}
	});
	};
exports.cart = function(msg,callback){
	winston.log('info',msg.email+' is the user.',new Date(), 'user clicked on Add to cart button to put the items to the cart.');
	  console.log("Inside cart");
	  var add=new cartModel();
	  var res={};
	  add.item_name=msg.item_name;
	  add.item_price=msg.item_price;
	  //var quantity=req.param("quantity");
	  //console.log("QUANTITY:"+quantity);
	  add.quantity=msg.quantity;
	  add.item_desc=msg.item_desc;
	  var item_id=msg.item_id;
	  console.log("ITEM ID:"+item_id);
	  add.item_id=item_id;
	  var email=msg.email;
	  console.log("EMAIL:"+email);
	 add.email=email;
	  add.subtotal=add.quantity*add.item_price;
	  add.save(function(err, ans) {
			if(err)
				{
				throw err;
				}
			else
				{
				console.log(ans);
				cartModel.find({ email:email }, function (err,records) {
					if(err){
						res.code = "401";
						res.value = "Failed Login";
						console.log("ENTERED WRONG IF.");
						throw err;
					}
					else{
						res.code = "200";
						res.value = "Sucess About";
						var total=0;
						for( var i=0;i<records.length;i++)
							{
							total= +total + +records[i].subtotal;
							}
						console.log("Total:"+total);
						res.records=records;
						res.total=total;
						console.log("ab to aaja:"+res.records);
						callback(null,res);
				}
				});
				
				}
		});
};
	
//	
//exports.signin = function(req, res){
//	var message="";
//	res.render('signin', { title: 'Express',message:message });
//	};
	
	exports.home = function(msg, callback){
		
		console.log("In /home");
		var datetime=msg.datetime;
		var email=msg.email;
		//var password=msg.password;
		var res={};
		var item_name,item_price,item_description,quantity;
		//console.log("paas:"+password);
		registerModel.find({email:email},function(err,ans){
			if(err){
				throw err;
			}
			else{
				console.log("I AM HERE.");
				console.log("FIRST:"+ans[0].first);
				//req.session.email=req.param('email');
				 console.log("EMAIL:"+email);
				 var user=ans[0].first;
				 ans.user=user;
				 //req.session.user=user;
				 var result = user.substring(0, user.length-1);
					var handle=result+"-0";
					console.log('Handle:'+handle);
					ans.handle=handle;
					
				console.log("Session initialized");
					
					   console.log('user1:'+user);
					   
						    //var reg = new registerModel();	
						    registerModel.update({email:email},
	                    			{
	                    				$set: { last_login_time:datetime
	                    				}
	                    			},function(err, newuser) {
	                    				if(err)
	                    				{
	                    				throw err;
	                    				}}
	                    		);
						    var item_name,item_price,item_description,quantity;
							sell_itemModel.find({ quantity: { $gt: 0 } }, function (err,records) {
								if(err){
									res.code = "401";
									res.value = "Fail";
									throw err;
								}
								else{
									res.code = "200";
									res.value = "Sucess About";
									res.user=ans.user;
									res.handle=ans.handle;
									res.records=records;
									callback(null,res);
									//console.log("RESULT:"+result);
									//res.render('afterLogin', { title: 'Express',user: req.session.user,handle:req.session.handle,rec:result });
								}
							}); 
	}
			
			});
//		sell_itemModel.find({ quantity: { $gt: 0 } }, function (err,result) {
//			if(err){
//				throw err;
//			}
//			else{
//				console.log("RESULT:"+result);
//				res.render('afterLogin', { title: 'Express',user: req.session.user,handle:req.session.handle,rec:result });
//			}
//		});
	};
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
	exports.signin=function(msg,callback){
		
	var res={};
	var username=msg.email;
	var password=msg.password;
	console.log("real P:"+password);
	
	    registerModel.findOne({ 'email' : username }, 
	      function(err, user) {
	        if (err)
	        	{
	        	res.code = "401";
				res.value = "Invalid password";
	        	}
	        
	        if (user==null){
	        	console.log("USER:"+user);
	          console.log('User Not Found with email '+username);
	          res.code = "401";
				res.value = "User not found.";              
	        }
	        // User exists but wrong password, log the error 
//	        if (!isValidPassword(user, password)){
//	          console.log('Invalid Password');
//	          res.code = "401";
//				res.value = "Invalid password";
//	        }
	        else{
	        	var comp=bCrypt.compareSync(password, user.password);
	        	if(comp==true){
	        		res.code="200";
	        	}
	        	else{
	        		res.code="401";
	        	}
	        }
			res.value = "Sucess About";
			
			callback(null,res);
	      }
	    );
	};
	//));
	
	
exports.insert = function(msg, callback){
	var res={};
	var email=msg.email;
	var password=msg.password;
	var first=msg.first;
	var last=msg.last;
	console.log(email);
	var birthday=null;
	var address=null;
	var city=null;
	var zip=null;
	var state=null;
	var phone_number=null;
	
	registerModel.find({ email:msg.email }, function (err,records) {
		if(err){
			res.code = "401";
			res.value = "Failed Login";
			console.log("ENTERED WRONG IF.");
			throw err;
		}
		else{
			console.log("RESULT:"+records);
			res.code = "200";
			res.value = "Sucess About";
			console.log("ENTERED RIGHT IF.");
		console.log("User logged in");
		console.log("res in server=");
		//res.records=records;
		//console.dir(res);
		callback(null,res);
		}
	});
};


//	    	console.log("ENTERED findorcreate");
//	    	//winston.log('info','insert user',new Date(), 'user has clicked on register button to register.');
//	      registerModel.findOne({'email':username},function(err, user) {
//	
//	        if (err){
//	          console.log('Error in SignUp: '+err);
//	          return done(err);
//	        }
//	     
//	        if (user) {
//	          console.log('User already exists');
//	          var message="User already exists.";
//			  console.log(message);
//			  //res.render('signin', { title: 'Express', message:message});
//			  return done(null, false, 
//			             req.flash('message','User Already Exists'));
//	          //return done(null, false);
//	        } else {
//	        	console.log("ENTERED the right else");
//	        	var sign = new registerModel();
//	          sign.password = createHash(password);
//	          sign.email = req.param('email');
//	          sign.first = req.param('firstname');
//	          sign.last = req.param('lastname');
//	      	sign.phone_number=null;
//	    	sign.birthday=null;
//	    	sign.address=null;
//	    	sign.city=null;
//	    	sign.state=null;
//	    	sign.zip=null;
//	    	sign.last_login_time=null;
//	          sign.save(function(err) {
//	            if (err){
//	              console.log('Error in Saving user: '+err);  
//	              throw err;  
//	            }
//	            console.log('User Registration succesful'); 
//	            return done(null, sign);
//	          });
//	        }
//	});
//	    };
//	    process.nextTick(findOrCreateUser);
//	  }));
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
	exports.itemDisplay = function(msg,callback)
	{
		//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on item name which takes it to item display page.');
		console.log("Inside item display");
		var res={};
		var id,item_name,item_price,quantity,bid_flag,item_desc,email,item_id,current;
		id=msg.id;
		console.log("Item id:"+id);
		sell_itemModel.find({ _id:id }, function (err,records) {
			if(err){
				res.code = "401";
				res.value = "Failed Login";
				console.log("ENTERED WRONG IF.");
				throw err;
			}
			else{
				res.code = "200";
				res.value = "Sucess About";
				res.records=records;
				callback(null,res);
				//console.log("RESULT:"+records);
				 
			}
		});
};
	exports.add = function(msg,callback)
	{
		console.log('Inside add.');
		//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on sell button to add item.');
		var add = new sell_itemModel();
		add.email_id=msg.email_id;
		add.item_id=msg.item_id;
		add.item_name=msg.item_name;
		add.item_price=msg.item_price;
		add.item_description=msg.item_description;
		add.quantity=msg.quantity;
		add.bid_flag=msg.bid_flag;
		add.add_time=msg.add_time;
		add.expire_time=msg.expire_time;
		var res={};
		console.log('Apparently added.');
		add.save(function(err, ans) {
			if(err)
				{
				res.code = "401";
				res.value = "Failed Login";
				console.log("ENTERED WRONG IF.");
				throw err;
				}
			else
				{
				console.log(ans);
				res.code = "200";
				res.value = "Sucess About";
				callback(null,res);
				//res.redirect('/home');
				}
		});
		//var record= { email_id: email,item_name : item_name, item_price: price,item_description:item_desc,quantity:quantity,bid_flag:bid,add_time:datetime,expire_time:expire_date };
//		var query= "insert into sell_item (email_id,item_name,item_price,item_description,quantity,bid_flag,add_time,expire_time) VALUES ('"+email+"','"+item_name+"','"+price+"','"+item_desc+"','"+quantity+"','"+bid+"','"+datetime+"','"+expire_date+"');";
//
//		mysql1.add(function(err,res){
//			if(err){
//				throw err;
//			}
//			else{
//				console.log("Item Inserted.");
//			}
//		},query);
		  
};
	exports.about = function(msg, callback){
		//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on about button to see its profile.');
		console.log("Inside about");
		var email=msg.email;
		var res={};
		
		console.log(email);
		
		var first,last,em;
		var birthday=null;
		var address=null;
		var city=null;
		var zip=null;
		var state=null;
		var phone_number=null;
		
		registerModel.find({ email:msg.email }, function (err,records) {
			if(err){
				res.code = "401";
				res.value = "Failed Login";
				console.log("ENTERED WRONG IF.");
				throw err;
			}
			else{
				console.log("RESULT:"+records);
				res.code = "200";
				res.value = "Sucess About";
				console.log("ENTERED RIGHT IF.");
			console.log("User logged in");
			console.log("res in server=");
			res.records=records;
			console.dir(res);
			callback(null,res);
//				first = records[0].first;
//				 last= records[0].last;
//				 em=records[0].email;
//				 birthday=records[0].birthday;
//				 address=records[0].address;
//				 city=records[0].city;
//				 zip=records[0].zip;
//				 state=records[0].state;
//				 phone_number=records[0].phone_number;
				 //res.render('about', { title: 'Express', address:address, city:city, zip:zip,state:state, phone_number:phone_number, user: first, last:last,email:em,handle:req.session.handle,birthday:birthday, });
			}
		});		
	};
exports.updateAbout = function(msg, callback){
	console.log("Update ABout me aa gya");
		
//		winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on update button in about.');
	var res={};
	var email=msg.email;
	var birthday=msg.birthday;
	var phone=msg.phone;
	var address=msg.address;
	var city=msg.city;
	var state=msg.state;
	var zip=msg.zip;
	console.log("Values bhi dedi");
		registerModel.update({email:email},
    			{
    				$set: { birthday:birthday,
    					phone_number:phone,
    					address:address,
    					city:city,
    					state:state,
    					zip:zip
    				}
    			},function(err, newuser) {
    				if(err)
    				{
    				throw err;
    				}}
    		);
		registerModel.find({ email:email }, function (err,records) {
			if(err){
				res.code = "401";
				res.value = "Failed Login";
				console.log("ENTERED WRONG IF.");
				
				throw err;
			}
			else{
				res.code = "200";
				res.value = "Sucess About";
				console.log("ENTERED RIGHT IF.");
			console.log("User logged in");
			console.log("res in server=");
			res.records=records;
			console.dir(res);
			callback(null,res);
			//				 res.render('about', { title: 'Express', address:address, city:city, zip:zip,state:state, phone_number:phone_number, user: first, last:last,email:em,handle:req.session.handle,birthday:birthday, });
			}
		});		
		};
		exports.refresh = function(msg, callback){
			//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on refresh button in the cart.');
			console.log('Inside refresh');
			//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on refresh button in the cart.');
			var sub,quant;
			var res={};
		var q=msg.q;
		console.log("QUANTITY_server:"+q);
		var id=msg.id;
		cartModel.findOne({item_id:id}, function (err,result) {
			if(err){
			
				throw err;
			}
			else{
				//console.log(result);
				console.log("INSIDE ELSE");
				sub=result.subtotal;
			    quant=result.quantity;
			    sub=sub/quant;
			    sub=sub*q;
			    console.log("NEW QUANT:"+q);
			    console.log("NEW SUB:"+sub);
			    console.log("_id:"+result._id);
			    console.log("id:"+id);
			    cartModel.update({item_id:id},
		    			{
		    				$set: { quantity:q,
		    					subtotal:sub	
		    				}
		    			},function(err, newuser) {
		    				if(err)
		    				{
		    					res.code = "401";
		    					res.value = "Failed Login";
		    					console.log("ENTERED WRONG IF.");
		    				throw err;
		    				}
		    			else{
		    				res.code = "200";
		    				res.value = "Sucess About";
		    				console.log("ENTERED RIGHT IF.");
		    				//console.log("updated results:"+newuser);
		    				callback(null,res);
					    	}
		    			}
		    		);
		}
		});  
			};
//			var res={};
//			var sub,quant;
//		var q=msg.q;
//		
//		console.log("QUANTITY:"+q);
//		var id=msg.id;
//		//console.log(" BEFORE ID:"+id);
//		id=id.substring(1,id.length-1);
//		console.log("ID:"+id);
//		//console.log("refresh button pressed:" + req.session.se);
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
//		    					res.code = "401";
//		    					res.value = "Failed Login";
//		    				throw err;
//		    				}
//		    			else{
//		    				res.code = "200";
//		    				res.value="Success";
//		    				callback(null,res);
//		    				}});
//		    				
//		    			}
//		});
//		
//		
//		};

			
			exports.placeBid = function(msg, callback){
				console.log("Inside Place bid.");
				var first,last,em,phone_number;
				var res={};
				var b=new bidModel();
				b.bid_amount=msg.bid_amount;
				//winston.log('info',req.session.email+' is the user.',new Date(), 'user clicked on place bid button to place the bid:'+b.bid_amount);
				b.item_id=msg.item_id;
				var currentdate = new Date(); 
				b.user_id=msg.user_id;
				b.timestamp = msg.timestamp;
				b.save(function(err, ans) {
					if(err)
						{
						throw err;
						}
					else
						{
						console.log("Bid Inserted.");
						}
});			
				sell_itemModel.update({_id:b.item_id},
		    			{
		    				$set: { maximum_bid:b.bid_amount,
            					email_bid:b.user_id
		    					
		    				}
		    			},function(err, records) {
		    				if(err)
		    				{
		    					res.code = "401";
		    					res.value = "Failed Login";
		    					console.log("ENTERED WRONG IF.");
		    					
		    					throw err;
		    				}
		    			else{
		    				res.code = "200";
		    				res.value = "Sucess About";
		    				console.log("ENTERED RIGHT IF.");
		    			console.log("User logged in");
		    			console.log("res in server=");
		    			res.records=records;
		    			console.dir(res);
		    			callback(null,res);
		    				}
		    			
			});

};


	var createHash = function(password){
		 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
		};
