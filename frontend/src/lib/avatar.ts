export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const cleanApiUrl = apiURL.endsWith('/') ? apiURL.slice(0, -1) : apiURL;
  const cleanPath = url.startsWith('/') ? url : '/' + url;
  return `${cleanApiUrl}${cleanPath}`;
}
