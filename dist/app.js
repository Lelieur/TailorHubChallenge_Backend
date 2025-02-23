"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("./db");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const config_1 = __importDefault(require("./config"));
(0, config_1.default)(app);
const routes_1 = __importDefault(require("./routes"));
(0, routes_1.default)(app);
const error_handling_1 = __importDefault(require("./error-handling"));
(0, error_handling_1.default)(app);
exports.default = app;
