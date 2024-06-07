python=python3

define log_message
	@echo "[$(shell date +'%Y-%m-%d %H:%M:%S')] - $1"
endef

start:
	@(\
		if [ "$(shell echo ${MODE} | tr '[:upper:]' '[:lower:]')" = "production" ] && [ "${SSL_CERTIFICATE}" != "" ] && [ "${SSL_KEY}" != "" ] && [ "${SSL_PEM}" != "" ]; then \
			echo "[$(shell date +'%Y-%m-%d %H:%M:%S')] - INFO - Starting Production server ..." && \
			mod_wsgi-express start-server wsgi_script.py \
			--user www-data \
			--group www-data \
			--port '${PORT}' \
			--ssl-certificate-file '${SSL_CERTIFICATE}' \
			--ssl-certificate-key-file '${SSL_KEY}' \
			--ssl-certificate-chain-file '${SSL_PEM}' \
			--https-only \
			--server-name '${SSL_SERVER_NAME}' \
			--https-port '${SSL_PORT}' \
			--log-to-terminal; \
		else \
			echo "[$(shell date +'%Y-%m-%d %H:%M:%S')] - INFO - Starting Development server ..." && \
			mod_wsgi-express start-server wsgi_script.py --user www-data --group www-data --port ${PORT} --log-to-terminal; \
		fi \
	)

set-keys:
	$(call log_message,WARNING - Login to database engine.)
	@echo ""
	@echo "Press [Enter] to use default value."
	@echo ""
	@$(python) configurationHelper.py --setkeys
	$(call log_message,INFO - Keys set successfully.)

get-keys:
	$(call log_message,WARNING - Login to database engine.)
	@echo ""
	@echo "Press [Enter] to use default value."
	@echo ""
	@$(python) configurationHelper.py --getkeys

migrate:
	$(call log_message,INFO - Starting migration ...)
	@$(python) migrationHelper.py
	@echo ""
	$(call log_message,INFO - Migration completed successfully.)

dummy-user-inject:
	$(call log_message,INFO - Injecting dummy user ...)
	@$(python) injectDummyData.py --user
	@echo ""
	$(call log_message,INFO - Dummy user injected successfully.)

grpc-compile:
	$(call log_message,INFO - Compiling gRPC protos ...)
	@$(python) -m grpc_tools.protoc \
		-I./protos/v1 \
		--python_out=. \
		--pyi_out=. \
		--grpc_python_out=. \
		./protos/v1/*.proto
	$(call log_message,INFO - gRPC Compilation complete!)
