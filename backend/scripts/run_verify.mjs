import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
    const out = execSync('node scripts/verification.js', {
        encoding: 'utf8',
        timeout: 15000,
        cwd: 'f:/project-collaboration-platform/backend'
    });
    writeFileSync('f:/project-collaboration-platform/backend/scripts/result.txt', out, 'utf8');
} catch (e) {
    writeFileSync('f:/project-collaboration-platform/backend/scripts/result.txt', e.stdout + '\n---STDERR---\n' + e.stderr, 'utf8');
}
