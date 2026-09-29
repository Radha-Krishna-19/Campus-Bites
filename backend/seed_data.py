"""Seed MongoDB with the three canteens, their menus, and staff accounts.

Usage: python seed_data.py
"""
import asyncio
import json
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from auth_utils import hash_password

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# (user_id, email, password, name, role, canteen_id)
STAFF = [
    ("mgmt_superadmin", "canteenmanager@amrita.edu", "admin123", "Super Admin", "management", None),
    ("mgmt_sopanam", "sopanam-admin@amrita.edu", "sopanam123", "Sopanam Manager", "management", "sopanam"),
    ("mgmt_mba", "mba-admin@amrita.edu", "mba123", "MBA Manager", "management", "mba"),
    ("mgmt_samudra", "samudra-admin@amrita.edu", "samudra123", "Samudra Manager", "management", "samudra"),
    ("crew_sopanam", "crew.sopanam@amrita.edu", "crew123", "Sopanam Canteen Crew", "crew", "sopanam"),
    ("crew_mba", "crew.mba@amrita.edu", "crew123", "MBA Canteen Crew", "crew", "mba"),
    ("crew_samudra", "crew.samudra@amrita.edu", "crew123", "Samudra Canteen Crew", "crew", "samudra"),
]


async def seed_database():
    data = json.loads((ROOT_DIR / "seed_menu.json").read_text(encoding="utf-8"))
    now = datetime.utcnow().isoformat()

    await db.canteens.delete_many({})
    await db.menu_items.delete_many({})
    await db.users.delete_many({"role": {"$in": ["management", "crew"]}})

    await db.canteens.insert_many(data["canteens"])
    await db.menu_items.insert_many([{**item, "created_at": now} for item in data["menu_items"]])
    await db.users.insert_many([
        {
            "user_id": user_id,
            "email": email,
            "password_hash": hash_password(password),
            "name": name,
            "role": role,
            "canteen_id": canteen_id,
            "picture": None,
            "created_at": now,
        }
        for user_id, email, password, name, role, canteen_id in STAFF
    ])

    print(f"Seeded {len(data['canteens'])} canteens, {len(data['menu_items'])} menu items, {len(STAFF)} staff accounts.")
    for _, email, password, _, role, _ in STAFF:
        print(f"  {role:<10} {email} / {password}")


if __name__ == "__main__":
    asyncio.run(seed_database())
