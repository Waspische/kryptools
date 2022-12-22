

<template>
  <v-app-bar app>
    <v-toolbar-title v-text="title" />
    <v-btn class="mx-4" color="info" to="/fightSimulator">
      <strong>Go to fight simulation</strong>
    </v-btn>
    <v-spacer />
    <a href="https://ko-fi.com/kryptools" target="_blank"
      ><img
        height="48"
        style="border: 0px; height: 48px"
        src="https://storage.ko-fi.com/cdn/kofi4.png?v=3"
        border="0"
        alt="Buy Me a Coffee at ko-fi.com"
    /></a>

    <!-- <v-btn
          color="primary"
          :disabled="!!$wallet.account"
          @click="$wallet.connect">
          <strong>{{
              !!$wallet.account ? $wallet.accountCompact : 'Connect Wallet'
          }}</strong>
      </v-btn> -->

    <!-- <v-btn
          color="primary"
          :disabled="!$wallet.account"
          @click="$wallet.sign">
          <strong>Sign</strong>
      </v-btn> -->
  </v-app-bar>
</template>


<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
      ],
      title: 'Kryptools - v.0.0.1',
    }
  },
}
</script>