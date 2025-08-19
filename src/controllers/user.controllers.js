import {asyncHandler} from "../utils/asyncHandler.utils.js"

const registerUser = asyncHandler(async (req,res,next)=>{
  res.status(200).json({
    message:"Akash's Backend"
  })
})

export {registerUser}
