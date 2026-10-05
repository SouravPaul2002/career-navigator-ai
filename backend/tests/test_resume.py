from unittest.mock import patch
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_upload_non_pdf_rejected(client: AsyncClient, user_a: dict):
    files = {"file": ("test.txt", b"plain text content", "text/plain")}
    res = await client.post("/career/analyze", files=files, headers=user_a["headers"])
    assert res.status_code == 400
    assert "only pdf files are supported" in res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_upload_invalid_magic_bytes_rejected(client: AsyncClient, user_a: dict):
    # Has .pdf filename but lacks %PDF header bytes
    files = {"file": ("fake.pdf", b"NOT_A_REAL_PDF_CONTENT", "application/pdf")}
    res = await client.post("/career/analyze", files=files, headers=user_a["headers"])
    assert res.status_code == 400
    assert "invalid pdf file" in res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_upload_valid_pdf_mocked(client: AsyncClient, user_a: dict):
    pdf_content = b"%PDF-1.4 fake pdf binary content for testing"
    files = {"file": ("my_resume.PDF", pdf_content, "application/pdf")}

    mock_analysis_result = {
        "analysis": {
            "score": 92,
            "identified_domain": "Cloud Architect",
            "missing_skills": ["Terraform"],
            "recommended_courses": ["AWS Solutions Architect"]
        },
        "extracted_skills": {
            "all_skills": [{"skill_name": "Docker", "type": "technical"}]
        }
    }

    with patch("routes.career.career_routes.invoke_agent", return_value=mock_analysis_result) as mock_invoke:
        res = await client.post("/career/analyze", files=files, headers=user_a["headers"])
        assert res.status_code == 200
        data = res.json()
        assert data["message"] == "Resume analyzed successfully"
        assert data["data"]["analysis"]["score"] == 92
        analysis_id = data["id"]
        mock_invoke.assert_called_once()

    # Verify history returns the item
    hist_res = await client.get("/career/history", headers=user_a["headers"])
    assert hist_res.status_code == 200
    hist = hist_res.json()
    assert len(hist) == 1
    assert hist[0]["id"] == analysis_id
    assert hist[0]["score"] == 92
    assert hist[0]["domain"] == "Cloud Architect"
