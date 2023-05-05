# protocolHandler module


### _class_ protocolHandler.OAuth2(origin: str, platform_name: str)
Bases: `object`

Class representing an OAuth2 authentication flow.


#### origin()
The origin URL of the request.


* **Type**

    str



#### platform_name()
The name of the platform to authenticate against.


* **Type**

    str



#### Platform()
The platform object.


* **Type**

    SwobThirdPartyPlatforms.platform.Platform



#### Methods()
The platform’s methods object.


* **Type**

    SwobThirdPartyPlatforms.methods.Methods



#### \__init__(origin: str, platform_name: str)
Initialize a new instance of the OAuth2 class.


* **Parameters**

    
    * **origin** (*str*) – The origin URL of the request.


    * **platform_name** (*str*) – The name of the platform to authenticate against.



* **Raises**

    **BadRequest** – If the platform_name is invalid



#### authorization()
Retrieve the authorization URL and code_verifier required for the authorization flow.


* **Returns**

    A dictionary containing the authorization URL and code_verifier.



* **Return type**

    dict



#### validation(code, scope=None, code_verifier=None)
Validate the authorization code and retrieve an access token.


* **Parameters**

    
    * **code** (*str*) – The authorization code.


    * **scope** (*str*) – The scope to request.


    * **code_verifier** (*str*) – The code verifier required for the authorization flow.



* **Returns**

    A dictionary containing the auth grant, typically the token and profile data.



* **Return type**

    dict



#### invalidation(token: str)
Invalidate an access token.


* **Parameters**

    **token** (*str*) – The access token to invalidate.



### _class_ protocolHandler.TwoFactor(identifier: str, platform_name: str)
Bases: `object`

A class representing a two-factor authentication platform.


#### identifier()
An identifier for the user.


* **Type**

    str



#### platform_name()
The name of the platform being used.


* **Type**

    str



#### Platform()
The platform object for the specified platform.


* **Type**

    SwobThirdPartyPlatforms.platform.Platform



#### Methods()
The methods object for the specified platform.


* **Type**

    SwobThirdPartyPlatforms.platform.Methods



#### \__init__(identifier: str, platform_name: str)
Initializes a new instance of the TwoFactor class.


* **Parameters**

    
    * **identifier** (*str*) – An identifier for the user.


    * **platform_name** (*str*) – The name of the platform being used.



#### authorization()
Authorize the user for two-factor authentication.


* **Returns**

    A dictionary containing the result of the authorization request.



* **Return type**

    dict



#### validation(code: str, \*\*kwargs)
Validate a code for two-factor authentication.


* **Parameters**

    **code** (*str*) – The code to validate.



* **Returns**

    A dictionary containing the result of the validation request.



* **Return type**

    dict



#### registration(first_name: str, last_name: str)
Register the user for two-factor authentication.


* **Parameters**

    
    * **first_name** (*str*) – The user’s first name.


    * **last_name** (*str*) – The user’s last name.



* **Returns**

    A dictionary containing the result of the registration request.



* **Return type**

    dict



#### invalidation(token: str)
Invalidate the user’s authentication token.


* **Parameters**

    **token** (*str*) – The user’s authentication token.
