import vertexai
from vertexai.generative_models import GenerativeModel

# TODO(developer): Update and un-comment below line
# project_id = "PROJECT_ID"

vertexai.init(project=project_id, location="us-central1")

model = GenerativeModel("gemini-1.5-flash-001")

response = model.generate_content(
    "What's a good name for a flower shop that specializes in selling bouquets of dried flowers?"
)

print(response.text)
