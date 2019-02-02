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
    db.run('CREATE TABLE Dreams (id INTEGER PRIMARY KEY, dream TEXT,parameters TEXT,parameter2 TEXT,user TEXT, time DATETIME DEFAULT CURRENT_TIMESTAMP)');
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
            response.say("Hello " + result.nickname + ", welcome to Quantum!");
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
        resolve(result.body);
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
    "slots": { "runparameter": "LITERAL"},
    "utterances": [
      "run {runparameter}",
      "run the {runparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("runparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "runcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Run Command is, "+ parameter);
  }
);


app.intent("opencommand", {
    "slots": { "openparameter": "LITERAL"},
    "utterances": [
      "open {openparameter}",
      "open the {openparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("openparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "opencommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Open Command is, "+ parameter);
  }
);


app.intent("closecommand", {
    "slots": { "closeparameter": "LITERAL"},
    "utterances": [
      "close {closeparameter}",
      "close the {closeparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("closeparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "closecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Close Command is, "+ parameter);
  }
);



app.intent("findcommand", {
    "slots": { "findparameter": "LITERAL"},
    "utterances": [
      "find {findparameter}",
      "find the {findparameter}",
      "search {findparameter}",
      "search the {findparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("findparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "findcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Find Command is, "+ parameter);
  }
);


app.intent("deletecommand", {
    "slots": { "deleteparameter": "LITERAL"},
    "utterances": [
      "delete {deleteparameter}",
      "delete the {deleteparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("deleteparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "deletecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Delete Command is, "+ parameter);
  }
);


app.intent("setcommand", {
    "slots": { "setparameter": "LITERAL", "setparametertwo": "LITERAL"},
    "utterances": [
      "set {setparameter} to {setparametertwo}",
      "set the {setparameter} to {setparametertwo}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("setparameter");
    var parametertwo = request.slot("setparametertwo");
  
    // Return new promise 
    return new Promise(function(resolve, reject) {
        var launchPromise = getUser2(request);
        launchPromise.then(function(result) {
            console.log("Updating Database!");
            updateDB("setcommand",parameter,parametertwo,result.email);
            
            response.say("Set Command is, "+ parameter);
            console.log("Done");
            response.say("Hello " + result.email);
            response.send();
            resolve(result);
        }, function(err) {
            console.log(err);
        });
    });
});

function updateDB(command,parameter,parametertwo,email){
    db.serialize(function() {
        var updatesql = 'UPDATE Dreams SET  dream="' + command + '", parameters="'+ parameter +'",parameter2="' + parametertwo + '",user="' + email + '", time=strftime("%s","now") WHERE user="' + email + '"';
        db.run(updatesql,function(err) { 
          if (err || this.changes==0) {
            //console.error(err.message);
            var insertsql = 'INSERT INTO Dreams(dream,parameters,parameter2,user,time)  VALUES("' + command + '", "' + parameter + '","' + parametertwo + '","' + email + '", strftime("%s","now"))';
            db.run(insertsql);
          }
            console.log('Row(s) updated: ${this.changes}');
            return;
        });
   });
}


app.intent("launchcommand", {
    "slots": { "launchparameter": "LITERAL"},
    "utterances": [
      "launch {launchparameter}",
      "launch the {launchparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("launchparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "launchcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Launch Command is, "+ parameter);
  }
);


app.intent("sendcommand", {
    "slots": { "sendparameter": "LITERAL"},
    "utterances": [
      "send {sendparameter}",
      "send the {sendparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("sendparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "sendcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Send Command is, "+ parameter);
  }
);


app.intent("startcommand", {
    "slots": { "startparameter": "LITERAL"},
    "utterances": [
      "start {startparameter}",
      "start the {startparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("startparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "startcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Start Command is, "+ parameter);
  }
);


app.intent("stopcommand", {
    "slots": { "stopparameter": "LITERAL"},
    "utterances": [
      "stop {stopparameter}",
      "stop the {stopparameter}",
      "kill {stopparameter}",
      "kill the {stopparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("stopparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "stoptcommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Stop Command is, "+ parameter);
  }
);


app.intent("gocommand", {
    "slots": { "goparameter": "LITERAL"},
    "utterances": [
      "go {goparameter}",
      "go to {goparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("goparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "gocommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Go Command is, "+ parameter);
  }
);


app.intent("mutecommand", {
    "slots": { "muteparameter": "LITERAL"},
    "utterances": [
      "mute {muteparameter}",
      "mute the {muteparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("muteparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "mutecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Mute Command is, "+ parameter);
  }
);


app.intent("volumecommand", {
    "slots": { "volumeparameter": "LITERAL"},
    "utterances": [
      "set volume to {volumeparameter}",
      "set the volume to {volumeparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("volumeparameter");
    console.log("Success!" + request.request);
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "volumecommand", parameters="'+ parameter +'", time=strftime("%s","now") WHERE id=1');
      });
    response.say("Volume Command is, "+ parameter);
  }
);



app.intent("shutdown", {
    "slots": {"shutdownparameter": "LITERAL"},
    "utterances": [
      "{shutdown|shut down} {shutdownparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("shutdownparameter");
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "shutdown", parameters="'+ parameter +'",time=strftime("%s","now") WHERE id=1');
      });
    response.say("Shutdown Command Sent to " + parameter);
  }
);


app.intent("lock", {
    "slots": {"lockparameter": "LITERAL"},
    "utterances": [
      "Lock {lockparameter}"
    ]
  },
  function(request, response) {
    var parameter = request.slot("lockparameter");
    var currentDate = new Date();
    db.serialize(function() {
        db.run('UPDATE Dreams SET  dream= "shutdown", parameters="'+ parameter +'",time=strftime("%s","now") WHERE id=1');
      });
    response.say("Lock Command Sent to " + parameter);
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
  user = request.query.email;
  db.all('SELECT * from Dreams WHERE user="'+ user + '"', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

express_app.get('/tos', function(request, response) {
  response.sendFile(__dirname + '/views/tos.html');
});

express_app.get('/pp', function(request, response) {
  response.sendFile(__dirname + '/views/pp.html');
});



express_app.listen(PORT, () => console.log("Listening on port " + PORT + "."));
