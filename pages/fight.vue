<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Initialize data
      </v-card-title>
      <v-card-text>
        <v-text-field
            v-model="token"
            :disabled="loadingFights"
            :loading="loadingFights"
            solo
            outlined
            label="Enter Kryptoria Bearer Token"
            clearable
            prepend-inner-icon="mdi-magnify"
            @keydown.enter="searchAddress"
          ></v-text-field>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title>
        Citizens
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="citizens"
        :items-per-page="25"
        class="elevation-1"
        dense
      >
      </v-data-table>
    </v-card>
  </v-container>
</template>


<script>
import citizensData from '~/static/data/citizens.json'

export default {
  name: 'CitizensPage',
  data() {
    return {
      token: null,
      loadingFights: false,
      citizens: [],
      headers: [
        { text: 'Name', value: 'name' }
      ],
      loading: false,
      search: '',
      usernames: [ "jk", "Spiderdrop", "ImMarle02", "Rejolut1", "Pasman", "Magpie", "RajaBhai431", "BigMac2022", "Rcker", "rain", "Spirit", "sona1121", "UsersAreAnnoying", "GentlemanFarmer.eth", "pyrayx", "SmushStevens", "moustachemedic", "ListlessFox", "Qinister", "Thomasmca.eth", "y6d4s257v6yu", "LucasBarum", "Plur", "snake", "ALIEN_TEJAS", "AlphaGod", "test", "Robinja", "pancake", "M212", "BigMac", "rahula", "syrup", "Flexi", "Femtoamp", "-seedphrase", "ankitttt", "Nalsenrud", "kooshool", "love", "NorcalD", "ATXdubstep", "HogeTeamDelta", "GB", "WoeToe", "Coastie", "xafa", "Risk", "PhenomJones", "itscobruhh", "Dyson", "Ivo", "vtzgass", "ASR", "nogiatrapic", "GimbalLock", "Found.", "Nodpower", "Wooddruff", "SendNudes", "honey4d", "vitin", "MrHallywood", "Alexfratley", "WildWestCrypto", "cracked", "Krypt2", "seedphrase", "smartors", "Kriozis", "Derk", "Meekus", "DegenThot", "PhantomMike", "GaryptoNFT", "Mio", "feelzphun", "TonganBeast", "Woodcrumbs", "jrh", "Bellenger", "smokemeup.eth", "Enz3584", "GrandPa_OG_Diesel", "sextacy", "iHelg", "NotoriousNightOwl", "hansoro", "midnightclub09", "sammy", "deft", "ThinkSmol", "ironlegion", "CryptoCoogi", "Lewbricantloomilew", "BLAG", "bruce", "CryptoBEARDO", "HipForCrypto", "0xkryptoria", "elixir", "joeyb", "0xhehastuff", "gandu", "sb2020", "AlphaDegen", "N/A.", "WRLDTakeOver", "Bagis13", "wamfever", "SJ951", "javierluis", "Henrik", "mrvibes", "Lucky", "kendanger", "YouGunnaHitDat?", "faded", "Clever", "Westbit", "MicRabble", "hablo", "53A8A55", "s3raph1m", "Matte.Ink", "adjum", "jelly", "Albaz.eth", "Rielar", "Eddie", "Joe", "HelloCastle", "Road_Scholar", "bsbeast", "tinoz", "ruthlus", "mabool", "Woody", "m3t4m4rn", "Ozzie", "RuthieMeowMeow", "Trabodeur", "Kryptorian", "Esquibar", "JoyPad96", "RTT", "jestmeta.eth", "Moller", "Yummy", "Gw4d", "ET", "Kyl0R3n", "cryptokoosha", "Mega", "RickyEagle", "SpicyRamen", "0xBash", "siuladenip", "basson", "TheRingMaster.eth", "WoodyWBA", "s1cko", "SP_FatherOfVon", "wahs0x62", "r-nemes", "MK7", "Ronin", "brownbear29", "BooshTK", "Hako", "Jace0x", "jadeskye", "GoldenPalm", "Smurph", "shacharaz", "Shillz", "fangstup", "DOM", "Burnnotice34", "Arkose", "Mark", "butt", "XS1goliath.eth", "goblum", "Vorpal", "Metzgr", "SilverWolf", "metaearthjbas", "kingcursa", "imragen.eth", "moon", "Internethobo", "zeft", "gahio", "Vice", "ryanr28", "shaolintemple", "speedbal", "McRod", "SLENDERMAN", "mihajₒundefined", "bladeslap", "mystic", "Owzen", "1amf00j", "sirgerard", "N00bFl3ming", "Microbilo", "mtjericho", "MilledeBelgrado", "neffteas", "NeedForTacos", "owntwist", "Primalkey", "chvonglica", "Ersin", "h1t3kc0r", "207gang", "725", "Frankey", "bowtiedanorak", "Bokodozogobofopojo", "CryptoOilTom", "Gurusha", "Astraea", "cho5en", "KryptorianRebel", "GrandpaJDK", "Kyle", "Fodder", "CHNSWNETWORK", "spacey", "BenTheGreek", "CryptoLee", "Kebabtallerken", "terryso", "Winston_1984", "TrafficCone", "Scott", "Neo", "AfroMorty", "wu-assassin", "xollox", "JoMo", "Fungi", "cryptomaniac", "RamzyGTR", "MusicOfLamour", "latenightcrewdave", "pistolpete", "420", "koolob", "Kevin", "//santosan", "User24.eth", "dingson", "BobDee", "MoonCoin$", "MisterJJC", "RoninDconn.eth", "Viper", "BOOZEDone", "N/A", "ZeusJXN", "ai10100", "Mario_1", "SaveMarineMammals", "Krypt", "drewbian", "1AR", "MateyC", "Faegil", "bubımuzak", "Thickmeat", "WintersGrip#3078", "PirateKing", "GreenLeader#6834", "LF", "DayDreamAlways", "Hygen", "Tacostain", "ethereum69.eth", "cboo", "Blxckvein", "BeforeCrypto", "monymakr45.eth", "Metarizon", "ren", "Laxmuffins", "TishioMain", "irritated.eth", "SugaWada", "Alvis", "Mehmood", "CaptainStake", "RagPoet", "kearobi", "Mario_2", "smokey", "MISH", "Fish", "Systematic", "ShoBiz", "BloodEagleViking", "alphacitizengod.eth", "magpies", "TennX", "SQ_LootVault", "Birdlracing", "hurricam", "creeptoria.eth", "vlad", "Orajo", "TheDad", "YAGNA", "BR3N3N_", "kovi", "Eamonn#2182", "BEEPBOOPISARUG", "dreadboii", "Seppi", "Derricking10", "Von", "dremmarie", "GalaxyEnterprises", "jimmy_fick", "tech_nerd_21", "bp#5699", "stu2surf", "KATSUBASH", "Maxine", "BigNLargePapi", "honeyrain", "RUTHLUS", "JacqNFT", "Nassau", "甲子国某居民", "ReMix*", "choman", "poonie", "de", "de-2", "Strohmodeus", "yungmeta", "sant0rini", "minhrus", "MeTROBGW", "losvin", "DarkSteed", "Solodex", "spiderdrop", "Flumunda", "Yonko", "DECypher", "senornikos", "Hunty", "Chase_Isengard", "ballad", "Agni", "Buzz", "CP37", "ShenPwn", "JfamDad", "gooner", "TMOSES", "zeppy", "Furli88", "brodyyukon", "sfalcon", "bdawg", "ryanwtaylor", "tru", "scaevola", "ElectroW", "Marci", "Mitozu", "G", "jxde", "Tracknasty", "Ghost", "HEX", "xGeo", "C1PH3R", "brucethegoose", "0xBigB", "Kandhola", "Mcfly", "beseniya", "Gimi", "Founder", "money_gang", "Volodymyr", "Emerica", "Jajan", "redwomble", "sok4o", "wolfkali", "Gebox", "UVGALAXY", "blackgirlasis", "darshan", "Bundle", "New1", "pizza1", "NikolaDaPops", "lazyyzal", "cryptooiltom", "AlphaPunk", "Zem", "Ale", "pipewerkz", "Cedrick", "joke", "vish", "BattinBrad", "RUPAMIND321", "Whoooo", "BobaMochi", "Furious", "THEREALSNIPER", "OGP.ETH", "nogweijose", "stonerdaly", "Mythago", "user911.eth", "Bassindale", "kl0ckd", "M-SKY", "Tishio27", "Stu2cry", "babba410", "cheshiregoat.eth", "blancuz", "Vansky", "slays", "krystal", "Screamer", "Doubleshot", "Tanimal", "PRINCE HARRY", "Awgtz", "bob", "bist_art", "cpc", "laimutis", "LONE", "fuldawap", "Kenny_powerz", "THARSIAN", "Moonman", "Dono1harm", "Lacertus21", "KRYPT0RN/A", "Mike_G", "Wasp", "Yim3z", "Cryptix", "Saj", "ladyloomi", "mondo", "Schrodingrrr", "kingmack", "artsy_viking", "Jhyma", "WIGANATHLETIC", "Krille", "4rmitage.eth", "Thechoesenone", "chouqueth", "#Gumbo", "MrBungle", "Bees-nest.eth[DD]", "Serge"]
    }
  },
  head() {
    return {
      title: 'Fight',
    }
  },
  mounted() {

    this.aggregateData()
    console.log(this.usernames)
    this.searchByUsername()


  },
  methods: {

    async searchByUsername(){
      const result = await fetch("https://auth.kryptoria.io/kryptoria/api/v1/user/fight/target/-seedphrase/?searchBy=username&page=1&pageSize=10", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "fr-FR,fr;q=0.9",
          "authorization": "",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "sec-gpc": "1"
        },
        "referrer": "https://kryptoria.io/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "no-cors",
        "credentials": "include"
      });

      const data = await result.json()
      console.log(data)
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
    }
  },
}
</script>

