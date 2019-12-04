var http = require('https')

const MongoClient = require('mongodb').MongoClient;

// replace the uri string with your connection string.
const uri = "mongodb+srv://Admin:admin153759@maincluster-t1sny.mongodb.net/test?retryWrites=true&w=majority"
MongoClient.connect(uri, function(err, client) {
    var db = client.db("GameData")
    var playerDataColl = db.collection("PlayerData")
    
    playerDataColl.find().toArray((e, res)=>
    {
        console.log(res)
    })

    if(err) {
         console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }
    console.log('Connected...');
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});