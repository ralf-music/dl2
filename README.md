# DL2 Companion v0.8.3

Mobile-first PWA-Begleiter für **Dying Light 2 Stay Human** mit lokalem Fortschritt, Geräte-Sync und spielstandbezogenen Trackern.

## v0.7.5
- Backup- und Sync-Erklärtexte überarbeitet
- FAQ: Buchsymbol/Lagerfeuer ergänzt
- FAQ: Nightrunner-Werkzeugstufen ergänzt
- FAQ: spoilerarmer Hinweis auf verpassbare Inhalte und PK-Armbrust ergänzt
- Deutsche Orts- und Aktivitätsbezeichnungen erneut geprüft und modulübergreifend vereinheitlicht

- Deutsche Ingame-Bezeichnungen weiter korrigiert
- Hemmstoff-Bezirke bleiben beim Abhaken geöffnet
- Neues Companion-App-Icon inklusive maskierbarer PWA-Icons integriert

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

## v0.7.4
- Hemmstoff-Bezeichnungen systematisch auf deutsche Spiel-/Guide-Terminologie geprüft
- Belegte deutsche Quest- und GRE-Namen übernommen
- Zentralring statt Central Loop in der deutschen Anzeige
- Englische Such-Aliase für YouTube bleiben intern erhalten
- Keine erzwungene Übersetzung von Eigennamen, die auch deutschsprachige Quellen englisch führen

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

## v0.8.0
- DE/EN-Sprachumschaltung mit erweiterbaren JSON-Sprachdateien.
- Sammlerstücke: 209 Andenken, 68 Bänder, 71 Graffiti.
- 348 stabile Tracker-Slots, separate Ingame-Zähler und YouTube-Suche.
- 71 Graffiti mit Namen und Bezirken.
- Sichtbarer Fan-Projekt-/Techland-Hinweis.
- Android-Icon-Sicherheitszone vergrößert.

## v0.8.1
- Sammlerstücke kompakter als 3-spaltiges Kachelraster; Details erst beim Antippen.
- Safe-Code-Schnellsuche auf der Startseite entfernt.
- Hemmstoff-Modul zeigt dynamisch „x / 126 gesammelt“.
- Safe-Codes mit Checkbox, Fortschritt und „Nur fehlende“-Filter.
- Gebietsfortschritt auf mehrere Tracker-Kategorien erweitert.

## v0.8.2
- Sprach-/Branding-Feinschliff, Backup-Hinweis, Sofort-Sprachwechsel, kompaktere Navigation und 8 Changelog-Versionen.

## v0.8.3
- Header-Layout korrigiert, Sprachwahl vereinfacht und Navigation auf „Sammlung“ korrigiert.


## v0.8.4
- Pilgerrang 1–9 im Charakterrechner, korrigierte Gesundheits-/Ausdauerberechnung und Pilgerrang-Erklärung.
- Header- und Bottom-Navigation-Feinschliff.


## v0.8.5
- Verknüpfte Tracker-Status, deutsche Datenkorrektur und UI-Feinschliff.


## v0.8.6
- Einheitlicher SVG-Icon-Satz für die Bottom-Navigation: Haus, Spritze, Safe mit Tastenfeld und aufgeklapptes Buch.
