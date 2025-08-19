import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app=express()

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))

//middlewares

//json data ko handle krne k liye lgaya h
app.use(express.json({limit:"16kb"}))

//jo bhi url routes hote h unko encode krne k liye 
app.use(express.urlencoded({extended:true,limit:"16kb"}))

//files or images jo aate h unhe store krne k liye
app.use(express.static("public"))


//routes import 
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRouter)

export default app;