module.exports = {
    bundles: {
        clientJavaScript: {
            main: {
                file: '/js/meadowlark.min.91032690.js',
                location: 'head',
                contents: [
                    '/js/contact.js',
                    '/js/cart.js'
                ]
            }
        },
        clientCss: {
            main: {
                file: '/css/meadowlark.min.5283b403.css',
                contents: [
                    '/css/main.css',
                    '/css/cart.css'
                ]
            }
        }
    }
}