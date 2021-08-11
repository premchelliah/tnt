import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { getUser, getOrderRequest } from './mongo.js';
import { putOrderRequest } from './bigchain.js';

async function startApolloServer() {
    const typeDefs = gql`
        type OrderRequest {
            id: ID!
            item: String!
            quantity: Int!
        }

        type Order {
            id: ID!
            order_req_id: ID!
            credit_check: Boolean!
            status: String!
        }

        input OrderInput {
            item: String!
            quantity: Int!
        }

        type Query {
            putOrderRequest(
                user: String!
                order_input: OrderInput!
            ): OrderRequest!
            getOrderRequest(orderRequestId: ID!): OrderRequest
            getOrder(orderId: ID!): Order
        }
    `;

    const resolvers = {
        Query: {
            putOrderRequest: async (_, { user, order_input }) =>
                putOrderRequest(await getUser(user), order_input),
            getOrderRequest: async (_, { orderRequestId }) =>
                getOrderRequest(orderRequestId),
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
