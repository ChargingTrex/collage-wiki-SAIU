// docusaurus-plugin-tailwindcss (as named in CLAUDE.md) does not exist on npm.
// This is the official Docusaurus-documented way to wire Tailwind into the
// webpack/PostCSS pipeline instead: a local plugin that appends tailwindcss +
// autoprefixer to the PostCSS plugin chain.
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default function tailwindPlugin() {
  return {
    name: 'tailwind-plugin',
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(tailwindcss);
      postcssOptions.plugins.push(autoprefixer);
      return postcssOptions;
    },
  };
}
