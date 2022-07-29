const usermodel = require("../models/user.model");
const express = require("express");
const jwt = require("jsonwebtoken");
const keys = require("../middlewares/keys");
const bcrypt = require("bcryptjs");
const validateLoginInput = require("../validation/login");
const app = express();

app.post("/login", async (req, res) => {
    //////// FORM VALIDATION
    const { errors, isValid } = validateLoginInput(req.body);
  
     //////// CHECK VALIDATION
     if (!isValid) {
       return res.status(400).json(errors);
     }
   
     const email = req.body.email;
     const password = req.body.password;
   
     ///////// FIND USER BY EMAIL
     usermodel.findOne({ email }).then(user => {
       /////// CHECK IF USER EXISTS
       if (!user) {
         return res.status(404).json({ infoError: "Email not found" });
       }
   
       /////// CHECK PASSWORD
       bcrypt.compare(password, user.password).then(isMatch => {
         if (isMatch) {
           // USER MATCHED
           // CREATE JWT PAYLOAD
           const payload = {
             id: user.id,
             username: user.username,
             lastname: user.lastname,
             email: user.email,
             phonenumber: user.phonenumber,
             userprofile: user.userprofile,
             account: user.account
           };
   
           // SIGN TOKEN
           jwt.sign(
             payload,
             keys.secretOrKey,
             {
               expiresIn: 3600 // 1 hour in seconds
             },
             (err, token) => {
               res.json({
                 success: true,
                 token: "Token " + token,
                 id: user.id,
                 username: user.username,
                 lastname: user.lastname,
                 email: user.email,
                 phonenumber: user.phonenumber,
                 userprofile: user.userprofile,
                 account: user.account
               });
             }
           );
         } else {
           return res
             .status(400)
             .json({ infoError: "Password incorrect" });
         }
       });
     });
  });