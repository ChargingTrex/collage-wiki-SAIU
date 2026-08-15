// src/theme/NavbarItem/ComponentTypes.js
//
// Registers one custom navbar item type — 'custom-accentModeToggle' — for
// the per-club/unified accent toggle (AccentModeToggle.jsx). This is the
// standard Docusaurus mechanism for adding a bespoke, stateful React navbar
// item: `navbar.items[].type` in docusaurus.config.js resolves against this
// map. Everything else here is Docusaurus's own default map, untouched.

import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import { AccentModeToggle } from '@site/src/components/AccentModeToggle';

export default {
  ...ComponentTypes,
  'custom-accentModeToggle': AccentModeToggle,
};
