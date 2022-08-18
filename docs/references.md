---
title: SMSwithoutBorders API v2.0.0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2
---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="smswithoutborders-api">SMSwithoutBorders API v2.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

Base URLs:

- <a href="http://localhost:9000/v2">http://localhost:9000/v2</a>

<h1 id="smswithoutborders-api-wallets">Wallets</h1>

Manage all user wallets

## post\__users_{user*id}\_platforms*{platform}_protocols_{protocol}

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol} HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "phone_number": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /users/{user_id}/platforms/{platform}/protocols/{protocol}`

_initialize a new wallet. Request body for Gmail = {}, Twitter = {}, Telegram = {phone_number}_

> Body parameter

```json
{
  "phone_number": "string"
}
```

<h3 id="post__users_{user_id}_platforms_{platform}_protocols_{protocol}-parameters">Parameters</h3>

| Name           | In   | Type   | Required | Description                 |
| -------------- | ---- | ------ | -------- | --------------------------- |
| user_id        | path | string | true     | User's Id                   |
| platform       | path | string | true     | Platform's name (e.g gmail) |
| protocol       | path | string | true     | Protocol's name (e.g oauth) |
| body           | body | object | true     | none                        |
| » phone_number | body | string | false    | none                        |

> Example responses

> 200 Response

```json
{
  "url": "string",
  "body": "string",
  "platform": "string"
}
```

<h3 id="post__users_{user_id}_platforms_{platform}_protocols_{protocol}-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                | Schema |
| ------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful. Response body for Gmail = {url, platform}, Twitter = {url, platform}, Telegram: (body[200 - Unauthorized, 201 - response code required], platform). The state of Telegram responses are in 'body' and should be parsed for current state of Telegram app. 200 meaning the user is not authorized to make this request, 201 meaning code has been sent back to user via SMS or Telegram session | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)                                                                                                                                                                                                                                                                                                                                                                  | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g User, Platform not found)                                                                                                                                                                                                                                                                                                                                                                | string |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)             | Forbidden (e.g Invalid verification session)                                                                                                                                                                                                                                                                                                                                                               | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                                                                                                                                                                                                                                                                                                                                                                             | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found)                                                                                                                                                                                                                                                                                                                                                            | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                                                                                                                                                                                                                                                                                                                                                                                      | string |

<h3 id="post__users_{user_id}_platforms_{platform}_protocols_{protocol}-responseschema">Response Schema</h3>

Status Code **200**

| Name       | Type   | Required | Restrictions | Description |
| ---------- | ------ | -------- | ------------ | ----------- |
| » url      | string | false    | none         | none        |
| » body     | string | false    | none         | none        |
| » platform | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## put\__users_{user*id}\_platforms*{platform}_protocols_{protocol}

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
PUT http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol} HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "code": "string",
  "oauth_token": "string",
  "oauth_verifier": "string",
  "phone_number": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.put 'http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.put('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /users/{user_id}/platforms/{platform}/protocols/{protocol}`

_Verify a new wallet. Request body for Gmail = {code}, Twitter = {oauth_token, oauth_verifier}, Telegram = {phone_number, code}_

> Body parameter

```json
{
  "code": "string",
  "oauth_token": "string",
  "oauth_verifier": "string",
  "phone_number": "string"
}
```

<h3 id="put__users_{user_id}_platforms_{platform}_protocols_{protocol}-parameters">Parameters</h3>

| Name             | In   | Type   | Required | Description                 |
| ---------------- | ---- | ------ | -------- | --------------------------- |
| user_id          | path | string | true     | User's Id                   |
| platform         | path | string | true     | Platform's name (e.g gmail) |
| protocol         | path | string | true     | Protocol's name (e.g oauth) |
| body             | body | object | true     | none                        |
| » code           | body | string | false    | none                        |
| » oauth_token    | body | string | false    | none                        |
| » oauth_verifier | body | string | false    | none                        |
| » phone_number   | body | string | false    | none                        |

> Example responses

> 200 Response

```json
{
  "body": "string",
  "initialization_url": "string"
}
```

