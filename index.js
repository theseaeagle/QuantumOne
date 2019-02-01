var express = require("express");
var alexa = require("alexa-app");
var rp = require('request-promise');
var unirest = require('unirest');
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
  
 //var result = await launch(request,response);
//  await gettheUser(request).then((nickname) => {
//     console.log("Quantum One Launched");
//   response.say("Welcome to Quantum One! " + nickname +" Quantum One with it's PC client, can control your computer!");
    
//   });
  var exit = false;
  
  (async() => {
  const [ nickname ] = await Promise.all([
    gettheUser(request)
  ]);
   response.say("Welcome to Quantum One! " + nickname +" Quantum One with it's PC client, can control your computer!");
    exit = true;
  })();
  
  do{}while(!exit);
  
});


async function gettheUser(request){
  var accessToken = request.sessionDetails.user.accessToken;
  //let accessToken = session.accessToken;
  //console.log(JSON.stringify(request));
  console.log("access token: " + accessToken );
  unirest.get('https://quantumone.eu.auth0.com/userinfo/')
  .headers({'Accept': 'application/json', 'Content-Type': 'application/json','authorization': 'Bearer ' + accessToken})
  .send()
  .end(function (response) {
    console.log(response.body);
    return response.body.nickname;
  });
}


function launch(request,response){
  //response.say('Function Launched');
  var session = request.getSession();
  let accessToken = session.accessToken;
  let options = {
      method: 'GET',
      url: 'https://quantumone.eu.auth0.com/userinfo/', // You can find your URL on Client --> Settings --> 
      // Advanced Settings --> Endpoints --> OAuth User Info URL
      headers:{
          authorization: 'Bearer ' + accessToken,
      },
      json: true // Automatically parses the JSON string in the response
  };
  
   rp(options)
        .then(function (user) {
         console.log('User is: %d ', user.email);
         response.say(user.name + ', ' + user.email); // Output: Kaan Kilic, email@jovo.tech
    })
        .catch(function (err) {
        // API call failed...
        console.log('Request Failed');
        response.say('Uh Oh! Something went wrong');
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
