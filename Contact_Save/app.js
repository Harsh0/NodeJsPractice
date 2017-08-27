var mongourl = process.env.MONGO_URL||"mongodb://localhost:27017/databaseName";
var mongourl = "mongodb://Harsh:123@ds119788.mlab.com:19788/personal_details";
const http = require('http');
const fs = require('fs');
const mongo = require('mongodb');
const path = require('path');
const port = process.argv[2]||80;
var ObjectID = mongo.ObjectID;
var MongoClient = mongo.MongoClient;
var db;
let connectMongo = ()=>{
  MongoClient.connect(mongourl,(err,database)=>{
    if(err){
        // try connecting again
        console.log("Trying connecting again....");
        connectMongo();
    }else{
      db = database;
      console.log("mongodb connected!");
    }
  })
}
connectMongo();
http.createServer((req,res)=>{
  if(['/','/main.js'].indexOf(req.url)>-1){
    if(req.url=='/main.js'){
      res.writeHead(200,{'Content-Type':'text/javascript'});
      let rs = fs.createReadStream(path.join('firebase','public','main.js'));
      rs.pipe(res);
      return;
    }
    res.writeHead(200,{'Content-Type':'text/html'});
    let rs = fs.createReadStream(path.join('firebase','public','index.html'));
    rs.pipe(res);
    return;
  }else if(req.url=='/getData'){
    let c = db.collection('business');
    c.find({}).toArray((err,docs)=>{
      if(err){
        console.log(err);
        res.writeHead(500,{'Content-Type':'application/json'})
        res.end(JSON.stringify({message:"Internal Server Error"}));
      }else{
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(docs));
      }
    })
  }else if(req.url=='/pushData'){
    let c = db.collection('business');
    var data ="";
    req.on('data',(d)=>{
      data += d;
    })
    req.on('end',()=>{
      data = JSON.parse(data);
      //find update one
      var upData = [];
      for(var i in data){
        if(data[i]["unsync"]){
          upData.push(data.splice(i,1));
          delete upData[upData.length-1]["unsync"];
        }
      }
      if(data.length){
        c.insertMany(data,(err,docs)=>{
          if(err){
            console.log(err);
            res.writeHead(500,{'Content-Type':'application/json'})
            res.end(JSON.stringify({message:"Internal Server Error"}));
          }else{
            if(upData.length){
              res.writeHead(200,{'Content-Type':'application/json'});
              res.end(JSON.stringify(docs.ops));
            }else{
              res.writeHead(200,{'Content-Type':'application/json'});
              res.end(JSON.stringify(docs.ops));
            }
          }
        })
      }else if(upData.length){
        //
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify([]));
      }
    })
  }else if(req.url=='/deleteData'){
    let c = db.collection('business');
    var data ="";
    req.on('data',(d)=>{
      data += d;
    })
    req.on('end',()=>{
      data = JSON.parse(data);
      c.deleteOne({_id:ObjectID(data._id)},(err,docs)=>{
        if(err){
            console.log(err);
          res.writeHead(500,{'Content-Type':'application/json'})
          res.end(JSON.stringify({message:"Internal Server Error"}));
        }else{
          res.writeHead(200,{'Content-Type':'application/json'});
          res.end(JSON.stringify(docs.result));
        }
      })
    });
  }else{
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.end('Not Found');
    return;
  }
}).listen(port,()=>{
  console.log("Server started at port "+port);
});
process.on('SIGINT', () => {
  console.log("Trying to close mongodb connection");
  db.close(()=>{
    console.log('Successfully Closed mongodb connection');
    process.kill(0);
  })
});
// to deploy to firebase "firebase deploy -p public"