<h3 id="put__users_{user_id}_platforms_{platform}_protocols_{protocol}-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                | Schema |
| ------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful. Response body for Gmail = {}, Twitter = {}, Telegram: (body[202 - create a telegram account], initialization_url). The state of Telegram responses are in 'body' and should be parsed for current state of Telegram app. 202 meaning the user doesn't have a telegram account and need to create one. If body is 202 it comes with an initialization_url to start the next step of creating a telegram account | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)                                                                                                                                                                                                                                                                                                                                                                                  | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g User, Platform not found)                                                                                                                                                                                                                                                                                                                                                                                | string |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)             | Forbidden (e.g User does not have access rights to the content, invalid verification code)                                                                                                                                                                                                                                                                                                                                 | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                                                                                                                                                                                                                                                                                                                                                                                             | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found)                                                                                                                                                                                                                                                                                                                                                                            | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                                                                                                                                                                                                                                                                                                                                                                                                      | string |

<h3 id="put__users_{user_id}_platforms_{platform}_protocols_{protocol}-responseschema">Response Schema</h3>

Status Code **200**

| Name                 | Type   | Required | Restrictions | Description |
| -------------------- | ------ | -------- | ------------ | ----------- |
| » body               | string | false    | none         | none        |
| » initialization_url | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## delete\__users_{user*id}\_platforms*{platform}_protocols_{protocol}

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
DELETE http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol} HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}',
{
  method: 'DELETE',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.delete 'http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.delete('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('DELETE','http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("DELETE");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("DELETE", "http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`DELETE /users/{user_id}/platforms/{platform}/protocols/{protocol}`

_Delete wallet_

> Body parameter

```json
{
  "password": "string"
}
```

<h3 id="delete__users_{user_id}_platforms_{platform}_protocols_{protocol}-parameters">Parameters</h3>

| Name       | In   | Type   | Required | Description                 |
| ---------- | ---- | ------ | -------- | --------------------------- |
| user_id    | path | string | true     | User's Id                   |
| platform   | path | string | true     | Platform's name (e.g gmail) |
| protocol   | path | string | true     | Protocol's name (e.g oauth) |
| body       | body | object | true     | none                        |
| » password | body | string | false    | none                        |

> Example responses

> 200 Response

```json
{}
```

<h3 id="delete__users_{user_id}_platforms_{platform}_protocols_{protocol}-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                                                                | Schema |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful                                                                                 | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)                                                  | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g User, Platform not found)                                                | string |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)             | Forbidden (e.g User does not have access rights to the content, invalid verification code) | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                                                             | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found)                                            | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                                                                      | string |

<h3 id="delete__users_{user_id}_platforms_{platform}_protocols_{protocol}-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="smswithoutborders-api-register-on-platforms">Register on platforms</h1>

Create an account on a third party platform

## put\__users_{user*id}\_platforms*{platform}_protocols_{protocol}\_{action}

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
PUT http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action} HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.put 'http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.put('http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:9000/v2/users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /users/{user_id}/platforms/{platform}/protocols/{protocol}/{action}`

_Token Verification. Request body for Telegram = {phone_number, first_name, last_name}_

> Body parameter

```json
{
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string"
}
```

<h3 id="put__users_{user_id}_platforms_{platform}_protocols_{protocol}_{action}-parameters">Parameters</h3>

| Name           | In   | Type   | Required | Description                 |
| -------------- | ---- | ------ | -------- | --------------------------- |
| user_id        | path | string | true     | User's Id                   |
| platform       | path | string | true     | Platform's name (e.g gmail) |
| protocol       | path | string | true     | Protocol's name (e.g oauth) |
| action         | path | string | false    | e.g register                |
| body           | body | object | true     | none                        |
| » first_name   | body | string | false    | none                        |
| » last_name    | body | string | false    | none                        |
| » phone_number | body | string | false    | none                        |

> Example responses

> 200 Response

```json
{
  "body": "string",
  "initialization_url": "string"
}
```

<h3 id="put__users_{user_id}_platforms_{platform}_protocols_{protocol}_{action}-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                                                                                                                                                                                                                                                                                                                | Schema |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful. Response body for Telegram: (body = '', initialization_url = ''). The state of Telegram responses are in 'body' and should be parsed for current state of Telegram app. Empty body string (body=''), and empty initialization_url string (initialization_url='') meaning the users account was created and stored successfully | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)                                                                                                                                                                                                                                                                                                  | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g User, Platform not found)                                                                                                                                                                                                                                                                                                | string |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)             | Forbidden (e.g User does not have access rights to the content, invalid verification code)                                                                                                                                                                                                                                                 | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                                                                                                                                                                                                                                                                                                             | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found)                                                                                                                                                                                                                                                                                            | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                                                                                                                                                                                                                                                                                                                      | string |

<h3 id="put__users_{user_id}_platforms_{platform}_protocols_{protocol}_{action}-responseschema">Response Schema</h3>

Status Code **200**

| Name                 | Type   | Required | Restrictions | Description |
| -------------------- | ------ | -------- | ------------ | ----------- |
| » body               | string | false    | none         | none        |
| » initialization_url | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="smswithoutborders-api-authentication">Authentication</h1>

Login and Signup

## post\_\_signup

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/signup \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/signup HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "phone_number": "string",
  "name": "string",
  "country_code": "string",
  "password": "string",
  "captcha_token": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/signup',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/signup',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/signup', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/signup', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/signup");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/signup", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /signup`

_Create a new User_

> Body parameter

```json
{
  "phone_number": "string",
  "name": "string",
  "country_code": "string",
  "password": "string",
  "captcha_token": "string"
}
```

<h3 id="post__signup-parameters">Parameters</h3>

| Name            | In   | Type   | Required | Description |
| --------------- | ---- | ------ | -------- | ----------- |
| body            | body | object | true     | none        |
| » phone_number  | body | string | false    | none        |
| » name          | body | string | false    | none        |
| » country_code  | body | string | false    | none        |
| » password      | body | string | false    | none        |
| » captcha_token | body | string | false    | none        |

> Example responses

> 200 Response

```json
{
  "uid": "string"
}
```

<h3 id="post__signup-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | A cerification code is sent to the user         | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g User, Platform not found)     | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="post__signup-responseschema">Response Schema</h3>

Status Code **200**

| Name  | Type   | Required | Restrictions | Description |
| ----- | ------ | -------- | ------------ | ----------- |
| » uid | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## put\_\_signup

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:9000/v2/signup \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
PUT http://localhost:9000/v2/signup HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = "{}";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

fetch("http://localhost:9000/v2/signup", {
  method: "PUT",
  body: inputBody,
  headers: headers,
})
  .then(function (res) {
    return res.json();
  })
  .then(function (body) {
    console.log(body);
  });
```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.put 'http://localhost:9000/v2/signup',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.put('http://localhost:9000/v2/signup', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:9000/v2/signup', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/signup");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:9000/v2/signup", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /signup`

_Validate a new User_

> Body parameter

```json
{}
```

<h3 id="put__signup-parameters">Parameters</h3>

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| body | body | object | true     | none        |

> Example responses

> 200 Response

```json
{}
```

<h3 id="put__signup-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful                                      | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g User, Platform not found)     | string |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)             | Forbidden (e.g Invalid verification session)    | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="put__signup-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## post\_\_login

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/login HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "phone_number": "string",
  "password": "string",
  "captcha_token": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/login',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/login',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/login', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/login', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/login");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/login", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /login`

_Authenticate a User with their phone number_

> Body parameter

```json
{
  "phone_number": "string",
  "password": "string",
  "captcha_token": "string"
}
```

<h3 id="post__login-parameters">Parameters</h3>

| Name            | In   | Type   | Required | Description |
| --------------- | ---- | ------ | -------- | ----------- |
| body            | body | object | true     | none        |
| » phone_number  | body | string | false    | none        |
| » password      | body | string | false    | none        |
| » captcha_token | body | string | false    | none        |

> Example responses

> 200 Response

```json
{
  "uid": "string"
}
```

<h3 id="post__login-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | A cookie is stored in the browser               | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)         | Too Many Requests                               | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="post__login-responseschema">Response Schema</h3>

Status Code **200**

| Name  | Type   | Required | Restrictions | Description |
| ----- | ------ | -------- | ------------ | ----------- |
| » uid | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## post\__users_{user_id}\_verify

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/users/{user_id}/verify \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/users/{user_id}/verify HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/verify',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/users/{user_id}/verify',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/users/{user_id}/verify', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/users/{user_id}/verify', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/verify");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/users/{user_id}/verify", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /users/{user_id}/verify`

_Authenticate a User with their user's ID_

> Body parameter

```json
{
  "password": "string"
}
```

<h3 id="post__users_{user_id}_verify-parameters">Parameters</h3>

| Name       | In   | Type   | Required | Description |
| ---------- | ---- | ------ | -------- | ----------- |
| user_id    | path | string | true     | User's Id   |
| body       | body | object | true     | none        |
| » password | body | string | false    | none        |

> Example responses

> 200 Response

```json
{
  "uid": "string"
}
```

<h3 id="post__users_{user_id}_verify-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | A cookie is stored in the browser               | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)         | Too Many Requests                               | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="post__users_{user_id}_verify-responseschema">Response Schema</h3>

Status Code **200**

| Name  | Type   | Required | Restrictions | Description |
| ----- | ------ | -------- | ------------ | ----------- |
| » uid | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## post\__users_{user_id}\_logout

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/users/{user_id}/logout \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/users/{user_id}/logout HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = "{}";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

fetch("http://localhost:9000/v2/users/{user_id}/logout", {
  method: "POST",
  body: inputBody,
  headers: headers,
})
  .then(function (res) {
    return res.json();
  })
  .then(function (body) {
    console.log(body);
  });
```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/users/{user_id}/logout',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/users/{user_id}/logout', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/users/{user_id}/logout', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/logout");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/users/{user_id}/logout", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /users/{user_id}/logout`

_Invalidates a User's session_

> Body parameter

```json
{}
```

<h3 id="post__users_{user_id}_logout-parameters">Parameters</h3>

| Name    | In   | Type   | Required | Description |
| ------- | ---- | ------ | -------- | ----------- |
| user_id | path | string | true     | User's Id   |
| body    | body | object | true     | none        |

> Example responses

> 200 Response

```json
{}
```

<h3 id="post__users_{user_id}_logout-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                        | Schema |
| ------ | -------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Specified cookie has been deleted from the browser | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)          | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)                 | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                     | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found)    | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                              | string |

