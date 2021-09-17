const core = require('@actions/core');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { typesBundleForPolkadot } = require('@crustio/type-definitions');
const { checkCid, checkSeeds, sendTx, loadKeyringPair } = require('./util');

async function main() {
    // 1. Get all inputs
    const cid = core.getInput('cid'); // Currently, we only support CIDv0
    const size = core.getInput('size');
    const seeds = core.getInput('seeds');
    const chainAddr = core.getInput('crust-endpoint');

    // 2. Check cid and seeds
    if (!checkCid(cid) || !checkSeeds(seeds)) {
        throw new Error('Illegal inputs');
    }

    // 3. Try to connect to Crust Chain
    const chain = new ApiPromise({
        provider: new WsProvider(chainAddr),
        typesBundle: typesBundleForPolkadot,
    });
    await chain.isReadyOrError;

    // 4. Construct tx
    const tx = chain.tx.market.placeStorageOrder(cid, size, 0, '');

    const krp = loadKeyringPair(seeds);
    const nonce = await chain.rpc.system.accountNextIndex(krp.address);

    // 5. Send tx and disconnect chain
    const status = await sendTx(tx, krp, nonce);
    chain.disconnect();

    core.setOutput('isSent', status.isSent);
    core.setOutput('txHash', status.txHash);
}

main().catch((error) => {
    core.setFailed(error.message);
});
