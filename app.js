


//Requirements
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;


//follow-ups
const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser : true});

//encryption key
//The encryption key has been moved to .env file

//Create Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


//Creating users collections
const User = mongoose.model("User", userSchema);



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



//POST requests
///////////////////////////To register
app.post("/register", function(req, res){
  //creating the new user and encrypting his password HASH bcrypt
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
    //saving the user in the database userDB
    newUser.save(function(err){
      if(err){
        res.send(err)
      }else{
        res.render("secrets");
      }
    });
  });
});

///////////////////////////////To login
app.post("/login", function(req, res){
  //check is there's a user in our database matching what's been requested
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
      if(err){
        console.log(err);
      }else{
        if(foundUser){
          bcrypt.compare(password, foundUser.password, function(err, result){
            //foundUser.password stores the hashed password of the foundUser!
            if(result === true){  //if the password is correct
              res.render("secrets");
            }else{
              console.log("Wrong password!");
            }
          })
        }else{
          console.log("User not found");
        }
      }
    }
  );
});















app.listen(3000, function(){
  console.log("Server running on port 3000");
});
