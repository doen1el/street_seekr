import { k as fail, r as redirect, h as error } from './app-CVlUDIrM.js';
import './utils-CnqwCm3b.js';
import './client-Wqcy-_Io.js';
import { s as superValidate, z as zod, g as getOrCreatePlayer, n as name_needs_at_least_1_character } from './helper-Ct97EdLs.js';
import { z } from 'zod';
import * as turf from '@turf/turf';
import { d as private_env } from './shared-server-T6x2t2MG.js';
import './runtime-Da7SMkyw.js';
import './index-DOTLEX8b.js';

function hasPanoramaxNavigationLinks(item) {
  const links = Array.isArray(item?.links) ? item.links : [];
  return links.some((link) => link?.rel === "next" || link?.rel === "prev");
}
function isStrict360Panorama(item) {
  const props = item?.properties || {};
  const candidates = [
    props["geovisio:projection_type"],
    props["projection_type"],
    props["img:projection"],
    props["camera:projection"],
    props["panoramax:projection_type"],
    props["pers:projection_type"],
    props["view:projection"]
  ].filter((value) => typeof value === "string").map((value) => String(value).toLowerCase());
  if (candidates.some(
    (value) => value.includes("equirectangular") || value.includes("spherical") || value.includes("360")
  )) {
    return true;
  }
  const dims = props["pers:interior_orientation"]?.sensor_array_dimensions;
  if (Array.isArray(dims) && dims.length === 2) {
    const [width, height] = dims;
    if (typeof width === "number" && typeof height === "number" && height > 0) {
      const ratio = width / height;
      if (ratio >= 1.9 && ratio <= 2.1) return true;
    }
  }
  const assets = item?.assets || {};
  for (const key of Object.keys(assets)) {
    const href = String(assets[key]?.href || "").toLowerCase();
    if (href.includes("equirect") || href.includes("sphere") || href.includes("360")) return true;
  }
  return false;
}
async function handleUpdatePolygon(request) {
  const formData = await request.formData();
  const locationString = formData.get("locationString") || "";
  const locationStrings = locationString.split(",").map((s) => s.trim()).filter((s) => s);
  if (locationStrings.length === 0) {
    return JSON.stringify(null);
  }
  try {
    const NOMINATIM_URL = (loc) => `https://nominatim.openstreetmap.org/search?q=${encodeURI(
      loc
    )}&polygon_geojson=1&limit=1&format=json`;
    const promises = locationStrings.map(
      (loc) => fetch(NOMINATIM_URL(loc), {
        headers: { "User-Agent": "StreetSeeker-Game/1.0" }
      }).then((res) => res.json())
    );
    const results = await Promise.all(promises);
    const allPolygonCoordinates = [];
    for (const result of results) {
      if (result && result.length > 0 && result[0].geojson) {
        const geojson = result[0].geojson;
        if (geojson.type === "Polygon") {
          allPolygonCoordinates.push(geojson.coordinates);
        } else if (geojson.type === "MultiPolygon") {
          allPolygonCoordinates.push(...geojson.coordinates);
        }
      }
    }
    let finalPolygon = null;
    if (allPolygonCoordinates.length > 0) {
      finalPolygon = turf.multiPolygon(allPolygonCoordinates);
    }
    return JSON.stringify(finalPolygon);
  } catch (err) {
    console.error("Error while accessing polygon:", err);
    return JSON.stringify(null);
  }
}
async function generateRandomPointsForChallenge(polygon, count, onProgress) {
  console.log("[generateRandomPoints] start", { count, hasPolygon: !!polygon });
  const PANORAMAX_API_URLS = (private_env.PANORAMAX_API_URLS || private_env.PANORAMAX_API_URL || "https://panoramax.ign.fr/api").split(",").map((url) => url.trim().replace(/\/$/, "")).filter(Boolean);
  const PANORAMAX_VIEWER_URLS = (private_env.PUBLIC_PANORAMAX_VIEWER_URLS || private_env.PUBLIC_PANORAMAX_VIEWER_URL || "").split(",").map((url) => url.trim().replace(/\/$/, "")).filter(Boolean);
  const PANORAMAX_API_TOKEN = private_env.PANORAMAX_API_TOKEN;
  if (!PANORAMAX_API_URLS.length) {
    console.warn("No Panoramax API URLs configured, cannot fetch images.");
    return [];
  }
  const sources = PANORAMAX_API_URLS.map((apiBaseUrl, index) => {
    const explicitViewer = PANORAMAX_VIEWER_URLS[index];
    const inferredViewer = apiBaseUrl.endsWith("/api") ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
    return {
      apiBaseUrl,
      viewerBaseUrl: explicitViewer || inferredViewer
    };
  });
  const MAX_HALF_SIZE = 0.05;
  const [minLon, minLat, maxLon, maxLat] = polygon ? turf.bbox(polygon) : [-180, -85, 180, 85];
  const results = [];
  const usedIds = /* @__PURE__ */ new Set();
  function shuffledSources() {
    const copy = [...sources];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function randomPointInBBox() {
    return [Math.random() * (maxLon - minLon) + minLon, Math.random() * (maxLat - minLat) + minLat];
  }
  async function fetchRandomImageFromBBox(box, retries = 3) {
    const params = new URLSearchParams({
      bbox: box.join(","),
      limit: "100"
    });
    for (let attempt = 0; attempt <= retries; attempt++) {
      for (const source of shuffledSources()) {
        try {
          const url = `${source.apiBaseUrl}/search?${params.toString()}`;
          const headers = {
            Accept: "application/geo+json"
          };
          if (PANORAMAX_API_TOKEN) {
            headers.Authorization = `Bearer ${PANORAMAX_API_TOKEN}`;
          }
          const res = await fetch(url, { headers });
          if (!res.ok) {
            const errorText = await res.text();
            let errorJson = null;
            try {
              errorJson = JSON.parse(errorText);
            } catch {
            }
            const boxArea = (box[2] - box[0]) * (box[3] - box[1]);
            console.warn("[fetchRandomImageFromBBox] API error", {
              status: res.status,
              statusText: res.statusText,
              apiBaseUrl: source.apiBaseUrl,
              box,
              boxArea: boxArea.toFixed(6),
              attempt: attempt + 1,
              maxRetries: retries + 1,
              error: errorJson || errorText
            });
            if (res.status === 400) {
              continue;
            }
            if (res.status === 429) {
              if (attempt < retries) {
                await sleep(2e3 * (attempt + 1));
                continue;
              }
              continue;
            }
            if (attempt < retries) {
              await sleep(500 * (attempt + 1));
              continue;
            }
            continue;
          }
          const json = await res.json();
          let imgs = json?.features || [];
          imgs = imgs.filter((it) => {
            const coords = it?.geometry?.coordinates;
            return Array.isArray(coords) && coords.length === 2 && typeof coords[0] === "number" && typeof coords[1] === "number";
          });
          if (polygon) {
            imgs = imgs.filter(
              (it) => turf.booleanPointInPolygon(turf.point(it.geometry.coordinates), polygon)
            );
          }
          imgs = imgs.filter((it) => {
            const hasSequenceId = typeof it.collection === "string" && it.collection.length > 0;
            return hasPanoramaxNavigationLinks(it) && hasSequenceId;
          });
          imgs = imgs.filter((it) => isStrict360Panorama(it));
          imgs = imgs.filter((it) => !usedIds.has(it.id));
          if (!imgs.length) {
            continue;
          }
          const picked = imgs[Math.floor(Math.random() * imgs.length)];
          const [lon, lat] = picked.geometry.coordinates;
          usedIds.add(picked.id);
          return {
            id: picked.id,
            sequenceId: picked.collection,
            location: [lon, lat],
            viewerBaseUrl: source.viewerBaseUrl
          };
        } catch (err) {
          const isNetworkError = err instanceof Error && (err.message.includes("fetch failed") || err.message.includes("ECONNRESET"));
          console.error("[fetchRandomImageFromBBox] exception", {
            attempt: attempt + 1,
            maxRetries: retries + 1,
            isNetworkError,
            apiBaseUrl: source.apiBaseUrl,
            box,
            error: err instanceof Error ? {
              name: err.name,
              message: err.message,
              cause: err.cause
            } : err
          });
          if (attempt < retries && isNetworkError) {
            await sleep(500 * (attempt + 1));
            continue;
          }
        }
      }
    }
    return null;
  }
  async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  if (!polygon) {
    const DELAY_MS = 200;
    const maxAttempts = count * 100;
    let attempts = 0;
    const halfSizes = [0.01, 0.02, 0.03, 0.04, MAX_HALF_SIZE];
    while (results.length < count && attempts < maxAttempts) {
      attempts++;
      const [lon, lat] = randomPointInBBox();
      for (const half of halfSizes) {
        const box = [
          Math.max(-180, lon - half),
          Math.max(-85, lat - half),
          Math.min(180, lon + half),
          Math.min(85, lat + half)
        ];
        const hit = await fetchRandomImageFromBBox(box);
        if (hit) {
          results.push(hit);
          if (onProgress) await onProgress(results.length, count);
          console.log("[generateRandomPoints][global] hit", {
            collected: results.length,
            target: count,
            attempts,
            half
          });
          await sleep(DELAY_MS);
          break;
        }
      }
      if (attempts % 50 === 0 && results.length < count) {
        console.log("[generateRandomPoints][global] progress", {
          attempts,
          collected: results.length
        });
      }
    }
    console.log("[generateRandomPoints][global] finished", {
      requested: count,
      got: results.length,
      attempts
    });
  } else {
    const baseCandidateMultiplier = 6;
    const maxPasses = 5;
    const delayHit = 150;
    const delayMiss = 20;
    const halfSizeTiers = [
      [5e-3, 0.01, 0.015, 0.02],
      [0.025, 0.03, 0.035, 0.04],
      [0.045, MAX_HALF_SIZE]
    ];
    let pass = 0;
    while (results.length < count && pass < maxPasses) {
      const remaining = count - results.length;
      const candidateTarget = Math.min(
        2e3,
        Math.max(remaining * baseCandidateMultiplier, remaining * 2)
      );
      const candidates = [];
      let safetyCounter = 0;
      while (candidates.length < candidateTarget && safetyCounter < candidateTarget * 10) {
        safetyCounter++;
        const p = randomPointInBBox();
        if (!turf.booleanPointInPolygon(turf.point(p), polygon)) continue;
        candidates.push(p);
      }
      const centers = [];
      if (candidates.length) {
        centers.push(candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0]);
      }
      while (centers.length < remaining && candidates.length) {
        let bestIdx = -1;
        let bestDist = -1;
        for (let i = 0; i < candidates.length; i++) {
          const [lon, lat] = candidates[i];
          let minD = Infinity;
          for (const [clon, clat] of centers) {
            const d = calculateDistance(lat, lon, clat, clon);
            if (d < minD) minD = d;
          }
          if (minD > bestDist) {
            bestDist = minD;
            bestIdx = i;
          }
        }
        if (bestIdx === -1) break;
        centers.push(candidates.splice(bestIdx, 1)[0]);
      }
      console.log("[generateRandomPoints][poly][pass] start", {
        pass,
        remaining,
        centers: centers.length,
        candidatesGenerated: candidates.length + centers.length
      });
      const tierIdx = Math.min(pass, halfSizeTiers.length - 1);
      const flattened = halfSizeTiers[tierIdx];
      const batchSize = 3;
      for (let i = 0; i < centers.length; i += batchSize) {
        if (results.length >= count) break;
        const batch = centers.slice(i, Math.min(i + batchSize, centers.length));
        const batchPromises = batch.map(async ([lon, lat]) => {
          for (const half of flattened) {
            const box = [
              Math.max(minLon, lon - half),
              Math.max(minLat, lat - half),
              Math.min(maxLon, lon + half),
              Math.min(maxLat, lat + half)
            ];
            const hit = await fetchRandomImageFromBBox(box);
            if (hit) {
              await sleep(delayHit);
              return hit;
            } else {
              await sleep(delayMiss);
            }
          }
          return null;
        });
        const batchResults = await Promise.all(batchPromises);
        for (const hit of batchResults) {
          if (hit && results.length < count) {
            results.push(hit);
            if (onProgress) await onProgress(results.length, count);
            console.log("[generateRandomPoints][poly] hit", {
              pass,
              collected: results.length,
              target: count
            });
          }
        }
      }
      console.log("[generateRandomPoints][poly][pass] end", {
        pass,
        collected: results.length,
        target: count
      });
      pass++;
    }
    if (results.length < count) {
      console.warn("[generateRandomPoints][poly] insufficient coverage", {
        requested: count,
        got: results.length,
        passes: pass
      });
    }
  }
  console.log("[generateRandomPoints] final", {
    requested: count,
    returned: results.length,
    uniqueIds: usedIds.size
  });
  return results;
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  lat1 = Number(lat1);
  lon1 = Number(lon1);
  lat2 = Number(lat2);
  lon2 = Number(lon2);
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
const joinLobbySchema = z.object({
  username: z.string().min(1, name_needs_at_least_1_character()).max(30)
});
const load = async ({ locals, cookies, params }) => {
  const gameCode = params.id;
  let game;
  try {
    game = await locals.pb.collection("games").getFirstListItem(`code="${gameCode}"`, {
      expand: "players,admin,ready_players,messages.player"
    });
  } catch (err) {
    throw error(404, "Game not found");
  }
  if (game.admin && !game.ready_players?.includes(game.admin)) {
    const newReadyPlayers = [...game.ready_players || [], game.admin];
    game = await locals.pb.collection("games").update(
      game.id,
      { ready_players: newReadyPlayers },
      {
        expand: "players,admin,ready_players,messages.player"
      }
    );
  }
  const playerId = cookies.get("player_id");
  let currentPlayer = null;
  let isPlayerInGame = false;
  if (playerId) {
    try {
      currentPlayer = await locals.pb.collection("players").getOne(playerId);
      isPlayerInGame = game.players?.includes(playerId);
    } catch (_) {
      cookies.delete("player_id", { path: "/" });
    }
  }
  const form = await superValidate(zod(joinLobbySchema));
  const serverNow = Date.now();
  return { game, currentPlayer, isPlayerInGame, form, serverNow };
};
const actions = {
  join: async ({ request, locals, cookies, params }) => {
    const form = await superValidate(request, zod(joinLobbySchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    let game;
    try {
      game = await locals.pb.collection("games").getFirstListItem(`code="${params.id}"`);
    } catch (err) {
      return fail(404, { form, message: "Game does not exist anymore" });
    }
    const player = await getOrCreatePlayer(locals, cookies, form.data.username);
    await cleanupPlayerOtherGames(locals, player.id, game.id);
    if (!game.players?.includes(player.id)) {
      const newPlayers = [...game.players || [], player.id];
      await locals.pb.collection("games").update(game.id, { players: newPlayers });
    }
    await locals.pb.collection("players").update(player.id, { current_game: game.id });
    return { form };
  },
  updatePolygon: async ({ request }) => {
    return await handleUpdatePolygon(request);
  },
  updateGameSettings: async ({ request, locals, cookies, params }) => {
    const playerId = cookies.get("player_id");
    const formData = await request.formData();
    const game = await locals.pb.collection("games").getFirstListItem(`code="${params.id}"`);
    if (game.admin !== playerId)
      return fail(403, { message: "Only an admin can change game settings" });
    await locals.pb.collection("games").update(game.id, {
      maxRounds: Number(formData.get("maxRounds")),
      timeLimit: Number(formData.get("timeLimit")),
      private: formData.get("private") === "true",
      graceDistance: Number(formData.get("graceDistance")),
      fallOfRate: Number(formData.get("fallOfRate")),
      maxPoints: Number(formData.get("maxPoints")),
      density: Number(formData.get("density")),
      polygon: JSON.parse(formData.get("polygon") || "null"),
      locationStrings: JSON.parse(formData.get("locationStrings") || "[]")
    });
    return { success: true };
  },
  toggleReady: async ({ locals, cookies, params }) => {
    const playerId = cookies.get("player_id");
    if (!playerId) return fail(401, { message: "Not logged in" });
    const game = await locals.pb.collection("games").getFirstListItem(`code="${params.id}"`);
    if (playerId === game.admin) {
      return { success: true, message: "Admin is always ready." };
    }
    const readyPlayers = game.ready_players || [];
    if (readyPlayers.includes(playerId)) {
      const newReadyPlayers = readyPlayers.filter((id) => id !== playerId);
      await locals.pb.collection("games").update(game.id, { ready_players: newReadyPlayers });
    } else {
      const newReadyPlayers = [...readyPlayers, playerId];
      await locals.pb.collection("games").update(game.id, { ready_players: newReadyPlayers });
    }
    return { success: true };
  },
  leaveGame: async ({ locals, cookies, params }) => {
    const playerId = cookies.get("player_id");
    if (!playerId) {
      throw redirect(303, "/");
    }
    let game;
    try {
      game = await locals.pb.collection("games").getFirstListItem(`code="${params.id}"`);
    } catch (err) {
      throw redirect(303, "/");
    }
    const newPlayers = (game.players || []).filter((id) => id !== playerId);
    const newReadyPlayers = (game.ready_players || []).filter((id) => id !== playerId);
    if (game.admin === playerId) {
      if (newPlayers.length > 0) {
        const newAdminId = newPlayers[Math.floor(Math.random() * newPlayers.length)];
        await locals.pb.collection("games").update(game.id, {
          players: newPlayers,
          ready_players: newReadyPlayers,
          admin: newAdminId
        });
      } else {
        await locals.pb.collection("games").delete(game.id);
      }
    } else {
      await locals.pb.collection("games").update(game.id, {
        players: newPlayers,
        ready_players: newReadyPlayers
      });
    }
    cookies.delete("player_id", { path: "/" });
    throw redirect(303, "/");
  },
  startGame: async ({ locals, cookies, params }) => {
    const playerId = cookies.get("player_id");
    const game = await locals.pb.collection("games").getFirstListItem(`code="${params.id}"`);
    if (game.admin !== playerId) {
      return fail(403, { message: "Only an admin can start a game" });
    }
    if (game.players.length !== game.ready_players.length) {
      return fail(400, { message: "Not all players are ready yet" });
    }
    try {
      await locals.pb.collection("games").update(game.id, {
        is_generating_challenge: true,
        generation_found: 0,
        generation_target: game.maxRounds
      });
      const roundData = await generateRandomPointsForChallenge(
        game.polygon,
        game.maxRounds,
        async (found) => {
          await locals.pb.collection("games").update(game.id, {
            generation_found: found
          });
        }
      );
      if (roundData.length < game.maxRounds) {
        await locals.pb.collection("games").update(game.id, {
          is_generating_challenge: false,
          generation_found: 0
        });
        return fail(400, {
          message: `Could not find enough panoramas (${roundData.length}/${game.maxRounds}) in the selection.`
        });
      }
      await Promise.all(
        (game.players || []).map(
          (id) => locals.pb.collection("players").update(id, { totalPoints: 0, lastRoundPoints: 0 })
        )
      );
      const guesses = await locals.pb.collection("guesses").getFullList({
        filter: `game="${game.id}"`
      });
      await Promise.all(guesses.map((guess) => locals.pb.collection("guesses").delete(guess.id)));
      const deadline = new Date(Date.now() + game.timeLimit * 1e3).toISOString();
      await locals.pb.collection("games").update(game.id, {
        challenge: { rounds: roundData },
        status: "playing",
        currentRound: 1,
        is_generating_challenge: false,
        generation_found: roundData.length,
        ready_players: game.admin ? [game.admin] : [],
        round_deadline_at: deadline
      });
      return { success: true, message: "Game is starting" };
    } catch (err) {
      await locals.pb.collection("games").update(game.id, {
        is_generating_challenge: false
      });
      console.error("Error creating a challenge", err);
      return fail(500, { message: "Error creating a challenge" });
    }
  },
  submitGuess: async ({ request, locals, cookies, params }) => {
    const playerId = cookies.get("player_id");
    if (!playerId) return fail(401, { message: "Not logged in" });
    const game = await locals.pb.collection("games").getFirstListItem(`code="${params.id}"`);
    const formData = await request.formData();
    const guessLocation = JSON.parse(formData.get("location") || "null");
    const currentRoundData = game.challenge.rounds[game.currentRound - 1];
    const correctLocation = currentRoundData.location;
    if (game.round_deadline_at) {
      const deadlineMs = new Date(game.round_deadline_at).getTime();
      if (Date.now() > deadlineMs) {
        return fail(400, { message: "Round timed out" });
      }
    }
    let points = 0;
    if (guessLocation) {
      const distance = calculateDistance(
        guessLocation[0],
        guessLocation[1],
        correctLocation[1],
        correctLocation[0]
      );
      const graceDistance = game.graceDistance * 1e3;
      const falloffMeters = game.fallOfRate * 1e3;
      if (distance <= graceDistance) {
        points = game.maxPoints;
      } else {
        const beyond = distance - graceDistance;
        points = Math.max(0, Math.round(game.maxPoints * Math.exp(-beyond / falloffMeters)));
      }
    }
    await locals.pb.collection("guesses").create({
      game: game.id,
      player: playerId,
      round: game.currentRound,
      location: guessLocation,
      points
    });
    const player = await locals.pb.collection("players").getOne(playerId);
    await locals.pb.collection("players").update(playerId, {
      totalPoints: player.totalPoints + points,
      lastRoundPoints: points
    });
    const guessesForRound = await locals.pb.collection("guesses").getFullList({
      filter: `game.id = "${game.id}" && round = ${game.currentRound}`
    });
    if (guessesForRound.length === game.players.length) {
      await locals.pb.collection("games").update(game.id, { status: "summary" });
    }
    return { success: true };
  },
  nextRound: async ({ locals, cookies, params }) => {
    const playerId = cookies.get("player_id");
    const game = await locals.pb.collection("games").getFirstListItem(`code="${params.id}"`);
    if (game.admin !== playerId)
      return fail(403, { message: "Only an admin can procced with the next round" });
    if (game.currentRound >= game.maxRounds) {
      await locals.pb.collection("games").update(game.id, { status: "lobby" });
    } else {
      const deadline = new Date(Date.now() + game.timeLimit * 1e3).toISOString();
      await locals.pb.collection("games").update(game.id, {
        status: "playing",
        currentRound: game.currentRound + 1,
        round_deadline_at: deadline
      });
    }
    return { success: true };
  },
  kickPlayer: async ({ locals, params, request, cookies }) => {
    const form = await request.formData();
    const targetPlayerId = String(form.get("playerId") || "");
    if (!targetPlayerId) return fail(400, { error: "missing playerId" });
    const actingPlayerId = cookies.get("player_id");
    if (!actingPlayerId) return fail(401, { error: "not logged in" });
    const gameCode = params.id;
    const game = await locals.pb.collection("games").getFirstListItem(`code="${gameCode}"`, { expand: "players,ready_players" });
    if (game.admin !== actingPlayerId) {
      return fail(403, { error: "not admin" });
    }
    if (game.status !== "lobby") {
      return fail(400, { error: "cannot kick after game start" });
    }
    if (targetPlayerId === game.admin) {
      return fail(400, { error: "cannot kick admin" });
    }
    if (!game.players?.includes(targetPlayerId)) {
      return fail(404, { error: "player_not_in_game" });
    }
    try {
      await locals.pb.collection("games").update(game.id, {
        "players-": targetPlayerId,
        "ready_players-": targetPlayerId
      });
      try {
        await locals.pb.collection("players").update(targetPlayerId, {
          current_game: null
        });
      } catch (_) {
      }
      return { success: true };
    } catch (e) {
      return fail(500, { error: "kick_failed" });
    }
  }
};
async function cleanupPlayerOtherGames(locals, playerId, keepGameId) {
  try {
    const otherGames = await locals.pb.collection("games").getFullList({
      filter: `players ?~ "${playerId}" && id != "${keepGameId}"`
    });
    for (const g of otherGames) {
      const newPlayers = (g.players || []).filter((id) => id !== playerId);
      const newReady = (g.ready_players || []).filter((id) => id !== playerId);
      if (g.admin === playerId) {
        if (newPlayers.length > 0) {
          const newAdminId = newPlayers[Math.floor(Math.random() * newPlayers.length)];
          await locals.pb.collection("games").update(g.id, {
            players: newPlayers,
            ready_players: newReady,
            admin: newAdminId
          });
        } else {
          try {
            await locals.pb.collection("games").delete(g.id);
          } catch {
          }
        }
      } else {
        await locals.pb.collection("games").update(g.id, {
          players: newPlayers,
          ready_players: newReady
        });
      }
    }
    const oldGuesses = await locals.pb.collection("guesses").getFullList({
      filter: `player="${playerId}" && game != "${keepGameId}"`
    });
    for (const gu of oldGuesses) {
      try {
        await locals.pb.collection("guesses").delete(gu.id);
      } catch {
      }
    }
    try {
      const oldMessages = await locals.pb.collection("messages").getFullList({
        filter: `player="${playerId}" && game != "${keepGameId}"`
      });
      for (const msg of oldMessages) {
        try {
          await locals.pb.collection("messages").delete(msg.id);
        } catch {
        }
      }
    } catch {
    }
  } catch (e) {
    console.warn("[cleanupPlayerOtherGames] failed", e);
  }
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-joAn-JxS.js')).default;
const server_id = "src/routes/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/3.CH_-P01C.js","_app/immutable/chunks/3l5szf1F.js","_app/immutable/chunks/D1rX8njY.js","_app/immutable/chunks/KO1hsnFR.js","_app/immutable/chunks/B5tPeL39.js","_app/immutable/chunks/UuI-7IYh.js","_app/immutable/chunks/Dp2bBzRa.js","_app/immutable/chunks/D3dmPIq3.js","_app/immutable/chunks/DtLjg7Vh.js","_app/immutable/chunks/wrQf6Heq.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-DmEMxO8H.js.map
