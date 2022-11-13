import logging
import os
import json
import importlib.util       

from Configs import baseConfig
config = baseConfig()
platforms_path = config["PLATFORMS_PATH"]

logger = logging.getLogger(__name__)

def check_format(search_path: str = None) -> bool:
    """
    """
    platform_search_path = platforms_path if not search_path else search_path

    platform_info_filepath = os.path.join(platform_search_path, "info.json")
    platform_methods_filepath = os.path.join(platform_search_path, "methods.py")
    platform_requirements_filepath = os.path.join(platform_search_path, "requirements.txt")

    platform_info_status = None
    platform_methods_status = None
    platform_requirements_status = None
    platform_app_status = None

    if not os.path.exists(platform_info_filepath):
        error = "[!] Missing platform 'information file (info.json)' at %s. This Platform will not be added to the Database.\n" % platform_search_path
        logger.error(error)
        platform_info_status = False
    else:
        platform_info_status = True

    if not os.path.exists(platform_methods_filepath):
        error = "[!] Missing platform 'methods file (methods.py)' at %s. This Platform will not be added to the Database.\n" % platform_search_path
        logger.error(error)
        platform_methods_status = False
    else:
        platform_methods_status = True

    if not os.path.exists(platform_requirements_filepath):
        error = "[!] Missing platform 'requirements file (requirements.txt)' at %s. This Platform will not be added to the Database.\n" % platform_search_path
        logger.error(error)
        platform_requirements_status = False
    else:
        platform_requirements_status = True

    status_report = {
        "platform_info_file":platform_info_status,
        "platform_methods_file":platform_methods_status,
        "platform_requirements_file":platform_requirements_status
    }

    if platform_info_status == True and platform_methods_status == True and platform_requirements_status == True and  platform_app_status == True:
        logger.info(status_report)
        logger.info("- All checks passed!")
        return True
    else:
        logger.info(status_report)
        return False

def get_platform_path_from_platform_name(platform_name: str, search_path: str = None) -> str:
    """
    """
    platform_search_path = platforms_path if not search_path else search_path

    available_platforms = [ f.path for f in os.scandir(platforms_path) if f.is_dir() ]

    for Platform in available_platforms:
        platform_path = os.path.join(platform_search_path, Platform)

        platform_info_filepath = os.path.join(platform_path, "info.json")

        if os.path.exists(platform_info_filepath):
            with open(platform_info_filepath, encoding="utf-8") as data_file:    
                data = json.load(data_file)
            
            if platform_name == data["name"]:
                return str(platform_path)
            else:
                continue
        else:
           continue

    return None

def importplatform(platform_name: str) -> object:
    """
    """
    try:
        platform_path = get_platform_path_from_platform_name(platform_name=platform_name)

        if not platform_path:
            return None 
        else:   
            platform_methods_filepath = os.path.join(platform_path, "method.py")

            spec = importlib.util.spec_from_file_location(platform_name, platform_methods_filepath)   
            Platform = importlib.util.module_from_spec(spec)       
            spec.loader.exec_module(Platform)

            return Platform
    
    except Exception as error:
        logger.error("Error importing platform '%s'" % platform_name)
        raise error

