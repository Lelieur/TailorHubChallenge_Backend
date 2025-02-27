"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.use((req, res, next) => {
        res.status(404).json({ message: "This route does not exist" });
    });
    app.use((err, req, res, next) => {
        console.error("ERROR", req.method, req.path, err);
        if (!res.headersSent) {
            if (!err.message) {
                res.status(500).json({
                    message: "Internal server error. Check the server console",
                });
            }
            else {
                res.status(500).json({
                    message: err.message,
                });
            }
        }
    });
};
