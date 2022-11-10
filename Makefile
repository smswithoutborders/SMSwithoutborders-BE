python=python3
venv_path=venv
platforms_dir=platforms
dump_dir=utils/.db

pip=pip3

all: install start

install:
	@echo "[*] Starting installation ..."

	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	@( \
		. $(venv_path)/bin/activate; \
		$(pip) install -r requirements.txt; \
		wget -P $(platforms_dir)/gmail https://raw.githubusercontent.com/smswithoutborders/SMSwithoutBorders-customplatform-Gmail/dev/requirements.txt; \
		$(pip) install -r $(platforms_dir)/gmail/requirements.txt; \
		rm -rf $(platforms_dir)/gmail; \
		wget -P $(platforms_dir)/twitter https://raw.githubusercontent.com/smswithoutborders/SMSwithoutBorders-customplatform-Twitter/dev/requirements.txt; \
		$(pip) install -r $(platforms_dir)/twitter/requirements.txt; \
		rm -rf $(platforms_dir)/twitter; \
		wget -P $(platforms_dir)/telegram https://raw.githubusercontent.com/smswithoutborders/SMSwithoutBorders-customplatform-Telegram/dev/requirements.txt; \
		$(pip) install -r $(platforms_dir)/telegram/requirements.txt; \
		rm -rf $(platforms_dir)/telegram; \
		wget -P $(platforms_dir)/slack https://raw.githubusercontent.com/smswithoutborders/SMSwithoutBorders-customplatform-Slack/dev/requirements.txt; \
		$(pip) install -r $(platforms_dir)/slack/requirements.txt; \
		rm -rf $(platforms_dir)/slack; \
	)
	@echo "[*] python requirements installation completed successfully"

start:
	@echo "[*] Activating virtual environment ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	
	@echo "[*] Starting server ..."
	@. $(venv_path)/bin/activate && (\
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
	@test -d $(venv_path) || $(python) -m venv $(venv_path)

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
	@test -d $(venv_path) || $(python) -m venv $(venv_path)

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
	@echo "Injecting dummy data ..."
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