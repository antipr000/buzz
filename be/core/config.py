import ssl
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Committed CA: Dashboard → Database → SSL → prod-ca-2021.crt in `be/`
_BE_DIR = Path(__file__).resolve().parent.parent
_SUPABASE_CA_PATH = _BE_DIR / "prod-ca-2021.crt"


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    app_name: str = "buzz-be"
    debug: bool = False
    db_engine: str = Field(default="postgresql+psycopg2", alias="DB_ENGINE")
    db_name: str = Field(default="", alias="DB_NAME")
    db_user: str = Field(default="", alias="DB_USER")
    db_password: str = Field(default="", alias="DB_PASSWORD")
    db_host: str = Field(default="", alias="DB_HOST")
    db_port: int = Field(default=5438, alias="DB_PORT")
    cors_origins: list[str] = Field(default=["*"], alias="CORS_ORIGINS")

    # Optional: verify PSP webhook signatures in production
    payment_webhook_secret: str = Field(default="", alias="PAYMENT_WEBHOOK_SECRET")

    # Supabase project URL (https://<ref>.supabase.co) — JWT verification via JWKS (see Supabase JWT docs)
    supabase_url: str = Field(default="", alias="SUPABASE_URL")

    # SQLAlchemy async pool (single long-running server; tune per load)
    db_pool_size: int = Field(default=5, alias="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=10, alias="DB_MAX_OVERFLOW")
    db_pool_recycle: int = Field(default=1800, alias="DB_POOL_RECYCLE")

    @property
    def db_url(self) -> str:
        return f"{self.db_engine}://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    def _is_local_db_host(self) -> bool:
        h = self.db_host.lower().strip()
        return h in ("localhost", "127.0.0.1", "::1", "host.docker.internal")

    @property
    def async_db_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    def _ssl_context_for_asyncpg(self) -> ssl.SSLContext | bool:
        if self._is_local_db_host():
            return False
        return ssl.create_default_context(cafile=str(_SUPABASE_CA_PATH))

    @property
    def asyncpg_connect_args(self) -> dict:
        return {"ssl": self._ssl_context_for_asyncpg()}

    @property
    def supabase_jwt_issuer(self) -> str:
        base = self.supabase_url.rstrip("/")
        return f"{base}/auth/v1"


config = Config()
