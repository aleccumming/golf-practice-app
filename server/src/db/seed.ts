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
    targets_miss_pattern: "push",
    description: "Set two alignment sticks as a gate just outside the ball's start line and swing through without touching either stick.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Split-Grip Face Awareness",
    category: "full_swing",
    targets_miss_pattern: "hook",
    description: "Split your hands apart on the grip to exaggerate face rotation feel and groove a square-to-slightly-open clubface through impact.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Headcover Outside-Ball Path Check",
    category: "full_swing",
    targets_miss_pattern: "slice",
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
    targets_miss_pattern: "pull,push",
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
  {
    name: "Step-Through Weight Shift Drill",
    category: "full_swing",
    targets_miss_pattern: "pull",
    description: "Start with your trail foot touching your lead foot, then step into your normal stance as you swing, encouraging a full weight shift instead of hanging back and pulling shots left.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Weak Grip Reset",
    category: "full_swing",
    targets_miss_pattern: "hook",
    description: "Check your grip in a mirror — if you see more than two knuckles on your lead hand, rotate it slightly weaker to reduce the excess clubface rotation that causes hooks.",
    est_duration_min: 5,
    difficulty: 1,
  },
  {
    name: "Feet-Together Balance Drill",
    category: "full_swing",
    targets_miss_pattern: "slice",
    description: "Hit shots with your feet nearly touching; an out-to-in slice path will pull you off balance, training a rounder, more in-to-out swing path.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Basket-Behind-the-Ball Drill",
    category: "full_swing",
    targets_miss_pattern: "push",
    description: "Place a basket or headcover just behind and inside the ball on your target line; a path that gets stuck too far inside and pushes shots right will clip it.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Divot-Ahead Drill",
    category: "full_swing",
    targets_miss_pattern: "thin",
    description: "Make practice swings on turf without a ball, checking that your divot starts just ahead of where the ball would sit, to build a low point that prevents thin contact.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Two-Tee Width Gate",
    category: "full_swing",
    targets_miss_pattern: "toe,heel",
    description: "Push two tees into the ground just wider than your clubhead at the toe and heel, then hit shots trying to strike the center of the face without touching either tee.",
    est_duration_min: 5,
    difficulty: 1,
  },
  {
    name: "Tempo Count Drill",
    category: "full_swing",
    targets_miss_pattern: "pull,push,hook,slice",
    description: "Count '1-2' out loud on every swing (one on the backswing, two on the downswing) to slow down a rushed tempo, a common root cause behind pulls, pushes, hooks, and slices.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Chip Landing Spot Ladder",
    category: "short_game",
    targets_miss_pattern: "distance_control",
    description: "Pick a landing spot a few feet onto the green and hit a series of chips trying to land each one on that exact spot, building consistent carry distance.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "One-Hop-Two-Hop Drill",
    category: "short_game",
    targets_miss_pattern: "distance_control",
    description: "Chip to the same target trying to control exactly how many times the ball bounces before it releases toward the hole, sharpening feel for how landing spot affects roll-out.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Putter-Grip Chip Drill",
    category: "short_game",
    targets_miss_pattern: "fat,chunk",
    description: "Choke down and grip a wedge like a putter, using a shoulder-driven stroke with minimal wrist hinge to eliminate the extra hand action that causes chunked chips.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Hands-Ahead Low-Point Chip Drill",
    category: "short_game",
    targets_miss_pattern: "thin",
    description: "Chip off a tight or slightly downhill lie, focusing on keeping your hands ahead of the clubhead at impact to avoid thin, bladed chips.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Bunker Splash Drill",
    category: "short_game",
    targets_miss_pattern: "bunker",
    description: "Practice splashing sand out of a greenside bunker, focusing on an open clubface and hitting about two inches behind the ball rather than the ball itself.",
    est_duration_min: 15,
    difficulty: 3,
  },
  {
    name: "Toe-Down Pitch Drill",
    category: "short_game",
    targets_miss_pattern: "toe,heel",
    description: "Hit pitch shots focusing on maintaining the club's toe-down posture through impact to avoid inconsistent toe or heel contact on partial swings.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "20/40/60 Pitch Ladder",
    category: "short_game",
    targets_miss_pattern: "distance_control",
    description: "Hit pitch shots to targets at 20, 40, and 60 yards using different backswing lengths, building feel for matching swing size to distance.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Lag Putting Ladder",
    category: "putting",
    targets_miss_pattern: "distance_control",
    description: "Putt to targets at 10, 20, 30, and 40 feet, focusing only on distance control so every putt finishes within a 3-foot circle of the hole.",
    est_duration_min: 10,
    difficulty: 1,
  },
  {
    name: "Straight-Putt Gate",
    category: "putting",
    targets_miss_pattern: "straight_putts",
    description: "On a flat, straight putt, set a tee gate just wider than the ball a foot in front of it, and putt through the gate to check your start-line accuracy.",
    est_duration_min: 5,
    difficulty: 1,
  },
  {
    name: "Speed Control Circuit",
    category: "putting",
    targets_miss_pattern: "distance_control",
    description: "Putt to five different distances in a row without resetting your feel, training your touch to adapt shot-to-shot instead of grooving a single pace.",
    est_duration_min: 10,
    difficulty: 2,
  },
  {
    name: "Three-Distance Pressure Putts",
    category: "putting",
    targets_miss_pattern: "short_putts_miss",
    description: "Make 5 putts in a row from 3, 4, and 5 feet before moving to the next distance — miss one and start that distance over, building pressure-tested short putting.",
    est_duration_min: 10,
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
