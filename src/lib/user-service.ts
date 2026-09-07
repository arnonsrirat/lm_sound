export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory development store to ensure auth works seamlessly even before Postgres connection is active
const devUsersStore = new Map<string, UserRecord>();

// Pre-seed a demo test user for development convenience
devUsersStore.set("demo@lmsound.com", {
  id: "user_demo_123",
  email: "demo@lmsound.com",
  username: "demouser",
  // Hashed for "password123"
  passwordHash: "$2a$10$f6f4B9/42oRkHQ9KvZ4u/eE7Z2r8pQk2LqK7KkQc0nN9uQpZ4d3eq",
  name: "LM Sound Explorer",
  avatar: null,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devUsersStore.set(newUser.email, newUser);
    return newUser;
  },
};
