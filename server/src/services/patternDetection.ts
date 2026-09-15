import { pool } from "../db/connection.js";
import { practicePlansRepo } from "../repositories/practicePlans.repo.js";
import type { PlanTargetPattern, SessionType } from "../types/models.js";

const MIN_SAMPLE_SIZE = 5;
const FLAG_THRESHOLD = 0.4;

export interface ClubMissBreakdown {
  club_id: number;
  club_name: string;
  total: number;
  breakdown: { value: string; count: number; pct: number }[];
  flagged: { value: string; count: number; pct: number } | null;
}

async function rollingBreakdown(
  userId: number,
  column: "miss_direction" | "contact",
  window: number,
  sessionType: SessionType | null,
  excludeNull: boolean
): Promise<Map<number, { total: number; counts: Map<string, number> }>> {
  const { rows } = await pool.query<{ club_id: number; value: string; cnt: string }>(
    `WITH scoped AS (
      SELECT s.club_id, s.${column} AS value, s.created_at
      FROM shots s
      LEFT JOIN sessions se ON se.id = s.session_id
      WHERE s.user_id = $1
        AND ($2::text IS NULL OR se.type = $2)
        ${excludeNull ? `AND s.${column} IS NOT NULL` : ""}
        ${column === "contact" ? `AND s.contact != 'flush'` : ""}
    ),
    ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY club_id ORDER BY created_at DESC) AS rn
      FROM scoped
    )
    SELECT club_id, value, COUNT(*) AS cnt
    FROM ranked
    WHERE rn <= $3
    GROUP BY club_id, value`,
    [userId, sessionType, window]
  );

  const byClub = new Map<number, { total: number; counts: Map<string, number> }>();
  for (const row of rows) {
    const cnt = Number(row.cnt);
    if (!byClub.has(row.club_id)) byClub.set(row.club_id, { total: 0, counts: new Map() });
    const entry = byClub.get(row.club_id)!;
    entry.total += cnt;
    entry.counts.set(row.value, cnt);
  }
  return byClub;
}

async function toBreakdownList(
  userId: number,
  byClub: Map<number, { total: number; counts: Map<string, number> }>
): Promise<ClubMissBreakdown[]> {
  const { rows: clubs } = await pool.query<{ id: number; name: string }>(
    "SELECT id, name FROM clubs WHERE user_id = $1",
    [userId]
  );
  const clubNames = new Map(clubs.map((c) => [c.id, c.name]));

  return [...byClub.entries()].map(([club_id, { total, counts }]) => {
    const breakdown = [...counts.entries()]
      .map(([value, count]) => ({ value, count, pct: count / total }))
      .sort((a, b) => b.count - a.count);
    const top = breakdown[0];
    const flagged = top && top.pct >= FLAG_THRESHOLD && top.count >= MIN_SAMPLE_SIZE ? top : null;
    return { club_id, club_name: clubNames.get(club_id) ?? `#${club_id}`, total, breakdown, flagged };
  });
}

export async function getShotMissPatterns(
  userId: number,
  window: number,
  sessionType: SessionType | null
): Promise<ClubMissBreakdown[]> {
  return toBreakdownList(userId, await rollingBreakdown(userId, "miss_direction", window, sessionType, false));
}

export async function getShotContactPatterns(
  userId: number,
  window: number,
  sessionType: SessionType | null
): Promise<ClubMissBreakdown[]> {
  return toBreakdownList(userId, await rollingBreakdown(userId, "contact", window, sessionType, true));
}

export interface PuttDistanceBucket {
  bucket: string;
  total: number;
  made: number;
  make_pct: number;
}

export interface PuttBreakBias {
  break: string;
  total: number;
  missed_left: number;
  missed_right: number;
  missed_short: number;
  missed_long: number;
}

