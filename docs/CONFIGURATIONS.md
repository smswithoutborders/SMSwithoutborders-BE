# Configurations

## Table of contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Setup](#setup)
    1. [Development environment configurations](#development-environment-configurations)
    2. [Production environment configurations](#production-environment-configurations)
    3. [Options](#options)
        1. [Secure Sessions](#Secure-Sessions)
        2. [Session Max Age](#Session-Max-Age)
4. [Running](#running)
    1. [Start Backend User management API](#Start-Backend-User-management-API)
        1. [Development Environment](#User-management-Development-Environment)
        2. [Production Environment](#User-management-Production-Environment)
    2. [Start Backend Publisher API](#Start-Backend-Publisher-API)
        1. [Development Environment](#Publisher-Development-Environment)
        2. [Production Environment](#Publisher-Production-Environment)
    3. [Start both Backend User management API and Backend Publisher API](#Start-both-Backend-User-management-API-and-Backend-Publisher-API)
        1. [Development Environment](#Development-Environment)
        2. [Production Environment](#Production-Environment)
5. [API SandBox](#API-SandBox)
6. [Database tables](#Database-tables)


## Requirements
- MySQL (MariaDB)
- nodejs
- npm

## Installation
All runtime dependencies are installed using npm 
```
npm install
```
## Setup
All configuration files are found in the **[config](../config)** directory.
Configuration files are named according to their **[environment variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables)**.

### Development environment configurations
**[default.json](../config/example.default.json)** is the configuration file for a development environment.

To set up Database, API, and platform credentials for a development environment, copy the template files "example.default.json" and rename to "default.json"

```
cp example.default.json default.json
```

### Production environment configurations
**[production.json](../config/example.production.json)** is the configuration file for a production environment.

To set up Database, API, and platform credentials for a productoin environment, copy the template files "example.production.json" and rename to "production.json"

### Options 
#### Secure Sessions
Specifies the boolean value for the [Secure Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). When truthy, the Secure attribute is set, otherwise it is not. By default, the Secure sessions attribute is set to truthy.

#### Session Max Age
Specifies the number (in milliseconds) to use when calculating the [Expires Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, maximum age is set for two hours (2 * 60 * 60 * 1000).
## Running
### Start Backend User management API
#### User management Development Environment
* With NPM
```bash
npm run start_main
```
* With Node
```bash
node controllers/sync_platforms.js && node server.js
```

#### User management Production Environment
* With NPM
```bash
NODE_ENV=production npm run start_main
```
* With Node
```bash
NODE_ENV=production node controllers/sync_platforms.js && node server.js
```
### Start Backend Publisher API
#### Publisher Development Environment
* With NPM
```bash
npm run start_pub
```
* With Node
```bash
node controllers/sync_platforms.js && node server_pub.js
```
#### Publisher Production Environment
* With NPM
```bash
NODE_ENV=production npm run start_pub
```
* With Node
```bash
NODE_ENV=production node controllers/sync_platforms.js && node server_pub.js
```
### Start both Backend User management API and Backend Publisher API
#### Development Environment
* With NPM
```bash
npm run start
```

#### Production Environment
* With NPM
```bash
NODE_ENV=production npm start
```
## API SandBox
```
http://localhost:{PORT}/v1/api-docs

http://localhost:{PORT}/v2/api-docs
```

## Database tables
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
