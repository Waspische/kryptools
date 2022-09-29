<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div>
    <v-alert
      type="info"
      class="mx-12 font-weight-bold my-2"
      justify="center"
    >
      Move map with arrow keys, drag and drop, or mouse wheel (+ shift for horizontal)
    </v-alert>
    <v-alert
      type="info"
      class="mx-12"
      justify="center"
    >
      Future features include locating your lands and kryptorian/degen lands
    </v-alert>
    <header class="text-center ma-2" justify="center">
      <h2>Kryptoria map</h2>
      <div class="resources">
        <div class="resource">
          <p><u>Land</u><br/>Binary Code</p>
          <img id="land" src="/kryptools/mapPack_tilesheet.png" />
        </div>
        <div class="resource">
          <p><u>Mountain</u><br/>Krypto Ore</p>
          <img id="mountain" src="/kryptools/mapPack_tilesheet.png" />
        </div>
        <div class="resource">
          <p><u>Desert</u><br/>Meta Spice</p>
          <img id="desert" src="/kryptools/mapPack_tilesheet.png" />
        </div>
        <div class="resource">
          <p><u>Forest</u><br/>Uni Shard</p>
          <div class="overlap">
            <img id="forestBase" src="/kryptools/mapPack_tilesheet.png" />
            <img id="forest" src="/kryptools/mapPack_tilesheet.png" />
          </div>
        </div>
        <div class="resource">
          <p><u>Ocean</u><br/>BioSynth</p>
          <img id="ocean" src="/kryptools/mapPack_tilesheet.png" />
        </div>
        <div class="resource">
          <p>Capital<br/>40%</p>
          <img id="capital" src="/kryptools/mapPack_tilesheet.png" />
        </div>
        <div class="resource">
          <p>City<br/>30%</p>
          <img id="city" src="/kryptools/mapPack_tilesheet.png" />
        </div>
        <div class="resource">
          <p>Town<br/>20%</p>
          <img id="town" src="/kryptools/mapPack_tilesheet.png" />
        </div>
        <div class="resource">
          <p>Village<br/>10%</p>
          <img id="village" src="/kryptools/mapPack_tilesheet.png" />
        </div>
      </div>
    </header>
    <!-- <input type ="text"></input>
    <v-btn id="displayLands">
      Display my lands
    </v-btn> -->

  <div class="main-wrapper">
      <div id="canvas"></div>
  </div><!-- main wrapper -->

</div>
</template>

<script>
import Konva from 'konva'
import { extendHex } from 'honeycomb-grid'
import lands from '~/static/data/lands.json'

const Hex = extendHex()

function loadImages(sources, callback) {
  console.log('loadimages')
    const images = {};
    let loadedImages = 0;
    const numImages = sources.length;
    console.log(sources)
    // get num of sources
    // for (const src in sources) {
    //     numImages++;
    // }
    for (const src in sources) {
        images[src] = new Image();
        images[src].onload = function () {
          console.log('onload')
          console.log(++loadedImages >= numImages)
              console.log('before callback')
                callback(images);
        };
        images[src].src = sources[src];
    }
}

