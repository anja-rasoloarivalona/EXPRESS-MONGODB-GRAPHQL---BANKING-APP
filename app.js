import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import graphHttp from 'express-graphql'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import graphqlSchema from './graphql/schema'
import graphqlResolver from './graphql/resolvers'

import isAuth from './middleware/is-auth'

const app = express();

app.use(helmet())
app.use(compression())

app.use('*', cors());

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
// app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('options')
    var headers = {};
    // IE8 does not allow domains to be specified, just the *
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
    res.writeHead(200, headers);
    return res.end()
  } else {
    console.log('else')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Methods', "POST, GET, PUT, DELETE, OPTIONS");
    next()
  }
});


app.use(isAuth)


app.use('/graphql', graphHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: false,
  customFormatErrorFn: err => {
    if(!err.originalError) {
      return err
    }
    const message = err.message || 'An error occured';
    const code = err.originalError.code || 500;
    return ({
      message: message,
      status: code
    })
  }
}))

mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wijrw.mongodb.net/bank`, { useNewUrlParser: true, useUnifiedTopology: true } )
  .then(result => {
    app.listen(process.env.PORT || 8000)
    console.log('connected')
  })
  .catch(err => console.log(err));
