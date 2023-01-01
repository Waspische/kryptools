const fs = require('fs');
const ethers = require('ethers');  
const fetch = require('node-fetch');

//  =================== TODO ===================
// [ ] Bug: unassigned lands != unsassigned citizen because if you have more citizens than lands it's wrong
// [ ] Feat: Add citizenIds to check again when different number in the other script

(async function() {
    'use strict';

    class Helper {

        sleep = async (ms) => {
            await new Promise(resolve => setTimeout(resolve, ms));
        }

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

    class CitizenContractService {


        constructor(helper) {
            this.helper = helper;
        }

        async getCitizensCountByOwner(ownerAddress){
            let count = 0
            try {
                console.log(`getCitizensCountByOwner(${ownerAddress})`)
                count = await this.contract.balanceOf(ownerAddress)
            } catch(e){
                console.log(e)
            }
            return count.toNumber()
        }
    
        async getCitizensByOwnerAndIndex(ownerAddress, i){
            // console.log(`getCitizensByOwnerAndIndex(${ownerAddress}, ${i})`)
            const citizenId = await this.contract.tokenOfOwnerByIndex(ownerAddress, i)
            await this.helper.sleep(100)
            return citizenId.toNumber()
        }
    
        async getCitizenIdsByOwner(ownerAddress, count){
            console.log(`getCitizenIdsByOwner(${ownerAddress})`)

            const promises = []
            for (let i = 0; i < count; i++) {
                promises.push(this.getCitizensByOwnerAndIndex(ownerAddress, i))
            }
            
            const citizenIds = await Promise.all(promises)
    
            // console.log(citizenIds)
            return citizenIds
        }

        async getStakedIdsFromList(ids){

            const result = []
            for (let i = 0; i < ids.length; i++) {
                const response = await this.contract.getStakingTime(ids[i])
                result.push({
                    staked: response[0],
                    id: ids[i]
                })
            }
            await this.helper.sleep(100)
            // console.log(result)
            return result.filter(i=>i.staked).map(l => l.id)
        }
    
        setContract(walletProdiver) {
            const landABI = JSON.parse(this.contractABI)
            this.contract = new ethers.Contract(this.contractId, landABI, walletProdiver)
        }
      
        contractId = '0x63d85ec7B1561818Ec03E158ec125a4113038A00';
        contractABI = '[{"inputs":[{"internalType":"address","name":"platformAddress","type":"address"},{"internalType":"string","name":"notRevealURI","type":"string"},{"internalType":"uint16","name":"maxSupply_","type":"uint16"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"uri","type":"string"}],"name":"BaseTokenURIUPDATE","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"limit","type":"uint8"}],"name":"MintLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"Reveal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"StakeNFT","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"TogglePreSale","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"TogglePublicSale","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleStaking","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"userMinted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalMinted","type":"uint256"}],"name":"TokenCount","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UnstakeNFT","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"tokenId","type":"uint16"},{"indexed":false,"internalType":"string","name":"uri","type":"string"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UpdateTokenURI","type":"event"},{"inputs":[],"name":"_isPreSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_isPublicSaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_merkleRoot","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_notRevealedURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_platformAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_revealed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_stakingOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"}],"name":"getStakingTime","outputs":[{"internalType":"bool","name":"isNftStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"isUserWhitelisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextOwnerToExplicitlySet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"quantity","type":"uint8"},{"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}],"name":"preSaleSafeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"quantity","type":"uint8"}],"name":"safeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_baseTokenURI","type":"string"}],"name":"setBaseTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"}],"name":"setMerkleRoot","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"mintlimit","type":"uint8"}],"name":"setMintLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"notRevealedURI","type":"string"}],"name":"setNotRevealedURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"platformAddress","type":"address"}],"name":"setPlatformAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"togglePreSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"togglePublicSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"toggleStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"},{"internalType":"string","name":"uri","type":"string"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"updateTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
        contract = null;
    
    }

    class LandContractService {

        async getLandsCountByOwner(ownerAddress){
            let count = 0
            try {
                // console.log(`getLandsCountByOwner(${ownerAddress})`)
                count = await this.contract.balanceOf(ownerAddress)
            } catch(e){
                console.log(e)
            }
            return count
        }

        async getLandByOwnerandIndex(ownerAddress, i){
            // console.log(`getLandByOwnerandIndex(${ownerAddress}, ${i})`)
            const landId = await this.contract.tokenOfOwnerByIndex(ownerAddress, i)
            return landId.toNumber()
        }

        async getLandIdsByOwner(ownerAddress, count){
            // console.log(`getLandIdsByOwner(${ownerAddress})`)

            const promises = []
            for (let i = 0; i < count; i++) {
                promises.push(this.getLandByOwnerandIndex(ownerAddress, i))
            }
            
            const landIds = await Promise.all(promises)
    
            // console.log(landIds)
            return landIds
        }

        async getOwnerOfLand(landId){
            const result = await this.contract.ownerOf(landId)
            return result
        }

        async getStakedIds(){
            const ids = []
            for (let i = 1; i <= 10000; i++) {
                ids.push(i)
            }

            let result = []
            const response = await this.contract.getStakingStatus(ids)
            // console.log(response)
            result = response.map(r => {
                return {
                staked: r[1],
                id: r[0]
                }
            })
            // console.log(result)
            return result.filter(i=>i.staked).map(l => l.id)
        }


        setContract(walletProdiver) {
            const landABI = JSON.parse(this.contractABI)
            this.contract = new ethers.Contract(this.contractId, landABI, walletProdiver)
        }
    
        contractId = '0x17D084106C2f1C716ce39fa015AB022757d30C9A';

        contractABI = '[{"inputs":[{"internalType":"address","name":"platformAddress_","type":"address"},{"internalType":"string","name":"notRevealURI","type":"string"},{"internalType":"uint16","name":"maxSupply_","type":"uint16"},{"internalType":"address","name":"alphaCitizen","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"uri","type":"string"}],"name":"BaseTokenURIUPDATE","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"Reveal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"StakeLand","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleClaimLand","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"value","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ToggleStaking","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint16[]","name":"citizentokenIDs","type":"uint16[]"},{"indexed":false,"internalType":"uint256","name":"userMinted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalMinted","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UnstakeLand","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"tokenID","type":"uint16"},{"indexed":true,"internalType":"string","name":"uri","type":"string"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"UpdateLandURI","type":"event"},{"inputs":[],"name":"_alphaCitizen","outputs":[{"internalType":"contract KryptoriaAlphaCitizensInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"citizenTokenIds","type":"uint16[]"}],"name":"claimByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"citizenTokenIds","type":"uint16[]"}],"name":"claimLand","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIds","type":"uint16[]"}],"name":"getClaimStatus","outputs":[{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"getStakingStatus","outputs":[{"components":[{"internalType":"uint16","name":"tokenId","type":"uint16"},{"internalType":"bool","name":"isStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"internalType":"struct KryptoriaLand.StakeDetails[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"}],"name":"getStakingTime","outputs":[{"internalType":"bool","name":"isStaked","type":"bool"},{"internalType":"uint256","name":"current","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isClaimActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isRevealed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isStakingOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextOwnerToExplicitlySet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"notRevealedURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_baseTokenURI","type":"string"}],"name":"setBaseTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"notRevealedURI_","type":"string"}],"name":"setNotRevealedURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"platformAddress_","type":"address"}],"name":"setPlatformAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"toggleClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"toggleStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16[]","name":"tokenIDs","type":"uint16[]"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"tokenID","type":"uint16"},{"internalType":"string","name":"uri","type":"string"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"updateTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"}]';

        contract = null;

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

            return data.data.filter(l => l.username === username)
        }

        getAssignedByCitizenIds = async (token, citizenIds) => {

            let citizenString = ''

            for (let i = 0; i < citizenIds.length; i++) {
                if (citizenString.length !== 0) {
                    citizenString += ','
                }
                citizenString += citizenIds[i]
            }
            
            const result = await fetch("https://auth.kryptoria.io/kryptoria/api/v1/build/nfts/assigned?citizenTokenIds=" + citizenString, {
                "headers": {
                  "accept": "application/json, text/plain, */*",
                  "accept-language": "fr-FR,fr;q=0.6",
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
                "method": "GET",
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
            // console.log(data)
            // console.log(data.data.length)

            return data.data
        }
        
        searchByLandId = async (token, landId) => {
            
            const result = await fetch(`https://auth.kryptoria.io/kryptoria/api/v1/user/fight/target/${landId}/?searchBy=land-id&page=1&pageSize=150`, {
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
            // console.log(data)

            return data.data
        }

        searchByWalletAddress = async (token, walletAddress) => {

            const result = await fetch("https://auth.kryptoria.io/kryptoria/api/v1/wallet/player-profile/" + walletAddress, {
                "headers": {
                  "accept": "application/json, text/plain, */*",
                  "accept-language": "fr-FR,fr;q=0.9",
                  "authorization": token,
                  "cache-control": "no-cache",
                  "pragma": "no-cache",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-site",
                  "sec-gpc": "1"
                },
                "body": null,
                "method": "GET"
                });
            
            const data = await result.json()
            // console.log(data)

            return {...data, walletAddress}
        }


    }

    class FightAnalysis {

        constructor(api, helper, citizenContractService, landContractService) {
            this.api = api;
            this.helper = helper;
            this.citizenContractService = citizenContractService
            this.landContractService = landContractService
        }

        init = async (token) => {

            // const exception = ["N/A", "N/A.", "Bees-nest.eth[DD]", "KRYPT0RN/A", "n/a", "WintersGrip#3078", "GreenLeader#6834", "Eamonn#2182", "bp#5699", "#Gumbo", "alex#4129", "YouGunnaHitDat?", "darkSTAR/ZX"]
            const stakedWithoutUsername = [555,556,682,683,744,921,946,955,962,963,964,1069,1084,1146,1211,1233,1311,1312,1375,1376,1411,1619,1894,2052,2053,2095,2416,2417,2718,2845,2864,3123,3139,3379,3479,3739,3783,3784,3785,4045,4059,4085,4145,4146,4148,4241,4260,4279,4340,4385,4660,4664,4665,4890,4984,5279,5283,5284,5482,5570,5878,5895,6193,6194,6195,6257,6258,6259,6292,6293,6294,6459,7305,7545,7546,7547,7954,8050,8408,8476,8477,9053,9054,9116,4055,4056,8101,8102,8103,4054,4057,1151,4058,8335,5341,6026,6028,4052,4053,7903,3802,6553,6027,6029,3803,3804,5340,4492,4494,3501,7473,203,7904,8529,3799,3805,6552,4304,3500,3502,8705,1487,1386,1399,4153,6030,6031,6554,6555,5345,951,8466,1358,1385,1387,1388,1389,1400,4493,8610,8704,8706,5481,8626,7701,8574,772,948,1149,1150,7474,1384,1398,1401,1402,3498,1300,1488,5478,5480,5339,268,118,8622,4495,4496,6171,990,6139,947,8456,8472,8473,8474,501,1383,1390,8461,7578,7579,7675,7974,7700,1360,1361,6182,119,120,6450,6451,1200,3172,3916,8287,1105,1106,8624,8455,8469,8471,4051,4149,2635,2636,8460,6453,6462,943,6278,6280,6281,6466,1372,1392,1397,6185,4662,6329,6330,6290,3142,8623,7987,7993,7302,353,317,8608,9112,689,3917,8224,4150,2613,950,6283,6285,1107,965,966,6260,6261,502,4986,6452,6454,6455,6463,4920,7710,1302,8462,1252,3037,7973,3143,5617,6250,6251,1201,6457,8046,7944,7986,5275,5225,770,771,1373,1403,1404,1147,4663,5479,8225,8028,8029,269,8609,6287,6264,6265,6268,3559,3560,3561,8467,8468,8470,6465,688,4675,4676,7790,4643,6162,6164,6166,6167,6169,6170,6174,3034,4402,6300,7711,1202,2844,8459,5439,6272,6273,6275,7303,2260,6252,1857,1858,6279,4725,4726,1406,6295,5224,6186,6189,8284,5689,5009,1148,6286,6288,6289,6291,6140,684,944,956,957,958,960,967,4669,7509,3558,3562,8237,5343,4147,4641,4644,4645,7958,5430,5431,7676,6262,6263,6266,6267,6269,1381,7953,2449,2450,2261,8627,8576,8588,2056,6165,6168,6173,6176,6177,3035,5282,3417,5010,7957,6297,3163,6187,6188,6191,5673,5438,2673,4661,6274,6256,4919,4921,4922,3915,8475,4672,5342,5344,3787,3782,6299,7003,959,961,4642,8436,2835,2094,4983,1018,8628,1104,4667,920,3162,1409,5281,5276,6296,4041,6190,6192,8981,3733,2054,2057,2058,6161,6456,8595,6282,8116,6254,6255,8045,8751,1395,1396,8162,4918,9269,8030,4671,7587,4217,1544,4670,2787,8982,8016,4889,1097,5007,9033,5471,1017,8015,8464,7929,4141,4142,4143,4144,7586,1394,4987,8589,8457,8458,51,5277,8231,2591,6311,3735,5462,5687,6458,7890,7891,8246,4108,787,1443,4985,1393,6298,4219,6580,6158,3913,1096,7923,7512,3816,5428,6531,7573,5686,8596,1414,1415,3160,3161,8620,5981,3941,7490,8980,3145,7638,7639,8577,1473,7977,2262,3051,8811,6143,5252,1365,1405,1407,6242,6243,6244,6159,6160,7511,7976,1085,6556,6970,9243,1359,7544,8465,3914,8238,9035,4048,7909,6581,685,1127,1377,1378,1379,1380,1416,5753,8557,2858,5676,547,8230,1083,6394,6395,7585,4981,5005,4139,8229,6144,1410,1194,5798,1158,2480,8726,1466,1900,9034,5222,8223,6542,2271,6543,8525,5286,6993,4210,4215,6197,6148,2496,2497,4216,4277,3496,2051,2788,8949,2925,2471,542,4415,8131,8621,3009,7469,5931,2043,4886,6607,8611,3377,2675,8812,2590,3606,8694,2926,1620,222,3008,8948,8555,3551,7472,273,1115,2676,4156,1616,5297,7304,1357,171,201,219,3712,442,3710,6133,7581,917,918,945,949,952,953,954,991,992,1108,1112,1113,1129,1195,1207,7404,1278,1287,1303,1304,1363,1364,1366,1367,1368,1369,1370,1371,1374,1382,1391,1114,7530,1408,1412,1413,1417,1418,1419,9107,1210,1621,786,463,2453,7939,4785,1893,2075,2211,2212,5565,2472,3815,2614,1070,2791,2792,7869,3036,3159,3164,3165,3166,3167,3171,3173,578,1208,3608,3817,3918,4138,4151,4152,7180,4178,4218,4278,4280,4281,4282,4305,4306,4307,4068,5573,4491,4668,7654,4885,4887,4888,5006,5008,5011,5012,5137,5278,5285,5290,5291,5571,5572,5574,5674,5677,5678,5690,5701,5886,5887,6023,6145,6146,6147,6149,6150,6163,6172,6175,6178,6179,6180,6181,6183,6184,3819,6196,6245,3416,6253,6984,6284,6301,6312,6460,6461,6490,6491,6492,7403,6623,6972,5577,6651,7601,7602,5444,7945,7955,7956,8036,5894,8047,8411,8463,4603,8487,8530,8531,8532,8556,8575,8580,8581,8586,8735,8836,8842,8941,8942,8968,9743,9767,9869,9971]


            let leaderboard = await this.api.getLeaderboard()
            // leaderboard = leaderboard.slice(1,2)
            // leaderboard = leaderboard.filter(p => p.faction === faction)

            const landPromises = []
            for (let i = 0; i < stakedWithoutUsername.length; i++) {
                const landId = stakedWithoutUsername[i]
                console.log(`Fetching land data for ${landId} (${i+1}/${stakedWithoutUsername.length})`)
                await this.helper.sleep(100)
                landPromises.push(this.api.searchByLandId(token, landId))
            }

            const promiseResult = await Promise.all(landPromises)

            const stakedLandsWithoutUsernameData = promiseResult.filter(p => p.length > 0).flat()
            console.log(stakedLandsWithoutUsernameData)


            console.log("===2===")
            console.log(`Fetching unkown users resource count`)

            const unkownUsersPromises = []
            const userWallets = stakedLandsWithoutUsernameData.map(u => u.walletAddress)
            const uniqueWallets = userWallets.filter((wallet, index) => !userWallets.slice(index + 1).includes(wallet))
            for (let i = 0; i < uniqueWallets.length; i++) {
                const wallet = uniqueWallets[i]
                console.log(`Fetching user data for ${wallet} (${i+1}/${uniqueWallets.length})`)
                await this.helper.sleep(100)
                unkownUsersPromises.push(this.api.searchByWalletAddress(token, wallet))
            }
            
            const userPromiseResult = await Promise.all(unkownUsersPromises)
            console.log(userPromiseResult)

            // Add result to leaderboard data
            leaderboard = leaderboard.concat(userPromiseResult)
            console.log(leaderboard)

            // 0.5 add player value
            console.log("===0.5===")
            for (let index = 0; index < leaderboard.length; index++) {
                const player = leaderboard[index];
                console.log(`Fetching player data for ${player.username} (${index+1}/${leaderboard.length})`)

                let assignedAC = 0
                let unassignedAC = 0
                let unstakedAC = 0
                let unassignedLand = 0

                // get all AC and lands in wallet
                const citizenCount = await this.citizenContractService.getCitizensCountByOwner(player.walletAddress)
                console.log(`citizenCount: ${citizenCount}`)
                const citizenIds = await this.citizenContractService.getCitizenIdsByOwner(player.walletAddress, citizenCount)
                console.log(`citizenIds: ${citizenIds}`)
                const stakedIds = await this.citizenContractService.getStakedIdsFromList(citizenIds)
                console.log(`stakedIds: ${stakedIds}`)

                // get assigned status
                const result = await this.api.getAssignedByCitizenIds(token, citizenIds)
                // console.log(`result: ${result}`)

                // calculate
                assignedAC = result.filter(a => a.landTokenId != null).length
                unassignedAC = result.length - assignedAC
                unstakedAC = citizenCount - stakedIds.length
                unassignedLand = unassignedAC

                console.log(`assignedAC: ${assignedAC}`)
                console.log(`unassignedAC: ${unassignedAC}`)
                console.log(`unstakedAC: ${unstakedAC}`)
                console.log(`unassignedLand: ${unassignedLand}`)


                player.playerValue = assignedAC - unassignedAC - unstakedAC - unassignedLand
                leaderboard[index] = player

                const data = {
                    ...player,
                    assignedAC,
                    unassignedAC,
                    unstakedAC,
                    unassignedLand
                }

                fs.appendFileSync('./playerValues.json', JSON.stringify(data) + ',\n');
            }
            console.log(leaderboard)            
            
        }

        getPossibleSteal = (rarity, resourceType, playerInfo) => {
            const number = this.getTileResourceNumber(resourceType, playerInfo);
            let baseStealRate = 0

            let coefStealRate = 0
            const coefValues = [100.0000000000000,61.3167019545502,44.5106158741974,35.9962545572903,30.8516376384653,27.4068061370906,24.9387944804230,23.0837154283816,21.6384670685421,20.4807417937726,19.5325035686022,18.7416110042597,18.0719008789754,17.4975035549478,16.9994234947790,16.5633983991666,16.1785113753932,15.8362643885135,15.5299434915372,15.2541739825391,15.0046023392549,14.7776646908834,14.5704155476252,14.3803992558501,14.3017592558501,14.2231192558501,14.1444792558501,14.0658392558501,13.98719926,13.9085592558501,13.8299192558501,13.7512792558501,13.6726392558501,13.5939992558501,13.5153592558501,13.43671926,13.3580792558501,13.2794392558501,13.2007992558501,13.1221592558501,13.0435192558501,12.9648792558501,12.8862392558501,12.8075992558501,12.7239592558501,12.6503192558501,12.5716792558501,12.4930392558501,12.4143992558501]

            if(playerInfo.playerValue > coefValues.length){
                coefStealRate = coefValues[length-1]
            } else {
                coefStealRate = coefValues[playerInfo.playerValue-1]
            }

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
                
            return number * baseStealRate / 100 * coefStealRate / 100

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


    console.log("=============================")
    console.log("=      Fight Analysis       =")
    console.log("=============================")
    console.log("How to use?")
    console.log("Copy the following line with you auth token")
    console.log('window.FightAnalysis.init("Bearer lkajsdljliajldijlasjdija")')

    const api = new KryptoriaApi()
    const helper = new Helper()
    
    const url = 'https://few-summer-hexagon.discover.quiknode.pro/824fbca40deba2d23a02f8bc4196a0adf899f97a/';
    const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
    const citizenContractService = new CitizenContractService(helper)
    citizenContractService.setContract(customHttpProvider)
    // console.log(citizenContractService)
    const landContractService = new LandContractService()
    landContractService.setContract(customHttpProvider)
    // console.log(landContractService)

    // const stakedIds = await landContractService.getStakedIds()
    // stakedIds.forEach(i => {
      
    //     console.log(i)  
    // })





    const fight = new FightAnalysis(api, helper, citizenContractService, landContractService);
    

})();