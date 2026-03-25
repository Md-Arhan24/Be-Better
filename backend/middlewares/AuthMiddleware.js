const userModel = require("../model/userModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerfication = async (req, res, next) => {
  //first get the token
  const token = req.cookies.token;
  if (!token) {
    //here i have to redirect to login page
    return res.json({ message: "user not verified", status: false });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false });
    } else {
      const userFind = await userModel.findById(data.id);
      if (userFind) {
        req.user = {
          id: userFind._id,
          username: userFind.username,
          email: userFind.email,
        };

        next();
      } else {
        return res.json({ status: false });
      }
    }
  });
};
