#!/usr/bin/env node

import { tmpdir } from "node:os";
import { join } from "node:path";
import { connectBrowser } from "./browser-connect.js";

const b = await connectBrowser().catch((e) => {
	console.error("✗ Could not connect to browser on :9222:", e.message);
	console.error("  Run: browser-start.js");
	process.exit(1);
});

const p = (await b.pages()).at(-1);

if (!p) {
	console.error("✗ No active tab found");
	process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `screenshot-${timestamp}.png`;
const filepath = join(tmpdir(), filename);

await p.screenshot({ path: filepath });

console.log(filepath);

await b.disconnect();
