jQuery3_4_1(function($) {
	//console.log('dev');

	//할인타입 (판매가,할인판매가)
	$('.time_banner .layerDiscountPeriod').each(function(){
		if($(this).find('.content p strong').text().indexOf('남은시간') > -1){ //할인중
			var this_ = $(this);

			var sale_time = this_.find('.content p:last-child').text().split('~');
			var sale_time_start = sale_time[0].replace(/[^0-9]/g,'');
			var sts_result = parseInt(sale_time_start.substring(4,6))+'/'+parseInt(sale_time_start.substring(6,8))+'/'+parseInt(sale_time_start.substring(0,4))+' '+parseInt(sale_time_start.substring(8,10))+':'+parseInt(sale_time_start.substring(10,12));
			var sale_time_end = sale_time[1].replace(/[^0-9]/g,'');
			var ste_result = parseInt(sale_time_end.substring(4,6))+'/'+parseInt(sale_time_end.substring(6,8))+'/'+parseInt(sale_time_end.substring(0,4))+' '+parseInt(sale_time_end.substring(8,10))+':'+parseInt(sale_time_end.substring(10,12));
			CountDownTimer(ste_result, 'newcountdown');

			function CountDownTimer(dt, id){
				var end = new Date(dt);

				var _second = 1000;
				var _minute = _second * 60;
				var _hour = _minute * 60;
				var _day = _hour * 24;
				var timer;

				function showRemaining() {
					var now = new Date();
					var distance = end - now;
					if (distance < 0) { //카운트다운종료
						clearInterval(timer);
						return;
					}
					var days = Math.floor(distance / _day);
					var hours = Math.floor((distance % _day) / _hour);
					var minutes = Math.floor((distance % _hour) / _minute);
					var seconds = Math.floor((distance % _minute) / _second);

					if((days+='').length < 2) days = days;
					if((hours+='').length < 2) hours = '0'+hours;
					if((minutes+='').length < 2) minutes = '0'+minutes;
					if((seconds+='').length < 2) seconds = '0'+seconds;

					var result = (hours + ':' + minutes + ':' + seconds);
					this_.closest('.box').find('.countdown').html('<span>'+days+'</span>' + '일' + '<span>'+hours+'</span>' + '시' + '<span>'+minutes+'</span>' + '분' + '<span>'+seconds+'</span>' + '초');
					this_.closest('.box').find('.day').text(days+'일');
				}

				timer = setInterval(showRemaining, 1000);
			}

			this_.closest('.box').find('.date-title .txt').text('남은시간');
		} else if($(this).find('.content p strong').text().indexOf('전입니다') > -1){ //할인기간전
			var this_ = $(this);

			var sale_time = this_.find('.content p:last-child').text().split('~');
			var sale_time_start = sale_time[0].replace(/[^0-9]/g,'');
			var sts_result = parseInt(sale_time_start.substring(4,6))+'/'+parseInt(sale_time_start.substring(6,8))+'/'+parseInt(sale_time_start.substring(0,4))+' '+parseInt(sale_time_start.substring(8,10))+':'+parseInt(sale_time_start.substring(10,12));
			var sale_time_end = sale_time[1].replace(/[^0-9]/g,'');
			var ste_result = parseInt(sale_time_end.substring(4,6))+'/'+parseInt(sale_time_end.substring(6,8))+'/'+parseInt(sale_time_end.substring(0,4))+' '+parseInt(sale_time_end.substring(8,10))+':'+parseInt(sale_time_end.substring(10,12));
			CountDownTimer(sts_result, 'newcountdown');

			function CountDownTimer(dt, id){
				var end = new Date(dt);

				var _second = 1000;
				var _minute = _second * 60;
				var _hour = _minute * 60;
				var _day = _hour * 24;
				var timer;

				function showRemaining() {
					var now = new Date();
					var distance = end - now;
					if (distance < 0) { //카운트다운종료
						clearInterval(timer);
						return;
					}
					var days = Math.floor(distance / _day);
					var hours = Math.floor((distance % _day) / _hour);
					var minutes = Math.floor((distance % _hour) / _minute);
					var seconds = Math.floor((distance % _minute) / _second);

					if((days+='').length < 2) days = days;
					if((hours+='').length < 2) hours = '0'+hours;
					if((minutes+='').length < 2) minutes = '0'+minutes;
					if((seconds+='').length < 2) seconds = '0'+seconds;

					var result = (hours + ':' + minutes + ':' + seconds);
					this_.closest('.box').find('.countdown').html('<span>'+days+'</span>' + '일' + '<span>'+hours+'</span>' + '시' + '<span>'+minutes+'</span>' + '분' + '<span>'+seconds+'</span>' + '초');
					this_.closest('.box').find('.day').text(days+'일');
				}

				timer = setInterval(showRemaining, 1000);
			}

			this_.closest('.box').addClass('cover before');
			this_.closest('.box').find('.date-title .txt').text('할인까지 남은시간');
		}
	});
	$('.time_banner .box').each(function(){ //할인종료, 할인없는 상품진열 시
		if(!$(this).find('.layerDiscountPeriod').length){
			$(this).closest('.box').addClass('cover after');
			$(this).closest('.box').find('.date-title .txt').text('할인종료');
		}
	});



	//썸네일슬라이드
	$('.add-thumb .swiper-slide img').each(function(){
		if(!this.complete || typeof this.naturalWidth == 'undefined' || this.naturalWidth == 0){
			$(this).parent().remove();
		}
	});

	var addThumb = new Swiper('.add-thumb',{
		speed: 400,
		loop: false,
		effect: 'slide',
		simulateTouch: false,
		pagination: {
			el: '.add-thumb .pagination',
			type: 'bullets',
			clickable: true
		}
	});
	$('.box').each(function(){
		if($(this).find('.swiper-slide').length > 1){
			$(this).find('.add-thumb-wrap').addClass('active');
		}
	});
	$('.add-thumb .pagination .swiper-pagination-bullet').on('mouseenter', function() {
		$(this).trigger('click');
	});
});