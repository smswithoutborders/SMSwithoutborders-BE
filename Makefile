python=python3
venv_path=venv
dump_dir=utils/.db

pip=pip3

all: install start

install: setup-backend setup-third-party

setup-backend:
	@echo "[*] Fetching Backend requirements ..."

	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)

	@(\
		. $(venv_path)/bin/activate; \
		$(pip) install -r requirements.txt; \
	)	

	@echo ""
	@echo "[*] Successfully installed Backend requirements"
	@echo ""

setup-third-party:
	@echo "[*] Fetching Third-Party Platforms requirements ..."

	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	@echo ""

	@. $(venv_path)/bin/activate && (\
		for f in $(shell ls ${PLATFORMS_PATH}); do \
			echo "[*] Fetching ${PLATFORMS_PATH}/$${f}/requirements.txt requirements ..."; \
			echo ""; \
			test -f ${PLATFORMS_PATH}/$${f}/requirements.txt && $(pip) install -r ${PLATFORMS_PATH}/$${f}/requirements.txt \
			&& echo "" && echo "[*] successfully installed ${PLATFORMS_PATH}/$${f}/requirements.txt"; \
			test -f ${PLATFORMS_PATH}/$${f}/*.svg && echo "" && echo "[*] Copying logo ..." && cp ${PLATFORMS_PATH}/$${f}/*.svg ./logos \
			&& echo "[*] successfully copied logo ${PLATFORMS_PATH}/$${f}/*.svg"; \
			echo ""; \
		done \
	)

	@echo "[*] Successfully installed Third-Party Platforms requirements"

start:
	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	@echo "[*] Starting server ..."
	@echo ""
	@. $(venv_path)/bin/activate && (\
		MYSQL_HOST=${MYSQL_HOST} \
		MYSQL_USER=${MYSQL_USER} \
		MYSQL_PASSWORD=${MYSQL_PASSWORD} \
		MYSQL_DATABASE=${MYSQL_DATABASE} \
		HOST=${HOST} \
		PORT=${PORT} \
		ORIGINS=${ORIGINS} \
		PLATFORMS_PATH=${PLATFORMS_PATH} \
		TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID} \
		TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN} \
		TWILIO_SERVICE_SID=${TWILIO_SERVICE_SID} \
		ENABLE_RECAPTCHA=${ENABLE_RECAPTCHA} \
		RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY} \
		$(python) server.py; \
	)

start-dev-env:
	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	
	@echo "[*] Starting server ..."
	@. $(venv_path)/bin/activate && (\
		FLASK_ENV=development $(python) server.py --logs=debug; \
	)

set-keys:
	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	
	@echo "[!] Login to database engine."
	@echo ""
	@echo "Press [Enter] to use default value."
	@echo ""
	@. $(venv_path)/bin/activate && (\
		$(python) configurationHelper.py --setkeys; \
	)
	@echo "[*] Success!."

get-keys:
	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	
	@echo "[!] Login to database engine."
	@echo ""
	@echo "Press [Enter] to use default value."
	@echo ""
	@. $(venv_path)/bin/activate && (\
		$(python) configurationHelper.py --getkeys; \
	)

inject-user:
	@echo "[*] Injecting dummy data ..."
	@echo ""
	@echo "[!] Login to database engine."
	@mysql -u root -p < $(dump_dir)/inject_user_dump.sql;
	@echo ""
	@echo "- Database = dummySmswithoutborders"
	@echo "- User ID = dead3662-5f78-11ed-b8e7-6d06c3aaf3c6"
	@echo "- Password = testpassword"
	@echo "- Name = Test User"
	@echo "- Phone NUmber = +237123456789"
	@echo ""
	@echo "[*] Success!"

migrate:
	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	
	@echo "[*] Starting migration ..."
	@. $(venv_path)/bin/activate && (\
		$(python) migrationHelper.py; \
	)
	@echo ""
	@echo "[*] Success!"
