.PHONY: get-docs convert-rst remove-rst extract-docs run

get-docs:
	@echo -e "Extracting docs from code docstring beginning ...\n"
	sphinx-apidoc -o docs/source ../src/
	@echo -e "Successfully extracted docs from code docstring\n"

convert-rst:
	@echo -e "Converting rst files to md\n"
	rst2myst convert docs/**/*.rst
	@echo -e "Successfully converted rst files to md\n"

remove-rst:
	@echo -e "Removing generated rst files\n"
	rm -r docs/source/*.rst
	@echo -e "Successfully removed generated rst files\n"

extract-docs: get-docs convert-rst remove-rst
	@echo -e "Successfully extracted documentation \n"

run:
	sphinx-autobuild docs/source docs/build/html