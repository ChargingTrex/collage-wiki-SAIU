// src/theme/DocCard/Heading/Icon/index.js
//
// Swizzled (ejected) from @docusaurus/theme-classic. Upstream derives the
// card icon purely from a leading emoji in the doc's sidebar label, falling
// back to a generic "document" glyph — which is why every club card on the
// /docs/category/clubs generated-index page showed the same plain file icon,
// even though the sidebar (src/theme/DocSidebarItem/Link) already resolves a
// real per-club icon from each doc's `sidebar_custom_props.icon`.
//
// Same source of truth here: if `item.customProps.icon` names a lucide icon
// (see src/data/sidebarIcons.js), render that. Otherwise fall back to
// upstream's `icon` prop (the emoji/generic glyph) unchanged, so tutorial
// docs and any category without a custom icon are unaffected.
//
// Colored via useClubAccent keyed by the doc's own slug — same hook, same
// accent every hero uses, so a club's card icon here matches its sidebar
// icon and its hero, rather than inventing a third color source.

import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {SIDEBAR_ICONS, slugFromHref} from '@site/src/data/sidebarIcons';
import {useClubAccent} from '@site/src/components/useClubAccent';
import styles from './styles.module.css';

export default function DocCardHeadingIcon({item, icon}) {
  const Custom = item?.customProps?.icon && SIDEBAR_ICONS[item.customProps.icon];
  const {accent} = useClubAccent(slugFromHref(item?.href));

  return (
    <span className={clsx(ThemeClassNames.docs.docCard.icon, styles.cardTitleIcon)}>
      {Custom ? (
        <Custom
          className={styles.cardTitleLucideIcon}
          style={{'--accent-light': accent.light, '--accent-dark': accent.dark}}
          aria-hidden="true"
        />
      ) : (
        icon
      )}
    </span>
  );
}
