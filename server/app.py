from flask import Flask, request, jsonify
from PIL import Image
from classify import classify_image

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization"
    )
    response.headers.add(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    )
    return response

@app.route("/api/classify", methods=["POST"])
@app.route("/classify", methods=["POST"])
def classify_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400

    image_file = request.files["file"]
    try:
        image = Image.open(image_file.stream)
    except Exception as exc:
        return jsonify({"error": f"Invalid image: {exc}"}), 400

    results = classify_image(image)
    top_prediction = results[0] if results else None
    label = top_prediction.get("label") if top_prediction else None
    score = top_prediction.get("score") if top_prediction else None

    payload = {
        "type": label.lower().strip() if isinstance(label, str) else None,
        "confidence": score,
        "predictions": results,
    }
    return jsonify(payload)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
