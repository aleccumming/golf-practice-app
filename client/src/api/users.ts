import { http } from "./http";
import type { Handedness, PrimaryGoal, User } from "../types";

export interface OnboardingInput {
  handicap: number | null;
  handedness: Handedness;
  primary_goal: PrimaryGoal | null;
  skill_driving: number | null;
  skill_irons: number | null;
  skill_short_game: number | null;
  skill_putting: number | null;
  practice_frequency_per_week: number | null;
  practice_session_minutes: number | null;
}

export const usersApi = {
  completeOnboarding: (input: OnboardingInput) => http.post<{ user: User }>("/users/onboarding", input),
};
