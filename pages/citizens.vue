<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid>
    <v-row>
      <v-col v-for="stat in stats" :key="stat.trait" cols="12" md="3" sm="4">
        <v-card
          class="mx-auto overflow-y-auto"
          max-width="400"
          max-height="400"
          tile
        >
          <v-card-title
            >{{ stat.trait }}({{ stat.values.length }})</v-card-title
          >
          <v-list nav dense>
            <v-list-item v-for="(value, i) in stat.values" :key="i">
              <v-list-item-content>
                <v-list-item-title
                  >{{ value.value }} - {{ value.count }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-card>
      <v-card-title>
        Citizens
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="citizens"
        :items-per-page="25"
        class="elevation-1"
        :search="search"
        dense
        @current-items="getFiltered"
      >
      </v-data-table>

      <v-card-actions>
        <v-btn color="primary" @click="printOpenseaList()">Search Opensea</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-simple-table>
        <template #default>
          <thead>
            <tr>
              <th class="text-left">
                Name
              </th>
              <th class="text-left">
                Price
              </th>
              <th class="text-left">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in OSdata"
              :key="item.edition"
            >
              <td>{{ item.edition }}</td>
              <td>
                {{
                item.opensea && item.opensea.price
                  ? parseInt(item.opensea.price) / 1000000000000000000 + ' eth'
                  : ''
                }}
              </td>
              <td>
                <v-btn
                  x-small
                  color="primary darken-1"
                  min-width="0"
                  target="_blank"
                  rel="noopener noreferrer"
                  :href="
                    'https://opensea.io/assets/ethereum/' +
                    contractId +
                    '/' +
                    item.edition
                  "
                >
                  Open
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </v-container>
</template>


<script>
import citizensData from '~/static/data/citizens.json'

export default {
  name: 'CitizensPage',
  data() {
    return {
      contractId: '0x63d85ec7B1561818Ec03E158ec125a4113038A00', // 63 = citizen
      citizens: [],
      headers: [],
      loading: false,
      search: '',
      stats: [],
      OSdata: [],
      filtered: []
    }
  },
  head() {
    return {
      title: 'Citizens',
    }
  },
  mounted() {
    // init headers
    let headers = []
    headers.push({ text: 'Name', value: 'name' })
    headers.push({ text: 'Id', value: 'edition' })
    headers = headers.concat(
      citizensData[0].attributes.map((attribute) => {
        return {
          text: attribute.trait_type,
          value: attribute.trait_type, // will fetch for eg. citizen.ARMOUR
        }
      })
    )
    this.headers = headers

    this.aggregateData()
    this.calculateAttributesStats()
  },
  methods: {
    async printOpenseaList(){
      console.log('printOpenseaList()')
      const items = this.filtered
      console.log(items)

      // update list with opensea data
      const openSeaInfo = await this.getOpenseaInfo(items)

      console.log(openSeaInfo)

      // set unclaimed citizens
      this.OSdata = items.map (ctz => {
        return {
          ...ctz,
          opensea: openSeaInfo.find(os => os.id === ctz.edition.toString())
        }
      })
    },
    aggregateData() {
      // init citizens
      const items = citizensData.map((ctz) => {
        // remove attributes array to add it to the citizen as properties
        const attributes = {}

        for (const attribute of ctz.attributes) {
          attributes[attribute.trait_type] = attribute.value
        }
        // console.log(attributes)

        return {
          name: ctz.name,
          edition: ctz.edition,
          ...attributes,
        }
      })

      this.citizens = items
    },
    async getOpenseaInfo(citizens) {
      const ids = citizens.map((ctz) => ctz.edition)

      let idsString = ''
      for (let i = 0; i < ids.length; i++) {
        if (idsString.length !== 0) {
          idsString += '&'
        }
        idsString += 'token_ids=' + ids[i]
      }
      console.log(idsString)

      const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'X-API-KEY': ' ' },
      }

      const response = await fetch(
        'https://api.opensea.io/api/v1/assets?' +
          idsString +
          '&order_direction=desc' +
          '&asset_contract_address=' +
          this.contractId +
          '&limit=50&include_orders=true',
        options
      )

      console.log(response)

      const openseaData = await response.json()
      console.log(openseaData)

      return openseaData.assets.map((asset) => {
        return {
          id: asset.token_id,
          price: asset.seaport_sell_orders
            ? asset.seaport_sell_orders[0].current_price
            : null,
        }
      })
    },
    calculateAttributesStats() {
      const traits = citizensData[0].attributes.map((a) => a.trait_type)

      const stats = []

      for (const trait of traits) {
        const values = []
        for (const citizen of citizensData) {
          const value = citizen.attributes.find(
            (a) => a.trait_type === trait
          ).value
          if (!values.some((e) => e.value === value)) {
            const allAtt = citizensData.map((ctz) => ctz.attributes).flat()
            const count = allAtt.filter(
              (att) => att.trait_type === trait && att.value === value
            ).length

            values.push({
              value,
              count,
            })
            // todo ajouter ici le calcul du nombre d'appartition de la valeur dans le trait
          }
        }
        stats.push({
          trait,
          values,
        })
      }
      console.log(stats)

      this.stats = stats.map((s) => {
        s.value = s.values.sort((a, b) => b.count - a.count).reverse()
        return s
      })
    },
    getFiltered(e) {
      console.log(e) // output the filtered items
      this.filtered = e
      // return e
    },
  },
}
</script>

