# Settings Module

## Class: `Configurations`

This class exposes config variables to the codebase in the form of Configurations class variables.

**base:**

- `baseConfig`: The base configuration consisting of SSL_PORT, SSL_CERTIFICATE, SSL_KEY, SSL_PEM and SECURE_COOKIE, which is set depending on development or production environment.

**Note:**

- `(env)` implies a variable is an environment variable

- An environment variable's corresponds to it's placeholder name. For example:
  - if `MYSQL_HOST (str, env)` is a variable, then it is an environment variable with name `MYSQL_HOST`, and is a string, eg: `"localhost"`, and can be accessed in the codebase using `Configurations.MYSQL_HOST`.
  - if `SSL_CERTIFICATE (path, env)` is a variable, then it is an environment variable with name `SSL_CERTIFICATE`, and is a path string, eg: `"/path/to/ssl_crt_file"`, and can be accessed in the codebase using `Configurations.SSL_CERTIFICATE`.

- Key files should end with `.key`

### Class Variables

- `SSL_PORT (int, env)`: The SSL Port
- `SSL_CERTIFICATE (path, env)`: The SSL Certificate file path
- `SSL_KEY (path, env)`: The SSL Key file path
- `SSL_PEM (path, env)`: The SSL Pem file path

<br />

- `SECURE_COOKIE (bool)`: Whether to use secure cookies. (True for production, False for development). Value for the `Secure` Set-Cookie attribute

- `MYSQL_HOST (str, env)`: The MySQL host address
- `MYSQL_USER (str, env)`: The MySQL user (avoid using root user)
- `MYSQL_PASSWORD (str, env)`: The MySQL user password
- `MYSQL_DATABASE (str, env)`: The MySL database name

<br />

- `SHARED_KEY (path, env)`: The path to encryption key file used in encryption and decryption operations
- `HASHING_SALT (path, env)`: The path to hashing salt key file used in hashing operations

<br />

- `COOKIE_NAME (str)`: The cookie name, defaults to `"SWOB"`
- `COOKIE_MAXAGE (int)`: Specifies the cookie maxAge in milliseconds. Defaults to `900000` (15 mins)
- `SESSION_MAXAGE (int)`: Specifies the session maxAge in milliseconds. Defaults to `2700000` (45 mins)

<br />

- `ENABLE_BLOCKING (bool)`:  Specifies the boolean value for tracking user failed verification attempts. Defaults to True
- `SHORT_BLOCK_ATTEMPTS (int)`: Specifies the number of failed authentication attempts before a short block. Several short blocks result to a long block. Defaults to `5`
- `LONG_BLOCK_ATTEMPTS (int)`: Specifies the number of short block attempts before a long block. Defaults to `3`
- `SHORT_BLOCK_DURATION (int)`: Specifies the duration (in minutes) of a short block. Defaults to `15`
- `LONG_BLOCK_DURATION (int)`: Specifies the duration (in minutes) of a long block. Defaults to `1440` (24hrs)

<br />

- `ENABLE_OTP (bool)`: Specifies the boolean value for switching on or off tracking OTP code requests
- `FIRST_RESEND_DURATION (int)`: Specifies the duration (in milliseconds) for the first OTP request. Defaults to `120000` (2min)
- `SECOND_RESEND_DURATION (int)`: Specifies the duration (in milliseconds) for the second OTP request. Defaults to `300000` (5min)
- `THIRD_RESEND_DURATION (int)`: Specifies the duration (in milliseconds) for the third OTP request. Defaults to `900000` (15min)
- `FOURTH_RESEND_DURATION (int)`: Specifies the duration (in milliseconds) for the furth OTP request. Defaults to `86400000` (24hrs)

<br />

- `HOST (str, env)`: The server host. eg `localhost`
- `PORT (int, env)`: The server port. eg: `9000`
- `ORIGINS (str, env)`: An array of acceptable origins for CORS. eg: `'["http://localhost:18000"]'`

<br />

- `TWILIO_ACCOUNT_SID (str, env)`: Your twilio account identifier
- `TWILIO_AUTH_TOKEN (str, env)`: Your twilio auth token
- `TWILIO_SERVICE_SID (str, env)`: Your twilio verification service identifier

<br />

- `ENABLE_RECAPTCHA (bool)`: Specifies the boolean value to enable or disable recaptcha
- `RECAPTCHA_SECRET_KEY (str, env)`: Your recaptcha secret key

<br />

- `BROADCAST_WHITELIST (path, env)`: Specifies the whitelist file containing URLs to be broadcasted to
