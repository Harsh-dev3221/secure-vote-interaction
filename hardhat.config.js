/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.8.4",
    networks: {
        localhost: {
            url: "http://127.0.0.1:7545",
            chainId: 1337
        }
    },
    paths: {
        sources: "./contracts",
        artifacts: "./src/artifacts"
    }
}; 