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

    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=settings.llm_temperature,
    )
