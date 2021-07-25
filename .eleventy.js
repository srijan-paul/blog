const strftime = require('strftime');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('index.html');
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addNunjucksFilter('formatDate', (date) => {
    return strftime('%B %d, %Y', date);
  });

  eleventyConfig.addNunjucksFilter('truncateString', (str) => {
    const truncateLen = 30;
    return str.length > truncateLen ? `${str.substr(0, truncateLen)}...` : str;
  });

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  return {
    dir: {
      input: '11ty',
      output: 'docs',
    },
    passthroughFileCopy: true,
  };
};
