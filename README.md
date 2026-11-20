# The Museum of Her

The Museum of Her is a private digital exhibition built with Vite, React,
TypeScript, Three.js, and React Three Fiber. Its six connected rooms form a
scrollable 3D gallery with a pinned camera, spatial photo frames, interactive
name plaques, a letter pedestal, and a birthday finale.
The scene loads after entering the museum; the room navigation and exhibit
controls remain semantic HTML, and a 2D version is available if WebGL is not.

The portrait collection uses responsive WebP variants; supplied originals remain
unchanged in the existing `assets/` directory. Ambient audio never autoplays;
its play and mute controls remain disabled until a local track is configured in
`src/data/audio.ts`. To enable it, add the supplied track to the existing
`assets/` directory and set `ambientAudioSource` to
`new URL("../../assets/ambient.mp3", import.meta.url).href`; do not create a
second assets directory.

Inter and Cormorant Garamond are bundled locally from Fontsource under the
SIL Open Font License; the site no longer requests fonts from Google.
The site remains local and has not been deployed. Because this collection contains
personal photos, review access controls before choosing any hosting provider.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Run `npm run build` for a production build or
`npm run preview` to serve the built output locally.

## Project structure

- `assets/` — supplied originals, unchanged, plus generated responsive WebP variants
- `src/data/` — typed photo manifest, nicknames, and letter text
- `src/styles/tokens.css` — palette, type, and surface tokens
- `src/styles/global.css` — global styling and responsive exhibit layout
- `src/components/MuseumWorld.tsx` — 3D architecture, exhibit objects, and scroll-driven camera
- `src/components/Museum3DShell.tsx` — accessible room navigation and exhibit interactions
- `src/components/` — museum shell and exhibit content
