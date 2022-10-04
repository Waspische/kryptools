<template>
  <v-container fluid>
    <h1>Staked citizens for sale</h1>
    <v-row>
      <v-col  cols="12" md="4" sm="4">
        <v-card
          class="mx-auto overflow-y-auto"
          max-width="400"
          min-height="200"
          max-height="800"
          tile
        >
          <v-card-title>For sale ({{forSale.length}})</v-card-title>
          <v-list nav dense>
            <v-list-item v-for="item in forSale" :key="item.id">
              <v-list-item-content>
                <v-list-item-title
                  >{{ item.id }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-overlay
            v-if="loadingOS"
            absolute
            color="#036358"
          >
          Page {{ OSpage }} / 334
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>
      <v-col  cols="12" md="4" sm="4">
        <v-card
          class="mx-auto overflow-y-auto"
          max-width="400"
          min-height="200"
          max-height="800"
          tile
        >
          <v-card-title>Staked ({{staked.length}})</v-card-title>
          <v-list nav dense>
            <v-list-item v-for="item in staked" :key="item.id">
              <v-list-item-content>
                <v-list-item-title
                  >{{ item.id }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-overlay
            v-if="loadingContract"
            absolute
            color="#036358"
          >
          Id {{ contractPage }} / 10 000
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>
      <v-col  cols="12" md="4" sm="4">
        <v-card
          class="mx-auto overflow-y-auto"
          max-width="400"
          min-height="200"
          max-height="800"
          tile
        >
          <v-card-title>Staked for sale ({{stakedForSale.length}})</v-card-title>
          <v-list nav dense>
            <v-list-item v-for="item in stakedForSale" :key="item.id">
              <v-list-item-content>
                <v-list-item-title
                  >{{ item.id }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-overlay
            v-if="loadingStakedForSale"
            absolute
            color="#036358"
          >
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ethers } from 'ethers'

export default {
    name: 'StakedCitizens',
    data() {
      return {
        forSale: [],
        staked: [],      
        stakedForSale: [],      
        citizenContract: null,
        contractId: '0x63d85ec7b1561818ec03e158ec125a4113038a00',
        citizenABI: '[{"inputs":[{"internalType":"address","name":"platformAddress","type":"address"},{"internalType":"string","name":"notRevealURI","type":"string"},{"internalType":"uint16","name":"maxSupply_","type":"uint16"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"uri","type":"string"}],"name":"BaseTokenURIUPDATE","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"limit","type":"uint8"}],"name":"MintLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"Reveal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"StakeNFT","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"TogglePreSale","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"TogglePublicSale","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleStaking","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"userMinted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalMinted","type":"uint256"}],"name":"TokenCount","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UnstakeNFT","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"tokenId","type":"uint16"},{"indexed":false,"internalType":"string","name":"uri","type":"string"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UpdateTokenURI","type":"event"},{"inputs":[],"name":"_isPreSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_isPublicSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_merkleRoot","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_notRevealedURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_platformAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_revealed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_stakingOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"}],"name":"getStakingTime","outputs":[{"internalType":"bool","name":"isNftStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"isUserWhitelisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextOwnerToExplicitlySet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"quantity","type":"uint8"},{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"preSaleSafeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"quantity","type":"uint8"}],"name":"safeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_baseTokenURI","type":"string"}],"name":"setBaseTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"}],"name":"setMerkleRoot","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"mintlimit","type":"uint8"}],"name":"setMintLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"notRevealedURI","type":"string"}],"name":"setNotRevealedURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"platformAddress","type":"address"}],"name":"setPlatformAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"togglePreSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"togglePublicSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"toggleStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"},{"internalType":"string","name":"uri","type":"string"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"updateTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
        loadingOS: true,
        OSpage: 0,
        contractPage: 0,
        loadingContract: true,
        loadingStakedForSale: true,
        ids: []
      }
    },
    head() {
      return {
        title: 'Staked Citizens',
      }
    },
    mounted() {

        // init ids
        const ids = []
        for (let i = 1; i <= 10000; i++) {
            ids.push(i)
        }
        this.ids = ids

        // init ether.js
        const citizenABI = JSON.parse(this.citizenABI)
        this.citizenContract = new ethers.Contract(this.contractId, citizenABI, this.$wallet.provider)

        // query data
        this.getContractInfo()
        // await Promise.all([this.getOpenseaInfo(), this.getContractInfo()]);

        // this.getStakedForSale()

        console.log('coucou')

    },
    methods: {
        async getOpenseaInfo() {

            let result = []

            // batchs of 30
            const size = 30
            let page = this.OSpage
            const limit = 10000

            const promises = []

            while(page*size <= limit){
                // console.log('page ' + page)
                const batchIds = this.ids.slice(page*size, page*size+size)

                let idsString = ''
                for (let i = 0; i < batchIds.length; i++) {
                    if (idsString.length !== 0) {
                    idsString += '&'
                    }
                    idsString += 'token_ids=' + batchIds[i]
                }
                // console.log(idsString)

                const options = {
                    method: 'GET',
                    headers: { accept: 'application/json', 'X-API-KEY': ' ' },
                }

                promises.push(fetch(
                    'https://api.opensea.io/api/v1/assets?' +
                    idsString +
                    '&order_direction=desc' +
                    '&asset_contract_address=' +
                    this.contractId +
                    '&limit=50&include_orders=true',
                    options
                ))

                page++
                this.OSpage = page
                await this.sleep(250)
            }

            const responses = await Promise.all(promises)

            result = await Promise.all(responses.map(async (r) => {
                // console.log(response)

                const openseaData = await r.json()
                // console.log('openseaData')
                // console.log(openseaData)

                const data = openseaData.assets.map((asset) => {
                    return {
                    id: asset.token_id,
                    price: asset.seaport_sell_orders
                        ? asset.seaport_sell_orders[0].current_price
                        : null,
                    }

                })
                // console.log('data')
                // console.log(data)

                return data
            }))


            // console.log('result')
            // console.log(result.flat())

            this.loadingOS = false
            this.forSale = result.flat().filter(i => i.price != null)
        },
        async getContractInfo(){
            const limit = 10000
            const result = []
            // for (let i = 0; i < this.ids.length; i++) {
            for (let i = 0; i < limit; i++) {
                this.contractPage = i+1
                // console.log(i)
                const response = await this.citizenContract.getStakingTime(this.ids[i])
                result.push({
                    staked: response[0],
                    id: this.ids[i]
                })
            }
            // console.log(result)
            this.loadingContract = false
            this.staked = result.filter(i=>i.staked)
        },
        getStakedForSale(){
            this.stakedForSale = this.staked.filter(value => 
                this.forSale.filter(fs => value.id === fs.id).length > 0
            );
            this.loadingStakedForSale = false
        },
        async sleep (ms) {
            await new Promise(resolve => setTimeout(resolve, ms));
        }
    }
  }
  </script>
  
  <style scoped>