//Const
const express= require('express');
const app=express();
const path = require('path');
const bodyParser = require("body-parser");
const libre = require('libreoffice-convert');
const fs = require("fs");
var outputFilePath;
const multer = require("multer");

//Settings

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//static files

app.use(express.static(path.join(__dirname, 'public')));


//routes

app.use(require('./routes/indexRoute'));

//listening port

app.listen(app.get('port'), () =>
{
 console.log('server on port', app.get('port'));    
});

//FUNCTIONS


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/public/uploads')
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  
  const docxtopdf = function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".docx" &&
      ext !== ".doc"
    ) {
      return callback("This Extension is not supported");
    }
    callback(null, true);
  };
  
  const docxtopdfupload = multer({storage:storage,fileFilter:docxtopdf})
  
  
  app.post('/',docxtopdfupload.single('file'),(req,res) => {
    if(req.file){
      console.log(req.file.path)
  
      const file = fs.readFileSync(req.file.path);
  
      outputFilePath = Date.now() + "output.pdf" 
  
      libre.convert(file,".pdf",undefined,(err,done) => {
        if(err){
          fs.unlinkSync(req.file.path)
          fs.unlinkSync(outputFilePath)
  
          res.send("some error taken place in conversion process")
        }
  
        fs.writeFileSync(outputFilePath, done);
  
        res.download(outputFilePath,(err) => {
          if(err){
            fs.unlinkSync(req.file.path)
          fs.unlinkSync(outputFilePath)
  
          res.send("some error taken place in downloading the file")
          }
  
          fs.unlinkSync(req.file.path)
          fs.unlinkSync(outputFilePath)
        })
      })
    }
  })