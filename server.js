const express = require("express")
const session = require("express-session")
const bodyparser = require("body-parser")
const hbs = require("hbs")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")
const url = require("url")

const app = express()
app.use(express.static('public'))
app.use(session({
    resave: true,
    name:"webapdesecret",
    saveUninitialized: true,
    secret : "secretpass",
    cookie:{
        maxAge: 5*60*1000
    }
}))

const User = require(__dirname + "/Model/user.js").userModel
const score = require(__dirname + "/Model/score.js").scoreModel
const words = require(__dirname + "/Model/words.js").wordsModel

function loadLeaderboard(){
    
}

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/mpDB", {
    useNewUrlParser:true,
    useFindAndModify: false
})

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', function() {
  console.log("Connected Successfully")
});

const urlencoder = bodyparser.urlencoded({
    extended : false
})


app.get("/", (req, res)=>{ 
    /*
    User.find(function (err, kittens) {
      if (err) return console.error(err);
      console.log(kittens);
    })
    */
    
    if(req.session.un){
        res.render("/views/MainPage_User.hbs",{
            us : req.session.un
        });
    }
    else{
        res.sendFile(__dirname + "/public/FirstPage.html")
    }
})

app.post("/gotoStart", urlencoder, (req,res)=>{
    score.find({}).exec(function(err,scores){
        res.render(__dirname + "/views/MainPage.hbs")
    })
})

app.post("/startGameUser",urlencoder, (req,res)=>{
    const txt = req.body.selected
    req.session.difficulty = txt
    
    words.find({difficulty: req.session.difficulty}).exec(function(err,words){
        res.render(__dirname + "/views/game.hbs",{
            data :words,
            txt
        })
    })
})

app.post("/startGame",urlencoder, (req,res)=>{
    const txt = req.body.selected
    req.session.difficulty = txt
    if(txt == null){
        score.find({}).exec(function(err,scores){
        res.render(__dirname + "/views/MainPage.hbs",{
                data :scores
            })
        })
    }
    else{
        words.find({difficulty: req.session.difficulty}).exec(function(err,words){
        res.render(__dirname + "/views/game.hbs",{
                data :words,
                txt
            })
        })
    }
})

app.post("/login", urlencoder, (req,res)=>{
    var us = req.body.un
    var pw = req.body.pw
    var adminCheck  = 0
    
    if(us == "admin"){
         User.find({u_username:us, u_password:pw}).exec(function(err, user) {  
        console.log(user);
        if(err){
            throw err;
        }
         
        if(user){
            if(!user.length){
                console.log("User not Match")
                score.find({}).exec(function(err,scores){
                res.render(__dirname + "/views/MainPage.hbs",{
                    data :scores
                    })
                })
            }
            else{
                console.log("User Match")
                    req.session.un = us
                    console.log("Session User: " + req.session.un)
                    User.find({}).exec(function(err,user){
                        res.render(__dirname + "/views/Admin.hbs",{
                            us,
                            data: user
                        })
                    }) 
                }   
            }
        });
    }
    else{
        User.find({u_username:us, u_password:pw}).exec(function(err, user) {  
        console.log(user);
        if(err){
            throw err;
        }
         
        if(user){
            if(!user.length){
                console.log("User not Match")
                score.find({}).exec(function(err,scores){
                res.render(__dirname + "/views/MainPage.hbs",{
                    data :scores
                    })
                })
            }
            else{
                console.log("User Match")
                    req.session.un = us
                    console.log("Session User: " + req.session.un)
                    score.find({}).exec(function(err,scores){
                        res.render(__dirname + "/views/MainPage_User.hbs",{
                            us,
                            data :scores
                        })
                    }) 
                }   
            }
        });   
    }
})

app.post("/signup", urlencoder, (req,res)=>{
    let NewUser = new User({
        u_username : req.body.un,
        u_password : req.body.pw
    })
    
    User.find({u_username: NewUser.u_username}).exec(function(err,user){
        console.log(user)
        if(user){
            if(!user.length){
                NewUser.save().then((doc)=>{
                    console.log(doc)
                    score.find({}).exec(function(err,scores){
                    res.render(__dirname + "/views/MainPage.hbs",{
                        data :scores
                        })
                    })
                }, (err)=>{ 
                    res.send(err)
                }) 
            }
            else if(user.length){
                console.log("Username Taken")
                score.find({}).exec(function(err,scores){
                res.render(__dirname + "/views/MainPage.hbs",{
                    data :scores
                    })
                })
            }
        }
    })
})

app.post("/logout", urlencoder, (req,res)=>{
    req.session.un = null
    score.find({}).exec(function(err,scores){
        res.render(__dirname + "/views/MainPage.hbs",{
        data :scores
        })
    })
})

app.post("/deleteUser", urlencoder, (req,res)=>{
    var user = req.body.username_Del
    var password = req.body.password_Del
    
    User.deleteOne({u_username: user, u_password: password }, (err, doc)=>{
        if(err){
            console.log("Not working")
        }else{
            console.log(doc)
            User.find({}).exec(function(err,user){
                res.render(__dirname + "/views/Admin.hbs",{
                    us:"admin",
                    data: user
                })
            })
        }
    })
})

app.post("/savescore", urlencoder, (req,res)=>{
    if(req.session.un){
        console.log(req.session.un)
        var str= req.body.timeFinished
        
        let NewScore = new score({
            playerusername : req.session.un,
            difficulty :req.session.difficulty,
            score : str
        })
        
        console.log("Finished Time: " + str)
        
        NewScore.save().then((doc)=>{
            console.log(doc)
            score.find({}).exec(function(err,scores){
            res.render(__dirname + "/views/MainPage_User.hbs",{
                    us: req.session.un,
                    data: scores            
                })
            }), (err)=>{ 
                res.send(err)
            } 
        })
    }
    else if(req.session.un == null){
         score.find({}).exec(function(err,scores){
              res.render(__dirname + "/views/MainPage.hbs",{
                   data: scores
                   })
         })
    }
    req.session.difficulty = null
})


app.listen(3000, ()=>{
    console.log("live at port 3000")
   
})

