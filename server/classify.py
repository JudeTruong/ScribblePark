from transformers import pipeline
from PIL import Image

MODEL_NAME = "kmewhort/beit-sketch-classifier"

classifier = pipeline(
    "image-classification",
    model=MODEL_NAME
)

def classify_image(image):
    image = image.convert("RGB")

    results = classifier(image, top_k=5)

    return results