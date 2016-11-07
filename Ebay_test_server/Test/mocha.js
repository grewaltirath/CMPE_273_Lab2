var request = require('request');
var express = require('express');
var assert = require("assert");
var http = require("http");

describe('http tests', function(){

	it('Rendering the login page', function(done){
		http.get('http://localhost:3000', function(res) {
			assert.equal(200, res.statusCode);
			done();
		})
	});
	
	it('Rendering the home page of ebay', function(done) {
		request.post(
			    'http://localhost:3000/afterLogin',
			    { form: { operation: "afterLogin", email:"kajal@gmail.com", password:"Kajal@123" } },
			    function (error, response, body) {
			    	assert.equal(200, response.statusCode);
			    	done();
			    }
			);
	  });
	
	it('Registering the user to ebay', function(done) {
		request.post(
			    'http://localhost:3000/insertuser',
			    { form: { operation: "insertuser", email:"ritika@gmail.com", password:"Ritika@123", firstname: "Ritika", lastname: "Chadha" } },
			    function (error, response, body) {
			    	assert.equal(302, response.statusCode);
			    	done();
			    }
			);
	  });
	
	it('Adding the item to be sold', function(done) {
		request.post(
			    'http://localhost:3000/item',
			    { form: { operation: "add", itemName:"T-Shirts", itemDesc:"Brand:Zara, Color:White", price: "20", quantity: "8", bid:"Fixed" } },
			    function (error, response, body) {
			    	assert.equal(302, response.statusCode);
			    	done();
			    }
			);
	  });
	
	it('Logging out the user.', function(done){
		http.get('http://localhost:3000/logout', function(res) {
			assert.equal(302, res.statusCode);
			done();
		})
	});
});