var mongourl = process.env.MONGO_URL||"mongodb://localhost:27017/databaseName";
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var MongoClient = mongo.MongoClient;
var connectMongo = function(cb){
  MongoClient.connect(mongourl,(err,database)=>{
    if(err){
        // try connecting again
        connectMongo(cb);
    }else{
      cb(database);
    }
  })
}
module.exports = function(context,callback){
  connectMongo(function(db){
    var c = db.collection('business');
    var data = [];
    for(var k in context.data){
      data.push(context.data[k]);
    }
    c.insertMany(data,(err,docs)=>{
      if(err){
        callback({message:"Internal Server Error"});
      }else{
        callback(null,docs.ops);
      }
    })
  });
}
