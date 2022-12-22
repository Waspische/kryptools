<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-row justify="center" align="center">
    <v-col cols="12" md="12">
      <v-alert
          type="info"
          class="mx-4"
        >
          You need to have metamask installed. No need to connect.<br/>
          Sorry, can't filter for sale only because of OS limits.
      </v-alert>
    </v-col>
    <v-col cols="12" sm="10" md="6">
      <v-card>
        <v-card-title>
          Lands which did not claim weapons
        </v-card-title>
        <v-data-table
          :headers="landHeaders"
          :items="unclaimedWeaponForLand"
          :items-per-page="25"
          :loading="loadingUnclaimedLand"
          :options.sync="options"
          :server-items-length="totalLands"
          loading-text="Loading from weapon contract... Please wait"
          class="elevation-1"
          dense
        >
          <template #item.forSale="{ item }">
            {{ item.opensea && item.opensea.price ? parseInt(item.opensea.price) / 1000000000000000000 + ' eth': ''}} 
          </template>
          <template #item.opensea="{ item }">
            <v-btn
              x-small
              color="primary darken-1"
              min-width="0"
              target="_blank"
              rel="noopener noreferrer"
              :href="'https://opensea.io/assets/ethereum/'+ landContractId + '/' + item.id"
            >
              Open
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
    <v-col cols="12" sm="10" md="6">
      <v-card>
        <v-card-title>
          Citizens which did not claim weapons
        </v-card-title>
        <v-data-table
          :headers="citizenHeaders"
          :items="unclaimedWeaponForCtz"
          :items-per-page="25"
          :loading="loadingUnclaimedCtz"
          :options.sync="optionsCtz"
          :server-items-length="totalCitizens"
          loading-text="Loading from weapon contract... Please wait"
          class="elevation-1"
          dense
        >
          <template #item.forSale="{ item }">
            {{ item.opensea && item.opensea.price ? parseInt(item.opensea.price) / 1000000000000000000 + ' eth': ''}} 
          </template>
          <template #item.opensea="{ item }">
            <v-btn
              x-small
              color="primary darken-1"
              min-width="0"
              target="_blank"
              rel="noopener noreferrer"
              :href="'https://opensea.io/assets/ethereum/'+ citizenContractId + '/' + item.id"
            >
              Open
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { ethers } from 'ethers'
import citizensData from '~/static/data/citizens-data.json'
import landsData from '~/static/data/lands.json'

