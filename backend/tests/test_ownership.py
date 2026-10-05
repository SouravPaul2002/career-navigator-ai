import pytest
from httpx import AsyncClient
from models import ResumeAnalysis, InterviewSession, InterviewMessage, UserRoadmap, UserRoadmapStep, StepStatus

@pytest.mark.asyncio
async def test_cannot_read_other_users_analysis(client: AsyncClient, user_a: dict, user_b: dict):
    # Create analysis owned by User B
    analysis_b = ResumeAnalysis(
        user_id=user_b["id"],
        filename="b_resume.pdf",
        analysis_data={"analysis": {"score": 85, "identified_domain": "Software Engineer"}}
    )
    await analysis_b.insert()
    analysis_id = str(analysis_b.id)

    # User A tries to read User B's analysis -> 404
    res_a = await client.get(f"/career/analysis/{analysis_id}", headers=user_a["headers"])
    assert res_a.status_code == 404
    assert res_a.json()["detail"] == "Analysis not found"

    # User B reads their own analysis -> 200
    res_b = await client.get(f"/career/analysis/{analysis_id}", headers=user_b["headers"])
    assert res_b.status_code == 200
    assert res_b.json()["analysis"]["identified_domain"] == "Software Engineer"

@pytest.mark.asyncio
async def test_cannot_read_other_users_session_messages(client: AsyncClient, user_a: dict, user_b: dict):
    # Create session owned by User B
    session_b = InterviewSession(
        user_id=user_b["id"],
        job_role="Backend Developer",
        messages=[InterviewMessage(sender="ai", content="Hello from AI")]
    )
    await session_b.insert()
    session_id = str(session_b.id)

    # User A tries to read User B's session messages -> 404
    res_a = await client.get(f"/interview/sessions/{session_id}/messages", headers=user_a["headers"])
    assert res_a.status_code == 404
    assert res_a.json()["detail"] == "Session not found"

    # User B reads their own session messages -> 200
    res_b = await client.get(f"/interview/sessions/{session_id}/messages", headers=user_b["headers"])
    assert res_b.status_code == 200
    assert len(res_b.json()) == 1
    assert res_b.json()[0]["content"] == "Hello from AI"

@pytest.mark.asyncio
async def test_cannot_chat_in_other_users_session(client: AsyncClient, user_a: dict, user_b: dict):
    session_b = InterviewSession(
        user_id=user_b["id"],
        job_role="Frontend Developer",
        messages=[InterviewMessage(sender="ai", content="Welcome")]
    )
    await session_b.insert()
    session_id = str(session_b.id)

    # User A tries to chat in User B's session -> 404
    res_a = await client.post(
        f"/interview/sessions/{session_id}/chat",
        json={"message": "I am User A trying to hijack User B session"},
        headers=user_a["headers"]
    )
    assert res_a.status_code == 404
    assert res_a.json()["detail"] == "Session not found"

@pytest.mark.asyncio
async def test_cannot_read_or_update_other_users_roadmap_step(client: AsyncClient, user_a: dict, user_b: dict):
    step_b = UserRoadmapStep(
        title="Master MongoDB",
        description="Learn indexing and aggregation",
        estimated_duration="2 weeks",
        status=StepStatus.TODO,
        order_index=0
    )
    roadmap_b = UserRoadmap(
        user_id=user_b["id"],
        role="Database Engineer",
        steps=[step_b]
    )
    await roadmap_b.insert()
    step_id = step_b.id

    # User A cannot read User B's step -> 404
    read_res_a = await client.get(f"/guidance/steps/{step_id}", headers=user_a["headers"])
    assert read_res_a.status_code == 404

    # User A cannot update User B's step -> 404
    patch_res_a = await client.patch(
        f"/guidance/steps/{step_id}",
        json={"status": "in_progress"},
        headers=user_a["headers"]
    )
    assert patch_res_a.status_code == 404

    # Step status remains "todo" in DB
    refreshed_b = await UserRoadmap.get(roadmap_b.id)
    assert refreshed_b.steps[0].status == StepStatus.TODO

    # User B CAN read their own step -> 200
    read_res_b = await client.get(f"/guidance/steps/{step_id}", headers=user_b["headers"])
    assert read_res_b.status_code == 200
    assert read_res_b.json()["title"] == "Master MongoDB"

    # User B CAN update their own step -> 200
    patch_res_b = await client.patch(
        f"/guidance/steps/{step_id}",
        json={"status": "in_progress"},
        headers=user_b["headers"]
    )
    assert patch_res_b.status_code == 200

    # Step status updated to in_progress
    refreshed_b2 = await UserRoadmap.get(roadmap_b.id)
    assert refreshed_b2.steps[0].status == StepStatus.IN_PROGRESS
