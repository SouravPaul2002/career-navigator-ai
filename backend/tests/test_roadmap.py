from unittest.mock import patch
import pytest
from httpx import AsyncClient
from models import UserRoadmap, UserRoadmapStep, StepStatus
from ai_schema.schema import CareerRoadmap, RoadmapStep

@pytest.mark.asyncio
async def test_generate_roadmap_mocked(client: AsyncClient, user_a: dict):
    mock_roadmap = CareerRoadmap(
        role="DevOps Engineer",
        steps=[
            RoadmapStep(
                step_title="Learn Docker",
                description="Understand containers and docker compose",
                estimated_duration="1 week"
            ),
            RoadmapStep(
                step_title="Learn Kubernetes",
                description="Cluster orchestration and deployments",
                estimated_duration="2 weeks"
            )
        ]
    )

    with patch("routes.career.guidance_routes.generate_roadmap", return_value=mock_roadmap) as mock_gen:
        res = await client.post(
            "/guidance/generate",
            json={"job_role": "DevOps Engineer"},
            headers=user_a["headers"]
        )
        assert res.status_code == 200
        data = res.json()
        assert data["role"] == "DevOps Engineer"
        assert len(data["steps"]) == 2
        assert data["steps"][0]["step_title"] == "Learn Docker"
        mock_gen.assert_called_once_with("DevOps Engineer")

@pytest.mark.asyncio
async def test_step_status_update_flow(client: AsyncClient, user_a: dict):
    # Setup roadmap in DB for user A
    step1 = UserRoadmapStep(
        title="Learn FastAPI",
        description="Build async APIs with validation",
        estimated_duration="3 days",
        status=StepStatus.TODO,
        order_index=0
    )
    roadmap = UserRoadmap(
        user_id=user_a["id"],
        role="Python Backend Developer",
        steps=[step1]
    )
    await roadmap.insert()
    step_id = step1.id

    # 1. Update from todo -> in_progress
    res1 = await client.patch(
        f"/guidance/steps/{step_id}",
        json={"status": "in_progress"},
        headers=user_a["headers"]
    )
    assert res1.status_code == 200
    assert res1.json()["message"] == "Status updated"

    updated_roadmap1 = await UserRoadmap.get(roadmap.id)
    assert updated_roadmap1.steps[0].status == StepStatus.IN_PROGRESS

    # 2. Update from in_progress -> done
    res2 = await client.patch(
        f"/guidance/steps/{step_id}",
        json={"status": "done"},
        headers=user_a["headers"]
    )
    assert res2.status_code == 200
    assert res2.json()["message"] == "Status updated"

    updated_roadmap2 = await UserRoadmap.get(roadmap.id)
    assert updated_roadmap2.steps[0].status == StepStatus.DONE

@pytest.mark.asyncio
async def test_step_status_invalid_value_rejected(client: AsyncClient, user_a: dict):
    step1 = UserRoadmapStep(
        title="Learn MongoDB",
        description="Aggregation pipelines",
        estimated_duration="1 week",
        status=StepStatus.TODO,
        order_index=0
    )
    roadmap = UserRoadmap(
        user_id=user_a["id"],
        role="Database Engineer",
        steps=[step1]
    )
    await roadmap.insert()
    step_id = step1.id

    # Invalid status should be rejected by StepStatus Enum validation (422)
    res = await client.patch(
        f"/guidance/steps/{step_id}",
        json={"status": "completed"},  # 'completed' is invalid; must be 'todo', 'in_progress', or 'done'
        headers=user_a["headers"]
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_interview_chat_mocked(client: AsyncClient, user_a: dict):
    # Start session
    start_res = await client.post(
        "/interview/sessions",
        json={"job_role": "AI Engineer"},
        headers=user_a["headers"]
    )
    assert start_res.status_code == 200
    session_id = start_res.json()["id"]

    mock_ai_reply = "That is a great background. Can you explain transformers?"
    with patch("routes.career.interview_routes.generate_interview_response", return_value=mock_ai_reply) as mock_agent:
        chat_res = await client.post(
            f"/interview/sessions/{session_id}/chat",
            json={"message": "I have worked with PyTorch and LLMs for 2 years."},
            headers=user_a["headers"]
        )
        assert chat_res.status_code == 200
        data = chat_res.json()
        assert data["sender"] == "ai"
        assert data["content"] == mock_ai_reply
        mock_agent.assert_called_once()
