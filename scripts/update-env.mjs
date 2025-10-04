// filename: scripts/update-env.mjs
import fs from 'fs';
import chalk from 'chalk';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_PATH = path.resolve(__dirname, '../.env.local');
const CACHE_FILE = path.resolve(__dirname, '../.tunnel-url.txt');

// 🧩 1. Ensure tunnel has been started and cached
if (!fs.existsSync(CACHE_FILE)) {
	console.error(chalk.redBright('❌ No tunnel cache found — run `npm run dev` first.'));
	process.exit(1);
}

const url = fs.readFileSync(CACHE_FILE, 'utf8').trim();

// 🧩 2. Ensure .env.local exists
if (!fs.existsSync(ENV_PATH)) {
	console.warn(chalk.yellow(`⚠️  No ${ENV_PATH} found — creating one now.`));
	fs.writeFileSync(ENV_PATH, '', 'utf8');
}

let env = fs.readFileSync(ENV_PATH, 'utf8');

// 🧩 3. Update or append variables
const update = (key, value) => {
	const regex = new RegExp(`${key}=.*`, 'g');
	if (env.match(regex)) env = env.replace(regex, `${key}=${value}`);
	else env += `\n${key}=${value}`;
};

update('PAYSTACK_CALLBACK_URL', `${url}/paywall/success`);
update('NEXTAUTH_URL', url);
update('NEXT_PUBLIC_BASE_URL', url);

fs.writeFileSync(ENV_PATH, env, 'utf8');

// 🧩 4. Print sexy success banner
const banner = [
	chalk.bgGreenBright.black.bold(' ╔════════════════════════════════════════════════════╗ '),
	chalk.bgGreenBright.black.bold(' ║ ') +
		chalk.black.bold('✅  ENVIRONMENT UPDATED SUCCESSFULLY') +
		' '.repeat(15) +
		chalk.bgGreenBright.black.bold('║'),
	chalk.bgGreenBright.black.bold(' ╚════════════════════════════════════════════════════╝ '),
	chalk.gray('────────────────────────────────────────────────────────'),
	`${chalk.bold('🌍  Base URL:')}     ${chalk.hex('#00FF9F').underline(url)}`,
	`${chalk.bold('🧭  Callback:')}     ${chalk.hex('#FF9AFF')(`${url}/paywall/success`)}`,
	chalk.gray('────────────────────────────────────────────────────────'),
	chalk.dim('⚡ Environment synced for live tunnel use.\n'),
].join('\n');

console.log(banner);
