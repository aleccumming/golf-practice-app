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

  async create(input: { email: string; password_hash: string; display_name: string | null }): Promise<User> {
    const { rows } = await pool.query<User>(
      "INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING *",
      [input.email.toLowerCase(), input.password_hash, input.display_name]
    );
    return rows[0];
  },
};
