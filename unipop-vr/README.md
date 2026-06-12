# UniPop VR 🥽

Ein WebXR-Erlebnis für die **Meta Quest 3**, gehostet auf **GitHub Pages**.
Der Benutzer landet in einem futuristischen UniPop-Hub, wählt eine Kategorie
und taucht in ein 360°-Video ein (aufgenommen mit einer Insta360).
Nach dem Video geht es zurück zum Hub.

**Kategorien:** Langues · IA · Créativité · Bien-être · Cuisine

---

## 📁 Projektstruktur

```
unipop-vr/
├── index.html              ← Einstiegspunkt (A-Frame-Szene)
├── js/
│   └── app.js              ← Kategorien, Karten, Video-Logik
├── assets/
│   ├── videos/             ← Hier kommen die 5 360°-Videos hinein
│   │   ├── langues.mp4
│   │   ├── ia.mp4
│   │   ├── creativite.mp4
│   │   ├── bien-etre.mp4
│   │   └── cuisine.mp4
│   └── img/                ← (optional) Vorschaubilder für die Karten
├── .nojekyll               ← verhindert Jekyll-Verarbeitung auf GitHub Pages
└── README.md
```

---

## 🎥 1. Insta360-Videos vorbereiten

1. Video in der **Insta360-App / Insta360 Studio** als **equirectangulares MP4** exportieren
   (Standard-Export "360°-Video", *nicht* Reframe/Flat).
2. Für den Quest-Browser optimieren – **H.264, max. 4096 px Breite**:

```bash
ffmpeg -i original.mp4 \
  -vf "scale=3840:1920" \
  -c:v libx264 -profile:v high -level 5.1 -pix_fmt yuv420p \
  -crf 23 -movflags +faststart \
  -c:a aac -b:a 160k \
  langues.mp4
```

> ⚠️ 5,7K/8K-Material direkt von der Insta360 spielt der Quest-Browser
> oft **nicht** ab. 3840 × 1920 ist der sichere Sweetspot.
> `-movflags +faststart` sorgt dafür, dass das Video sofort streamt.

3. Die fertigen Dateien **exakt so benennen** wie in `js/app.js` hinterlegt
   (oder dort die Pfade anpassen) und nach `assets/videos/` kopieren.

### Dateigröße beachten (GitHub-Limit!)

- GitHub blockiert Dateien **über 100 MB**.
- Mit `-crf 23` und 3840 × 1920 passen ca. **2–4 Minuten** Video unter 100 MB.
- Längere Videos: `-crf 26` … `28` probieren, Videos kürzen, **oder**
  die Videos extern hosten (z. B. eigener Webspace mit CORS) und in
  `app.js` die volle URL eintragen.

---

## 🚀 2. Auf GitHub Pages veröffentlichen

```bash
# Repository anlegen und Code hochladen
git init
git add .
git commit -m "UniPop VR – erster Stand"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/unipop-vr.git
git push -u origin main
```

Dann auf GitHub: **Settings → Pages → Source: „Deploy from a branch" →
Branch `main` / `(root)` → Save**.

Nach 1–2 Minuten ist das Projekt erreichbar unter:

```
https://DEIN-NAME.github.io/unipop-vr/
```

> GitHub Pages liefert automatisch **HTTPS** – das ist Pflicht für WebXR.

---

## 🥽 3. Auf der Meta Quest 3 starten

1. Quest aufsetzen → **Browser** öffnen.
2. `https://DEIN-NAME.github.io/unipop-vr/` aufrufen
   (Tipp: als Lesezeichen speichern).
3. Unten rechts auf den **VR-Button** tippen → Immersionsmodus startet.
4. Mit dem **Controller-Laser** auf eine Karte zeigen und **Trigger** drücken.
5. Nach dem Video: Button **„← Zurück zum Hub"** oder einfach warten,
   bis das Video endet.

---

## 💻 4. Lokal testen (ohne Quest)

```bash
# im Projektordner – ein einfacher lokaler Webserver genügt:
python3 -m http.server 8080
# dann im Browser: http://localhost:8080
```

Auf dem Desktop: **Klicken & Ziehen** zum Umschauen, **Mausklick** auf Karten.

Direkt auf der Quest testen, ohne zu pushen? Im selben WLAN:
`http://IP-DEINES-PCS:8080` im Quest-Browser öffnen
(WebXR-Vollmodus braucht HTTPS, die 360°-Videos laufen aber auch so zum Testen).

---

## 🛠️ 5. Anpassen

| Was | Wo |
|---|---|
| Kategorien, Farben, Videopfade | `js/app.js` → Konstante `CATEGORIES` |
| Texte im Hub (Willkommen etc.) | `index.html` → Abschnitt `<!-- HUB -->` |
| Abstand/Anordnung der Karten | `js/app.js` → `buildCards()` (`radius`, `arc`) |
| Himmel-Farben | `js/app.js` → Shader `sunset-gradient` |

---

## ❓ Häufige Probleme

| Problem | Lösung |
|---|---|
| Schwarzer Bildschirm statt Video | Video > 4096 px breit oder H.265 → mit ffmpeg-Befehl oben neu kodieren |
| „Video konnte nicht geladen werden" | Dateiname/Pfad prüfen – muss exakt zu `CATEGORIES` in `app.js` passen |
| Push schlägt fehl | Videodatei > 100 MB → stärker komprimieren oder extern hosten |
| Kein VR-Button | Seite muss über **HTTPS** laufen (GitHub Pages erfüllt das) |
| Ton fehlt | Quest-Lautstärke prüfen; Audio muss AAC sein (`-c:a aac`) |
