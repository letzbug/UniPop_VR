/* =====================================================================
   UniPop VR – App-Logik
   - erzeugt die 5 Kategorie-Karten im Hub
   - startet beim Klick das passende 360°-Video (Insta360, equirectangular)
   - bringt den Benutzer nach dem Video (oder per Button) zurück zum Hub

   WICHTIG: Diese Datei wird in index.html OHNE "defer" geladen,
   damit Komponenten & Shader vor der Szene registriert sind.
   ===================================================================== */

/* ------------------ 1. Kategorien konfigurieren ------------------
   Videodateien gehören nach assets/videos/ (siehe README).         */
const CATEGORIES = [
  {
    id: 'langues',
    title: 'LANGUES',
    subtitle: 'Sprachen lernen und\ndie Welt entdecken',
    color: '#7C3AED',          // Violett
    video: 'assets/videos/langues.mp4'
  },
  {
    id: 'ia',
    title: 'IA',
    subtitle: 'Künstliche Intelligenz\nverstehen und nutzen',
    color: '#2563EB',          // Blau
    video: 'assets/videos/ia.mp4'
  },
  {
    id: 'bienetre',
    title: 'BIEN-ÊTRE',
    subtitle: 'Für Körper, Geist\nund Balance',
    color: '#059669',          // Grün
    video: 'assets/videos/bien-etre.mp4'
  },
  {
    id: 'creativite',
    title: 'CRÉATIVITÉ',
    subtitle: 'Entfalte deine\nkreative Seite',
    color: '#D97706',          // Orange/Gold
    video: 'assets/videos/creativite.mp4'
  },
  {
    id: 'cuisine',
    title: 'CUISINE',
    subtitle: 'Kochen, genießen\nund ausprobieren',
    color: '#0D9488',          // Türkis
    video: 'assets/videos/cuisine.mp4'
  }
];

/* ------------------ 2. Hover-Effekt für Karten ------------------ */
AFRAME.registerComponent('card-hover', {
  init: function () {
    const el = this.el;

    el.addEventListener('mouseenter', () => {
      el.setAttribute('scale', '1.08 1.08 1.08');
      const bg = el.querySelector('.card-bg');
      if (bg) bg.setAttribute('material', 'emissiveIntensity', 0.55);
    });
    el.addEventListener('mouseleave', () => {
      el.setAttribute('scale', '1 1 1');
      const bg = el.querySelector('.card-bg');
      if (bg) bg.setAttribute('material', 'emissiveIntensity', 0.25);
    });
  }
});

