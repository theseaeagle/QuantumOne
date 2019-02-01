var express = require("express");
var alexa = require("alexa-app");
var rp = require('request-promise');
var unirest = require('unirest');
var USER_INFO_URL = 'https://quantumone.eu.auth0.com/userinfo/';
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
    // Return new promise 
    return new Promise(function(resolve, reject) {
        var launchPromise = getUser2(request);
        launchPromise.then(function(result) {
            console.log("Done");
            response.say("Hello " + result);
            response.send();
            resolve(result);
        }, function(err) {
            console.log(err);
        });
    });
});



function getUser2(request){
     return new Promise(function(resolve, reject) {
     // Do async job
      var accessToken = request.sessionDetails.user.accessToken;
      console.log("access token: " + accessToken );
      unirest.get(USER_INFO_URL)
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json','authorization': 'Bearer ' + accessToken})
      .send()
      .end(function (result) {
        console.log(result.body.nickname);
        resolve(result.body.nickname);
      });
    });
}


function gettheUser(request){
  var accessToken = request.sessionDetails.user.accessToken;
  //let accessToken = session.accessToken;
  //console.log(JSON.stringify(request));
  console.log("access token: " + accessToken );
  unirest.get('https://quantumone.eu.auth0.com/userinfo/')
  .headers({'Accept': 'application/json', 'Content-Type': 'application/json','authorization': 'Bearer ' + accessToken})
  .send()
  .end(function (result) {
    console.log(result.body);
    //resolve(response.body.nickname);
    return result.body.nickname;
  });
}


async function launch(request,response){
  //response.say('Function Launched');
  var accessToken = request.sessionDetails.user.accessToken;
  var options = {
      method: 'GET',
      url: 'https://quantumone.eu.auth0.com/userinfo/', // You can find your URL on Client --> Settings --> 
      // Advanced Settings --> Endpoints --> OAuth User Info URL
      headers:{
          authorization: 'Bearer ' + accessToken,
      },
      json: true // Automatically parses the JSON string in the response
  };
  
  // Return new promise 
    return new Promise(function(resolve, reject) {
     // Do async job
    
       rp(options)
        .then(function (user) {
            console.log('User is: %d ', user.email);
            //response.say(user.name + ', ' + user.email); // Output: Kaan Kilic, email@jovo.tech
            resolve(user.email);
            
        })
        .catch(function (err) {
            // API call failed...
            console.log('Request Failed');
            //response.say('Uh Oh! Something went wrong');
            reject(err);
        });
        
    })
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

app.intent("runcommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "run {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "runcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Run Command is, "+ parameter);
  }
);


app.intent("opencommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "open {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "opencommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Open Command is, "+ parameter);
  }
);


app.intent("closecommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "close {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "closecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Close Command is, "+ parameter);
  }
);



app.intent("findcommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "find {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "findcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Find Command is, "+ parameter);
  }
);


app.intent("deletecommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "delete {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "deletecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Delete Command is, "+ parameter);
  }
);


app.intent("setcommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "set {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "setcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Set Command is, "+ parameter);
  }
);


app.intent("launchcommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "launch {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "launchcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Launch Command is, "+ parameter);
  }
);


app.intent("sendcommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "send {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "sendcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Send Command is, "+ parameter);
  }
);


app.intent("startcommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "start {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "startcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Start Command is, "+ parameter);
  }
);


app.intent("stopcommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "stop {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "stoptcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Stop Command is, "+ parameter);
  }
);


app.intent("gocommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "go {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "gocommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Go Command is, "+ parameter);
  }
);


app.intent("mutecommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "go {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "mutecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Mute Command is, "+ parameter);
  }
);


app.intent("volumecommand", {
    "slots": { "parameter": "LITERAL"},
    "utterances": [
      "set volume to {parameter}",
      "set the volume to {parameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("parameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "volumecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Volume Command is, "+ parameter);
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
  function(request, alexaresponse) {
    var currentDate = new Date().toISOString();;
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "lock", time=strftime("%s","now") WHERE id=1');
      });
  
     // response.say("Lock Command Sent");
      var accessToken = request.sessionDetails.user.accessToken;
      console.log("access token: " + accessToken );
      return unirest.get('https://quantumone.eu.auth0.com/userinfo/')
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json','authorization': 'Bearer ' + accessToken})
      .send()
      .end(function (response) {
        console.log(response.body);
        //resolve(response.body.nickname);
        alexaresponse.send("Welcome to Quantum One! " + response.body.nickname +" Quantum One with it's PC client, can control your computer!");
        //return response.body.nickname;
      });
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
