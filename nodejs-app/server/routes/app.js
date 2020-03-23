const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var request = require('request-promise');
//var BlynkLib = require('blynk-library');


router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/register', (req, res) => {
    res.render('register',{
        message: ''
    }); 
});
router.get('/login', (req, res) => {
    res.render('login',{
        message: ''
    }); 
});
router.post('/login', (req, res) => {
    User.findOne({email: req.body.email}).exec()
    .then(user=> {
        //console.log(user);
        bcrypt.compare(req.body.password,user.password, (err,result)=>{
            if(err){
                console.log(err);
            }
            if(result){   //If comparasion is successful
            const token = jwt.sign({
                    email: user.email,
                    userId: user._id
                },'test secret',{expiresIn:'1h'});

                res.redirect('/dashboard/'+user._id+'?token='+token); 
            }
        })
    })
    .catch(err=>{
        res.render('login',{
            message: err.message
        }); 
    })
});

router.post('/register', (req, res) => {
    User.find({email: req.body.email}).exec()
    .then(user=> {
        //console.log(user);
        if(user.length >=1){
            return res.render('register',{
                message: 'User Already Exists'
            });
        }
        else{
            let password= req.body.password;
            let confirm_password= req.body.confirm_password;
            if(password===confirm_password){
                bcrypt.hash(req.body.password,10, (err,hash)=>{   //Salt size is 10
                    if(err){
                        return res.render('register',{
                            message: err
                        }); 
                    }else{
                        const user= new User({
                            email: req.body.email,
                            password: hash
                        });
                        user.save().then(result =>{
                            console.log(result);
                            res.render('login',{
                                message: 'Login with same credentials'
                            }); 
                        })
                        .catch(err =>{
                            res.render('register',{
                                message: err.message
                            }); 
                            console.log(err);
                        })
                    }
                });
            }
        }
    })
    .catch(err=>{
        res.render('register',{
            message: err.message
        }); 
    })
});

router.get('/dashboard/:userId', isLoggedIn, (req, res) => {   //Protecting this route with IsLoggedIn Middleware
    const id= req.params.userId;

    User.findById(id).exec().then(user=>{
        //var blynk = new BlynkLib.Blynk('8eqj1npIRFGvZ6_PpsvZ4e26k9GR_U3m');

          let dist=[];
          var requestLoop = setInterval(function(){   //Our own listner function
            const urls = ["http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V0", 
            "http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V1","http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V2",
            "http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V3","http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V4"];
            const promises = urls.map(url => request({uri:url,json:true}));
            Promise.all(promises).then((data) => {
                console.log(data);

                let arr=[];
                let d= dist.length;
                if(parseInt(data[4][0])){
                    if(dist.length<5){
                        if(dist.length==0){
                            arr.push({value: parseInt(data[4][0]), when: new Date()}); //[{value:123,when:''},null,null,null,null]  
                        }  
                        else{
                            while(d>0){
                                arr.push({ value: dist[dist.length-d].value, when: dist[dist.length-d].when});
                                d--; 
                            }
                            arr.push({value: parseInt(data[4][0]), when: new Date()});       //[123,234]
                        }     
                        dist.push({value: parseInt(data[4][0]), when: new Date()});           
                        //dist.unshift(parseInt(data[4]));   //[234,null,null,null,null]  //[234,null,null,null,null]
                        for(let i=0;i<5-dist.length;i++){
                            arr.push({value: null, when:null});
                        }
                    }
                    else{
                        dist.pop();
                        dist = [{value: parseInt(data[4][0]), when: new Date()}].concat(dist);
                        arr=dist;
                    }
                }
                else{
                    for(let i=0;i<5;i++){
                        arr.push({value: null, when:null});
                    }
                }
                //console.log(arr);
                let up={
                    'widgets.toggle_red' : parseInt(data[0][0]),   //data[0]=['1']
                    'widgets.toggle_green': parseInt(data[1][0]), 
                    'widgets.slider': parseInt(data[2][0]),
                    'widgets.gauge' : parseInt(data[3][0]),
                    'widgets.line_chart.first.value': arr[0].value,
                    'widgets.line_chart.second.value': arr[1].value,
                    'widgets.line_chart.third.value': arr[2].value,
                    'widgets.line_chart.fourth.value': arr[3].value,
                    'widgets.line_chart.fifth.value': arr[4].value,
                    'widgets.line_chart.first.when': arr[0].when,
                    'widgets.line_chart.second.when': arr[1].when,
                    'widgets.line_chart.third.when': arr[2].when,
                    'widgets.line_chart.fourth.when': arr[3].when,
                    'widgets.line_chart.fifth.when': arr[4].when
                }
                for (const prop in up) {
                    if(up[prop]==null){
                        delete up[prop];
                    }
                }
                //console.log(up);
                User.updateOne({_id: id},{$set: up},function (err,doc) {
                    if (err)
                        console.log(err); // saved!
                });
            
                jwt.verify(req.query.token, 'test secret', function(err, decoded) {
                    if(err){
                        clearInterval(requestLoop);
                        res.status(401).render('login',{  //401 Unauthorized Accesss
                            message: 'Token expired or tampered'
                        });  
                    }
                });
            });

        }, 8000);

        // 
        // dweetio.listen_for("nodemcu123", function(dweet){
        //     // This will be called anytime there is a new dweet for nodemcu123
      res.render('dashboard',{
            token: req.query.token,
            uid: user._id,
            creationTime: user.registerAt,
            email: user.email
        }); 
    })
    .catch(function(err) {
        console.log(err);
    });
});

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {   //To verify an incoming token from client
    try{
        //console.log(req.headers);
        jwt.verify(req.query.token, 'test secret');  
        return next();
    }
    catch(err){
        return res.status(401).render('login',{  //401 Unauthorized Accesss
            message: 'Token expired or tampered'
        });  
    }
}


module.exports = router;