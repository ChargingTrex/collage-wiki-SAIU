// Reads blog post frontmatter directly from `blog/` at build time and groups
// posts by tag (club, fest, event-type — whatever `blog/tags.yml` defines),
// plus a single date-sorted list for "recent activity" style views.
//
// Deliberately tag-agnostic: it doesn't know what a "club" is, it just groups
// by whatever tags a post carries. That's what lets the per-club Events page,
// the homepage recent-activity strip, and a future sitewide Archives page all
// read from the same `usePluginData('club-events-plugin')` call with zero
// plugin changes.
//
// This duplicates (rather than imports) the blog plugin's own permalink
// algorithm, because @docusaurus/plugin-content-blog doesn't expose its
// content to other plugins. Parity with it matters: this site has
// `onBrokenLinks: 'throw'`, so a permalink that drifts from what the blog
// plugin actually serves becomes a hard build failure, not a cosmetic bug.
// Source of truth being mirrored: @docusaurus/plugin-content-blog/lib/blogUtils.js
// (`DATE_FILENAME_REGEX` / `parseBlogFileName` / permalink construction).
// Re-diff against that file on any Docusaurus version bump.

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import {
  Globby,
  parseMarkdownFile,
  DEFAULT_PARSE_FRONT_MATTER,
  isDraft,
  isUnlisted,
  normalizeUrl,
} from '@docusaurus/utils';

// Matches docusaurus.config.js's blog preset config, which doesn't set
// `routeBasePath` (defaults to 'blog'). Hardcoded rather than introspected
// from config — not worth the complexity for a single-blog-instance site.
const BLOG_ROUTE_BASE_PATH = 'blog';

const DATE_FILENAME_REGEX =
  /^(?<folder>.*)(?<date>\d{4}[-/]\d{1,2}[-/]\d{1,2})[-/]?(?<text>.*?)(?:\/index)?\.mdx?$/;

function parseBlogFileName(relativePath) {
  const match = relativePath.match(DATE_FILENAME_REGEX);
  if (match) {
    const {folder, text, date: dateString} = match.groups;
    // Always treat dates as UTC by adding the `Z`, same as upstream.
    const date = new Date(`${dateString}Z`);
    const slugDate = dateString.replace(/-/g, '/');
    return {date, text, slug: `/${slugDate}/${folder}${text}`};
  }
  const text = relativePath.replace(/(?:\/index)?\.mdx?$/, '');
  return {date: undefined, text, slug: `/${text}`};
}

export default function clubEventsPlugin(context) {
  const blogDir = path.join(context.siteDir, 'blog');

  return {
    name: 'club-events-plugin',

    async loadContent() {
      const tagsRaw = await fs.readFile(path.join(blogDir, 'tags.yml'), 'utf-8');
      const tagsMeta = yaml.load(tagsRaw) ?? {};

      const relativePaths = await Globby(['**/*.md', '**/*.mdx'], {cwd: blogDir});

      const posts = [];
      for (const relativePathRaw of relativePaths) {
        const relativePath = relativePathRaw.split(path.sep).join('/');
        const absolutePath = path.join(blogDir, relativePathRaw);
        const fileContent = await fs.readFile(absolutePath, 'utf-8');
        const {frontMatter, contentTitle, excerpt} = await parseMarkdownFile({
          filePath: absolutePath,
          fileContent,
          parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
          removeContentTitle: true,
        });

        if (isDraft({frontMatter}) || isUnlisted({frontMatter})) {
          continue;
        }

        const parsedFileName = parseBlogFileName(relativePath);

        let date;
        if (frontMatter.date) {
          date =
            typeof frontMatter.date === 'string'
              ? new Date(`${frontMatter.date}Z`)
              : frontMatter.date;
        } else if (parsedFileName.date) {
          date = parsedFileName.date;
        } else {
          // Last resort — only affects our own sort order, not any URL, so
          // it doesn't need to match the blog plugin's more elaborate
          // (git-vcs-aware) fallback.
          date = (await fs.stat(absolutePath)).birthtime;
        }

        const slug = frontMatter.slug ?? parsedFileName.slug;
        const permalink = normalizeUrl(['/', BLOG_ROUTE_BASE_PATH, slug]);
        const title = frontMatter.title ?? contentTitle ?? parsedFileName.text;
        const description = frontMatter.description ?? excerpt ?? '';

        const tagIds = Array.isArray(frontMatter.tags) ? frontMatter.tags : [];
        const tags = tagIds.map((tagId) => ({
          tag: tagId,
          label: tagsMeta[tagId]?.label ?? tagId,
          permalink: normalizeUrl([
            '/',
            BLOG_ROUTE_BASE_PATH,
            'tags',
            tagsMeta[tagId]?.permalink ?? `/${tagId}`,
          ]),
        }));

        posts.push({
          id: permalink,
          title,
          date: date.toISOString(),
          permalink,
          description,
          tags,
        });
      }

      posts.sort((a, b) => (a.date < b.date ? 1 : -1));

      const postsByTag = {};
      for (const post of posts) {
        for (const {tag} of post.tags) {
          (postsByTag[tag] ??= []).push(post);
        }
      }

      return {posts, postsByTag, tagsMeta};
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },

    getPathsToWatch() {
      return [
        path.join(blogDir, '**/*.md'),
        path.join(blogDir, '**/*.mdx'),
        path.join(blogDir, 'tags.yml'),
      ];
    },
  };
}
