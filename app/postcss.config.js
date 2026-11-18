// 市場の CSS パイプライン。ウォレット（app/postcss.config.js）と同じ順序。
module.exports = {
    plugins: [
        require("postcss-import"),
        require("tailwindcss/nesting"),
        require("tailwindcss")("./tailwind.config.js"),
        require("autoprefixer"),
    ],
};
