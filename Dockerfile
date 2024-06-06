FROM python:3.9 as base

RUN apt-get update && \
    apt-get install -y build-essential \
    apache2 apache2-dev \
    python3-dev \
    default-libmysqlclient-dev \
    supervisor && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /smswithoutborders-backend

COPY . .
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN pip install -U pip && \
    pip install --no-cache-dir wheel && \
    pip install --no-cache-dir --force-reinstall -r requirements.txt && \
    usermod -u 1000 www-data && \
    usermod -G root www-data

FROM base as development
CMD echo "[*] Starting Development server ..." && \
    make dummy-user-inject && \
    mod_wsgi-express start-server wsgi_script.py \
    --user www-data \
    --group www-data \
    --port '${PORT}' \
    --log-to-terminal

FROM base as production
ENV MODE=production
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]