const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const LOCAL_PORT = 8130;

/** PROXY SERVER */

// Sets up the proxy URLs for various types of environments
const environmentRoutes = {
    local: `http://localhost:${LOCAL_PORT}`
};

const envProxy = environmentRoutes[process.env.NODE_ENV];
const ASSET_PATH = environmentRoutes[process.env.ASSET_PATH] || '/'; // When integrated into staging environments, ASSET_PATH should point to the domain where this bundle is served from.

/** PLUGINS */

// Allows process variables to be accessible in the code. Reference: https://webpack.js.org/plugins/define-plugin/
const envPlugin = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV), // Process environment variables may be set in the run script (in package.json).
    'process.env.ROOT_URL': JSON.stringify(process.env.ROOT_URL),
    'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH)
});

module.exports = {
    entry: {
        main: './src/app/app.js'
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'widget-bundle.js',
        publicPath: ASSET_PATH, // handles assets like images
        libraryTarget: 'amd'
    },
    externals: {
        react: 'react',
        'react-document-title': 'react-document-title'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/env'],
                    plugins: [['@babel/plugin-proposal-class-properties']]
                }
            },
            {
                test: /\.css$/,
                loader: 'style-loader'
            },
            {
                test: /\.css$/,
                loader: 'css-loader',
                query: {
                    modules: true,
                    localIdentName: '[name]__[local]__[hash:base64:5]__' + Date.now()
                }
            },
            {
                test: /\.js?$/,
                exclude: /(node_modules|public)/,
                loader: 'babel-loader'
            },
            {
                test: /\.(svg|png|jpg)$/,
                loader: 'file-loader'
            }
        ]
    },
    mode: 'development',
    devServer: {
        host: '0.0.0.0',
        port: LOCAL_PORT,
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
        },
        proxy: {
            '/tools/api': {
                // This is used to proxy outgoing requests instead of directing them to localhost. Read more here: https://webpack.js.org/configuration/dev-server/#devserver-proxy
                target: envProxy,
                changeOrigin: true,
                secure: false
            }
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            // This will build an HTML file for your bundle to be injected into. Not used when project is run inside of Overlord. More info here: https://github.com/jantimon/html-webpack-plugin#usage
            template: path.join(__dirname, './src/app/index.html'),
            filename: 'index.html'
            // inject: 'body',
        }),
        envPlugin
    ]
};
