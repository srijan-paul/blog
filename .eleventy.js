const strftime = require('strftime');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('index.html');
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addNunjucksFilter('formatDate', (date) => {
    return strftime('%B %d, %Y', date);
  });

  return {
    dir: {
      input: '11ty',
      output: 'docs',
    },
    passthroughFileCopy: true,
  };
};
