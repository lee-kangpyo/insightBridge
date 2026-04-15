from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.services.auth import (
    authenticate_user,
    create_access_token,
    get_university_name_by_cd,
    get_iniversity_chips,
    get_password_hash,
    get_university_by_email_domain,
    send_verification_email,
    verify_and_mark_code_used,
    get_user_by_email,
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
)

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


@router.post("/send-verification", response_model=SendVerificationResponse)
async def send_verification(request: SendVerificationRequest):
    domain = request.email.split("@")[-1]
    univ_info = await get_university_by_email_domain(domain)
    if not univ_info:
        raise HTTPException(status_code=400, detail="Invalid email domain")

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
async def register(request: RegisterRequest):
    verified, _ = await verify_and_mark_code_used(
        request.email, request.verification_code
    )
    if not verified:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification code"
        )

    domain = request.email.split("@")[-1]
    univ_info = await get_university_by_email_domain(domain)
    if not univ_info:
        raise HTTPException(status_code=400, detail="Invalid email domain")

    hashed_password = get_password_hash(request.password)

    query = """
        INSERT INTO ts_user_info (user_id, user_pw, user_nm, univ_cd, mobile_co_cd, dept_nm, grade_nm, pos_nm)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING user_cd
    """
    from app.database import fetch_df

    df = await fetch_df(
        query,
        (
            request.email,
            hashed_password,
            request.name,
            univ_info["univ_cd"],
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

    chips = await get_institution_chips(univ_info["univ_nm"])

    return RegisterResponse(
        access_token=access_token,
        univ_nm=univ_info["univ_nm"],
        institution_chips=InstitutionChips(**chips),
    )
