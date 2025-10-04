// filename: scripts/dev-tunnel.mjs
import { spawn } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';

const PORT = 3000;
const CACHE_FILE = '.tunnel-url.txt';

console.log(chalk.cyanBright.bold('\n💫 Initializing WDM Cloudflare Tunnel...\n'));

// Spawn the tunnel
const cloudflared = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${PORT}`]);

// Combine stdout + stderr for maximum reliability (Windows-safe)
const rl = readline.createInterface({
	input: cloudflared.stdout,
	crlfDelay: Infinity,
});
const rlErr = readline.createInterface({
	input: cloudflared.stderr,
	crlfDelay: Infinity,
});

// Function to handle lines (so both outputs share it)
const handleLine = (line) => {
	process.stdout.write(chalk.gray(line) + '\n');

	const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
	if (match) {
		const url = match[0];
		fs.writeFileSync(CACHE_FILE, url, 'utf8'); // ✅ Now guaranteed to write file

		const banner = [
			chalk.bgMagentaBright.black.bold(' ╔════════════════════════════════════════════════════╗ '),
			chalk.bgMagentaBright.black.bold(' ║ ') +
				chalk.bold.cyanBright('🌐  WDM DEVELOPMENT TUNNEL ACTIVE') +
				' '.repeat(16) +
				chalk.bgMagentaBright.black.bold('║'),
			chalk.bgMagentaBright.black.bold(' ╚════════════════════════════════════════════════════╝ '),
			chalk.gray('────────────────────────────────────────────────────────'),
			`${chalk.bold('🔗  Public URL:')}     ${chalk.hex('#00FF9F').underline(url)}`,
			`${chalk.bold('🧭  Callback:')}       ${chalk.hex('#FF9AFF')(`${url}/paywall/success`)}`,
			`${chalk.bold('⚙️  Sync .env:')}       ${chalk.hex('#80D0FF')('npm run changeenv')}`,
			chalk.gray('────────────────────────────────────────────────────────'),
			chalk.dim('💡 Keep this terminal open to maintain the tunnel.\n'),
		].join('\n');

		console.log(banner);
	}
};

rl.on('line', handleLine);
rlErr.on('line', handleLine);

cloudflared.on('close', (code) =>
	console.log(chalk.bgRed.black.bold(`\n💀 Tunnel closed (code ${code})\n`))
);
