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

    __./config/__

    __Development Configurations__

    * To set up Database, API, and platform credentials, copy the template files "example.default.json" and rename to "default.json"

     __Production Configurations__

    * To set up Database, API, and platform credentials, copy the template files "example.production.json" and rename to "production.json"

### Start Cloud_API Server
__Development Environment__
* With NPM
```bash
npm run start_main
```
* With Node
```bash
node server.js
```

__Production Environment__
* With NPM
```bash
NODE_ENV=production npm run start_main
```
* With Node
```bash
NODE_ENV=production node server.js
```
### Start Publisher Server
__Development Environment__
* With NPM
```bash
npm run start_pub
```
* With Node
```bash
node server_pub.js
```

__Production Environment__
* With NPM
```bash
NODE_ENV=production npm run start_pub
```
* With Node
```bash
NODE_ENV=production node server_pub.js
```
### Start both Cloud_API and Publisher Servers
__Development Environment__
* With NPM
```bash
npm run start
```

__Production Environment__
* With NPM
```bash
NODE_ENV=production npm start
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
