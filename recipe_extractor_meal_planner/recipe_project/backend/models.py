from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(2048), unique=True, nullable=False, index=True)
    title = Column(String(512), nullable=False)
    cuisine = Column(String(128), nullable=True)
    difficulty = Column(String(64), nullable=True)
    data_json = Column(Text, nullable=False)  # Full JSON blob
    created_at = Column(DateTime(timezone=True), server_default=func.now())
