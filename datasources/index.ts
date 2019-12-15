import DynamoDBDataSource from "./dynamodb";

interface IDataSources {
  dynamodb: DynamoDBDataSource;
}

export interface IContext {
  dataSources: IDataSources;
}

const dataSources = () => {
  return {
    dynamodb: new DynamoDBDataSource({ region: "us-west-2" })
  };
};

export default dataSources;