"""Script for updating entity 'date_created' for V2 migrated users."""

import logging
from tqdm import tqdm
from src.schemas.usersinfo import UsersInfos
from src.entity import find_entity

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("migration.script")


def fetch_verified_users_infos_data():
    """Fetch verified user information from the UsersInfos table."""
    return UsersInfos.select().where(UsersInfos.status == "verified")


def update_created_date(user_info):
    """Update the date_created field for the given user entity."""
    phone_number_hash = user_info.full_phone_number
    user_created_date = user_info.createdAt

    try:
        entity = find_entity(phone_number_hash=phone_number_hash)
        if entity:
            entity.date_created = user_created_date
            entity.save()
    except Exception as e:
        logger.exception("Error updating user: %s - %s", user_info.userId, str(e))


def run():
    """Main function to process all verified users and update the date_created."""
    users_infos_data = fetch_verified_users_infos_data()

    total = users_infos_data.count()
    with tqdm(total=total, desc="Updating", unit="users") as pbar:
        for user_info in users_infos_data:
            update_created_date(user_info)
            pbar.update(1)


if __name__ == "__main__":
    run()
