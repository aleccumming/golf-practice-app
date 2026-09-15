import { drillsRepo } from "../repositories/drills.repo.js";
import { practicePlansRepo } from "../repositories/practicePlans.repo.js";
import type { PlanDrillEntry, PlanTargetInput } from "../repositories/practicePlans.repo.js";
import {
  getShotMissPatterns,
  getShotContactPatterns,
  getFlaggedPuttPatterns,
} from "./patternDetection.js";
import type { Drill, DrillCategory, PracticePlan, SessionType } from "../types/models.js";

const MISS_TAGS: Record<string, string[]> = {
  pull: ["pull", "pull_left", "left"],
  push: ["push", "push_right", "right"],
  hook: ["hook", "left"],
  slice: ["slice", "right"],
  left: ["left"],
  right: ["right"],
};

const CONTACT_TAGS: Record<string, string[]> = {
  fat: ["fat", "chunk"],
  thin: ["thin"],
  toe: ["toe"],
  heel: ["heel"],
};

interface FlaggedPattern {
  patternType: "shot_miss_direction" | "shot_contact" | "putt_break_bias" | "putt_short_miss";
  clubId: number | null;
  drillTags: string[];
  tag: string;
  count: number;
  total: number;
  pct: number;
  label: string;
}

const CATEGORY_ORDER: DrillCategory[] = ["full_swing", "short_game", "putting"];
const MAX_TARGETED_DRILLS = 4;
const DRILLS_PER_PATTERN = 2;
const RANDOM_DRILL_COUNT = 2;

async function collectFlaggedPatterns(
  userId: number,
  window: number,
  sessionType: SessionType | null
): Promise<FlaggedPattern[]> {
  const patterns: FlaggedPattern[] = [];

  for (const club of await getShotMissPatterns(userId, window, sessionType)) {
    if (!club.flagged || !MISS_TAGS[club.flagged.value]) continue;
    patterns.push({
      patternType: "shot_miss_direction",
      clubId: club.club_id,
      drillTags: MISS_TAGS[club.flagged.value],
      tag: club.flagged.value,
      count: club.flagged.count,
      total: club.total,
      pct: club.flagged.pct,
      label: `${club.club_name} ${club.flagged.value} (${Math.round(club.flagged.pct * 100)}% of last ${club.total})`,
    });
  }

  for (const club of await getShotContactPatterns(userId, window, sessionType)) {
    if (!club.flagged || !CONTACT_TAGS[club.flagged.value]) continue;
    patterns.push({
      patternType: "shot_contact",
      clubId: club.club_id,
      drillTags: CONTACT_TAGS[club.flagged.value],
      tag: club.flagged.value,
      count: club.flagged.count,
      total: club.total,
      pct: club.flagged.pct,
      label: `${club.club_name} ${club.flagged.value} contact (${Math.round(club.flagged.pct * 100)}% of last ${club.total})`,
    });
  }

  for (const putt of await getFlaggedPuttPatterns(userId, 30, sessionType)) {
    patterns.push({
      patternType: putt.tag === "short_putts_miss" ? "putt_short_miss" : "putt_break_bias",
      clubId: null,
      drillTags: [putt.tag],
      tag: putt.tag,
      count: putt.count,
      total: putt.total,
      pct: putt.pct,
      label: `putts: ${putt.tag.replace(/_/g, " ")} (${putt.count}/${putt.total})`,
    });
  }

  return patterns.sort((a, b) => b.pct - a.pct).slice(0, 3);
}

async function pickTargetedDrills(patterns: FlaggedPattern[]): Promise<{ drills: Drill[]; used: Set<number> }> {
  const used = new Set<number>();
  const picked: Drill[] = [];

  for (const pattern of patterns) {
    if (picked.length >= MAX_TARGETED_DRILLS) break;
    const candidates = (await drillsRepo.byTags(pattern.drillTags))
      .filter((d) => !used.has(d.id))
      .sort((a, b) => {
        const aMatch = a.club_focus_id === pattern.clubId ? 0 : 1;
        const bMatch = b.club_focus_id === pattern.clubId ? 0 : 1;
        return aMatch - bMatch;
      });

    for (const drill of candidates.slice(0, DRILLS_PER_PATTERN)) {
      if (picked.length >= MAX_TARGETED_DRILLS) break;
      picked.push(drill);
      used.add(drill.id);
    }
  }

  return { drills: picked, used };
}

async function pickRandomDrills(used: Set<number>, targeted: Drill[]): Promise<Drill[]> {
  const remaining = (await drillsRepo.all()).filter((d) => !used.has(d.id));
  if (remaining.length === 0) return [];

  const representedCategories = new Set(targeted.map((d) => d.category));
  const missingCategoryDrills = remaining.filter((d) => !representedCategories.has(d.category));

  const candidatePool = [...missingCategoryDrills, ...remaining.filter((d) => representedCategories.has(d.category))];
  const uniquePool = [...new Map(candidatePool.map((d) => [d.id, d])).values()];

  const picked: Drill[] = [];
  const shuffled = [...uniquePool].sort(() => Math.random() - 0.5);
  for (const drill of shuffled) {
    if (picked.length >= RANDOM_DRILL_COUNT) break;
    picked.push(drill);
  }
  return picked;
}

export async function generatePracticePlan(
  userId: number,
  sessionType: SessionType | null = null
): Promise<PracticePlan> {
  const flaggedPatterns = await collectFlaggedPatterns(userId, 25, sessionType);
  const { drills: targeted, used } = await pickTargetedDrills(flaggedPatterns);
  const random = await pickRandomDrills(used, targeted);

  const combined = [...targeted, ...random];
  const ordered = [...combined].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  );

  const entries: PlanDrillEntry[] = ordered.map((drill, index) => ({ drill_id: drill.id, order_index: index }));

  const targets: PlanTargetInput[] = flaggedPatterns.map((p) => ({
    pattern_type: p.patternType,
    club_id: p.clubId,
    tag: p.tag,
    baseline_count: p.count,
    baseline_total: p.total,
    baseline_pct: p.pct,
  }));

  const basedOnPattern = flaggedPatterns.length > 0 ? flaggedPatterns.map((p) => p.label).join("; ") : null;

  return practicePlansRepo.create(userId, basedOnPattern, entries, targets);
}
