exports.HealthCheck = (req, res) => {
    try {
        res.status(200).json({ "mess": "ok" })
    } catch (error) {
        res.status(404).json({ "mess": "not ok" })
    }
}