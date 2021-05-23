const path = require('path')

module.exports = {
    entry: {
        teacherApp: './src/teacherIndex.js',
        studentApp: './src/studentIndex.js',
        style: './src/css.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public', 'js')
    },
    module: {
        rules:[
            {
                test: /\.css/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
        ],
    }
}