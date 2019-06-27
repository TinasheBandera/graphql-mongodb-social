const postResolvers = require('./posts');
const userResolvers = require('./users');
const commentResolvers = require('./comments');


module.exports = {
    Query: {
        ...postResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commentResolvers.Mutation
    },
    Subscription: {
        ...postResolvers.Subscription
    },
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    }
}