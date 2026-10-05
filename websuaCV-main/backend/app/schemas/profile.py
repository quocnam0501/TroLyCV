from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileBase(BaseModel):
    current_location: Optional[str] = None
    desired_locations: Optional[str] = None  # JSON stringified array
    desired_field: Optional[str] = None
    experience_level: Optional[str] = None
    salary_expectation: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileInDBBase(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ProfileInDB(ProfileInDBBase):
    pass