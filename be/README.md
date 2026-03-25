#  Buzz Backend 

A scalable, asynchronous FastAPI backend powered by SQLAlchemy 2.0+ and PostgreSQL.

##  Quick Start

Ensure you have [uv](https://github.com/astral-sh/uv) and [Docker](https://www.docker.com/) installed.

### 1. Environment Setup
Copy the template and configure your environment variables:
```bash
cp .env.example .env  # If not already present
```

### 2. Install Dependencies
Sync your local environment from the lockfile:
```bash
uv sync
```

### 3. Start the Database
Bring up the PostgreSQL container:
```bash
docker compose up -d
```

### 4. Run Migrations
Initialize your database schema using Alembic:
```bash
uv run alembic upgrade head
```

**Autogenerate and model discovery:** Alembic compares the database to SQLAlchemy metadata. All mapped tables must be imported so they attach to `Base.metadata`. The backend does this in [`models/__init__.py`](models/__init__.py), which [`migrations/env.py`](migrations/env.py) imports. If you add a new model, import it there before running `alembic revision --autogenerate`, or new tables will be missing from the migration.

### 5. Start the Application
Launch the FastAPI development server:
```bash
uv run main.py
```
The API will be available at [http://localhost:8000](http://localhost:8000).



##  Project Structure
- `core/`: Global configurations, database setup, and logging.
- `<domain>/`: Feature-first modules (`user/`, `profile/`, `event/`, `booking/`, etc.) each containing:
  - `models/`: SQLAlchemy models for that domain
  - `schemas/`: Pydantic request/response schemas
  - `services/`: Business logic
  - `routes/`: FastAPI routers
- `models/__init__.py`: Central registry that imports all ORM models so Alembic autogenerate can discover every table.
- `migrations/`: Alembic migration scripts and history.

---

## Common Commands

| Command | Description |
| --- | --- |
| `uv run main.py` | Start the dev server |
| `uv run alembic revision --autogenerate -m "description"` | Generate a new migration |
| `uv run alembic upgrade head` | Apply all pending migrations |
| `docker compose down -v` | Wipe database and reset volumes |

## Adding New Models

When adding a new mapped class, inherit from [`BaseEntity`](core/database.py) (or [`TimestampedModel`](core/database.py) for tables without the default `id` column) and implement `get_key()` where applicable:

```python
class Post(BaseEntity):
    __tablename__ = "posts"
    def get_key(self) -> str:
        return "pst"  # IDs like pst_abc123
```

**Register the model for Alembic:** add `from myapp.models.post import Post` (or equivalent) to [`models/__init__.py`](models/__init__.py) and export it in `__all__`. Without that import, `alembic revision --autogenerate` will not see the new table.

## Database Access

If you want to connect to the database using an external tool (pgAdmin, DBeaver, etc.):
- **Host**: `localhost`
- **Port**: `5439` (Custom port)
- **User/Password**: See `.env`
