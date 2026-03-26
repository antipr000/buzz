from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # Supabase project URL (https://<ref>.supabase.co) — JWT verification via JWKS (see Supabase JWT docs)
    supabase_url: str = Field(default="", alias="SUPABASE_URL")

    # SQLAlchemy async pool (single long-running server; tune per load)
    db_pool_size: int = Field(default=5, alias="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=10, alias="DB_MAX_OVERFLOW")
    db_pool_recycle: int = Field(default=1800, alias="DB_POOL_RECYCLE")

    @property
    def db_url(self) -> str:
        return f"{self.db_engine}://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def async_db_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def supabase_jwt_issuer(self) -> str:
        base = self.supabase_url.rstrip("/")
        return f"{base}/auth/v1"


config = Config()
