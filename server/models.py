from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="EMPLOYEE")
    department = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    ideas = relationship("Idea", back_populates="owner")
    comments = relationship("Comment", back_populates="author")
    reviews = relationship("Review", back_populates="reviewer")
    statusHistory = relationship("IdeaStatusHistory", back_populates="changedByUser")

class Idea(Base):
    __tablename__ = "Idea"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    problemStatement = Column(Text, nullable=False)
    currentWorkaround = Column(Text, nullable=True)
    proposedSolution = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    beneficiaries = Column(String, nullable=False)
    expectedImpact = Column(String, nullable=False)
    exampleScenario = Column(Text, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, default="SUBMITTED")
    ownerId = Column(String, ForeignKey("User.id"), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="ideas")
    comments = relationship("Comment", back_populates="idea", cascade="all, delete-orphan")
    statusHistory = relationship("IdeaStatusHistory", back_populates="idea", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="idea", cascade="all, delete-orphan")
    score = relationship("Score", back_populates="idea", uselist=False, cascade="all, delete-orphan")

class IdeaStatusHistory(Base):
    __tablename__ = "IdeaStatusHistory"

    id = Column(String, primary_key=True, default=generate_uuid)
    ideaId = Column(String, ForeignKey("Idea.id"), nullable=False)
    status = Column(String, nullable=False)
    changedBy = Column(String, ForeignKey("User.id"), nullable=False)
    comment = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    idea = relationship("Idea", back_populates="statusHistory")
    changedByUser = relationship("User", back_populates="statusHistory")

class Comment(Base):
    __tablename__ = "Comment"

    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)
    ideaId = Column(String, ForeignKey("Idea.id"), nullable=False)
    authorId = Column(String, ForeignKey("User.id"), nullable=False)
    parentId = Column(String, ForeignKey("Comment.id"), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    idea = relationship("Idea", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "Review"

    id = Column(String, primary_key=True, default=generate_uuid)
    ideaId = Column(String, ForeignKey("Idea.id"), nullable=False)
    reviewerId = Column(String, ForeignKey("User.id"), nullable=False)
    action = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    idea = relationship("Idea", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")

class Score(Base):
    __tablename__ = "Score"

    id = Column(String, primary_key=True, default=generate_uuid)
    ideaId = Column(String, ForeignKey("Idea.id"), unique=True, nullable=False)
    businessImpact = Column(Integer, nullable=False)
    customerValue = Column(Integer, nullable=False)
    techEffort = Column(Integer, nullable=False)
    revenuePotential = Column(Integer, nullable=False)
    finalScore = Column(Float, nullable=False)

    idea = relationship("Idea", back_populates="score")
