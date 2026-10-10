// Service Worker - 拦截外部请求以解决 CORS 问题
const BLOCKED_DOMAINS = [
    'kongregate.com',
    'armorgames.com',
    'newgrounds.com',
    'miniclip.com',
    'addictinggames.com'
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 检查是否需要拦截的域名
    const shouldBlock = BLOCKED_DOMAINS.some(domain =>
        url.hostname.includes(domain)
    );

    if (shouldBlock) {
        console.log('[Service Worker] Blocking external request:', url.href);

        // 根据请求类型返回不同的空响应
        let contentType = 'application/octet-stream';
        const pathname = url.pathname.toLowerCase();

        if (pathname.endsWith('.swf')) {
            contentType = 'application/x-shockwave-flash';
        } else if (pathname.endsWith('.xml')) {
            contentType = 'text/xml';
        } else if (pathname.endsWith('.json')) {
            contentType = 'application/json';
        }

        // 返回空响应，避免 CORS 错误
        event.respondWith(
            new Response('', {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Content-Length': '0'
                }
            })
        );
        return;
    }

    // 其他请求正常处理
    event.respondWith(fetch(event.request).catch(() => {
        console.log('[Service Worker] Fetch failed, returning empty response:', url.href);
        return new Response('', {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
    }));
});
