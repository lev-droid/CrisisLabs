const express = require('express');
var cors = require('cors')

const app = express();
app.use(cors());

app.get('/' , (req,res)=>{
   res.send("debug"); 
})
  
// Server setup
app.listen(4000 , ()=>{
    console.log("server running");
});