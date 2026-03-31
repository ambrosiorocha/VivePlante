from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY", "insecure_dev_key_change_me_in_production")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "8"))
# Keep backward compat alias used by old auth.py stub
ACCESS_TOKEN_EXPIRE_MINUTES: int = ACCESS_TOKEN_EXPIRE_HOURS * 60
