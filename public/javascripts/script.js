$(function() {
  	// var counter = 2;
  // Handler for .ready() called.

	$('#submit').on('click',function(e) {
		let vendorName = $('#vendor_name').val();
		let url = $('#basic-url').val().trim();
		let urls = url.split(/\r?\n/g);
		let count = urls.length;
		if (url == '') {
			alert('Please input product urls.');
			return false;
		}
		let urlObjects = [];
		for(var j = 0; j < count; j++) {
			let urlValue = urls[j];
			if (urlValue.trim() != '') {
				let object = {};
				object.lot = (j + 1);
				object.url = urlValue.trim();
				urlObjects.push(object);
			}
		}
		$.ajax({
			url: '/',
			type: "POST",
			async: 'false',
			data: {data: JSON.stringify(urlObjects), vendor: vendorName},
			beforeSend: function() {
				$('#detail-list').html('');
				$("#ajax-loading").show();
				$("#overlay").fadeIn(300);
			},
			success: function(response){
				$("#ajax-loading").hide();
				var results = response.data;
				var result = results.filter(item => {
					return item;
				});
				renderResult(result);
				$("#overlay").fadeOut(300);
			}
		});
	});

    $('#submit2').on('click',function(e) {
	  	var url = $('#basic-url1').val();
	  	var urls = [];
	  	console.log(counter);
		for (i = 1; i < counter; i++) {
			var urlvalue = $('#basic-url' + i).val();
			if (urlvalue.trim() != '') {
				var object = {};
				object.lot = i;
				object.url = urlvalue.trim();
				urls.push(object);
			}
		}
	  	$.ajax({
	  		url: '/',
	  		type: "POST",
	  		async: 'false',
	  		data: {data: JSON.stringify(urls)},
	  		beforeSend: function() {
					$('#detail-list').html('');
		        $("#ajax-loading").show();
		    },
	  		success: function(response){
	  			$("#ajax-loading").hide();
	  			var result = response.data;
	  			var listAttribute = [
	  				'URL',
	  				'Title',
	  				'Price',
	  				'Origin Price',
	  				'BRAND',
	  				'Color',
	  				'Material',
	  				'Size(cm)',
	  				'Size(inch)',
	  				'Style',
	  				'Accessory',
	  				'Made in',
	  				'CONDITION'
	  			];
	  			var wrapperDiv = '<h3>Result</h3><hr>';
	  			for (i = 0; i < result.length; i++) {
	  				
	  				let object = result[i][0];
	  				let product = object.product;
					let images = object.images;
					let lot = object.lot;
					wrapperDiv += '<p><a type="button" class="btn btn-info" data-toggle="collapse" href="#collapseExample'+lot+'" role="button" aria-expanded="false" aria-controls="collapseExample">'+
	  				'Show detail Product '+lot +'</a></p>';
	  				wrapperDiv += '<div class="wrapperProduct collapse" id="collapseExample'+lot+'">';
					let div = '<div class="row">';

					let table = '<table class="item">';
		  			Object.keys(product).map(key => {
		  				if (listAttribute.indexOf(key) > -1) {
		  					let value = product[key];
			  				if(key == 'URL') {
								value = '<a href="'+product[key]+'" target="_blank">'+product[key]+'</a>';
							}
			  				table += '<tr><td scope="row">'+key+'</td><td scope="row">'+value+'</td><tr>';
		  				}
		  			});
		  			table += '</table>';
					div += table;
					div += '</div>';
					if (images.length > 0) {
						let showImage = '<div class="row show-images">' +
							'<button class="btn btn-image btn-primary">Show '+images.length+' images of this item</button>' +
						'</div>';
						div += showImage;
						let row = '<div class="image-div" style="display: none;">';
						images.forEach(function (image) {
							row += '<img src="'+image.src+'" alt="'+image.name+'" width="150">';
						});
						row += '</div><hr>';
						div += row;
					}
					wrapperDiv += div;
	  				wrapperDiv += '</div>';
		  			//let keys = Array.from( object.keys() );
	  			}
	  			if (result.length > 0) {
	  				wrapperDiv += '<p><button class="btn btn-primary download"> Download all images</button></p>';
	  			}
	  			$('#detail-list').html(wrapperDiv);
		    }
	  	});
    });
  	$('#add-more').on('click', function() {
  		var urlWrapper = $(document.createElement('div'))
	     .attr("class", 'input-group mb-3 url-wrapper').attr("id","urlWrapper"+counter);
	     var urlDiv = '<label>'+'Product '+counter+'</label>'+
	     	'<input type="text" class="form-control" id="basic-url'+counter+'" value=""/>';
	     urlWrapper.after().html(urlDiv);
	     urlWrapper.appendTo("#urlBox");
	     counter++;
	     $( "#remove" ).prop( "disabled", false );
  	});
  	$("#remove").click(function () {
	    if(counter == 2){
			alert("No more textbox to remove");
			return false;
		}   
		counter--;
		$("#urlWrapper" + counter).remove();
		if (counter == 2) {
			$( "#remove" ).prop( "disabled", true );
		}
	});

	$('#detail-list').on('click','.download', function(e) {
		console.log('download');
		$("#overlay").fadeIn(300);
		let parentDiv = $(this).parent().parent();
		let images = parentDiv.find('img');
		var srcs = [];
		images.each(function (i, image) {
			srcs.push(image.src);
		});
		generateZIP(srcs);
		// var formData = new FormData();
		// formData.append('images', JSON.stringify(srcs));
		// console.log(formData);
		// var request = new XMLHttpRequest();
		// request.open('POST', '/download', true);
		// request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		// request.responseType = 'blob';
		// request.onload = function (event) {
		// 	var blob = request.response;
		// 	var fileName = request.getResponseHeader("File-Name");
		// 	var link = document.createElement('a');
		// 	link.href = window.URL.createObjectURL(blob);
		// 	link.download = fileName;
		// 	var event = new MouseEvent('click');
		// 	link.dispatchEvent(event);
		// };
		// request.send();

	});
	$('#detail-list').on('click','.show-images button', function(e) {
		let parentDiv = $(this).parent().parent();
		let images = parentDiv.find('.image-div');
			if(!images.is(':visible')) {
			images.show();
		} else {
			images.hide();
		}
	});
});

