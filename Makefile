python=python3

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

dummy-user-inject:
	@echo "[*] Injecting dummy user ..."
	@$(python) injectDummyData.py --user
	@echo ""
	@echo "- User ID = dead3662-5f78-11ed-b8e7-6d06c3aaf3c6"
	@echo "- Password = dummy_password"
	@echo "- Name = dummy_user"
	@echo "- Phone NUmber = +237123456789"""
	@echo ""
	@echo "[*] Success!"