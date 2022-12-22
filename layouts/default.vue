<template>
  <v-app dark>
    <AppHeader></AppHeader>
    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
   
    <v-footer app>
      <span>Made with ♥ by Wasp#1975 - If it's useful for you 👉 0x0c3D1c91Ac325e58A839BBdD46DDEa1FD2Da3798 or <a target="_blank" rel="noopener noreferrer" href="https://ko-fi.com/kryptools">buy me a coffee ☕️</a></span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
import AppHeader from "../components/AppHeader.vue";
export default {
    name: "DefaultLayout",
    components: { AppHeader },
    data() {
        return {};
    }
}
</script>
