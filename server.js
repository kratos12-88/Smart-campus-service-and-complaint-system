const express=require('express');
const {MongoClient}=require('mongodb');
const path=require('path');
const app=express();
const port=process.env.PORT||3000;
const client=new MongoClient(process.env.MONGODB_URI||'');
app.use(express.json({limit:'2mb'}));
app.use(express.static(path.join(__dirname,'public')));
app.get('/api/health',async(req,res)=>{try{await client.db().command({ping:1});res.json({ok:true,database:'mongodb'})}catch(e){res.status(503).json({ok:false})}});
async function start(){if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required');await client.connect();app.listen(port,()=>console.log('Smart Campus running on '+port))}
start().catch(e=>{console.error(e.message);process.exit(1)});