<h3 id="post__users_{user_id}_logout-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="smswithoutborders-api-platforms">Platforms</h1>

Handling platforms

## get\__users_{user_id}\_platforms

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:9000/v2/users/{user_id}/platforms \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
GET http://localhost:9000/v2/users/{user_id}/platforms HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = "{}";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

fetch("http://localhost:9000/v2/users/{user_id}/platforms", {
  method: "GET",
  body: inputBody,
  headers: headers,
})
  .then(function (res) {
    return res.json();
  })
  .then(function (body) {
    console.log(body);
  });
```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:9000/v2/users/{user_id}/platforms',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.get('http://localhost:9000/v2/users/{user_id}/platforms', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:9000/v2/users/{user_id}/platforms', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/platforms");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:9000/v2/users/{user_id}/platforms", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /users/{user_id}/platforms`

_Get saved and unsaved platforms for a user_

> Body parameter

```json
{}
```

<h3 id="get__users_{user_id}_platforms-parameters">Parameters</h3>

| Name    | In   | Type   | Required | Description |
| ------- | ---- | ------ | -------- | ----------- |
| user_id | path | string | true     | User's Id   |
| body    | body | object | true     | none        |

> Example responses

> 200 Response

```json
{
  "unsaved_platforms": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "logo": "string",
      "initialization_url": "string",
      "type": "string",
      "letter": "string"
    }
  ],
  "saved_platforms": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "logo": "string",
      "initialization_url": "string",
      "type": "string",
      "letter": "string"
    }
  ]
}
```

