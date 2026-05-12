import logging
from langchain_openai import ChatOpenAI
from ..config import settings

logger = logging.getLogger(__name__)

_KNOWN_OPENAI_COMPAT_PROVIDERS = frozenset({"openai", "minimax", "gemini"})


def create_chat_model():
    """Create a ChatModel instance based on configuration.

    OpenAI and MiniMax (OpenAI-compatible HTTP) both use ``ChatOpenAI``
    with ``base_url`` / model from settings.
    """
    provider = settings.llm_provider.lower().strip()
    if provider not in _KNOWN_OPENAI_COMPAT_PROVIDERS:
        logger.warning(
            "LLM_PROVIDER=%r not in known OpenAI-compatible set %s; "
            "still using ChatOpenAI — ensure OPENAI_BASE_URL matches your vendor.",
            settings.llm_provider,
            sorted(_KNOWN_OPENAI_COMPAT_PROVIDERS),
        )
    else:
        logger.debug("ChatModel: provider=%s", provider)

    # langchain_openai.ChatOpenAI는 openai-python 클라이언트를 감싸며,
    # OpenAI 호환 벤더를 쓸 때는 openai_api_base/openai_api_key 필드로 명시하는 게 가장 확실하다.
    return ChatOpenAI(
        model=settings.openai_model,
        openai_api_key=settings.openai_api_key,
        openai_api_base=settings.openai_base_url,
        temperature=settings.llm_temperature,
        request_timeout=settings.llm_request_timeout_seconds,
        max_retries=settings.llm_max_retries,
    )
