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
  
  await launch();
  
  console.log("Quantum One Launched");
  response.say("Welcome to Quantum One! Quantum One with it's PC client, can control your computer!");
});

async function launch(){
  
  let token = this.event.session.user.accessToken;
        let options = {
            method: 'GET',
            uri: 'https://quantumone.eu.auth0.com/userinfo', // You can find your URL on Client --> Settings --> 
            // Advanced Settings --> Endpoints --> OAuth User Info URL
            headers: {
                authorization: 'Bearer ' + token,
            }
        };

       await rp(options).then((body) => {
            let data = JSON.parse(body);
            /*
            To see how the user data was stored,
            go to Auth -> Users -> Click on the user you authenticated earlier -> Raw JSON
            */
            this.tell(data.name + ', ' + data.email); // Output: Kaan Kilic, email@jovo.tech
        });
}


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
   
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});



express_app.listen(PORT, () => console.log("Listening on port " + PORT + "."));
