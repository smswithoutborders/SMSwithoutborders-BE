# syntax=docker/dockerfile:1

FROM python:3.9 as base
WORKDIR /smswithoutborders-backend

RUN apt-get update
RUN apt-get install build-essential apache2 apache2-dev python3-dev default-libmysqlclient-dev -y

COPY . .

RUN pip install --no-cache-dir wheel
RUN pip install --no-cache-dir --force-reinstall -r requirements.txt

RUN usermod -u 1000 www-data
RUN usermod -G root www-data

FROM base as production
CMD echo "[*] Starting Production server ..." && \
    make dummy-user-inject && \
    MODE=production mod_wsgi-express start-server wsgi_script.py --user www-data --group www-data --port '${PORT}' --ssl-certificate-file '${SSL_CERTIFICATE}' --ssl-certificate-key-file '${SSL_KEY}' --ssl-certificate-chain-file '${SSL_PEM}' --https-only --server-name '${SSL_SERVER_NAME}' --https-port '${SSL_PORT}' --log-to-terminal

FROM base as development
CMD echo "[*] Starting Development server ..." && \
    make dummy-user-inject && \
    mod_wsgi-express start-server wsgi_script.py --user www-data --group www-data --port '${PORT}' --log-to-terminal
