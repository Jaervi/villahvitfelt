import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  role: roleEnum("role").default("user").notNull(),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  impersonatedBy: text("impersonatedBy"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const invite = pgTable("invite", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  code: text("code").notNull().unique(),
  role: roleEnum("role").default("user").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  claimedAt: timestamp("claimedAt"),
});

export const guide = pgTable("guide", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown or HTML
  category: text("category").notNull(), // e.g., 'arrival', 'sauna', 'boat'
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const reservation = pgTable("reservation", {
  id: uuid("id").primaryKey().defaultRandom(),
  reserveeName: text("reserveeName").notNull(),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  attendees: integer("attendees").notNull().default(1),
  isRestricted: boolean("isRestricted").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projectStatusEnum = ["idea", "planned", "in-progress", "completed"] as const;

export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("planned"), // idea, planned, in-progress, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  budget: integer("budget").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const projectTask = pgTable("projectTask", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  assigneeName: text("assigneeName"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const projectItem = pgTable("projectItem", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  link: text("link"),
  estimatedCost: integer("estimatedCost").default(0).notNull(),
  isProcured: boolean("isProcured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileName: text("fileName").notNull(),
  filePath: text("filePath").notNull(),
  fileType: text("fileType").notNull(),
  relatedType: text("relatedType").notNull(), // 'guide', 'project', etc.
  relatedId: uuid("relatedId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const maintenanceTask = pgTable("maintenanceTask", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  intervalType: text("intervalType").notNull(), // 'days' | 'person-days'
  intervalValue: integer("intervalValue").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const maintenanceLog = pgTable("maintenanceLog", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("taskId")
    .notNull()
    .references(() => maintenanceTask.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  guestName: text("guestName"),
  notes: text("notes"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});
