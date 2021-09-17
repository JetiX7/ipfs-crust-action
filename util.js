const { Keyring } = require('@polkadot/keyring');

/* PUBLIC METHODS */
/**
 * Check CIDv0 legality
 * @param {string} cid
 * @returns boolean
 */
function checkCid(cid) {
    return cid.length === 46 && cid.substr(0, 2) === 'Qm';
}

/**
 * Check seeds(12 words) legality
 * @param {string} seeds
 * @returns boolean
 */
function checkSeeds(seeds) {
    return seeds.split(' ').length === 12;
}

/**
 * Send tx to Crust Network
 * @param {import('@polkadot/api/types').SubmittableExtrinsic} tx
 * @param {string} seeds 12 secret words
 * @returns Promise<boolean> send tx success or failed
 */
async function sendTx(tx, krp, nonce) {
    try {
        console.log('⛓  Sending tx to chain - getting hash...');

        // Send tx to chain, get txHash without waiting for transaction to be included
        const txHash = await tx.signAndSend(krp, { nonce });
        console.log(`  ↪ 💸  Transaction is submitted, nonce: ${nonce}`);

        return { isSent: true, txHash: txHash.toString() };
    } catch (e) {
        console.error('  ↪ ❌  Send transaction failed');
        console.error(e);
        return { isSent: false, txHash: null };
    }
}

/* PRIVATE METHODS  */
/**
 * Load keyring pair with seeds
 * @param {string} seeds
 */
function loadKeyringPair(seeds) {
    const kr = new Keyring({
        type: 'sr25519',
    });

    const krp = kr.addFromUri(seeds);
    return krp;
}

module.exports = {
    checkCid,
    checkSeeds,
    sendTx,
    loadKeyringPair,
};
