const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

const main = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    // alternatively use the prencrypted walltet
    const encryptedJson = fs.readFileSync("./encryptedKey.json", "utf-8");
    let wallet = await ethers.Wallet.fromEncryptedJson(
        encryptedJson,
        process.env.PRIVATE_KEY_PASSWORD
    );
    wallet = await wallet.connect(provider);
    // done to set up encrypted wallet
    const abi = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.abi",
        "utf-8"
    );
    const binary = fs.readFileSync(
        "SimpleStorage_sol_SimpleStorage.bin",
        "utf-8"
    );
    const factory = new ethers.ContractFactory(abi, binary, wallet);
    console.log("Deploying contract, please wait...");
    const contract = await factory.deploy({
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits("1", "gwei"),
    });
    // console.log("-------------------");
    // console.log("Deployment Receipt:");
    // console.log(contract.deployTransaction); // is the transaction response of the initial transaction and differs from the receipt
    // console.log("-------------------");
    const transactionReceipt = await contract.deployTransaction.wait(1); // Wait for 1 confirmation only
    console.log("Done");
    // if you wait for at least 1 confirmation, you can be sure that the contract has been deployed and you will get the transaction receipt!
    // console.log("-------------------");
    // console.log("Transaction receipt:"); // is the finished transaction receipt
    // console.log(transactionReceipt);
    // console.log("-------------------");
    return {
        provider,
        abi,
        binary,
        factory,
        contract,
        transactionReceipt,
    };
};

const interactWithContract = async ({
    provider,
    abi,
    binary,
    factory,
    contract,
    transactionReceipt,
}) => {
    const currentFavoriteNumber = await contract.retrieve();
    console.log("Current favorite number: ", currentFavoriteNumber.toString()); // will return bigNumber needs to be converted to string
    const transactionResponse = await contract.store("10");
    const transActionReceipt = await transactionResponse.wait(1);
    const newFavoriteNumber = await contract.retrieve();
    console.log("New favorite number: ", newFavoriteNumber.toString());
};

const deployViaRawTransactionData = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
        "http://localhost:7545"
    );
    const wallet = new ethers.Wallet(
        "9a98b9af1237e26d74b18ecb94d9ffbbc48447939a72a33d9cc830c0af9d94eb",
        provider
    );
    const abi = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.abi",
        "utf-8"
    );
    const binary = fs.readFileSync(
        "SimpleStorage_sol_SimpleStorage.bin",
        "utf-8"
    );
    // nonce - number only used once
    const tx = {
        nonce: await wallet.getTransactionCount(), // look into ganache to see what the current nonce is plus 1 or use the saver method
        gasPrice: 20000000000,
        gasLimit: 1000000,
        to: null, // null because it is a new contract
        value: 0, // no ether required only gas price
        data: "0x" + binary, // that can be literally filled with anything, and we are using it here to paste the solidity code
        chainId: 1337,
    };
    // const signedTxResponse = await wallet.signTransaction(tx);
    // console.log(signedTxResponse);
    // const sentTxResponse = await provider.sendTransaction(signedTxResponse);

    // this is saver:
    const sentTxResponse = await wallet.sendTransaction(tx);
    console.log(sentTxResponse);
};

if (require.main === module) {
    // The then needs to be here to print better error notifications
    main()
        .then((response) => {
            interactWithContract(response).then(() => process.exit(0));
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