async function recentPutts(userId: number, window: number, sessionType: SessionType | null) {
  const { rows } = await pool.query<{ distance_ft: number; break: string; result: string }>(
    `SELECT p.* FROM putts p
     LEFT JOIN sessions se ON se.id = p.session_id
     WHERE p.user_id = $1 AND ($2::text IS NULL OR se.type = $2)
     ORDER BY p.created_at DESC
     LIMIT $3`,
    [userId, sessionType, window]
  );
  return rows;
}

function bucketFor(distanceFt: number): string {
  if (distanceFt <= 3) return "0-3ft";
  if (distanceFt <= 6) return "4-6ft";
  if (distanceFt <= 10) return "7-10ft";
  if (distanceFt <= 20) return "11-20ft";
  return "20ft+";
}

const BUCKET_ORDER = ["0-3ft", "4-6ft", "7-10ft", "11-20ft", "20ft+"];

export async function getPuttDistanceBuckets(
  userId: number,
  window: number,
  sessionType: SessionType | null
): Promise<PuttDistanceBucket[]> {
  const putts = await recentPutts(userId, window, sessionType);
  const byBucket = new Map<string, { total: number; made: number }>();
  for (const putt of putts) {
    const bucket = bucketFor(putt.distance_ft);
    if (!byBucket.has(bucket)) byBucket.set(bucket, { total: 0, made: 0 });
    const entry = byBucket.get(bucket)!;
    entry.total += 1;
    if (putt.result === "made") entry.made += 1;
  }
  return BUCKET_ORDER.filter((b) => byBucket.has(b)).map((bucket) => {
    const { total, made } = byBucket.get(bucket)!;
    return { bucket, total, made, make_pct: Math.round((made / total) * 1000) / 10 };
  });
}

export async function getPuttBreakBias(
  userId: number,
  window: number,
  sessionType: SessionType | null
): Promise<PuttBreakBias[]> {
  const putts = await recentPutts(userId, window, sessionType);
  const byBreak = new Map<string, PuttBreakBias>();
  for (const putt of putts) {
    if (!byBreak.has(putt.break)) {
      byBreak.set(putt.break, {
        break: putt.break,
        total: 0,
        missed_left: 0,
        missed_right: 0,
        missed_short: 0,
        missed_long: 0,
      });
    }
    const entry = byBreak.get(putt.break)!;
    entry.total += 1;
    if (putt.result === "missed_left") entry.missed_left += 1;
    if (putt.result === "missed_right") entry.missed_right += 1;
    if (putt.result === "missed_short") entry.missed_short += 1;
    if (putt.result === "missed_long") entry.missed_long += 1;
  }
  return [...byBreak.values()];
}

export interface FlaggedPuttPattern {
  tag: "left_to_right_putts" | "right_to_left_putts" | "short_putts_miss";
  count: number;
  total: number;
  pct: number;
}

export async function getFlaggedPuttPatterns(
  userId: number,
  window: number,
  sessionType: SessionType | null
): Promise<FlaggedPuttPattern[]> {
  const flagged: FlaggedPuttPattern[] = [];

  for (const bias of await getPuttBreakBias(userId, window, sessionType)) {
    if (bias.total < MIN_SAMPLE_SIZE) continue;
    if (bias.break === "left_to_right" && bias.missed_right >= bias.total * FLAG_THRESHOLD) {
      flagged.push({ tag: "left_to_right_putts", count: bias.missed_right, total: bias.total, pct: bias.missed_right / bias.total });
    }
    if (bias.break === "right_to_left" && bias.missed_left >= bias.total * FLAG_THRESHOLD) {
      flagged.push({ tag: "right_to_left_putts", count: bias.missed_left, total: bias.total, pct: bias.missed_left / bias.total });
    }
  }

  const shortBuckets = (await getPuttDistanceBuckets(userId, window, sessionType)).filter(
    (b) => (b.bucket === "0-3ft" || b.bucket === "4-6ft") && b.total >= MIN_SAMPLE_SIZE && b.make_pct < 80
  );
  for (const bucket of shortBuckets) {
    flagged.push({
      tag: "short_putts_miss",
      count: bucket.total - bucket.made,
      total: bucket.total,
      pct: 1 - bucket.make_pct / 100,
    });
  }

  return flagged;
}

