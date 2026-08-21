import { users, logos, type User, type InsertUser, type Logo, type InsertLogo } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Logo operations
  getLogosByUserId(userId: number): Promise<Logo[]>;
  createLogo(logo: InsertLogo): Promise<Logo>;
  deleteLogo(id: number, userId: number): Promise<boolean>;
  deleteAllLogos(userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username.trim()));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: insertUser.email.toLowerCase().trim(),
        username: insertUser.username.trim(),
        password: insertUser.password,
      })
      .returning();
    return user;
  }

  async getLogosByUserId(userId: number): Promise<Logo[]> {
    return await db
      .select()
      .from(logos)
      .where(eq(logos.userId, userId))
      .orderBy(desc(logos.createdAt));
  }

  async createLogo(insertLogo: InsertLogo): Promise<Logo> {
    const [logo] = await db
      .insert(logos)
      .values(insertLogo)
      .returning();
    return logo;
  }

  async deleteLogo(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(logos)
      .where(and(eq(logos.id, id), eq(logos.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async deleteAllLogos(userId: number): Promise<boolean> {
    await db
      .delete(logos)
      .where(eq(logos.userId, userId));
    return true;
  }
}

export const storage = new DatabaseStorage();
