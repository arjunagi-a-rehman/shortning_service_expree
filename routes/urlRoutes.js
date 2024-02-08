const { Router } = require("express");
const { createShortUrl,
        getAllUrls,
        redirectToOriginalAddress,
        updateUrl,
        deleteUrl,
        getUrlsForUser } = require("../controller/urlController");

const {
  authenticateUser,
  authorizePermissions,
        } = require('../middleware/authentication');
const urlRouter=Router();

urlRouter.post('/',authenticateUser,createShortUrl);
urlRouter.get('/',authenticateUser,authorizePermissions('admin'),getAllUrls)
urlRouter.get('/user',authenticateUser,getUrlsForUser);
urlRouter.get('/:urlId',redirectToOriginalAddress)
urlRouter.put('/:urlId',authenticateUser,updateUrl);
urlRouter.delete('/:urlId',authenticateUser,deleteUrl);

module.exports=urlRouter;