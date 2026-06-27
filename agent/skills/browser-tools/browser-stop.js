#!/usr/bin/env node

/**
 * browser-stop.js — Gracefully close agent-opened tabs without killing Edge.
 *
 * Never kills the Edge process — only closes tabs via CDP, so the user's own
 * Edge windows are never affected.
 *
 * Usage:
 *   browser-stop.js                    # Close all agent tabs except the last one
 *   browser-stop.js --all              # Close ALL tabs (browser exits when last tab closes)
 *   browser-stop.js --match baidu      # Close tabs whose URL contains "baidu"
 *   browser-stop.js --match example    # Close tabs matching a URL pattern
 *   browser-stop.js --help             # Show help
 */

import { connectBrowser } from "./browser-connect.js";

const args = process.argv.slice(2);
const closeAll = args.includes("--all");
const matchIdx = args.indexOf("--match");
const matchPattern = matchIdx >= 0 ? args[matchIdx + 1] : null;

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage: browser-stop.js [options]

Close agent-opened tabs without killing the browser process.

Options:
  --all           Close ALL tabs (browser auto-exits when last tab closes)
  --match <text>  Close only tabs whose URL contains the given text
  --help          Show this help

Note: This never kills the browser process, so your own Edge windows are safe.`);
	process.exit(0);
}

// Connect to browser
let browser;
try {
	browser = await connectBrowser(30000);
} catch {
	console.error("✗ No browser found on :9222. Is Edge running with --remote-debugging-port=9222?");
	console.error("  Run: browser-start.js");
	process.exit(1);
}

// Get all pages (tabs)
const pages = await browser.pages();

if (pages.length === 0) {
	console.log("No tabs to close.");
	await browser.disconnect();
	process.exit(0);
}

// ---- --match mode: close tabs matching a URL pattern ----
if (matchPattern) {
	let closed = 0;
	const lowerPattern = matchPattern.toLowerCase();

	for (const page of pages) {
		try {
			const url = (await page.url()).toLowerCase();
			if (url.includes(lowerPattern)) {
				await page.close();
				closed++;
			}
		} catch {
			/* ignore tabs that can't be read */
		}
	}

	if (closed === 0) {
		console.log(`No tabs matching "${matchPattern}" found.`);
	} else {
		console.log(`✓ Closed ${closed} tab(s) matching "${matchPattern}".`);
	}

	const remaining = (await browser.pages()).length;
	if (remaining > 0) {
		console.log(`Remaining tabs: ${remaining}`);
	}

	await browser.disconnect();
	process.exit(0);
}

// ---- --all mode: close every tab ----
if (closeAll) {
	for (const page of pages) {
		try {
			await page.close();
		} catch {
			/* ignore already-closed tabs */
		}
	}
	console.log(`✓ Closed all ${pages.length} tab(s).`);
	await browser.disconnect();
	process.exit(0);
}

// ---- Default: keep the last tab alive ----
const toClose = pages.slice(0, -1);
const kept = pages.length - toClose.length;

for (const page of toClose) {
	try {
		await page.close();
	} catch {
		/* ignore */
	}
}

if (toClose.length === 0) {
	console.log("Only 1 tab open — kept it open to prevent browser exit.");
} else {
	console.log(`✓ Closed ${toClose.length} tab(s), kept ${kept} tab(s) open.`);
}

await browser.disconnect();
