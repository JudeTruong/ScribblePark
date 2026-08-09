const PROFILES = {
  flower: {
    behavior: "sway",
    zone: "land",
    minScale: 0.7,
    maxScale: 1.2,
  },

  plant: {
    behavior: "sway",
    zone: "land",
    minScale: 0.8,
    maxScale: 1.4,
  },

  bush: {
    behavior: "sway",
    zone: "land",
    minScale: 1,
    maxScale: 1.7,
  },

  tree: {
    behavior: "sway",
    zone: "land",
    minScale: 2,
    maxScale: 3.2,
  },

  fruit: {
    behavior: "hang",
    zone: "tree",
    minScale: 0.3,
    maxScale: 0.55,
  },

  flying: {
    behavior: "fly",
    zone: "air",
    minScale: 0.4,
    maxScale: 0.9,
  },

  aquatic: {
    behavior: "swim",
    zone: "pond",
    minScale: 0.4,
    maxScale: 0.9,
  },

  floating: {
    behavior: "float",
    zone: "pondSurface",
    minScale: 0.6,
    maxScale: 1,
  },

  hopping: {
    behavior: "hop",
    zone: "land",
    minScale: 0.6,
    maxScale: 1.1,
  },

  wandering: {
    behavior: "wander",
    zone: "land",
    minScale: 0.7,
    maxScale: 1.5,
  },

  crawling: {
    behavior: "crawl",
    zone: "land",
    minScale: 0.2,
    maxScale: 0.6,
  },

  static: {
    behavior: "static",
    zone: "land",
    minScale: 0.5,
    maxScale: 1.2,
  },
};

const LABEL_GROUPS = {
  flower: [
    "flower",
    "rose",
    "tulip",
    "daisy",
    "sunflower",
    "lily",
    "orchid",
  ],

  plant: [
    "plant",
    "grass",
    "fern",
    "cactus",
    "vine",
    "leaf",
  ],

  bush: [
    "bush",
    "shrub",
    "hedge",
  ],

  tree: [
    "tree",
    "pine tree",
    "palm tree",
    "oak tree",
  ],

  fruit: [
    "fruit",
    "apple",
    "orange",
    "pear",
    "peach",
    "cherry",
    "lemon",
    "lime",
    "plum",
    "mango",
    "banana",
    "coconut",
    "avocado",
  ],

  flying: [
    "bird",
    "butterfly",
    "bee",
    "dragonfly",
    "moth",
    "bat",
    "owl",
    "eagle",
    "parrot",
    "pigeon",
    "crow",
    "hummingbird",
  ],

  aquatic: [
    "fish",
    "goldfish",
    "koi",
    "shark",
    "eel",
    "seahorse",
    "jellyfish",
    "octopus",
    "squid",
    "stingray",
  ],

  floating: [
    "duck",
    "swan",
    "goose",
    "turtle",
    "otter",
    "beaver",
  ],

  hopping: [
    "rabbit",
    "bunny",
    "frog",
    "toad",
    "kangaroo",
  ],

  wandering: [
    "dog",
    "cat",
    "fox",
    "deer",
    "bear",
    "wolf",
    "horse",
    "cow",
    "pig",
    "sheep",
    "goat",
    "squirrel",
    "mouse",
    "raccoon",
    "elephant",
    "giraffe",
    "lion",
    "tiger",
  ],

  crawling: [
    "bug",
    "insect",
    "ant",
    "beetle",
    "spider",
    "snail",
    "worm",
    "caterpillar",
    "centipede",
    "lizard",
    "crab",
  ],

  static: [
    "rock",
    "stone",
    "log",
    "stick",
    "shell",
    "unknown",
  ],
};

const LABEL_TO_PROFILE = {};

for (const [profile, labels] of Object.entries(
  LABEL_GROUPS
)) {
  for (const label of labels) {
    LABEL_TO_PROFILE[label] = profile;
  }
}

const ALIASES = {
  flowers: "flower",
  plants: "plant",
  trees: "tree",
  bunny: "rabbit",
  butterflies: "butterfly",
  fishes: "fish",
  insect: "bug",
  mushroom: "plant",
};

export const TREE_ANCHORS = [
  { x: -11, y: 2.1, z: -7 },
  { x: -10, y: 1.8, z: 5 },
  { x: -6, y: 1.9, z: -11 },
  { x: 11, y: 2, z: -8 },
  { x: 12, y: 1.7, z: 6 },
  { x: 2, y: 1.9, z: -12 },
  { x: -8, y: 1.9, z: 12 },
  { x: 0, y: 1.8, z: 14 },
  { x: 9, y: 2, z: 12 },
];


export function normalizeClassification(value) {
  const normalized = String(
    value || "unknown"
  )
    .trim()
    .toLowerCase();

  return ALIASES[normalized] || normalized;
}

export function getCreationProfile(classification) {
  const normalized =
    normalizeClassification(classification);

  const profileName =
    LABEL_TO_PROFILE[normalized] || "static";

  return {
    classification: normalized,
    profile: profileName,
    ...PROFILES[profileName],
  };
}

export function randomProfileScale(classification) {
  const profile =
    getCreationProfile(classification);

  return (
    profile.minScale +
    Math.random() *
      (profile.maxScale - profile.minScale)
  );
}