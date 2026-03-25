const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const AuthRout = require("./routes/AuthRoute");
const GoalRout = require('./routes/GoalRoute');
const PlanDay = require('./routes/PlanDayRoute');
const {userVerfication} = require('./middlewares/AuthMiddleware');


require("dotenv").config();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://becomebest.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookie_parser());
app.use(express.urlencoded({ extended: true }));

app.use("/", AuthRout);
app.use("/goals",userVerfication,GoalRout);
app.use('/planday',userVerfication,PlanDay);

app.get("/", (req, res) => {
  res.send("welcome");
});

connect()
  .then(() => {
    console.log("database connected..");
  })
  .catch((e) => {
    console.log("errror occured ", e);
  });
async function connect() {
  await mongoose.connect(process.env.URL);
}
app.listen(PORT, () => {
  console.log(`server started at ${PORT}....`);
});
