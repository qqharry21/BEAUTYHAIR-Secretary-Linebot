/** @format */

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

const subject = ['修剪新品', '洗/染', '剪髮', '返修', '其他'];

module.exports = { timeChange, leftPad, subject };
