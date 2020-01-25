var express = require("express");
var app = express();
var fs = require("fs");

var bodyParser = require("body-parser");

//use bodyParser() to let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/mydb";
var dbo;
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  dbo = db.db("qshopsdb");
  dbo.createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Users collection created!");
  });
  dbo.createCollection("shops", function(err, res) {
    if (err) throw err;
    console.log("Shops collection created!");
  });
});

app.all("/*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.post("/create/user", function(req, res) {
  console.log("request is ", req.body);
  dbo.collection("users").insertOne(req.body, function(err, resp) {
    if (err) {
      throw err;
    }
    console.log("1 user inserted");
    res.send({ create: true });
  });
});

app.post("/create/shop", function(req, res) {
  if (
    req.body.subUsers.length === 0 ||
    !req.body.adminEmail ||
    req.body.address.length === 0
  ) {
    res.send({
      createShop: false,
      reason:
        "make sure you are logged-in, subusers and addresses are filled properly"
    });
  } else {
    dbo.collection("shops").insertOne(req.body, function(err, resp) {
      if (err) {
        throw err;
      }
      console.log("1 shop inserted");
      res.send({ createShop: true });
    });
  }
});

app.post("/signin", function(req, res) {
  var query = ({ email, password } = req.body);
  const responseData = {
    login: false,
    admin: false
  };
  dbo
    .collection("users")
    .find(query)
    .toArray(function(err, result) {
      if (err) throw err;
      if (result.length > 0) {
        responseData.login = true;
        responseData.admin = result[0].admin;
      }
      res.send(responseData);
      console.log(result);
    });
});

app.get("/get/shops", function(req, res) {
  // var query = ({ adminEmail } = req.params);
  var query = ({ adminEmail } = req.query);
  dbo
    .collection("shops")
    .find(query)
    .toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      console.log(result);
    });
});

app.listen(8081, function() {
  var host = "localhost";
  var port = "8081";
  console.log("Example app listening at http://%s:%s", host, port);
});
