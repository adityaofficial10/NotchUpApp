const axios = require("axios");
const { API_URL } = require("./config.js");

const convertTimeFromUnix = (unixTime) =>{

  //console.log(unixTime);
  const curr_date = new Date();
  let unix_timestamp = Number(unixTime);
  var date = new Date(unix_timestamp * 1000);
   console.log(date);
};
const convertUTCDateToLocalDate =  (date)=>{
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),  date.getHours(), date.getMinutes(), date.getSeconds()));
};

const getDiff = (d1, d2) => {

  var delta = Math.abs(d2 - d1) / 1000;
  var days = Math.floor(delta / 86400);
  delta -= days * 86400;
  var hours = Math.floor(delta / 3600) % 24;

  var obj = {
    days: String(days),
    hours: String(hours)
  };

  return obj;
};
const d = new Date("04 Dec 2020, 16:30:00.00Z");
const curr = new Date();
const ob = getDiff(curr,d);
console.log(ob.hours);
