"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Comment",
    embedded: false
  },
  {
    name: "Location",
    embedded: false
  },
  {
    name: "Like",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://skatespotstest-ee81a0790e.herokuapp.com/BackEndSkateSpots/dev`
});
exports.prisma = new exports.Prisma();
