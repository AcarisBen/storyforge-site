// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.upsert({
    where: { email: 'teste@storyforge.local' },
    update: {},
    create: {
      name: 'Autor Fictício',
      email: 'teste@storyforge.local',
      password: hashedPassword,
    },
  });

  console.log('Usuário fictício criado com sucesso:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });