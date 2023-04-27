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
sys.path.insert(0, os.path.abspath('../../../src'))

extensions = [
    "myst_parser",
    "sphinx.ext.duration", # show build time
    "sphinx.ext.autosectionlabel", # generate targets for every subheading in every document
]

templates_path = ['_templates']
exclude_patterns = []


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# html_theme = 'cloud'
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
