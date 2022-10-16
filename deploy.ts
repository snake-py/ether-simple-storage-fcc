import ethers from "ethers";
import fs from "fs-extra";

const main = async () => {
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
    const factory = new ethers.ContractFactory(abi, binary, wallet);
    console.log("Deploying contract, please wait...");
    const contract = await factory.deploy({
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits("1", "gwei"),
    });
    console.log("Contract deployed to address:", contract.address);
    const deploymentReceipt = await contract.deployTransaction.wait();
    console.log(deploymentReceipt);
    console.log("Deployment took", deploymentReceipt.gasUsed.toString());
};

const setUp = async () => {
    return;
};

if (require.main === module) {
    // The then needs to be here to print better error notifications
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
