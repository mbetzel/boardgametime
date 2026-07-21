import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: { passwordHash },
    create: {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: { passwordHash },
    create: {
      username: 'bob',
      email: 'bob@example.com',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bob',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { username: 'charlie' },
    update: { passwordHash },
    create: {
      username: 'charlie',
      email: 'charlie@example.com',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=charlie',
    },
  });

  const sampleLobbyCode = 'KING01';
  const existingLobby = await prisma.lobby.findUnique({
    where: { code: sampleLobbyCode },
  });

  if (!existingLobby) {
    await prisma.lobby.create({
      data: {
        code: sampleLobbyCode,
        gameId: 'kingdoms',
        hostId: alice.id,
        maxPlayers: 4,
        minPlayers: 2,
        mode: 'REALTIME',
        visibility: 'PUBLIC',
        status: 'WAITING',
        players: {
          create: [
            {
              userId: alice.id,
              isReady: true,
            },
            {
              userId: bob.id,
              isReady: false,
            },
          ],
        },
      },
    });
  }

  console.log(`Seed completed. Created/updated test users (alice, bob, charlie) and Kingdoms lobby ${sampleLobbyCode}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
