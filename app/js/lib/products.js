(function() {
	//console.log('This is a library. It should be the first file');
	'use strict';

  	function effectOn(sku) {
		var productSku = document.getElementsByName(sku)[0];
		var productName = productSku.children[0].nextElementSibling.innerHTML;
		productSku.classList.add('selected');
		console.clear();
		showName(productName, 'ON');
	}

	function effectOff(sku) {
		var productSku = document.getElementsByName(sku)[0];
		var productName = productSku.children[0].nextElementSibling.innerHTML;
		productSku.classList.remove('selected');
		showName(productName, 'OFF');
	}

	function showName(name, status) {
		console.log('effect: ' + status + ' for ' + name);
	}

	//Assign 'effect' to the global variable 'effect'...
	window.effectOn = effectOn;
	window.effectOff = effectOff;

})();