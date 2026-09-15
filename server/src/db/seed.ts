import { pool } from "./connection.js";

const DEFAULT_CLUBS: Array<{ name: string; type: string; avg_carry_yds: number | null }> = [
  { name: "Driver", type: "wood", avg_carry_yds: 230 },
  { name: "3W", type: "wood", avg_carry_yds: 210 },
  { name: "5W", type: "wood", avg_carry_yds: 195 },
  { name: "4i", type: "iron", avg_carry_yds: 180 },
  { name: "5i", type: "iron", avg_carry_yds: 170 },
  { name: "6i", type: "iron", avg_carry_yds: 160 },
  { name: "7i", type: "iron", avg_carry_yds: 150 },
  { name: "8i", type: "iron", avg_carry_yds: 140 },
  { name: "9i", type: "iron", avg_carry_yds: 130 },
  { name: "PW", type: "wedge", avg_carry_yds: 115 },
  { name: "GW", type: "wedge", avg_carry_yds: 100 },
  { name: "SW", type: "wedge", avg_carry_yds: 85 },
  { name: "LW", type: "wedge", avg_carry_yds: 70 },
  { name: "Putter", type: "putter", avg_carry_yds: null },
];

export async function seedClubs(userId: number) {
  for (const club of DEFAULT_CLUBS) {
    await pool.query(
      `INSERT INTO clubs (user_id, name, type, avg_carry_yds) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [userId, club.name, club.type, club.avg_carry_yds]
    );
  }
}

interface SeedDrill {
  name: string;
  category: "full_swing" | "short_game" | "putting";
  targets_miss_pattern: string;
  description: string;
  est_duration_min: number;
  difficulty: number;
}

const STARTER_DRILLS: SeedDrill[] = [
  {
    name: "Alignment Stick Gate",
    category: "full_swing",
    targets_miss_pattern: "push,push_right,right,slice",
    description: "Set two alignment sticks as a gate just outside the ball's start line and swing through without touching either stick.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Split-Grip Face Awareness",
    category: "full_swing",
    targets_miss_pattern: "hook,pull,pull_left,left",
    description: "Split your hands apart on the grip to exaggerate face rotation feel and groove a square-to-slightly-open clubface through impact.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Headcover Outside-Ball Path Check",
    category: "full_swing",
    targets_miss_pattern: "slice,right",
    description: "Place a headcover just outside and behind the ball on your swing path; an out-to-in slice path will clip it on the downswing.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Impact Bag Strike Point",
    category: "full_swing",
    targets_miss_pattern: "fat,chunk,thin",
    description: "Hit into an impact bag (or folded towel) focusing on ball-then-turf contact to groove low-point control.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Towel-Behind-Ball Fat Fix",
    category: "full_swing",
    targets_miss_pattern: "fat,chunk",
    description: "Lay a towel a few inches behind the ball and practice swings that miss the towel, forcing ball-first contact.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Tee-Height Ladder (Thin Fix)",
    category: "full_swing",
    targets_miss_pattern: "thin",
    description: "Hit shots off progressively lower tees down to the turf, keeping the same low point to eliminate thin contact.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Impact Tape Toe/Heel Check",
    category: "full_swing",
    targets_miss_pattern: "toe,heel",
    description: "Apply impact tape or spray to the clubface and check where contact lands relative to the center to correct toe/heel strikes.",
    est_duration_min: 5,
    difficulty: 1,
  },
  {
    name: "Two-Tee Gate Drill",
    category: "full_swing",
    targets_miss_pattern: "pull,push,pull_left,push_right,left,right",
    description: "Set two tees just wider than your clubhead at address and swing through the gate without touching either tee, grooving a square path.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Gate Putts — Square Face Through Break",
    category: "putting",
    targets_miss_pattern: "left_to_right_putts,right_to_left_putts",
    description: "Putt through a tee gate just past your target line on breaking putts to check start-line accuracy relative to your read.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Break Read & Aim Ladder (L to R)",
    category: "putting",
    targets_miss_pattern: "left_to_right_putts",
    description: "Putt a ladder of left-to-right breaking putts, deliberately aiming further left each rep until you find the correct starting line.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Break Read & Aim Ladder (R to L)",
    category: "putting",
    targets_miss_pattern: "right_to_left_putts",
    description: "Putt a ladder of right-to-left breaking putts, deliberately aiming further right each rep until you find the correct starting line.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "3-Foot Circle Drill",
    category: "putting",
    targets_miss_pattern: "short_putts_miss",
    description: "Place 6-8 balls in a circle 3 feet from the hole and make every putt before moving on, building short-putt confidence.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Clock Drill 3-6ft",
    category: "putting",
    targets_miss_pattern: "short_putts_miss",
    description: "Putt from 4 positions around the hole at 3, 4, 5, and 6 feet, completing a full 'clock' before repeating.",
    est_duration_min: 15,
    difficulty: 2,
  },
];

export async function seedDrills() {
  for (const drill of STARTER_DRILLS) {
    await pool.query(
      `INSERT INTO drills (name, category, targets_miss_pattern, club_focus_id, description, est_duration_min, difficulty)
       VALUES ($1, $2, $3, NULL, $4, $5, $6)
       ON CONFLICT (name) DO NOTHING`,
      [drill.name, drill.category, drill.targets_miss_pattern, drill.description, drill.est_duration_min, drill.difficulty]
    );
  }
}
