 const app = require("./App");

const PORT=process.env.PORT

app.listen(PORT,() => {
    console.log(`listining to port ${PORT}`)
})