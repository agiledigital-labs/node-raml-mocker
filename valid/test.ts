exports.validators = [
  {
    name: "fails",
    validator: (req, res) => {
      console.log("true");
      return true;
    },
  },
];
