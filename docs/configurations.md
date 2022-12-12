# Configurations

## Table of contents

1. [Requirements](#requirements)
2. [Dependencies](#dependencies)
3. [Installation](#installation)
4. [Configuration Options](#Configuration-Options)
5. [How to use](#how-to-use)
6. [Docker](#docker)
7. [Logger](#logger)
8. [References](#references)

## Requirements

- [MySQL](https://www.mysql.com/) (version >= 8.0.28) ([MariaDB](https://mariadb.org/))
- [Python](https://www.python.org/) (version >= [3.8.10](https://www.python.org/downloads/release/python-3810/))
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

## Dependencies

On Ubuntu

```bash
$ sudo apt install python3-dev libmysqlclient-dev apache2 apache2-dev make libapache2-mod-wsgi-py3
```

## Linux Environment Variables

Variables used for the Project:

- MYSQL_HOST=STRING
- MYSQL_USER=STRING
- MYSQL_PASSWORD=STRING
- MYSQL_DATABASE=STRING
- SHARED_KEY=PATH
- HASHING_SALT=PATH
- HOST=STRING
- PORT=STRING
- SSL_SERVER_NAME=STRING
- SSL_PORT=STRING
- SSL_CERTIFICATE=PATH
- SSL_KEY=PATH
- SSL_PEM=PATH
- ORIGINS=ARRAY
- PLATFORMS_PATH=STRING
- TWILIO_ACCOUNT_SID=STRING
- TWILIO_AUTH_TOKEN=STRING
- TWILIO_SERVICE_SID=STRING
- ENABLE_RECAPTCHA=BOOLEAN
- RECAPTCHA_SECRET_KEY=STRING
- MODE=STRING

## Installation

Install all python packages for SMSWITHOUTBORDERS-BE

### Pip

```bash
$ python3 -m venv venv
$ . venv/bin/activate
$ pip install -r requirements.txt
```

### Set Keys

Configure shared-key and hashing-salt

```bash
$ MYSQL_HOST= \
  MYSQL_USER= \
  MYSQL_PASSWORD= \
  MYSQL_DATABASE= \
  make set-keys
```

If running the smswithoutborders-backend docker image use

```bash
$ docker exec -it smswithoutborders-backend make set-keys
```

> See current shared-key and hashing-salt with the `make get-keys command`

### Keys file format

- Use the SHARED_KEY and HASHING_SALT environment variables to point to your key files.
- Key should be on first line in your key files.
- Key files should end with the suffix `.key`

> NOTE: SHARED_KEY and HASHING_SALT environment variables must be provided else defaults will be used.

### Inject dummy data

_For testing purposes only!_

- Fill in all the neccessary [environment variables](#linux-environment-variables)

```bash
$ MYSQL_HOST= MYSQL_USER= MYSQL_PASSWORD= make dummy-user-inject
```

If running the smswithoutborders-backend docker image use

```bash
$ docker exec -it smswithoutborders-backend make dummy-user-inject
```

details

```
- User ID = dead3662-5f78-11ed-b8e7-6d06c3aaf3c6
- Password = dummy_password
- Name = dummy_user
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

### Start Backend API

**Python**

```bash
$ MYSQL_HOST= \
  MYSQL_USER= \
  MYSQL_PASSWORD= \
  MYSQL_DATABASE= \
  HOST= \
  PORT= \
  SSL_SERVER_NAME= \
  SSL_PORT= \
  SSL_CERTIFICATE= \
  SSL_KEY= \
  SSL_PEM= \
  ORIGINS=[""] \
  TWILIO_ACCOUNT_SID= \
  TWILIO_AUTH_TOKEN= \
  TWILIO_SERVICE_SID= \
  ENABLE_RECAPTCHA= \
  RECAPTCHA_SECRET_KEY= \
  MODE=production \
  python3 server.py
```

**MOD_WSGI**

```bash
$ MYSQL_HOST= \
  MYSQL_USER= \
  MYSQL_PASSWORD= \
  MYSQL_DATABASE= \
  HOST= \
  PORT= \
  SSL_SERVER_NAME= \
  SSL_PORT= \
  SSL_CERTIFICATE= \
  SSL_KEY= \
  SSL_PEM= \
  ORIGINS=[""] \
  TWILIO_ACCOUNT_SID= \
  TWILIO_AUTH_TOKEN= \
  TWILIO_SERVICE_SID= \
  ENABLE_RECAPTCHA= \
  RECAPTCHA_SECRET_KEY= \
  MODE=production \
  mod_wsgi-express start-server wsgi_script.py \
  --user www-data \
  --group www-data \
  --port '${PORT}' \
  --ssl-certificate-file '${SSL_CERTIFICATE}' \
  --ssl-certificate-key-file '${SSL_KEY}' \
  --ssl-certificate-chain-file '${SSL_PEM}' \
  --https-only \
  --server-name '${SSL_SERVER_NAME}' \
  --https-port '${SSL_PORT}'
```

## Docker

### Build

Build smswithoutborders-backend development docker image

```bash
$ docker build --target development -t smswithoutborders-backend .
```

Build smswithoutborders-backend production docker image

```bash
$ docker build --target production -t smswithoutborders-backend .
```

### Run

Run smswithoutborders-backend development docker image. Fill in all the neccessary [environment variables](#linux-environment-variables)

```bash
$ docker run -d -p 9000:9000 \
  --name smswithoutborders-backend \
  --env 'MYSQL_HOST=' \
  --env 'MYSQL_USER=' \
  --env 'MYSQL_PASSWORD=' \
  --env 'MYSQL_DATABASE=' \
  --env 'HOST=' \
  --env 'PORT=' \
  --env 'ORIGINS=[""]' \
  --env 'TWILIO_ACCOUNT_SID=' \
  --env 'TWILIO_AUTH_TOKEN=' \
  --env 'TWILIO_SERVICE_SID=' \
  --env 'ENABLE_RECAPTCHA=' \
  --env 'RECAPTCHA_SECRET_KEY=' \
  smswithoutborders-backend
```

Run smswithoutborders-backend production docker image. Fill in all the neccessary [environment variables](#linux-environment-variables)

```bash
$ docker run -d -p 9000:9000 \
  --name smswithoutborders-backend \
  --env 'MYSQL_HOST=' \
  --env 'MYSQL_USER=' \
  --env 'MYSQL_PASSWORD=' \
  --env 'MYSQL_DATABASE=' \
  --env 'HOST=' \
  --env 'PORT=' \
  --env 'SSL_SERVER_NAME=' \
  --env 'SSL_PORT=' \
  --env 'SSL_CERTIFICATE=' \
  --env 'SSL_KEY=' \
  --env 'SSL_PEM=' \
  --env 'ORIGINS=[""]' \
  --env 'TWILIO_ACCOUNT_SID=' \
  --env 'TWILIO_AUTH_TOKEN=' \
  --env 'TWILIO_SERVICE_SID=' \
  --env 'ENABLE_RECAPTCHA=' \
  --env 'RECAPTCHA_SECRET_KEY=' \
  --env 'MODE=production' \
  smswithoutborders-backend
```

> Read in a file of environment variables with `--env-file` command e.g. `docker run -d -p 9000:9000 --name smswithoutborders-backend --env-file myenv.txt smswithoutborders-backend`

> Mount path to SSL files with volume `-v` command e.g. `docker run -v /host/path/to/certs:/container/path/to/certs -d -p 9000:9000 --name smswithoutborders-backend --env-file myenv.txt smswithoutborders-backend`

## logger

### Python

```bash
$ python3 server.py --logs=debug
```

### Docker

Container logs

```bash
$ docker logs smswithoutborders-backend
```

API logs in container

```bash
$ docker exec -it smswithoutborders-backend tail -f <path_to_mod_wsgi_error_logs>
```

## References

- [SMSWithoutBorders-BE-Publisher](https://github.com/smswithoutborders/SMSWithoutBorders-BE-Publisher)
- [MySQL Docker official image](https://hub.docker.com/_/mysql)
- [MariaDB Docker official image](https://hub.docker.com/_/mariadb)
