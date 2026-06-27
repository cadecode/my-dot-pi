#!/usr/bin/env node

/**
 * browser-start.js — Launch Edge (or Chrome) for CDP automation
 *
 * Windows Edge–native: auto-detects Edge path, copies profile with lock-aware
 * exclusion, and reuses an already-running instance by opening a new tab.
 *
 * Usage:
 *   browser-start.js                        # Fresh ephemeral profile
 *   browser-start.js --profile              # Copy user's Edge profile
 *   browser-start.js https://example.com    # Open URL directly
 */

import { spawn, execSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	statSync,
	copyFileSync,
	writeFileSync,
	readFileSync,
	unlinkSync,
} from "node:fs";
import { join, basename, sep } from "node:path";
import { env, exit, argv } from "node:process";
import { tryConnect, CDP_PORT } from "./browser-connect.js";

// ---- Constants ----
const SENTINEL_FILE = ".initialized";
const PROFILE_DIR = join(env.USERPROFILE || env.HOME, ".cache", "browser-tools");

// EDGE_SOURCE is checked only when --profile is used; error there if LOCALAPPDATA is missing
function getEdgeSource() {
	if (!env.LOCALAPPDATA) {
		console.error("✗ LOCALAPPDATA environment variable is not set. Cannot locate Edge profile.");
		console.error("  Expected: C:\\Users\\<user>\\AppData\\Local");
		exit(1);
	}
	return join(env.LOCALAPPDATA, "Microsoft", "Edge", "User Data");
}

// Directories / files to skip during profile copy (locked at runtime or not needed)
const EXCLUDE_NAMES = new Set([
	"Cache",
	"Code Cache",
	"GPUCache",
	"Service Worker",
	"File System",
	"blob_storage",
	"Session Storage",
	"data_reduction_proxy_leveldb",
	"Reporting and NEL",
	"VideoDecodeStats",
	"shared_proto_db",
	"download_service",
	"Crashpad",
	"CrashpadMetrics-active.pma",
	"BrowserMetrics",
	"BrowserMetrics-spare.pma",
	"cdm_data",
	"GrShaderCache",
	"GraphiteDawnCache",
	"ShaderCache",
	"Subresource Filter",
	"Safe Browsing",
	"Client Side Phishing",
	"Origin Trials",
	"PepperData",
	"WidevineCdm",
	// Current session files (locked by running Edge)
	"Sessions",
	"Current Session",
	"Current Tabs",
	"Last Session",
	"Last Tabs",
	"SingletonLock",
	"SingletonSocket",
	"SingletonCookie",
]);

// Top-level-only directories to skip entirely (e.g. component updater dirs)
const EXCLUDE_TOP_LEVEL = new Set([
	"Edge Updater",
	"Edge",
	"Install",
	"InstallSSL",
	"ComponentUpdate",
	"Crowd Deny",
	"CertificateRevocation",
	"EADPData",
	"Edge Cloud Config",
	"Edge Data Protection Lists",
	"Edge Entity Extraction",
	"Edge Notifications",
	"Edge Shopping",
	"Edge Sidebar",
	"AutoLaunchProtocolsComponent",
	"AmountExtractionHeuristicRegexes",
	"CookieReadinessList",
	"Ad Blocking",
	"OptimizationHints",
	"OnDeviceHeadSuggestModel",
	"TrustTokenKeyCommitments",
	"CommerceHeuristics",
	"AutofillRegexes",
	"ZxcvbnData",
	"SSLErrorAssistant",
	"SafetyTips",
	"Floc",
	"Subresource Filter",
	"First Run",
]);

// ---- CLI ----
const args = argv.slice(2);
const useProfile = args.includes("--profile");
const urlArg = args.find((a) => !a.startsWith("--"));

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage: browser-start.js [options] [url]

Options:
  --profile   Copy your Edge profile (cookies, logins, bookmarks)
  --help      Show this help

