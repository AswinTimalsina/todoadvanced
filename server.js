var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

var parser = require('body-parser');

var mongoose = require('mongoose');

app.use(parser.urlencoded({extended: true}));

app.use(express.static("public"));

var url = process.env.MONGODB_URI || "mongodb://localhost/toDoList";

// var mongoClient = mongo.MongoClient;

// var url = 'mongodb://<dbuser>:<dbpassword>@ds013222.mlab.com:13222/heroku_pxhmf7d0';

mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true});

app.set("view-engine", "ejs");

var schem = new mongoose.Schema({
    name:String
});

//names model
var mod = mongoose.model("name", schem);

//dones model
var done = mongoose.model("done", schem);

//failed model
var failed1 = mongoose.model("fail", schem);



app.get('/', function(req, res){
    mod.find({}, function(err, val){
        if(err){console.log(err)}
        else{res.render("index.ejs", {a:val})}   //couldn't understand a:val
    })
});

app.post('/submit', function(req, res){
    var user = new mod({
        name: req.body.todo
    });

    mod.find({'name': req.body.todo}, function(err, value){
        if(value!=''){console.log('Already exists!')}
        else if(err){console.log(err)}
        else if(req.body.todo =='' || req.body.todo == ' '){console.log('empty')}
        else{
            mod.create(user, function(err, val){
                if(err){console.log(err)}
                else{
                    console.log('New item: '+ val.name);
                }
            })
        }
    })
    res.redirect('/');
    
})

app.post('/failed', (req, res)=>{
    var request = req.body.failed;
    var query = {name:request};
    var fail = new failed1({
        name: request
    })
    failed1.create(fail, (err, val)=>{
        if(err){console.log(err)}
        else{
            mod.deleteOne(query, (err, val1)=>{
                if(err){console.log(err)}
                    else{
                        console.log("New item added in fails and item removed from todos"+val1.name);
                    }   
                    })
        }
    })
    res.redirect('/');
})

app.post('/edit', (req, res)=>{
    var old = req.body.oldOne;
    var new1 = req.body.edited;

    mod.update({name: old}, {$set:{name: new1}}, function(err, val){
        if(err){console.log(err)}
        else{
            console.log("old one: " +old+ " new one: "+new1);
        }}
    );
    
    res.redirect('/');

})

app.post('/done', function(req, res){
    var request= req.body.done;
    var query = {name: request
    }

    var done1 = new done({
        name: request
    })

    done.create(done1, (err, val) => {
        if(err){console.log(err)}
        else{
            mod.deleteOne(query, (err, obj)=>{
                if(err){console.log(err)}
                else{console.log("New Item added in dones and Document removed from main:"+obj.name)}
            })
        }
    })
    console.log(req.body.done);
    res.redirect('/');
})

app.get('/disDones', (req, res)=>{
    done.find({},{name:1, _id:0}, (err, val)=>{
        if(err){console.log(err)}
        else{
            res.send(val);
        }
    })
}
    )

    app.get('/disFails', (req, res)=>{
        failed1.find({},{name:1, _id:0},(err, val)=>{
            if(err){console.log(err)}
            else{
                res.send(val);
            }
        })
    }
        )

app.listen(port, function(){
    console.log("Listening at port 8080");
});