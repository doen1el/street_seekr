/**
 * Persistent stats / leaderboard via the embedded SQLite.
 *
 * @typedef {import('./protocol.js').Profile} Profile
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/** @type {DatabaseSync | null} */
let db = null;

function getDb() {
	if (db) return db;
	const path = process.env.STREETSEEKR_DB || './data/streetseekr.db';
	try {
		mkdirSync(dirname(path), { recursive: true });
		db = new DatabaseSync(path);
		db.exec('PRAGMA journal_mode = WAL;');
		db.exec(`
			CREATE TABLE IF NOT EXISTS players (
				client_id     TEXT PRIMARY KEY,
				name          TEXT NOT NULL,
				avatar        TEXT NOT NULL,
				games_played  INTEGER NOT NULL DEFAULT 0,
				games_won     INTEGER NOT NULL DEFAULT 0,
				total_score   INTEGER NOT NULL DEFAULT 0,
				best_score    INTEGER NOT NULL DEFAULT 0,
				last_seen     INTEGER NOT NULL
			);
		`);
		console.log(`[db] sqlite ready at ${path}`);
		return db;
	} catch (e) {
		console.error('[db] failed to open:', e instanceof Error ? e.message : e);
		return null;
	}
}

/**
 * Records one finished game for one player (upsert/accumulate).
 * @param {Profile} player
 * @param {{ won: boolean, score: number }} result
 */
export function recordGameResult(player, result) {
	if (!player.clientId) return;
	const conn = getDb();
	if (!conn) return;
	try {
		conn
			.prepare(
				`INSERT INTO players
					(client_id, name, avatar, games_played, games_won, total_score, best_score, last_seen)
				 VALUES (?, ?, ?, 1, ?, ?, ?, ?)
				 ON CONFLICT(client_id) DO UPDATE SET
					name         = excluded.name,
					avatar       = excluded.avatar,
					games_played = games_played + 1,
					games_won    = games_won + excluded.games_won,
					total_score  = total_score + excluded.total_score,
					best_score   = MAX(best_score, excluded.best_score),
					last_seen    = excluded.last_seen`
			)
			.run(
				player.clientId,
				player.name,
				player.avatar,
				result.won ? 1 : 0,
				result.score,
				result.score,
				Date.now()
			);
	} catch (e) {
		console.error('[db] recordGameResult failed:', e instanceof Error ? e.message : e);
	}
}

/**
 * Refreshes an existing player's display name/avatar (so the leaderboard
 * reflects their current profile). No-op if they have no record yet.
 * @param {Profile} player
 */
export function touchPlayer(player) {
	if (!player.clientId) return;
	const conn = getDb();
	if (!conn) return;
	try {
		conn
			.prepare(`UPDATE players SET name = ?, avatar = ?, last_seen = ? WHERE client_id = ?`)
			.run(player.name, player.avatar, Date.now(), player.clientId);
	} catch (e) {
		console.error('[db] touchPlayer failed:', e instanceof Error ? e.message : e);
	}
}

/**
 * Top players. Never exposes clientId.
 * @param {number} [limit]
 * @returns {Array<{ name: string, avatar: string, gamesWon: number, gamesPlayed: number, totalScore: number, bestScore: number }>}
 */
export function getLeaderboard(limit = 10) {
	const conn = getDb();
	if (!conn) return [];
	try {
		const rows = conn
			.prepare(
				`SELECT name, avatar, games_won, games_played, total_score, best_score
				 FROM players
				 ORDER BY games_won DESC, total_score DESC
				 LIMIT ?`
			)
			.all(limit);
		return rows.map((r) => ({
			name: String(r.name),
			avatar: String(r.avatar),
			gamesWon: Number(r.games_won),
			gamesPlayed: Number(r.games_played),
			totalScore: Number(r.total_score),
			bestScore: Number(r.best_score)
		}));
	} catch (e) {
		console.error('[db] getLeaderboard failed:', e instanceof Error ? e.message : e);
		return [];
	}
}

/**
 * One player's own stats.
 * @param {string} clientId
 * @returns {{ gamesPlayed: number, gamesWon: number, totalScore: number, bestScore: number } | null}
 */
export function getPlayerStats(clientId) {
	if (!clientId) return null;
	const conn = getDb();
	if (!conn) return null;
	try {
		const r = conn
			.prepare(
				`SELECT games_played, games_won, total_score, best_score FROM players WHERE client_id = ?`
			)
			.get(clientId);
		if (!r) return null;
		return {
			gamesPlayed: Number(r.games_played),
			gamesWon: Number(r.games_won),
			totalScore: Number(r.total_score),
			bestScore: Number(r.best_score)
		};
	} catch (e) {
		console.error('[db] getPlayerStats failed:', e instanceof Error ? e.message : e);
		return null;
	}
}
