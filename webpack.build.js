const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.nondev.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const pretty = require('pretty');

//const publicPath = '/~/media/data-visualizations/interactives/2018/EIFP/' // <<== set this for each project

module.exports = env => {
    return merge(common(env), {
        devtool: false,
        optimization: {
            minimizer: [
                new UglifyJSPlugin({
                    sourceMap: true,
                    uglifyOptions: {
                        compress: {
                            drop_console: true
                        },
                        output: {
                            comments: false
                        }
                    },
                }),
            ],
            splitChunks: {
                automaticNameDelimiter: '-',
                chunks: 'all'
            }
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'title title title',
                inject: false,
                template: './src/index.html'
            }),
           /* new PrerenderSPAPlugin({
                // Required - The path to the webpack-outputted app to prerender.
                staticDir: path.join(__dirname, 'dist'),
                // Required - Routes to render.
                routes: ['/'],
                renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
                    injectProperty: 'IS_PRERENDERING',
                    inject: true,
                   //headless: false,
                    //sloMo: 10000,
                    renderAfterTime: 1000
                }),
                postProcess: function(renderedRoute){
                    renderedRoute.html = renderedRoute.html.replace(/class="emitted-css" href="(.*?)"/,'class="emitted-css" href="' + publicPath + '$1' + '"');
                    renderedRoute.html = renderedRoute.html.replace(/class="emitted-bundle" src="(.*?)"/g,'class="emitted-bundle" src="' + publicPath + '$1' + '"');
                    //renderedRoute.html = renderedRoute.html.replace('src="js/index.js"','src="' + publicPath + 'js/index.js"');
                    renderedRoute.html = renderedRoute.html.replace(/<head>[\s\S].*<\/head>/,'').replace(/<\/?html>|<\/?body>/g,'');
                    renderedRoute.html = pretty(renderedRoute.html);
                    return renderedRoute;
                }
            }),*/
            /*new webpack.DefinePlugin({
                'PUBLICPATH': '"' + publicPath + '"', // from https://webpack.js.org/plugins/define-plugin/: Note that because the plugin does a direct text replacement, the value given to it must include actual quotes inside of the string itself. Typically, this is done either with alternate quotes, such as '"production"', or by using JSON.stringify('production').
            }),*/
            new webpack.EnvironmentPlugin({
                'NODE_ENV': env
            }),
            new webpack.SourceMapDevToolPlugin({
              filename: '[name]js.map',
            })
        ],
        output: {
            filename: '[name].js?v=[hash:6]',
            path: path.resolve(__dirname, 'dist'),
           // publicPath
        }
    });
};