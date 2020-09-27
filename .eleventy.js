const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('css');
  
  syntaxHighlight.hooks.add('before-sanity-check', function (env) {
    env.code = env.element.innerText;
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  return {
    dir: {
      input: '11ty',
      outputL: '_site',
    },
    passthroughFileCopy: true,
  };
};
