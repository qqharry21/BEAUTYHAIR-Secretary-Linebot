
# BeautyHair Secretary - Linebot

## 網站主題
For BeautyHair 專用的客戶預約系統。

## 建置動機與目的

公司幾十年下來，在與客戶約定服務時間時，都是以紙本手寫紀錄，但因紙本記錄都是放在公司，有時候客人也會用其他通訊軟體以訊息的方式預約，此時在公司以外的地方將不方便紀錄在紙本上。另一方面若在外臨時要查閱該指定日期有哪些客戶時，只能憑藉零散的記憶，時常導致時間記錯。除此之外，客人有時候很常遲到，導致客戶預約的時間重疊，可能造成客戶印象不好，故建置該系統來解決以上問題。


## 技術

**Client:** Line bot

**Server:** Node

  
## Run Locally

Clone the project

```bash
  git clone https://github.com/qqharry21/BEAUTYHAIR-Secretary-Linebot.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

### Installation

Install [ngrok](https://dashboard.ngrok.com/get-started/setup)

### Connect your account 

Running this command will add your authtoken to the default ngrok.yml configuration file. This will grant you access to more features and longer session times. Running tunnels will be listed on the status page of the dashboard.

```bash
  ./ngrok authtoken [AUTHTOKEN]
```

### Fire it up    

To start a HTTP tunnel forwarding to your local port 80, run this next:

```bash
    ./ngrok http 3000
``` 

Start the server

```bash
  npm run start
```




## API Reference

#### Create rich menu

```http
  PUT https://api.line.me/v2/bot/richmenu
```
#### Request headers

| Parameter | Description                       |
| :-------- | :-------------------------------- |
| `Authorization`      | **Required**. ```Bearer {channel access token}``` |


| Parameter | Description                       |
| :-------- | :-------------------------------- |
| `Content-Type`      | **Required**. ```application/json``` |

#### body - raw
```json
    {
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": true,
  "name": "功能選單",
  "chatBarText": "功能選單",
  "areas": [
    {
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 827,
        "height": 843
      },
      "action": {
        "type": "message",
        "text": "新增預約"
      }
    },
    {
      "bounds": {
        "x": 822,
        "y": 0,
        "width": 857,
        "height": 843
      },
      "action": {
        "type": "message",
        "text": "查詢人數"
      }
    },
    {
      "bounds": {
        "x": 1673,
        "y": 0,
        "width": 827,
        "height": 843
      },
      "action": {
        "type": "message",
        "text": "查詢預約"
      }
    },
    {
      "bounds": {
        "x": 0,
        "y": 843,
        "width": 827,
        "height": 843
      },
      "action": {
        "type": "message",
        "text": "查詢時段"
      }
    },
    {
      "bounds": {
        "x": 825,
        "y": 843,
        "width": 857,
        "height": 843
      },
      "action": {
        "type": "message",
        "text": "修改預約"
      }
    },
    {
      "bounds": {
        "x": 1673,
        "y": 843,
        "width": 827,
        "height": 843
      },
      "action": {
        "type": "message",
        "text": "取消預約"
      }
    }
  ]
    }

```
#### Upload rich menu image

執行local
```bash
    npm start
```

index.js
```javascript
 client
 .setRichMenuImage(
 [richMenuId],
 fs.createReadStream('./public/richMenu.png')
 )
 .then(res => console.log(res))
 .catch(err => console.error(err));
```

#### Set default rich menu

```http
  POST https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}
```

| Parameter | Description                       |
| :-------- | :-------------------------------- |
| `richMenuId`      | **Required**. ID of a rich menu |


#### Get rich menu list

```http
  GET https://api.line.me/v2/bot/richmenu/list
```

#### Request headers

| Parameter | Description                       |
| :-------- | :-------------------------------- |
| `Authorization`      | **Required**. ```Bearer {channel access token}``` |
## Used By

該項目被以下公司使用：

- [伊緹髮藝](https://goo.gl/maps/vcTijgW6o3vjnmYh8)

  
## Authors

- [@Hao](https://github.com/qqharry21) - Harry Chen

  