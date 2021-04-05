## SMSwithoutBorders OAuth-2.0-authentications/ Token/ User management-API

### Installation

* Install all node packages
```
npm install
```

### Setup
* Create configuration file
    * To set up database and API, use the template in "example.config.json" file and rename to "config.json"
    * To set up platform credentials, use the template in "example.credentials.json" file and rename to "credentials.json"
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

__Oauth2s table__

|              profileId             |       profile       | accessToken | refreshToken | scope | expiry_date |          userId         |          providerId         |
|:----------------------------------:|:-------------------:|:-----------:|--------------|-------|:-----------:|:-----------------------:|:---------------------------:|
| Providers Profile ID [PRIMARY KEY] | Users info [OBJECT] |    STRING   |    STRING    | ARRAY | DATE STRING | Users[id] [FOREIGN KEY] | Providers[id] [FOREIGN KEY] |