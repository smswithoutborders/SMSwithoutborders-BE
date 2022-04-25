# Features

## Table of contents

1. [Introduction](#introduction)
2. [Manage Grants](#2-manage-grants)
   1. [Gmail Grant](#1-gmail-grant)

## Introduction

SMS without Borders provides a RESTful cloud API and User management services. It is directly configurable with MySQL databases for managing users. Also provides out of the box integrations of Google OAuth-2.0, Twitter OAuth, and Telegram end-points and Account authentication. Here are a list of features made available by thsi tool.

## 2. Manage Grants

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
