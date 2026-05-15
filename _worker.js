export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 拦截 WebDAV 代理请求
    if (url.pathname.startsWith("/dav/")) {
      // 1. 处理跨域预检请求
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Max-Age": "86400",
          }
        });
      }

      // 2. 构造目标 URL (指向坚果云)
      const targetUrl = "https://dav.jianguoyun.com" + url.pathname + url.search;

      // 3. 转发请求
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "follow"
      });

      try {
        const response = await fetch(modifiedRequest);
        const newResponse = new Response(response.body, response);
        // 4. 强制注入跨域头，确保浏览器不拦截
        newResponse.headers.set("Access-Control-Allow-Origin", "*");
        return newResponse;
      } catch (e) {
        return new Response("Proxy Error: " + e.message, { status: 500 });
      }
    }

    // 如果不是代理请求，则返回静态资源（index.html等）
    return env.ASSETS.fetch(request);
  }
};
