// PostToolUse hook: run Prettier on the file Claude just edited or wrote.
// Reads the hook payload from stdin; never blocks Claude (always exits 0).

const { execFileSync } = require('node:child_process');
const path = require('node:path');

// JavaScript only: running Prettier on the existing Markdown/JSON would reflow whole files.
const FORMATTABLE = new Set(['.js']);

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const filePath = JSON.parse(input).tool_input?.file_path;
    if (!filePath || !FORMATTABLE.has(path.extname(filePath))) return;

    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const prettier = path.join(projectDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
    execFileSync(process.execPath, [prettier, '--write', '--ignore-unknown', filePath], {
      cwd: projectDir,
      stdio: 'ignore',
    });
  } catch {
    // Formatting is best-effort: a missing Prettier or a syntax error shouldn't fail the edit.
  }
});
