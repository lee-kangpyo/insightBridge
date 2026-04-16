from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.config import settings
from app.services.auth import (
    authenticate_user,
    create_access_token,
    get_university_name_by_cd,
    get_institution_chips,
    get_password_hash,
    get_university_by_email_domain,
    send_verification_email,
    verify_and_mark_code_used,
    get_user_by_email,
    get_groups,
)
from app.schemas import InstitutionChips
from app.dependencies import require_auth
from app.schemas import (
    LoginRequest,
    LoginResponse,
    OAuth2TokenResponse,
    SendVerificationRequest,
    SendVerificationResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
    RegisterRequest,
    RegisterResponse,
    GroupResponse,
)

router = APIRouter()


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        samesite=settings.auth_cookie_samesite,
        max_age=settings.auth_cookie_max_age,
        secure=settings.auth_cookie_secure,
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value="",
        httponly=True,
        samesite=settings.auth_cookie_samesite,
        max_age=0,
        secure=settings.auth_cookie_secure,
        path="/",
    )


@router.post("/token", response_model=OAuth2TokenResponse)
async def login_for_access_token(
    response: Response,
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

    _set_auth_cookie(response, access_token)

    chips = await get_institution_chips(univ_nm)

    return OAuth2TokenResponse(
        access_token=access_token,
        token_type="bearer",
        univ_nm=univ_nm,
        institution_chips=InstitutionChips(**chips),
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response):
    user = await authenticate_user(request.email, request.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    univ_nm = await get_university_name_by_cd(user["univ_cd"])

    if not univ_nm:
        raise HTTPException(status_code=404, detail="University not found")

    access_token = create_access_token(
        data={"sub": str(user["user_cd"]), "univ_nm": univ_nm}
    )

    _set_auth_cookie(response, access_token)

    chips = await get_institution_chips(univ_nm)

    return LoginResponse(
        access_token=access_token,
        univ_nm=univ_nm,
        institution_chips=InstitutionChips(**chips),
    )


@router.post("/logout")
async def logout(response: Response):
    _clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(require_auth)):
    return current_user


@router.post("/send-verification", response_model=SendVerificationResponse)
async def send_verification(request: SendVerificationRequest):
    domain = request.email.split("@")[-1]
    if settings.domain_validation_enabled:
        univ_info = await get_university_by_email_domain(domain)
        if not univ_info:
            raise HTTPException(status_code=400, detail="허용되지 않은 이메일 도메인입니다.")

    existing_user = await get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    code = await send_verification_email(request.email)
    if not code:
        raise HTTPException(status_code=500, detail="Failed to send verification email")

    return SendVerificationResponse(success=True)


@router.post("/verify-code", response_model=VerifyCodeResponse)
async def verify_code(request: VerifyCodeRequest):
    verified, error_type = await verify_and_mark_code_used(request.email, request.code)
    if not verified:
        error_messages = {
            "expired": "인증번호가 만료되었습니다",
            "already_used": "이미 사용된 인증번호입니다",
        }
        detail = error_messages.get(error_type, "인증번호가 일치하지 않습니다")
        raise HTTPException(status_code=400, detail=detail)

    return VerifyCodeResponse(verified=True)


@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, response: Response):
    check_query = """
        SELECT 1 FROM email_verifications
        WHERE email = $1 AND used = TRUE
        LIMIT 1
    """
    from app.database import fetch_df

    df = await fetch_df(check_query, (request.email,))
    if df.empty:
        raise HTTPException(
            status_code=400, detail="이메일 인증이 완료되지 않았습니다."
        )

    domain = request.email.split("@")[-1]
    univ_info = None
    if settings.domain_validation_enabled:
        univ_info = await get_university_by_email_domain(domain)
        if not univ_info:
            raise HTTPException(status_code=400, detail="허용되지 않은 이메일 도메인입니다.")

    hashed_password = get_password_hash(request.password)

    parts = request.phone.split("-")
    mobile1 = parts[0] if len(parts) > 0 else None
    mobile2 = parts[1] if len(parts) > 1 else None
    mobile3 = parts[2] if len(parts) > 2 else None

    query = """
        INSERT INTO ts_user_info (user_id, user_pw, user_nm, univ_cd, mobile1, mobile2, mobile3, mobile_co_cd, dept_nm, grade_nm, pos_nm)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING user_cd
    """
    from app.database import fetch_df

    df = await fetch_df(
        query,
        (
            request.email,
            hashed_password,
            request.name,
            univ_info["univ_cd"] if univ_info else "00000",
            mobile1,
            mobile2,
            mobile3,
            request.mobile_co_cd,
            request.dept_nm,
            request.grade_nm,
            request.pos_nm,
        ),
    )

    if df.empty:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user_cd = df.iloc[0]["user_cd"]
    access_token = create_access_token(
        data={"sub": str(user_cd), "univ_nm": univ_info["univ_nm"]}
    )

    _set_auth_cookie(response, access_token)

    chips = await get_institution_chips(univ_info["univ_nm"])

    return RegisterResponse(
        access_token=access_token,
        univ_nm=univ_info["univ_nm"],
        institution_chips=InstitutionChips(**chips),
    )


@router.get("/groups", response_model=list[GroupResponse])
async def get_groups_list():
    groups = await get_groups()
    return [GroupResponse(**g) for g in groups]
