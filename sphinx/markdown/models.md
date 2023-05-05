# models package

## Submodules

## models.broadcast module

Broadcast Module.

This module provides a function to broadcast a message to a list of URLs defined in a whitelist file.


### models.broadcast.publish(body: dict)
Publishes a message to a list of URLs defined in a whitelist file.


* **Parameters**

    **body** (*dict*) – The message to be broadcasted.



* **Raises**

    **Any exceptions raised by the requests module.** – 


## models.grants module


### _class_ models.grants.Grant_Model()
Bases: `object`

**NOTE**: A “grant” is an object (dictionary) that basically contains third-party platform information peculiar to a user.
This can be information like the auth token and the profile data from third party platform, say Twitter
for example, preformatted in the SWOB Custom Third Party Platforms Project.
The Grant_Model class provides a layer of abstraction for manipulating grants, and methods for storing,
decrypting, finding, and deleting them.


#### \__init__()
Initializes an Grant_Model instance.


#### store(user_id: str, platform_id: str, grant: dict)
Store the grant for a user and a platform.


* **Parameters**

    
    * **user_id** (*str*) – User ID.


    * **platform_id** (*str*) – Platform ID.


    * **grant** (*dict*) – Grant information.



* **Raises**

    
    * **InternalServerError** – If there is an error storing the grant.


    * **Conflict** – If the user already has a grant for the platform.



#### decrypt(grant, refresh: bool = False)
Decrypt a grant.


* **Parameters**

    
    * **grant** – The grant to decrypt.


    * **refresh** (*bool**, **optional*) – Whether to refresh the token.



* **Returns**

    The decrypted grant.



* **Return type**

    dict



#### delete(grant)
Delete a grant.


* **Parameters**

    **grant** – The grant to delete.



* **Raises**

    **InternalServerError** – If there is an error deleting the grant.



#### find(user_id: str, platform_id: str)
Find a grant.


* **Parameters**

    
    * **user_id** (*str*) – User ID.


    * **platform_id** (*str*) – Platform ID.



* **Returns**

    The grant object.



* **Return type**

    GrantObject



* **Raises**

    
    * **BadRequest** – If the grant is not found.


    * **InternalServerError** – If there is an error finding the grant.



#### find_all(user_id: str)
Find all grants for a user.


* **Parameters**

    **user_id** (*str*) – User ID.



* **Returns**

    The grants object.



* **Return type**

    GrantObject



* **Raises**

    **InternalServerError** – If there is an error finding the grants.



#### purge(originUrl: str, identifier: str, platform_name: str, token: str)
Purge a grant.


* **Parameters**

    
    * **originUrl** (*str*) – The origin URL.


    * **identifier** (*str*) – The identifier.


    * **platform_name** (*str*) – The platform name.


    * **token** (*str*) – The token.



* **Raises**

    **BadRequest** – If the platform name is invalid.


## models.sessions module


### _class_ models.sessions.Session_Model()
Bases: `object`


#### \__init__()
Session_Model constructor method that initializes the class with the following attributes:


#### Sessions()
The Sessions schema object used to connect to the database.


#### cookie_data()
A dictionary containing cookie data used to create a cookie.


* **Type**

    dict



#### create(unique_identifier: str, user_agent: str, status: str = None, type: str = None)
Creates a new session in the database.


* **Parameters**

    
    * **unique_identifier** (*str*) – Unique identifier of the user.


    * **user_agent** (*str*) – User agent string of the user.


    * **status** (*str**, **optional*) – The status of the session. Defaults to None.


    * **type** (*str**, **optional*) – The type of session. Defaults to None.



* **Returns**

    A dictionary containing the session ID, unique identifier, cookie data, and session type.



* **Return type**

    dict



* **Raises**

    **InternalServerError** – If there was a database error.



#### find(sid: str, unique_identifier: str, user_agent: str, cookie: str, status: str = None, type: str = None)
Finds a session in the database.


* **Parameters**

    
    * **sid** (*str*) – The session ID to search for.


    * **unique_identifier** (*str*) – The unique identifier of the user.


    * **user_agent** (*str*) – The user agent string of the user.


    * **cookie** (*str*) – The cookie data associated with the session.


    * **status** (*str**, **optional*) – The status of the session. Defaults to None.


    * **type** (*str**, **optional*) – The type of session. Defaults to None.



* **Returns**

    The unique identifier associated with the session.



* **Return type**

    str



* **Raises**

    
    * **InternalServerError** – If there was a database error.


    * **Conflict** – If multiple sessions were found.


    * **Unauthorized** – If no sessions were found or if the session was invalid.



#### update(sid: str, unique_identifier: str, status: str = None, type: str = None)
Updates a session in the database.


* **Parameters**

    
    * **sid** (*str*) – The session ID to update.


    * **unique_identifier** (*str*) – The unique identifier of the user.


    * **status** (*str**, **optional*) – The status of the session. Defaults to None.


    * **type** (*str**, **optional*) – The type of session. Defaults to None.



* **Returns**

    A dictionary containing the session ID, unique identifier, cookie data, and session type.



* **Return type**

    dict



* **Raises**

    **InternalServerError** – If there was a database error.


## models.users module


### _class_ models.users.User_Model()
Bases: `object`

A class representing a user of the SWOB platform.

The User_Model class provides a layer of abstraction that encompasses attributes and methods peculiar
to a user of the SWOB platform, which also aids in interacting with the user data and transactions
carried out throughout the flow.


