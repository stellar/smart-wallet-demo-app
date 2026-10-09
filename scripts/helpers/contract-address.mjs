import { Address, StrKey, hash, xdr } from '@stellar/stellar-sdk';

const NETWORK_PASSPHRASES = {
    testnet: 'Test SDF Network ; September 2015',
    mainnet: 'Public Global Stellar Network ; September 2015'
};

export function resolveNetworkPassphrase(network) {
    const passphrase = NETWORK_PASSPHRASES[network];
    if (!passphrase) {
        throw new Error(`Unknown network: ${network}. Expected one of: ${Object.keys(NETWORK_PASSPHRASES).join(', ')}`);
    }
    return passphrase;
}

// Mirrors stellar-disbursement-platform-backend's internal/utils/contract_salt.go,
// so the salt computed here always matches the one SDP used to deploy the wallet.
export function computeSaltFromEmail(email) {
    const normalized = email.trim().toLowerCase();
    return hash(Buffer.from(`EMAIL:${normalized}`, 'utf8'));
}

// Mirrors stellar-disbursement-platform-backend's internal/utils/contract_address.go
// (CalculateContractAddressFromReceiver). Computable entirely offline: no SDP or
// wallet-backend call needed, and no dependency on the wallet having been deployed yet.
export function computeContractAddressFromEmail(email, distributionAccountPublicKey, networkPassphrase) {
    const salt = computeSaltFromEmail(email);
    const address = new Address(distributionAccountPublicKey).toScAddress();

    const preimage = xdr.HashIdPreimage.envelopeTypeContractId(new xdr.HashIdPreimageContractId({
        networkId: hash(Buffer.from(networkPassphrase, 'utf8')),
        contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(new xdr.ContractIdPreimageFromAddress({
            address,
            salt
        }))
    }));

    return StrKey.encodeContract(hash(preimage.toXDR()));
}
