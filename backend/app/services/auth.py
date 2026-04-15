import smtplib
import bcrypt
import logging
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config import settings
from app.database import fetch_df, get_pool

logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return plain_password == hashed_password


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


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


def _normalize_chip_value(value: Optional[str]) -> str:
    if value is None or (isinstance(value, str) and value.strip() == ""):
        return "-"
    return str(value).strip()


async def get_institution_chips(schl_nm: str) -> dict:
    query = """
        SELECT schl_tp, estb_gb, region, stts
        FROM public.tq_overview_detail_grid
        WHERE schl_nm = $1
        LIMIT 1
    """
    df = await fetch_df(query, (schl_nm,))

    if df.empty:
        return {
            "schl_tp": "-",
            "estb_gb": "-",
            "region": "-",
            "stts": "-",
        }

    row = df.iloc[0]
    return {
        "schl_tp": _normalize_chip_value(row.get("schl_tp")),
        "estb_gb": _normalize_chip_value(row.get("estb_gb")),
        "region": _normalize_chip_value(row.get("region")),
        "stts": _normalize_chip_value(row.get("stts")),
    }


async def get_university_by_email_domain(domain: str) -> Optional[dict]:
    query = "SELECT univ_cd, univ_nm FROM ts_univ_info WHERE email_domain = $1"
    df = await fetch_df(query, (domain,))

    if df.empty:
        return None

    return df.iloc[0].to_dict()


async def get_user_by_email(email: str) -> Optional[dict]:
    query = "SELECT user_cd, user_id, user_pw, user_nm, univ_cd FROM ts_user_info WHERE user_id = $1"
    df = await fetch_df(query, (email,))

    if df.empty:
        return None

    return df.iloc[0].to_dict()


async def send_verification_email(email: str) -> Optional[str]:
    import random

    code = str(random.randint(100000, 999999))

    expires_at = datetime.utcnow() + timedelta(minutes=5)

    query = """
        INSERT INTO email_verifications (email, code, expires_at, used)
        VALUES ($1, $2, $3, FALSE)
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(query, email, code, expires_at)

    try:
        msg = MIMEText(f"Your verification code is: {code}", "plain")
        msg["Subject"] = "InsightBridge Verification Code"
        msg["From"] = settings.smtp_user
        msg["To"] = email

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)

        return code
    except Exception as e:
        logger.error(
            f"Failed to send verification email to {email}: {type(e).__name__}: {e}"
        )
        return None


async def verify_and_mark_code_used(email: str, code: str) -> tuple[bool, str]:
    query = """
        SELECT 1 FROM email_verifications
        WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
        LIMIT 1
    """
    df = await fetch_df(query, (email, code))

    if df.empty:
        check_used_query = """
            SELECT 1 FROM email_verifications
            WHERE email = $1 AND code = $2 AND used = TRUE
            LIMIT 1
        """
        used_df = await fetch_df(check_used_query, (email, code))
        if not used_df.empty:
            return False, "already_used"
        return False, "expired"

    update_query = (
        "UPDATE email_verifications SET used = TRUE WHERE email = $1 AND code = $2"
    )
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(update_query, email, code)

    return True, ""


async def get_groups() -> list[dict]:
    query = "SELECT grp_cd, grp_nm FROM ts_grp_info WHERE del_fg = 'N' ORDER BY grp_id"
    df = await fetch_df(query, ())
    return df.to_dict(orient="records") if not df.empty else []
