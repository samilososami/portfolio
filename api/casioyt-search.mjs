const SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';
const VIDEOS_ENDPOINT = 'https://www.googleapis.com/youtube/v3/videos';
const MAX_RESULTS = 5;

function json(body, status = 200, cache = false) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  };
  headers['Cache-Control'] = cache
    ? 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    : 'no-store';
  if (cache) headers['CDN-Cache-Control'] = 'public, s-maxage=3600, stale-while-revalidate=86400';
  return new Response(JSON.stringify(body), { status, headers });
}

function decodeEntities(value) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', quot: '"', '#39': "'" };
  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot|#39);/gi, (match, entity) => {
    if (named[entity]) return named[entity];
    const numeric = entity[1]?.toLowerCase() === 'x'
      ? Number.parseInt(entity.slice(2), 16)
      : Number.parseInt(entity.slice(1), 10);
    return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : match;
  });
}

export function cleanDisplayText(value) {
  return decodeEntities(value)
    .normalize('NFKC')
    .replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseIsoDuration(value) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(String(value || ''));
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

async function googleJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.error?.message || `YouTube respondió con HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return body;
}

export async function searchYouTube(query, apiKey, fetchImpl = fetch) {
  const searchUrl = new URL(SEARCH_ENDPOINT);
  searchUrl.search = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: query,
    maxResults: String(MAX_RESULTS),
    safeSearch: 'moderate',
    videoEmbeddable: 'true',
    key: apiKey,
  }).toString();
  const search = await googleJson(searchUrl, fetchImpl);
  const ids = (search.items || []).map((item) => item?.id?.videoId).filter((id) => /^[\w-]{11}$/.test(id));
  if (!ids.length) return [];

  const detailsUrl = new URL(VIDEOS_ENDPOINT);
  detailsUrl.search = new URLSearchParams({
    part: 'contentDetails,status',
    id: ids.join(','),
    key: apiKey,
  }).toString();
  const details = await googleJson(detailsUrl, fetchImpl);
  const detailById = new Map((details.items || []).map((item) => [item.id, item]));

  return (search.items || []).flatMap((item) => {
    const videoId = item?.id?.videoId;
    const detail = detailById.get(videoId);
    if (!detail || detail.status?.embeddable === false) return [];
    return [{
      videoId,
      title: cleanDisplayText(item.snippet?.title) || 'Vídeo de YouTube',
      channel: cleanDisplayText(item.snippet?.channelTitle) || 'YouTube',
      durationSeconds: parseIsoDuration(detail.contentDetails?.duration),
    }];
  }).slice(0, MAX_RESULTS);
}

export async function GET(request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return json({ error: 'CasioYT todavía no tiene configurada la búsqueda de YouTube.' }, 503);
  const query = new URL(request.url, 'https://casioyt.local').searchParams.get('q')?.trim() || '';
  if (!query || query.length > 72) return json({ error: 'Escribe una búsqueda de entre 1 y 72 caracteres.' }, 400);
  try {
    const items = await searchYouTube(query, apiKey);
    return json({ query, items }, 200, true);
  } catch (error) {
    const status = error?.status === 403 ? 429 : 502;
    return json({ error: status === 429 ? 'La cuota de búsquedas de YouTube está agotada temporalmente.' : 'YouTube no ha podido completar la búsqueda.' }, status);
  }
}
