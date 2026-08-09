# ScribblePark | Summer Hacks 2026

> Draw something. Plant it. Watch the meadow grow.

ScribblePark is a collaborative living meadow where anyone can doodle a creature or plant, and watch it appear in a shared 3D world, permanently, alongside every other drawing ever made.

Built for **SummerHacks 2026** competing in the **Main Track** and the **TECHNATION Data Intelligence Track**.

---

## What It Does

1. **Draw**: Sketch an outline on a 64×64 canvas, then color it in on a second pass.
2. **Transform**: A fine-tuned BEiT sketch classifier identifies what you drew (flower, rabbit, fish, butterfly, etc.) and places it in the right part of the meadow automatically.
3. **Plant**: Your creation appears live in a shared Three.js world that anyone on the internet can visit.
4. **Discover**: An entry card shows you real stats: which number flower/rabbit/duck you are, how many others share your name, and how many total creations live in the park.

The meadow gets richer with every visitor. Land animals roam the grass, fish swim beneath the pond, birds float in the air, and litter collects in the designated dump corner.

---

## The Transformation

**Input → Classification → Placement → World**

- The outline drawing is exported as a white-background 64×64 PNG and sent to a Flask API running [`kmewhort/beit-sketch-classifier`](https://huggingface.co/kmewhort/beit-sketch-classifier) (a BEiT vision transformer fine-tuned on sketches).
- Classification runs as soon as the user taps **Next →** (after the outline phase), so by the time they finish coloring the result is already cached — pressing **Plant in World** is near-instant.
- The top-5 predictions are used with a fallback chain, so edge cases (e.g. a whale classified as "landfill") resolve to the most sensible park category.
- Placement is deterministic per category: pond animals go in the pond, flyers go in the air, toads hug the pond edge, litter scatters in the dump.

---

## Data Intelligence

ScribblePark collects real, live usage data and surfaces it directly to users:

- **Entry card**: shown immediately after planting, displaying: which number of that type you are, how many others share your creation's name, and total park population. All computed from the live database, never hardcoded.
- **Park composition**: the world itself is a live visualization. The ratio of flowers to trees to fish reflects exactly who has visited and what they drew.
- Data updates in real time; every new submission changes the stats the next person sees.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Three.js (`@react-three/fiber`, `@react-three/drei`) |
| Drawing | HTML5 Canvas (64×64 native resolution, CSS-scaled) with flood fill |
| Classifier | Python · Flask · HuggingFace Transformers · BEiT sketch model |
| Backend API | Node.js · Express · MySQL |
| Hosting | Vercel (frontend + API), Railway (classifier) |

---

## Running Locally

### Client
```bash
cd client
npm install
npm run dev
```

Set `VITE_API_BASE_URL` and `VITE_CLASSIFIER_URL` in `client/.env`.

### Node API server
```bash
cd server
npm install
node server.js
```

Requires env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `CLIENT_URL`.

### Python classifier
```bash
cd server
pip install -r requirements.txt
python app.py
```

---

## How It Fits the Judging Criteria

**One moment of input**: Drawing takes under 60 seconds. No account, no setup, no explanation needed.

**Non-trivial transformation**: A BEiT vision transformer classifies the sketch in real time and uses the result to decide where in the 3D world the creation lives. The classification also drives the physics profile (scale, animation, zone).

**A stranger sees it** — The meadow is publicly deployed. Anyone with the link sees the same live world.

**Gets better with more people** — Every new drawing makes the meadow more alive. A park with one flower is lonely. A park with two hundred drawings — flowers, fish, rabbits, birds — is a world.
