import {Arianee, NETWORK} from "@arianee/arianeejs";
import {createRequestFromPathAndMethod, pathFinderFromWallet} from "./libs/arianee-path-finder";
import axios from 'axios';
import {AuthByApiKey} from "./middlewares/auth-middleware";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
process.env.apiKey='myApiKey'

const port = process.env.PORT || 3000;
const privateKey=process.env.privateKey || '0xff7cdcab8d92c87fa8e5fe6af70fcefc5b1df398bcc7ca3d16981f535a9d8d85';
const chain:NETWORK=process.env.chain as NETWORK || NETWORK.arianeeTestnet;


(async function() {
    const arianee = await new Arianee().init(chain);
    const wallet = privateKey?arianee.fromPrivateKey(privateKey):arianee.fromRandomMnemonic();

    if(process.env.useBDH){
        wallet.useBDHVault(process.env.useBDH);
    }

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(AuthByApiKey)

    app.get('/hello',(req,res)=> {
        return res.send('world');
    });


    const othersMethods=[
    {
        path:'/requestAria',
        method: createRequestFromPathAndMethod(wallet.requestAria)
    },
    {
        path:'/requestPoa',
        method: createRequestFromPathAndMethod(wallet.requestPoa)
    },
    {
        path:'/publicKey',
        method: createRequestFromPathAndMethod(()=>wallet.publicKey)
    },
    ... pathFinderFromWallet(wallet.methods)
]
        .forEach(method=>{
            console.log('accepted methods',method.path)
            app.post(method.path,AuthByApiKey,method.method)
        });


    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
    console.log("public key",wallet.publicKey);

})()

