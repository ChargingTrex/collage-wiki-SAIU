#!/usr/bin/env node
// scripts/rollover.mjs
//
// Snapshots an outgoing club board / fest organisation committee into a
// permanent docs/archive/<slug>/<year>-board|committee.mdx file, then resets
// src/data/teams/<slug>.mjs to a fresh placeholder for the incoming team.
// See docs/resources/leadership-rollover.mdx for the plain-language guide,
// or CONTRIBUTING.md's "Leadership rollover" section for the manual
// (no-script) fallback and full design rationale.
//
// Usage:
//   npm run rollover -- club art-club 2025-26
//   npm run rollover -- fest tech-fest 2025-26 --dry-run
//   npm run rollover -- club art-club 2025-26 --force
//
// Standalone Node process (not run through Docusaurus's own config loader),
// so it uses Node's native import(). package.json has no "type": "module",
// meaning bare .js is parsed as CommonJS by default and would throw on the
// `export const` syntax in src/data/teams/*.mjs — .mjs is unconditionally
// ESM regardless of package.json, which is why every data file this script
// touches uses that extension. Slug validation below checks the filesystem
// directly rather than importing clubDirectory.js/clubAccents.js, which are
// plain .js files with the exact same CJS-parsing problem.

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const festMetaPath = path.join(ROOT, 'src', 'data', 'festMeta.mjs');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));
const DRY_RUN = flags.has('--dry-run');
const FORCE = flags.has('--force');

const [type, slug, outgoingYear] = positional;

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

// Step 1 — validate type + year shape.
if (type !== 'club' && type !== 'fest') {
  fail(`First argument must be "club" or "fest" (got: ${type ?? '(none)'}).`);
}
if (!slug) {
  fail('Missing <slug> argument.');
}
if (!outgoingYear || !/^\d{4}(-\d{2})?$/.test(outgoingYear)) {
  fail(`<outgoingYear> must look like "2025-26" or a single year like "2026" (got: ${outgoingYear ?? '(none)'}).`);
}

// Step 2 — validate slug via the filesystem, not by importing clubDirectory.js/
// clubAccents.js (same CJS-parsing risk as above).
const teamFilePath = path.join(ROOT, 'src', 'data', 'teams', `${slug}.mjs`);
if (!fs.existsSync(teamFilePath)) {
  fail(`No src/data/teams/${slug}.mjs — is "${slug}" a real club/fest slug?`);
}

// Step 3.
const suffix = type === 'club' ? 'board' : 'committee';
const heading = type === 'club' ? 'Board' : 'Organisation Committee';

