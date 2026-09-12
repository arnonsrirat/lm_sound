export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string | null;
  avatar: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

// In-memory development store to ensure auth works seamlessly even before Postgres connection is active
const devUsersStore = new Map<string, UserRecord>();

// Pre-seed a demo test user for development convenience
// Pre-seed a demo test user for development convenience
devUsersStore.set("demo@lmsound.com", {
  id: "user_demo_123",
  email: "demo@lmsound.com",
  username: "demouser",
  // Hashed for "password123"
  passwordHash: "$2a$10$f6f4B9/42oRkHQ9KvZ4u/eE7Z2r8pQk2LqK7KkQc0nN9uQpZ4d3eq",
  name: "LM Sound Explorer",
  avatar: null,
  role: "USER",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Pre-seed admin สำหรับทดสอบระบบหลังบ้าน (password: admin1234)
devUsersStore.set("admin@lmsound.com", {
  id: "user_admin_001",
  email: "admin@lmsound.com",
  username: "admin",
  passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  name: "LM Sound Admin",
  avatar: null,
  role: "ADMIN",
  createdAt: new Date(),
  updatedAt: new Date(),
});

async function getPrismaClient() {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      return prisma;
    } catch {
      return null;
    }
  }
  return null;
}

export const userService = {
  async findByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
    const cleanId = identifier.trim().toLowerCase();
    const prisma = await getPrismaClient();

    if (prisma) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: cleanId, mode: "insensitive" } },
              { username: { equals: cleanId, mode: "insensitive" } },
            ],
          },
        });
        if (user) {
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            passwordHash: user.password,
            name: user.username,
            avatar: null,
            role: user.role === "ADMIN" ? "ADMIN" : "USER",
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        }
      } catch {
        // Fallback to dev store if prisma query fails
      }
    }

    // Search in-memory store
    for (const u of devUsersStore.values()) {
      if (
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId
      ) {
        return u;
      }
    }
    return null;
  },

  async findById(id: string): Promise<UserRecord | null> {
    const prisma = await getPrismaClient();
    if (prisma) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
        });
        if (user) {
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            passwordHash: user.password,
            name: user.username,
            avatar: null,
            role: user.role === "ADMIN" ? "ADMIN" : "USER",
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        }
      } catch {
        // Fallback to dev store
      }
    }

    for (const u of devUsersStore.values()) {
      if (u.id === id) {
        return u;
      }
    }
    return null;
  },

  async createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    name?: string | null;
  }): Promise<UserRecord> {
    const prisma = await getPrismaClient();
    if (prisma) {
      try {
        const user = await prisma.user.create({
          data: {
            email: data.email.toLowerCase().trim(),
            username: data.username.toLowerCase().trim(),
            password: data.passwordHash,
          },
        });
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          passwordHash: user.password,
          name: data.name || user.username,
          avatar: null,
          role: user.role === "ADMIN" ? "ADMIN" : "USER",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      } catch {
        // Fallback to dev store
      }
    }

    const newUser: UserRecord = {
      id: "usr_" + Math.random().toString(36).substring(2, 12),
      email: data.email.toLowerCase().trim(),
      username: data.username.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      name: data.name || null,
      avatar: null,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devUsersStore.set(newUser.email, newUser);
    return newUser;
  },

  async listUsers(): Promise<Omit<UserRecord, "passwordHash">[]> {
    const prisma = await getPrismaClient();
    if (prisma) {
      try {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return users.map((u) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          name: u.username,
          avatar: null,
          role: u.role === "ADMIN" ? "ADMIN" : "USER",
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        }));
      } catch {
        // Fallback to dev store
      }
    }

    return Array.from(devUsersStore.values()).map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  },
};
