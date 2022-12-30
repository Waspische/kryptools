<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4" class="ma-0">
        <v-sheet class="pa-3">
          <h2>🛡 Compare agains other armors</h2>
          <p>⏳ Coming soon...</p>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="4" class="ma-0">
        <v-sheet class="pa-3">
          <h2>⚔️ Exact fight</h2>
          <p>Land defense is included in calculation</p>
          <v-row class="my-2">
            <v-col cols="12" md="6">
              <p>Attacker</p>
              <v-select
                v-model="efATA"
                :items="attackBonuses.map((item) => item + 25)"
                label="Citizen attack"
                outlined
              ></v-select>
              <v-select
                v-model="efATD"
                :items="defenceBonuses.map((item) => item + 25)"
                label="Citizen Armour"
                outlined
              ></v-select>
              <!-- <v-checkbox v-model="checkbox" label="Has helmet?"></v-checkbox> -->
              <v-checkbox
                v-model="efAMW"
                label="Has Mech Warriors?"
              ></v-checkbox>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col cols="12" md="6">
              <p>Defender</p>
              <v-select
                v-model="efDTA"
                :items="attackBonuses.map((item) => item + 25)"
                label="Citizen attack"
                outlined
              ></v-select>
              <v-select
                v-model="efDTD"
                :items="defenceBonuses.map((item) => item + 25)"
                label="Citizen Armour"
                outlined
              ></v-select>
              <!-- <v-checkbox v-model="checkbox" label="Has helmet?"></v-checkbox> -->
              <v-checkbox v-model="efDTI" label="Has Titan?"></v-checkbox>
            </v-col>
            <v-col cols="12">
              <v-btn
                color="info"
                rounded
                class="mx-auto"
                @click="onCalculateExactFight"
              >
                Calculate
              </v-btn>
            </v-col>
          </v-row>

          <v-divider v-if="exactFightResult != null" class="ma-4"></v-divider>

          <v-alert
            v-if="exactFightResult != null"
            type="info"
            class="font-weight-bold my-2"
          >
            {{ exactFightResult * 100 }}% win rate for Attacker
          </v-alert>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="4" class="ma-0">
        <v-sheet class="pa-3">
          <h2>🗡 Compare against other weapons</h2>
          <p>⏳ Coming soon...</p>
        </v-sheet>
      </v-col>
    </v-row>

    <v-card> </v-card>
  </v-container>
</template>


<script>
export default {
  name: 'FightSimulatorPage',
  data() {
    return {
      MAX_CRIT: 50,
      debug: true,
      trace: false,

      efATA: 25,
      efATD: 25,
      efAMW: false,
      efDTA: 25,
      efDTD: 25,
      efDTI: false,
      exactFightResult: null,

      attackBonuses: [
        0, 50, 52, 54, 56, 58, 60, 62, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
        74, 75, 76, 78, 80, 82, 84, 86, 88, 90, 92, 96,
      ],
      defenceBonuses: [0, 40, 45, 50, 55, 57, 60, 66, 70, 73, 80, 92],
      armours: [
        {
          name: 'MK1',
          armour: 40,
          helmet: 10,
        },
        {
          name: 'MK2',
          armour: 45,
          helmet: 12,
        },
        {
          name: 'MK3',
          armour: 50,
          helmet: 16,
        },
        {
          name: 'MK4',
          armour: 55,
          helmet: 18,
        },
        {
          name: 'MK5',
          armour: 60,
          helmet: 20,
        },
        {
          name: 'SpecOps',
          armour: 60,
          helmet: 20,
        },
        {
          name: 'Officer',
          armour: 70,
          helmet: 22,
        },
      ],
    }
  },
  head() {
    return {
      title: 'Fight Simulator',
    }
  },
  mounted() {},
  methods: {
    onCalculateExactFight() {
      const ATA = this.efATA + (this.efAMW ? 50 : 0)
      const ATD = this.efATD
      const DTA = this.efDTA + 13 + (this.efDTI ? 50 : 0)
      const DTD = this.efDTD + 13
      this.exactFightResult = Math.round(this.getWinFrequency(ATA, ATD, DTA, DTD) * 100) / 100
    },

    getWinFrequency(ATA, ATD, DTA, DTD) {
      if (this.debug)
        console.log(`getWinFrequency(${ATA},${ATD},${DTA},${DTD})`)
      // number of battles
      const battles = 5000
      let winCount = 0
      let looseCount = 0

      // Start
      console.log(`----  Init parameters ----`)
      console.log(`Number of battles: ${battles}`)
      console.log(`Attacker: attack=${ATA}, defense=${ATD}`)
      console.log(`Defender: attack=${DTA}, defense=${DTD}`)

      for (let battle = 1; battle <= battles; battle++) {
        if (this.trace) console.log(`Battle #${battle}`)
        // Attacker current Health
        let AH = ATD
        // Defender current Health
        let DH = DTD

        let round = 0
        while (true) {
          round++
          // attacker turn
          if (this.trace) console.log(`Attacker attack`)
          const attackerDamage = this.getRealDamage(ATA, DTD)
          DH = DH - attackerDamage
          if (this.trace) console.log(`Attacker damage: ${attackerDamage}`)
          if (this.trace) console.log(`Defender health: ${DH}`)

          // defender turn
          if (this.trace) console.log(`Defender attack`)
          const defenderDamage = this.getRealDamage(DTA, ATD)
          AH = AH - defenderDamage
          if (this.trace) console.log(`Defender damage: ${defenderDamage}`)
          if (this.trace) console.log(`Attacker health: ${AH}`)

          // check winner

          if (AH <= 0 && DH <= 0) {
            if (AH >= DH) {
              if (this.debug) console.log(`Attacker win in ${round} rounds`)
              winCount++
              break
            } else {
              if (this.debug) console.log(`Defender win in ${round} rounds`)
              looseCount++
              break
            }
          }

          if (DH <= 0) {
            if (this.debug) console.log(`Attacker win in ${round} rounds`)
            winCount++
            break
          }

          if (AH <= 0) {
            if (this.debug) console.log(`Defender win in ${round} rounds`)
            looseCount++
            break
          }
        }
      }

      console.log(`----  Conclusion ----`)
      console.log(`Win count: ${winCount}`)
      console.log(`Loose count: ${looseCount}`)
      console.log(`Win frequency: ${winCount / battles}`)
      return winCount / battles
    },

    getRealDamage(attack, defense) {
      return (
        this.getBaseDamage(attack, defense) +
        this.getCriticalDamage(attack, defense)
      )
    },

    getBaseDamage(attack, defense) {
      return (attack * attack) / (attack + defense)
    },

    getCriticalDamage(attack, defense) {
      return (
        (this.getBaseDamage(attack, defense) * this.random(0, this.MAX_CRIT)) /
        100
      )
    },

    random(min, max) {
      return Math.random() < 0.5
        ? (1 - Math.random()) * (max - min) + min
        : Math.random() * (max - min) + min
    },
  },
}
</script>

