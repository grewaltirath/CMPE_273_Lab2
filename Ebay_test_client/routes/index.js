
/*
 * GET home page.
 */


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*module.exports = function(passport){

	 
	  /* Handle Login POST */
//	  router.post('/login', passport.authenticate('login', {
//	    successRedirect: '/home',
//	    failureRedirect: '/',
//	    failureFlash : true 
//	  }));
	
	 
	  /* Handle Registration POST */
//	  router.post('/signup', passport.authenticate('signup', {
//	    successRedirect: '/',
//	    failureRedirect: '/insertUser',
//	    failureFlash : true 
//	  }));
//	 
	//  return router;
	//}; */