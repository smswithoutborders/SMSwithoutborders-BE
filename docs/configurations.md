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
sudo apt install python3-dev libmysqlclient-dev
sudo apt-get install libapache2-mod-wsgi-py3
```

Install `GNU Make`

```bash
sudo apt install make
```

If using apache2 wsgi on Ubuntu

```bash
sudo apt-get install libapache2-mod-wsgi-py3
```

## Installation

Install all python packages for SMSWITHOUTBORDERS-BE and SMSWITHOUTBORDERS-Custom-Platforms

```bash
make install
```

## Setup

All configuration files are found in the **[configs](../configs)** directory.

### configuration file

To set up Database and API, copy the template files "example.default.ini" and rename to "default.ini"

```bash
cp configs/example.default.ini configs/default.ini
```

### Configuration Options

Manages access to the SMS without borders centralize resources and services.

**DATABASE**

1. **MYSQL_HOST**: The hostname of the database you are connecting to. (Default: localhost)
2. **MYSQL_USER**: The MySQL user to authenticate as. (Default: root)
3. **MYSQL_PASSWORD**: The password of that MySQL user.
4. **MYSQL_DATABASE**: Name of the database to use for this connection (Default: smswithoutborders)

**API**

1. **PORT**: The port number to connect to. (Default: 9000)
2. **PUBLISHER PORT**: The port number to connect to. (Default: 10000)
3. **KEY**: The key used to encrypt a user's data. (Default: "de4053831a43d62d9e68fc11319270a9")
4. **SALT**: The salt used to hash a user's data. (Default: "acaad78fd9dadcb056840c09073190a8")
5. **SECURE COOKIE**: Specifies the boolean value for the [Secure Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). When truthy, the Secure attribute is set, otherwise it is not. By default, the Secure sessions attribute is set to truthy.
6. **COOKIE MAXAGE**: Specifies the number (in milliseconds) to use when calculating the [Expires Set-Cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, maximum age is set for two hours (7200000 ms).
7. **ENABLE BLOCKING**: Specifies the boolean value for tracking user failed [authentication](FEATURES_v2.md#2-authenticate-an-account) attempts.
8. **SHORT BLOCK ATTEMPTS**: Specifies the number of failed [authentication](FEATURES_v2.md#2-authenticate-an-account) attempts before a short block. Several short blocks results to a long block.
9. **LONG BLOCK ATTEMPTS**: Specifies the number of failed short block attempts before a long block.
10. **SHORT BLOCK DURATION**: Specifies the duration (in minutes) of a short block.
11. **LONG BLOCK DURATION**: Specifies the duration (in minutes) of a long block.

**OTP**

A user has four attempts to request an OTP code daily

1. **ENABLE_OTP_BLOCKING**: Specifies the boolean value for switching on/off tracking OTP code requests.
2. **FIRST RESEND DURATION**: Specifies the duration (in milliseconds) for the first OTP request.
3. **SECOND RESEND DURATION**: Specifies the duration (in milliseconds) for the second OTP request.
4. **THIRD RESEND DURATION**: Specifies the duration (in milliseconds) for the third OTP request.
5. **FOURTH RESEND DURATION**: Specifies the duration (in milliseconds) for the fourth OTP request.

**SSL API**

1. **PORT**: The port number to connect to.
2. **CERTIFICATE**: Path to your SSL Certificate.
3. **KEY**: Path to your SSL Key.
4. **PEM**: Path to your SSL PEM.

## How to use

### Start Backend User management API

```bash
make start
```

### Start Backend Publisher API

Move into Virtual Environments workspace

```
. venv/bin/activate
```

```bash
python3 server_pub.py
```

### logger

```bash
python3 server.py --logs=debug
```