async function main() {
  // Step 4 — load current team, validate shape.
  const teamModule = await import(pathToFileURL(teamFilePath));
  const CURRENT_TEAM = teamModule.CURRENT_TEAM;

  if (!Array.isArray(CURRENT_TEAM) || CURRENT_TEAM.length === 0) {
    fail(`src/data/teams/${slug}.mjs must export a non-empty CURRENT_TEAM array.`);
  }
  for (const member of CURRENT_TEAM) {
    if (!member.name || !member.role) {
      fail(`Every member needs a non-empty name + role. Found: ${JSON.stringify(member)}`);
    }
  }

  const hasPlaceholderData = CURRENT_TEAM.some(
    (m) => m.name.includes('PLACEHOLDER') || m.role.includes('PLACEHOLDER')
  );
  if (hasPlaceholderData && !FORCE && !DRY_RUN) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolve) => {
      rl.question(
        `\n⚠ src/data/teams/${slug}.mjs still has PLACEHOLDER_* data — snapshot it anyway? [y/N] `,
        resolve
      );
    });
    rl.close();
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('Aborted — no files changed.');
      process.exit(0);
    }
  }

  // Step 5 — refuse to clobber an existing snapshot.
  const archiveDir = path.join(ROOT, 'docs', 'archive', slug);
  const snapshotPath = path.join(archiveDir, `${outgoingYear}-${suffix}.mdx`);
  if (fs.existsSync(snapshotPath)) {
    fail(`${path.relative(ROOT, snapshotPath)} already exists — archive files are permanent and never overwritten. Pick a different year, or this rollover already happened.`);
  }

  // Step 6 — bootstrap docs/archive/<slug>/_category_.json if this slug has
  // never been rolled over before.
  const categoryPath = path.join(archiveDir, '_category_.json');
  let categoryJson = null;
  if (!fs.existsSync(categoryPath)) {
    let label, description, icon;
    if (type === 'club') {
      const clubCategoryPath = path.join(ROOT, 'docs', 'clubs', slug, '_category_.json');
      if (!fs.existsSync(clubCategoryPath)) {
        fail(`No docs/clubs/${slug}/_category_.json to source the archive category's label/icon from.`);
      }
      const clubCategory = JSON.parse(fs.readFileSync(clubCategoryPath, 'utf-8'));
      label = `${clubCategory.label} Archive`;
      description = `Past boards for the ${clubCategory.label}, one file per year.`;
      icon = clubCategory.customProps?.icon;
    } else {
      const { FEST_META } = await import(pathToFileURL(festMetaPath));
      const meta = FEST_META[slug];
      if (!meta) {
        fail(`No FEST_META["${slug}"] entry in src/data/festMeta.mjs.`);
      }
      label = `${meta.title} Archive`;
      description = `Past organisation committees for ${meta.title}, one file per year.`;
      icon = meta.icon;
    }
    categoryJson = {
      label,
      description,
      customProps: { icon },
      link: {
        type: 'generated-index',
        slug: `/archive/${slug}`,
        description,
      },
    };
  }

  // Step 7 — the snapshot file itself.
  const title =
    type === 'club'
      ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'clubs', slug, '_category_.json'), 'utf-8')).label
      : (await import(pathToFileURL(festMetaPath))).FEST_META[slug].title;

  // Explicit `slug:` — Docusaurus strips a leading NNNN-word pattern from a
  // doc's default slug (meant for manual-ordering filenames like
  // "01-intro.md"), but only *protects* NNNN-NN-word patterns as
  // date/version-like (confirmed in its own numberPrefix.ts source). A
  // year-range outgoingYear like "2025-26" is protected; a single-year one
  // like "2026" is not, and would silently lose the year from the URL
  // (worse: two single-year rollovers for the same slug would collide on
  // the same stripped slug). Setting `slug:` explicitly sidesteps this
  // entirely, for both formats.
  const snapshotContent = `---
title: ${title} — ${outgoingYear} ${heading}
description: Archived ${title} ${heading.toLowerCase()} for ${outgoingYear}.
slug: ${outgoingYear}-${suffix}
---

import { TeamSection } from '@site/src/components/TeamSection';

## ${outgoingYear} ${heading}

<TeamSection
  clubSlug="${slug}"
  members={${JSON.stringify(CURRENT_TEAM, null, 2).split('\n').join('\n  ')}}
/>
`;

  // Step 8 — fresh placeholder template for the incoming team.
  const roleExamples =
    type === 'club'
      ? ['President', 'Vice President', 'Secretary']
      : ['Fest Director', 'Operations Lead', 'Sponsorship Lead'];
  const freshTeamContent = `// src/data/teams/${slug}.mjs
//
// Current ${title} ${heading === 'Board' ? 'board' : heading.toLowerCase()}. Snapshotted into
// docs/archive/${slug}/ at rollover (see scripts/rollover.mjs), then reset to
// this same placeholder shape for the incoming team — see CONTRIBUTING.md's
// "Leadership rollover" section.
//
// name + role are mandatory; photo + contact are optional. PLACEHOLDER_*
// values follow the same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these.

export const CURRENT_TEAM = [
  { name: 'PLACEHOLDER_NAME_1', role: 'PLACEHOLDER_ROLE (e.g. ${roleExamples[0]})' },
  {
    name: 'PLACEHOLDER_NAME_2',
    role: 'PLACEHOLDER_ROLE (e.g. ${roleExamples[1]})',
    // Both optional fields demonstrated once, here, rather than duplicated
    // as fake data across every team file:
    photo: '/img/team/placeholder-avatar.svg',
    contact: { email: 'placeholder@example.com', instagram: null, linkedin: null },
  },
  { name: 'PLACEHOLDER_NAME_3', role: 'PLACEHOLDER_ROLE (e.g. ${roleExamples[2]})' },
];
`;

  if (DRY_RUN) {
    console.log('\n[dry run] Would write:');
    if (categoryJson) console.log(`  ${path.relative(ROOT, categoryPath)}`);
    console.log(`  ${path.relative(ROOT, snapshotPath)}`);
    console.log(`  ${path.relative(ROOT, teamFilePath)} (reset to fresh placeholder)`);
    console.log('\nNo files were changed.\n');
    return;
  }

  fs.mkdirSync(archiveDir, { recursive: true });
  if (categoryJson) {
    fs.writeFileSync(categoryPath, JSON.stringify(categoryJson, null, 2) + '\n');
  }
  fs.writeFileSync(snapshotPath, snapshotContent);
  fs.writeFileSync(teamFilePath, freshTeamContent);

  console.log(`\n✔ Archived ${outgoingYear} ${heading.toLowerCase()} for "${slug}":`);
  if (categoryJson) console.log(`  created ${path.relative(ROOT, categoryPath)}`);
  console.log(`  created ${path.relative(ROOT, snapshotPath)}`);
  console.log(`  reset ${path.relative(ROOT, teamFilePath)} to a fresh placeholder`);
  console.log(`\nNext step: edit ${path.relative(ROOT, teamFilePath)} with the incoming team's real names, then npm run build.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
