const path = require('path')
const { LoaderOptionsPlugin } = require('webpack')

module.exports = {
    entry: {
        index: './srcJs/index.js',
        classlist: './srcJs/classlist.js',
        classStudentList: './srcJs/classStudentList.js',
        css: './srcJs/style.js',
        rollcall: './srcJs/rollcall.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname,'js')
    },
    module: {
        rules: [
            {
                test: /\.css/,
                use: [
                    'style-Loader',
                    'css-loader'
                ]
            }
        ]
    }
}