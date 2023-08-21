function guest (req,res,next) {        // in middleware function it always recieves req,res,next
    if(!req.isAuthenticated()){
        return next()
    }
    return res.redirect('/')
}

module.exports = guest


// middle ware is used to check if a user is already logged in and try to get into login page again ,
//middleware ensures he wont be able to

// middleware function is ussed in GET route in web.js 
// from there GET route calls guest middleware and if user is not logged in then function flow continues to call authController 
// from where user is authenticated