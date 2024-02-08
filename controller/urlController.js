const { genearteShortUrl,
        getAllUrlsService,
        getLongUrlFromShortUrlCodeService,
        updateUrlService,
        deleteUrlService,
        getUrlsForUserService } = require("../services/urlServices");

        const {StatusCodes} =require('http-status-codes');

async function createShortUrl(req, res) {
  try {
    const { longUrl, expiryDateTime } = req.body;
    const url = await genearteShortUrl(req.user.userId,longUrl, expiryDateTime);
    
    if (url) {
      return res.status(StatusCodes.CREATED).json({
        url,
        message: "created short url",
      });
    }

    // Handle case where URL is not valid
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid URL" });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Try later" });
  }
}

async function redirectToOriginalAddress(req,res,next){
  try {
    const shortUrlCode=req.params.urlId;
    const ip = req.clientIp;
    const originalUrl=await getLongUrlFromShortUrlCodeService(shortUrlCode,ip);
    if(originalUrl){
      return res.redirect(originalUrl);
    }
    return res.status(StatusCodes.NOT_FOUND).json({message:`resource not found`});
  } catch (error) {
    next(error)
  }
 
}

async function getAllUrls(req,res,next){
  try {
    const urls=await getAllUrlsService();
    res.status(StatusCodes.OK).json({urls})
  } catch (error) {
    next(error);
  }
  
}

async function getUrlsForUser(req,res,next){
  try {
    const urls=await getUrlsForUserService(req.user.userId)
    res.status(StatusCodes.OK).json({urls});
  } catch (error) {
    next(error)
  }
}

async function updateUrl(req,res,next){
  try {
    const { longUrl, expiryDateTime } = req.body;
    const urlId=req.params.urlId;
    const url=await updateUrlService(req.user,urlId,longUrl,expiryDateTime);

    if (url) {
      res.status(StatusCodes.OK).json({
        url,
        message: "updated successfully",
      });
    }

  // Handle case where URL is not valid
   res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid URL" });
  } catch (error) {
    next(error);
  }
  
}

async function deleteUrl(req,res,next){
  try {
    const urlId=req.params.urlId;
    const url=await deleteUrlService(req.user,urlId);
    res.status(StatusCodes.OK).json({url,message:"deleted successfully"});
  } catch (error) {
    next(error);
  }
}



module.exports={
  createShortUrl,
  getAllUrls,
  redirectToOriginalAddress,
  updateUrl,
  deleteUrl,
  getUrlsForUser
}