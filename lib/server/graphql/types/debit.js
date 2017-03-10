'use strict';

const graphql = require('graphql');

const DebitType = new graphql.GraphQLObjectType({
  name: 'Debit',
  fields: {
    id: {type: graphql.GraphQLString},
    amount: {type: graphql.GraphQLFloat},
    bandwidth: {type: graphql.GraphQLInt},
    storage: {type: graphql.GraphQLInt},
    created: {type: graphql.GraphQLString},
    type: {type: graphql.GraphQLString},
  }
});

module.exports = DebitType;
