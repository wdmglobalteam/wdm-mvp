const { exec } = require('child_process');

// Run npm ls to find unmet dependencies
exec('npm ls --all --json', (err, stdout, stderr) => {
	if (err && !stdout) {
		console.error('Error running npm ls:', err);
		return;
	}

	let tree;
	try {
		tree = JSON.parse(stdout);
	} catch (e) {
		console.error('Failed to parse npm ls JSON:', e);
		return;
	}

	const missing = [];

	function checkDeps(node) {
		if (node.dependencies) {
			for (const [name, dep] of Object.entries(node.dependencies)) {
				if (dep.missing) missing.push(name);
				checkDeps(dep);
			}
		}
	}

	checkDeps(tree);

	if (missing.length === 0) {
		console.log('✅ No missing dependencies detected!');
	} else {
		console.log('⚠️ Missing dependencies detected:');
		missing.forEach((dep) => console.log(dep));
		console.log('\nYou can install them all with:');
		console.log(`npm install ${missing.join(' ')}`);
	}
});