#### \__init__()
Initializes a new instance of the User_Model class.

This method sets up the instance variables to enable interaction with the user data and transactions.


#### create(phone_number: str, country_code: str, name: str, password: str)
Create a new user account.


* **Parameters**

    
    * **phone_number** (*str*) – The user’s phone number.


    * **country_code** (*str*) – The country code of the user’s phone number.


    * **name** (*str*) – The user’s name.


    * **password** (*str*) – The user’s password.



* **Returns**

    The ID of the newly created user.



* **Return type**

    str



* **Raises**

    
    * **Conflict** – If a user with the provided phone number already exists.


    * **InternalServerError** – If there was an error creating the user, such as a database error.


**NOTE**: This method creates a new user account by encrypting and storing the user’s phone number, country code, name,
and password in the database. The phone number and country code are hashed using the provided hash method.
The name and country code are encrypted using the provided encrypt method. The password is hashed using the
provided hash method. If the user already has a verified account with the same phone number and country code,
a new account will not be created and a Conflict error will be raised.


#### verify(password: str, phone_number: str = None, user_id: str = None)
Verify a user’s credentials.


* **Parameters**

    
    * **password** (*str*) – The user’s password.


    * **phone_number** (*str*) – The user’s phone number (in international format).


    * **user_id** (*str*) – The ID of the user.



* **Returns**

    A dictionary containing the user’s information, as per UsersInfo Schema.



* **Return type**

    dict



* **Raises**

    
    * **Unauthorized** – If the user’s phone number, ID or password is invalid.


    * **Conflict** – If there are multiple verified accounts with the same phone number.


    * **InternalServerError** – If there was an error verifying the user’s credentials, such as a database error.


**NOTE**: This method verifies a user’s credentials by checking the provided phone number (if provided) or user ID (if
provided) against the hashed phone numbers of verified users in the database. If a verified user with a matching
phone number or user ID is found, the provided password is checked against the hashed password of the user in
the database. If the password matches, a dictionary containing the user’s information is returned. If the phone
number or user ID is invalid, or if there are multiple verified accounts with the same phone number, an error
will be raised.


#### find(phone_number: str = None, user_id: str = None)
Finds a user based on their phone number or user ID.


* **Parameters**

    
    * **phone_number** (*str*) – The phone number of the user to find.


    * **user_id** (*str*) – The user ID of the user to find.



* **Returns**

    A dictionary containing the user information.



* **Return type**

    UserObject



* **Raises**

    
    * **Unauthorized** – If no user is found for the given phone number or user ID.


    * **Conflict** – If more than one user is found for the given phone number or user ID.


    * **InternalServerError** – If there is an error while executing the database query.



#### find_platform(user_id: str)
Fetches the saved and unsaved platforms for a user.


* **Parameters**

    **user_id** (*str*) – The user ID of the user whose platforms to fetch.



* **Returns**

    A dictionary containing the saved and unsaved platforms for the user.



* **Return type**

    UserPlatformObject



* **Raises**

    **InternalServerError** – If there is an error while executing the database query.



#### update(user_id: str, status: str = None, password: str = None)
Updates the user information in the database with the given user ID.


* **Parameters**

    
    * **user_id** (*str*) – The ID of the user to update.


    * **status** (*str**, **optional*) – The new status to set for the user.


    * **password** (*str**, **optional*) – The new password to set for the user.



* **Raises**

    
    * **Unauthorized** – If the user with the given ID is not found.


    * **Conflict** – If multiple users are found with the given ID.


    * **InternalServerError** – If an error occurs while updating the user.



#### delete(user_id: str)
Deletes the user account and associated user information from the database.


* **Parameters**

    **user_id** (*str*) – The ID of the user to delete.



* **Raises**

    
    * **Unauthorized** – If the user with the given ID is not found.


    * **Conflict** – If multiple users are found with the given ID.


    * **InternalServerError** – If an error occurs while deleting the user.



#### recaptcha(captchaToken: str, remoteIp: str)
Verifies the reCAPTCHA token with the Google reCAPTCHA service.


* **Parameters**

    
    * **captchaToken** (*str*) – The reCAPTCHA token to verify.


    * **remoteIp** (*str*) – The IP address of the user who submitted the reCAPTCHA.



* **Returns**

    True if the token is valid, False otherwise.



* **Return type**

    bool



* **Raises**

    
    * **BadRequest** – If the reCAPTCHA token is invalid.


    * **InternalServerError** – If an error occurs while verifying the reCAPTCHA.



#### check_count(unique_id: str)
Check the retry count for a given unique identifier.


* **Parameters**

    **unique_id** (*str*) – A string representing a unique identifier.



* **Returns**

    An instance of the Retries schema representing the retry count for the given unique identifier.



* **Raises**

    **TooManyRequests** – If the retry count or block has reached the maximum limit.



#### add_count(counter)
Add a retry count to the database.


* **Parameters**

    **counter** – An instance of the Retries schema representing the retry count.



* **Returns**

    A string representing the unique identifier for the retry count.



* **Return type**

    str



#### delete_count(counter_id: int)
Delete a retry count from the database.


* **Parameters**

    **counter_id** (*int*) – An integer representing the ID of the retry count.



* **Raises**

    **Unauthorized** – If the retry count with the given ID does not exist.


## Module contents
