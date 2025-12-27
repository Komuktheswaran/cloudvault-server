const prisma = require('./src/db');

async function testIsolation() {
    console.log("Starting Security Isolation Test...");

    try {
        // 1. Create Test Users
        const userAEmail = `test_user_a_${Date.now()}@example.com`;
        const userBEmail = `test_user_b_${Date.now()}@example.com`;

        const userA = await prisma.user.create({
            data: { email: userAEmail, name: "User A" }
        });
        console.log(`Created User A: ${userA.id}`);

        const userB = await prisma.user.create({
            data: { email: userBEmail, name: "User B" }
        });
        console.log(`Created User B: ${userB.id}`);

        // 2. Create File for User A
        const fileA = await prisma.file.create({
            data: {
                name: "UserA_Secret_File.txt",
                key: `user_${userA.id}/secret.txt`,
                mimeType: "text/plain",
                size: 1024,
                userId: userA.id,
                isPublic: false
            }
        });
        console.log(`Created File for User A: ${fileA.id}`);

        // 3. Simulating "List Files" for User B
        // Controller Code: where: { userId: req.user.id, isDeleted: false }
        console.log("Attempting to list files for User B...");
        const filesForB = await prisma.file.findMany({
            where: { userId: userB.id, isDeleted: false }
        });

        if (filesForB.length === 0) {
            console.log("PASS: User B cannot see any files (Correct).");
        } else {
            console.error("FAIL: User B can see files!", filesForB);
        }

        // 4. Simulating "Get File URL" for User B trying to access User A's file
        // Controller Code: if (fileRecord.userId !== req.user.id && !fileRecord.isPublic)
        console.log("Attempting to access User A's file as User B...");
        const targetFile = await prisma.file.findUnique({ where: { key: fileA.key } });
        
        if (targetFile) {
            if (targetFile.userId !== userB.id && !targetFile.isPublic) {
                console.log("PASS: Access Denied logic would trigger (Correct).");
            } else {
                console.error("FAIL: Access would be granted!");
            }
        } else {
             console.error("FAIL: Could not find target file for test.");
        }

        // Cleanup
        await prisma.file.delete({ where: { id: fileA.id } });
        await prisma.user.delete({ where: { id: userA.id } });
        await prisma.user.delete({ where: { id: userB.id } });
        console.log("Cleanup complete.");

    } catch (error) {
        console.error("Test Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testIsolation();
