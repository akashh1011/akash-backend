import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"

dotenv.config({
  path:'./env'
})
connectDB()
.then(()=>{
app.on("Error",(err)=>{
  console.log("Error",err)
})

  app.listen(process.env.PORT || 9000,()=>{
    console.log(`server is running on port: ${process.env.PORT}`)
  })
})
.catch((err)=>{
    console.log("MongoDB Connection Failed",err)
  })

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// ;(async ()=>{
//   try{
//     mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//   }
//   catch(error){
//     console.log("Error",error)
//     throw err
//   }

// })()