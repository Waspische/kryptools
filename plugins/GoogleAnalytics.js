import Vue from 'vue'
import VueGtag from 'vue-gtag'

export default ({ app }) => {
  Vue.use(VueGtag, {
    config: { id: 'G-EWYGZ2XPDW' },
    appName: 'Kryptools',
    pageTrackerScreenviewEnabled: true
  }, app.router)
}
