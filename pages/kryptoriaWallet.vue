<template>
  <v-container fluid>
    <h1>Kryptoria Wallet</h1>
    <v-row>
      <v-col cols="12" md="4" sm="4">
        <v-btn :loading="landsLoading" :href="downloadLandsUrl" download="lands.csv">Download lands</v-btn>
      </v-col>
      <v-col cols="12" md="4" sm="4">
        <v-btn :loading="weaponsLoading"  :href="downloadWeaponsUrl" download="weapons.csv">Download weapons</v-btn>
      </v-col>
      <v-col cols="12" md="4" sm="4">
        <v-btn :loading="urbanLoading"  :href="downloadUrbanUrl" download="urban.csv">Download urban info</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import { ethers } from 'ethers'
import lands from '~/static/data/lands.json'
import weapons from '~/static/data/weapons.json'
import landContractService from '@/services/landContractService'
import weaponContractService from '@/services/weaponContractService'

export default {
  name: 'KryptoriaTeamTool',
  data() {
    return {
      kryptoriaWallet: "0x360366ec43859ad640E9bbA3b8a2AF64Dc5A6E51",
      // kryptoriaWallet: "0x0c3D1c91Ac325e58A839BBdD46DDEa1FD2Da3798",
      landsLoading: false,
      weaponsLoading: false,
      urbanLoading: false,
      walletLands: [],
      walletWeapons: [],
      urbanInfo: [],
      formattedLands: [],
      formattedWeapons: []
    }
  },
  head() {
    return {
      title: 'Kryptoria Wallet',
    }
  },
  computed: {
      downloadLandsUrl() {
        return this.walletLands.length > 0 ? "data:text/csv," + encodeURIComponent(this.jsonToCsv(this.walletLands)) : 'javascript:void(0);';
      },
      downloadWeaponsUrl() {
        return this.walletWeapons.length > 0 ? "data:text/csv," + encodeURIComponent(this.jsonToCsv(this.walletWeapons)) : 'javascript:void(0);';
      },
      downloadUrbanUrl() {
        return this.urbanInfo.length > 0 ? "data:text/csv," + encodeURIComponent(this.jsonToCsv(this.urbanInfo)) : 'javascript:void(0);';
      }
  },
  mounted() {

    this.formattedLands = lands.map((land) => {
      // remove attributes array to add it as properties
      const attributes = {}

      for (const attribute of land.attributes) {
        attributes[attribute.trait_type] = attribute.value
      }
      // console.log(attributes)

      return {
        name: land.name,
        edition: land.edition,
        ...attributes,
      }
    })

    console.log(weapons)
    this.formattedWeapons = weapons.map((weapon) => {
      // remove attributes array to add it as properties
      const attributes = {}

      for (const attribute of weapon.attributes) {
        attributes[attribute.trait_type] = attribute.value
      }
      // console.log(attributes)

      return {
        name: weapon.name,
        edition: weapon.edition,
        ...attributes,
      }
    })

    // set contract
    landContractService.setContract(this.$wallet.provider)
    weaponContractService.setContract(this.$wallet.provider)

    this.generateLands()
    this.generateWeapons()
    this.generateUrbanInfo()

  },
  methods: {
    async generateLands() {
      this.landsLoading = true
      const landsCount = await landContractService.getLandsCountByOwner(
        this.kryptoriaWallet
      )
      // console.log(landsCount)

      if (landsCount === 0) {
        this.ownerLandsErrorMessage = 'Unknown address or no lands'
      }

      const promises = []
      for (let i = 0; i < landsCount; i++) {
        promises.push(
          landContractService.getLandByOwnerandIndex(this.kryptoriaWallet, i)
        )
      }

      const landIds = await Promise.all(promises)
      // console.log(landIds)

      this.walletLands = this.formattedLands.filter( l => landIds.includes(l.edition))
      // console.log(this.walletLands)
      // console.log(this.jsonToCsv(this.walletLands))
      

      this.landsLoading = false
    },
    async generateWeapons() {
      this.weaponsLoading = true

      const weaponIds = await weaponContractService.getWalletOfOwner(
        this.kryptoriaWallet
      )

      this.walletWeapons = this.formattedWeapons.filter( l => weaponIds.includes(l.edition))
      // console.log(this.walletWeapons)
      // console.log(this.jsonToCsv(this.walletWeapons))
      

      this.weaponsLoading = false
    },
    async generateUrbanInfo() {
      this.urbanLoading = true

      this.urbanInfo = await Promise.all(this.formattedLands
        .filter(l => l.Capital != null || l.City != null || l.Town != null || l.Village != null)
        .map(async l => {
          const urbanType = l.Capital != null ? 'Capital' : l.City != null ? 'City' : l.Town != null ? 'Town' : l.Village != null ? 'Village' : 'Nothing'
          const owner = await landContractService.getOwnerOfLand(l.edition)
          return {...l, owner, urbanType}
        })
      )

      this.urbanLoading = false
    },

    jsonToCsv(json){
      console.log(json)
      console.log(json[0])
      const fields = Object.keys(json[0])
      const replacer = function(key, value) { return value === null ? '' : value } 
      let csv = json.map(function(row){
        return fields.map(function(fieldName){
          return JSON.stringify(row[fieldName], replacer)
        }).join(',')
      })
      csv.unshift(fields.join(',')) // add header column
      csv = csv.join('\r\n');
      // console.log(csv)
      return csv
    }
  },
}
</script>
  
  <style scoped>