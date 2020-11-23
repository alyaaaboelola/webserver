const express = require("express");
const app = express();
//let morgan=require("morgan");
//app.use(morgan("combined"));
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
// sourcecode will be in the submission certificate
app.get("/sourcecode", (req, res) => {
res.send(require('fs').readFileSync(__filename).toString())
})

//create an acccount
app.post("/signup", (req, res) => {
  let userobj =JSON.parse(req.body);
  
   if(userobj.username=== undefined){
     res.send(JSON.stringify({success:false ,reason:"username field missing"}));
    return
  }
  if(userobj.password=== undefined){
     res.send(JSON.stringify({success:false ,reason:"password field missing"}));
    return
  }
  if(usersignmap.has(userobj.username)){
    
    res.send(JSON.stringify({success:false ,reason:"Username exists"}));
    return
  }
    
  usersignmap.set(userobj.username,userobj.password);
   res.send(JSON.stringify({success:true }));
});
////end of create an acccount
//login endpoint
app.post("/login", (req, res) => {
  let userobj =JSON.parse(req.body);
  
   if(userobj.username=== undefined){
     res.send(JSON.stringify({success:false ,reason:"username field missing"}));
    return
  }
  if(userobj.password=== undefined){
     res.send(JSON.stringify({success:false ,reason:"password field missing"}));
    return
  }
  if(!usersignmap.has(userobj.username)){
    
    res.send(JSON.stringify({success:false ,reason:"User does not exist"}));
    return
  }
  if(userobj.password!==usersignmap.get(userobj.username)){
     res.send(JSON.stringify({success:false ,reason:"Invalid password"}));
    return
  }
  let usertoken="" + Math.floor(Math.random() * 1000000000);
   userloginmap.set(usertoken,userobj.username);
   res.send(JSON.stringify({success:true ,token:usertoken}));
});

///end of login
//create channel end point
app.post("/create-channel",(req,res)=>{
  let channelobj=JSON.parse(req.body);
  let auth =req.headers.token;
  if(auth===undefined){
    res.send(JSON.stringify({success:false ,reason:"token field missing"}));
    return
  }
  if(!userloginmap.has(auth) ){
     res.send(JSON.stringify({success:false ,reason:"Invalid token"}));
    return
  }
  if(channelobj.channelName===undefined){
     res.send(JSON.stringify({success:false ,reason:"channelName field missing"}));
    return
  }
 
  if(userchannelmap.has(channelobj.channelName)){
    res.send(JSON.stringify({success:false ,reason:"Channel already exists"}));
    return
  }
  userchannelmap.set(channelobj.channelName,userloginmap.get(auth));
  res.send(JSON.stringify({success:true}));
    return
})
//end of create channel

//join channel end point
app.post("/join-channel",(req,res)=>{
  let channelobj=JSON.parse(req.body);
  let auth =req.headers.token;
  if(auth===undefined){
    res.send(JSON.stringify({success:false ,reason:"token field missing"}));
    return
  }
  if(!userloginmap.has(auth) ){
     res.send(JSON.stringify({success:false ,reason:"Invalid token"}));
    return
  }
  if(channelobj.channelName===undefined){
     res.send(JSON.stringify({success:false ,reason:"channelName field missing"}));
    return
  }
  if(!userchannelmap.has(channelobj.channelName)){
    res.send(JSON.stringify({success:false ,reason:"Channel does not exist"}));
    return
  }
  if(userjoinchannelmap.has(channelobj.channelName)){
     res.send(JSON.stringify({success:false ,reason:"User has already joined"}));
    return
  }
  if(userbanchannelmap.has(channelobj.channelName)){
     res.send(JSON.stringify({success:false ,reason:"User is banned"}));
    return
  }
  userjoinchannelmap.set(channelobj.channelName,userloginmap.get(auth));
  res.send(JSON.stringify({success:true}));
    return
})
//end of join channel

//leave channel end point
app.post("/leave-channel",(req,res)=>{
  let channelobj=JSON.parse(req.body);
  let auth =req.headers.token;
  if(auth===undefined){
    res.send(JSON.stringify({success:false ,reason:"token field missing"}));
    return
  }
  if(!userloginmap.has(auth) ){
     res.send(JSON.stringify({success:false ,reason:"Invalid token"}));
    return
  }
  if(channelobj.channelName===undefined){
     res.send(JSON.stringify({success:false ,reason:"channelName field missing"}));
    return
  }
  if(!userchannelmap.has(channelobj.channelName)){
    res.send(JSON.stringify({success:false ,reason:"Channel does not exist"}));
    return
  }
  if(!userjoinchannelmap.has(userloginmap.get(auth))){
     res.send(JSON.stringify({success:false ,reason:"User is not part of this channel"}));
    return
  }
 
  userjoinchannelmap.delete(userloginmap.get(auth));
  //delete after test
  let testdata;

    testdata = userjoinchannelmap.get(channelobj.channelName)
 
  res.send(JSON.stringify({success:true , reason:testdata}));
    return
})

//port
app.listen(process.env.PORT || 3000)