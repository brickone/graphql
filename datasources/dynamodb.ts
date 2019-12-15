import { DataSource } from "apollo-datasource";
import { DynamoDB, KMS } from "aws-sdk";
import _ from "lodash";
const kms = new KMS();

interface IProps {
  region: "us-west-2";
}

interface IFilter {
  [key: string]: string | number | boolean | null;
}

class DynamoDBDataSource extends DataSource {
  private client: DynamoDB.DocumentClient;
  constructor(props: IProps) {
    super();
    this.client = new DynamoDB.DocumentClient({ region: props.region });
  }

  /**
   * Decrypts a base64encoded CiphertextBlob which contains a DynamoDB ExclusiveStartKey
   * @param paginationToken A base64encoded CiphertextBlob
   */

  public async decrypt(paginationToken?: string) {
    if (!paginationToken) {
      return;
    }

    const token = decodeURIComponent(paginationToken);
    const CiphertextBlob = Buffer.from(token, "base64");
    const { Plaintext } = await kms.decrypt({ CiphertextBlob }).promise();
    const LastEvaluatedKey = (Plaintext as Buffer).toString("ascii");
    return JSON.parse(LastEvaluatedKey);
  }

  public async delete(params: DynamoDB.DocumentClient.DeleteItemInput) {
    await this.client.delete(params).promise();

    return {
      deleted: true,
      id: params.Key.id
    };
  }

  /**
   * Encrypts a DynamoDB LastEvaluatedKey
   * @param LastEvaluatedKey A DynamoDB LastEvaluatedKey
   */

  public async encrypt(LastEvaluatedKey?: DynamoDB.DocumentClient.Key) {
    if (!LastEvaluatedKey) {
      return;
    }

    const KeyId = "alias/paginationKey";
    const Plaintext = JSON.stringify(LastEvaluatedKey);
    const { CiphertextBlob } = await kms.encrypt({ KeyId, Plaintext }).promise();
    const encryptedString = (CiphertextBlob as Buffer).toString("base64");
    return encodeURIComponent(encryptedString);
  }

  public async get(params: DynamoDB.DocumentClient.GetItemInput) {
    const results = await this.client.get(params).promise();

    return results.Item;
  }

  /**
   * Converts an object to a DynamoDB Condition
   * @param filter Object to convert to condition
   * @param ComparisonOperator Operator used in condition
   */

  public formatFilters(filter?: IFilter, ComparisonOperator: string = "EQ") {
    if (!filter || _.isEmpty(filter)) {
      return;
    }

    delete filter.limit;
    delete filter.nextToken;
    const query = {};
    Object.keys(filter).map(key => {
      const AttributeValueList = [filter[key]];
      query[key] = { AttributeValueList, ComparisonOperator };
    });
    return query;
  }

  /**
   * Converts an object to DyanmoDB AttributeUpdates object
   * @param params Object used to update record
   */

  public formatUpdates(params: IFilter) {
    const query = {};
    Object.keys(params).map(key => {
      if (_.isUndefined(params[key])) {
        return;
      }

      const Action = _.isNull(params[key]) ? "DELETE" : "PUT";
      const Value = _.isNull(params[key]) ? undefined : params[key];
      query[key] = { Action, Value };
    });
    return query;
  }

  public async query(params: DynamoDB.DocumentClient.QueryInput) {
    const results = await this.client.query(params).promise();

    return {
      items: results.Items,
      nextToken: this.encrypt(results.LastEvaluatedKey)
    };
  }

  public async put(params: DynamoDB.DocumentClient.PutItemInput) {
    await this.client.put(params).promise();
    const query = { TableName: params.TableName, Key: { id: params.Item.id } };
    const results = await this.client.get(query).promise();

    return results.Item;
  }

  public async scan(params: DynamoDB.DocumentClient.ScanInput) {
    const results = await this.client.scan(params).promise();

    return {
      items: results.Items,
      nextToken: this.encrypt(results.LastEvaluatedKey)
    };
  }

  /**
   * Converts an object to a DynamoDB Condition
   * @param filter Object to convert to condition
   */

  public scanFilter(filter: IFilter) {
    if (!filter || _.isEmpty(filter)) {
      return;
    }

    delete filter.limit;
    delete filter.nextToken;

    const query = {};
    Object.keys(filter).map(key => {
      let AttributeValueList = Object.values(filter[key]);
      let ComparisonOperator = Object.keys(filter[key])[0].toUpperCase();

      if (ComparisonOperator === "NOTCONTAINS") {
        ComparisonOperator = "NOT_CONTAINS";
      } else if (ComparisonOperator === "BEGINSWITH") {
        ComparisonOperator = "BEGINS_WITH";
      }
      
      if (ComparisonOperator === "BETWEEN") {
        AttributeValueList = Object.values(filter[key])[0];
      }
      query[key] = { AttributeValueList, ComparisonOperator };
    });
    return query;
  }

  public async update(params: DynamoDB.DocumentClient.UpdateItemInput) {
    await this.client.update(params).promise();
    const query = { TableName: params.TableName, Key: params.Key };
    const results = await this.client.get(query).promise();

    return results.Item;
  }
}

export default DynamoDBDataSource;
