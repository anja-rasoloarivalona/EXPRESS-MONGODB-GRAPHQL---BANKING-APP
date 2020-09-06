import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import graphHttp from 'express-graphql'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import graphqlSchema from './graphql/schema/index.js'
import graphqlResolver from './graphql/resolvers/index.js'
import isAuth from './middleware/is-auth.js'

const app = express();

// const corsOptions = {
//   origin: true, 
//   credentials: true
// }

// app.use(helmet())
// app.use(compression())


let allowedOrigin = [
  'https://wallet-anja.firebaseapp.com',
];

app.use(
  cors({
      origin: (origin, callback) => {
          if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
              callback(null, true);
          } else {
              callback(new Error('Not allowed by CORS'));
          }
      },
      credentials: true
  })
);


// app.use(cors({origin: '*'}))


// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
// app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log('request', req)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
  // res.header("Access-Control-Allow-Credentials", true);
  // res.header("Access-Control-Max-Age", 86400)
  if(req.method === 'OPTIONS'){
    console.log('is options', res)
    return res.sendStatus(204)
  } 
  next()
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
