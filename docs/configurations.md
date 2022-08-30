# Configurations

## Table of contents

1. [Requirements](#requirements)
2. [Dependencies](#dependencies)
3. [Installation](#installation)
4. [Setup](#setup)
5. [How to use](#how-to-use)

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

## How to use

### Start API

```bash
make start
```