function draw(images) {
    const width = (map.innerRadius*map.width*2) + map.innerRadius // window.innerWidth;
    const height = (map.outerRadius*2*map.height/2)+(map.outerRadius*map.height/2)+map.innerRadius; // window.innerHeight;
    console.log('draw')

    const stage = new Konva.Stage({
      container: 'canvas',
      width,
      height,
      draggable: true
    }); 
    // stage.scale({x:0.5, y:0.5})

    const layer = new Konva.Layer({
      // offsetX: 74*map.innerRadius*2+map.innerRadius,
      // offsetY: -map.innerRadius*2,
    });
    // layer.rotate(-60)

    const container = stage.container();
    container.tabIndex = 1; // make it focusable
    // focus it
    // also stage will be in focus on its click
    container.focus();

    // add tooltip
    const tooltipLayer = new Konva.Layer({
    });

    const tooltip = new Konva.Label({
      opacity: 0.75,
      visible: false,
      listening: false,
    });

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
    );

    tooltip.add(
      new Konva.Text({
        text: '',
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'white',
      })
    );

    tooltipLayer.add(tooltip);

    // add data
    // console.log(Hex().toCartesian({q:0, r:0}))
    // console.log(Hex().toCartesian({q:1, r:-1})) // 1 -1 0 q,r,s

    // console.log(Hex().toCube({ x: 0, y: 1 }) )     // kryptoria 1r -1s 0q (au dessus) => { q: 0, r: 1, s: -1 } (en dessous)
    // console.log(Hex().toCube({ x: 1, y: 0 }) )     // kryptoria 0r -1s 1q (à droite) => {q: 1, r: 0, s: -1} (à droite) 

    // const allXY = []

    for (const land of map.properties) {
      // console.log(land)
      const landCoords = land.COORDINATES.split(' ') // 0 = x, 1 = y, 2 = z
      // console.log(landCoords)
      const hex = Hex() 
      const coords = hex.toCartesian({ q: parseInt(landCoords[0]), r: parseInt(landCoords[2]) }) // col (q)(y) - row (r)(z) - s (x)
      // console.log(coords)
      // allXY.push(coords)
      const resource = getTileIdFromResource(land.RESOURCE);
      if (resource.name !== 0) { // 0 => empty tile

        const patternPentagon = new Konva.RegularPolygon({
            x: ((coords.x + (coords.y%2) * 0.5) * (map.innerRadius * 2) + map.innerRadius),
            y: height - (coords.y * map.outerRadius * 1.5 + map.outerRadius),
            // y: ((coords.y - map.yOffset) * map.outerRadius * 1.5 + map.outerRadius) + (map.innerRadius*map.height*2* 0.866025404+map.innerRadius),
            sides:6,
            radius: map.outerRadius,
            fillPatternImage: images.tileAtlas,
            fillPatternOffset: {
                  x: (resource.tileAtlasId % map.atlasCols) * map.ssize + map.innerRadius, 
                  y: Math.floor(resource.tileAtlasId / map.atlasCols) * map.ssize + map.outerRadius 
            },
            land
        });

        layer.add(patternPentagon);

        if (resource.tileAtlasId === 91) {
          // land under forest
          resource.tileAtlasId = 60
          const patternPentagon = new Konva.Rect({
            x: (coords.x + (coords.y%2) * 0.5) * (map.innerRadius * 2) + map.innerRadius/2,
            y: height - (coords.y * map.outerRadius * 1.5 + map.outerRadius),
          // y: ((coords.y - map.yOffset) * map.outerRadius * 1.5 + map.outerRadius/2) + (map.innerRadius*map.height*2* 0.866025404+map.innerRadius),
              width: map.ssize,
              height: map.ssize,
              fillPatternImage: images.tileAtlas,
              fillPatternOffset: {
                    x: (resource.tileAtlasId % map.atlasCols) * map.ssize, 
                    y: Math.floor(resource.tileAtlasId / map.atlasCols) * map.ssize 
              },
              scale: {
                  x: 0.375,
                  y: 0.375
              },
              offsetX: -map.innerRadius/4,
              offsetY: map.innerRadius,
              // rotation: 60,
              land
          });

          layer.add(patternPentagon);
        }
        
        // TODO update city name
        let city = null
        if(land.Capital){
          city = 64
        } else if(land.City){
          city = 111
        } else if(land.Town){
          city = 110
        } else if(land.Village){
          city = 55
        }
        if (city) {
          const patternPentagon = new Konva.Rect({
            x: (coords.x + (coords.y%2) * 0.5) * (map.innerRadius * 2) + map.innerRadius/2,
            y: height - (coords.y * map.outerRadius * 1.5 + map.outerRadius),
            width: map.ssize,
            height: map.ssize,
            fillPatternImage: images.tileAtlas,
            fillPatternOffset: {
              x: (city % map.atlasCols) * map.ssize, 
              y: Math.floor(city / map.atlasCols) * map.ssize 
            },
            offsetX: -map.innerRadius/4,
            offsetY: map.innerRadius,
            // rotation: 60,
            scale: {
                x: 0.375,
                y: 0.375
            },
            land
          });

          layer.add(patternPentagon);
        }


        const landIdText = new Konva.Text({
            x: ((coords.x + (coords.y%2) * 0.5) * (map.innerRadius * 2) + map.innerRadius),
            y: height - (coords.y * map.outerRadius * 1.5 + map.outerRadius),
            text: land.edition,
            fontSize: 9,
            fontFamily: 'Calibri',
            fill: 'black',
            offsetX: map.innerRadius/2,
            offsetY: map.innerRadius/2,
            land,
        });

        layer.add(landIdText);

      }
    }

    // console.log('Min X: ' + Math.min( ...allXY.map(i=>i.x) ))
    // console.log('Max X: ' + Math.max( ...allXY.map(i=>i.x) ))
    // console.log('Min Y: ' + Math.min( ...allXY.map(i=>i.y) ))
    // console.log('Max Y: ' + Math.max( ...allXY.map(i=>i.y) ))

    stage.add(layer);
    stage.add(tooltipLayer);

    /*
    * bind listeners
    */

    layer.on('mousemove', function (evt) {
        const tile = evt.target;
        if (tile) {
            // update tooltip
            const mousePos = tile.getStage().getRelativePointerPosition()
            tooltip.position({
                x: mousePos.x,
                y: mousePos.y - 5,
            });
          // TODO update attributes name
          const coordinates = tile.attrs.land.COORDINATES
          const resource = tile.attrs.land.RESOURCE
          const rarity = tile.attrs.land.RARITY
          const edition = tile.attrs.land.edition
            tooltip
                .getText()
                .text(`id: ${edition}\nposition: [${coordinates}]\nresource: ${resource}\nrarity: ${rarity}\nClick to open`);

            if(mousePos.y < 128){
                tooltip.getTag().pointerDirection('up');
            } else {
                tooltip.getTag().pointerDirection('down');
            }
            tooltip.show();
        }
      });

      layer.on('mouseout', function (evt) {
        tooltip.hide();
      });

      layer.on('click', function (evt) {
        const tile = evt.target;
        if (tile) {
            window.open('https://opensea.io/assets/ethereum/0x17d084106c2f1c716ce39fa015ab022757d30c9a/'+tile.attrs.land.edition,'_blank');
        }
      });
      
}

