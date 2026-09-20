import urllib.request
import threading
import subprocess
import time

def fetch(url):
    try:
        urllib.request.urlopen(url).read()
    except Exception as e:
        print(f"ERROR {url} {e}")

urls = [
    'http://localhost:8002/projects/cd80a893-474c-4ce1-ae65-f983918f93a0',
    'http://localhost:8002/projects/cd80a893-474c-4ce1-ae65-f983918f93a0/scenarios'
]

# Start server on 8002
p = subprocess.Popen(["python", "-m", "uvicorn", "api.main:app", "--port", "8002"], cwd="backend", stderr=subprocess.PIPE, stdout=subprocess.PIPE)
time.sleep(2)

threads = [threading.Thread(target=fetch, args=(u,)) for u in urls * 5]
for t in threads: t.start()
for t in threads: t.join()

p.kill()
stdout, stderr = p.communicate()
print("STDOUT:", stdout.decode('utf-8'))
print("STDERR:", stderr.decode('utf-8'))
