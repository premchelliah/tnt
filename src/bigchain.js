import driver from 'bigchaindb-driver';

const API_PATH = 'http://192.168.50.94:9984/api/v1/';

export async function putOrderRequest(user, order_input) {
    const conn = new driver.Connection(API_PATH);
    let result;
    try {
        result = await conn.postTransactionCommit(
            driver.Transaction.signTransaction(
                driver.Transaction.makeCreateTransaction(
                    order_input,
                    null, // split metadata from order_input into this object
                    [
                        driver.Transaction.makeOutput(
                            driver.Transaction.makeEd25519Condition(
                                user.private
                            )
                        ),
                    ],
                    user.public
                ),
                user.private
            )
        );
    } catch (e) {
        console.error(JSON.stringify(e));
    }
    return { id: result.id, ...result.asset.data };
}
