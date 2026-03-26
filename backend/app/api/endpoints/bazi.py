"""八字解析 API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.engines.bazi_parser import BaziParser, BaziChart

router = APIRouter()


class BaziRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    gender: str  # "male" | "female"
    solar: bool = True  # True = 公历, False = 农历


class BaziResponse(BaseModel):
    chart: BaziChart
    dominant_element: str
    personality_profile: dict[str, float]
    current_dayun: dict[str, str]


@router.post("/parse", response_model=BaziResponse)
async def parse_bazi(req: BaziRequest) -> BaziResponse:
    """解析八字，返回命盘与五行人格向量。"""
    parser = BaziParser()
    chart = parser.parse(
        year=req.year,
        month=req.month,
        day=req.day,
        hour=req.hour,
        gender=req.gender,
        solar=req.solar,
    )
    profile = parser.compute_personality_vector(chart)
    dayun = parser.get_current_dayun(chart)
    return BaziResponse(
        chart=chart,
        dominant_element=profile["dominant"],
        personality_profile=profile["scores"],
        current_dayun=dayun,
    )
