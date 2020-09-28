const strftime = require('strftime');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addNunjucksFilter('formatDate', (date) => {
    return strftime('%B %d, %Y', date);
  });

  return {
    dir: {
      input: '11ty',
      output: 'blog',
    },
    passthroughFileCopy: true,
  };
};
