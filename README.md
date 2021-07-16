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
    * Create a database then edit config.json and fill in the name of the newly created database

* Create Providers using SWOB-CLI tool
    * Get SWOB-CLI: https://github.com/smswithoutborders/SMSwithoutborders_Dev_Tools/tree/master/SWOB_API_Tools/SWOB-CLI

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
http://localhost:{PORT}/api-docs
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

__Providers table__

|      id     |                     name                   |       description      |  letter  |                  
|:-----------:|:------------------------------------------:|:----------------------:|:--------:|
| PRIMARY KEY | Provider's name (google, twitter) [STRING] | Provider's description |  STRING  |

__Platforms table__

|      id     |       name      |       type      |       description      |   logo   |          providerId         |  letter  |
|:-----------:|:---------------:|:---------------:|:----------------------:|:--------:|:---------------------------:|:--------:|
| PRIMARY KEY | Platform's name | Platform's type | Platform's description | LOGO IMG | Providers[id] [FOREIGN KEY] |  STRING  |

__Tokens table__

|      id     |         profile        |           token          |            userId           |          providerId          |          platformId          |  email |       iv      |
|:-----------:|:----------------------:|:------------------------:|:---------------------------:|:----------------------------:|:----------------------------:|:------:|:-------------:|
| PRIMARY KEY | Users info  [ OBJECT ] | Users tokens  [ OBJECT ] | Users [ id ]  [FOREIGN KEY] | Provider's[id] [FOREIGN KEY] | Platform's[id] [FOREIGN KEY] | STRING | Encryption IV |

__SmsVerification table__

|  svid  |  code  | auth_key | session_id | userId |
|:------:|:------:|:--------:|:----------:|:------:|
| STRING | STRING |  STRING  |   STRING   | STRING |
