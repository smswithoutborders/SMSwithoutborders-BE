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

see [Provide registration details](#1.-Provide-registration-details) to get all the values mentioned above

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
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2.-Authenticate-an-account)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request POST 'http://localhost:9000/users/xxxxxx-xxxx-xxxx-xxxx-xxxxxx/platforms/gmail/protocols/oauth2' \
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
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2.-Authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Code (This is an authentication code given by the platform after approving the consent screen. It's often returned in a URL [query string](https://en.wikipedia.org/wiki/Query_string))

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request PUT 'http://localhost:9000/users/xxxxxx-xxxx-xxxx-xxxx-xxxxxx/platforms/gmail/protocols/oauth2' \
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
The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2.-Authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:
- Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:
- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000 

```bash
curl --location --request DELETE 'http://localhost:9000/users/xxxxxx-xxxx-xxxx-xxxx-xxxxxx/platforms/gmail/protocols/oauth2' \
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




