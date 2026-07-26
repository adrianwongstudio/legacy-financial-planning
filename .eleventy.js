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
