<template>
  <v-app dark>
    <AppHeader></AppHeader>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
   
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
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
