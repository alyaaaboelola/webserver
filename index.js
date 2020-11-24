const express = require("express");
const app = express();
let morgan=require("morgan");
app.use(morgan("combined"));
const cors =require("cors");
app.use(cors());
let bodyParser=require("body-parser");
app.use(bodyParser.raw({type:"*/*"}));
//usersignmap contains the users and passwords that signup
let usersignmap = new Map();
//userloginmap contains the users and token that successfully login
let userloginmap = new Map();
//userchannelmap contains the users and channel that created
let userchannelmap = new Map();
//userjoinchannelmap contains the users and channel that created
let userjoinchannelmap= new Map();
//userbanchannelmap contains the users and channel that created
let userbanchannelmap= new Map();
//usermessagechannelmap contains the users and channel that created
let usermessagechannelmap = new Map();

// sourcecode will be in the submission certificate
app.get("/sourcecode", (req, res) => {
res.send(require('fs').readFileSync(__filename).toString())
})

//create an acccount
app.post("/signup", (req, res) => {
  let userobj = JSON.parse(req.body);

  if (userobj.username === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "username field missing" })
    );
    return;
  }
  if (userobj.password === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "password field missing" })
    );
    return;
  }
  if (usersignmap.has(userobj.username)) {
    res.send(JSON.stringify({ success: false, reason: "Username exists" }));
    return;
  }

  usersignmap.set(userobj.username, userobj.password);
  res.send(JSON.stringify({ success: true }));
});
////end of create an acccount
//login endpoint
app.post("/login", (req, res) => {
  let userobj = JSON.parse(req.body);

  if (userobj.username === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "username field missing" })
    );
    return;
  }
  if (userobj.password === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "password field missing" })
    );
    return;
  }
  if (!usersignmap.has(userobj.username)) {
    res.send(JSON.stringify({ success: false, reason: "User does not exist" }));
    return;
  }
  if (userobj.password !== usersignmap.get(userobj.username)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid password" }));
    return;
  }
  let usertoken = "" + Math.floor(Math.random() * 1000000000);
  userloginmap.set(usertoken, userobj.username);
  res.send(JSON.stringify({ success: true, token: usertoken }));
});

///end of login
//create channel end point
app.post("/create-channel", (req, res) => {
  let channelobj = JSON.parse(req.body);
  let auth = req.headers.token;
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  if (channelobj.channelName === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }

  if (userchannelmap.has(channelobj.channelName)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel already exists" })
    );
    return;
  }
  //test
  //console.log("user:",userloginmap.get(auth));
  userchannelmap.set(channelobj.channelName, userloginmap.get(auth));

  res.send(JSON.stringify({ success: true }));
  return;
});
//end of create channel

//join channel end point
app.post("/join-channel", (req, res) => {
  let channelobj = JSON.parse(req.body);
  let auth = req.headers.token;
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  if (channelobj.channelName === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }
  if (!userchannelmap.has(channelobj.channelName)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel does not exist" })
    );
    return;
  }
  //test user joined

  let usersjoined = [];
  if (userjoinchannelmap.has(channelobj.channelName)) {
    usersjoined = userjoinchannelmap.get(channelobj.channelName);
  }

  let foundjoin = false;
  for (let i = 0; i < usersjoined.length; i++) {
    if (usersjoined[i] === userloginmap.get(auth)) {
      foundjoin = true;
    }
  }
  if (userjoinchannelmap.has(channelobj.channelName) && foundjoin) {
    res.send(
      JSON.stringify({ success: false, reason: "User has already joined" })
    );
    return;
  }
  //test user baned
  let usersbanned = [];
  if (userbanchannelmap.has(channelobj.channelName)) {
    usersbanned = userbanchannelmap.get(channelobj.channelName);
  }

  let foundban = false;
  for (let j = 0; j < usersbanned.length; j++) {
    if (usersbanned[j] === userloginmap.get(auth)) {
      foundban = true;
    }
  }

  if (userbanchannelmap.has(channelobj.channelName) & foundban) {
    res.send(JSON.stringify({ success: false, reason: "User is banned" }));
    return;
  }
  usersjoined.push(userloginmap.get(auth));
  //test
 // console.log("usersjoined:", usersjoined);
  userjoinchannelmap.set(channelobj.channelName, usersjoined);
  res.send(JSON.stringify({ success: true }));
  return;
});
//end of join channel

//leave channel end point
app.post("/leave-channel", (req, res) => {
  let channelobj = JSON.parse(req.body);
  let auth = req.headers.token;
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  if (channelobj.channelName === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }
  if (!userchannelmap.has(channelobj.channelName)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel does not exist" })
    );
    return;
  }
  //modify
  let usersjoined = [];
  if (userjoinchannelmap.has(channelobj.channelName)) {
    usersjoined = userjoinchannelmap.get(channelobj.channelName);
  }

  let foundjoin = false;
  for (let i = 0; i < usersjoined.length; i++) {
    if (usersjoined[i] === userloginmap.get(auth)) {
      foundjoin = true;
    }
  }
  if (!userjoinchannelmap.has(channelobj.channelName) || !foundjoin) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }

  let keep = [];
  for (let k = 0; k < usersjoined.length; k++) {
    let duser = usersjoined[k];
    if (duser !== userloginmap.get(auth)) {
      keep.push(duser);
    }
  }
 //test
 //console.log("particpantes:", keep);
  userjoinchannelmap.set(channelobj.channelName, keep);

  res.send(JSON.stringify({ success: true }));
  return;
});
//end of leave channel

