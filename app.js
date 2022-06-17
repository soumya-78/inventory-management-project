require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require("passport-local-mongoose")



//express stuff
const app = express();
app.use(express.static("public"));

//ejs part
app.set('view engine', 'ejs');

//body parser stuff
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'this is my secret.',
    resave: false,
    saveUninitialized: true,

}))
app.use(passport.initialize());
app.use(passport.session());


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/userDB');
}
const userSchema = new mongoose.Schema({
    email: String,
    phone: Number,
    password: String
});


userSchema.plugin(passportLocalMongoose);
// console.log(process.env.SECRET)
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


const User = mongoose.model('User', userSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/list", (req, res) => {
    User.find({}, function (err, post) {
        if (err) { console.log(err); }
        else {
            if (req.isAuthenticated()) {
                res.render("list", { email: post.username, number: post.phone })
            }
        }
    })
    // else {
    //     res.redirect("/login")
    // }
})
// app.get('/logout', function (req, res) {
//     req.logout(function (err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//     });
// });
// app.post('/logout', function (req, res, next) {
//     req.logout(function (err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//     });
// });

app.post("/register", (req, res) => {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/list");
                // res.render("list", { email: req.body.username, number: req.body.phone, password: req.body.password })
            })
        }
    })
})
app.post("/login", (req, res) => {
    const user = new User({
        email: req.body.username,
        // phone: req.body.phone,
        password: req.body.password
    })
    req.login(user, function (err) {
        if (err) { console.log(err); }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/list");
            })
        }
    });
})

// app.post("/register", (req, res) => {
//     bcrypt.hash(req.body.password, saltRounds, function (err, hash) {

//         const newUser = new User({
//             email: req.body.username,
//             password: hash
//         });
//         newUser.save(function (err) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 res.render("list");
//             }
//         });
//     });
// })
// app.post("/login", (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;
//     User.findOne({ email: username }, function (err, findUser) {
//         if (!err) {
//             if (findUser) {
//                 bcrypt.compare(password, findUser.password, function (err, result) {
//                     if (result == true) {
//                         res.render("list");
//                     }
//                 });

//             }
//         }
//     })

// })

app.listen(3000, function () {
    console.log("Server started on port 3000");
});