function generateZIP(links) {
	var zip = new JSZip();
	var count = 0;
	var vendorName = $('#vendor_name').val();
	var zipFilename = vendorName+".zip";
	links.forEach(function (url, i) {
		var filename = getFileName(url);
		var img = new Image();
		img.src = url;
		img.onload = function () {
		   // loading a file and add it in a zip file
			JSZipUtils.getBinaryContent(url, function (err, data) {
				if (err) {
					throw err; // or handle the error
				}
				zip.file(filename, data, { binary: true });
				count++;
				if (count == links.length) {
					zip.generateAsync({ type: 'blob' }).then(function (content) {
						saveAs(content, zipFilename);
						$("#overlay").fadeOut(300);
					});
				}
			});
		}
		
	});
}

function getFileName(url) {
	console.log(url);
	var splitUrl = url.split('/');
	return splitUrl[splitUrl.length-1];
}
function downloadImages(id) {
	console.log(id);
	$.ajax({
		url: '/download',
		type: "POST",
		async: 'false',
		data: {},
		beforeSend: function() {
			// $('#detail-list').html('');
			// $("#ajax-loading").show();
		},
		success: function(result){
			console.log(result)
		}
	});
}
function showsImage() {
	if(!$('.image-div').is(':visible')) {
		$('.image-div').show();
	} else {
		$('.image-div').hide();
	}

}

function renderResult(result) {
	console.log(result);
	var wrapperDiv = '<h3>Result</h3><hr>';
	let imageDiv = '';
	if (result.length > 0) {
		let table = '<table id="result">';
		let tHead = '<thead><tr>'
			+'<th class="column-lot">LotNum</th>'
			+'<th>Title</th>'
			+'<th class="column-url">URL</th>'
			+'<th class="column-description">Description</th>'
			+'<th class="column-price">LowEst</th>'
			+'<th class="column-price">HighEst</th>'
			+'<th class="column-price">StartPrice</th>'
		+'</tr></thead>';
		let tBody = '<tbody>';
		table = table + tHead + tBody;
		imageDiv = '<div id="image-show">';
		for (let i = 0; i < result.length; i++) {
			let object = result[i][0];
			let product = object.product;
			let tr = '<tr>'
				+'<th class="column-lot">'+object.lot+'</th>'
				+'<th>'+product.title+'</th>'
				+'<th class="column-url"><a href="'+product.url+'" target="_blank">'+product.url+'</th>'
				+'<th class="column-description">'+product.description+'</th>'
				+'<th class="column-price">$'+product.low_est+'</th>'
				+'<th class="column-price">$'+product.high_est+'</th>'
				+'<th class="column-price">$'+product.start_price+'</th>'
			+'</tr>';
			table += tr;
			let images = object.images;
			if (images.length > 0) {
				images.forEach(function (image) {
					imageDiv += '<img src="'+image+'" width="150">';
				});
			}
		}
		imageDiv += '</div>';
		table += '</tbody></table>';
		wrapperDiv += table;

	} else {
		wrapperDiv += '<p>Data not found</p>';
	}
	wrapperDiv += imageDiv;
	wrapperDiv += '<p class="btn-download"><button class="btn btn-primary download"> Download all images</button></p>';
	$('#detail-list').html(wrapperDiv);
}

function renderResult2(result) {
	var listAttribute = [
		'URL',
		'Title',
		'Price',
		'Origin Price',
		'BRAND',
		'Color',
		'Material',
		'Size(cm)',
		'Size(inch)',
		'Style',
		'Accessory',
		'Made in',
		'CONDITION'
	];
	var wrapperDiv = '<h3>Result</h3><hr>';
	for (let i = 0; i < result.length; i++) {
		let object = result[i][0];
		let product = object.product;
		let images = object.images;
		let lot = object.lot;
		wrapperDiv += '<p><a type="button" class="btn btn-info" data-toggle="collapse" href="#collapseExample'+lot+'" role="button" aria-expanded="false" aria-controls="collapseExample">'+
			'Show detail Product '+lot +'</a></p>';
		wrapperDiv += '<div class="wrapperProduct collapse" id="collapseExample'+lot+'">';
		let div = '<div class="row">';

		let table = '<table class="item">';
		Object.keys(product).map(key => {
			if (listAttribute.indexOf(key) > -1) {
				let value = product[key];
				if(key == 'URL') {
					value = '<a href="'+product[key]+'" target="_blank">'+product[key]+'</a>';
				}
				table += '<tr><td scope="row">'+key+'</td><td scope="row">'+value+'</td><tr>';
			}
		});
		table += '</table>';
		div += table;
		div += '</div>';
		if (images.length > 0) {
			let showImage = '<div class="row show-images">' +
				'<button class="btn btn-image btn-primary">Show '+images.length+' images of this item</button>' +
				'</div>';
			div += showImage;
			let row = '<div class="image-div" style="display: none;">';
			images.forEach(function (image) {
				row += '<img src="'+image+'" width="150">';
			});
			row += '</div><hr>';
			div += row;
		}
		wrapperDiv += div;
		wrapperDiv += '</div>';
	}
	wrapperDiv += '<p><button class="btn btn-primary download"> Download all images</button></p>';
	$('#detail-list').html(wrapperDiv);
}