const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {toHex, utf8ToBytes} = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0441e0afeaf16ca31d0e0844a3616ec2f9e137ec80d1ab64fe28bec7eac04444ecc359147b45486dd91ce553ecd406e221258c36b325ef9d9dc22fc2a4d34de105": 1000,
  "04bee60c99886bfc2a49647f61bf71dd15ff9b7a545b5c8d021255a797840a4913ae8120676aeecf47bb0ee9f17debf1ac8cf16a15fdc9a1a5c42ecb299923b5c0": 500,
  "04e5ae9c2fee29cf83a892025f0becd3e817f4458f15ae124a10d944a5907fbd86385d85cde9674d833b7b2b8a7cb16cd60b23285cff5ba61cc6bb9e697f7bf542": 750,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, recovery } = req.body;

  if(!signature) res.status(404).send({ message: "signature dont was provide" });
  if(!recovery) res.status(400).send({ message: "recovery dont was provide" });

  // setInitialBalance(sender);
  // setInitialBalance(recipient);

  // if (balances[sender] < amount) {
  //   res.status(400).send({ message: "Not enough funds!" });
  // } else {
  //   balances[sender] -= amount;
  //   balances[recipient] += amount;
  //   res.send({ balance: balances[sender] });
  // }
  try {
    
    const bytes = utf8ToBytes(JSON.stringify({ sender, recipient, amount }));
    const hash = keccak256(bytes);

    const sig = new Uint8Array(signature);

    const publicKey = await secp.recoverPublicKey(hash, sig, recovery);

    if(toHex(publicKey) !== sender){
      res.status(400).send({ message: "signature no is valid" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    console.log(error.message)
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
