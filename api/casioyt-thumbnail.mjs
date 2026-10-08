export async function GET(request) {
  const id = new URL(request.url, 'https://casioyt.local').searchParams.get('id') || '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return new Response('ID inválido.', { status: 400 });
  try {
    const upstream = await fetch(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`, {
      headers: { Accept: 'image/avif,image/webp,image/jpeg,image/*' },
    });
    if (!upstream.ok) return new Response('Miniatura no disponible.', { status: 404 });
    return new Response(await upstream.arrayBuffer(), {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'CDN-Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Miniatura no disponible.', { status: 502 });
  }
}
