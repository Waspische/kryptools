/* eslint-disable no-bitwise,no-param-reassign,class-methods-use-this */
// import * as turf from '@turf/turf'
// import polygonClipping from 'polygon-clipping'
// import tilePolygonHelper from '@/utils/tilePolygonHelper'
import { ethers } from 'ethers'

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

        const landIds = []

        for (let i = 0; i < count; i++) {
            landIds.push(await this.getLandByOwnerandIndex(ownerAddress, i))
        }

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

const landContractService = new LandContractService()
export default landContractService
