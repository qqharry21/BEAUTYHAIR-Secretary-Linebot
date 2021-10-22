/** @format */

const moment = require('moment');

function timeChange(time) {
  let hour = parseInt(time.split(':', 1).shift());
  let minute = parseInt(time.split(':').pop());
  let output = '';
  if (hour > 12) {
    hour = hour - 12;
    output = '下午 ' + leftPad(hour.toString(), 2, 0) + ':' + leftPad(minute, 2, 0);
  } else {
    output = '上午 ' + time;
  }
  return output;
}

function addEndTimeToDateTime(date, time, endTime) {
  let hour = parseInt(time.split(':', 1).shift());
  let minute = parseInt(time.split(':').pop());
  let endTimeHour = 0;
  let endTimeMinute = 0;
  if (endTime > 30) {
    endTimeHour = parseInt(parseInt(endTime) / 60);
    endTimeMinute = parseInt(endTime) % 60;
  } else {
    endTimeHour = 0;
    endTimeMinute = parseInt(endTime);
  }
  minute += endTimeMinute;
  if (minute > 60) {
    hour += endTimeHour + parseInt(minute / 60);
    minute = parseInt(minute % 60);
  }
  let dateTime = date + ' ' + leftPad(hour, 2, 0) + ':' + leftPad(minute, 2, 0);
  return dateTime;
}

/** 字串整理(編號左邊補0) */
function leftPad(str, len, ch) {
  str = str + '';
  len = len - str.length;
  if (len <= 0) return str;
  if (!ch && ch !== 0) ch = ' ';
  ch = ch + '';
  if (ch === ' ' && len < 10) return cache[len] + str;
  let pad = '';

  while (true) {
    if (len & 1) pad += ch;
    len >>= 1;
    if (len) ch += ch;
    else break;
  }

  return pad + str;
}

function diffTime(date, time) {
  let dateTime = date + ' ' + time + ':00';
  return Math.abs(moment().diff(Date.parse(dateTime).valueOf(), 'minutes'));
}

function searchAll(text) {
  if (text.match('[\u4e00-\u9fa5a-zA-Z][*]')) {
    text = text.split('*').shift();
  } else if (text.match('[*][\u4e00-\u9fa5a-zA-Z]')) {
    text = text.split('*').pop();
  }
  return text;
}

module.exports = { timeChange, leftPad, addEndTimeToDateTime, diffTime, searchAll };
