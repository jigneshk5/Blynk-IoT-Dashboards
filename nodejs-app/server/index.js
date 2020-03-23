const express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var configDB = require('./config/config.js');

// configuration ===============================================================
// connect to our database 
mongoose.connect(configDB.url,{useNewUrlParser: true,  useUnifiedTopology: true});

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

//Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Set static public data
app.use(express.static(path.join(__dirname, 'public')));


app.use('/',require('./routes/app'));


// Default response for any other request
app.use(function(req, res){
  res.status(404).render('404');
});

const port = process.env.PORT || 2000;

app.listen(port,function(){
  console.log(`server started at port ${port}`);
});
