/** 쇼핑몰 좌측 햄버거 메뉴 **/
$(document).ready(function(){
    $('#header .side').append('<div id="dimmedSlider"></div>');
    var offCover = {
        init : function() {
            $(function() {
                offCover.resize();
                $(window).resize(function(){
                    offCover.resize();
                });
            });
        },
        layout : function(){
            if ($('html').hasClass('expand')) {
                $('#aside').css({'visibility':'visible'});
                $('html, body').css({"overflow-x":""})
            } else {
                setTimeout(function(){
                    $('#aside').css({'visibility':''});
                }, 300);
            }
            $('#aside').css({'visibility':'visible'});
        },
        resize : function(){
            var height = $('body').height();
            $('#container').css({'min-height':height});
        }
    };
    offCover.init();

    $('#header .btnCate, #aside .btnClose').click(function(e){
        e.preventDefault();
        $('#dimmedSlider').toggle();
        $('html').toggleClass('expand');

        $('#dimmedSlider').one('click', function(e) {
            $('html').toggleClass('expand');
            $('#dimmedSlider').toggle();
        });
        offCover.layout();

    });

    /*if( getUrlParameter('PREVIEW_SDE') == 1 ) {
        // $('#header .btnCate').trigger('click');
    }*/

});