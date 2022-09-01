python=python3
venv_path=venv
platforms_dir=platforms

pip=pip3

all: install start

install:
	@echo "[!] Starting installation ..."

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
	@echo "[!] Activating venv ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	
	@echo "[!] Starting server ..."
	@. $(venv_path)/bin/activate && (\
		$(python) server.py; \
	)

start_dev:
	@echo "[!] Activating venv ..."
	@test -d $(venv_path) || $(python) -m venv $(venv_path)
	
	@echo "[!] Starting server ..."
	@. $(venv_path)/bin/activate && (\
		FLASK_ENV=development $(python) server.py --logs=debug; \
	)
