def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_create_and_get_student(client):
    payload = {"vpisna": "63111111", "ime": "Eva", "priimek": "Horvat"}
    r = client.post("/studenti", json=payload)
    assert r.status_code == 201
    data = r.json()
    sid = data["id"]

    r2 = client.get(f"/studenti/{sid}")
    assert r2.status_code == 200
    assert r2.json()["vpisna"] == "63111111"

def test_upravicenost_active(client):
    payload = {"vpisna": "63222222", "ime": "Tim", "priimek": "Kovac"}
    r = client.post("/studenti", json=payload)
    sid = r.json()["id"]

    r2 = client.get(f"/studenti/{sid}/upravicenost?predmetId=OIT101")
    assert r2.status_code == 200
    assert r2.json()["allowed"] is True

def test_upravicenost_inactive(client):
    payload = {"vpisna": "63333333", "ime": "Sara", "priimek": "Zajc"}
    r = client.post("/studenti", json=payload)
    sid = r.json()["id"]

    rpatch = client.patch(f"/studenti/{sid}/status", json={"status": "NEAKTIVEN"})
    assert rpatch.status_code == 200

    r2 = client.get(f"/studenti/{sid}/upravicenost")
    assert r2.status_code == 200
    assert r2.json()["allowed"] is False
    assert r2.json()["reason"] == "NEAKTIVEN_STATUS"