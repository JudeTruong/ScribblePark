const API_BASE_URL = "http://localhost:3001";

export async function getCreations() {
  const response = await fetch(`${API_BASE_URL}/api/creations`);
  if (!response.ok) {
    throw new Error("Failed to load creations");
  }
  return response.json();
}

export async function createCreation({ classification, creatorName, imageBlob, position, scale }) {
  const formData = new FormData();
  formData.append("classification", classification);
  if (creatorName) {
    formData.append("creatorName", creatorName);
  }
  formData.append("image", imageBlob, "creation.png");
  formData.append("positionX", position.x);
  formData.append("positionY", position.y);
  formData.append("positionZ", position.z);
  formData.append("scale", scale);

  const response = await fetch(`${API_BASE_URL}/api/creations`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Failed to save creation");
  }

  return response.json();
}
