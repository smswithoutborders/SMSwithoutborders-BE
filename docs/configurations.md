# Configurations

## Table of contents

1. [Requirements](#requirements)
2. [Dependencies](#dependencies)
3. [Installation](#installation)
4. [Setup](#setup)
5. [Configuration Options](#Configuration-Options)
6. [How to use](#how-to-use)

## Requirements

- [MySQL](https://www.mysql.com/) (version >= 8.0.28) ([MariaDB](https://mariadb.org/))
- [Python](https://www.python.org/) (version >= [3.8.10](https://www.python.org/downloads/release/python-3810/))
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

## Dependencies

On Ubuntu **libmysqlclient-dev** is required

```bash
$ sudo apt install python3-dev libmysqlclient-dev
$ sudo apt-get install libapache2-mod-wsgi-py3
```

Install `GNU Make`

```bash
$ sudo apt install make
```

If using apache2 wsgi on Ubuntu

```bash
$ sudo apt-get install libapache2-mod-wsgi-py3
```

## Linux Environment Variables

Variables used for the Project:

- MYSQL_HOST=STRING
- MYSQL_USER=STRING
- MYSQL_PASSWORD=STRING
- MYSQL_DATABASE=STRING
- HOST=STRING
- PORT=STRING
- ORIGINS=ARRAY
- PLATFORMS_PATH=STRING
- TWILIO_ACCOUNT_SID=STRING
- TWILIO_AUTH_TOKEN=STRING
- TWILIO_SERVICE_SID=STRING
- ENABLE_RECAPTCHA=BOOLEAN
- RECAPTCHA_SECRET_KEY=STRING

## Installation

Install all python packages for SMSWITHOUTBORDERS-BE and SMSWITHOUTBORDERS-Custom-Platforms

```bash
$ MYSQL_HOST= MYSQL_USER= MYSQL_PASSWORD= MYSQL_DATABASE= PLATFORMS_PATH= make install
```

## Setup

All configuration files are found in the **[configs](../configs)** directory.

### configure keys

Set shared-key and hashing-salt in database

> Note: If no keys are set, the API creates a set of random keys when started for the first time.

```bash
$ make set-keys
```

Get shared-key and hashing-salt from database

```bash
$ make get-keys
```

### Inject dummy data

_For testing purposes only!_

- **Inject User**: This creates a new user with **_NO_** pre-stored grants.

```bash
$ make inject-user
```

details

```
- Database = dummySmswithoutborders
- User ID = dead3662-5f78-11ed-b8e7-6d06c3aaf3c6
- Password = testpassword
- Name = Test User
- Phone NUmber = +237123456789
```

### Configuration Options

Manages access to the SMS without borders centralize resources and services.

**API**

2. **SECURE COOKIE**: Specifies the boolean value for the [Secure Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). When truthy, the Secure attribute is set, otherwise it is not. By default, the Secure sessions attribute is set to truthy.
3. **COOKIE MAXAGE**: Specifies the number (in milliseconds) to use when calculating the [Expires Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, maximum age is set for two hours (7200000 ms).
4. **ENABLE BLOCKING**: Specifies the boolean value for tracking user failed [authentication](FEATURES_v2.md#2-authenticate-an-account) attempts.
5. **SHORT BLOCK ATTEMPTS**: Specifies the number of failed [authentication](FEATURES_v2.md#2-authenticate-an-account) attempts before a short block. Several short blocks results to a long block.
6. **LONG BLOCK ATTEMPTS**: Specifies the number of failed short block attempts before a long block.
7. **SHORT BLOCK DURATION**: Specifies the duration (in minutes) of a short block.
8. **LONG BLOCK DURATION**: Specifies the duration (in minutes) of a long block.

**OTP**

A user has four attempts to request an OTP code daily

1. **ENABLE_OTP_BLOCKING**: Specifies the boolean value for switching on/off tracking OTP code requests.
2. **FIRST RESEND DURATION**: Specifies the duration (in milliseconds) for the first OTP request.
3. **SECOND RESEND DURATION**: Specifies the duration (in milliseconds) for the second OTP request.
4. **THIRD RESEND DURATION**: Specifies the duration (in milliseconds) for the third OTP request.
5. **FOURTH RESEND DURATION**: Specifies the duration (in milliseconds) for the fourth OTP request.

## How to use

### Start Backend User management API

```bash
$ MYSQL_HOST= MYSQL_USER= MYSQL_PASSWORD= MYSQL_DATABASE= HOST= PORT= ORIGINS=[""] PLATFORMS_PATH= TWILIO_ACCOUNT_SID= TWILIO_AUTH_TOKEN= TWILIO_SERVICE_SID= ENABLE_RECAPTCHA= RECAPTCHA_SECRET_KEY= make start
```

## logger

```bash
$ python3 server.py --logs=debug
```

## References

- [SMSWithoutBorders-BE-Publisher](https://github.com/smswithoutborders/SMSWithoutBorders-BE-Publisher)
