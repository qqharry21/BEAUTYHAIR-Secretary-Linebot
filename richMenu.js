/** @format */

const richMenu = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: '功能選單',
  chatBarText: '功能選單',
  areas: [
    {
      bounds: {
        x: 825,
        y: 843,
        width: 857,
        height: 843,
      },
      action: {
        type: 'message',
        text: '修改預約',
      },
    },
    {
      bounds: {
        x: 1673,
        y: 843,
        width: 827,
        height: 843,
      },
      action: {
        type: 'message',
        text: '取消預約',
      },
    },
    {
      bounds: {
        x: 0,
        y: 843,
        width: 827,
        height: 843,
      },
      action: {
        type: 'message',
        text: '查詢指定客戶',
      },
    },
    {
      bounds: {
        x: 1673,
        y: 0,
        width: 827,
        height: 843,
      },
      action: {
        type: 'message',
        text: '查詢客戶',
      },
    },
    {
      bounds: {
        x: 0,
        y: 0,
        width: 827,
        height: 843,
      },
      action: {
        type: 'message',
        text: '預約',
      },
    },
    {
      bounds: {
        x: 822,
        y: 0,
        width: 857,
        height: 843,
      },
      action: {
        type: 'message',
        text: '查詢人數',
      },
    },
  ],
};

module.exports = { richMenu };