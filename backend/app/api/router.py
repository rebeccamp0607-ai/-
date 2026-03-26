"""Top-level API router."""

from fastapi import APIRouter

from app.api.endpoints import bazi, genesis, game, community, export

api_router = APIRouter()

api_router.include_router(bazi.router, prefix="/bazi", tags=["八字解析"])
api_router.include_router(genesis.router, prefix="/genesis", tags=["创世引擎"])
api_router.include_router(game.router, prefix="/game", tags=["游戏循环"])
api_router.include_router(community.router, prefix="/community", tags=["阿卡西记录"])
api_router.include_router(export.router, prefix="/export", tags=["人生导出"])
