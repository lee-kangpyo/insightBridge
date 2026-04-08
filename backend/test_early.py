import requests; r = requests.post('http://localhost:8000/api/query', json={'question': '학사경고 대비 자퇴율'}); print(r.status_code, r.json())  
