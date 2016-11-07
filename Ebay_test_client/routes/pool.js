var mysql= require('mysql');

var connection=[];

for(var j=0;j<500;j++){
	connection.push(mysql.createConnection({
	host     : 'localhost',
    user     : 'root',
    password : 'Canam@001',
    database : 'ebay',
    port	 : 3306
  })
	);
}

exports.onGetConnection=function() { //pop the connection
	if(connection){
		return connection.pop();
	}	
	
};


exports.onReturnConnection=function(connect) { //return connection
	
	connection.push(connect);

};

                        
                      
 