const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.nondev.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const pretty = require('pretty');

module.exports = env => {
    return merge(common(), {
        devtool: 'inline-source-map', // may be too slow an option; set to another if so
        plugins: [
            new HtmlWebpackPlugin({
                title: 'A Tool for Better Debt Comparisons',
                template: './src/index-dev.html',
            }),
            new CopyWebpackPlugin([{
                from: '-/**/*.*',
                context: 'src'
            }, {
                from: 'assets/**/*.*',
                exclude: 'assets/Pew/css/',
                context: 'src',
                ignore: ['assets/countries/*.*']
            }, {
                from: 'assets/Pew/css/*.*',
                context: 'src',
                transform(content, path) {
                    return content.toString().replace(/url\("\/([^/])/g, 'url("/docs/$1');
                }
            }]),
            new PrerenderSPAPlugin({
                // Required - The path to the webpack-outputted app to prerender.
                staticDir: path.join(__dirname, '/docs/'),
                // Required - Routes to render.
                routes: ['/'],
                renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
                    injectProperty: 'IS_PRERENDERING',
                    inject: true,
                    renderAfterTime: 1000
                }),
                postProcess: function(renderedRoute){
                    renderedRoute.html = pretty(renderedRoute.html);
                    return renderedRoute;
                }
            }),
            new webpack.EnvironmentPlugin({
                'NODE_ENV': env
            })
        ],
        output: {
            filename: '[name].js',
            path: path.join(__dirname, '/docs/'),
        }
      });
  };
   