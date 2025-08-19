import mongoose,{Schema} from "mongoose"
import { JsonWebToken } from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
  username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
  },

  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
  },

  fullname:{
    type:String,
    required:true,
    trim:true,
    index:true
  },

  avatar:{
    type:String, //cloudinary url
    required:true,
  },

  coverImage:{
    type:String,

  },

  watchHistory:[ {
    types:Schema.Types.ObjectId,
    ref:"Video"
  }],

  password:{
    type:String,
    required:[true,"Password is required"]

  },

  refreshToken:{
    type:String,
  }




},{timestamps:true})


// encoding password with the help of bcrypt and pre hook middleware
userSchema.pre("save", async function(next){
  if(! this.isModified("password")) return next();
  this.password=bcrypt.hash(this.password,10)
  next()
})

//check password is it correct or not

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password)
}

//generate access tokens and refresh tokens
userSchema.methods.generateAccessTokens = function(){
  return jwt.sign(
    {
      //payload
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshTokens = function(){


  // ISME INFORMATION KM HOTI H QKI REFRESH HOTA RHTA H BR BR
  return jwt.sign(
    {
      //payload
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:REFRESH_TOKEN_EXPIRY
    }
  )
}
export const User = mongoose.model("User",userSchema)

