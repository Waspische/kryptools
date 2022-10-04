<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
    <div>
      <v-alert type="info" class="mx-12 font-weight-bold my-2" justify="center">
        Move map with arrow keys, drag and drop, or mouse wheel (+ shift for
        horizontal)
      </v-alert>
      <v-alert type="info" class="mx-12" justify="center">
        Future features include locating your lands and kryptorian/degen lands
      </v-alert>
      <header class="text-center ma-2" justify="center">
        <h2>Kryptoria map</h2>
        <div class="resources">
          <div class="resource">
            <p><u>Land</u><br />Binary Code</p>
            <img id="land" src="/kryptools/mapPack_tilesheet.png" />
          </div>
          <div class="resource">
            <p><u>Mountain</u><br />Krypto Ore</p>
            <img id="mountain" src="/kryptools/mapPack_tilesheet.png" />
          </div>
          <div class="resource">
            <p><u>Desert</u><br />Meta Spice</p>
            <img id="desert" src="/kryptools/mapPack_tilesheet.png" />
          </div>
          <div class="resource">
            <p><u>Forest</u><br />Uni Shard</p>
            <div class="overlap">
              <img id="forestBase" src="/kryptools/mapPack_tilesheet.png" />
              <img id="forest" src="/kryptools/mapPack_tilesheet.png" />
            </div>
          </div>
          <div class="resource">
            <p><u>Ocean</u><br />BioSynth</p>
            <img id="ocean" src="/kryptools/mapPack_tilesheet.png" />
          </div>
          <div class="resource">
            <p>Capital<br />40%</p>
            <img id="capital" src="/kryptools/mapPack_tilesheet.png" />
          </div>
          <div class="resource">
            <p>City<br />30%</p>
            <img id="city" src="/kryptools/mapPack_tilesheet.png" />
          </div>
          <div class="resource">
            <p>Town<br />20%</p>
            <img id="town" src="/kryptools/mapPack_tilesheet.png" />
          </div>
          <div class="resource">
            <p>Village<br />10%</p>
            <img id="village" src="/kryptools/mapPack_tilesheet.png" />
          </div>
        </div>
      </header>
      <!-- <input type ="text"></input>
      <v-btn id="displayLands">
        Display my lands
      </v-btn> -->
  
      <div class="main-wrapper">
        <v-stage
            ref="stage"
            :config="configKonva"
            >
            <v-layer ref="layer">
            </v-layer>
        </v-stage>
      </div>
      <!-- main wrapper -->
    </div>
  </template>
  
  <script>
  import Konva from 'konva'
  import lands from '~/static/data/lands.json'
  
  /**
   * Click listener for wallet land search
   */
  
  export default {
    name: 'TestComp',
    data() {
      return {
        map: null,
        tileAtlas: null,
        configKonva: {
        }
      }
    },
    head() {
      return {
        title: 'Test map',
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
      console.log(flatLands)
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

      this.configKonva.width = this.map.innerRadius * this.map.width * 2 + this.map.innerRadius // window.innerWidth;
        this.configKonva.height =
            (this.map.outerRadius * 2 * this.map.height) / 2 +
            (this.map.outerRadius * this.map.height) / 2 +
            this.map.innerRadius // window.innerHeight;

  
    },
    mounted() {
      const tileAtlas = new Image()
      tileAtlas.src = '/kryptools/mapPack_tilesheet.png'
  
      tileAtlas.onload = () => {
        console.log('onload')
        // set image only when it is loaded
        this.image = tileAtlas;
        console.log(tileAtlas)
        this.draw(tileAtlas)
      };
      // this.draw(this.tileAtlas)
      console.log(this.map.properties)
    },
    methods: {
      draw(tileAtlas) {
        console.log('draw')
        console.log(tileAtlas)
  
        const stage = this.$refs.stage.getNode();
        console.log(stage)

        // stage.scale({x:0.5, y:0.5})
  
        const layer = this.$refs.layer.getNode();
  
        const container = stage.container()
        container.tabIndex = 1 // make it focusable
        // focus it
        // also stage will be in focus on its click
        container.focus()
  
        
        const patternPentagon = new Konva.RegularPolygon({
            x: 100,
            y: 100,
            // y: ((coords.y - map.yOffset) * map.outerRadius * 1.5 + map.outerRadius) + (map.innerRadius*map.height*2* 0.866025404+map.innerRadius),
            sides: 6,
            radius: this.map.outerRadius,
            fillPatternImage: tileAtlas,
        })
  
        layer.add(patternPentagon)

        const rect = new Konva.Rect({
            x: 20,
            y: 20,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
        });
        layer.add(rect)
  
        // console.log('Min X: ' + Math.min( ...allXY.map(i=>i.x) ))
        // console.log('Max X: ' + Math.max( ...allXY.map(i=>i.x) ))
        // console.log('Min Y: ' + Math.min( ...allXY.map(i=>i.y) ))
        // console.log('Max Y: ' + Math.max( ...allXY.map(i=>i.y) ))
  
        stage.add(layer)

        stage.draw()
  
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
    width: 90vw;
  }
  
  canvas {
    background: none;
  }
  .resources {
    display: flex;
    justify-content: space-around;
    width: 800px;
    margin: auto;
  }
  .resource {
    min-width: 106px;
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
  }
  
  #mountain {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -704px -64px;
  }
  
  #forestBase {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -384px -320px;
    z-index: 1;
    position: absolute;
  }
  
  #forest {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -576px -192px;
    z-index: 2;
    position: absolute;
  }
  
  #desert {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -64px -64px;
  }
  
  #ocean {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -960px -704px;
  }
  
  #capital {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -832px -192px;
  }
  
  #city {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -576px -384px;
  }
  
  #town {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -512px -384px;
  }
  
  #village {
    width: 64px;
    height: 64px;
    object-fit: none;
    object-position: -256px -192px;
  }
  </style>
  