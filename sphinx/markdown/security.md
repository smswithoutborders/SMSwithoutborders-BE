# security package

## Submodules

## security.cookie module


### _class_ security.cookie.Cookie(key: str = None)
Bases: `object`

A class that provides methods for encrypting and decrypting cookies.


#### key_bytes()
The number of bytes used for the encryption key.


* **Type**

    int



#### key()
The encryption key used for encrypting and decrypting cookies.


* **Type**

    bytes



* **Raises**

    
    * **InternalServerError** – If the encryption key length is invalid.


    * **Unauthorized** – If an error occurs during decryption.



#### \__init__(key: str = None)
Initializes a new instance of the Cookie class.


* **Parameters**

    **key** (*str**, **optional*) – The encryption key used for encrypting and decrypting cookies.
    If not provided, the shared key specified in the configuration file is used.



* **Returns**

    None



* **Raises**

    **InternalServerError** – If the encryption key length is invalid.



#### encrypt(data: str)
Encrypts the specified string using the encryption key.


* **Parameters**

    **data** (*str*) – The string to encrypt.



* **Returns**

    The encrypted string.



* **Return type**

    str



#### decrypt(data: str)
Decrypts the specified string using the encryption key.


* **Parameters**

    **data** (*str*) – The string to decrypt.



* **Returns**

    The decrypted string.



* **Return type**

    str



* **Raises**

    **Unauthorized** – If an error occurs during decryption.


## security.data module


### _class_ security.data.Data(key: str = None)
Bases: `object`

This class provides methods to encrypt, decrypt and hash data.


#### key_bytes()
Length of the encryption key in bytes.


* **Type**

    int



#### key()
Encryption key used for encrypting and decrypting data.


* **Type**

    bytes



#### salt()
Hashing salt used for hashing data.


* **Type**

    bytes



#### \__init__(key: str = None)
Constructor method for the Data class.


* **Parameters**

    **key** (*str*) – The encryption key to use. If not provided, a default key will be used.



* **Raises**

    **InternalServerError** – If an invalid encryption key is provided.



#### encrypt(data: str)
Encrypts the given data using AES-256-CBC encryption.


* **Parameters**

    **data** (*str*) – The data to be encrypted.



* **Returns**

    Encrypted data, with initialization vector (IV) prepended.
    None: If no data to encrypt.



* **Return type**

    str



#### decrypt(data: str)
Decrypts the given data using AES-256-CBC encryption.


* **Parameters**

    **data** (*str*) – The data to be decrypted.



* **Returns**

    Decrypted data.
    None: If no data to decrypt.



* **Return type**

    str



* **Raises**

    **Unauthorized** – If an error occurs while decrypting the data.



#### hash(data: str, salt: str = None)
Hashes the given data using HMAC-SHA512 hashing algorithm.


* **Parameters**

    
    * **data** (*str*) – The data to be hashed.


    * **salt** (*Optional**[**str**]*) – The salt to be used in hashing the data. If not provided,
    the salt from the object’s attributes will be used.



* **Returns**

    The hashed data.



* **Return type**

    str


## security.password_policy module

Password Policy Module


### security.password_policy.password_check(password: str)
Check if the given password conforms to the password policy.


* **Parameters**

    **password** (*str*) – The password to be checked.



* **Returns**

    True if password conforms to policy.



* **Return type**

    bool



* **Raises**

    **BadRequest** – If the password length is less than 8.


## Module contents
