const Url=require('../models/Url')
const murmurhash=require('murmurhash');
const geoIp2 = require('geoip-lite2');
const { NotFoundError,UnauthorizedError, CustomAPIError} = require('../errors');

function validateUrl(value) {
  const urlRegex = /^(?:https?|ftp):\/\/(?:[a-z\u00a1-\uffff0-9]+(?:-[a-z\u00a1-\uffff0-9]+)*\.)+(?:[a-z\u00a1-\uffff]{2,}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)(?:\/[^/\s]*)*$/i;
  return urlRegex.test(value);
}

async function generateShortUrlCode(longUrl){
  const seed=Date.now().toString();
  const hashResult=murmurhash.v3(longUrl,seed)
  const shortCode=hashResult.toString(36);
  return shortCode;

}

async function genearteShortUrl(userId,longUrl,expiryDateTime){
  if(!validateUrl(longUrl)){
    return;
  }
  const shortCode=await generateShortUrlCode(longUrl);
  const shortUrl=`${process.env.BASE_URL}/${shortCode}`;
  if (expiryDateTime) {
    try {
      expiryDateTime=new Date(expiryDateTime);
    } catch (error) {
      expiryDateTime = new Date();
    }
    if (expiryDateTime.getTime() < Date.now()) {
      expiryDateTime = new Date(); // Current date and time
      expiryDateTime.setDate(expiryDateTime.getDate() + 1); // Add one day
    }
  } else {
    // If expiryDateTime is not a valid Date object, set it to tomorrow
    expiryDateTime = new Date();
    expiryDateTime.setDate(expiryDateTime.getDate() + 1);
  }
  const url=new Url({
    origUrl:longUrl,
    urlId:shortCode,
    shortUrl:shortUrl,
    expiryDateTime:expiryDateTime,
    user:userId
  })

  await url.save();
  return url;
}

async function getLongUrlFromShortUrlCodeService(shortUrlCode,ip){
  const geo = geoIp2.lookup(ip);
  console.log(geo);  
  const country = geo?egeo.country:"unknown";
  const city = geo?geo.city:"unknown";


  const url=await Url.findOne({
    urlId:shortUrlCode
  })

  if(url){
    if(await uniqueRegionsValidator(url,city,country)===true){
      url.regionClickedOn.push({
        city,
        country
      });
      
    }
    url.clicks += 1;
    await url.save()    
    return url.origUrl
  }

}
async function getAllUrlsService(){
  return await Url.find({});
}

async function updateUrlService(user, urlId, longUrl, expiryDateTime) {
  if (expiryDateTime && expiryDateTime instanceof Date && !isNaN(expiryDateTime)) {
    if (expiryDateTime.getTime() < Date.now()) {
      expiryDateTime = new Date(); // Current date and time
      expiryDateTime.setDate(expiryDateTime.getDate() + 1); // Add one day
    }
  } else {
    // If expiryDateTime is not a valid Date object, set it to tomorrow
    expiryDateTime = new Date();
    expiryDateTime.setDate(expiryDateTime.getDate() + 1);
  }
  const url = await Url.findOne({ urlId: urlId });
  if (!url) {
    throw new NotFoundError(`No long URL found for ${process.env.BASE_URL}/${urlId}`);
  }

  if (url.user.toString() !== user.userId && user.role !== 'admin') {
    throw new UnauthorizedError('You are not authorized to make changes');
  }
  if(!validateUrl(longUrl)){
    throw new CustomAPIError("invalid long url");
  }
  url.origUrl = longUrl;
  url.expiryDateTime = expiryDateTime;
  await url.save();
  return url;
}



async function uniqueRegionsValidator(value,city,country) {
  let uniqueSet = new Set();
  console.log('Validation Triggered:---------', value);
  if(value.regionClickedOn.length===0){
    return true;
  }
  for (const element of value.regionClickedOn){
    uniqueSet.add(`${element.country},${element.city}`);
    if(uniqueSet.has(`${country},${city}`)){
      return false;
    }
    //console.log(uniqueSet);
    }
  return true; // No duplicates found
}


async function deleteUrlService(user,urlId){
  const url = await Url.findOne({ urlId: urlId });
  if (!url) {
    throw new NotFoundError(`No long URL found for ${process.env.BASE_URL}/${urlId}`);
  }

  if (url.user.toString() !== user.userId && user.role !== 'admin') {
    throw new UnauthorizedError('You are not authorized to make changes');
  }
  return await Url.deleteOne({urlId:urlId});
}

async function getUrlsForUserService(userId) {
  try {
    const urls = await Url.find({ user: userId });
    console.log('URLs for user:', urls);
    return urls;
  } catch (error) {
    console.error('Error fetching URLs for user:', error);
    throw error; // Propagate the error
  }
}

module.exports={
  genearteShortUrl,
  getAllUrlsService,
  getLongUrlFromShortUrlCodeService,
  updateUrlService,
  deleteUrlService,
  getUrlsForUserService
}