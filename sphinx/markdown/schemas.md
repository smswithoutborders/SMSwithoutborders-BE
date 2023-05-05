# schemas package

## Submodules

## schemas.credentials module


### _class_ schemas.credentials.Credentials(\*args, \*\*kwargs)
Bases: `Model`


#### shared_key(_ = <TextField: Credentials.shared_key_ )

#### hashing_salt(_ = <TextField: Credentials.hashing_salt_ )

#### createdAt(_ = <DateTimeField: Credentials.createdAt_ )

#### DoesNotExist()
alias of `CredentialsDoesNotExist`


#### id(_ = <AutoField: Credentials.id_ )
## schemas.db_connector module


### schemas.db_connector.create_database_if_not_exits(user: str, password: str, database: str, host: str)
## schemas.retries module


### _class_ schemas.retries.Retries(\*args, \*\*kwargs)
Bases: `Model`


#### uniqueId(_ = <CharField: Retries.uniqueId_ )

#### count(_ = <IntegerField: Retries.count_ )

#### block(_ = <IntegerField: Retries.block_ )

#### expires(_ = <DateTimeField: Retries.expires_ )

#### createdAt(_ = <DateTimeField: Retries.createdAt_ )

#### DoesNotExist()
alias of `RetriesDoesNotExist`


#### id(_ = <AutoField: Retries.id_ )
## schemas.sessions module


### _class_ schemas.sessions.Sessions(\*args, \*\*kwargs)
Bases: `Model`


#### sid(_ = <CharField: Sessions.sid_ )

#### unique_identifier(_ = <CharField: Sessions.unique_identifier_ )

#### user_agent(_ = <CharField: Sessions.user_agent_ )

#### expires(_ = <DateTimeField: Sessions.expires_ )

#### data(_ = <TextField: Sessions.data_ )

#### status(_ = <CharField: Sessions.status_ )

#### type(_ = <CharField: Sessions.type_ )

#### createdAt(_ = <DateTimeField: Sessions.createdAt_ )

#### DoesNotExist()
alias of `SessionsDoesNotExist`

## schemas.svretries module


### _class_ schemas.svretries.Svretries(\*args, \*\*kwargs)
Bases: `Model`


#### userId(_ = <CharField: Svretries.userId_ )

#### uniqueId(_ = <CharField: Svretries.uniqueId_ )

#### count(_ = <IntegerField: Svretries.count_ )

#### expires(_ = <DateTimeField: Svretries.expires_ )

#### createdAt(_ = <DateTimeField: Svretries.createdAt_ )

#### DoesNotExist()
alias of `SvretriesDoesNotExist`


#### id(_ = <AutoField: Svretries.id_ )
## schemas.users module


### _class_ schemas.users.Users(\*args, \*\*kwargs)
Bases: `Model`


#### id(_ = <CharField: Users.id_ )

#### password(_ = <CharField: Users.password_ )

#### current_login(_ = <DateTimeField: Users.current_login_ )

#### last_login(_ = <DateTimeField: Users.last_login_ )

#### createdAt(_ = <DateTimeField: Users.createdAt_ )

#### DoesNotExist()
alias of `UsersDoesNotExist`

## schemas.usersinfo module


### _class_ schemas.usersinfo.UsersInfos(\*args, \*\*kwargs)
Bases: `Model`


#### name(_ = <CharField: UsersInfos.name_ )

#### country_code(_ = <CharField: UsersInfos.country_code_ )

#### full_phone_number(_ = <CharField: UsersInfos.full_phone_number_ )

#### status(_ = <CharField: UsersInfos.status_ )

#### userId(_ = <ForeignKeyField: UsersInfos.userId_ )

#### iv(_ = <CharField: UsersInfos.iv_ )

#### createdAt(_ = <DateTimeField: UsersInfos.createdAt_ )

#### DoesNotExist()
alias of `UsersInfosDoesNotExist`


#### id(_ = <AutoField: UsersInfos.id_ )

#### userId_id(_ = <ForeignKeyField: UsersInfos.userId_ )
## schemas.wallets module


### _class_ schemas.wallets.Wallets(\*args, \*\*kwargs)
Bases: `Model`


#### username(_ = <CharField: Wallets.username_ )

#### token(_ = <TextField: Wallets.token_ )

#### uniqueId(_ = <CharField: Wallets.uniqueId_ )

#### uniqueIdHash(_ = <CharField: Wallets.uniqueIdHash_ )

#### iv(_ = <CharField: Wallets.iv_ )

#### userId(_ = <ForeignKeyField: Wallets.userId_ )

#### platformId(_ = <CharField: Wallets.platformId_ )

#### createdAt(_ = <DateTimeField: Wallets.createdAt_ )

#### DoesNotExist()
alias of `WalletsDoesNotExist`


#### id(_ = <AutoField: Wallets.id_ )

#### userId_id(_ = <ForeignKeyField: Wallets.userId_ )
## Module contents
