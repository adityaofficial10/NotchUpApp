const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require("multer");
const fileupload = require("express-fileupload");
const path = require("path");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const ejs = require("ejs");
const aws = require("aws-sdk");
const axios = require("axios");
const nodemailer = require('nodemailer');
const {
  EMAIL,
  PASSWORD,
  API_URL
} = require("./config.js");

const app = express();
app.use(fileupload());

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(morgan('dev'));

//Thanks for your interest in NotchUp.We have scheduled a slot for you. Check your email for slot details...
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD
  }
});

const sendMailToUser = (recieverEmail, parentName, studentName, slotTime) => {

  var emailText = `Dear ${parentName}, \n ${ studentName }'s class at ${slotTime} has been successfully booked.`;
  var mailOptions = {
    from: EMAIL,
    to: recieverEmail,
    subject: 'NotchUp Trial Class Booked successfully',
    text: emailText
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

};

const getCourses = function() {

  return axios.get(API_URL).then((res) => res.data);
};

const convertTimeFromUnix = (unixTime) => {

  //console.log(unixTime);
  const curr_date = new Date();
  let unix_timestamp = Number(unixTime);
  var months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var date = new Date(unix_timestamp * 1000);
  var day = String(date.getUTCFullYear());
  var dd = String(date.getUTCDate());
  var mm = months_arr[date.getUTCMonth()];
  //console.log(mm);
  var yy = 2021;
  if (mm === "Dec") yy = 2020;
  var formattedDate = dd + " " + mm + " " + yy;
  var hours = String(date.getHours());
  var minutes = "0" + String(date.getMinutes());
  var seconds = "0" + String(date.getSeconds());
  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return (formattedDate + ", " + formattedTime);
};

const fetchSlot = (courseName) => {

  var slot = getCourses().then((courses) => {
    courses.forEach((course) => {
      course.slots.forEach((slot) => {
        console.log(slot);
      });
    });
  });
};

const convertUTCDateToLocalDate = (date) => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
};

const getDiff = (d2) => {

  var d3 = new Date(d2);
  var curr = new Date();
  var d4 =convertUTCDateToLocalDate(curr);
  var delta = Math.abs(d3 - d4) / 1000;
  var days = Math.floor(delta / 86400);
  delta -= days * 86400;
  var hours = Math.floor(delta / 3600) % 24;

  var obj = [];
  obj.push(days);obj.push(hours);
  return obj;
};

var obj = {
  recieverEmail: "",
  parentName: "",
  studentName: "",
  slotTime: ""
};

app.get("/me", function(req, res) {

  res.send(slots);
});

app.get("/", function(req, res) {

  res.render("index", {
    crs: crs
  });
});

app.post("/", function(req, res) {

  var timeSlots = [];
  var curr = new Date();
  curr = convertUTCDateToLocalDate(curr);
  console.log(curr);
  slots[0].forEach((slotUnit)=>{
    console.log(convertTimeFromUnix(slotUnit.slot));
  });
  const name = req.body.courseName;
  obj.parentName = req.body.parentName;
  obj.studentName = req.body.studentName;
  obj.recieverEmail = req.body.recieverEmail;
  var index = crs.indexOf(name);
  slots[index].forEach((slotUnit) => {

    var sl = convertTimeFromUnix(slotUnit.slot);
    var de = sl;
    sl = sl + ".000Z";
    const ne = new Date(sl);
    if(ne >= curr){

      var ob = getDiff(sl);
      if(ob[0] === 0)
      {
        if(ob[1] >= 4)
        console.log(de + "pushed..");
        timeSlots.push(de);
      }
      else if (ob[0] > 0 && ob[0] <=90) {
        console.log(de + "pushed..");
        timeSlots.push(de);
      }
      else{
        console.log(de + " not pushed...");
      }
    }

  });

  //timeSlots = timeSlots.filter((value, index) => timeSlots.indexOf(value) === index);
  if(!timeSlots.length){
    res.render("courses", {
      courseName: req.body.courseName,
      parentName: req.body.parentName,
      slots: timeSlots
    });
  }
  else
  res.render("regrets");

});

app.post("/success", function(req, res) {

  obj.slotTime = req.body.slotTime;
  console.log(req.body.slotTime);
  sendMailToUser(obj.recieverEmail, obj.parentName, obj.studentName, obj.slotTime);
  res.render("success");
});

var slots;
var crs;
getCourses().then((courses) => {
  slots = new Array(courses.length);
  crs = new Array(courses.length);
  courses.forEach((course) => {
    crs[course.course_id - 1] = course.course_name;
    slots[course.course_id - 1] = course.slots;
  });
}).catch((error) => {
  console.error(error);
}).finally(() => {

  app.listen(3000, function(res) {

    console.log("Server running on port 3000...");
  });
});
