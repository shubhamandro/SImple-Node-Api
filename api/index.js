const express= require('express');
var mysql = require('mysql');
var queue = require('express-queue');
const app= express();
var bodyParser = require('body-parser');
var upload =  require('express-fileupload');
const csv = require('csv-parser')
const fs = require('fs');
const { stringify } = require('querystring');

app.use(queue({ activeLimit: 1, queuedLimit: -1 }));
app.use(upload());

var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "root",
    database: "new_data"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

app.get('/getData',(req,res)=>{
    con.query('SELECT * FROM users',(err,row)=>{
        var data=[];
        if(!err){
            row.forEach((row1)=>{
                var id= row1.id;
                var name= row1.name;
                let data1=[id,name];
                data.push(data1);
            })
            res.send(JSON.stringify(data));
        }
        else{
            console.log(err);
        }
        
    })
})
app.post('/saveData',(req,res)=>{
    if(req.files){
        var file= req.files.file;
        var filename=file.name;
        file.mv("./"+filename,function(err){
            if(err){
                console.log("error occured");
            }
            else{
                fs.createReadStream(filename)
                .pipe(csv())
                .on('data', function(data){
                    try {
                        var id= data['id'];
                        var name= data['name'];
                        var date= data['date'];
                        var steps= data['steps'];
                        var calories= data['calories'];
                        let table_name= name+id;
                        var values=[id, name];
                        var s= "INSERT INTO users SELECT ? FROM DUAL WHERE NOT EXISTS(SELECT * FROM users WHERE id= ?)"
                        con.query(s,[values,id],function(err){
                            if(err){
                                console.log(err);
                            }
                        })
                        var ss= "CREATE TABLE IF NOT EXISTS `"+table_name+"` (date bigint primary key, steps int, calories int)";
                        values= [date,steps,calories];
                        con.query(ss,[values],function(err,resu){
                            if(err) console.log(err);
                        })
                        ss= "INSERT INTO `"+table_name+"` SELECT ? FROM DUAL WHERE NOT EXISTS(SELECT * FROM `"+table_name+"` WHERE date=?)";
                        values=[date,steps,calories];
                        con.query(ss,[values,date],function(err,resu){
                            if(err){
                            console.log(err);
                            }
                        })
                    }
                    catch(err) {
                        console.log(err)
                    }
                })
                .on('end',function(){
                    fs.unlink(filename,(err)=>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("Data saved");
                        }
                    });
                    res.send("done");  
                });
            }
        })
    }
    
})
app.listen(3000,()=>console.log('Listing on port 3000'));