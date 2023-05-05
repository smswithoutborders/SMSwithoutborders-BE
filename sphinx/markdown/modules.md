# src


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


        * [`publish()`](models.md#models.broadcast.publish)


    * [models.grants module](models.md#module-models.grants)


        * [`Grant_Model`](models.md#models.grants.Grant_Model)


            * [`Grant_Model.__init__()`](models.md#models.grants.Grant_Model.__init__)


            * [`Grant_Model.store()`](models.md#models.grants.Grant_Model.store)


            * [`Grant_Model.decrypt()`](models.md#models.grants.Grant_Model.decrypt)


            * [`Grant_Model.delete()`](models.md#models.grants.Grant_Model.delete)


            * [`Grant_Model.find()`](models.md#models.grants.Grant_Model.find)


            * [`Grant_Model.find_all()`](models.md#models.grants.Grant_Model.find_all)


            * [`Grant_Model.purge()`](models.md#models.grants.Grant_Model.purge)


    * [models.sessions module](models.md#module-models.sessions)


        * [`Session_Model`](models.md#models.sessions.Session_Model)


            * [`Session_Model.__init__()`](models.md#models.sessions.Session_Model.__init__)


            * [`Session_Model.Sessions`](models.md#models.sessions.Session_Model.Sessions)


            * [`Session_Model.cookie_data`](models.md#models.sessions.Session_Model.cookie_data)


            * [`Session_Model.create()`](models.md#models.sessions.Session_Model.create)


            * [`Session_Model.find()`](models.md#models.sessions.Session_Model.find)


            * [`Session_Model.update()`](models.md#models.sessions.Session_Model.update)


    * [models.users module](models.md#module-models.users)


        * [`User_Model`](models.md#models.users.User_Model)


            * [`User_Model.__init__()`](models.md#models.users.User_Model.__init__)


            * [`User_Model.create()`](models.md#models.users.User_Model.create)


            * [`User_Model.verify()`](models.md#models.users.User_Model.verify)


            * [`User_Model.find()`](models.md#models.users.User_Model.find)


            * [`User_Model.find_platform()`](models.md#models.users.User_Model.find_platform)


            * [`User_Model.update()`](models.md#models.users.User_Model.update)


            * [`User_Model.delete()`](models.md#models.users.User_Model.delete)


            * [`User_Model.recaptcha()`](models.md#models.users.User_Model.recaptcha)


            * [`User_Model.check_count()`](models.md#models.users.User_Model.check_count)


            * [`User_Model.add_count()`](models.md#models.users.User_Model.add_count)


            * [`User_Model.delete_count()`](models.md#models.users.User_Model.delete_count)


    * [Module contents](models.md#module-models)


* [protocolHandler module](protocolHandler.md)


    * [`OAuth2`](protocolHandler.md#protocolHandler.OAuth2)


        * [`OAuth2.origin`](protocolHandler.md#protocolHandler.OAuth2.origin)


        * [`OAuth2.platform_name`](protocolHandler.md#protocolHandler.OAuth2.platform_name)


        * [`OAuth2.Platform`](protocolHandler.md#protocolHandler.OAuth2.Platform)


        * [`OAuth2.Methods`](protocolHandler.md#protocolHandler.OAuth2.Methods)


        * [`OAuth2.__init__()`](protocolHandler.md#protocolHandler.OAuth2.__init__)


        * [`OAuth2.authorization()`](protocolHandler.md#protocolHandler.OAuth2.authorization)


        * [`OAuth2.validation()`](protocolHandler.md#protocolHandler.OAuth2.validation)


        * [`OAuth2.invalidation()`](protocolHandler.md#protocolHandler.OAuth2.invalidation)


    * [`TwoFactor`](protocolHandler.md#protocolHandler.TwoFactor)


        * [`TwoFactor.identifier`](protocolHandler.md#protocolHandler.TwoFactor.identifier)


        * [`TwoFactor.platform_name`](protocolHandler.md#protocolHandler.TwoFactor.platform_name)


        * [`TwoFactor.Platform`](protocolHandler.md#protocolHandler.TwoFactor.Platform)


        * [`TwoFactor.Methods`](protocolHandler.md#protocolHandler.TwoFactor.Methods)


        * [`TwoFactor.__init__()`](protocolHandler.md#protocolHandler.TwoFactor.__init__)


        * [`TwoFactor.authorization()`](protocolHandler.md#protocolHandler.TwoFactor.authorization)


        * [`TwoFactor.validation()`](protocolHandler.md#protocolHandler.TwoFactor.validation)


        * [`TwoFactor.registration()`](protocolHandler.md#protocolHandler.TwoFactor.registration)


        * [`TwoFactor.invalidation()`](protocolHandler.md#protocolHandler.TwoFactor.invalidation)


* [schemas package](schemas.md)


    * [Submodules](schemas.md#submodules)


    * [schemas.credentials module](schemas.md#module-schemas.credentials)


        * [`Credentials`](schemas.md#schemas.credentials.Credentials)


            * [`Credentials.shared_key`](schemas.md#schemas.credentials.Credentials.shared_key)


            * [`Credentials.hashing_salt`](schemas.md#schemas.credentials.Credentials.hashing_salt)


            * [`Credentials.createdAt`](schemas.md#schemas.credentials.Credentials.createdAt)


            * [`Credentials.DoesNotExist`](schemas.md#schemas.credentials.Credentials.DoesNotExist)


            * [`Credentials.id`](schemas.md#schemas.credentials.Credentials.id)


    * [schemas.db_connector module](schemas.md#module-schemas.db_connector)


        * [`create_database_if_not_exits()`](schemas.md#schemas.db_connector.create_database_if_not_exits)


    * [schemas.retries module](schemas.md#module-schemas.retries)


        * [`Retries`](schemas.md#schemas.retries.Retries)


            * [`Retries.uniqueId`](schemas.md#schemas.retries.Retries.uniqueId)


            * [`Retries.count`](schemas.md#schemas.retries.Retries.count)


            * [`Retries.block`](schemas.md#schemas.retries.Retries.block)


            * [`Retries.expires`](schemas.md#schemas.retries.Retries.expires)


            * [`Retries.createdAt`](schemas.md#schemas.retries.Retries.createdAt)


            * [`Retries.DoesNotExist`](schemas.md#schemas.retries.Retries.DoesNotExist)


            * [`Retries.id`](schemas.md#schemas.retries.Retries.id)


    * [schemas.sessions module](schemas.md#module-schemas.sessions)


        * [`Sessions`](schemas.md#schemas.sessions.Sessions)


            * [`Sessions.sid`](schemas.md#schemas.sessions.Sessions.sid)


            * [`Sessions.unique_identifier`](schemas.md#schemas.sessions.Sessions.unique_identifier)


            * [`Sessions.user_agent`](schemas.md#schemas.sessions.Sessions.user_agent)


            * [`Sessions.expires`](schemas.md#schemas.sessions.Sessions.expires)


            * [`Sessions.data`](schemas.md#schemas.sessions.Sessions.data)


            * [`Sessions.status`](schemas.md#schemas.sessions.Sessions.status)


            * [`Sessions.type`](schemas.md#schemas.sessions.Sessions.type)


            * [`Sessions.createdAt`](schemas.md#schemas.sessions.Sessions.createdAt)


            * [`Sessions.DoesNotExist`](schemas.md#schemas.sessions.Sessions.DoesNotExist)


    * [schemas.svretries module](schemas.md#module-schemas.svretries)


        * [`Svretries`](schemas.md#schemas.svretries.Svretries)


            * [`Svretries.userId`](schemas.md#schemas.svretries.Svretries.userId)


            * [`Svretries.uniqueId`](schemas.md#schemas.svretries.Svretries.uniqueId)


            * [`Svretries.count`](schemas.md#schemas.svretries.Svretries.count)


            * [`Svretries.expires`](schemas.md#schemas.svretries.Svretries.expires)


            * [`Svretries.createdAt`](schemas.md#schemas.svretries.Svretries.createdAt)


            * [`Svretries.DoesNotExist`](schemas.md#schemas.svretries.Svretries.DoesNotExist)


            * [`Svretries.id`](schemas.md#schemas.svretries.Svretries.id)


    * [schemas.users module](schemas.md#module-schemas.users)


        * [`Users`](schemas.md#schemas.users.Users)


            * [`Users.id`](schemas.md#schemas.users.Users.id)


            * [`Users.password`](schemas.md#schemas.users.Users.password)


            * [`Users.current_login`](schemas.md#schemas.users.Users.current_login)


            * [`Users.last_login`](schemas.md#schemas.users.Users.last_login)


            * [`Users.createdAt`](schemas.md#schemas.users.Users.createdAt)


            * [`Users.DoesNotExist`](schemas.md#schemas.users.Users.DoesNotExist)


    * [schemas.usersinfo module](schemas.md#module-schemas.usersinfo)


        * [`UsersInfos`](schemas.md#schemas.usersinfo.UsersInfos)


            * [`UsersInfos.name`](schemas.md#schemas.usersinfo.UsersInfos.name)


            * [`UsersInfos.country_code`](schemas.md#schemas.usersinfo.UsersInfos.country_code)


            * [`UsersInfos.full_phone_number`](schemas.md#schemas.usersinfo.UsersInfos.full_phone_number)


            * [`UsersInfos.status`](schemas.md#schemas.usersinfo.UsersInfos.status)


            * [`UsersInfos.userId`](schemas.md#schemas.usersinfo.UsersInfos.userId)


            * [`UsersInfos.iv`](schemas.md#schemas.usersinfo.UsersInfos.iv)


            * [`UsersInfos.createdAt`](schemas.md#schemas.usersinfo.UsersInfos.createdAt)


            * [`UsersInfos.DoesNotExist`](schemas.md#schemas.usersinfo.UsersInfos.DoesNotExist)


            * [`UsersInfos.id`](schemas.md#schemas.usersinfo.UsersInfos.id)


            * [`UsersInfos.userId_id`](schemas.md#schemas.usersinfo.UsersInfos.userId_id)


    * [schemas.wallets module](schemas.md#module-schemas.wallets)


        * [`Wallets`](schemas.md#schemas.wallets.Wallets)


            * [`Wallets.username`](schemas.md#schemas.wallets.Wallets.username)


            * [`Wallets.token`](schemas.md#schemas.wallets.Wallets.token)


            * [`Wallets.uniqueId`](schemas.md#schemas.wallets.Wallets.uniqueId)


            * [`Wallets.uniqueIdHash`](schemas.md#schemas.wallets.Wallets.uniqueIdHash)


            * [`Wallets.iv`](schemas.md#schemas.wallets.Wallets.iv)


            * [`Wallets.userId`](schemas.md#schemas.wallets.Wallets.userId)


            * [`Wallets.platformId`](schemas.md#schemas.wallets.Wallets.platformId)


            * [`Wallets.createdAt`](schemas.md#schemas.wallets.Wallets.createdAt)


            * [`Wallets.DoesNotExist`](schemas.md#schemas.wallets.Wallets.DoesNotExist)


            * [`Wallets.id`](schemas.md#schemas.wallets.Wallets.id)


            * [`Wallets.userId_id`](schemas.md#schemas.wallets.Wallets.userId_id)


    * [Module contents](schemas.md#module-schemas)


* [security package](security.md)


    * [Submodules](security.md#submodules)


    * [security.cookie module](security.md#module-security.cookie)


        * [`Cookie`](security.md#security.cookie.Cookie)


            * [`Cookie.key_bytes`](security.md#security.cookie.Cookie.key_bytes)


            * [`Cookie.key`](security.md#security.cookie.Cookie.key)


            * [`Cookie.__init__()`](security.md#security.cookie.Cookie.__init__)


            * [`Cookie.encrypt()`](security.md#security.cookie.Cookie.encrypt)


            * [`Cookie.decrypt()`](security.md#security.cookie.Cookie.decrypt)


    * [security.data module](security.md#module-security.data)


        * [`Data`](security.md#security.data.Data)


            * [`Data.key_bytes`](security.md#security.data.Data.key_bytes)


            * [`Data.key`](security.md#security.data.Data.key)


            * [`Data.salt`](security.md#security.data.Data.salt)


            * [`Data.__init__()`](security.md#security.data.Data.__init__)


            * [`Data.encrypt()`](security.md#security.data.Data.encrypt)


            * [`Data.decrypt()`](security.md#security.data.Data.decrypt)


            * [`Data.hash()`](security.md#security.data.Data.hash)


    * [security.password_policy module](security.md#module-security.password_policy)


        * [`password_check()`](security.md#security.password_policy.password_check)


    * [Module contents](security.md#module-security)
