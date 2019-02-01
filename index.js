var express = require("express");
var alexa = require("alexa-app");

var PORT = process.env.PORT || 3000;
//var app = express();
var express_app = express();
// Setup the alexa app and attach it to express before anything else.
var app = new alexa.app("alexa");

// POST calls to / in express will be handled by the app.request() function
app.express({
  expressApp: express_app,
  checkCert: true,
  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production.
  debug: true
});

express_app.set("view engine", "ejs");


//Database
var fs = require('fs');
var dbFile = 'data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (id INTEGER PRIMARY KEY, dream TEXT,parameters TEXT, time DATETIME DEFAULT CURRENT_TIMESTAMP)');
    console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (id,dream,time) VALUES ("1","No Command",strftime("%s","now"))');
    });
  }
  else {
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

//End Database

app.launch(function(request, response) {
  console.log("Quantum One Launched");
  response.say("Welcome to Quantum One! Quantum One with it's PC client, can control your computer!");
});


app.intent("nameIntent", {
    "slots": { "NAME": "LITERAL" },
    "utterances": [
      "my {name is|name's} {names|NAME}", "set my name to {names|NAME}"
    ]
  },
  function(request, response) {
    console.log("Success!" + request.request);
  db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "Hello Boi" WHERE id=1');
      });
    response.say("Hello Boi");
  }
    
);

app.intent("hello", {
    "slots": {},
    "utterances": [
      "hello world"
    ]
  },
  function(request, response) {
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "Hello World" WHERE id=1');
      });
    response.say("Hello World!");
  }
);


app.intent("shutdown", {
    "slots": {},
    "utterances": [
      "Shutdown my Computer"
    ]
  },
  function(request, response) {
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "shutdown",time=strftime("%s","now") WHERE id=1');
      });
    response.say("Shutdown Command Sent");
  }
);


app.intent("sleep", {
    "slots": {},
    "utterances": [
      "to put computer to sleep"
    ]
  },
  function(request, response) {
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "sleep", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Sleep Command Sent");
  }
);

app.intent("lock", {
    "slots": {},
    "utterances": [
      "lock the Computer",
      "lock my Computer"
    ]
  },
  function(request, response) {
    var currentDate = new Date().toISOString();;
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "lock", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Lock Command Sent");
  }
);

app.intent("doomsday", {
    "slots": {},
    "utterances": [
      "doomsday protocol"
    ]
  },
  function(request, response) {
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET dream="doomsday", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Doomsday protocol initiated");
  }
);

express_app.get('/', function(request, response) {
  import { google } from 'googleapis';
  const googleConfig = {
    clientId: '34123699345-ju08lhh5kqpl3eova99f28n1pslnntcl.apps.googleusercontent.com', // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
    clientSecret: 'K1bCh_5dLziJ3KGwfJAUTllE', // e.g. _ASDFA%DFASDFASDFASD#FAD-
    redirect: 'https://cxalexa.herokuapp.com' // this must match your google api settings
  };

  /**
   * Create the google auth object which gives us access to talk to google's apis.
   */
  function createConnection() {
    return new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirect
    );
  }
  
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});



express_app.listen(PORT, () => console.log("Listening on port " + PORT + "."));
