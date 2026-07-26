const markdownIt = require("markdown-it");
const md = markdownIt({ html: true, linkify: true, typographer: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin/config.yml");
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });
  eleventyConfig.addPassthroughCopy("src/CNAME");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("md", (str) => (str ? md.render(str) : ""));

  // Build the "posts" collection from a glob (instead of using the reserved
  // `tags: ["posts"]` frontmatter). This keeps the `tags` field 100%
  // user-facing so editor-defined tags don't collide with Eleventy's
  // internal collection identifiers.
  eleventyConfig.addCollection("posts", (collection) =>
    collection.getFilteredByGlob("src/posts/*.md")
  );

  // Group posts by category → drives the /blog/category/<slug>/ pages
  // via pagination in src/blog-category.njk. Only categories with at least
  // one post produce a page; unused categories from src/_data/categories/
  // are ignored (no empty pages).
  eleventyConfig.addCollection("postsByCategory", (collection) => {
    const buckets = new Map();
    for (const post of collection.getFilteredByGlob("src/posts/*.md")) {
      const name = post.data.category;
      if (!name) continue;
      if (!buckets.has(name)) buckets.set(name, []);
      buckets.get(name).push(post);
    }
    return Array.from(buckets, ([name, posts]) => ({ name, posts }));
  });

  // Same idea for tags — drives /blog/tag/<slug>/.
  eleventyConfig.addCollection("postsByTag", (collection) => {
    const buckets = new Map();
    for (const post of collection.getFilteredByGlob("src/posts/*.md")) {
      for (const name of post.data.tags || []) {
        if (!buckets.has(name)) buckets.set(name, []);
        buckets.get(name).push(post);
      }
    }
    return Array.from(buckets, ([name, posts]) => ({ name, posts }));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    // Path under which the site is served. Empty on custom domains,
    // "/repo-name/" on GitHub Pages project sites. Combined with the
    // `| url` filter in templates it prepends the prefix to every link.
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
};
