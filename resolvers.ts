import { DynamoDB } from "aws-sdk";
import { IContext } from "./datasources";

interface IQueryArgs {
  degree?: string;
  limit?: number;
  name?: string;
  nextToken?: string;
}

interface IFilter {
  [key: string]: string | number | boolean | null;
}

interface IListArgs {
  filter?: IFilter;
  limit?: number;
  nextToken?: string;
}

/**
 * Returns a single record
 * @param _ 
 * @param args ID required to query record
 * @param context Datasources to query
 */

const getPrograms = async (_: {}, args: { id: string }, context: IContext) => {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    Key: { id: args.id },
    TableName: "ClusterPrograms"
  };

  return await context.dataSources.dynamodb.get(params);
};

/**
 * Returns a list of records
 * @param _ 
 * @param args Properties used to filter data
 * @param context Datasources to query
 */

const listPrograms = async (_: {}, args: IListArgs, context: IContext) => {
  const params: DynamoDB.DocumentClient.ScanInput = {
    ExclusiveStartKey: await context.dataSources.dynamodb.decrypt(args.nextToken),
    Limit: args.limit,
    ScanFilter: context.dataSources.dynamodb.scanFilter(args.filter),
    TableName: "ClusterPrograms"
  };

  return await context.dataSources.dynamodb.scan(params);
};

/**
 * Returns a list of records by degree and name
 * @param _ 
 * @param args Properties used to filter data
 * @param context Datasources to query
 */

const queryProgramsByDegree = async (_: {}, args: IQueryArgs, context: IContext) => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    ExclusiveStartKey: await context.dataSources.dynamodb.decrypt(args.nextToken),
    IndexName: "status-name-index",
    KeyConditions: {
      status: {
        AttributeValueList: ["active"],
        ComparisonOperator: "EQ"
      }
    },
    Limit: args.limit,
    TableName: "ClusterPrograms"
  };

  if (args.degree) {
    params.IndexName = "degree-name-index",
    params.KeyConditions = {
      degree: {
        AttributeValueList: [args.degree],
        ComparisonOperator: "EQ"
      }
    };
  }

  if (args.name) {
    params.KeyConditions.name = {
      AttributeValueList: [args.name.toLowerCase()],
      ComparisonOperator: "BEGINS_WITH"
    };
  }

  return await context.dataSources.dynamodb.query(params);
};

const resolvers = {
  Query: {
    getPrograms,
    listPrograms,
    queryProgramsByDegree
  }
};

export default resolvers;
