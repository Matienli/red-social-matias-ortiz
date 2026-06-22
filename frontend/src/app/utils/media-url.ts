import { environment } from '../../environments/environment';

export function resolveMediaUrl(url?: string): string | null {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const origin = environment.apiUrl.replace(/\/api\/?$/, '');
  return url.startsWith('/') ? `${origin}${url}` : `${origin}/api/uploads/perfiles/${url}`;
}