/* ------------------ 3. Sonnenuntergangs-Himmel (Shader) ------------------ */
AFRAME.registerShader('sunset-gradient', {
  schema: {},
  vertexShader: [
    'varying vec3 vWorldPos;',
    'void main() {',
    '  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n'),
  fragmentShader: [
    'varying vec3 vWorldPos;',
    'void main() {',
    '  float h = clamp(vWorldPos.y / 40.0, 0.0, 1.0);',
    '  vec3 horizon = vec3(0.95, 0.55, 0.35);',   // warmes Orange am Horizont
    '  vec3 mid     = vec3(0.55, 0.30, 0.55);',   // Violett-Rosa
    '  vec3 top     = vec3(0.08, 0.06, 0.18);',   // Dunkles Nachtblau
    '  vec3 col = mix(horizon, mid, smoothstep(0.0, 0.35, h));',
    '  col = mix(col, top, smoothstep(0.30, 0.85, h));',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n')
});

/* ------------------ 4. Hub-Manager (Zustandslogik) ------------------ */
AFRAME.registerComponent('unipop-hub', {
  init: function () {
    this.state = 'hub';            // 'hub' | 'loading' | 'video'
    this.video = document.querySelector('#video360');
    this.videosphere = document.querySelector('#videosphere');
    this.hub = document.querySelector('#hub');
    this.videoUI = document.querySelector('#video-ui');
    this.loader = document.querySelector('#loader');
    this.errorPanel = document.querySelector('#error-panel');
    this.errorText = document.querySelector('#error-text');

    // Mehrzeiligen Text (mit echtem Zeilenumbruch) per JS setzen
    const info = document.querySelector('#info-line1');
    if (info) {
      info.setAttribute('text', 'value', 'Tauche ein in über 1000 Kurse\nin ganz Luxemburg');
    }

    this.buildCards();

    // Zurück-Button
    const back = document.querySelector('#back-button');
    back.classList.add('clickable');
    back.addEventListener('click', () => this.returnToHub());

    // Nach Videoende automatisch zurück zum Hub
    this.video.addEventListener('ended', () => this.returnToHub());

    // Fehlerbehandlung (Datei fehlt / Codec nicht unterstützt)
    this.video.addEventListener('error', () => {
      if (this.state === 'hub') return;
      this.showError('Video konnte nicht geladen werden.\nLiegt die Datei in assets/videos/?\n(H.264-MP4, max. 4096 px Breite)');
    });
  },

  /* Karten im Halbkreis um den Benutzer erzeugen */
  buildCards: function () {
    const container = document.querySelector('#cards');
    const radius = 4.2;                       // Abstand zum Benutzer
    const arc = 110;                          // Gesamtwinkel des Halbkreises (Grad)
    const startAngle = -arc / 2;
    const step = arc / (CATEGORIES.length - 1);

    CATEGORIES.forEach((cat, i) => {
      const angleDeg = startAngle + i * step;
      const angleRad = THREE.MathUtils.degToRad(angleDeg);
      const x = Math.sin(angleRad) * radius;
      const z = -Math.cos(angleRad) * radius;

      // --- Wurzel der Karte (klickbar) ---
      const card = document.createElement('a-entity');
      card.setAttribute('position', { x: x, y: 1.85, z: z });
      card.setAttribute('rotation', { x: 0, y: -angleDeg, z: 0 }); // schaut zum Benutzer
      card.setAttribute('card-hover', '');
      card.classList.add('clickable');

      // --- Farbiger Hintergrund ---
      const bg = document.createElement('a-plane');
      bg.classList.add('card-bg');
      bg.setAttribute('width', 1.15);
      bg.setAttribute('height', 1.55);
      bg.setAttribute('material', {
        color: cat.color,
        emissive: cat.color,
        emissiveIntensity: 0.25,
        opacity: 0.95,
        side: 'double'
      });
      card.appendChild(bg);

      // --- Dunkles Innenfeld ---
      const inner = document.createElement('a-plane');
      inner.setAttribute('width', 1.03);
      inner.setAttribute('height', 0.62);
      inner.setAttribute('position', '0 0.18 0.01');
      inner.setAttribute('material', { color: '#14101e', opacity: 0.55 });
      card.appendChild(inner);

      // --- Titel ---
      const title = document.createElement('a-entity');
      title.setAttribute('position', '0 0.58 0.02');
      title.setAttribute('text', {
        value: cat.title, align: 'center', color: '#ffffff',
        width: 2.4, wrapCount: 16
      });
      card.appendChild(title);

      // --- Untertitel (mehrzeilig) ---
      const sub = document.createElement('a-entity');
      sub.setAttribute('position', '0 -0.42 0.02');
      sub.setAttribute('text', {
        value: cat.subtitle, align: 'center', color: '#f3efff',
        width: 1.9, wrapCount: 24
      });
      card.appendChild(sub);

      // --- "Starten"-Hinweis ---
      const cta = document.createElement('a-entity');
      cta.setAttribute('position', '0 -0.68 0.02');
      cta.setAttribute('text', {
        value: 'Starten', align: 'center', color: '#ffffff',
        width: 1.6, wrapCount: 14
      });
      card.appendChild(cta);

      card.addEventListener('click', () => this.openCategory(cat));
      container.appendChild(card);
    });
  },

  /* Kategorie anklicken → 360°-Video starten */
  openCategory: function (cat) {
    if (this.state !== 'hub') return;        // Doppelklicks ignorieren
    this.state = 'loading';

    this.hideError();
    this.loader.setAttribute('visible', true);

    // Videoquelle dynamisch setzen (lädt nur das gewählte Video)
    this.video.src = cat.video;
    this.video.load();

    const onReady = () => {
      this.video.removeEventListener('canplay', onReady);
      if (this.state !== 'loading') return;

      this.video.play().then(() => {
        this.state = 'video';
        this.loader.setAttribute('visible', false);
        this.hub.setAttribute('visible', false);
        this.videosphere.setAttribute('visible', true);
        this.videoUI.setAttribute('visible', true);
        this.setHubClickable(false);
      }).catch(() => {
        this.showError('Wiedergabe blockiert.\nBitte erneut auf die Karte klicken.');
      });
    };

    this.video.addEventListener('canplay', onReady);
  },

  /* Zurück zum Hub (Button oder Videoende) */
  returnToHub: function () {
    this.video.pause();
    this.video.removeAttribute('src');       // Speicher freigeben (wichtig auf der Quest)
    this.video.load();

    this.state = 'hub';
    this.loader.setAttribute('visible', false);
    this.hideError();
    this.videosphere.setAttribute('visible', false);
    this.videoUI.setAttribute('visible', false);
    this.hub.setAttribute('visible', true);
    this.setHubClickable(true);
  },

  /* Karten (de)aktivieren, damit der Laser im Video nichts Unsichtbares trifft */
  setHubClickable: function (on) {
    document.querySelectorAll('#cards > a-entity').forEach(card => {
      if (on) { card.classList.add('clickable'); }
      else    { card.classList.remove('clickable'); }
    });
  },

  showError: function (msg) {
    this.state = 'hub';
    this.loader.setAttribute('visible', false);
    this.errorText.setAttribute('text', 'value', msg);
    this.errorPanel.setAttribute('visible', true);
    this.hub.setAttribute('visible', true);
    this.videosphere.setAttribute('visible', false);
    this.videoUI.setAttribute('visible', false);
    this.setHubClickable(true);
    // Fehlermeldung nach 6 s ausblenden
    clearTimeout(this._errTimer);
    this._errTimer = setTimeout(() => this.hideError(), 6000);
  },

  hideError: function () {
    this.errorPanel.setAttribute('visible', false);
  }
});
