import {asyncHandler} from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import {uploadOnCloudinary} from "../utils/cloudinary.utils.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.utils.js"

const registerUser = asyncHandler(async (req,res,next)=>{
  const {fullname,email,username,password} = req.body
  console.log({
    email,
    fullname,
    username
  })

  if([fullname,email,username,password].some((field)=>field?.trim() === "")){
    throw new ApiError(400,"All fields are required")
  }

  const existedUser = User.findOne({
    $or:[{ username },{ email }]
  })
  if(existedUser){
    throw new ApiError(409,"Username or email already existed")
  }
})

// check for images , check avatar

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export {registerUser}
