var mysql = require('mysql');
var user;
var mongoose = require('mongoose');
var user=require('./user');
//var dbconn =  mysql.createConnection({
//	host     : '127.0.0.1',
//    user     : 'root',
//    password : 'Canam@001',
//    database : 'ebay',
//    port	 : 3306
//  });
//dbconn.connect(function(err){
//	  if(err){
//	    console.log('Database connection error');
//	  }else{
//	    console.log('Database connection successful');
//	  }
//	});

var sell_itemModel= mongoose.model("sell_item", user.sell_item_schema);
var cartModel = mongoose.model("cart", user.cart_schema);


exports.first_job = {
    
    after: {                
        seconds: 60
        
    },
    job: function () {
    	var currentdate = new Date(); 
		var datetime = currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes();
		//var zero=0;
		datetime=datetime.toString();
		    console.log("Timestamp:"+datetime);
		    var email,item_name,item_price,item_description,quantity;
			sell_itemModel.find({ quantity: { $gt: 0 },expire_time:datetime }, function (err,records) {
				if(err){
					throw err;
				}
				else{
					var add=new cartModel();
					for(var i=0;i<records.length;i++)
					{
						add.email=records[i].email_id;
						add.item_name=records[i].item_name;
						add.item_price=records[i].maximum_bid;
						add.quantity=records[i].quantity;
						add.item_desc=records[i].item_description;
						add.subtotal=records[i].maximum_bid;
						add.id=records[i].item_id;	
					}
					
				}
			}); 
		    
//		    dbconn.query('SELECT * FROM sell_item where quantity!=? AND expire_time=?',[zero,datetime] ,function(err, records){		  
//				if(err)
//					{console.log(err);}
//					else
//					 {
//						for(var i=0;i<records.length;i++)
//							{
//						var record= {email:records[i].email_id,item_name:records[i].item_name,item_price:records[i].maximum_bid,quantity:records[i].quantity,item_desc:records[i].item_description,subtotal:records[i].maximum_bid,id:records[i].item_id};
//						  dbconn.query('INSERT INTO cart SET ?', record, function(err,rec){
//							  if(err) {
//								
//								  throw err;
//							  }
//							  console.log("cart inserted");
//							});
//					 
//					 } } });
        console.log("first_job");
    },
    spawn: true             
};