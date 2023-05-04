# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

from pathlib import Path
from dotenv import load_dotenv
import sys
import os
project = 'swob-backend-docs'
copyright = '2023, Mofor Emmanuel'
author = 'Mofor Emmanuel'
release = '1.0.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

# add src folder
# sys.path.insert(0, os.path.relpath('../../../src/'))

# Add the parent directory of "src" to the Python path
# sys.path.insert(0, os.path.abspath('../..'))
sys.path.insert(0, os.path.abspath('../../..'))

# Path to the module you want to document
sys.path.insert(0, os.path.abspath('../../../src'))
# sys.path.insert(0, os.path.abspath('../../../src/models'))

# include private modules
sys.path.insert(0, os.path.abspath('../../../src/models/_2FA.py'))

# env files needed for swob

dotenv_path = Path('../../.env')
load_dotenv(dotenv_path=dotenv_path)

extensions = [
    "myst_parser",
    "sphinx.ext.duration",  # show build time
    # generate targets for every subheading in every document
    "sphinx.ext.autosectionlabel",
    "sphinx.ext.autodoc",  # auto gen docs from code
    "sphinx.ext.napoleon",  # for other docstring formats
    "sphinx.ext.viewcode",
    "sphinx.ext.autosummary",  # doc of all code
]

# attempt  to showing __init__ docs
# autodoc_default_options = {
#     'members': True,
#     'member-order': 'bysource',
#     'special-members': '__init__',
#     'undoc-members': True,
#     'exclude-members': '__weakref__'
# }

autodoc_default_options = {
    "members": True,  # include class members
    "member-order": "bysource",
    "special-members": "__init__",
    "undoc-members": True,
    # "private-members": True,
    "exclude-members": "__weakref__",
    # "inherited-members": True,
    "show-inheritance": True,
    # "imported-members": False,
    "ignore-module-all": False,
    # "exclude-protected": False,
    "exclude-private": False,
}

html_theme_options = {
    'collapse_navigation': False  # always show full TOC (toctree)
}

templates_path = ['_templates']
exclude_patterns = ['']


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# html_theme = 'cloud'
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
# html_logo = 'https://github.com/smswithoutborders/SMSWithoutBorders-Resources/raw/master/multimedia/img/swob_logo_icon.png'

# html_js_files = ['custom.js']
