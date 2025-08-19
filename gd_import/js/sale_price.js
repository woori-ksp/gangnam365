EC$(function($) {    
	//할인율표기
	var target = $('.prdList');
	target.each(function(index){
		create(target[index]);
	});
	function create(t) {
		var observer = new MutationObserver(function(mutations) {
			discount();
		});
		
		observer.observe(t, {
			childList: true
		});
	}
	discount();
	function discount(){
		//상품목록
		$('.prdList').each(function(){
			$(this).find('> li').each(function(){
				var price1 = String($(this).find('.description').attr('ec-data-custom')).replace(/\,/g, '').replace('원', ''); //소비자가
				var price2 = String($(this).find('.description').attr('ec-data-price')).replace(/\,/g, '').replace('원', ''); //판매가
				var price2 = price2.split(' '); //판매가참조화폐 구분
				if (!isNaN(price1) && !isNaN(price2[0])) {
					discountRate = Math.round((price1 - price2[0]) / price1 * 100);
					if(discountRate > 0 && discountRate != 100 && ($(this).find('.ec-sale-rate').length < 1)){
						//$(this).find('.display판매가').append('<div class="ec-sale-rate">'+discountRate+'%</div>');
						$(this).find('.title:contains(판매가):not(:contains(할인))').closest('li').append('<div class="ec-sale-rate">'+discountRate+'%</div>');
					}
				}
			});
		});
	}

	/*if($('.xans-product-detaildesign').length){
		discount2();
		function discount2(){
			//상품상세,확대보기(팝업)
			var price1 = String($('.xans-product-detail #span_product_price_custom').text()).replace(/\,/g, '').replace('원', ''); //소비자가
			var price2 = String($('.xans-product-detail #span_product_price_text').text()).replace(/\,/g, '').replace('원', ''); //판매가
			var price2 = price2.split(' '); //판매가참조화폐 구분
			if (!isNaN(price1) && !isNaN(price2[0])) {
				discountRate = Math.round((price1 - price2[0]) / price1 * 100);
				if(discountRate > 0 && discountRate != 100 && ($(this).find('.ec-sale-rate').length < 1)){
					$('.xans-product-detail #span_product_price_text').append('<span class="ec-sale-rate">'+discountRate+'%</span>');
				}
			}
		}
	}*/
});