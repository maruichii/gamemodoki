var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const MODE = 'production';
const MODE = 'development';
const enableSourceMap = true;

module.exports = {
    mode: MODE,
    entry: './src/ts/main.ts',
    devtool: 'source-map',
    output: {
        path: path.join(__dirname,'/dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules\/(?!(dom7)\/).*/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                // 拡張子 .ts の場合
                test: /\.ts$/,
                // TypeScript をコンパイルする
                use: 'ts-loader',
            },
        ],
    },

    resolve: {
        // 拡張子を配列で指定
        extensions: [
          '.ts', '.js',
        ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '../css/style.css'
        }),
    ],

    // externals: [
    //     function(context, request, callback) {
    //       if (request === '../../../../res/text') {
    //         return callback(null, 'commonjs ./res/text/index.js');
    //       }
    //       callback();
    //     }
    //   ]
    externals: {
        RSprite: 'RES_SPRITE',
        RText: 'RES_TEXT',
    },
};