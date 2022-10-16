const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

const main = async () => {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const encryptedJsonKeystore = await wallet.encrypt(
        process.env.PRIVATE_KEY_PASSWORD,
        process.env.PRIVATE_KEY
    );
    console.log(encryptedJsonKeystore);
    fs.writeFileSync("./encryptedKey.json", encryptedJsonKeystore);
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
