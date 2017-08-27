const MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:27017/hello",(err,db)=>{
  console.log("connected successfully");
  db.collection('mycol').insertOne({a:1})
  .then((res)=>{
    console.log(res.ops);
  })
  .catch((err)=>{
    console.log(err);
  })
});
