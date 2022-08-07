


//Requirements
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



//follow-ups
const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


//session setUp
app.use(session({
  secret: "Our little secret.",    //This must be moved to .env file
  resave: false,
  saveUninitialized: false
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());


//create database
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser : true});



//encryption key
//The encryption key has been moved to .env file

//Create Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
//adding passport-local-mongoose as a plugin to userSchema
userSchema.plugin(passportLocalMongoose);



//Creating users collections
const User = mongoose.model("User", userSchema);

//passport-local configurations
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//GET requests
////////////////////////to home page
app.get("/", function(req, res){
  res.render("home");
});

////////////////////////to login page
app.get("/login", function(req, res){
  res.render("login");
});

////////////////////////to register page
app.get("/register", function(req, res){
  res.render("register");
});

////////////////////////to secrets page
app.get("/secrets", function(req, res){
  //we have to check if the user is authenticated before allowing them to access the secrets page
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

////////////////////////logout
app.get("/logout", function(req, res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});




//POST requests
///////////////////////////To register
app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register"); //redirecting the user to the register page so they can try another password
    }else{
      passport.authenticate("local")(req, res, function(){
        //Callback trigered when the authentication was successful
        res.redirect("/secrets");
      }); //This sends a cookie to the browser telling it the user is authenticated
    }
  });
});

///////////////////////////////To login
app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
      //This sends a cookie to the browser telling it the user is authenticated
    }
  });
});















app.listen(3000, function(){
  console.log("Server running on port 3000");
});
