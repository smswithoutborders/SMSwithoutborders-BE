python=python3
venv_path=venv
platforms_dir=platforms

pip=pip3

create_templates:
	@echo "[!] Starting installation ..."

install: create_templates
	@$(python) -m venv $(venv_path)
	@( \
		. $(venv_path)/bin/activate; \
		$(pip) install -r requirements.txt; \
		wget -P $(platforms_dir)/gmail https://raw.githubusercontent.com/smswithoutborders/SMSwithoutBorders-customplatform-Gmail/master/requirements.txt; \
		$(pip) install -r $(platforms_dir)/gmail/requirements.txt; \
		rm -rf $(platforms_dir)/gmail; \
		wget -P $(platforms_dir)/twitter https://raw.githubusercontent.com/smswithoutborders/SMSwithoutBorders-customplatform-Twitter/master/requirements.txt; \
		$(pip) install -r $(platforms_dir)/twitter/requirements.txt; \
		rm -rf $(platforms_dir)/twitter; \
		wget -P $(platforms_dir)/telegram https://raw.githubusercontent.com/smswithoutborders/SMSwithoutBorders-customplatform-Telegram/master/requirements.txt; \
		$(pip) install -r $(platforms_dir)/telegram/requirements.txt; \
		rm -rf $(platforms_dir)/telegram; \
	)
	@echo "[*] python requirements installation completed successfully"

