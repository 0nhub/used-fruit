# Used Fruit

Portal für gebrauchte Apple-Geräte – Design und Browse-Erfahrung angelehnt an den Apple Refurbished Store.

## Features

- Kategorien (aktuell): Mac, iPad, iPhone
- Filter nach Modell, Größe, Jahr, Farbe, RAM, Speicher und Zustand
- Standard-Modellbilder statt Nutzerfotos
- Inserieren mit Zustand, Ort, PLZ und Kilometer-Umkreis
- Lokale Abholung oder deutschlandweite Relevanz

## Start

Voraussetzung: Node.js 18+

```bash
cd "/Users/gabriel/Used Fruit"
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

Falls der Dev-Server auf macOS wegen `EMFILE` keine Routen findet:

```bash
ulimit -n 65536
npm run build && npm run start
```

Inserate, die du anlegst, werden lokal im Browser (`localStorage`) gespeichert.
