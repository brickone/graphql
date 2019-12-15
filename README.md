## Cluster GraphQL

This api was created using Apollo Server and Typescript

### To view in production

This api is deployed on ECS and can be viewed via cloudfront at https://d6ykq6a5hva4z.cloudfront.net/graphql
![Codepipline](https://cluster-images-12313.s3-us-west-2.amazonaws.com/API+Routing.png)

### Continous deployment

This api is deployed via AWS Codepipline
![ECS](https://cluster-images-12313.s3-us-west-2.amazonaws.com/API+Deployment+(1).png)

### To start the api locally

Please note: The dataset has been stored in DynamoDB. Therefore, queries must be executed within the AWS enviornament and you cannot query DynamoDB locally
```bash
git clone https://github.com/brickone/graphql.git
cd ./graphql
npm install
npm start
```