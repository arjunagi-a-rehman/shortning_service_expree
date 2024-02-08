const express = require('express')
const connectDB = require('./db/connect');
const urlRouter = require('./routes/urlRoutes');
const requestIp = require('request-ip');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const cors = require('cors');

const app = express()
const port = process.env.PORT||3000

const corsOptions = {
  origin: process.env.FRONT_END_DOAMIN, // Allow requests from this origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestIp.mw());
app.use(cookieParser(process.env.JWT_SECRET));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use(urlRouter);

app.use(errorHandlerMiddleware);


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();