function getTileIdFromResource(resource){
    const resources = [
        {
            tileAtlasId: 18,
            name: 'Meta Spice'
    //         name: 'desert'
        },
        {
            tileAtlasId: 23,
            name: 'Binary Code'
    //         name: 'land'
        },
        {
            tileAtlasId: 28,
            name: 'Krypto Ore'
    //         name: 'mountain'
        },
        {
            tileAtlasId: 91,
            name: 'Uni Shard'
    //         name: 'forest'
        },
        {
            tileAtlasId: 202,
            name: 'BioSynth'
    //         name: 'ocean'
        }
    ]
    return resources.find(r => r.name === resource)
}

const sources = {
    tileAtlas: '/kryptools/mapPack_tilesheet.png'
};
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
    getProperty(col, row){
      // TODO update X and Y name
        return this.properties.find(p => p.X === col && p.Y === row)
    }
};
console.log(map.properties)

loadImages(sources, function (images) {
  console.log('loadimages callback')
    draw(images);
});


/**
 * Click listener for wallet land search
 */

export default {
  name: 'KryptoriaMap',
  data() {
    return {
      mapData: map
    }
  },
  head() {
    return {
      title: 'Kryptoria map',
    }
  },
  mounted() {
    console.log(this.mapData)
  },
  methods: {}
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
