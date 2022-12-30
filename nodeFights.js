const fs = require('fs');
const ethers = require('ethers');  
const fetch = require('node-fetch');

//  =================== TODO ===================
// [ ] Bug: unassigned lands != unsassigned citizen because if you have more citizens than lands it's wrong
// [ ] Feat: Add citizenIds to check again when different number in the other script

(function() {
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
            await this.helper.sleep(50)
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


    }

    class FightAnalysis {

        constructor(api, helper, citizenContractService, landContractService) {
            this.api = api;
            this.helper = helper;
            this.citizenContractService = citizenContractService
            this.landContractService = landContractService
        }

        init = async (token, faction) => {

            // const exception = ["N/A", "N/A.", "Bees-nest.eth[DD]", "KRYPT0RN/A", "n/a", "WintersGrip#3078", "GreenLeader#6834", "Eamonn#2182", "bp#5699", "#Gumbo", "alex#4129", "YouGunnaHitDat?", "darkSTAR/ZX"]


            const leaderboard = await this.api.getLeaderboard()
            // leaderboard = leaderboard.slice(1,2)
            // leaderboard = leaderboard.filter(p => p.faction === faction)

            // 0.5 add player value
            console.log("===0.5===")
            for (let index = 430; index < leaderboard.length; index++) {
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





    const fight = new FightAnalysis(api, helper, citizenContractService, landContractService);
    
    fight.init("", "kryptorian")

})();