<h3 id="get__users_{user_id}_platforms-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                        | Schema |
| ------ | -------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Specified cookie has been deleted from the browser | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)          | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)                 | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                     | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found)    | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                              | string |

<h3 id="get__users_{user_id}_platforms-responseschema">Response Schema</h3>

Status Code **200**

| Name                  | Type     | Required | Restrictions | Description |
| --------------------- | -------- | -------- | ------------ | ----------- |
| » unsaved_platforms   | [object] | false    | none         | none        |
| »» id                 | string   | false    | none         | none        |
| »» name               | string   | false    | none         | none        |
| »» description        | string   | false    | none         | none        |
| »» logo               | string   | false    | none         | none        |
| »» initialization_url | string   | false    | none         | none        |
| »» type               | string   | false    | none         | none        |
| »» letter             | string   | false    | none         | none        |
| » saved_platforms     | [object] | false    | none         | none        |
| »» id                 | string   | false    | none         | none        |
| »» name               | string   | false    | none         | none        |
| »» description        | string   | false    | none         | none        |
| »» logo               | string   | false    | none         | none        |
| »» initialization_url | string   | false    | none         | none        |
| »» type               | string   | false    | none         | none        |
| »» letter             | string   | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="smswithoutborders-api-users">Users</h1>

Manage a user's account

