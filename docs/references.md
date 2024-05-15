# SMSwithoutBorders API

> Version 2.0.0

## Path Table

| Method | Path                                                                                                                                                        | Description                                                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| POST   | [/signup](#postsignup)                                                                                                                                      | Create a new User                                                                                                              |
| PUT    | [/signup](#putsignup)                                                                                                                                       | Validate a new User                                                                                                            |
| POST   | [/login](#postlogin)                                                                                                                                        | Authenticate a User with their phone number                                                                                    |
| POST   | [/users/{user_id}/verify](#postusersuser_idverify)                                                                                                          | Authenticate a User with their user's ID                                                                                       |
| POST   | [/users/{user_id}/platforms/{platform}/protocols/{protocol}](#postusersuser_idplatformsplatformprotocolsprotocol)                                           | initialize a new wallet. Request body for Gmail = {}, Twitter = {}, Telegram = {phone_number}                                  |
| PUT    | [/users/{user_id}/platforms/{platform}/protocols/{protocol}](#putusersuser_idplatformsplatformprotocolsprotocol)                                            | Verify a new wallet. Request body for Gmail = {code}, Twitter = {oauth_token, oauth_verifier}, Telegram = {phone_number, code} |
| DELETE | [/users/{user_id}/platforms/{platform}/protocols/{protocol}](#deleteusersuser_idplatformsplatformprotocolsprotocol)                                         | Delete wallet                                                                                                                  |
| PUT    | [/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}](#putusersuser_idplatformsplatformprotocolsprotocolaction)                             | Token Verification. Request body for Telegram = {phone_number, first_name, last_name}                                          |
| GET    | [/users/{user_id}/platforms](#getusersuser_idplatforms)                                                                                                     | Get saved and unsaved platforms for a user                                                                                     |
| POST   | [/users/{user_id}/password](#postusersuser_idpassword)                                                                                                      | Modify a user's password                                                                                                       |
| POST   | [/recovery](#postrecovery)                                                                                                                                  | Initiate SMS Verification code for Recovery phone number                                                                       |
| PUT    | [/users/{user_id}/recovery](#putusersuser_idrecovery)                                                                                                       | Set new recovery password                                                                                                      |
| DELETE | [/users/{user_id}](#deleteusersuser_id)                                                                                                                     | delete a user's account                                                                                                        |
| GET    | [/users/{user_id}/dashboard](#getusersuser_iddashboard)                                                                                                     | Get a user's dashboard                                                                                                         |
| POST   | [/users/{user_id}/OTP](#postusersuser_idotp)                                                                                                                | Trigger OTP code                                                                                                               |
| PUT    | [/OTP](#putotp)                                                                                                                                             | Verify OTP code                                                                                                                |
| POST   | [/users/{user_id}/logout](#postusersuser_idlogout)                                                                                                          | Invalidates a User's session                                                                                                   |
| GET    | [/users?start=YYYY-MM-DD&end=YYYY-MM-DD&type={available/signup}&format={day/month}](#getusersstartyyyy-mm-ddendyyyy-mm-ddtypeavailablesignupformatdaymonth) | Get users analytics                                                                                                            |

## Reference Table

| Name | Path | Description |
| ---- | ---- | ----------- |

## Path Details

---

### [POST]/signup

- Summary  
  Create a new User

#### RequestBody

- application/json

```ts
{
  phone_number?: string
  name?: string
  country_code?: string
  password?: string
  captcha_token?: string
}
```

#### Responses

- 200 A cerification code is sent to the user

`application/json`

```ts
{
  uid?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g User, Platform not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [PUT]/signup

- Summary  
  Validate a new User

#### RequestBody

- application/json

```ts
{
}
```

#### Responses

- 200 Successful

`application/json`

```ts
{
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g User, Platform not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 403 Forbidden (e.g Invalid verification session)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [POST]/login

- Summary  
  Authenticate a User with their phone number

#### RequestBody

- application/json

```ts
{
  phone_number?: string
  password?: string
  captcha_token?: string
}
```

#### Responses

- 200 A cookie is stored in the browser

`application/json`

```ts
{
  uid?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 429 Too Many Requests

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [POST]/users/{user_id}/verify

- Summary  
  Authenticate a User with their user's ID

#### RequestBody

- application/json

```ts
{
  password?: string
}
```

#### Responses

- 200 A cookie is stored in the browser

`application/json`

```ts
{
  uid?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 429 Too Many Requests

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [POST]/users/{user_id}/platforms/{platform}/protocols/{protocol}

- Summary  
  initialize a new wallet. Request body for Gmail = {}, Twitter = {}, Telegram =
  {phone_number}

#### RequestBody

- application/json

```ts
{
  phone_number?: string
}
```

#### Responses

- 200 Successful. Response body for Gmail = {url, platform}, Twitter = {url,
  platform}, Telegram: (body[200 - Unauthorized, 201 - response code required],
  platform). The state of Telegram responses are in 'body' and should be parsed
  for current state of Telegram app. 200 meaning the user is not authorized to
  make this request, 201 meaning code has been sent back to user via SMS or
  Telegram session

`application/json`

```ts
{
  url?: string
  body?: string
  platform?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g User, Platform not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 403 Forbidden (e.g Invalid verification session)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [PUT]/users/{user_id}/platforms/{platform}/protocols/{protocol}

- Summary  
  Verify a new wallet. Request body for Gmail = {code}, Twitter = {oauth_token,
  oauth_verifier}, Telegram = {phone_number, code}

#### RequestBody

- application/json

```ts
{
  code?: string
  oauth_token?: string
  oauth_verifier?: string
  phone_number?: string
}
```

#### Responses

- 200 Successful. Response body for Gmail = {}, Twitter = {}, Telegram:
  (body[202 - create a telegram account], initialization_url). The state of
  Telegram responses are in 'body' and should be parsed for current state of
  Telegram app. 202 meaning the user doesn't have a telegram account and need to
  create one. If body is 202 it comes with an initialization_url to start the
  next step of creating a telegram account

`application/json`

```ts
{
  body?: string
  initialization_url?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g User, Platform not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 403 Forbidden (e.g User does not have access rights to the content, invalid
  verification code)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 422 UnprocessableEntity (e.g Invalid authorization scopes)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [DELETE]/users/{user_id}/platforms/{platform}/protocols/{protocol}

- Summary  
  Delete wallet

#### RequestBody

- application/json

```ts
{
  password?: string
}
```

#### Responses

- 200 Successful

`application/json`

```ts
{
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g User, Platform not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 403 Forbidden (e.g User does not have access rights to the content, invalid
  verification code)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [PUT]/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}

- Summary  
  Token Verification. Request body for Telegram = {phone_number, password}

#### RequestBody

- application/json

```ts
{
  password?: string
  phone_number?: string
}
```

#### Responses

- 200 Successful. Response body for Telegram: (body = '', initialization_url =
  ''). The state of Telegram responses are in 'body' and should be parsed for
  current state of Telegram app. Empty body string (body=''), and empty
  initialization_url string (initialization_url='') meaning the users account
  was created and stored successfully

`application/json`

```ts
{
  body?: string
  initialization_url?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g User, Platform not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 403 Forbidden (e.g User does not have access rights to the content, invalid
  2FA password)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [GET]/users/{user_id}/platforms

- Summary  
  Get saved and unsaved platforms for a user

#### RequestBody

- application/json

```ts
{
}
```

#### Responses

- 200 Specified cookie has been deleted from the browser

`application/json`

```ts
{
  unsaved_platforms: {
    name?: string
    description?: {
      en?: string
      fa?: string
      fr?: string
    }
    logo?: string
    initialization_url?: string
    type?: string
    letter?: string
  }[]
  saved_platforms: {
    name?: string
    description?: {
      en?: string
      fa?: string
      fr?: string
    }
    logo?: string
    initialization_url?: string
    type?: string
    letter?: string
  }[]
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [POST]/users/{user_id}/password

- Summary  
  Modify a user's password

#### RequestBody

- application/json

```ts
{
  password?: string
  new_password?: string
}
```

#### Responses

- 200 Successful

`application/json`

```ts
{
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [POST]/recovery

- Summary  
  Initiate SMS Verification code for Recovery phone number

#### RequestBody

- application/json

```ts
{
  phone_number?: string
}
```

#### Responses

- 200 A cookie is stored in the browser

`application/json`

```ts
{
  uid?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [PUT]/users/{user_id}/recovery

- Summary  
  Set new recovery password

#### RequestBody

- application/json

```ts
{
  new_password?: string
}
```

#### Responses

- 200 Successful

`application/json`

```ts
{
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [DELETE]/users/{user_id}

- Summary  
  delete a user's account

#### RequestBody

- application/json

```ts
{
  password?: string
}
```

#### Responses

- 200 Successful

`application/json`

```ts
{
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [GET]/users/{user_id}/dashboard

- Summary  
  Get a user's dashboard

#### RequestBody

- application/json

```ts
{
}
```

#### Responses

- 200 Successful

`application/json`

```ts
{
  createdAt?: string
  updatedAt?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [POST]/users/{user_id}/OTP

- Summary  
  Trigger OTP code

#### RequestBody

- application/json

```ts
{
  phone_number?: string
}
```

#### Responses

- 201 OTP triggered successfully

`application/json`

```ts
{
  expires?: number
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 429 Too Many Requests

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [PUT]/OTP

- Summary  
  Verify OTP code

#### RequestBody

- application/json

```ts
{
  code?: string
}
```

#### Responses

- 200 OTP successfully verified

`application/json`

```ts
{
  expires?: string
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

---

### [POST]/users/{user_id}/logout

- Summary  
  Invalidates a User's session

#### RequestBody

- application/json

```ts
{
}
```

#### Responses

- 200 Specified cookie has been deleted from the browser

`application/json`

```ts
{
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 401 Unauthorized (e.g session invalid)

`application/json`

```ts
{
  "type": "string"
}
```

- 404 Not Found (e.g User not found)

`application/json`

```ts
{
  "type": "string"
}
```

- 409 Conflict (e.g Duplicate Users, Platforms found)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```

### [GET]/users?start=YYYY-MM-DD&end=YYYY-MM-DD&type={available/signup}&format={day/month}

- Summary  
  Get users analytics

#### Parameters

- **start** (required, string): Start date in the format YYYY-MM-DD.
- **end** (required, string): End date in the format YYYY-MM-DD.
- **type** (optional, string): Type of analytics to retrieve. Possible values:
  `available` or `signup`.
- **format** (optional, string): Format of the response. Possible values: `day`
  or `month`.

#### RequestBody

- application/json

```ts
{
}
```

#### Responses

- 200 Specified cookie has been deleted from the browser

`application/json`

```Json
{
   "2024": [
        [
            "March",
            1
        ]
    ],
    "countries": [
        [
            "Cameroon",
            "CM",
            1
        ]
    ],
    "total_countries": 1,
    "total_users": 1
}
```

- 400 Bad Request (e.g missing required fields)

`application/json`

```ts
{
  "type": "string"
}
```

- 500 Internal Server Error

`application/json`

```ts
{
  "type": "string"
}
```
