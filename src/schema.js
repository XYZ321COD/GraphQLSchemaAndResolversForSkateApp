const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar DateTime

  type User {
    UserID: ID!
    Login: String!
    Password: String!
    Phone: String!
    Mail: String!
    Comments: [Comment!]
    Likes: [Like!]
    createdAt: DateTime!
  }

  type Location {
    LocationID: ID!
    Name: String!
    Description: String!
    Medias: [String]!
    Rates: [Float!]
    Adress: String!
    Comments: [Comment!]
    createdAt: DateTime!
  }

  type Comment {
    CommentID: ID!
    User: User!
    authorId: ID!
    locationId: ID!
    Location: Location!
    Context: String!
    Likes: [Like!]
    Medias: [String]!
    createdAt: DateTime!
  }

  type Like {
    LikeID: ID!
    authorId: ID!
    commentId: ID!
    locationId: ID!
    Type: String!
  }

  type Mutation {
    signup(registerData: RegisterInput!): AuthPayload
    login(loginData: LoginInput!): AuthPayload
    resetPassword(Mail: String!): String
    changePassword(changePasswordData: changePasswordInput!): String
    createComment(comment: CommentInput!): Comment!
    deleteComment(CommentID: ID!): String
    createLocation(location: LocationInput!): Location!
    deleteLocation(LocationID: ID!): String!
    rateLocation(Rate: Rate!): String!
    likeComment(LikeInput: LikeInput!): Like!
    unlikeComment(LikeID: ID!): String
  }

  type Query {
    getRates(LocationID: ID!): [Float!]
    getComment(CommentID: ID!): Comment
    getLocation(LocationID: ID!): Location
    getLocationByName(Name: String!): Location
    getUser(UserID: ID!): User
    getLike(LikeID: ID!): Like
    getLikesForComment(CommentID: ID!): [Like!]
    getLikesForUser(UserID: ID!): [Like!]
    getAllCommentsForLocation(LocationID: ID!): [Comment!]
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    login: String!
    password: String!
    confirmPassword: String!
    mail: String!
  }

  input LoginInput {
    login: String!
    password: String!
    mail: String!
  }

  input changePasswordInput {
    login: String!
    password: String!
    confirmNewPassword: String!
    newPassowrd: String!
  }

  input CommentInput {
    context: String!
    medias: [String]!
    locationID: ID!
  }

  input LocationInput {
    name: String!
    description: String!
    medias: [String]!
    adress: String!
  }

  input Rate {
    rate: Float!
    locationID: ID!
  }

  input LikeInput {
    commentId: ID!
    locationId: ID!
    type: String!
  }
`;
module.exports = typeDefs;
