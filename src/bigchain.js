import driver from 'bigchaindb-driver';

const API_PATH = 'http://192.168.50.94:9984/api/v1/';

export async function putOrderRequest(user, orderRequest) {
    const conn = new driver.Connection(API_PATH),
        orderNo = orderRequest.orderNo;
    delete orderRequest.orderNo;
    orderRequest.orderDate = new Date().toISOString();
    let result;
    try {
        result = await conn.postTransactionCommit(
            driver.Transaction.signTransaction(
                driver.Transaction.makeCreateTransaction(
                    { orderNo },
                    { orderRequest }, // split metadata from order_input into this object
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
    return result.id;
}
