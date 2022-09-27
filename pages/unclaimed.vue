<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="10" md="8">
      
      <v-card>
        <v-card-title>
          Citizen which did not claimed land
        </v-card-title>
        <v-alert
          type="info"
          class="mx-4"
        >
          You need to have metamask installed. No need to connect.<br/>
          Sorry, can't filter for sale only because of OS limits.
        </v-alert>
        <v-data-table
          :headers="headers"
          :items="unclaimedLandForCtz"
          :items-per-page="25"
          :loading="loadingUnclaimed"
          :options.sync="options"
          :server-items-length="totalCitizens"
          loading-text="Loading from land contract... Please wait"
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
              :href="'https://opensea.io/assets/ethereum/0x63d85ec7b1561818ec03e158ec125a4113038a00/' + item.citizenId"
            >
              Open
            </v-btn>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer />
          <!-- <v-btn color="primary" :loading="loadingUnclaimed" @click="getUnclaimed"> Get Unclaimed </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { ethers } from 'ethers'
import citizensData from '~/static/data/citizens-data.json'

export default {
  name: 'IndexPage',
  data() { 
    return {
      landContractId: "0x17D084106C2f1C716ce39fa015AB022757d30C9A",
      citizenContractId: "0x63d85ec7B1561818Ec03E158ec125a4113038A00",
      landABI: '[{"inputs":[{"internalType":"address","name":"platformAddress_","type":"address"},{"internalType":"string","name":"notRevealURI","type":"string"},{"internalType":"uint16","name":"maxSupply_","type":"uint16"},{"internalType":"address","name":"alphaCitizen","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"uri","type":"string"}],"name":"BaseTokenURIUPDATE","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"Reveal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"StakeLand","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleClaimLand","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleStaking","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint16[]","name":"citizentokenIDs","type":"uint16[]"},{"indexed":false,"internalType":"uint256","name":"userMinted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalMinted","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UnstakeLand","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"tokenID","type":"uint16"},{"indexed":true,"internalType":"string","name":"uri","type":"string"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UpdateLandURI","type":"event"},{"inputs":[],"name":"_alphaCitizen","outputs":[{"internalType":"contract KryptoriaAlphaCitizensInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"citizenTokenIds","type":"uint16[]"}],"name":"claimByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"citizenTokenIds","type":"uint16[]"}],"name":"claimLand","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIds","type":"uint16[]"}],"name":"getClaimStatus","outputs":[{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"getStakingStatus","outputs":[{"components":[{"internalType":"uint16","name":"tokenId","type":"uint16"},{"internalType":"bool","name":"isStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"internalType":"struct KryptoriaLand.StakeDetails[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"}],"name":"getStakingTime","outputs":[{"internalType":"bool","name":"isStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isClaimActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isRevealed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isStakingOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextOwnerToExplicitlySet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"notRevealedURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_baseTokenURI","type":"string"}],"name":"setBaseTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"notRevealedURI_","type":"string"}],"name":"setNotRevealedURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"platformAddress_","type":"address"}],"name":"setPlatformAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"toggleClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"toggleStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"},{"internalType":"string","name":"uri","type":"string"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"updateTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
      landContract: null,
      unclaimedCitizenIds: [8,9,10,26,27,28,42,51,56,57,58,73,75,76,80,81,82,188,189,190,203,204,205,213,233,234,235,257,258,259,263,264,265,299,300,301,305,306,307,314,315,316,323,324,325,330,344,345,346,359,360,361,368,369,370,371,372,373,380,381,382,383,384,385,395,396,397,416,417,418,455,456,457,488,489,490,491,492,493,518,519,520,524,525,526,563,564,565,572,573,574,589,602,603,604,638,639,640,656,657,658,668,669,670,677,678,679,695,696,697,710,711,712,734,735,736,752,753,754,756,757,758,759,760,779,780,781,812,813,817,818,819,820,821,822,826,833,834,835,836,837,838,848,849,850,857,858,859,872,873,874,887,888,889,899,900,901,902,903,904,905,906,907,908,909,910,920,921,922,923,924,925,935,936,937,938,939,940,941,942,943,944,945,946,959,960,961,962,963,964,971,972,973,992,993,994,995,996,997,998,999,1000,1004,1005,1006,1007,1008,1009,1025,1026,1027,1028,1029,1030,1046,1047,1048,1064,1065,1066,1076,1077,1078,1079,1080,1081,1085,1086,1087,1088,1089,1090,1094,1095,1096,1097,1098,1099,1100,1101,1102,1106,1107,1108,1117,1124,1125,1126,1127,1128,1129,1136,1137,1138,1142,1143,1144,1148,1149,1150,1154,1155,1156,1157,1158,1159,1163,1164,1165,1166,1167,1168,1181,1182,1183,1190,1191,1192,1194,1196,1197,1198,1199,1200,1201,1216,1240,1283,1338,1354,1356,1390,1391,1396,1397,1398,1402,1459,1460,1464,1465,1474,1475,1517,1563,1616,1617,1640,1641,1646,1647,1658,1659,1668,1670,1671,1704,1705,1708,1709,1766,1767,1771,1780,1781,1784,1797,1798,1815,1816,1821,1837,1838,1889,1900,1901,1906,1907,1913,1964,1965,1997,2004,2005,2022,2026,2036,2053,2061,2062,2063,2066,2072,2081,2082,2092,2105,2115,2128,2142,2190,2228,2242,2282,2286,2308,2336,2363,2368,2369,2370,2373,2378,2379,2386,2407,2413,2420,2448,2459,2462,2476,2486,2496,2508,2510,2511,2518,2522,2524,2533,2548,2556,2571,2579,2580,2590,2597,2604,2688,2703,2704,2716,2731,2777,2784,2793,2806,2817,2825,2833,2845,2884,2893,2921,2943,2985,2992,3019,3046,3047,3048,3059,3060,3085,3103,3111,3125,3151,3154,3168,3173,3175,3204,3205,3250,3255,3256,3283,3297,3303,3311,3328,3333,3334,3337,3350,3360,3392,3441,3447,3482,3493,3513,3524,3525,3537,3544,3558,3562,3572,3573,3585,3612,3619,3622,3623,3668,3673,3678,3682,3697,3706,3720,3723,3781,3791,3798,3808,3812,3825,3826,3863,3893,3906,3924,3928,3941,3948,4005,4006,4007,4011,4012,4036,4062,4090,4097,4101,4110,4115,4117,4120,4123,4124,4136,4143,4144,4162,4169,4170,4194,4209,4212,4213,4238,4255,4259,4260,4266,4269,4273,4276,4281,4282,4313,4314,4327,4356,4360,4362,4377,4378,4423,4456,4459,4463,4473,4475,4477,4486,4492,4495,4507,4509,4511,4515,4516,4518,4519,4529,4539,4543,4559,4588,4590,4600,4619,4625,4632,4637,4638,4679,4714,4719,4720,4723,4727,4731,4732,4735,4736,4739,4740,4750,4758,4785,4791,4799,4827,4846,4849,4857,4858,4860,4869,4870,4881,4882,4889,4890,4900,4909,4910,4911,4920,4925,4940,4945,4947,4961,4962,4965,4967,4968,4985,4986,4991,4994,5012,5016,5017,5048,5051,5052,5053,5060,5066,5067,5070,5071,5107,5116,5123,5132,5134,5145,5148,5149,5157,5163,5164,5193,5194,5197,5217,5223,5230,5238,5259,5264,5267,5268,5270,5279,5281,5284,5288,5291,5299,5301,5302,5315,5327,5348,5351,5360,5383,5384,5385,5405,5408,5409,5412,5418,5424,5430,5433,5445,5465,5467,5468,5469,5521,5522,5550,5551,5560,5561,5585,5586,5587,5597,5677,5705,5720,5732,5740,5765,5766,5781,5815,5816,5840,5844,5855,5862,5873,5891,5892,5899,5903,5905,5923,5924,5942,5946,5948,5961,5976,6012,6015,6047,6049,6050,6063,6064,6117,6128,6151,6182,6185,6214,6215,6253,6255,6257,6272,6275,6287,6305,6308,6339,6340,6372,6447,6474,6475,6477,6488,6489,6544,6545,6558,6563,6572,6585,6604,6612,6618,6623,6626,6650,6651,6666,6667,6669,6686,6700,6701,6726,6727,6767,6833,6839,6903,6926,6930,6971,6995,7016,7032,7035,7036,7040,7046,7075,7096,7188,7195,7203,7216,7224,7227,7233,7306,7308,7345,7354,7359,7381,7411,7414,7416,7434,7444,7445,7484,7521,7524,7530,7595,7596,7605,7610,7614,7615,7617,7626,7627,7632,7650,7651,7652,7657,7679,7693,7696,7706,7755,7764,7791,7809,7816,7825,7863,7882,7894,7903,7919,7931,7984,7985,7989,8079,8082,8095,8110,8111,8129,8139,8150,8169,8170,8172,8178,8199,8201,8242,8243,8261,8262,8265,8266,8268,8280,8283,8288,8290,8308,8331,8354,8369,8378,8385,8409,8414,8459,8469,8490,8491,8497,8499,8500,8517,8519,8526,8595,8612,8639,8640,8643,8644,8651,8663,8665,8666,8687,8694,8707,8727,8757,8766,8784,8789,8806,8807,8867,8887,8894,8924,8927,8949,8956,8982,8987,9006,9013,9046,9048,9054,9071,9077,9079,9090,9123,9124,9133,9135,9136,9140,9152,9175,9213,9214,9219,9237,9249,9299,9304,9308,9318,9351,9374,9378,9383,9401,9402,9413,9429,9472,9474,9475,9494,9495,9500,9566,9576,9577,9589,9596,9607,9609,9620,9630,9665,9672,9682,9706,9716,9719,9737,9738,9740,9796,9799,9800,9801,9802,9803,9804,9805,9806,9807,9808,9809,9810,9811,9812,9813,9814,9815,9816,9817,9818,9819,9820,9821,9822,9823,9824,9825,9826,9827,9828,9829,9830,9831,9832,9833,9834,9835,9836,9858,9888,9897,9933,9940,9957,9961,9993],
      headers: [
        { text: 'Citizen Id', value: 'citizenId' },
        { text: 'For Sale', value: 'forSale', sortable: false },
        { text: 'Armor', value: 'armour' },
        { text: 'Helmet', value: 'helmet' },
        { text: 'Opensea', value: 'opensea' }
      ],
      totalCitizens: 0,
      unclaimedLandForCtz: [],
      loadingUnclaimed: false,
      options: {}
    }
  },
  head () {
    return {
      title: 'Unclaimed Citizens'
    }
  },
  watch: {
    options: {
      handler () {
        this.aggregateCitizenData()
      },
      deep: true,
    }
  },
  mounted() {
    console.log(this.$wallet)

    const landABI = JSON.parse(this.landABI)

    this.landContract = new ethers.Contract(this.landContractId, landABI, this.$wallet.provider)

  },
  methods: {
    async aggregateCitizenData () {
      this.loadingUnclaimed = true
      const { sortBy, sortDesc, page, itemsPerPage } = this.options

      let items = await this.getUnclaimed()
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

      const openSeaInfo = await this.getOpenseaInfo(items)

      console.log(openSeaInfo)

      // set unclaimed citizens
      this.totalCitizens = total
      this.loadingUnclaimed = false
      this.unclaimedLandForCtz = items.map (ctz => { 
        return {
          ...ctz,
          opensea: openSeaInfo.find(os => os.id === ctz.citizenId.toString())
        }
      })

      return {
          items,
          total,
        }
    },
    async getUnclaimed(){

      // load status from land contract
      const status = await this.landContract.getClaimStatus(this.unclaimedCitizenIds)

      // map citizen id with status and citizen data
      const unclaimedLandForCtz = status.map((boolResult, i) => {
        const citizenData = citizensData.find(data => data.id === this.unclaimedCitizenIds[i].toString())
        return {
          isClaimed: boolResult,
          citizenId: this.unclaimedCitizenIds[i],
          armour: citizenData.armour,
          helmet: citizenData.helmet
        }
      })

      // update list with only unclaimed citizens
      return unclaimedLandForCtz.filter(ctz => ctz.isClaimed === false)
      // console.log(result)
      // console.log(this.unclaimedLandForCtz.map(r=>r.citizenId).toString())
    },
    citizensData ({ params }) {
      return { citizensData }
    },
    async getOpenseaInfo(citizens){

      const ids = citizens.map(ctz => ctz.citizenId)

      let idsString = ''
      for (let i = 0; i < ids.length; i++) {
        if(idsString.length !== 0){
          idsString += '&'
        }
        idsString += 'token_ids=' + ids[i]
      }
      console.log(idsString)

      const options = {method: 'GET', headers: {accept: 'application/json', 'X-API-KEY': ' '}};

      const response = await fetch('https://api.opensea.io/api/v1/assets?' + 
        idsString + 
        '&order_direction=desc'+ 
        '&asset_contract_address=' + this.citizenContractId + 
        '&limit=50&include_orders=true', options)

      console.log(response)

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
