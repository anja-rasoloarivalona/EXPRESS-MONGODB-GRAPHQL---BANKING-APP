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

const corsOptions = {
  origin: true, 
  credentials: true
}
app.options('*', cors(corsOptions));

app.use(helmet())

// app.use(cors({origin: '*'}))

// app.use(compression())
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
// app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Max-Age", 86400)
  if(req.method === 'OPTIONS'){
    return res.sendStatus(200)
  }
  next();
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