export interface ProgressResult {
  tag: string;
  club_id: number | null;
  baseline_pct: number;
  current_pct: number | null;
  delta: number | null;
  sample_size: number;
  insufficient_data: boolean;
}

async function currentPctForTarget(
  userId: number,
  target: PlanTargetPattern,
  generatedAt: string
): Promise<{ pct: number; sampleSize: number }> {
  if (target.pattern_type === "shot_miss_direction" || target.pattern_type === "shot_contact") {
    const column = target.pattern_type === "shot_miss_direction" ? "miss_direction" : "contact";
    const totalRes = await pool.query<{ c: string }>(
      "SELECT COUNT(*) AS c FROM shots WHERE user_id = $1 AND club_id = $2 AND created_at > $3",
      [userId, target.club_id, generatedAt]
    );
    const matchingRes = await pool.query<{ c: string }>(
      `SELECT COUNT(*) AS c FROM shots WHERE user_id = $1 AND club_id = $2 AND ${column} = $3 AND created_at > $4`,
      [userId, target.club_id, target.tag, generatedAt]
    );
    const total = Number(totalRes.rows[0].c);
    const matching = Number(matchingRes.rows[0].c);
    return { pct: total > 0 ? matching / total : 0, sampleSize: total };
  }

  if (target.pattern_type === "putt_break_bias") {
    const breakValue = target.tag === "left_to_right_putts" ? "left_to_right" : "right_to_left";
    const missSide = target.tag === "left_to_right_putts" ? "missed_right" : "missed_left";
    const totalRes = await pool.query<{ c: string }>(
      "SELECT COUNT(*) AS c FROM putts WHERE user_id = $1 AND break = $2 AND created_at > $3",
      [userId, breakValue, generatedAt]
    );
    const matchingRes = await pool.query<{ c: string }>(
      "SELECT COUNT(*) AS c FROM putts WHERE user_id = $1 AND break = $2 AND result = $3 AND created_at > $4",
      [userId, breakValue, missSide, generatedAt]
    );
    const total = Number(totalRes.rows[0].c);
    const matching = Number(matchingRes.rows[0].c);
    return { pct: total > 0 ? matching / total : 0, sampleSize: total };
  }

  // putt_short_miss
  const totalRes = await pool.query<{ c: string }>(
    "SELECT COUNT(*) AS c FROM putts WHERE user_id = $1 AND distance_ft <= 6 AND created_at > $2",
    [userId, generatedAt]
  );
  const madeRes = await pool.query<{ c: string }>(
    "SELECT COUNT(*) AS c FROM putts WHERE user_id = $1 AND distance_ft <= 6 AND result = 'made' AND created_at > $2",
    [userId, generatedAt]
  );
  const total = Number(totalRes.rows[0].c);
  const made = Number(madeRes.rows[0].c);
  return { pct: total > 0 ? 1 - made / total : 0, sampleSize: total };
}

export async function getProgressForPlan(userId: number, planId: number): Promise<ProgressResult[]> {
  const plan = await practicePlansRepo.get(userId, planId);
  if (!plan) return [];
  const targets = await practicePlansRepo.targetsFor(planId);

  return Promise.all(
    targets.map(async (target) => {
      const { pct, sampleSize } = await currentPctForTarget(userId, target, plan.generated_at);
      const insufficientData = sampleSize < MIN_SAMPLE_SIZE;
      return {
        tag: target.tag,
        club_id: target.club_id,
        baseline_pct: target.baseline_pct,
        current_pct: insufficientData ? null : pct,
        delta: insufficientData ? null : pct - target.baseline_pct,
        sample_size: sampleSize,
        insufficient_data: insufficientData,
      };
    })
  );
}
