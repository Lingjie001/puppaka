<?php
// 转发请求到 Node.js
$host = '127.0.0.1';
$port = 3000;

// 构建目标 URL
$uri = $_SERVER['REQUEST_URI'];
$url = "http://{$host}:{$port}{$uri}";

// 初始化 cURL
$ch = curl_init($url);

// 设置选项
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

// 转发请求方法
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// 转发请求头
$headers = [];
foreach (getallheaders() as $key => $value) {
    if (strtolower($key) !== 'host') {
        $headers[] = "$key: $value";
    }
}
$headers[] = "Host: localhost:3000";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// 转发 POST 数据
if ($method === 'POST') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

// 执行请求
$response = curl_exec($ch);

if ($response === false) {
    http_response_code(503);
    echo "Service Unavailable. Node.js app may not be running.";
    exit;
}

// 分离 header 和 body
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

// 转发响应头
foreach (explode("\r\n", $headers) as $header) {
    if (strpos($header, ':') !== false && !preg_match('/^(Transfer-Encoding|Content-Length):/i', $header)) {
        header($header);
    }
}

// 输出响应体
echo $body;

curl_close($ch);
