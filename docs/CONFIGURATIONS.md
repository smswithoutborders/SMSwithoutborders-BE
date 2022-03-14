# Configurations

## Table of contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Setup](#setup)
    1. [Development environment configurations](#development-environment-configurations)
    2. [Production environment configurations](#production-environment-configurations)
    3. [Configuration Options](#configuration-options)
        1. [Server](#sever)
        2. [Credentials](#credentials)
        3. [Recaptcha](#recaptcha)
        4. [Developer](#developer)
4. [How to use](#how-to-use)
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
6. [API logs](#api-logs)
7. [Database tables](#Database-tables)


## Requirements
- [MySQL](https://www.mysql.com/) (version >= 8.0.28) ([MariaDB](https://mariadb.org/))
- [nodejs](https://nodejs.org) (version >= [16.14.0](https://nodejs.org/dist/v16.14.0/node-v16.14.0-linux-x64.tar.xz))
- npm (version >= 8.3.1)

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

### Configuration Options 
These are the options for each **[configuration](../config)** file

#### SEVER
Manages access to the SMS without borders centralize resources and services.

__Database__

1. **HOST**: The hostname of the database you are connecting to. (Default: localhost)
2. **USER**: The MySQL user to authenticate as. (Default: root)
3. **PASSWORD**: The password of that MySQL user.
4. **DATABASE**: Name of the database to use for this connection (Default: smswithoutborders)

__API__

1. **USER MANAGEMENT API PORT**: The port number to connect to. (Default: 9000)
2. **PUBLISHER API PORT**: The port number to connect to. (Default: 10000)
3. **KEY**: The key used to encrypt a user's data. (Default: "de4053831a43d62d9e68fc11319270a9")
4. **SALT**: The salt used to hash a user's data. (Default: "acaad78fd9dadcb056840c09073190a8")
5. **SECURE SESSIONS**: Specifies the boolean value for the [Secure Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). When truthy, the Secure attribute is set, otherwise it is not. By default, the Secure sessions attribute is set to truthy.
6. **SESSION MAXAGE**: Specifies the number (in milliseconds) to use when calculating the [Expires Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, maximum age is set for two hours (2 * 60 * 60 * 1000).
7. **ENABLE BLOCKING**: Specifies the boolean value for tracking user failed [authentication](FEATURES_v2.md#2-authenticate-an-account) attempts.
8. **SHORT BLOCK ATTEMPTS**: Specifies the number of failed [authentication](FEATURES_v2.md#2-authenticate-an-account) attempts before a short block. Several short blocks results to a long block.
9. **LONG BLOCK ATTEMPTS**: Specifies the number of failed short block attempts before a long block.
10. **SHORT BLOCK DURATION**: Specifies the duration (in minutes) of a short block.
11. **LONG BLOCK DURATION**: Specifies the duration (in minutes) of a long block.

__OTP__

A user has four attempts to request an OTP code daily

1. **ENABLE_OTP_BLOCKING**: Specifies the boolean value for switching on/off tracking OTP code requests.
2. **FIRST RESEND DURATION**: Specifies the duration (in milliseconds) for the first OTP request.
3. **SECOND RESEND DURATION**: Specifies the duration (in milliseconds) for the second OTP request.
4. **THIRD RESEND DURATION**: Specifies the duration (in milliseconds) for the third OTP request.
5. **FOURTH RESEND DURATION**: Specifies the duration (in milliseconds) for the fourth OTP request.

__GATEWAY SERVER__

This is a use-case of the [SMSWithoutBorders-Gateway-Server](https://github.com/smswithoutborders/SMSWithoutBorders-Gateway-Server) project.

1. **URL**: The URL of the gateway server you are connecting to. (Default: localhost)
2. **PORT**: The port number to connect to. (Default: 6969)

__ORIGIN__

Configures the Access-Control-Allow-Origin CORS header. Possible values: 

Array - set origin to an array of valid origins. Each origin can be a String or a RegExp. For example ["http://example1.com", /\.example2\.com$/] will accept any request from "http://example1.com" or from a subdomain of "example2.com". (Default: "localhost:18000")

__SSL API__

1. **API PORT**: The port number to connect to.
2. **CERTIFICATE**: Path to your SSL Certificate.
3. **KEY**: Path to your SSL Key.
4. **PEM**: Path to your SSL PEM.

#### CREDENTIALS

__GOOGLE__

Acquire credentials from [Google Cloud Platform Console](https://console.cloud.google.com/)

1. **GOOGLE CLIENT ID**: Your Google Client ID
2. **GOOGLE CLIENT SECRET**: Your Google Client Secret

__TWITTER__

Acquire credentials from [Twitter Developers Portal](https://developer.twitter.com/en/docs/developer-portal/overview)

1. **TWITTER API KEY**: Your Twitter API key
2. **TWITTER API KEY SECRET**: Your Twitter API key Secret

__TELEGRAM__

This is a use-case of the [SMSWithoutBorders-customplatform-Telegram](https://github.com/smswithoutborders/SMSWithoutBorders-customplatform-Telegram) project.

1. **TELEGRAM REQUEST HOST**: The URL of the telegram custom platform server you are connecting to.

#### RECAPTCHA

Acquire KEY from [Google reCAPTCHA](https://developers.google.com/recaptcha)

1. **ENABLE RECAPTCHA**: Specifies the boolean value for switching on/off recaptcha.
2. **SECRET KEY**: Your Google reCAPTCHA Secret key

#### DEVELOPER
Manages access to the SMS without borders developers resources.

__Database__

1. **HOST**: The hostname of the database you are connecting to. (Default: localhost)
2. **USER**: The MySQL user to authenticate as. (Default: root)
3. **PASSWORD**: The password of that MySQL user.
4. **DATABASE**: Name of the database to use for this connection (Default: SWOBDevApi)

## How to use
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

## API Logs

By default [log levels](../logs/README.md#log-levels) are set to "info". You can change the default [log levels](../logs/README.md#log-levels). For example, [Start both Backend User management API and Backend Publisher API](#Start-both-Backend-User-management-API-and-Backend-Publisher-API) with [log levels](../logs/README.md#log-levels) set to "debug"  

```
LOG_LEVEL=debug npm start
```

All log files are found in the logs directory. [Read more](../logs/README.md) ...

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
