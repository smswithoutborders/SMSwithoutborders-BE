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

    __tools (./tools)__

    * To set up encryption credentials, copy the template file "example.credentials.json" and rename to "credentials.json"
### Start Server
* With NPM
```bash
npm start
```
* With Node
```bash
node server.js
```

### API SandBox
```
http://localhost:9000/api-docs
```

### Database tables
__Users table__

|      id     | phone_number | password | auth_key |
|:-----------:|:------------:|:--------:|:--------:|
| PRIMARY KEY |    STRING    |  STRING  |  STRING  |

__Providers table__

|      id     |                      name                   |                     platform                   |
|:-----------:|:-------------------------------------------:|:----------------------------------------------:|
| PRIMARY KEY | Name of Provider (google, twitter) [STRING] | Name of service consume from Provider [STRING] |

__Tokens table__

|      id     |       profile       |         token         |          userId         |          providerId         |       iv      |
|:-----------:|:-------------------:|:---------------------:|:-----------------------:|:---------------------------:|:-------------:|
| PRIMARY KEY | Users info [OBJECT] | Users tokens [OBJECT] | Users[id] [FOREIGN KEY] | Providers[id] [FOREIGN KEY] | Encryption IV |