import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { getUser, getOrderRequest } from './mongo.js';
import { putOrderRequest } from './bigchain.js';

async function startApolloServer() {
    const typeDefs = gql`
        type OrderRequest {
            orderNo: ID!
            orderDate: String!
            itemCode: String!
            itemDescription: String!
            itemQuantity: Int!
            requiredByDate: String!
            status: String!
        }

        type Order {
            orderId: ID!
            orderNo: String!
            date: String!
            customerDetails: String!
            billTo: String!
            shipTo: String!
            itemCode: String!
            itemDescription: String!
            itemQty: Float!
            itemUOM: String!
            itemRate: Float!
            currencyCode: String!
            discount: Float!
            nettOrderValue: Float!
            taxPercentage: Float!
            grossOrderValue: Float!
            payTerms: String!
            shipmentMethod: String!
            shipAfterDate: String!
            shipBeforeDate: String!
            estimatedDateOfDelay: String!
            additionalFlexField: String!
            requiredByDate: String!
            orderReceiptStatus: String!
            itemCheck: Boolean!
            quantityCheck: Boolean!
            addressCheck: Boolean!
            priceCheck: Boolean!
            creditCheck: Boolean!
            termsCheck: Boolean!
            inventoryAvailableCheck: Boolean!
            inventoryAllocated: Boolean!
            warehouse: String!
            quantityAvailable: Float!
            quantityAllocated: Float!
            backorderedQuantity: Float!
            status: String!
        }

        input OrderRequestInput {
            orderNo: ID!
            itemCode: String!
            itemQuantity: Int!
            requiredByDate: String!
        }

        type Query {
            putOrderRequest(
                user: String!
                order_request: OrderRequestInput!
            ): ID!
            getOrderRequest(orderId: ID!): OrderRequest
            getOrder(orderId: ID!): Order
        }
    `;

    const resolvers = {
        Query: {
            putOrderRequest: async (_, { user, order_request }) =>
                putOrderRequest(await getUser(user), order_request),
            getOrderRequest: async (_, { orderId }) => getOrderRequest(orderId),
            getOrder: () => 'Hello world!',
        },
    };

    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    const app = express();
    server.applyMiddleware({ app });

    await new Promise((resolve) => app.listen({ port: 4000 }, resolve));
    console.log(
        `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
    return { server, app };
}
startApolloServer();
