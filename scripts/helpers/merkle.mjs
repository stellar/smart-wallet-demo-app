import { SimpleMerkleTree } from '@openzeppelin/merkle-tree';
import { Address, xdr } from '@stellar/stellar-sdk';
import { createHash } from 'crypto';

function makeReceiver(index, address, amount) {
    const hi = Math.floor(amount / Math.pow(2, 64));
    const lo = amount % Math.pow(2, 64);

    const indexEntry = new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('index'),
        val: xdr.ScVal.scvU32(index),
    });

    const addressEntry = new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('address'),
        val: xdr.ScVal.scvAddress(Address.fromString(address).toScAddress())
    });

    const amountEntry = new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('amount'),
        val: xdr.ScVal.scvI128(new xdr.Int128Parts({
            hi: xdr.Int64.fromString(hi.toString()),
            lo: xdr.Uint64.fromString(lo.toString())
        }))
    });

    const allEntries = [addressEntry, amountEntry, indexEntry];

    const scVal = xdr.ScVal.scvMap(allEntries);
    return scVal.toXDR();
}

function sha256(left, right) {
    const bytesA = Buffer.from(left.slice(2), 'hex'); // Remove '0x' prefix
    const bytesB = Buffer.from(right.slice(2), 'hex');

    const digest = createHash('sha256');

    if (Buffer.compare(bytesA, bytesB) < 0) {
        digest.update(bytesA);
        digest.update(bytesB);
    } else {
        digest.update(bytesB);
        digest.update(bytesA);
    }

    return '0x' + digest.digest('hex');
}

function generateMerkleProofs(receivers) {
    const serializedReceivers = receivers.map((receiver, index) =>
        makeReceiver(index, receiver.address, receiver.amount)
    );

    const hashedReceivers = serializedReceivers.map(data =>
        createHash('sha256').update(data).digest()
    );

    const tree = SimpleMerkleTree.of(hashedReceivers, {
        nodeHash: sha256,
        sortLeaves: true
    });

    const proofs = receivers.map((receiver, index) => {
        const hashedData = hashedReceivers[index];
        const proof = tree.getProof(hashedData);

        return {
            index,
            receiver,
            proofs: proof.map(p => {
                return p.slice(2); // Remove '0x' prefix
            })
        };
    });

    return {
        root: tree.root.slice(2), // Remove '0x' prefix
        proofs
    };
}

export { generateMerkleProofs };