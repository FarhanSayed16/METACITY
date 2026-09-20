import urllib.request

headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Host': 'localhost:8001',
    'Origin': 'http://localhost:5173',
    'Referer': 'http://localhost:5173/',
    'Sec-Ch-Ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'
}

req = urllib.request.Request('http://localhost:8001/projects/cd80a893-474c-4ce1-ae65-f983918f93a0', headers=headers)
try:
    resp = urllib.request.urlopen(req)
    print("SUCCESS", resp.read())
except Exception as e:
    print("ERROR", e)
    if hasattr(e, 'read'):
        print(e.read())
