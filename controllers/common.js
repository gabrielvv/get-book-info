const util = require('util');
// const Tesseract = require('tesseract.js')
const multiparty = require('multiparty');

exports.imageForm = function (req, res) {
    res.render('upload', {
        title: 'Upload Images',
    });
};

exports.uploadImage = function (req, res) {
    const form = new multiparty.Form(/*{
        autoFiles: true,
        uploadDir: __dirname + '../public/images',
    }*/);

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.writeHead(400, { 'content-type': 'text/plain' });
            res.end("invalid request: " + err.message);
            return;
        }
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write('received fields:\n\n ' + util.inspect(fields));
        res.write('\n\n');
        res.end('received files:\n\n ' + util.inspect(files));
        
        /*
        { image: 
   [ { fieldName: 'image',
       originalFilename: 'Le Dernier Empereur.jpg',
       path: 'C:\\Users\\Gabriel\\AppData\\Local\\Temp\\3QYjL20RUvb68Sd98smeIcK9.jpg',
       headers: [Object],
       size: 1330318 } ] }
       */

        // Tesseract.recognize(files.image[0].path)
        //     .then(function(result){
        //         console.log(result)
        //         res.end(result)
        //     })
        //     .catch(err => {
        //         console.error(result)
        //         res.end(err)
        //     })
    });
};