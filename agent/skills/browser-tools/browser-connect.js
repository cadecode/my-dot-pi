#!/usr/bin/env node

/**
 * browser-connect.js — Shared CDP connection helper
 *
 * Uses fetch + /json/version to get the WebSocket endpoint, then connects
 * via browserWSEndpoint (which is more reliable than browserURL on newer Edge).
 */

import puppeteer from "puppeteer-core";

const CDP_PORT = 9222;
const CDP_HOST = "127.0.0.1";

/**
 * Connect to a running browser via CDP.
 * @param {number} [timeoutMs=15000] - Connection timeout in ms
 * @returns {Promise<import('puppeteer-core').Browser>}
 */
export async function connectBrowser(timeoutMs = 15000) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const resp = await fetch(
			`http://${CDP_HOST}:${CDP_PORT}/json/version`,
			{ signal: controller.signal },
		);
		const info = await resp.json();
		if (!info?.webSocketDebuggerUrl) {
			throw new Error(`CDP endpoint missing webSocketDebuggerUrl (response: ${JSON.stringify(info)})`);
		}
		const browser = await puppeteer.connect({
			browserWSEndpoint: info.webSocketDebuggerUrl,
			defaultViewport: null,
			protocolTimeout: timeoutMs,
		});
		return browser;
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Try to connect; returns null if not available (no throw).
 */
export async function tryConnect(timeoutMs = 3000) {
	try {
		return await connectBrowser(timeoutMs);
	} catch {
		return null;
	}
}

export { CDP_PORT, CDP_HOST };
