from pydantic import BaseModel
from typing import List, Optional


class FailedStep(BaseModel):
    num: int
    message: str


class StepResult(BaseModel):
    num: int
    action: str
    status: bool
    duration: float
    feedback: str
    fail: Optional[str]


class WebTestResult(BaseModel):
    title: str
    status: bool
    duration: float
    feedback: str
    fail: Optional[List[FailedStep]]
    steps: List[StepResult]
