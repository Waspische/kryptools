<template>
  <v-app dark>
    <AppHeader></AppHeader>
    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
   
    <v-footer app>
      <span>Made with ♥ by Wasp#1975 - If it's useful for you 👉 0x0c3D1c91Ac325e58A839BBdD46DDEa1FD2Da3798</span>
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
