# DL2 Companion v0.7.3

Mobile-first PWA-Begleiter für **Dying Light 2 Stay Human** mit lokalem Fortschritt, Geräte-Sync und spielstandbezogenen Trackern.

## Aktueller Funktionsumfang
- Dashboard mit Gesamtfortschritt und aktuellem Bezirk
- 126 Hemmstoffe des Grundspiels
- 20 Safe-Codes inklusive Bloody Ties
- Charakterwerte für Gesundheit und Ausdauer
- Gebietsfortschritt / „Was fehlt mir hier?“
- 14 Militär-Airdrops mit Militärtechnologie
- 12 versunkene Airdrops
- 12 GRE-Anomalien
- 6 GRE-Quarantänezonen mit einzelnen GRE-Kisten
- 5 schwarze und 7 rote Enten / Easter Eggs
- Build-Empfehlungen
- FAQ / Wissen
- YouTube-Fundortsuche bei unterstützten Trackern
- Lokales JSON-Backup mit Export und Import
- Geräte-Sync über einmaligen Code (30 Minuten gültig)
- PWA / Offline-Grundfunktion und localStorage

## Speicherprinzip
Änderungen werden automatisch lokal gespeichert. Ein separater Speichern-Button ist nicht nötig. Das lokale JSON-Backup bleibt unabhängig vom Geräte-Sync erhalten. Export, Import und Geräte-Sync verwenden denselben vollständigen Spielstand.

## Sprache
Missions-, Orts-, Aktivitäts- und Ausrüstungsbezeichnungen orientieren sich an der **deutschen Spielversion**. Begriffe werden nicht zwanghaft übersetzt, wenn das deutsche Spiel selbst die englische Bezeichnung verwendet.

## v0.7.3
- YouTube-Fundortsuche für Hemmstoffe, Safe-Codes, Militär-Airdrops und GRE-Anomalien ergänzt
- Suchbegriffe werden dynamisch aus den vorhandenen Fundortdaten erzeugt
- Metro-FAQ um den Hemmstoff nach der Aktivierung ergänzt

## v0.7.2
- Startseite zeigt jetzt den gesamten Companion-Fortschritt
- Dauerhaft trackbare Inhalte werden gemeinsam berechnet
- Wiederholbare Aktivitäten zählen bewusst nicht zum Fortschritt

## v0.7.1
- Autosave-Fehler bei Militär-Airdrops, GRE-Anomalien, versunkenen Airdrops und Gebietsfortschritt behoben
- Auswahl des aktuellen Bezirks wird wieder zuverlässig gespeichert
- README vollständig aktualisiert
- Deutsche Ingame-Bezeichnungen überarbeitet
- Ausrüstungsklassen auf Raufbold, Sanitäter, Panzer und Jäger korrigiert
- FAQ deutlich erweitert
- Lokales Backup und Geräte-Sync bleiben parallel erhalten

## Technik
HTML / CSS / JavaScript · localStorage · Service Worker / PWA · Cloudflare Worker + KV für temporären Geräte-Sync

Die App ist ein privates Fan-/Hilfsprojekt und kein offizielles Produkt von Techland.
