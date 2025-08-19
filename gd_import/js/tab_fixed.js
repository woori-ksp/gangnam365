/* 상품상세페이지 탭메뉴 스크롤 고정 */
$(document).ready(function(){
    var tabMenu_btn = $("#tabFix").offset().top;
    $(window).scroll(function(){
        if($(window).scrollTop() > tabMenu_btn+1) {
            $('#tabFix').addClass('tabFix_fixed');
        }
        else {
            $('#tabFix').removeClass('tabFix_fixed');
        }
    });
    
    $('#tabFix .menu li a').click(function(e){
        $('.menu li').removeClass('on');
        $(this).parent('li').addClass('on');
        e.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top - 120}, 500);
    });
});