export default {
  name: 'IndexPage',
  data() { 
    return {
      landContractId: "0x17D084106C2f1C716ce39fa015AB022757d30C9A",
      weaponContractId: "0x1522C212757e65E18832183aB8AfE7F89B8abE0A",
      citizenContractId: "0x63d85ec7B1561818Ec03E158ec125a4113038A00",
      weaponAbi: '[{"inputs":[{"internalType":"address","name":"platformAddress_","type":"address"},{"internalType":"string","name":"notRevealURI","type":"string"},{"internalType":"uint16","name":"maxSupply_","type":"uint16"},{"internalType":"address","name":"alphaCitizen","type":"address"},{"internalType":"address","name":"land","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"uri","type":"string"}],"name":"BaseTokenURIUPDATE","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"Reveal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"StakeWeapon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleClaimWeapon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleStaking","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint16[]","name":"citizenIds","type":"uint16[]"},{"indexed":false,"internalType":"uint16[]","name":"landIds","type":"uint16[]"},{"indexed":false,"internalType":"uint256","name":"userMinted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalMinted","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UnstakeWeapon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"tokenID","type":"uint16"},{"indexed":true,"internalType":"string","name":"uri","type":"string"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UpdateWeaponURI","type":"event"},{"inputs":[],"name":"_alphaCitizen","outputs":[{"internalType":"contract KryptoriaAlphaCitizensInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_land","outputs":[{"internalType":"contract KryptoriaLandInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"citizenTokenIds","type":"uint16[]"},{"internalType":"uint16[]","name":"landTokenIds","type":"uint16[]"}],"name":"claimByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"citizenTokenIds","type":"uint16[]"},{"internalType":"uint16[]","name":"landTokenIds","type":"uint16[]"}],"name":"claimWeapon","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIds","type":"uint16[]"}],"name":"getCitizenClaimStatus","outputs":[{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIds","type":"uint16[]"}],"name":"getLandClaimStatus","outputs":[{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"getStakingStatus","outputs":[{"components":[{"internalType":"uint16","name":"tokenId","type":"uint16"},{"internalType":"bool","name":"isStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"internalType":"struct KryptoriaWeapons.StakeDetails[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"}],"name":"getStakingTime","outputs":[{"internalType":"bool","name":"isStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isClaimActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isRevealed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isStakingOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextOwnerToExplicitlySet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"notRevealedURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_baseTokenURI","type":"string"}],"name":"setBaseTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"notRevealedURI_","type":"string"}],"name":"setNotRevealedURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"platformAddress_","type":"address"}],"name":"setPlatformAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"toggleClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"toggleStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"},{"internalType":"string","name":"uri","type":"string"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"updateTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"walletOfOwner","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"}]',
      weaponContract: null,
      citizenHeaders: [
        { text: 'Citizen Id', value: 'id' },
        { text: 'For Sale', value: 'forSale', sortable: false },
        { text: 'Armor', value: 'armour' },
        { text: 'Helmet', value: 'helmet' },
        { text: 'Opensea', value: 'opensea' }
      ],
      landHeaders: [
        { text: 'Land Id', value: 'id' },
        { text: 'For Sale', value: 'forSale', sortable: false },
        { text: 'Resource', value: 'resource' },
        { text: 'Rarity', value: 'rarity' },
        { text: 'Opensea', value: 'opensea' }
      ],
      totalCitizens: 0,
      totalLands: 0,
      unclaimedWeaponForCtz: [],
      unclaimedWeaponForLand: [],
      loadingUnclaimedCtz: false,
      loadingUnclaimedLand: false,
      options: {},
      optionsCtz: {}
    }
  },
  head () {
    return {
      title: 'Citizen and Land for Weapons '
    }
  },
  watch: {
    options: {
      handler () {
        this.aggregateLandData()
      },
      deep: true,
    },
    optionsCtz: {
      handler () {
        this.aggregateCitizenData()
      },
      deep: true,
    }
  },
  mounted() {
    // console.log(this.$wallet)

    const weaponAbi = JSON.parse(this.weaponAbi)

    this.weaponContract = new ethers.Contract(this.weaponContractId, weaponAbi, this.$wallet.provider)

  },
  methods: {
    async aggregateLandData () {
      this.loadingUnclaimedLand = true
      const { sortBy, sortDesc, page, itemsPerPage } = this.options

      let items = await this.getUnclaimedLands()
      const total = items.length

      if (sortBy.length === 1 && sortDesc.length === 1) {
        items = items.sort((a, b) => {
          const sortA = a[sortBy[0]]
          const sortB = b[sortBy[0]]

          if (sortDesc[0]) {
            if (sortA < sortB) return 1
            if (sortA > sortB) return -1
            return 0
          } else {
            if (sortA < sortB) return -1
            if (sortA > sortB) return 1
            return 0
          }
        })
      }

      if (itemsPerPage > 0) {
        items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      }

      // update list with opensea data

      const openSeaInfo = await this.getOpenseaInfo(items, this.landContractId)

      // console.log(openSeaInfo)

      // set unclaimed citizens
      this.totalLands = total
      this.loadingUnclaimedLand = false
      this.unclaimedWeaponForLand = items.map (item => { 
        return {
          ...item,
          opensea: openSeaInfo.find(os => os.id === item.id.toString())
        }
      })

      return {
          items,
          total,
        }
    },
    async aggregateCitizenData () {
      console.log('aggregateCitizenData')
      this.loadingUnclaimedCtz = true
      const { sortBy, sortDesc, page, itemsPerPage } = this.optionsCtz

      let items = await this.getUnclaimedCitizens()
      const total = items.length

      if (sortBy.length === 1 && sortDesc.length === 1) {
        items = items.sort((a, b) => {
          const sortA = a[sortBy[0]]
          const sortB = b[sortBy[0]]

          if (sortDesc[0]) {
            if (sortA < sortB) return 1
            if (sortA > sortB) return -1
            return 0
          } else {
            if (sortA < sortB) return -1
            if (sortA > sortB) return 1
            return 0
          }
        })
      }

      if (itemsPerPage > 0) {
        items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      }

      // update list with opensea data

      const openSeaInfo = await this.getOpenseaInfo(items, this.citizenContractId)

      // console.log(openSeaInfo)

      // set unclaimed citizens
      this.totalCitizens = total
      this.loadingUnclaimedCtz = false
      this.unclaimedWeaponForCtz = items.map (item => { 
        return {
          ...item,
          opensea: openSeaInfo.find(os => os.id === item.id.toString())
        }
      })

      return {
          items,
          total,
        }
    },
    async getUnclaimedCitizens(){

      const ctzIds = []
      for (let i = 0; i < 10000; i++) {
        ctzIds.push(i)
      }

      // load status from land contract
      const status = await this.weaponContract.getCitizenClaimStatus(ctzIds)

      // map citizen id with status and citizen data
      const unclaimedWeaponForCtz = citizensData.map((ctzData) => {
        const boolResult = status[parseInt(ctzData.id)]
        return {
          isClaimed: boolResult,
          id: parseInt(ctzData.id),
          armour: ctzData.armour,
          helmet: ctzData.helmet
        }
      })

      // update list with only unclaimed citizens
      return unclaimedWeaponForCtz.filter(ctz => ctz.isClaimed === false)
      // console.log(result)
      // console.log(this.unclaimedLandForCtz.map(r=>r.citizenId).toString())
    },
    async getUnclaimedLands(){

      const landIds = []
      for (let i = 0; i < 10000; i++) {
        landIds.push(i)
      }

      // load status from land contract
      const status = await this.weaponContract.getLandClaimStatus(landIds)

      // console.log(status)

      // map citizen id with status and citizen data
      const unclaimedWeaponForLand = landsData.map((landData) => {
        const boolResult = status[landData.edition]
        return {
          isClaimed: boolResult,
          id: landData.edition,
          resource: landData.attributes.find(a => a.trait_type === 'RESOURCE').value,
          rarity: landData.attributes.find(a => a.trait_type === 'RARITY').value
        }
      })

      // update list with only unclaimed citizens
      return unclaimedWeaponForLand.filter(land => land.isClaimed === false)
      // console.log(result)
      // console.log(this.unclaimedLandForCtz.map(r=>r.citizenId).toString())
    },
    async getOpenseaInfo(items, contract){

      const ids = items.map(item => item.id)

      let idsString = ''
      for (let i = 0; i < ids.length; i++) {
        if(idsString.length !== 0){
          idsString += '&'
        }
        idsString += 'token_ids=' + ids[i]
      }
      // console.log(idsString)

      const options = {method: 'GET', headers: {accept: 'application/json', 'X-API-KEY': ' '}};

      const response = await fetch('https://api.opensea.io/api/v1/assets?' + 
        idsString + 
        '&order_direction=desc'+ 
        '&asset_contract_address=' + contract + 
        '&limit=50&include_orders=true', options)

      // console.log(response)

      const openseaData = await response.json()
      console.log(openseaData)

      return openseaData.assets.map(asset => {
        return {
          id: asset.token_id,
          ownerAddress: asset.owner.address,
          ownerName: asset.owner.user ? asset.owner.user.username : '',
          price: asset.seaport_sell_orders ? asset.seaport_sell_orders[0].current_price : null
        }
      })
    }
  },
}
</script>
