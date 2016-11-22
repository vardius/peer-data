var path = require('path');

module.exports = {
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['', '.ts', '.js', '.json', '.css', '.scss', '.html']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader']
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'null'
            },
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /\.css$/,
                exclude: root('src'),
                loader: 'null'
            },
            {
                test: /\.css$/,
                include: root('src'),
                loader: 'raw'
            },
            {
                test: /\.scss$/,
                exclude: root('src'),
                loader: 'null'
            },
            {
                test: /\.scss$/,
                include: root('src'),
                loader: 'raw!postcss!sass'
            }
        ]
    }
};

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}
