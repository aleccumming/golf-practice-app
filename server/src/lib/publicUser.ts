import type { User } from "../types/models.js";

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    handicap: user.handicap,
    handedness: user.handedness,
    primary_goal: user.primary_goal,
    skill_driving: user.skill_driving,
    skill_irons: user.skill_irons,
    skill_short_game: user.skill_short_game,
    skill_putting: user.skill_putting,
    practice_frequency_per_week: user.practice_frequency_per_week,
    practice_session_minutes: user.practice_session_minutes,
    onboarding_completed_at: user.onboarding_completed_at,
  };
}
