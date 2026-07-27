// src/theme/DocSidebarItem/Link/index.js
//
// Swizzled (ejected, not wrapped) from @docusaurus/theme-classic — wrap only
// injects around the default output, and adding an icon before the label
// requires changing what's inside the <Link>. Kept a thin diff from upstream
// on purpose: same structure, same class names, one addition — reading
// `item.customProps.icon` (sourced from each doc's `sidebar_custom_props.icon`
// frontmatter, see src/data/sidebarIcons.js) and rendering the matching
// lucide icon before the label. Docs with no icon set (tutorial pages, etc.)
// render exactly as upstream — nothing else about this file should drift
// from the original.
//
// Icon color reuses useClubAccent — the same hook every hero uses — keyed by
// the doc's own slug (derived from its href), so a club's sidebar icon is
// always the same accent as that club's hero, and picks up unified-mode /
// light-dark switching for free instead of a second color system.

import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import {SIDEBAR_ICONS, slugFromHref} from '@site/src/data/sidebarIcons';
import {useClubAccent} from '@site/src/components/useClubAccent';
import styles from './styles.module.css';

function LinkLabel({label, icon, href}) {
  const Icon = icon && SIDEBAR_ICONS[icon];
  const {accent} = useClubAccent(slugFromHref(href));
  return (
    <span className={styles.linkLabel}>
      {Icon && (
        <Icon
          className={styles.linkIcon}
          style={{'--accent-light': accent.light, '--accent-dark': accent.dark}}
          aria-hidden="true"
        />
      )}
      <span className={styles.linkText}>{label}</span>
    </span>
  );
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) {
  const {href, label, className, autoAddBaseUrl, customProps} = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        <LinkLabel label={label} icon={customProps?.icon} href={href} />
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
