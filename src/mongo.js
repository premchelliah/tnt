import { MongoClient } from 'mongodb';
import driver from 'bigchaindb-driver';

const client = new MongoClient('mongodb://192.168.50.94:27017');

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
    const collection = client.db('bigchain').collection('assets');
    const result = await collection.find({ id }).toArray();
    if (result.length) return { id: result[0].id, ...result[0].data };
    return null;
}
