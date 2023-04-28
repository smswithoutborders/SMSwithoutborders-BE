# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'swob-backend-docs'
copyright = '2023, Mofor Emmanuel'
author = 'Mofor Emmanuel'
release = '1.0.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

# add src folder
import os
import sys
# sys.path.insert(0, os.path.relpath('../../../src/'))

# Add the parent directory of "src" to the Python path
# sys.path.insert(0, os.path.abspath('../..'))
sys.path.insert(0, os.path.abspath('../../..'))

# Path to the module you want to document
sys.path.insert(0, os.path.abspath('../../../src'))
# sys.path.insert(0, os.path.abspath('../../../src/models'))

# env files needed for swob
from dotenv import load_dotenv
from pathlib import Path

dotenv_path = Path('../../.env')
load_dotenv(dotenv_path=dotenv_path)

extensions = [
    "myst_parser",
    "sphinx.ext.duration", # show build time
    "sphinx.ext.autosectionlabel", # generate targets for every subheading in every document
    "sphinx.ext.autodoc", # auto gen docs from code
    "sphinx.ext.napoleon", # for other docstring formats
    "sphinx.ext.viewcode", #
    # "sphinx.ext.autosummary", # doc of all code
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
    "members": True,
    "member-order": "bysource",
    "special-members": "__init__",
    "undoc-members": True,
    "exclude-members": "__weakref__",
    "inherited-members": True,
    "show-inheritance": True,
    # "private-members": False,
    # "imported-members": False,
    "ignore-module-all": False,
    # "exclude-protected": False,
    "members": True,  # include class members
}

templates_path = ['_templates']
exclude_patterns = ['_2FA.py']


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# html_theme = 'cloud'
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
