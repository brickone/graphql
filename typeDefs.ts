import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Program {
    degree: String
    delivery: String
    id: String!
    location: String
    name: String
    school: String
    tuition: String
  }

  type ProgramsConnection {
    items: [Program]
    nextToken: String
  }

  type Query {
    getPrograms(id: String): Program
    listPrograms(
      filter: TableProgramsFilterInput
      limit: Int
      nextToken: String
    ): ProgramsConnection
    queryProgramsByDegree(degree: String, name: String, limit: Int, nextToken: String): ProgramsConnection
  }

  input TableProgramsFilterInput {
    degree: TableStringFilterInput
    delivery: TableStringFilterInput
    id: TableStringFilterInput
    location: TableStringFilterInput
    name: TableStringFilterInput
    school: TableStringFilterInput
    tuition: TableStringFilterInput
  }

  input TableStringFilterInput {
    ne: String
    eq: String
    le: String
    lt: String
    ge: String
    gt: String
    contains: String
    notContains: String
    between: [String]
    beginsWith: String
  }
`;

export default typeDefs;
