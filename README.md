# TO RUN
Block Talk is a Chomium-based browser extension that enables censorship-resistant, sybil-resistant social chat forums for any URL across the web.

Powered by IPFS, WalletConnect, Lens, Waku, and the EVM

## Extension Import (for local)
1. Go to "Manage Extensions" (In Chrome, ideally)
2. Enable "Developer mode" 
3. Click on "Load unpacked"
4. Select the entire "blocktalk-ext" folder and import.

## Server Side (for local)
2. cd blocktalk-sv
3. npm install
4. npm run start:dev

## Hardhat Setup (only for deployer)
1. yarn init
2. yarn add --dev hardhat
3. npx hardhat init
4. npx hardhat compile
5. npx hardhat run --network goerli contract-scripts/deploy.js

npx hardhat run --network arbitrum-goerli contract-scripts/deploy.js
###to Verify the Contract:
npx hardhat --network goerli verify --contract "contracts/<token>.sol:<token>" <deploy addr> "<TOKEN CONTRACT NAME>" "<TOKEN NAME>"
npx hardhat help
npx hardhat test

npx hardhat --network arbitrum-goerli verify --contract "contracts/BlockTalk.sol:BlockTalk" 0x91f37d859A608419B665AbA41Fc397B18F1468A6