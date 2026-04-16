from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from app.services.auth import decode_access_token
from app.config import settings

# auto_error=False to allow checking cookie if header is missing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    auth_token: Optional[str] = Cookie(None, alias=settings.auth_cookie_name),
) -> dict:
    # Use cookie if header token is missing
    final_token = auth_token or token

    if not final_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(final_token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_cd: str = payload.get("sub")
    univ_nm: str = payload.get("univ_nm")

    if user_cd is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"user_cd": user_cd, "univ_nm": univ_nm}


async def require_auth(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user
