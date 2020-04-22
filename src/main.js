import Vue from 'vue'
import App from './App.vue'
import store from './store'
import VueMq from 'vue-mq'
import i18n from './i18n'
import VueClipboard from 'vue-clipboard2'

Vue.config.productionTip = false
Vue.use(VueMq, {
  breakpoints: {
    // default breakpoints - customize this
    sm: 450,
    md: 1250,
    lg: Infinity,
  },
})
Vue.use(VueClipboard)

new Vue({
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
