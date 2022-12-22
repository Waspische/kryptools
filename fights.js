// ==UserScript==
// @name         Fight Analysis
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://kryptoria.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kryptoria.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    class Helper {
        jsonToCsv = (json) => {
            // console.log(json)
            // console.log(json[0])
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

        createDownloadFile(prefix, content) {
            const link = document.createElement('a');
            link.download = `${prefix}-${this.getFormattedTime(true).replaceAll(":","_")}.csv`;
            const blob = new File(["\uFEFF"+content], {type: 'text/csv;charset=utf-8'}); // "\uFEFF" to ensure correct encoding
            link.href = window.URL.createObjectURL(blob);
            if(confirm("do you want to download the results?")){
                link.click();
            }
        }

        getFormattedTime(getDateToo) {
			const now = new Date();

			const hours = now.getHours().toString().padStart(2, '0');
			const minute = now.getMinutes().toString().padStart(2, '0');
			const seconds = now.getSeconds().toString().padStart(2, '0');
			const millisecs = now.getMilliseconds().toString().padStart(3, '0');

			let result = `${hours}:${minute}:${seconds}::${millisecs}`;
			if(getDateToo){
				const year = now.getFullYear().toString();
				const month = (now.getMonth()+1).toString().padStart(2,'0');
				const day = now.getDate().toString().padStart(2,'0');
				result = `${year}-${month}-${day}::`+ result;
			}
			return result;
	    };
    }

    class KryptoriaApi {


        searchByUsername = async (token, username) => {
            
            const result = await fetch(`https://auth.kryptoria.io/kryptoria/api/v1/user/fight/target/${username}/?searchBy=username&page=1&pageSize=150`, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "fr-FR,fr;q=0.9",
                    "authorization": token,
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "sec-gpc": "1",
                    "Referer": "https://kryptoria.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
                });
            
            const data = await result.json()
            console.log(data)

            return data.data
        }

        getAssignedByCitizenIds = async (citizenIds) => {
            
            const result = await fetch("https://auth.kryptoria.io/kryptoria/api/v1/build/nfts/assigned?citizenTokenIds=7,1543,1848,2122,2207,2956,3275,3357,3654,3944,3965,4001,4002,4424,4567,5111,5512,5965,6508,6633,7705,7880,8157,8307,9034,9398,9925", {
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
                "mode": "cors",
                "credentials": "include"
              });
            
            const data = await result.json()
            console.log(data)

            return data
        }

        getAllAssigned = async () => {

            // const ids = []
            // for (let i = 1; i <= 10000; i++) {
            //     ids.push(i)
            // }
            // console.log(ids)

            // let result = []

            // // batchs of 30
            // const size = 30
            // let page = 0
            // const limit = 10000

            // const promises = []

            // while(page*size <= limit){
            //     // console.log('page ' + page)
            //     const batchIds = this.ids.slice(page*size, page*size+size)

            //     let idsString = ''
            //     for (let i = 0; i < batchIds.length; i++) {
            //         if (idsString.length !== 0) {
            //         idsString += '&'
            //         }
            //         idsString += 'token_ids=' + batchIds[i]
            //     }
            //     // console.log(idsString)

            //     const options = {
            //         method: 'GET',
            //         headers: { accept: 'application/json', 'X-API-KEY': ' ' },
            //     }

            //     promises.push(this.getAssignedByCitizenIds(citizenIds))

            //     page++
            //     await this.sleep(250)
            // }

            // const responses = await Promise.all(promises)
            
            // console.log(responses)
            // console.log(responses.data.length)

            // return responses
        }

        getLeaderboard = async () => {
            
            const result = await fetch("https://auth.kryptoria.io/kryptoria/api/v1/leaderboard?page=1&pageSize=1000", {
                "headers": {
                  "accept": "application/json, text/plain, */*",
                  "accept-language": "fr-FR,fr;q=0.9",
                  "authorization": "Bearer null",
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
              });
            
            const data = await result.json()
            console.log(data)
            console.log(data.data.length)

            return data.data
        }


    }

    class FightAnalysis {

        constructor(api, helper) {
            this.api = api;
            this.helper = helper;
        }

        init = async (token) => {

            let result = []

            // const exception = ["N/A", "N/A.", "Bees-nest.eth[DD]", "KRYPT0RN/A", "n/a", "WintersGrip#3078", "GreenLeader#6834", "Eamonn#2182", "bp#5699", "#Gumbo", "alex#4129", "YouGunnaHitDat?", "darkSTAR/ZX"]

            const forbiddenChar = ["/","[","]","#","?"]

            const leaderboard = await api.getLeaderboard()

            // 1 - get all lands for each players

            for (const [i,player] of leaderboard.entries()) {
                console.log(`${i}/${leaderboard.length} get data for player ${player.username}`)
                if(!forbiddenChar.some(c => player.username.includes(c))) {
                    const playerLands = await api.searchByUsername(token, player.username)
                    result = result.concat(playerLands)
                }
            }

            console.log("=====")
            console.log(result)
            
            // 2 - add player resources data to lands
            
            result = result.map(l => {
                const playerInfo = leaderboard.find(p => p.username === l.username)
                console.log(playerInfo)
                return {
                    username: l.username,
                    faction: playerInfo.faction,
                    landId: l.id,
                    baseAttackPoints: l.baseAttackPoints,
                    baseDefencePoints: l.baseDefencePoints,
                    resourceType: l.resourceType,
                    rarity: l.rarity,
                    wasAttackedOn: l.wasAttackedOn,
                    tileResourceNumber: this.getTileResourceNumber(l.resourceType, playerInfo),
                    possibleSteal: this.getPossibleSteal(l.rarity, l.resourceType, playerInfo),
                    rank: playerInfo.rank,
                    binaryCode: playerInfo.binaryCode,
                    uniShards: playerInfo.uniShards,
                    kryptoOre: playerInfo.kryptoOre,
                    metaSpice: playerInfo.metaSpice,
                    bioSynth: playerInfo.bioSynth
                }
            })

            console.log(result)
            // console.log(result.length)

            // 3 - Filter on available lands
            result = result.filter(l => {
                const lastFight = new Date(l.wasAttackedOn)
                return Date.now() - lastFight.getTime() > (1 * 24 * 60 * 60 * 1000)
            })

            // console.log(result)

            // console.log(helper.jsonToCsv(result))

            helper.createDownloadFile('fights', helper.jsonToCsv(result))
            
        }

        getPossibleSteal = (rarity, resourceType, playerInfo) => {
            const number = this.getTileResourceNumber(resourceType, playerInfo);
            let baseStealRate = 0
            switch (rarity) {
                case "Common":
                    baseStealRate = 5
                    break;
                case "Normal":
                    baseStealRate = 6
                    break;
                case "Adept":
                    baseStealRate = 7
                    break;
                case "Epic":
                    baseStealRate = 8
                    break;
                case "Legendary":
                    baseStealRate = 9
                    break;
                case "Alpha God":
                    baseStealRate = 10
                    break;
                default:
                    baseStealRate = 0
                    break;
            }
                
            return number * baseStealRate / 100

        }

        getTileResourceNumber = (resourceType, playerInfo) => {
            let number;
            switch (resourceType) {
                case "BioSynth":
                    number = playerInfo.bioSynth
                    break;
                case "Meta Spice":
                    number = playerInfo.metaSpice
                    break;
                case "Binary Code":
                    number = playerInfo.binaryCode
                    break;
                case "Krypto Ore":
                    number = playerInfo.kryptoOre
                    break;
                case "Uni Shard":
                    number = playerInfo.uniShards
                    break;
                default:
                    number = 0
                    break;
            }
                
            return number

        }
    }
    
    const api = new KryptoriaApi()
    const helper = new Helper()

    window.FightAnalysis = new FightAnalysis(api, helper);

    console.log("=============================")
    console.log("=      Fight Analysis       =")
    console.log("=============================")
    console.log("How to use?")
    console.log("Copy the following line with you auth token")
    console.log('window.FightAnalysis.init("Bearer lkajsdljliajldijlasjdija")')


})();