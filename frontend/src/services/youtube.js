/**
 * YouTube Data API v3 — Direct Frontend Service
 * Fetches topic-wise videos (5 per topic) from YouTube
 *
 * Setup:
 *   1. Go to https://console.cloud.google.com
 *   2. Enable "YouTube Data API v3"
 *   3. Create an API Key under Credentials
 *   4. Add it to .env: VITE_YOUTUBE_API_KEY=your_key_here
 */

const YT_API_KEY  = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Duration labels
const durationMap = {
  PT1M:  '<1 min',
  PT30S: '<1 min',
};

/** Parse ISO 8601 duration → human readable string */
function parseDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format view count → "1.2M views", "34K views" */
function formatViews(count) {
  if (!count) return '';
  const n = parseInt(count);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K views`;
  return `${n} views`;
}

/** Format published date → "2 years ago", "3 months ago" */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Search YouTube for a topic and return up to `maxResults` videos
 * with full details (snippet + contentDetails + statistics).
 *
 * @param {string} topicTitle  — e.g. "Recursion in Python"
 * @param {number} maxResults  — default 5
 * @returns {Promise<Array>}   — array of normalized video objects
 */
export async function fetchYouTubeVideos(topicTitle, maxResults = 5) {
  if (!YT_API_KEY || YT_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    throw new Error('YouTube API key not configured. Add VITE_YOUTUBE_API_KEY to your .env file.');
  }

  // ── Step 1: Search for video IDs ──────────────────────────────
  const searchQuery = encodeURIComponent(`${topicTitle} tutorial explained`);
  const searchUrl   =
    `${YT_BASE_URL}/search?part=snippet&type=video&videoCategoryId=27` +
    `&q=${searchQuery}&maxResults=${maxResults}&relevanceLanguage=en` +
    `&key=${YT_API_KEY}`;

  const searchRes  = await fetch(searchUrl);
  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube search failed (${searchRes.status})`);
  }
  const searchData = await searchRes.json();
  const items      = searchData.items || [];
  if (items.length === 0) return [];

  const videoIds = items.map(i => i.id.videoId).join(',');

  // ── Step 2: Fetch video details (duration + stats) ────────────
  const detailUrl =
    `${YT_BASE_URL}/videos?part=snippet,contentDetails,statistics` +
    `&id=${videoIds}&key=${YT_API_KEY}`;

  const detailRes  = await fetch(detailUrl);
  if (!detailRes.ok) {
    // Return search-only data if details fail
    return items.map(item => normalizeSearchItem(item));
  }
  const detailData = await detailRes.json();

  // ── Step 3: Normalize & return ────────────────────────────────
  return (detailData.items || []).map(normalizeDetailItem);
}

function normalizeSearchItem(item) {
  const s = item.snippet;
  return {
    id:          item.id.videoId,
    title:       s.title,
    channelName: s.channelTitle,
    thumbnail:   s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url,
    publishedAt: timeAgo(s.publishedAt),
    youtubeUrl:  `https://www.youtube.com/watch?v=${item.id.videoId}`,
    embedUrl:    `https://www.youtube.com/embed/${item.id.videoId}`,
    duration:    '',
    views:       '',
    description: s.description,
  };
}

function normalizeDetailItem(item) {
  const s  = item.snippet;
  const cd = item.contentDetails;
  const st = item.statistics;
  return {
    id:          item.id,
    title:       s.title,
    channelName: s.channelTitle,
    thumbnail:   s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url,
    publishedAt: timeAgo(s.publishedAt),
    youtubeUrl:  `https://www.youtube.com/watch?v=${item.id}`,
    embedUrl:    `https://www.youtube.com/embed/${item.id}`,
    duration:    parseDuration(cd?.duration),
    views:       formatViews(st?.viewCount),
    likes:       formatViews(st?.likeCount),
    description: s.description,
  };
}

/**
 * Simple in-memory cache so we don't re-fetch on re-renders.
 * Key: topicTitle, Value: { videos, ts }
 */
const _cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchYouTubeVideosCached(topicTitle, maxResults = 5) {
  const key = `${topicTitle}:${maxResults}`;
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.videos;

  const videos = await fetchYouTubeVideos(topicTitle, maxResults);
  _cache.set(key, { videos, ts: Date.now() });
  return videos;
}
