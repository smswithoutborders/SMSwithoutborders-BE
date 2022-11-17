python=python3
dump_dir=utils/.db

all: install start

start:
	@(\
		if [ "$(shell echo ${MODE} | tr '[:upper:]' '[:lower:]')" = "production" ] && [ "${SSL_CERTIFICATE}" != "" ] && [ "${SSL_KEY}" != "" ] && [ "${SSL_PEM}" != "" ]; then \
			echo "[*] Starting Production server ..."; \
			mod_wsgi-express start-server wsgi_script.py --user www-data --group www-data --port ${PORT} --ssl-certificate-file ${SSL_CERTIFICATE} --ssl-certificate-key-file ${SSL_KEY} --ssl-certificate-chain-file ${SSL_PEM} --https-only --server-name ${SSL_SERVER_NAME} --https-port ${SSL_PORT}; \
		else \
			echo "[*] Starting Development server ..." && \
			mod_wsgi-express start-server wsgi_script.py --user www-data --group www-data --port ${PORT}; \
		fi \
	)

set-keys:
	@echo "[!] Login to database engine."
	@echo ""
	@echo "Press [Enter] to use default value."
	@echo ""
	@$(python) configurationHelper.py --setkeys
	@echo "[*] Success!."

get-keys:
	@echo "[!] Login to database engine."
	@echo ""
	@echo "Press [Enter] to use default value."
	@echo ""
	@$(python) configurationHelper.py --getkeys

migrate:
	@echo "[*] Starting migration ..."
	@$(python) migrationHelper.py
	@echo ""
	@echo "[*] Success!"
