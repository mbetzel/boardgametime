import bcrypt from 'bcryptjs';
import { prisma } from '../src/index';

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const alicePasswordHash = await bcrypt.hash('alice', 10);
  const bobPasswordHash = await bcrypt.hash('bob', 10);
  const charliePasswordHash = await bcrypt.hash('charlie', 10);

  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: { email: 'alice@example.com', passwordHash: alicePasswordHash },
    create: {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: alicePasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alice',
    },
  });

  await prisma.user.upsert({
    where: { username: 'alice_bgt' },
    update: { email: 'alice@boardgametime.com', passwordHash },
    create: {
      username: 'alice_bgt',
      email: 'alice@boardgametime.com',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: { email: 'bob@example.com', passwordHash: bobPasswordHash },
    create: {
      username: 'bob',
      email: 'bob@example.com',
      passwordHash: bobPasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bob',
    },
  });

  await prisma.user.upsert({
    where: { username: 'bob_bgt' },
    update: { email: 'bob@boardgametime.com', passwordHash },
    create: {
      username: 'bob_bgt',
      email: 'bob@boardgametime.com',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bob',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { username: 'charlie' },
    update: { email: 'charlie@example.com', passwordHash: charliePasswordHash },
    create: {
      username: 'charlie',
      email: 'charlie@example.com',
      passwordHash: charliePasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=charlie',
    },
  });

  await prisma.user.upsert({
    where: { username: 'charlie_bgt' },
    update: { email: 'charlie@boardgametime.com', passwordHash },
    create: {
      username: 'charlie_bgt',
      email: 'charlie@boardgametime.com',
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
