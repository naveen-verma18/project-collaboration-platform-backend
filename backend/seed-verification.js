import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userEmail = 'test1234@example.com';
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
        console.error(`User ${userEmail} not found. Please register first.`);
        return;
    }

    const project = await prisma.project.create({
        data: {
            name: 'Verification Project',
            description: 'Project for verifying the rich text editor',
            ownerId: user.id,
            members: {
                create: {
                    userId: user.id,
                    role: 'OWNER',
                },
            },
        },
    });

    const document = await prisma.document.create({
        data: {
            title: 'Editor Verification Doc',
            content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Start typing..."}]}]}',
            type: 'REQUIREMENTS',
            projectId: project.id,
        },
    });

    console.log('Seed successful:');
    console.log(`Project ID: ${project.id}`);
    console.log(`Document ID: ${document.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
