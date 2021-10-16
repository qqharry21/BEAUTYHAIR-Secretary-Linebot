/** @format */

/** 流程狀態 */
let status = '';

/** 設定流程狀態 */
function setProcess(process) {
  switch (process) {
    case 'book':
      status = 'BOOK';
      break;
    case 'count':
      status = 'COUNT';
      break;
    case 'show':
      status = 'SHOW';
      break;
    case 'search':
      status = 'SEARCH';
      break;
    case 'modify':
      status = 'MODIFY';
      break;
    case 'cancel':
      status = 'CANCEL';
      break;
    case 'send':
      status = 'SENDING';
      break;
    case 'fetch':
      status = 'FETCHING';
      break;
  }
}

/** 抓取流程狀態 */
function getProcess() {
  return status;
}

/** 取消流程狀態 */
function resetProcess() {
  status = '';
}

module.exports = { setProcess, getProcess, resetProcess };
