// get all the stuff we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user-model
var User = require('../app/models/user.js');

// expose this function to the app using module.export
module.exports = function(passport){
    
    /********* passport session setup **************/
    // required for persistent login sessions
    // passport needs abitlity to serialize/deserialize userdata out of session
    // serialize user for session
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err,user );
        });
    });
    
    /*********** local signup ***************/
    passport.use('local-signup', new LocalStrategy({

        // by default local-strategy uses username and password, we will override it with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // pass back entire request to callback
    }, function(req, username, password, done){
          // asynchronous
          
          process.nextTick(function(){
              // find a user whose name is the same as the forms name
              username = username.toLowerCase();
              
              // check if user already exists
              User.findOne({'username' : username}, function(err, user){
                  if(err){ // if there are any errors return them
                      return done(err);
                  }
                  // check if there's already a user with this name
                  if(user){
                      return done(null, false, req.flash('signupMessage', 'The user with this username has already signed up.'));
                  }else{
                      // if there is no user with that name
                      // create the user
                      var newUser = new User();
                      // set the users local credentials
                      newUser.username = username;
                      newUser.password = newUser.generateHash(password);
                      // save the user
                      newUser.save(function(err){
                         if(err){
                             console.log(err); return;
                             //throw err;
                          }else {
                              return done(null, newUser);
                          }                       
                      });                    
                  }                
              });
          });
        }
  
    )); 
    
    // passport-local-login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
        
    }, function(req, username, password, done){
      
        // check if user exists
        username = username.toLowerCase();

        User.findOne({'username': username}, function(err, user){
           // if there are any errors show before anything else
           if(err){
               return done(err);
           }
           // if no user is found, write message
           if(!user){
               return done(null, false, req.flash('loginMessage', 'No user with username '+username+ ' found.'));
           }
           
           // if the user is found but the password doesn't match
           if(!user.validPassword(password)){
               return done(null, false, req.flash('loginMessage', 'Ooops! There\'s a mismatch!'));
           }
           
           // if everything's fine, wuhu!
           return done(null, user);
           
        });
    }));
    
};  

