.PHONY: get-docs convert-rst remove-rst extract-docs run

get-docs:
	@echo "Extracting docs from code docstring beginning ...\n"
	sphinx-apidoc -o docs/source ../src/
	@echo "Successfully extracted docs from code docstring\n"

convert-rst:
	@echo "Converting rst files to md\n"
	rst2myst convert docs/**/*.rst
	@echo "Successfully converted rst files to md\n"

remove-rst:
	@echo "Removing generated rst files\n"
	rm -r docs/source/*.rst
	@echo "Successfully removed generated rst files\n"

extract-docs: get-docs convert-rst remove-rst
	@echo "Successfully extracted documentation \n"

run:
	sphinx-autobuild docs/source docs/build/html