"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config({ path: ".env.local" });
}
else {
    dotenv_1.default.config(); // Cargar .env en producción
}
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.FLY_APP_NAME ? "0.0.0.0" : "127.0.0.1";
app_1.default.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