## post\__users_{user_id}\_password

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/users/{user_id}/password \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/users/{user_id}/password HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "password": "string",
  "new_password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/password',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/users/{user_id}/password',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/users/{user_id}/password', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/users/{user_id}/password', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/password");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/users/{user_id}/password", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /users/{user_id}/password`

_Modify a user's password_

> Body parameter

```json
{
  "password": "string",
  "new_password": "string"
}
```

<h3 id="post__users_{user_id}_password-parameters">Parameters</h3>

| Name           | In   | Type   | Required | Description |
| -------------- | ---- | ------ | -------- | ----------- |
| user_id        | path | string | true     | User's Id   |
| body           | body | object | true     | none        |
| » password     | body | string | false    | none        |
| » new_password | body | string | false    | none        |

> Example responses

> 200 Response

```json
{}
```

<h3 id="post__users_{user_id}_password-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful                                      | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="post__users_{user_id}_password-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## post\_\_recovery

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/recovery \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/recovery HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "phone_number": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/recovery',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/recovery',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/recovery', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/recovery', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/recovery");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/recovery", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /recovery`

_Initiate SMS Verification code for Recovery phone number_

> Body parameter

```json
{
  "phone_number": "string"
}
```

<h3 id="post__recovery-parameters">Parameters</h3>

| Name           | In   | Type   | Required | Description |
| -------------- | ---- | ------ | -------- | ----------- |
| body           | body | object | true     | none        |
| » phone_number | body | string | false    | none        |

> Example responses

> 200 Response

```json
{
  "uid": "string"
}
```

<h3 id="post__recovery-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | A cookie is stored in the browser               | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="post__recovery-responseschema">Response Schema</h3>

Status Code **200**

| Name  | Type   | Required | Restrictions | Description |
| ----- | ------ | -------- | ------------ | ----------- |
| » uid | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## put\__users_{user_id}\_recovery

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:9000/v2/users/{user_id}/recovery \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
PUT http://localhost:9000/v2/users/{user_id}/recovery HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "new_password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/recovery',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.put 'http://localhost:9000/v2/users/{user_id}/recovery',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.put('http://localhost:9000/v2/users/{user_id}/recovery', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:9000/v2/users/{user_id}/recovery', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/recovery");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:9000/v2/users/{user_id}/recovery", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /users/{user_id}/recovery`

_Set new recovery password_

> Body parameter

```json
{
  "new_password": "string"
}
```

<h3 id="put__users_{user_id}_recovery-parameters">Parameters</h3>

| Name           | In   | Type   | Required | Description |
| -------------- | ---- | ------ | -------- | ----------- |
| user_id        | path | string | true     | User's Id   |
| body           | body | object | true     | none        |
| » new_password | body | string | false    | none        |

> Example responses

> 200 Response

```json
{}
```

