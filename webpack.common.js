const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const DynamicImport = require('babel-plugin-syntax-dynamic-import');

module.exports = env => { // module.exports is function now to pass in env variable from cli defined in package.json
        return {
            entry: {
                'js/index': './src/index.js',
            },
            module: {
                rules: [{
                        test: /\.js$/,
                        exclude: [/node_modules/, /\.min\./, /vendor/],
                        use: [{
                                loader: 'babel-loader',
                                /*options: {
                                    plugins: [DynamicImport]
                                }*/
                            },
                            {
                                loader: 'eslint-loader'
                            }
                        ]},
                       /* {
                            test: /\.csv$/,
                            loader: 'file-loader',
                            options: {
                                name: 'data/[name].[ext]?v=[hash:6]', 
                            }
                        },*/
                        /* {
                              // images under limit converted to data url. above the limit falls back to file-loader to emit file
                              // as specified in options (options are passed to file-loader)
                              test: /\.(png|jp(e?)g|gif)$/,
                              loader: 'url-loader',
                              options: {
                                  limit: 10,
                                  name: '[name].[ext]',
                                  outputPath: 'images/',
                              }
                          },*/ // not in use but might be later
                        /*{
                            test: /\.svg$/,
                            exclude: /x-out\.svg/,
                            use: [{
                                    loader: 'svg-inline-loader',
                                    options: {
                                        removeSVGTagAttrs: false
                                    }
                                }]
                        },
                        {
                            test: /x-out\.svg/,
                            use: {
                                loader: 'svg-url-loader',
                                options: {}
                            }
                        },*/
                        {
                            test: /partials\/.*\.html$/,
                            use: 'html-loader'
                        }

                    ]
                },
                plugins: [
                    new MiniCssExtractPlugin({
                        // Options similar to the same options in webpackOptions.output
                        // both options are optional
                        filename: "css/styles.css?v=[hash:6]",
                        chunkFilename: "[id].css",
                    })
                ],
                resolve: {
                    alias: {
                        "@App": path.join(__dirname, 'submodules/PCTApp-js/'),
                        "@Router": path.join(__dirname, 'submodules/ROUTR/'),
                        "@UI": path.join(__dirname, 'submodules/UI-js/'),
                        "@Project": path.join(__dirname, 'src'),
                        //"@Helpers": path.join(__dirname, '../../helpers/'),
                        "@Utils": path.join(__dirname, 'submodules/UTILS/'),
                    }
                }
            }
        };