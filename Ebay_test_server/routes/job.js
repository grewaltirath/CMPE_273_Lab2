var mysql = require('mysql');
var user;
var mongoose = require('mongoose');
var user=require('./user');


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
		    

        console.log("first_job");
    },
    spawn: true             
};
