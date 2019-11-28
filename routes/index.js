const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const fs = require('fs-extra');
const request = require('request');
const archiver = require('archiver');
const path = require('path');
const rimraf = require("rimraf");

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', {page:'Home', menuId:'home'});
});
router.post('/download', async function(req, res, next) {
     //not use
    // var images = JSON.parse(req.body.images);
    // var vendorName = 'brandstreet.tokyo';
    // var dir = 'images/'+vendorName;
    // if (!fs.existsSync(dir)){
    //     fs.mkdirSync(dir);
    // }
    // var filePath = dir+'/th_DSC_0093-29.jpeg';
    // download(images[0], filePath, function(state){
    //     res.setHeader('Content-disposition', 'attachment; filename=th_DSC_0093-29.jpeg');
    //     res.set('Content-Type', 'image/jpeg');
    //     res.status(200).send(state);
    // });
    var file = 'images/brandstreet.tokyo';
    var filePath = 'images/brandstreet.tokyo.zip';

//passsing directoryPath and callback function
   await fs.readdir(file, function (err, files) {
      //handling error
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      //listing all files using forEach
      files.forEach(function (f) {
          // Do whatever you want to do with the file
          console.log(f); 
      });
    });
    zipDirectory(file, filePath);

    setTimeout(function() {
      // Check if file specified by the filePath exists
        fs.exists(filePath, function(exists){
            if (exists) {
                // Content-type is very interesting part that guarantee that
                // Web browser will handle response in an appropriate manner.
                res.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "File-Name": "brandstreet.tokyo.zip",
                    "Content-Disposition": "attachment; filename=brandstreet.tokyo.zip"
                });
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.writeHead(400, {"Content-Type": "text/plain"});
                res.end("ERROR File does not exist");
            }
        });
    }, 3000);
});

router.post('/', async function(req, res, next) {
  console.log('post');
  var vendorName = req.body.vendor;
  var urls = JSON.parse(req.body.data);
  res.contentType('application/json');
  var myJSONstring = '';

  try {
    const dir = './public/images/'+vendorName;
    rimraf(dir, function () { console.log("done"); });
    const promises = urls.map(async url => {
    // request details from GitHub’s API with Axios
      return await getProductDetail(url, vendorName).catch(e => {
          console.log(e);
      });
    });
    // wait until all promises resolve
    const results = await Promise.all(promises).catch(function(err){
      console.log(err);
    });
    myJSONstring = JSON.stringify({data:results})
  } catch (err) {
    console.log(err);
  }
  res.send(myJSONstring);
});

const getProductDetail = async function(urlObject, vendorName) {
  let url = urlObject.url;
  let lot = urlObject.lot;

   const a = await require('request-promise')({
    url: url,
      proxy: 'http://lum-customer-tinhphamminh-zone-zone1:5kah3kiltqf9@zproxy.lum-superproxy.io:22225',
  }).then(function(data){ return data; }, function(err){ console.error(err); return err; });
   let $ = cheerio.load(a);
    // let $ = cheerio.load(fs.readFileSync('./test.html'));
   var keys = [];
   var values = [];
   let textPrice = $('[itemprop=price]').html();
   let productSalePrice = $('[itemprop=price]')[0].attribs.content;
   let productOriginPrice = $('#mm-saleOrgPrc').html();
    const b = await require('request-promise')({
      url: $("#desc_ifr")[0].attribs.src,
        proxy: 'http://lum-customer-tinhphamminh-zone-zone1:5kah3kiltqf9@zproxy.lum-superproxy.io:22225',
  }).then(function(data){ return data; }, function(err){ console.error(err); return err; });
    let $$$ = cheerio.load(b);
     // let $$$ = cheerio.load(fs.readFileSync('./test2.html'));
  let productName = $$$('.temp_content2').find('h2').html().trim();
    keys.push('URL');
    values.push(url);
    keys.push('Title');
    values.push(productName);
    keys.push('Price');
   values.push(productSalePrice);
     keys.push('TextPrice');
   values.push(textPrice);
   if (productOriginPrice && productOriginPrice != null) {
       keys.push('Origin Price');
       values.push(productOriginPrice);
   }

   $$$(".tableizer-table").find('td').each(function (i, elem) {
        // Range Name
        let index = i+1;
        if(index % 2 == 0) {
          values.push($$$(elem).html().trim());
        } else {
          keys.push($$$(elem).html().trim());
        }
    });
    let data = {
        images : []
    };
    let images = $$$('#wpl_main_image').find('.slider').find('img.wpl_product_image');
    const dir = './public/images/'+vendorName;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    await images.each(async function (index, image) {
       if (image.attribs.src) {
           const slot = index + 1;
           const type = getExtensionImage(image.attribs.alt);
           const name = lot+'_'+slot+'.'+type;
           const fileName = dir+'/'+name;
           const path = './images/'+vendorName+'/'+name;
           await download(image.attribs.src, fileName, function(){
               console.log('save image: '+image.attribs.src);
           });
           data.images.push(path);
       }
    });
    keys.push('LotNum');
    values.push(lot);
    var resultArray = [];
    var result = {};
    keys.forEach((key, i) => result[key] = values[i]);

    const resultConvert = mappingDataByVendor(result, vendorName);

    data.product = resultConvert;
    data.lot = lot;
    resultArray.push(data);
    return resultArray;

};

const download = async function(uri, filename, callback){
   //not use
    await request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

const zipDirectory = function(source, out) {
  //not use
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream)
        ;
        stream.on('close', () => resolve());
        archive.finalize();

    });
};

const getExtensionImage = function(fileName) {
    let array = fileName.split('.');
    return array[1];
};

const mappingDataByVendor = function(data, vendorName) {
  const object =  {};
  switch (vendorName) {
    case 'brandstreet.tokyo':
      object.url = data['URL'];
      object.lot = data['LotNum'];
      let title = "Authentic";
      let description = '';
      if (data['BRAND']) {
        description += 'Brand: '+data['BRAND'];
        title += ' ' + data['BRAND'];
      }
      if (data['Material']) {
        title += ' ' + data['Material'];
        description += '<br>Material: '+data['Material'];
      }
      if (data['Style']) {
        title += ' ' + data['Style'];
        description += '<br>Style: '+data['Style'];
      }
      if (data['Color']) {
        description += '<br>Color: '+data['Color'];
      }
      if (data['Size']) {
        description += '<br>Size: '+data['Size'];
      }
      if (data['Size(cm)']) {
        description += '<br>Size(cm): '+data['Size(cm)'];
      }
      if (data['Size(inch)']) {
        description += '<br>Size(inch): '+data['Size(inch)'];
      }
      if (data['CONDITION']) {
        description += '<br>Condition: '+data['CONDITION'];
      }
      if (data['Made in']) {
        description += '<br>Country of Origin: '+data['Made in'];
      }
      if (data['Accessory']) {
        description += '<br>Come with: '+data['Accessory'];
      }
      object.title = title;
      object.description = description;
      // console.log(data);
      let price = data['Price'];
      object.low_est = parseFloat(price*1.8).toFixed(2);
      object.high_est = parseFloat(price*4.8).toFixed(2);
      object.start_price = parseFloat(price*1.1).toFixed(2);
      break;
    default:
      break;
  }
    
  console.log(object);

  return object;
}

module.exports = router;
