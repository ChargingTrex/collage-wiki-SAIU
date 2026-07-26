// docusaurus-plugin-tailwindcss (as named in CLAUDE.md) does not exist on npm.
// This is the official Docusaurus-documented way to wire Tailwind into the
// webpack/PostCSS pipeline instead: a local plugin that appends tailwindcss +
// autoprefixer to the PostCSS plugin chain.
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from '../../tailwind.config.js';

export default function tailwindPlugin() {
  return {
    name: 'tailwind-plugin',
    configurePostCss(postcssOptions) {
      // Pass the config explicitly rather than relying on tailwindcss's own
      // cosmiconfig-based auto-discovery, which was silently finding nothing
      // (0 utility classes generated) under Rspack's loader cwd context.
      postcssOptions.plugins.push(tailwindcss(tailwindConfig));
      postcssOptions.plugins.push(autoprefixer);
      return postcssOptions;
    },
  };
}
