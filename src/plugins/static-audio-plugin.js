// Lists the audio files actually committed under static/audio/ and exposes
// them as global data, so FestSound (and anything else with an `audioSrc`)
// can tell at build time whether its file exists.
//
// Why not just request the file in the browser: a HEAD/GET on a missing
// file is logged by the browser as a 404 console error on every page view
// that renders a fest hero — the e2e suite treats console errors as
// failures, and so should we. Knowing at build time also means there's no
// first-paint flash of a control that turns out to be dead: the server
// render already knows whether to draw the button.
//
// Read in loadContent (re-run on every build/dev start), so committing a new
// file in static/audio/ makes its button appear on the next build with no
// code change.
import fs from 'node:fs';
import path from 'node:path';

export default function staticAudioPlugin(context) {
  return {
    name: 'static-audio-plugin',
    async loadContent() {
      const dir = path.join(context.siteDir, 'static', 'audio');
      if (!fs.existsSync(dir)) return [];
      return fs
        .readdirSync(dir)
        .filter((name) => /\.(mp3|ogg|wav|m4a|aac|flac|webm)$/i.test(name));
    },
    async contentLoaded({content, actions}) {
      actions.setGlobalData({files: content});
    },
    getPathsToWatch() {
      return [path.join(context.siteDir, 'static', 'audio', '*')];
    },
  };
}
