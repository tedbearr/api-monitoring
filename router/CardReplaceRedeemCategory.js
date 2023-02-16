const express = require("express");
const router = express.Router();
const knex = require("../config/db");

router.get("/", (req, res) => {
  try {
    knex
      .select("*")
      .from("t_m_replace_redeem_category")
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json(error);
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
