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

    @property
    def db_url(self):
        return f"{self.db_engine}://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def async_db_url(self):
        # Always use asyncpg for async connections
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


config = Config()
