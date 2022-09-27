

<template>
    <v-app-bar app>

      <v-toolbar-title v-text="title" />
      <v-spacer />

      <!-- <v-btn
          color="primary"
          :disabled="!!$wallet.account"
          @click="$wallet.connect">
          <strong>{{
              !!$wallet.account ? $wallet.accountCompact : 'Connect Wallet'
          }}</strong>
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