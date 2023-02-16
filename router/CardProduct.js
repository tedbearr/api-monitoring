const express = require("express");
const router = express.Router();
const knex = require("../config/db");

router.get("/", async (req, res) => {
  try {
    await knex
      .select("c_card_number")
      .from("t_m_card_product").where("c_status", "N")
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
