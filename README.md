## SMSwithoutBorders OAuth-2.0-authentications/ Token/ User management-API

### Installation

* Install all node packages
```
npm install
```

### Setup
* Create configuration file
    * To set up database and API, use the template in "example.config.json" file and rename to "config.json"
    * To set up platform credentials, use the template in "example.credentials.json" file and rename to "credentials.json"
### Start Server
* With NPM
```
npm start
```
* With Node
```
node server.js
```

### API SandBox
```
http://localhost:3000/api-docs
```

### Usage
- Tables are automatically generated when server starts

* Create an account
    > Use the SQL command
    ```
    > INSERT INTO `users`(`example_phone_number`, `auth_key`) VALUES ("phone_number", null);
    ```
* Login to account

    ```
    > POST: http://localhost:3000/users/profile/
    body = {
        "phone_number": STRING
    }
    response = {
        "auth_key": STRING
    }    
    ```
* Get stored tokens

    ```
    > POST: http://localhost:3000/users/stored_tokens
    body = {
        "auth_key": STRING,
        "user_id": STRING
    }
    response = {
        "token": {
            "access_token": STRING,
            "refresh_token": STRING,
            "expiry_date": STRING,
            "scope": ARRAY
        }
    }
    ```
* Get new token

    ```
    > POST: http://localhost:3000/users/tokens
    body = {
        "auth_key": STRING
    }
    response = {
        message: "Token stored Login!"
    }
    ```