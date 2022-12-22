<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid>
    <header class="text-center ma-2" justify="center">
      <h1>Kryptoria map</h1>
    </header>
    <v-row>
      <v-col cols="12" md="3">
        <v-alert type="info" class="font-weight-bold my-2">
          Move map with arrow keys, drag and drop, or mouse wheel (+ shift for
          horizontal)
        </v-alert>
        <!-- <v-alert type="info" class="my-2">
          Future features include kryptorian/degen lands
        </v-alert> -->
        <v-card class="my-2">
          <v-card-title>Options</v-card-title>
          <v-card-text>
            <v-switch
            v-model="displayLandIds"
            inset
            :label="`Display Lands #id`"
            color="info"
            @change="onDisplayLandIds"
          ></v-switch>
          <v-switch
            v-model="displayForSale"
            inset
            :loading="loadForSale"
            :label="`Display for sale`"
            color="info"
            @change="onDisplayForSale"
          ></v-switch>
          <v-progress-linear
            v-if="loadForSale"
            v-model="loadForSaleProgression"
            class="mb-3"
            buffer-value="0"
            color="info"
            height="7"
            stream
            rounded
          ></v-progress-linear>
          <v-btn small :loading="downloadLoading" @click="downloadMap">Download map</v-btn>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title class="pb-1">Legend</v-card-title>
          <v-list dense>
            <v-list-group
              v-for="item in legend"
              :key="item.title"
              v-model="item.active"
            >
              <template #activator>
                <v-list-item-content>
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item v-for="child in item.children" :key="child.id" dense>
                <v-list-item-avatar>
                  <img :id="child.id" src="/kryptools/mapPack_tilesheet.png" />
                  <img
                    v-if="child.id === 'forest'"
                    id="forestBase"
                    src="/kryptools/mapPack_tilesheet.png"
                  />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>{{ child.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.title === 'Resources'">{{
                    child.resource
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <v-text-field
            v-model="address"
            :disabled="loadingAddress"
            :loading="loadingAddress"
            :error-messages="ownerLandsErrorMessage"
            :success-messages="ownerLandsMessage"
            solo
            outlined
            label="Search by owner's address"
            clearable
            prepend-inner-icon="mdi-magnify"
            @keydown.enter="searchAddress"
          ></v-text-field>

          <v-chip
            v-for="player in addresses"
            :key="player.address"
            class="ma-2"
            close
            :color="player.color"
            @click:close="onRemovePlayer(player)"
          >
            {{ player.address | formatAddress }}
          </v-chip>
        <div class="main-wrapper">
          <div id="canvas"></div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Konva from 'konva'
import { extendHex } from 'honeycomb-grid'
import lands from '~/static/data/lands.json'
import landContractService from '@/services/landContractService'

const Hex = extendHex()

export default {
  name: 'KryptoriaMap',
  filters: {
     formatAddress (value) {
      if (!value) return ''
      return value.slice(0,5) + '...'
    }
  },
  data() {
    return {

      downloadLoading: false,

      displayLandIds: true,

      address: null,
      // address: "0x0c3D1c91Ac325e58A839BBdD46DDEa1FD2Da3798",
      loadingAddress: false,
      ownerLandsMessage: '',
      ownerLandsErrorMessage: '',
      addresses: [],
      addressesLayer: null,

      displayForSale: false,
      loadForSale: false,
      loadForSaleProgression: 0,
      landsForSale: [],
      forSaleLandsLayer: null,

      map: null,
      tileAtlas: null,
      legend: [
        {
          title: 'Resources',
          active: true,
          children: [
            {
              id: 'land',
              name: 'Land',
              resource: 'Binary Code',
            },
            {
              id: 'mountain',
              name: 'Mountain',
              resource: 'Krypto Ore',
            },
            {
              id: 'desert',
              name: 'Desert',
              resource: 'Meta Spice',
            },
            {
              id: 'forest',
              name: 'Forest',
              resource: 'Uni Shard',
            },
            {
              id: 'ocean',
              name: 'Ocean',
              resource: 'BioSynth',
            },
          ],
        },
        {
          title: 'Cities',
          children: [
            {
              id: 'capital',
              name: 'Capital',
            },
            {
              id: 'city',
              name: 'City',
            },
            {
              id: 'town',
              name: 'Town',
            },
            {
              id: 'village',
              name: 'Village',
            },
          ],
        },
      ],
      stage: null,
      idsLayer: null,
    }
  },
  head() {
    return {
      title: 'Kryptoria map',
    }
  },
  created() {
    const flatLands = lands.map((land) => {
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
    // console.log(flatLands)
    const map = {
      width: 100,
      height: 100,
      atlasCols: 17,
      atlasRows: 12,
      ssize: 64,
      tsize: 32,
      innerRadius: 24 * 0.866025404,
      outerRadius: 24,
      properties: flatLands,
      getProperty(col, row) {
        // TODO update X and Y name
        return this.properties.find((p) => p.X === col && p.Y === row)
      },
    }
    this.map = map
  },
  mounted() {
    // set contract
    landContractService.setContract(this.$wallet.provider)

    const tileAtlas = new Image()
    tileAtlas.src = '/kryptools/mapPack_tilesheet.png'

    tileAtlas.onload = () => {
      console.log('onload')
      // set image only when it is loaded
      this.image = tileAtlas
      this.draw(tileAtlas)
    }
    // this.draw(this.tileAtlas)
    console.log('end mount')
    // console.log(this.map.properties)
  },
  methods: {
    draw(tileAtlas) {
      const width =
        this.map.innerRadius * this.map.width * 2 + this.map.innerRadius // window.innerWidth;
      const height =
        (this.map.outerRadius * 2 * this.map.height) / 2 +
        (this.map.outerRadius * this.map.height) / 2 +
        this.map.innerRadius // window.innerHeight;
      console.log('draw')

      const stage = new Konva.Stage({
        container: 'canvas',
        width,
        height,
        draggable: true,
      })
      // stage.scale({x:0.5, y:0.5})

      const layer = new Konva.Layer({
        // offsetX: 74*map.innerRadius*2+map.innerRadius,
        // offsetY: -map.innerRadius*2,
      })
      // layer.rotate(-60)

      const container = stage.container()
      container.tabIndex = 1 // make it focusable
      // focus it
      // also stage will be in focus on its click
      container.focus()

      // add tooltip
      const tooltipLayer = new Konva.Layer({})

      // add ids
      const idsLayer = new Konva.Layer({
        visible: true
      })

      // add owner lands
      const addressesLayer = new Konva.Layer({
        visible: true
      })

      // add lands for sale
      const forSaleLandsLayer = new Konva.Layer({
        visible: true
      })

      const tooltip = new Konva.Label({
        opacity: 0.75,
        visible: false,
        listening: false,
      })

      tooltip.add(
        new Konva.Tag({
          fill: 'black',
          pointerDirection: 'down',
          pointerWidth: 10,
          pointerHeight: 10,
          lineJoin: 'round',
          shadowColor: 'black',
          shadowBlur: 10,
          shadowOffsetX: 10,
          shadowOffsetY: 10,
          shadowOpacity: 0.2,
        })
      )

      tooltip.add(
        new Konva.Text({
          text: '',
          fontFamily: 'Calibri',
          fontSize: 18,
          padding: 5,
          fill: 'white',
        })
      )

      tooltipLayer.add(tooltip)

      // add data
      // console.log(Hex().toCartesian({q:0, r:0}))
      // console.log(Hex().toCartesian({q:1, r:-1})) // 1 -1 0 q,r,s

      // console.log(Hex().toCube({ x: 0, y: 1 }) )     // kryptoria 1r -1s 0q (au dessus) => { q: 0, r: 1, s: -1 } (en dessous)
      // console.log(Hex().toCube({ x: 1, y: 0 }) )     // kryptoria 0r -1s 1q (à droite) => {q: 1, r: 0, s: -1} (à droite)

      // const allXY = []

      for (const land of this.map.properties) {
        // console.log(land)
        const landCoords = land.COORDINATES.split(' ') // 0 = x, 1 = y, 2 = z
        // console.log(landCoords)
        const hex = Hex()
        const coords = hex.toCartesian({
          q: parseInt(landCoords[0]),
          r: parseInt(landCoords[2]),
        }) // col (q)(y) - row (r)(z) - s (x)
        // console.log(coords)
        // allXY.push(coords)
        const resource = this.getTileIdFromResource(land.RESOURCE)
        if (resource.name !== 0) {
          // 0 => empty tile

          const patternPentagon = new Konva.RegularPolygon({
            x:
              (coords.x + (coords.y % 2) * 0.5) * (this.map.innerRadius * 2) +
              this.map.innerRadius,
            y:
              height -
              (coords.y * this.map.outerRadius * 1.5 + this.map.outerRadius),
            // y: ((coords.y - map.yOffset) * map.outerRadius * 1.5 + map.outerRadius) + (map.innerRadius*map.height*2* 0.866025404+map.innerRadius),
            sides: 6,
            radius: this.map.outerRadius,
            fillPatternImage: tileAtlas,
            fillPatternOffset: {
              x:
                (resource.tileAtlasId % this.map.atlasCols) * this.map.ssize +
                this.map.innerRadius,
              y:
                Math.floor(resource.tileAtlasId / this.map.atlasCols) *
                  this.map.ssize +
                this.map.outerRadius,
            },
            land,
          })

          layer.add(patternPentagon)

          if (resource.tileAtlasId === 91) {
            // land under forest
            resource.tileAtlasId = 60
            const patternPentagon = new Konva.Rect({
              x:
                (coords.x + (coords.y % 2) * 0.5) * (this.map.innerRadius * 2) +
                this.map.innerRadius / 2,
              y:
                height -
                (coords.y * this.map.outerRadius * 1.5 + this.map.outerRadius),
              // y: ((coords.y - map.yOffset) * map.outerRadius * 1.5 + map.outerRadius/2) + (map.innerRadius*map.height*2* 0.866025404+map.innerRadius),
              width: this.map.ssize,
              height: this.map.ssize,
              fillPatternImage: tileAtlas,
              fillPatternOffset: {
                x: (resource.tileAtlasId % this.map.atlasCols) * this.map.ssize,
                y:
                  Math.floor(resource.tileAtlasId / this.map.atlasCols) *
                  this.map.ssize,
              },
              scale: {
                x: 0.375,
                y: 0.375,
              },
              offsetX: -this.map.innerRadius / 4,
              offsetY: this.map.innerRadius,
              // rotation: 60,
              land,
            })

            layer.add(patternPentagon)
          }

          // TODO update city name
          let city = null
          if (land.Capital) {
            city = 64
          } else if (land.City) {
            city = 111
          } else if (land.Town) {
            city = 110
          } else if (land.Village) {
            city = 55
          }
          if (city) {
            const patternPentagon = new Konva.Rect({
              x:
                (coords.x + (coords.y % 2) * 0.5) * (this.map.innerRadius * 2) +
                this.map.innerRadius / 2,
              y:
                height -
                (coords.y * this.map.outerRadius * 1.5 + this.map.outerRadius),
              width: this.map.ssize,
              height: this.map.ssize,
              fillPatternImage: tileAtlas,
              fillPatternOffset: {
                x: (city % this.map.atlasCols) * this.map.ssize,
                y: Math.floor(city / this.map.atlasCols) * this.map.ssize,
              },
              offsetX: -this.map.innerRadius / 4,
              offsetY: this.map.innerRadius,
              // rotation: 60,
              scale: {
                x: 0.375,
                y: 0.375,
              },
              land,
            })

            layer.add(patternPentagon)
          }

          const landIdText = new Konva.Text({
            x:
              (coords.x + (coords.y % 2) * 0.5) * (this.map.innerRadius * 2) +
              this.map.innerRadius,
            y:
              height -
              (coords.y * this.map.outerRadius * 1.5 + this.map.outerRadius),
            text: land.edition,
            fontSize: 9,
            fontFamily: 'Calibri',
            fill: 'black',
            offsetX: this.map.innerRadius / 2,
            offsetY: this.map.innerRadius / 2,
            land,
          })

          idsLayer.add(landIdText)
        }
      }

      // console.log('Min X: ' + Math.min( ...allXY.map(i=>i.x) ))
      // console.log('Max X: ' + Math.max( ...allXY.map(i=>i.x) ))
      // console.log('Min Y: ' + Math.min( ...allXY.map(i=>i.y) ))
      // console.log('Max Y: ' + Math.max( ...allXY.map(i=>i.y) ))

      stage.add(layer)
      stage.add(idsLayer)
      stage.add(addressesLayer)
      stage.add(forSaleLandsLayer)
      stage.add(tooltipLayer)

      /*
       * bind listeners
       */
      stage.on('mousemove', (event) => this.onMouseMove(event, tooltip))

      stage.on('mouseout', function (evt) {
        tooltip.hide()
      })

      stage.on('click', this.onClick)

      this.stage = stage;
      this.idsLayer = idsLayer
      this.addressesLayer = addressesLayer
      this.forSaleLandsLayer = forSaleLandsLayer

      console.log('end draw')
    },

    getTileIdFromResource(resource) {
      const resources = [
        {
          tileAtlasId: 18,
          name: 'Meta Spice',
          //         name: 'desert'
        },
        {
          tileAtlasId: 23,
          name: 'Binary Code',
          //         name: 'land'
        },
        {
          tileAtlasId: 28,
          name: 'Krypto Ore',
          //         name: 'mountain'
        },
        {
          tileAtlasId: 91,
          name: 'Uni Shard',
          //         name: 'forest'
        },
        {
          tileAtlasId: 202,
          name: 'BioSynth',
          //         name: 'ocean'
        },
      ]
      return resources.find((r) => r.name === resource)
    },

    onClick(evt){
      const tile = evt.target
        if (tile) {
          window.open(
            'https://opensea.io/assets/ethereum/0x17d084106c2f1c716ce39fa015ab022757d30c9a/' +
              tile.attrs.land.edition,
            '_blank'
          )
        }
    },

    onMouseMove(evt, tooltip) {

      const tile = evt.target
        if (tile) {
          // update tooltip
          const mousePos = tile.getStage().getRelativePointerPosition()
          tooltip.position({
            x: mousePos.x,
            y: mousePos.y - 5,
          })

          // check for sale
          const forSaleLand = this.landsForSale.find(l => l.id === tile.attrs.land.edition)          

          // TODO update attributes name
          const coordinates = tile.attrs.land.COORDINATES
          const resource = tile.attrs.land.RESOURCE
          const rarity = tile.attrs.land.RARITY
          const edition = tile.attrs.land.edition

          let tooltipText = `id: ${edition}\nposition: [${coordinates}]\nresource: ${resource}\nrarity: ${rarity}\n`

          const price = forSaleLand ? forSaleLand.price : 0
          if(price > 0){
            tooltipText += `price: ${price} eth\n`
          }
          tooltipText += `Click to open`

          tooltip
            .getText()
            .text(
              tooltipText  
            )

          if (mousePos.y < 128) {
            tooltip.getTag().pointerDirection('up')
          } else {
            tooltip.getTag().pointerDirection('down')
          }
          tooltip.show()
        }
      
    },

    onDisplayLandIds() {
      if(this.displayLandIds){
        this.idsLayer.show()
      } else {
        this.idsLayer.hide()
      }
    },

    async onDisplayForSale(){
      this.loadForSale = true
      this.loadForSaleProgression = 0
      if(this.displayForSale){
        console.log("Display for sale")
        // 1 - get staked lands ids
        const stakedLandIds = await landContractService.getStakedIds()
        console.log(stakedLandIds)
        this.loadForSaleProgression = 10

        // 2 - generate missing ids
        const availableIds = []
        for (let i = 1; i <= 10000; i++) {
          if(!stakedLandIds.find(id => id === i)) {
            availableIds.push(i)
          }
        }
        console.log(availableIds)

        // 3 - fetch missing ids
        const landsForSale = await this.getOpenseaInfo(availableIds, "0x17d084106c2f1c716ce39fa015ab022757d30c9a")
        console.log(landsForSale.map(l => l.id))
        this.landsForSale = landsForSale

        // 4 - Display lands
        this.drawPolygonOnLandsIds(landsForSale.map(l => l.id), this.forSaleLandsLayer, '#2081e2')

      } else {
        console.log("Hide for sale")
        this.landsForSale = []
        // reset layer
        this.forSaleLandsLayer.destroyChildren()
      }
      this.loadForSale = false
    },

    onRemovePlayer(player){

      // remove chip
      this.addresses = this.addresses.filter(p => p.address !== player.address)

      // remove from map
      const landShapes = this.addressesLayer.getChildren(function(node){
        return player.landIds.includes(node.attrs.land.edition);
      });
      landShapes.forEach(l => l.destroy())
    },  

    async getOpenseaInfo(ids, contractId) {

      let result = []

      // batchs of 30
      const size = 30
      const progressionIncrement = 90 / (ids.length / size)
      // let page = this.OSpage
      let page = 0

      const promises = []

      while(page*size <= ids.length){
          // console.log('page ' + page)
          const batchIds = ids.slice(page*size, page*size+size)

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
              contractId +
              '&limit=50&include_orders=true',
              options
          ))

          page++
          this.loadForSaleProgression += progressionIncrement
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
              id: parseInt(asset.token_id),
              price: asset.seaport_sell_orders
                  ? parseInt(asset.seaport_sell_orders[0].current_price) / 1000000000000000000
                  : null,
              }

          })
          // console.log('data')
          // console.log(data)

          return data
      }))


      // console.log('result')
      // console.log(result.flat().filter(i => i.price != null))

      return result.flat().filter(i => i.price != null)
    },

    downloadMap(){
      this.downloadLoading = true
      const dataURL = this.stage.toDataURL({ pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = 'map.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.downloadLoading = false
    },

    async searchAddress(){
      this.loadingAddress = true
      this.ownerLandsErrorMessage = ''
      this.ownerLandsMessage = ''

      if(this.addresses.some(a => a.address === this.address)){
        this.ownerLandsErrorMessage = 'Address is already displayed'
        this.loadingAddress = false
        return
      }

      const landsCount = await landContractService.getLandsCountByOwner(this.address)
      // console.log(landsCount)

      if(landsCount === 0 ){
        this.ownerLandsErrorMessage = 'Unknown address or no lands'
        this.loadingAddress = false
        return
      }

      const promises = []
      for (let i = 0; i < landsCount; i++) {
        promises.push(landContractService.getLandByOwnerandIndex(this.address, i))
      }
      
      const landIds = await Promise.all(promises)
      // console.log(landIds)

      const color = this.getRandomColor()

      this.drawPolygonOnLandsIds(landIds, this.addressesLayer, color)

      this.addresses.push({address: this.address, color, landIds})

      // reset address
      this.address = ""
      this.ownerLandsMessage = 'Done! Check map...'
      this.loadingAddress = false
      
    },

    drawPolygonOnLandsIds(ids, layer, color){

      const ownerLands = this.map.properties.filter( l => ids.includes(l.edition))
      // console.log(ownerLands)

      // draw
      // TODO global var
      const height =
        (this.map.outerRadius * 2 * this.map.height) / 2 +
        (this.map.outerRadius * this.map.height) / 2 +
        this.map.innerRadius
      for (const land of ownerLands) {
        const landCoords = land.COORDINATES.split(' ') // 0 = x, 1 = y, 2 = z
        const hex = Hex()
        const coords = hex.toCartesian({
          q: parseInt(landCoords[0]),
          r: parseInt(landCoords[2]),
        }) // col (q)(y) - row (r)(z) - s (x)
        const resource = this.getTileIdFromResource(land.RESOURCE)
        if (resource.name !== 0) {
          // 0 => empty tile

          const poly = new Konva.RegularPolygon({
            x:
              (coords.x + (coords.y % 2) * 0.5) * (this.map.innerRadius * 2) +
              this.map.innerRadius,
            y:
              height -
              (coords.y * this.map.outerRadius * 1.5 + this.map.outerRadius),
            // y: ((coords.y - map.yOffset) * map.outerRadius * 1.5 + map.outerRadius) + (map.innerRadius*map.height*2* 0.866025404+map.innerRadius),
            sides: 6,
            radius: this.map.outerRadius,
            stroke: color,
            strokeWidth: 4,
            land,
          })

          layer.add(poly)
        }
      }

    },

    async sleep (ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
    },

    getRandomColor(){
      return '#' + Math.floor(Math.random()*16777215).toString(16);
    }
  },
}
</script>

<style scoped>
* {
  margin: 0;
}

.main-wrapper {
  margin: 0 auto;
  overflow: auto;
  height: 90vh;
  width: 100%;
}

canvas {
  background: none;
}

.resource {
  display: flex;
  align-items: center;
}

.overlap {
  display: flex;
  justify-content: center;
}

#land {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -384px -64px;
  transform: scale(0.5);
}

#mountain {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -704px -64px;
  transform: scale(0.5);
}

#forestBase {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -384px -320px;
  z-index: 1;
  transform: scale(0.5);
}

#forest {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -576px -192px;
  z-index: 2;
  position: absolute;
  transform: scale(0.5);
}

#desert {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -64px -64px;
  transform: scale(0.5);
}

#ocean {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -960px -704px;
  transform: scale(0.5);
}

#capital {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -832px -192px;
  transform: scale(0.5);
}

#city {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -576px -384px;
  transform: scale(0.5);
}

#town {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -512px -384px;
  transform: scale(0.5);
}

#village {
  width: 64px;
  height: 64px;
  object-fit: none;
  object-position: -256px -192px;
  transform: scale(0.5);
}
</style>
