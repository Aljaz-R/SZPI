# Sistem za prijave na izpite

## Opis projekta
Sistem za prijave na izpite je mikrostoritvena aplikacija, ki omogoča pregled razpisanih izpitnih rokov, prijavo/odjavo študentov ter vpogled v zgodovino prijav preko spletnega uporabniškega vmesnika.

---

## Arhitektura sistema (3 mikrostoritve + spletni UI)

### Mikrostoritve
1. **Storitev študenti**
   - evidenca študentov (profil, status vpisa)
   - osnovni pogoji/upravičenost za pristop (npr. aktiven status)
   - izpostavi podatke za preverjanje upravičenosti

2. **Storitev izpiti**
   - razpis izpitnih rokov (predmet, datum/ura, lokacija)
   - prijavna okna (prijave od–do) in kapaciteta
   - pravila razpisa (npr. ali je rok odprt za prijave)

3. **Storitev prijave na izpite**
   - ustvarjanje prijave
   - preklic prijave (odjava)
   - pregled aktivnih/preteklih prijav študenta
   - uveljavlja pravila: brez dvojnih prijav, prijava/odjava znotraj rokov, upoštevanje kapacitete

### Spletni uporabniški vmesnik
- pregled razpisanih izpitov
- prijava/odjava na izpit
- moje prijave (aktivne + zgodovina)

---

## Komunikacija med komponentami
- Spletni vmesnik komunicira z mikrostoritvami preko **REST API (HTTP)**.
- Storitev prijave na izpite pri ustvarjanju/preklicu prijave po potrebi preveri:
  - status/pogoje študenta pri storitvi študenti,
  - odprtost roka, kapaciteto in roke pri storitvi izpiti.

Primer poteka:
1. Študent v UI pridobi seznam razpisanih izpitnih rokov.
2. Študent izbere izpitni rok in odda prijavo.
3. Storitev prijave preveri pravila (roki, kapaciteta, upravičenost) pri ostalih storitvah.
4. Prijava se shrani in je vidna v “Moje prijave”.

---

## Načela (Clean Architecture)
- **Domena (business rules)** ne pozna baze, frameworkov ali zunanjih API-jev.
- Odvisnosti tečejo **od zunanjosti proti notranjosti**:
  - API/infrastruktura → aplikacijska logika → domena
- Mikrostoritve so **ohlapno sklopljene** in samostojne.

---

## Struktura repozitorija (screaming architecture)

```text
sistem-prijav-na-izpite/
│
├── studenti/
│   ├── domena/                 # poslovni koncepti: Student, StatusVpisa, pravila upravičenosti .
│   ├── aplikacija/             # use-casei: pridobi študenta, preveri upravičenost .
│   ├── infrastruktura/         # baza, repo implementacije, zunanji adapterji .
│   └── api/                    # REST controllerji, request/response DTO-ji .
│
├── izpiti/
│   ├── domena/                 # IzpitniRok, PrijavnoOkno, Kapaciteta, pravila razpisa .
│   ├── aplikacija/             # use-casei: razpisi rok, seznam rokov, podrobnosti roka .
│   ├── infrastruktura/         # baza, repo implementacije .
│   └── api/                    # REST endpointi .
│
├── prijave-na-izpite/
│   ├── domena/                 # Prijava, statusi, pravila prijave/odjave .
│   ├── aplikacija/             # use-casei: ustvari/prekliči prijavo, seznam prijav .
│   ├── infrastruktura/         # baza, repo, integracije do drugih storitev .
│   └── api/                    # REST endpointi .
│
├── spletni-vmesnik/
│   ├── src/                    # UI logika in komponente
│   └── public/                 # statične datoteke
│
└── README.md
