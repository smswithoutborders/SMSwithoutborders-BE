# syntax=docker/dockerfile:1

FROM python:3.9 as base
WORKDIR /smswithoutborders-backend

RUN apt-get update
RUN apt-get install build-essential python3-dev default-libmysqlclient-dev -y

COPY . .

RUN pip install -r requirements.txt

FROM base as production
CMD echo "[*] Starting Production server ..." && \
    make dummy-user-inject && \
    MODE=production mod_wsgi-express start-server wsgi_script.py --user www-data --group www-data --port '${PORT}' --ssl-certificate-file '${SSL_CERTIFICATE}' --ssl-certificate-key-file '${SSL_KEY}' --ssl-certificate-chain-file '${SSL_PEM}' --https-only --server-name '${SSL_SERVER_NAME}' --https-port '${SSL_PORT}'

FROM base as development
CMD echo "[*] Starting Development server ..." && \
    make dummy-user-inject && \
    mod_wsgi-express start-server wsgi_script.py --user www-data --group www-data --port '${PORT}'