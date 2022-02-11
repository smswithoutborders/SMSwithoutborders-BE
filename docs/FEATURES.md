# Features

## Introduction
SMS without Borders provides a RESTful cloud API and User management services. It is directly configurable with MySQL databases for managing users. Also provides out of the box integrations of Google OAuth-2.0, Twitter OAuth, and Telegram end-points and Account authentication. Here are a list of features made available by thsi tool. 

## 1. Create an account
Using the REST User management API, a new user can be added to the SMS without Borders database. There are two processes involved in adding a new user:
### 1. Provide registration details
The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):
- Phone Number (without country code) 
- Name
- Country Code
- Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request POST 'http://localhost:9000/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "phone_number":"xxx-xxx-xxx",
    "name": "username",
    "country_code": "+xx",
    "password": "password"
}'
```

If successful an [OTP](https://en.wikipedia.org/wiki/One-time_password) is sent to the user's phone number, the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- session_id
- svid

```bash
{
    "session_id": "xxxxxxxxxxxxxx",
    "svid": "xxxxx-xxxx-xxxxx-xxxx-xxxxxxx"
}
```

### 2. Validate [OTP](https://en.wikipedia.org/wiki/One-time_password) and verify new account
The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):
- Session Id
- SVID
- code: The [OTP](https://en.wikipedia.org/wiki/One-time_password) got from [Provide registration details](#Provide-registration-details)

see [Provide registration details](#1-Provide-registration-details) to get all the values mentioned above

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request PUT 'http://localhost:9000/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "session_id": "xxxxxxxxxxxxxx",
    "svid": "xxxxx-xxxx-xxxxx-xxxx-xxxxxxx",
    "code": "xxxxxx"
}'
```
If successful, the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain an empty object

```bash
{}
```

## 2. Authenticate an account
The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):
- Phone Number (with country code) 
- Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request POST 'http://localhost:9000/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "phone_number": "+xxxxx-xxx-xxx",
    "password": "password"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- uid

```bash
{
    "uid": "xxxxxx-xxxx-xxxx-xxxx-xxxxxx"
}
```

## 3. Manage Grants
A Grant is what allows SMS without Borders to act on behalf of a user. It's acquired by first asking a user to approve the request to act on their behalf for a requested scope. After which it is encrypted and stored in an SMS without Borders database. These grants can be deleted from the SMS without Borders database at any given time the user desires. Upon deletion, SMS without Borders user management API revokes every online access associated with these grants. 

There are three stages involved in managing grants with an SMS without Borders user management API.
- Initialize grant
- Validate grant
- Revoke grant

### 1. Gmail Grant
SMS without Borders user managment API supports [Gmail](https://www.google.com/gmail/about/) platform using an [OAuth2](https://oauth.net/2/) protocol
#### 1. Initialization
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request POST 'http://localhost:9000/users/{uid}/gmail/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- url
- body
- platform

```bash
{
    "url": <consent screen url>,
    "body": "",
    "platform": "gmail"
}
```

#### 2. Validation
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Code (This is an authentication code given by the platform after approving the consent screen. It's often returned in a URL [query string](https://en.wikipedia.org/wiki/Query_string))

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request PUT 'http://localhost:9000/users/{uid}/gmail/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "code": "xxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- body
- initialization_url

```bash
{
    "body": "",
    "initialization_url": ""
}
```
#### 3. Revoke
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request DELETE 'http://localhost:9000/users/{uid}/gmail/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain an empty object 

```bash
{}
```
### 2. Twitter Grant
SMS without Borders user managment API supports [Twitter](https://about.twitter.com/en) platform using an [OAuth](https://oauth.net/) protocol
#### 1. Initialization
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request POST 'http://localhost:9000/users/{uid}/twitter/protocols/oauth' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- url
- body
- platform

```bash
{
    "url": <consent screen url>,
    "body": "",
    "platform": "twitter"
}
```

#### 2. Validation
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- OAuth Token (This is an authentication token given by the platform after approving the consent screen. It's often returned in a URL [query string](https://en.wikipedia.org/wiki/Query_string))
- OAuth Verifier (This is an authentication verifier given by the platform after approving the consent screen. It's often returned in a URL [query string](https://en.wikipedia.org/wiki/Query_string))

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request PUT 'http://localhost:9000/users/{uid}/twitter/protocols/oauth' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "oauth_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "oauth_verifier": "xxxxxxxxxxxxxxxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- body
- initialization_url

```bash
{
    "body": "",
    "initialization_url": ""
}
```
#### 3. Revoke
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request DELETE 'http://localhost:9000/users/{uid}/twitter/protocols/oauth' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain an empty object 

```bash
{}
```
### 3. Telegram Grant
SMS without Borders user managment API supports [Telegram](https://telegram.org/) platform using an [TwoFactor]() protocol
#### 1. Initialization
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Phone number (with country code)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request POST 'http://localhost:9000/users/{uid}/telegram/protocols/twofactor' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "phone_number": "+xxxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- url
- body
- platform

```bash
{
    "url": "",
    "body": 201/200,
    "platform": "telegram"
}
```
The value of ```body``` tells the state of the telegram API. 
* If ```body = 201```, this means a verification code has been sent via sms or via an active telegram session.
* If ```body = 200```, this means the user already has an active telegram session with sms without borders.

#### 2. Validation
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Code (This is an authentication code sent by the platform provider via sms or via an active telegram session)
- Phone number (with country code)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request PUT 'http://localhost:9000/users/{uid}/telegram/protocols/twofactor' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "code": "xxxxxxx",
    "phone_number": "+xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- body
- initialization_url

```bash
{
    "body": 202/"",
    "initialization_url": `/platforms/{platform}/protocols/{protocol}/register`/""
}
```

The value of ```body``` tells the state of the telegram API. 
* If ```body = 202```, this means the user has no telegram account with the given phone number and one could be created by sms without borders for the user with the given phone number. In this case an initialization url is given which point to the [registration](#2a-registration) endpoint.

#### 2a. Registration
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- First name
- Last name
- Phone number (with country code)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request PUT 'http://localhost:9000/users/{uid}/telegram/protocols/twofactor/register' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "first_name": "xxxxxxx",
    "last_name": "xxxxxxx",
    "phone_number": "+xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain 
- body
- initialization_url

```bash
{
    "body": "",
    "initialization_url": ""
}
```

#### 3. Revoke
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request DELETE 'http://localhost:9000/users/{uid}/telegram/protocols/twofactor' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of ```200``` and the body should contain an empty object 

```bash
{}
```




