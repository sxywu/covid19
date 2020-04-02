module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/covid19/' : '/',
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/_variables.scss";`,
      },
    },
  },
}
