## SMSwithoutBorders OAuth-2.0-authentications/ Token/ User management-API

### Requirements
- MySQL (MariaDB)
- nodejs
- npm

### Installation

* Install all node packages
```
npm install
```

### Setup
* Create configuration file

    __root (./)__

    * To set up database and API, copy the template file "example.config.json" and rename to "config.json"
    * To set up platform credentials, copy the template file "example.credentials.json" and rename to "credentials.json"

### Start Production Server
* With NPM
```bash
npm run startProd
```
* With Node
```bash
node server.js
```
### Start Development Server
* With NPM
```bash
npm run startDev
```
* With Node
```bash
node serverDev.js
```
### Start both Production and Development Server
* With NPM
```bash
npm start
```
### API SandBox
```
http://localhost:{PORT}/v1/api-docs

http://localhost:{PORT}/v2/api-docs
```

### Database tables
__Users table__

|      id     | password | auth_key |
|:-----------:|:--------:|:--------:|
| PRIMARY KEY |  STRING  |  STRING  |

__UsersInfos table__

|      id     | phone_number |   name   |  userId  |  country_code  | full_phone_number | role | status |   iv   |
|:-----------:|:------------:|:--------:|:--------:|:--------------:|:-----------------:|:----:|:------:|:------:|
| PRIMARY KEY |    STRING    |  STRING  |  STRING  |     STRING     |       STRING      | ENUM |  ENUM  | STRING |

__Platforms table__

|      id     |       name      |       type      |       description      |   logo   |  letter  |
|:-----------:|:---------------:|:---------------:|:----------------------:|:--------:|:--------:|
| PRIMARY KEY | Platform's name | Platform's type | Platform's description | LOGO IMG |  STRING  |

__Tokens table__

|      id     |        username        |           token          |            userId           |           uniqueId           |         uniqueIdHash         |          platformId          |       iv      |
|:-----------:|:----------------------:|:------------------------:|:---------------------------:|:----------------------------:|:----------------------------:|:----------------------------:|:-------------:|
| PRIMARY KEY |         STRING         | Users tokens  [ OBJECT ] | Users [ id ]  [FOREIGN KEY] |            STRING            |            STRING            | Platform's[id] [FOREIGN KEY] | Encryption IV |

__SmsVerification table__

|  svid  |  code  | auth_key | session_id | userId |
|:------:|:------:|:--------:|:----------:|:------:|
| STRING | STRING |  STRING  |   STRING   | STRING |
