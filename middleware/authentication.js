const CustomError = require('../errors');
const { isTokenValid } = require('../services/JwtServices');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  

  try {
    if (!token) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
    const { name, userId, role } = isTokenValid({ token });
  //  console.log("hello-----------3");
    req.user = { name, userId, role };
    next();
  } catch (error) {
    next(error)
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};