<!-- swob-backend-docs documentation master file, created by
 sphinx-quickstart on Thu Apr 27 16:55:19 2023.
 You can adapt this file completely to your liking, but it should at least
 contain the root `toctree` directive. -->
<!-- # Welcome to swob-backend-docs's documentation! -->
<img src="https://github.com/smswithoutborders/SMSWithoutBorders-Resources/raw/master/multimedia/img/swob_logo_icon.png" align="right" width="350px"/>
# SMSWithoutBorders Back-end Docs

This is a cloud API and User management service. It is directly configurable with MySQL databases for managing users. Also provides out of the box integrations of Google OAuth-2.0, Twitter OAuth, and Telegram end-points and Account authentication. Here, you’ll find the documentation.

## Contributing

We are thrilled to have you contribute to this docs project


* Please take a moment to read our [Contributing Guide](contributing.md) to learn about our development process.


* Open an [issue](https://github.com/smswithoutborders/SMSwithoutborders-BE/issues) first to discuss potential changes/additions.

## Licensing

This project is licensed under the GNU General Public License v3.0.

**WARNING**: This documentation is in progress

<!-- For further info, check out {doc}\`usage\`. -->
To install, see [Installation](contributing.md#installation).

## Contents:


* [Contributing Guide](contributing.md)


    * [Development process](contributing.md#development-process)


        * [Installation](contributing.md#installation)


* [src](modules.md)


    * [api_v2 module](api_v2.md)


        * [`before_request()`](api_v2.md#api_v2.before_request)


        * [`after_request()`](api_v2.md#api_v2.after_request)


        * [`signup()`](api_v2.md#api_v2.signup)


        * [`recovery()`](api_v2.md#api_v2.recovery)


        * [`recovery_check()`](api_v2.md#api_v2.recovery_check)


        * [`signin()`](api_v2.md#api_v2.signin)


        * [`OTP()`](api_v2.md#api_v2.OTP)


        * [`OTP_check()`](api_v2.md#api_v2.OTP_check)


        * [`manage_grant()`](api_v2.md#api_v2.manage_grant)


        * [`get_platforms()`](api_v2.md#api_v2.get_platforms)


        * [`dashboard()`](api_v2.md#api_v2.dashboard)


        * [`update_password()`](api_v2.md#api_v2.update_password)


        * [`verify_user_id()`](api_v2.md#api_v2.verify_user_id)


        * [`logout()`](api_v2.md#api_v2.logout)


        * [`delete_account()`](api_v2.md#api_v2.delete_account)


    * [models package](models.md)


        * [Submodules](models.md#submodules)


        * [models.broadcast module](models.md#module-models.broadcast)


        * [models.grants module](models.md#module-models.grants)


        * [models.sessions module](models.md#module-models.sessions)


        * [models.users module](models.md#module-models.users)


        * [Module contents](models.md#module-models)


    * [protocolHandler module](protocolHandler.md)


        * [`OAuth2`](protocolHandler.md#protocolHandler.OAuth2)


        * [`TwoFactor`](protocolHandler.md#protocolHandler.TwoFactor)


    * [schemas package](schemas.md)


        * [Submodules](schemas.md#submodules)


        * [schemas.credentials module](schemas.md#module-schemas.credentials)


        * [schemas.db_connector module](schemas.md#module-schemas.db_connector)


        * [schemas.retries module](schemas.md#module-schemas.retries)


        * [schemas.sessions module](schemas.md#module-schemas.sessions)


        * [schemas.svretries module](schemas.md#module-schemas.svretries)


        * [schemas.users module](schemas.md#module-schemas.users)


        * [schemas.usersinfo module](schemas.md#module-schemas.usersinfo)


        * [schemas.wallets module](schemas.md#module-schemas.wallets)


        * [Module contents](schemas.md#module-schemas)


    * [security package](security.md)


        * [Submodules](security.md#submodules)


        * [security.cookie module](security.md#module-security.cookie)


        * [security.data module](security.md#module-security.data)


        * [security.password_policy module](security.md#module-security.password_policy)


        * [Module contents](security.md#module-security)


# Indices and tables


* [Index](genindex.md)


* [Module Index](py-modindex.md)


* [Search Page](search.md)
