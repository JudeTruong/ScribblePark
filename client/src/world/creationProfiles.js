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
    behavior: "fallen",
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

  landfill: {
    behavior: "static",
    zone: "landfill",
    minScale: 0.5,
    maxScale: 1.1,
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
    "mammal",
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

  landfill: [
    "landfill",
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
  // Trunk base of each foreground tree, with the tree's scale so
  // fallen fruit can rest between the trunk and the drip line.
  { x: -11, y: 0, z: -7, scale: 1.5 },
  { x: -10, y: 0, z: 5, scale: 1.15 },
  { x: -6, y: 0, z: -11, scale: 1.25 },
  { x: 11, y: 0, z: -8, scale: 1.4 },
  { x: 12, y: 0, z: 6, scale: 1.05 },
  { x: 2, y: 0, z: -12, scale: 1.2 },
  { x: -8, y: 0, z: 12, scale: 1.25 },
  { x: 0, y: 0, z: 14, scale: 1.1 },
  { x: 9, y: 0, z: 12, scale: 1.3 },
  { x: 24, y: 0, z: -8, scale: 1.55 },
  { x: 29, y: 0, z: -15, scale: 1.35 },
  { x: 21, y: 0, z: -22, scale: 1.45 },
  { x: 11, y: 0, z: -31, scale: 1.3 },
  { x: -3, y: 0, z: -35, scale: 1.5 },
  { x: -19, y: 0, z: -29, scale: 1.35 },
  { x: -32, y: 0, z: 6, scale: 1.25 },
  { x: -29, y: 0, z: 22, scale: 1.4 },
  { x: -16, y: 0, z: 33, scale: 1.3 },
  { x: 5, y: 0, z: 36, scale: 1.35 },
  { x: 23, y: 0, z: 29, scale: 1.25 },
  { x: 34, y: 0, z: 11, scale: 1.45 },
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
