import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed():
    db = SessionLocal()
    try:
        # Create user if not exists
        admin_email = "admin@quickreply.ai"
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if not admin_user:
            print(f"Creating super admin: {admin_email}")
            admin_user = models.User(
                email=admin_email,
                name="Super Admin",
                password=get_password_hash("admin123"),
                role="SUPER_ADMIN",
                department="Management"
            )
            db.add(admin_user)
            db.commit()
            print("Super admin created successfully.")
        else:
            print(f"Super admin {admin_email} already exists. Updating role to SUPER_ADMIN.")
            admin_user.role = "SUPER_ADMIN"
            db.commit()
            print("Role updated.")
            
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)
    seed()
