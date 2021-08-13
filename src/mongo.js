import { MongoClient } from 'mongodb';
import driver from 'bigchaindb-driver';

const client = new MongoClient('mongodb://192.168.50.232:27017');

export async function getUser(user) {
    await client.connect();
    let usr;
    const collection = client.db('tnt').collection('keys');
    const result = await collection.find({ user }).toArray();
    if (result.length > 1)
        throw Exception(`duplicate user ${user} exist. check unique index.`);
    if (!result.length || !result[0].private || !result[0].private) {
        const keys = new driver.Ed25519Keypair();
        usr = { user, private: keys.privateKey, public: keys.publicKey };
        await collection.updateOne({ user }, { $set: usr }, { upsert: true });
    } else {
        usr = result[0];
        delete usr._id;
    }
    client.close();
    return usr;
}

export async function getOrderRequest(id) {
    await client.connect();
    const bcdb = client.db('bigchain'),
        asset = bcdb.collection('assets'),
        metadata = bcdb.collection('metadata'),
        assetresult = await asset.find({ id }).toArray(),
        metadataresult = await metadata.find({ id }).toArray();

    client.close();
    if (assetresult.length)
        return {
            orderId: assetresult[0].id,
            ...assetresult[0].data,
            ...metadataresult[0].metadata.orderRequest,
        };
    return null;
}
