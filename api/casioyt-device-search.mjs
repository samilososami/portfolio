import { searchYouTube } from './casioyt-search.mjs';
import {
  DEVICE_PROTOCOL,
  catalogPackets,
  concatPackets,
  fallbackThumbnail,
  quantizeRgbToPacked,
} from './casioyt-device-protocol.mjs';

function textError(message, status) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function thumbnailForDevice(videoId, fetchImpl = fetch, sharpFactory) {
  try {
    const response = await fetchImpl(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, {
      headers: { Accept: 'image/jpeg,image/*' },
    });
    if (!response.ok) throw new Error(`thumbnail HTTP ${response.status}`);
    const source = Buffer.from(await response.arrayBuffer());
    const sharp = sharpFactory || (await import('sharp')).default;
    const { data, info } = await sharp(source)
      .resize(DEVICE_PROTOCOL.thumbnailWidth, DEVICE_PROTOCOL.thumbnailHeight, {
        fit: 'cover',
        position: 'centre',
        kernel: 'lanczos3',
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return quantizeRgbToPacked(data, info.width, info.height, info.channels);
  } catch (error) {
    console.error('CasioYT thumbnail conversion failed', { videoId, message: error?.message });
    return fallbackThumbnail(videoId.charCodeAt(0) || 0);
  }
}

export async function buildDeviceSearch(query, generation, apiKey, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const items = await searchYouTube(query, apiKey, fetchImpl);
  const prepared = await Promise.all(items.map(async (item) => ({
    ...item,
    thumbnail: await thumbnailForDevice(item.videoId, fetchImpl, options.sharpFactory),
  })));
  return concatPackets(catalogPackets(generation, prepared));
}

export async function GET(request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return textError('CasioYT search is not configured.', 503);
  const url = new URL(request.url, 'https://casioyt.local');
  const query = url.searchParams.get('q')?.trim() || '';
  const generation = Number.parseInt(url.searchParams.get('g') || '1', 10);
  if (!query || query.length > 72) return textError('Invalid search query.', 400);
  if (!Number.isInteger(generation) || generation < 0 || generation > 0xffff) {
    return textError('Invalid search generation.', 400);
  }
  try {
    const body = await buildDeviceSearch(query, generation, apiKey);
    return new Response(body, {
      headers: {
        'Content-Type': 'application/vnd.casioyt.catalog',
        'Content-Length': String(body.length),
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-CasioYT-Protocol': '1',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('CasioYT device search failed', { message: error?.message });
    const status = error?.status === 403 ? 429 : 502;
    return textError(status === 429 ? 'YouTube quota exhausted.' : 'YouTube search failed.', status);
  }
}