Examples:
  browser-start.js                            # Fresh profile
  browser-start.js --profile                  # With your Edge profile
  browser-start.js https://example.com        # Open URL directly
  browser-start.js --profile https://example.com

Environment:
  EDGE_PATH   Override Edge/Chrome executable path`);
	exit(0);
}

// ---- Edge executable detection ----
function findEdge() {
	if (env.EDGE_PATH && existsSync(env.EDGE_PATH)) return env.EDGE_PATH;

	// PATH lookup: msedge.exe or chrome.exe
	try {
		const out = execSync(
			"where msedge.exe 2>nul || where chrome.exe 2>nul",
			{ encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] },
		);
		const p = out.trim().split("\n")[0];
		if (p && existsSync(p)) return p;
	} catch {
		/* not in PATH */
	}

	const candidates = [
		// Edge
		join(
			env["ProgramFiles(x86)"] || "C:\\Program Files (x86)",
			"Microsoft",
			"Edge",
			"Application",
			"msedge.exe",
		),
		join(
			env.ProgramFiles || "C:\\Program Files",
			"Microsoft",
			"Edge",
			"Application",
			"msedge.exe",
		),
		join(
			env.LOCALAPPDATA || "",
			"Microsoft",
			"Edge",
			"Application",
			"msedge.exe",
		),
		// Chrome fallback
		join(
			env["ProgramFiles(x86)"] || "C:\\Program Files (x86)",
			"Google",
			"Chrome",
			"Application",
			"chrome.exe",
		),
		join(
			env.ProgramFiles || "C:\\Program Files",
			"Google",
			"Chrome",
			"Application",
			"chrome.exe",
		),
		join(
			env.LOCALAPPDATA || "",
			"Google",
			"Chrome",
			"Application",
			"chrome.exe",
		),
	];

	return candidates.find(existsSync) || null;
}

// ---- Profile copy (Windows-safe) ----
function shouldExclude(relativePath, isDir) {
	const segments = relativePath.split(sep).filter(Boolean);

	// Top-level exclusions
	if (segments.length === 1 && EXCLUDE_TOP_LEVEL.has(segments[0])) return true;

	// Any segment matches a known name
	for (const seg of segments) {
		if (EXCLUDE_NAMES.has(seg)) return true;
	}

	// Skip all .log files and .tmp files
	if (segments.length > 0) {
		const last = segments[segments.length - 1];
		if (last.endsWith(".log") || last.endsWith(".tmp")) return true;
	}

	return false;
}

function copyProfile(src, dst) {
	if (!existsSync(src)) {
		console.log("  ⚠  Source profile not found:", src);
		return false;
	}

	console.log("  Copying profile (this may take a moment)...");

	const srcStat = statSync(src);
	mkdirSync(dst, { recursive: true });

	// Collect all entries first (to show stats)
	const queue = [{ src, dst, rel: "" }];
	let copied = 0;
	let skipped = 0;
	let errors = 0;

	while (queue.length > 0) {
		const { src: s, dst: d, rel } = queue.shift();
		let entries;
		try {
			entries = readdirSync(s);
		} catch {
			// Can't read directory (e.g. permission issue)
			skipped++;
			continue;
		}

		for (const name of entries) {
			const childRel = rel ? `${rel}${sep}${name}` : name;
			const childSrc = join(s, name);
			const childDst = join(d, name);

			let st;
			try {
				st = statSync(childSrc);
			} catch {
				// Can't stat (locked / permission)
				skipped++;
				continue;
			}

			if (st.isDirectory()) {
				if (shouldExclude(childRel, true)) {
					skipped++;
					continue;
				}
				mkdirSync(childDst, { recursive: true });
				queue.push({ src: childSrc, dst: childDst, rel: childRel });
			} else {
				if (shouldExclude(childRel, false)) {
					skipped++;
					continue;
				}
				try {
					copyFileSync(childSrc, childDst);
					copied++;
				} catch {
					// Locked file at runtime (EPERM/EBUSY)
					errors++;
				}
			}
		}
	}

	const total = copied + skipped + errors;
	console.log(`    Copied: ${copied}, Skipped: ${skipped}, Errors: ${errors} (total: ${total} items)`);

	// Write sentinel
	writeFileSync(join(dst, SENTINEL_FILE), new Date().toISOString(), "utf8");
	console.log("  ✓ Profile initialized (sentinel created)");
	return true;
}

// ---- Main ----
const edgePath = findEdge();
if (!edgePath) {
	console.error("✗ Could not find Edge (or Chrome). Install Edge or set EDGE_PATH.");
	exit(1);
}

const browserName = basename(edgePath, ".exe").replace("msedge", "Edge").replace("chrome", "Chrome");

// ---- Step 1: Check if already running on CDP port ----
const existing = await tryConnect(5000);
if (existing) {
	if (urlArg) {
		const page = await existing.newPage();
		await page.goto(urlArg, { waitUntil: "domcontentloaded" });
		console.log(`✓ ${browserName} already running on :${CDP_PORT}, opened new tab → ${urlArg}`);
	} else {
		await existing.newPage();
		console.log(`✓ ${browserName} already running on :${CDP_PORT}, opened new tab`);
	}
	await existing.disconnect();
	exit(0);
}

// ---- Step 2: Prepare profile directory ----
try {
	if (!existsSync(PROFILE_DIR)) {
		mkdirSync(PROFILE_DIR, { recursive: true });
	}
} catch {
	console.error(`✗ Cannot create profile directory: ${PROFILE_DIR}`);
	exit(1);
}

// Clean lock files from previous run
for (const lock of ["SingletonLock", "SingletonSocket", "SingletonCookie"]) {
	try {
		unlinkSync(join(PROFILE_DIR, lock));
	} catch {
		/* ok if not found */
	}
}

// ---- Step 3: Copy profile if requested (first time) ----
const sentinelPath = join(PROFILE_DIR, SENTINEL_FILE);
const needsInit = useProfile && !existsSync(sentinelPath);

if (needsInit) {
	console.log("First launch with --profile — copying your Edge data...");
	console.log("  ⚠  This includes cookies, logins, and other saved credentials.");
	console.log("     Data is stored locally at:", PROFILE_DIR);
	copyProfile(getEdgeSource(), PROFILE_DIR);
} else if (existsSync(sentinelPath)) {
	if (useProfile) {
		console.log("  Profile already initialized (sentinel found), skipping copy.");
	} else {
		console.log("  Reusing cached profile (use --profile to refresh).");
	}
} else {
	console.log("  Using fresh ephemeral profile (no cookies/logins).");
}

// ---- Step 4: Launch Edge ----
console.log(`Starting ${browserName} on :${CDP_PORT}...`);

const edgeArgs = [
	`--remote-debugging-port=${CDP_PORT}`,
	`--user-data-dir=${PROFILE_DIR}`,
	"--no-first-run",
	"--no-default-browser-check",
	"--new-window",
];

if (urlArg) {
	edgeArgs.push(urlArg);
}

const proc = spawn(edgePath, edgeArgs, {
	detached: true,
	stdio: "ignore",
	// On Windows, detached doesn't create a new console window
	windowsHide: true,
});

proc.unref();

// ---- Step 5: Wait for CDP to be ready ----
let connected = false;
for (let i = 0; i < 30; i++) {
	const b = await tryConnect(2000);
	if (b) {
		await b.disconnect();
		connected = true;
		break;
	}
	await new Promise((r) => setTimeout(r, 500));
}

if (!connected) {
	console.error(`✗ Failed to connect to ${browserName} on :${CDP_PORT}`);
	exit(1);
}

console.log(`✓ ${browserName} started on :${CDP_PORT}${useProfile ? " with your profile" : ""}`);
