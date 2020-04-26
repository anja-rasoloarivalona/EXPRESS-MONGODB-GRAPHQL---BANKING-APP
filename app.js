const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const graphHttp = require('express-graphql');
const cors = require('cors');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth')

const app = express();


app.use('*', cors());

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if(req.method === 'OPTIONS'){
    return res.sendStatus(200)
  }
  next();
});

app.use(isAuth)


app.use('/graphql', graphHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
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

// app.use((error, req, res, next) => {
//   console.log('middleware app reached', error);
//   const status = error.statusCode || 500;
//   const message = error.message;
//   const data = error.data;
//   res.status(status).json({ message: message, data: data });
// });

mongoose
  .connect(`mongodb+srv://anja:anjanirina@cluster0-wijrw.mongodb.net/bank`, { useNewUrlParser: true, useUnifiedTopology: true } )
  .then(result => {
    app.listen(8000)
    console.log('connected')
  })
  .catch(err => console.log(err));
