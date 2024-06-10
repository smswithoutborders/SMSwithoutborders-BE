"""
Entity Migration Script
"""

import logging
from tqdm import tqdm
from phonenumbers.phonenumberutil import region_code_for_country_code
from src.schemas.users import Users
from src.schemas.usersinfo import UsersInfos
from src.schemas.wallets import Wallets
from src.security.data import Data
from src.utils import generate_eid, encrypt_and_encode
from src.entity import create_entity
from src.tokens import create_entity_token

data = Data()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def fetch_users_data():
    """Fetch data from the Users table."""
    return Users.select()


def fetch_verified_users_infos_data():
    """Fetch verified user information from the UsersInfos table."""
    return UsersInfos.select().where(UsersInfos.status == "verified")


def fetch_users_wallets(user_id):
    """Fetch wallets data for a given user."""
    return Wallets.select().where(Wallets.userId == user_id)


def migrate_user_data(user, user_info, wallets):
    """Transform user data and migrate to Entity."""
    phone_number_hash = user_info.full_phone_number
    eid = generate_eid(phone_number_hash)
    password_hash = user.password
    country_prefix = int(data.decrypt(data=user_info.country_code))
    country_code = region_code_for_country_code(country_prefix)

    entity_data = {
        "eid": eid,
        "phone_number_hash": phone_number_hash,
        "password_hash": password_hash,
        "country_code": encrypt_and_encode(country_code),
    }

    entity = create_entity(**entity_data)
    for wallet in wallets:
        account_identifier = data.decrypt(wallet.uniqueId)
        account_tokens = data.decrypt(wallet.token)
        token_data = {
            "platform": wallet.platformId,
            "account_identifier": encrypt_and_encode(account_identifier),
            "account_identifier_hash": wallet.uniqueIdHash,
            "account_tokens": encrypt_and_encode(account_tokens),
        }
        create_entity_token(entity, **token_data)


def migrate_data():
    """Main function to migrate data from Users and UsersInfos to Entity."""
    users_data = fetch_users_data()
    users_infos_data = fetch_verified_users_infos_data()

    total = users_infos_data.count()
    with tqdm(total=total, desc="Migrating", unit="users") as pbar:
        for user_info in users_infos_data:
            try:
                user = users_data.where(Users.id == user_info.userId).get()
                wallets = fetch_users_wallets(user_info.userId)
                migrate_user_data(user, user_info, wallets)
                pbar.update(1)
            except Exception:
                logging.error(
                    "Error migrating user: %s", user_info.userId, exc_info=True
                )
                pbar.update(1)
                continue


if __name__ == "__main__":
    migrate_data()
