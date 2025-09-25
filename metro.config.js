const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Отключаем показ ошибок в development режиме
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Перехватываем ошибки и логируем их вместо показа
      const originalWrite = res.write;
      const originalEnd = res.end;

      res.write = function (chunk) {
        try {
          return originalWrite.call(this, chunk);
        } catch (error) {
          console.log("🚨 Metro server error (suppressed):", error);
          return false;
        }
      };

      res.end = function (chunk) {
        try {
          return originalEnd.call(this, chunk);
        } catch (error) {
          console.log("🚨 Metro server error (suppressed):", error);
          return this;
        }
      };

      return middleware(req, res, next);
    };
  },
};

module.exports = config;
