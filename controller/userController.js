const { StatusCodes } = require("http-status-codes");
const { getAllUsersServices,getSingleUserService,updateUserPasswordService,updateUserService } = require("../services/userServices");


async function getAllUsers(req,res,next){
  try {
    const users=await getAllUsersServices();
    res.status(StatusCodes.OK).json({users});
  } catch (error) {
    next(error)
  }
}

async function getSingleUser(req,res,next){
  try {
    const userId=req.params.id;
    const user=await getSingleUserService(req.user,userId);
    res.status(StatusCodes.OK).json({user});
  } catch (error) {
    next(error);
  }
}

async function showCurrentUser(req, res,next) {
  try {
    res.status(StatusCodes.OK).json({ user: req.user });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req,res,next){
  try {
    const { email, name } = req.body;
    const data=await updateUserService(req.user,email,name);
    res.status(StatusCodes.OK).json({data});  
  } catch (error) {
    next(error);
  }
}

async function updateUserPassword(req,res,next){
  try {
    const { oldPassword, newPassword } = req.body;
    const message=await updateUserPasswordService(req.user,oldPassword,newPassword);
    res.status(StatusCodes.OK).json({message});

  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};


