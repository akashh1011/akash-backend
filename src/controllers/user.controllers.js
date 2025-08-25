import {asyncHandler} from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import {uploadOnCloudinary} from "../utils/cloudinary.utils.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.utils.js"

//generate Access and Refresh Tokens

const generateAccessAndRefreshTokens = async(userId)=>{
  try {
     const user = await User.findById(userId)
     const accessToken = user.generateAccessTokens()
     const refreshToken = user.generateRefreshTokens()

     //database m save krwane h access and refresh tokens

     user.refreshToken = refreshToken
     await user.save({validateBeforeSave:false})

     return {accessToken,refreshToken}
    
  } catch (error) {
    throw new ApiError(500,"Something went wrong")
    
  }
}



const registerUser = asyncHandler(async (req,res,next)=>{
  const {fullname,email,username,password} = req.body
  // console.log({
  //   email,
  //   fullname,
  //   username
  // })

  if([fullname,email,username,password].some((field)=>field?.trim() === "")){
    throw new ApiError(400,"All fields are required")
  }

  const existedUser = await User.findOne({
    $or:[{ username },{ email }]
  })
  if(existedUser){
    throw new ApiError(409,"Username or email already existed")
  }

  // check for images , check avatar

const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;
let coverImageLocalPath
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
  coverImageLocalPath=req.files.coverImage[0].path
}

//validation for avatar
if(!avatarLocalPath){
  throw new ApiError(400,"avatar is required")
}

//upload on cloudinary

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//create user model - create entry in db

const user = await User.create({
  fullname,
  avatar:avatar.url,
  coverImage:coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
})

// remove password and refresh token

const createdUser = await User.findById(user._id).select("-password -refreshToken")

//agr user create nhi hua h to error dedo

if(!createdUser){
  throw new ApiError(500,"Something went wrong , Please try again later")
}

return res.status(201).json(
  new ApiResponse (200,createdUser,"User registered successfully")
)
})


// login
//req.body se data lena h
//username or email lena h 
// details ko validate krke chk krna h user exist h ya nhi wrna error do
//password validate krne h
// access & refresh tokens
//send cookies
const loginUser = asyncHandler(async (req,res)=>{
  // req.body se data lere
  const {username, email, password} = req.body

  if(!username || !email){
    throw new ApiError(400," username or email is required")
  }

  // check for user
  const user = await User.findOne({
    $or:[{ username },{ email }]
  })

  //if user not found
  if(!user){
    throw new ApiError(404,"User does not exist")
  }

  //password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(404,"Password is invalid")
  }

  //genrate access and refresh tokens

 const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

 //send cookies

 const options ={
  httpOnly:true,
  secure:true
 }

 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
  new ApiResponse(200,{
    user: loggedInUser, accessToken, refreshToken
  },
  "User logged in successfully"
)
 )

})

const logoutUser = asyncHandler(async(req,res)=>{

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new:true
    }


  )

  const options ={
  httpOnly:true,
  secure:true
 }

 return res
 .status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User logged out successfully"))

})






export {
  registerUser,
  loginUser,
  logoutUser

}
