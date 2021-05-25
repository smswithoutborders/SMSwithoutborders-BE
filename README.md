## SMSwithoutBorders OAuth-2.0-authentications/ Token/ User management-API

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
http://localhost:{PORT}/api-docs
```

### Database tables
__Users table__

|      id     | password | auth_key |
|:-----------:|:--------:|:--------:|
| PRIMARY KEY |  STRING  |  STRING  |

__UsersInfos table__

|      id     | phone_number |   name   |  userId  |
|:-----------:|:------------:|:--------:|:--------:|
| PRIMARY KEY |    STRING    |  STRING  |  STRING  |

__Providers table__

|      id     |                     name                   |                  
|:-----------:|:------------------------------------------:|
| PRIMARY KEY | Provider's name (google, twitter) [STRING] |

__Platforms table__

|      id     |       name      |       description      |   logo   |          providerId         |
|:-----------:|:---------------:|:----------------------:|:--------:|:---------------------------:|
| PRIMARY KEY | Platform's name | Platform's description | LOGO IMG | Providers[id] [FOREIGN KEY] |

__Tokens table__

|      id     |         profile        |           token          |            userId           |          providerId          |          platformId          |       iv      |
|:-----------:|:----------------------:|:------------------------:|:---------------------------:|:----------------------------:|:----------------------------:|:-------------:|
| PRIMARY KEY | Users info  [ OBJECT ] | Users tokens  [ OBJECT ] | Users [ id ]  [FOREIGN KEY] | Provider's[id] [FOREIGN KEY] | Platform's[id] [FOREIGN KEY] | Encryption IV |