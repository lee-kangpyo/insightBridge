from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.services.auth import (
    authenticate_user,
    create_access_token,
    get_university_name_by_cd,
    get_institution_chips,
)
from app.schemas import InstitutionChips
from app.dependencies import require_auth
from app.schemas import LoginRequest, LoginResponse, OAuth2TokenResponse

router = APIRouter()


@router.post("/token", response_model=OAuth2TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """OAuth2 password flow for Swagger UI Authorize (username = email)."""
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    univ_nm = await get_university_name_by_cd(user["univ_cd"])

    if not univ_nm:
        raise HTTPException(status_code=404, detail="University not found")

    access_token = create_access_token(
        data={"sub": str(user["user_cd"]), "univ_nm": univ_nm}
    )

    chips = await get_institution_chips(univ_nm)

    return OAuth2TokenResponse(
        access_token=access_token,
        token_type="bearer",
        univ_nm=univ_nm,
        institution_chips=InstitutionChips(**chips),
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await authenticate_user(request.email, request.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    univ_nm = await get_university_name_by_cd(user["univ_cd"])

    if not univ_nm:
        raise HTTPException(status_code=404, detail="University not found")

    access_token = create_access_token(
        data={"sub": str(user["user_cd"]), "univ_nm": univ_nm}
    )

    chips = await get_institution_chips(univ_nm)

    return LoginResponse(
        access_token=access_token,
        univ_nm=univ_nm,
        institution_chips=InstitutionChips(**chips),
    )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(require_auth)):
    return current_user