<h3 id="put__users_{user_id}_recovery-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful                                      | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="put__users_{user_id}_recovery-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## delete\__users_{user_id}

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:9000/v2/users/{user_id} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
DELETE http://localhost:9000/v2/users/{user_id} HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}',
{
  method: 'DELETE',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.delete 'http://localhost:9000/v2/users/{user_id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.delete('http://localhost:9000/v2/users/{user_id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('DELETE','http://localhost:9000/v2/users/{user_id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("DELETE");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("DELETE", "http://localhost:9000/v2/users/{user_id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`DELETE /users/{user_id}`

_delete a user's account_

> Body parameter

```json
{
  "password": "string"
}
```

<h3 id="delete__users_{user_id}-parameters">Parameters</h3>

| Name       | In   | Type   | Required | Description |
| ---------- | ---- | ------ | -------- | ----------- |
| user_id    | path | string | true     | User's Id   |
| body       | body | object | true     | none        |
| » password | body | string | false    | none        |

> Example responses

> 200 Response

```json
{}
```

<h3 id="delete__users_{user_id}-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful                                      | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="delete__users_{user_id}-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## get\__users_{user_id}\_dashboard

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:9000/v2/users/{user_id}/dashboard \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
GET http://localhost:9000/v2/users/{user_id}/dashboard HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = "{}";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

fetch("http://localhost:9000/v2/users/{user_id}/dashboard", {
  method: "GET",
  body: inputBody,
  headers: headers,
})
  .then(function (res) {
    return res.json();
  })
  .then(function (body) {
    console.log(body);
  });
```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:9000/v2/users/{user_id}/dashboard',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.get('http://localhost:9000/v2/users/{user_id}/dashboard', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:9000/v2/users/{user_id}/dashboard', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/dashboard");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:9000/v2/users/{user_id}/dashboard", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /users/{user_id}/dashboard`

_Get a user's dashboard_

> Body parameter

```json
{}
```

<h3 id="get__users_{user_id}_dashboard-parameters">Parameters</h3>

| Name    | In   | Type   | Required | Description |
| ------- | ---- | ------ | -------- | ----------- |
| user_id | path | string | true     | User's Id   |
| body    | body | object | true     | none        |

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "updatedAt": "string"
}
```

<h3 id="get__users_{user_id}_dashboard-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful                                      | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="get__users_{user_id}_dashboard-responseschema">Response Schema</h3>

Status Code **200**

| Name        | Type   | Required | Restrictions | Description |
| ----------- | ------ | -------- | ------------ | ----------- |
| » createdAt | string | false    | none         | none        |
| » updatedAt | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="smswithoutborders-api-otp">OTP</h1>

Manage a OTP

## post\__users_{user_id}\_OTP

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:9000/v2/users/{user_id}/OTP \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:9000/v2/users/{user_id}/OTP HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "phone_number": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:9000/v2/users/{user_id}/OTP',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:9000/v2/users/{user_id}/OTP',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:9000/v2/users/{user_id}/OTP', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:9000/v2/users/{user_id}/OTP', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/users/{user_id}/OTP");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:9000/v2/users/{user_id}/OTP", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /users/{user_id}/OTP`

_Trigger OTP code_

> Body parameter

```json
{
  "phone_number": "string"
}
```

<h3 id="post__users_{user_id}_otp-parameters">Parameters</h3>

| Name           | In   | Type   | Required | Description |
| -------------- | ---- | ------ | -------- | ----------- |
| user_id        | path | string | true     | User's Id   |
| body           | body | object | true     | none        |
| » phone_number | body | string | false    | none        |

> Example responses

> 201 Response

```json
{
  "expires": 0
}
```

<h3 id="post__users_{user_id}_otp-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)               | OTP triggered successfully                      | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)         | Too Many Requests                               | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="post__users_{user_id}_otp-responseschema">Response Schema</h3>

Status Code **201**

| Name      | Type   | Required | Restrictions | Description |
| --------- | ------ | -------- | ------------ | ----------- |
| » expires | number | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## put\_\_OTP

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:9000/v2/OTP \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
PUT http://localhost:9000/v2/OTP HTTP/1.1
Host: localhost:9000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = "{}";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

fetch("http://localhost:9000/v2/OTP", {
  method: "PUT",
  body: inputBody,
  headers: headers,
})
  .then(function (res) {
    return res.json();
  })
  .then(function (body) {
    console.log(body);
  });
```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.put 'http://localhost:9000/v2/OTP',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.put('http://localhost:9000/v2/OTP', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:9000/v2/OTP', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:9000/v2/OTP");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:9000/v2/OTP", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /OTP`

_Verify OTP code_

> Body parameter

```json
{}
```

<h3 id="put__otp-parameters">Parameters</h3>

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| body | body | object | true     | none        |

> Example responses

> 200 Response

```json
{
  "expires": "string"
}
```

<h3 id="put__otp-responses">Responses</h3>

| Status | Meaning                                                                    | Description                                     | Schema |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | OTP successfully verified                       | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)           | Bad Request (e.g missing required fields)       | string |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)            | Unauthorized (e.g session invalid)              | string |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)             | Not Found (e.g User not found)                  | string |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)              | Conflict (e.g Duplicate Users, Platforms found) | string |
| 500    | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | Internal Server Error                           | string |

<h3 id="put__otp-responseschema">Response Schema</h3>

Status Code **200**

| Name      | Type   | Required | Restrictions | Description |
| --------- | ------ | -------- | ------------ | ----------- |
| » expires | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>
