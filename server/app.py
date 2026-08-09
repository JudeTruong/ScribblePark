from flask import Flask, request, jsonify
from PIL import Image
from classify import classify_image

app = Flask(__name__)

@app.route("/classify", methods=["POST"])
def classify_endpoint():
    if "image" not in request.files:
        return jsonify({"error": "Missing image file"}), 400

    image_file = request.files["image"]
    try:
        image = Image.open(image_file.stream)
    except Exception as exc:
        return jsonify({"error": f"Invalid image: {exc}"}), 400

    results = classify_image(image)
    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