//end point joined
app.get("/joined", (req, res) => {
  let chname = req.query.channelName;
  let auth = req.headers.token;

  if (!userchannelmap.has(chname)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel does not exist" })
    );
    return;
  }
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  let usersjoined = [];
  if (userjoinchannelmap.has(chname)) {
    usersjoined = userjoinchannelmap.get(chname);
  }

  let foundjoin = false;
  for (let i = 0; i < usersjoined.length; i++) {
    if (usersjoined[i] === userloginmap.get(auth)) {
      foundjoin = true;
    }
  }

  if (!foundjoin) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }
//test
 // console.log("userjoined:", usersjoined);
  res.send(JSON.stringify({ success: true, joined: usersjoined }));
});

//end joined

//end point delete
app.post("/delete", (req, res) => {
  let channelobj = JSON.parse(req.body);
  let auth = req.headers.token;

  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  if (channelobj.channelName === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }
  if (!userchannelmap.has(channelobj.channelName)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel does not exist" })
    );
    return;
  }

  if (userchannelmap.get(channelobj.channelName) === userloginmap.get(auth)) {
    userchannelmap.delete(channelobj.channelName);
    userjoinchannelmap.delete(channelobj.channelName);
    userbanchannelmap.delete(channelobj.channelName);
    res.send(JSON.stringify({ success: true }));
    return;
  }
});
//end delete

//end point kick
app.post("/kick", (req, res) => {
  let channelobj = JSON.parse(req.body);
  let auth = req.headers.token;
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  if (channelobj.channelName === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }

  if (channelobj.target === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "target field missing" })
    );
    return;
  }

  if (userchannelmap.get(channelobj.channelName) !== userloginmap.get(auth)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel not owned by user" })
    );
    return;
  }

  let usersjoined = [];
  if (userjoinchannelmap.has(channelobj.channelName)) {
    usersjoined = userjoinchannelmap.get(channelobj.channelName);
  }

  let keep = [];
  for (let k = 0; k < usersjoined.length; k++) {
    let duser = usersjoined[k];
    if (duser !== channelobj.target) {
      keep.push(duser);
    }
  }
  //test
 //console.log("particpantes:", keep);

  userjoinchannelmap.set(channelobj.channelName, keep);

  res.send(JSON.stringify({ success: true }));
  return;
});
//end kick

//end point ban
app.post("/ban", (req, res) => {
  let channelobj = JSON.parse(req.body);
  let auth = req.headers.token;
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  if (channelobj.channelName === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }

  if (channelobj.target === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "target field missing" })
    );
    return;
  }

  if (userchannelmap.get(channelobj.channelName) !== userloginmap.get(auth)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel not owned by user" })
    );
    return;
  }

  let usersbanned = [];
  if (userbanchannelmap.has(channelobj.channelName)) {
    usersbanned = userbanchannelmap.get(channelobj.channelName);
  }

  usersbanned.push(channelobj.target);
  //test
  //console.log("userbanned:", usersbanned);
  userbanchannelmap.set(channelobj.channelName, usersbanned);

  res.send(JSON.stringify({ success: true }));
  return;
});
//end ban
//end point message
app.post("/message", (req, res) => {
  let channelobj = JSON.parse(req.body);
  let auth = req.headers.token;
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (channelobj.channelName === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }

  if (channelobj.contents === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "contents field missing" })
    );
    return;
  }

  let usersjoined = [];
  if (userjoinchannelmap.has(channelobj.channelName)) {
    usersjoined = userjoinchannelmap.get(channelobj.channelName);
  }
  let foundjoin = false;
  for (let i = 0; i < usersjoined.length; i++) {
    if (usersjoined[i] === userloginmap.get(auth)) {
      foundjoin = true;
    }
  }

  if (!foundjoin) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }

  let sentmessages = [];
  if (usermessagechannelmap.has(channelobj.channelName)) {
    sentmessages = usermessagechannelmap.get(channelobj.channelName);
  }
  let currentmessage = {
    from: userloginmap.get(auth),
    contents: channelobj.contents
  };
  sentmessages.push(currentmessage);
 //test
// console.log("message:", sentmessages);
  usermessagechannelmap.set(channelobj.channelName, sentmessages);
  res.send(JSON.stringify({ success: true }));
  return;
});
//end message

//end point messages
app.get("/messages", (req, res) => {
  let chname = req.query.channelName;
  let auth = req.headers.token;

  if (chname === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "channelName field missing" })
    );
    return;
  }
  if (!userchannelmap.has(chname)) {
    res.send(
      JSON.stringify({ success: false, reason: "Channel does not exist" })
    );
    return;
  }

  let usersjoined = [];
  if (userjoinchannelmap.has(chname)) {
    usersjoined = userjoinchannelmap.get(chname);
  }

  let foundjoin = false;
  for (let i = 0; i < usersjoined.length; i++) {
    if (usersjoined[i] === userloginmap.get(auth)) {
      foundjoin = true;
    }
  }

  if (!foundjoin) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }
  let messagearr = [];
  if (usermessagechannelmap.has(chname)) {
    messagearr = usermessagechannelmap.get(chname);
  }
  res.send(JSON.stringify({ success: true, messages: messagearr }));
});
//end messages

//port
app.listen(process.env.PORT || 3000)