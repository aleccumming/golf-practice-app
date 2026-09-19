import { pool } from "../db/connection.js";
import type { User } from "../types/models.js";

export const usersRepo = {
  async findByEmail(email: string): Promise<User | undefined> {
    const { rows } = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    return rows[0];
  },

  async get(id: number): Promise<User | undefined> {
    const { rows } = await pool.query<User>("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0];
  },

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    const { rows } = await pool.query<User>("SELECT * FROM users WHERE google_id = $1", [googleId]);
    return rows[0];
  },

  async createWithGoogle(input: {
    email: string;
    google_id: string;
    display_name: string | null;
    avatar_url: string | null;
  }): Promise<User> {
    const { rows } = await pool.query<User>(
      "INSERT INTO users (email, google_id, display_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [input.email.toLowerCase(), input.google_id, input.display_name, input.avatar_url]
    );
    return rows[0];
  },

  async linkGoogleId(userId: number, googleId: string, avatarUrl: string | null): Promise<User> {
    const { rows } = await pool.query<User>(
      "UPDATE users SET google_id = $2, avatar_url = COALESCE(avatar_url, $3) WHERE id = $1 RETURNING *",
      [userId, googleId, avatarUrl]
    );
    return rows[0];
  },

  async completeOnboarding(
    userId: number,
    input: {
      handicap: number | null;
      handedness: "left" | "right";
      primary_goal: string | null;
      skill_driving: number | null;
      skill_irons: number | null;
      skill_short_game: number | null;
      skill_putting: number | null;
      practice_frequency_per_week: number | null;
      practice_session_minutes: number | null;
    }
  ): Promise<User> {
    const { rows } = await pool.query<User>(
      `UPDATE users SET
        handicap = $2,
        handedness = $3,
        primary_goal = $4,
        skill_driving = $5,
        skill_irons = $6,
        skill_short_game = $7,
        skill_putting = $8,
        practice_frequency_per_week = $9,
        practice_session_minutes = $10,
        onboarding_completed_at = NOW()
      WHERE id = $1 RETURNING *`,
      [
        userId,
        input.handicap,
        input.handedness,
        input.primary_goal,
        input.skill_driving,
        input.skill_irons,
        input.skill_short_game,
        input.skill_putting,
        input.practice_frequency_per_week,
        input.practice_session_minutes,
      ]
    );
    return rows[0];
  },
};
