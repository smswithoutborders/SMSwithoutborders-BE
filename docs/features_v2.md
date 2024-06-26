# Features

## Table of contents

1. [Introduction](#introduction)
2. [Create an account](#1-create-an-account)
   1. [Provide registration details](#1-provide-registration-details)
   2. [Complete a signup OTP verification](#2-complete-a-signup-otp-verification)
   3. [Validate registration details and verify new account](#3-validate-registration-details-and-verify-new-account)
3. [Authenticate an account](#2-authenticate-an-account)
   1. [With phone number](#1-with-phone-number)
   2. [With user's ID](#2-with-users-id)
4. [Manage Grants](#3-manage-grants)
   1. [Gmail Grant](#1-gmail-grant)
   2. [Twitter Grant](#2-twitter-grant)
   3. [Telegram Grant](#3-telegram-grant)
5. [Get saved and unsaved platforms](#4-get-saved-and-unsaved-platforms)
6. [Recover password](#5-recover-password)
   1. [Verify phone number](#1-verify-phone-number)
   2. [Complete a recovery OTP verification](#2-complete-a-recovery-OTP-verification)
   3. [Provide new password](#3-provide-new-password)
7. [Change Password](#6-change-password)
8. [Delete SMS without Borders account](#7-delete-SMS-without-Borders-account)
9. [Destroy session cookie](#8-destroy-session-cookie)
10. [Dashboard](#9-dashboard)
11. [OTP](#10-otp)
    1. [Submit a mobile phone number](#1-submit-a-mobile-phone-number)
    2. [Validate OTP](#2-validate-otp)
12. [Publish Grant](#11-publish-grant)

## Introduction

SMS without Borders provides a RESTful cloud API and User management services. It is directly configurable with MySQL databases for managing users. Also provides out of the box integrations of Google OAuth-2.0, Twitter OAuth, and Telegram end-points and Account authentication. Here are a list of features made available by thsi tool.

## 1. Create an account

Using the REST User management API, a new user can be added to the SMS without Borders database. There are three processes involved in adding a new user:

### 1. Provide registration details

The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):

- Phone Number (without country code)
- Name
- Country Code
- Password
- [Captcha token](https://developers.google.com/recaptcha/docs/verify)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "phone_number":"xxx-xxx-xxx",
    "name": "username",
    "country_code": "+xx",
    "password": "password",
    "captcha_token": "xxxx-xxxx-xxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

- uid

```bash
{
    "uid": "xxxxxxxxxxxxxx"
}
```

### 2. Complete a signup [OTP](https://en.wikipedia.org/wiki/One-time_password) verification

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during the [submission of registration details](#1-Provide-registration-details).

The remaining steps can be found at the [OTP section](#10-otp) ...

### 3. Validate [registration details](#1-Provide-registration-details) and verify new account

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [OTP validation](#2-validate-otp)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request PUT 'http://localhost:9000/v2/signup' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful, the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object

```bash
{}
```

## 2. Authenticate an account

Authentication is the process whereby a user provides their credentials for identification to obtain adequate resources. The user has 5 failed authentication attempts which when exceeded, the user is unauthorized for 15 minutes with a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `429`. If the user accumulates a sum of 3 subsequent unauthorized sessions (45 failed authentication attempts) they'll be unauthorized for the next 24 hours with a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `429`.

### 1. With phone number

The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):

- Phone Number (with country code)
- Password
- [Captcha token](https://developers.google.com/recaptcha/docs/verify)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "phone_number": "+xxxxx-xxx-xxx",
    "password": "password",
    "captcha_token": "xxxx-xxxx-xxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

- uid

```bash
{
    "uid": "xxxxxx-xxxx-xxxx-xxxx-xxxxxx"
}
```

### 2. With user's ID

The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):

- Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/users/{uid}/verify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "password": "password"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should be an empty object

```bash
{}
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
curl --location --request POST 'http://localhost:9000/v2/users/{uid}/platforms/gmail/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

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
curl --location --request PUT 'http://localhost:9000/v2/users/{uid}/platforms/gmail/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "code": "xxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

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
curl --location --request DELETE 'http://localhost:9000/v2/users/{uid}/platforms/gmail/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object

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
curl --location --request POST 'http://localhost:9000/v2/users/{uid}/platforms/twitter/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

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
curl --location --request PUT 'http://localhost:9000/v2/users/{uid}/platforms/twitter/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "oauth_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "oauth_verifier": "xxxxxxxxxxxxxxxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

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
curl --location --request DELETE 'http://localhost:9000/v2/users/{uid}/platforms/twitter/protocols/oauth2' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object

```bash
{}
```

### 3. Telegram Grant

SMS without Borders user managment API supports [Telegram](https://telegram.org/) platform using a [TwoFactor]() protocol

#### 1. Initialization

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:

- Phone number (with country code)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/users/{uid}/platforms/telegram/protocols/twofactor' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "phone_number": "+xxxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

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

The value of `body` tells the state of the telegram API.

- If `body = 201`, this means a verification code has been sent via sms or via an active telegram session.
- If `body = 200`, this means the user already has an active telegram session with sms without borders.

#### 2. Validation

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:

- Code (This is an authentication code sent by the platform provider via sms or via an active telegram session)
- Phone number (with country code)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request PUT 'http://localhost:9000/v2/users/{uid}/platforms/telegram/protocols/twofactor' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "code": "xxxxxxx",
    "phone_number": "+xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

- body
- initialization_url

```bash
{
    "body": 202/"",
    "initialization_url": `/platforms/{platform}/protocols/{protocol}/register`/""
}
```

The value of `body` tells the state of the telegram API.

- If `body = 202`, this means the user has no telegram account with the given phone number and one could be created by sms without borders for the user with the given phone number. In this case an initialization url is given which point to the [registration](#2a-registration) endpoint.

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
curl --location --request PUT 'http://localhost:9000/v2/users/{uid}/platforms/telegram/protocols/twofactor/register' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "first_name": "xxxxxxx",
    "last_name": "xxxxxxx",
    "phone_number": "+xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

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
curl --location --request DELETE 'http://localhost:9000/v2/users/{uid}/platforms/telegram/protocols/twofactor' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object

```bash
{}
```

## 4. Get saved and unsaved platforms

Every [grant](#3-manage-grants) has an associate platform. For every grant stored, its associate platform is placed under **saved platforms** and for every grant not stored its associate platform is placed under **unsaved platforms**.

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account).

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request GET 'http://localhost:9000/v2/users/{uid}/platforms' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

- unsaved_platforms
- saved_platforms

```bash
{
     "unsaved_platforms": [
        {
            "name": "xxx",
            "description": "xxxx",
            "logo": "xxxx",
            "initialization_url": "xxxx",
            "type": "xxx",
            "letter": "x"
        }
    ],
    "saved_platforms": [
        {
            "name": "xxx",
            "description": "xxxx",
            "logo": "xxxx",
            "initialization_url": "xxxx",
            "type": "xxx",
            "letter": "x"
        }
    ]
}
```

## 5. Recover password

There are three stages involved in recovering a forgotten password:

- Verify phone number
- Complete a recovery OTP verification
- Provide new password

### 1. Verify phone number

The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):

- Phone Number (with country code)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/recovery' \
--header 'Content-Type: application/json' \
--data-raw '{
    "phone_number":"xxx-xxx-xxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

- uid

```bash
{
    "uid": "xxxxxxxxxxxxxx"
}
```

### 2. Complete a recovery OTP verification

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Phone number verification](#1-verify-phone-number).

The remaining steps can be found at the [OTP section](#10-otp) ...

### 3. Provide new password

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [OTP validation](#2-validate-otp) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:

- new password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request PUT 'http://localhost:9000/v2/users/{uid}/recovery' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "new_password": "xxxxxxxxxx"
}'
```

If successful, the password is modified and all [grants](#3-manage-grants) are deleted. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object.

```bash
{}
```

## 6. Change Password

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:

- Password (current password)
- New Password

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/users/{uid}/password' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx",
    "new_password": "xxxxxxxxxxxxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object

```bash
{}
```

## 7. Delete SMS without Borders account

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:

- Password (current password)

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request DELETE 'http://localhost:9000/v2/users/{uid}' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "password": "xxxxxxxxxxxxxx"
}'
```

If successful, the user's account and all [grants](#3-manage-grants) are deleted. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object.

```bash
{}
```

## 8. Destroy session cookie

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account).

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/users/{uid}/logout' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful, the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on the user's agent will be destroyed invalidating that user's session. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object.

```bash
{}
```

## 9. Dashboard

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authentication](#2-authenticate-an-account).

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request GET 'http://localhost:9000/v2/users/{uid}/dashboard' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw ''
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

- createdAt
- updatedAt

```bash
{
    "createdAt": "yyyy-mm-ddxxx:xx:xx.xxxZ",
    "updatedAt": "yyyy-mm-ddTxx:xx:xx.xxxZ"
}
```

## 10. [OTP](https://en.wikipedia.org/wiki/One-time_password)

This is an extra layer of security used to make sure that the user trying to use a mobile phone number with SMS without borders has suitable access to that mobile phone number. The user has four slots to request for a different [OTP](https://en.wikipedia.org/wiki/One-time_password) daily. For each slot, there is a time duration before making another request. If the user requests a different [OTP](https://en.wikipedia.org/wiki/One-time_password) before the time duration elapses, the user will be unauthorized with a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `429` until the time duration elapses. [OTP](https://en.wikipedia.org/wiki/One-time_password) verification can be completed in two steps:

### 1. Submit a mobile phone number

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during a previous process.

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request POST 'http://localhost:9000/v2/users/{uid}/OTP' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "phone_number":"xxx-xxx-xxx"
}'
```

If successful an [OTP](https://en.wikipedia.org/wiki/One-time_password) is sent to the provided mobile phone number, a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `201` and the body should contain

- expires

```bash
{
    "expires": "xxxxxxxxxx"
}
```

### 2. Validate [OTP](https://en.wikipedia.org/wiki/One-time_password)

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during the [submission of a mobile phone number](#1-submit-a-mobile-phone-number) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:

- code (The [OTP](https://en.wikipedia.org/wiki/One-time_password) got from [Mobile Phone number submission](#1-submit-a-mobile-phone-number))

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie mentioned aboved

Here is an example. Running User management API locally on port 9000

```bash
curl --location --request PUT 'http://localhost:9000/v2/OTP' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "code":"xxxx"
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object

```bash
{}
```

## 11. Publish Grant

The SMSWithoutBorders Back-end Publisher is a secure channel for transmitting [Grants](#3-manage-grants). There are two steps involved in the transmission process

### 1. Authorization

> **_NOTE:_** This step requires the user to have an [SMSWithoutBorders Developer Back-end server](https://github.com/smswithoutborders/SMSWithoutBorders-Dev-BE`) setup.

The user has to provide the following in the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body):

- Auth key (From an [SMSWithoutBorders Developer Back-end server](https://github.com/smswithoutborders/SMSWithoutBorders-Dev-BE))
- Auth id (From an [SMSWithoutBorders Developer Back-end server](https://github.com/smswithoutborders/SMSWithoutBorders-Dev-BE))

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json

Here is an example. Running [SMSWithoutBorders Developer Back-end server](https://github.com/smswithoutborders/SMSWithoutBorders-Dev-BE) locally on port 3000

```bash
curl --location --request POST 'http://localhost:3000/v1/authenticate' \
--header 'Content-Type: application/json' \
--data-raw '{
    "auth_key": "",
    "auth_id": ""
}'
```

If successful a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) is set on the user's agent valid for two hours. The cookie is used to track the user's seesion. Also the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain an empty object

```bash
{}
```

### 2. Request grant

> **_NOTE:_** This step requires the user to have an [SMSWithoutBorders Back-end server](https://github.com/smswithoutborders/SMSwithoutborders-BE) setup and [configured](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/staging/docs/CONFIGURATIONS.md#developer) to communitcate with their [SMSWithoutBorders Developer Back-end server](https://github.com/smswithoutborders/SMSWithoutBorders-Dev-BE).

> The user has to make sure [SMSWithoutBorders Back-end Publisher API](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/staging/docs/CONFIGURATIONS.md#start-backend-publisher-api) is running.

The user has to provide the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) set on their user agent during [Authorization](#1-authorization) and also, the [request body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body) should contain:

- Platform (name of platform)
- Phone number

The user also must configure their [header](https://developer.mozilla.org/en-US/docs/Glossary/Representation_header) to:

- [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) = application/json
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) = Cookie set during [Authorization](#1-authorization)

Here is an example. Running Publisher API locally on port 11000

```bash
curl --location --request POST 'http://localhost:11000/v2/decrypt' \
--header 'Content-Type: application/json' \
--header 'Cookie: xxx-xxx-xxx-xxx-xxx-xxx' \
--data-raw '{
    "platform":"",
    "phone_number": ""
}'
```

If successful the [response](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) should have a [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of `200` and the body should contain

- username
- token
- uniqueId

```bash
{
    "username": "",
    "token": {}
    "uniqueId": ""
}
```
