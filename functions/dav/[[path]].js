export async function onRequest(context) {
  const { request } = context;
  
  // 处理 OPTIONS 预检请求（如果在本地测试跨域时会用到）
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

  const url = new URL(request.url);
  
  // 将请求完美转发到坚果云
  // 如果你在网页请求的是 /dav/mistake/sync.json
  // 这里就会将其拼接成 https://dav.jianguoyun.com/dav/mistake/sync.json
  const targetUrl = "https://dav.jianguoyun.com" + url.pathname + url.search;

  // 构造发给坚果云的请求，保留原来的方法、请求头（包含账密）和 body 数据
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });

  // 发起真实请求
  const response = await fetch(modifiedRequest);
  
  // 复制一份响应，并强制加上允许跨域的头，返回给前端
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", "*");
  
  return newResponse;
}