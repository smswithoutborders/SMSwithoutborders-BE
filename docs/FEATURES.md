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

### 2. Authenticate an account
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



