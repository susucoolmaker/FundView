module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      unitToConvert: 'px',
      viewportWidth: 750,
      unitPrecision: 6,
      propList: ['*'],
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore-vw'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/],
    },
  },
}
