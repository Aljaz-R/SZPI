from studenti.infrastruktura.repositories import StudentRepository

def test_repo_add_and_get(db_session):
    repo = StudentRepository(db_session)
    s = repo.add(vpisna="63123456", ime="Ana", priimek="Novak")
    got = repo.get_by_id(s.id)
    assert got is not None
    assert got.vpisna == "63123456"

def test_repo_update_status(db_session):
    repo = StudentRepository(db_session)
    s = repo.add(vpisna="63999999", ime="Miha", priimek="Kranjc")
    upd = repo.update_status(s.id, "NEAKTIVEN")
    assert upd is not None
    assert upd.status == "NEAKTIVEN"