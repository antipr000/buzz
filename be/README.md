#  Buzz Backend 

A scalable, asynchronous FastAPI backend powered by SQLAlchemy 2.0+ and PostgreSQL.

##  Quick Start

Ensure you have [uv](https://github.com/astral-sh/uv) and [Docker](https://www.docker.com/) installed.

### 1. Environment Setup
Copy the template and configure your environment variables:
```bash
cp .env.example .env  # If not already present
```

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

### 3. Run Migrations
Initialize your database schema using Alembic:
```bash
uv run alembic upgrade head
```

### 4. Start the Application
Launch the FastAPI development server:
```bash
uv run main.py
```
The API will be available at [http://localhost:8000](http://localhost:8000).



##  Project Structure
- `core/`: Global configurations, database setup, and logging.
- `user/`: User module (models, pydantic schemas, services, and routes).
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

When adding a new model in `be/user/models/`, always inherit from `Base` and implement `get_key()`:

```python
class Post(Base):
    __tablename__ = "posts"
    def get_key(self) -> str:
        return "pst"  # This creates IDs like pst_abc123
```

## Database Access

If you want to connect to the database using an external tool (pgAdmin, DBeaver, etc.):
- **Host**: `localhost`
- **Port**: `5439` (Custom port)
- **User/Password**: See `.env`
