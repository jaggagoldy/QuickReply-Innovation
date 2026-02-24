import os
import secrets
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import models
from database import engine, get_db

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuickReply Innovation Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Config
SECRET_KEY = os.getenv("JWT_SECRET", "quickreply_secret_99")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Pydantic Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class IdeaCreate(BaseModel):
    title: str
    problemStatement: str
    currentWorkaround: Optional[str] = None
    proposedSolution: str
    category: str
    beneficiaries: str
    expectedImpact: str
    exampleScenario: str
    priority: str

class ReviewCreate(BaseModel):
    action: str
    content: Optional[str] = None
    scores: Optional[dict] = None

# Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
def root():
    return "QuickReply Innovation Portal API (Python)"

@app.post("/api/auth/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        name=user_in.name,
        password=hashed_password,
        department=user_in.department,
        role="EMPLOYEE"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {
        "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name},
        "token": token
    }

@app.post("/api/auth/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {
        "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name},
        "token": token
    }

@app.get("/api/ideas")
def get_ideas(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ideas = db.query(models.Idea).all()
    # Need to manual serialize for relations if not careful
    result = []
    for idea in ideas:
        result.append({
            "id": idea.id,
            "title": idea.title,
            "status": idea.status,
            "category": idea.category,
            "priority": idea.priority,
            "createdAt": idea.createdAt,
            "owner": {"name": idea.owner.name}
        })
    return result

@app.post("/api/ideas")
def create_idea(idea_in: IdeaCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = models.Idea(
        **idea_in.dict(),
        ownerId=current_user.id
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    
    # Add initial status history
    history = models.IdeaStatusHistory(
        ideaId=idea.id,
        status="SUBMITTED",
        changedBy=current_user.id,
        comment="Initial submission"
    )
    db.add(history)
    db.commit()
    
    return idea

@app.get("/api/ideas/{idea_id}")
def get_idea(idea_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Manual serialization to handle relations
    return {
        "id": idea.id,
        "title": idea.title,
        "problemStatement": idea.problemStatement,
        "currentWorkaround": idea.currentWorkaround,
        "proposedSolution": idea.proposedSolution,
        "category": idea.category,
        "beneficiaries": idea.beneficiaries,
        "expectedImpact": idea.expectedImpact,
        "exampleScenario": idea.exampleScenario,
        "priority": idea.priority,
        "status": idea.status,
        "owner": {"id": idea.owner.id, "name": idea.owner.name, "email": idea.owner.email, "department": idea.owner.department},
        "statusHistory": [{"id": h.id, "status": h.status, "comment": h.comment, "createdAt": h.createdAt, "changedByUser": {"name": h.changedByUser.name}} for h in idea.statusHistory],
        "reviews": [{"id": r.id, "action": r.action, "content": r.content, "createdAt": r.createdAt, "reviewer": {"name": r.reviewer.name}} for r in idea.reviews],
        "score": {"businessImpact": idea.score.businessImpact, "customerValue": idea.score.customerValue, "techEffort": idea.score.techEffort, "revenuePotential": idea.score.revenuePotential, "finalScore": idea.score.finalScore} if idea.score else None,
        "comments": [{"id": c.id, "content": c.content, "createdAt": c.createdAt, "author": {"name": c.author.name}} for c in idea.comments],
        "createdAt": idea.createdAt
    }

@app.delete("/api/ideas/{idea_id}")
def delete_idea(idea_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    db.delete(idea)
    db.commit()
    return {"message": "Idea deleted"}

@app.post("/api/ideas/{idea_id}/review")
def review_idea(idea_id: str, review_in: ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["REVIEWER", "PM", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Update status
    if review_in.action == "SHORTLISTED":
        idea.status = "SHORTLISTED"
    elif review_in.action == "REJECTED":
        idea.status = "REJECTED"
    elif review_in.action == "INFO_REQUESTED":
        idea.status = "INFO_REQUESTED"
        
    # Add Review
    review = models.Review(
        ideaId=idea_id,
        reviewerId=current_user.id,
        action=review_in.action,
        content=review_in.content
    )
    db.add(review)
    
    # Add Status History
    history = models.IdeaStatusHistory(
        ideaId=idea_id,
        status=idea.status,
        changedBy=current_user.id,
        comment=review_in.content or f"Action: {review_in.action}"
    )
    db.add(history)
    
    # Handle Scores
    if review_in.scores:
        s = review_in.scores
        final_score = (s.get('businessImpact', 0) + s.get('customerValue', 0) + s.get('revenuePotential', 0) + (5 - s.get('techEffort', 0))) / 4.0
        
        score = db.query(models.Score).filter(models.Score.ideaId == idea_id).first()
        if score:
            score.businessImpact = s.get('businessImpact')
            score.customerValue = s.get('customerValue')
            score.techEffort = s.get('techEffort')
            score.revenuePotential = s.get('revenuePotential')
            score.finalScore = final_score
        else:
            score = models.Score(
                ideaId=idea_id,
                businessImpact=s.get('businessImpact'),
                customerValue=s.get('customerValue'),
                techEffort=s.get('techEffort'),
                revenuePotential=s.get('revenuePotential'),
                finalScore=final_score
            )
            db.add(score)
            
    db.commit()
    return {"message": "Review added"}

@app.get("/api/users")
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(models.User).all()
    return [{
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "department": user.department,
        "createdAt": user.createdAt
    } for user in users]

@app.patch("/api/users/{user_id}/role")
def update_user_role(user_id: str, role_data: dict = Body(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_data.get("role")
    db.commit()
    return user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 3000)))
