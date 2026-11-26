from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

def get_async_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace(
            "postgres://",
            "postgresql+asyncpg://",
            1
        )

    if url.startswith("postgresql://"):
        return url.replace(
            "postgresql://",
            "postgresql+asyncpg://",
            1
        )

    return url


DATABASE_URL = get_async_database_url(settings.DATABASE_URL)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={
        "check_same_thread": False
    } if "sqlite" in DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
