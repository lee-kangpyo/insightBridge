from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings
from app.database import fetch_df

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return plain_password == hashed_password


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    query = "SELECT user_cd, user_id, user_pw, user_nm, univ_cd FROM ts_user_info WHERE user_id = $1"
    df = await fetch_df(query, (email,))

    if df.empty:
        return None

    user = df.iloc[0].to_dict()

    if not verify_password(password, user["user_pw"]):
        return None

    return user


async def get_university_name_by_cd(univ_cd: str) -> Optional[str]:
    query = "SELECT univ_nm FROM ts_univ_info WHERE univ_cd = $1"
    df = await fetch_df(query, (univ_cd,))

    if df.empty:
        return None

    return df.iloc[0]["univ_nm"]
