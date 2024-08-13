python=python3
SUPPORTED_PLATFORMS_URL="https://raw.githubusercontent.com/smswithoutborders/SMSWithoutBorders-Publisher/feature/grpc-api/resources/platforms.json"

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

grpc-server-start:
	$(call log_message,INFO - Starting gRPC server ...)
	@$(python) -u grpc_server.py
	$(call log_message,INFO - gRPC server started successfully.)

grpc-internal-server-start:
	$(call log_message,INFO - Starting gRPC internal server ...)
	@$(python) -u grpc_internal_server.py
	$(call log_message,INFO - gRPC internal server started successfully.)

download-platforms:
	$(call log_message,INFO - Starting download of platforms JSON file ...)
	@curl -o platforms.json -L "${SUPPORTED_PLATFORMS_URL}"
	$(call log_message,INFO - Platforms JSON file downloaded successfully.)

create-dummy-user:
	$(call log_message,INFO - Creating dummy user ...)
	@$(python) -m scripts.cli create -n +237123456789
	@echo ""
	$(call log_message,INFO - Dummy user created successfully.)

rest-server-setup: dummy-user-inject start
	$(call log_message,INFO - REST server setup completed.)

grpc-server-setup: create-dummy-user download-platforms grpc-compile grpc-server-start
	$(call log_message,INFO - gRPC server setup completed.)
