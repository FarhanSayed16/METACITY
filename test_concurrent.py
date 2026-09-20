import urllib.request
import threading

def fetch(url):
    try:
        urllib.request.urlopen(url).read()
        print(f"SUCCESS {url}")
    except Exception as e:
        print(f"ERROR {url} {e}")

urls = [
    'http://localhost:8001/projects/cd80a893-474c-4ce1-ae65-f983918f93a0',
    'http://localhost:8001/projects/cd80a893-474c-4ce1-ae65-f983918f93a0/scenarios'
]

threads = [threading.Thread(target=fetch, args=(u,)) for u in urls * 10]
for t in threads: t.start()
for t in threads: t.join()
