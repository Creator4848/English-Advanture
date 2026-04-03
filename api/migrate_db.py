import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/english_adventure.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print(f"Checking for 'last_login' in 'users' table...")
        try:
            # PostgreSQL syntax
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"))
            conn.commit()
            print("✅ Added 'last_login' column (if it didn't exist)")
        except Exception as e:
            print(f"⚠️  Note: Could not add 'last_login' (might be SQLite or already exists): {e}")

        print("Checking for 'system_settings' table...")
        try:
            # This is just a safety check, create_all should handle it
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS system_settings (
                    key VARCHAR(100) PRIMARY KEY,
                    value JSONB NOT NULL
                )
            """))
            conn.commit()
            print("✅ Ensured 'system_settings' table exists")
        except Exception as e:
            print(f"⚠️  Note: Could not create 'system_settings' (might be SQLite): {e}")

if __name__ == "__main__":
    migrate()
