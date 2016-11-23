var path = require('path');

module.exports = {
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['', '.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader']
            }
        ]
    }
};

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}
