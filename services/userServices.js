const User = require('../models/User');
const CustomError = require('../errors');
const { createTokenUser,checkPermissions } = require('../utils');
const { attachCookiesToResponse } = require('../services/JwtServices');

async function getAllUsersServices(){
  return await User.find({}).select('-password');
}

async function getSingleUserService(curr_user,id){
  const user = await User.findOne({ _id: id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${id}`);
  }
  checkPermissions(curr_user, user._id);
  return user;
}

async function updateUserService(curr_user,email,name){
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: curr_user.userId });
  user.email = email;
  user.name = name;
  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  return {user,tokenUser}
}

async function updateUserPasswordService(curr_user,oldPassword, newPassword){
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: curr_user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;
  await user.save();
  return { msg: 'Success! Password Updated.' };
}

module.exports={
  getAllUsersServices,
  getSingleUserService,
  updateUserService,
  updateUserPasswordService
}