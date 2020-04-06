import Vue from 'vue'
import App from './App.vue'
import store from './store'
import VueMq from 'vue-mq'

Vue.config.productionTip = false
Vue.use(VueMq, {
  breakpoints: {
    // default breakpoints - customize this
    sm: 450,
    md: 1250,
    lg: Infinity,
  },
})

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
