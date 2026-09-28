import os
from fastapi import APIRouter, Depends, HTTPException, Query
import httpx
from auth import get_current_user
import models

router = APIRouter(prefix="/search", tags=["search"])

COURTLISTENER_API_KEY = os.getenv("COURTLISTENER_API_KEY", "")

@router.get("/court")
async def search_court_cases(
    q: str = Query(..., min_length=1),
    current_user: models.User = Depends(get_current_user)
):
    if not COURTLISTENER_API_KEY:
        raise HTTPException(status_code=500, detail="CourtListener API Key is not configured on the backend.")

    headers = {
        "Authorization": f"Token {COURTLISTENER_API_KEY}",
        "User-Agent": "JustiMind-AI-Client/0.1"
    }
    
    params = {
        "q": q,
        "type": "o"
    }

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(
                "https://www.courtlistener.com/api/rest/v4/search/",
                headers=headers,
                params=params,
                timeout=12.0
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Failed to connect to CourtListener: {e}")

    if res.status_code != 200:
        raise HTTPException(
            status_code=res.status_code,
            detail=f"CourtListener API returned error: {res.text}"
        )

    data = res.json()
    
    simplified_results = []
    for item in data.get("results", []):
        simplified_results.append({
            "id": item.get("id"),
            "case_name": item.get("caseName") or item.get("absolute_url") or "Unknown Case",
            "court": item.get("court", "Unknown Court"),
            "date_filed": item.get("dateFiled"),
            "docket_number": item.get("docketNumber"),
            "snippet": item.get("snippet", ""),
            "url": f"https://www.courtlistener.com{item.get('absolute_url', '')}" if item.get("absolute_url") else None
        })

    return {
        "count": data.get("count", 0),
        "results": simplified_results
    }
