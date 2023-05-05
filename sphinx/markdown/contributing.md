# Contributing Guide

When contributing to this repository, please first discuss the change you wish to make at [Issues](https://github.com/smswithoutborders/SMSwithoutborders-BE/issues).

## Development process

### Installation

#### Pre-requisites


* [MySQL](https://www.mysql.com/) (version >= 8.0.28) ([MariaDB](https://mariadb.org/))


* [Python](https://www.python.org/) (version >= [3.8.10](https://www.python.org/downloads/release/python-3810/))


* [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

```console
$ sudo apt update
```

```console
$ sudo apt install python3-dev libmysqlclient-dev apache2 apache2-dev make libapache2-mod-wsgi-py3
```

For this project, there are 3 virtual environments


1. A virtual environment for the SMSWithoutBorders Backend Project, with requirements peculiar to the project


2. A virtual environment for the sphinx documentation generator with requirements peculiar to the doc generation


3. A hybrid virtual environment which spans the above mentioned environment with combined requirements.
You should use this third environment because sphinx sandboxes the modules, and as such, you’ll need the project to be running as though the server was up.

#### Create the Virtual environment

```console
$ pip install virtualenv
```

```console
$ virtualenv swob-and-sphinx-venv
```

#### Activate the Virtual environment

```console
$ source swob-and-sphinx-venv/bin/activate
```

#### Setup Requirements

##### Linux Environtment Variables

Variables needed to run the project:


* MYSQL_HOST=STRING


* MYSQL_USER=STRING


* MYSQL_PASSWORD=STRING


* MYSQL_DATABASE=STRING

They don’t need to be production variables, just anything valid enough to run the scripts without errors. The dummy example below will suffice.

Alternatively, you can save these variables in sphinx/.env, which will automatically be loaded at runtime. Using a dummy example:


* **Start MySQL Server:**
```console
(swob-and-sphinx-venv) $ sudo service mysql start
```


* **Create database and user**
```console
(swob-and-sphinx-venv) $ sudo mysql -u root < sphinx/setup.sql
```


* **Load env variables**
```console
(swob-and-sphinx-venv) $ pip install python-dotenv
```

```console
(swob-and-sphinx-venv) $ echo "MYSQL_HOST=localhost\nMYSQL_USER=swob-user\nMYSQL_PASSWORD=swob-password\nMYSQL_DATABASE=swob-database" > sphinx/.env
```


* **Install Dependencies**
```console
(swob-and-sphinx-venv) $ pip install -r requirements.txt && pip install -r sphinx/requirements.txt
```

Sphinx sandboxes the models and run them as modules to extract the docstrings. For that reason, we need to run the doc generator as though we are starting the server, but with few environment variables.
Essentially, we need just the database running, to avoid import and connection errors during sandboxing.

#### Extracting Docs

In sphinx/Makefile are some make commands for common commands.

**WARNING**: Make sure that the environment variable are available and MySQL server running, or else the docs for any module that utilizes the database won’t be extracted

**To extract the docs:**
```console
(swob-and-sphinx-venv) $ cd sphinx
```

```console
(swob-and-sphinx-venv) $ make extract-docs
```

By default, sphinx uses ***reStructured Text (.rst)***, but we convert those to modern ***Markdown (.md)***, for simplicity and ease of use.

**To run/view the generated docs:**
```console
(swob-and-sphinx-venv) $ make run
```

You can then make changes to the docs by editing or adding more docstrings for the source codes in the ***src*** folder, then re-extracting them to view changes.
