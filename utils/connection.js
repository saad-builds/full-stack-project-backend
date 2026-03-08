const mongoose = require("mongoose");

mongoose.connect(
    process.env.MONGODB_URI
).then(() => {
     console.log("Db Connected");
}).catch((err) => {
     console.log("error Connecting", err)
})



