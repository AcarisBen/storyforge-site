const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:71555110Ac@localhost:5432/storyforge?schema=public",
    },
  },
});

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Conexão via Prisma estabelecida com sucesso!");
  } catch (error) {
    console.error("❌ Erro de conexão no Prisma:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();