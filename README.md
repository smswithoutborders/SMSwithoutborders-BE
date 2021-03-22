## SMSwithoutBorders OAuth-2.0-authentications/ Token/ User management-API

### Installation

* Install all node packages
```
npm install
```

### Setup
* Create configuration file
    * Use the template in "example.config.json" file and rename to "config.json"
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
* Create an account

    ```
    > POST: http://localhost:3000/register/ 
    {
        username: STRING,
        password: STRING
    }
    ```
* Login to account

    ```
    > POST: http://localhost:3000/register/ 
    {
        username: STRING,
        password: STRING
    }
    ```
* After all authentications return User object
    ```
    user = {
        data = {},
        token = {}
    }
    ```