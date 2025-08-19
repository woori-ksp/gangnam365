;
(function(c) {
    c.fn.DB_topFloating = function(d) {
        var a = {
            checkbox_id: "",
            layer: "off",
            openType: "off",
            openDelayTime: 500,
            closeType: "off",
            //autoCloseTime: 9999999,
            slideSpeed: 800,
            day: 1,
            bugHeight: 0
        };
        c.extend(a, d);
        return this.each(function() {
            function d() {
                b.slideDown(a.slideSpeed)
            }

            function e() {
                100 == a.bugHeight ? b.slideUp(a.slideSpeed) : b.animate({
                    "margin-top": -a.bugHeight
                }, a.slideSpeed)
            }

            function f() {
                g.bind("click", function() {
                    "slide" == a.closeType ? e() : b.hide();
                    1 == h.checked && c.cookie("popupWrap", "hide", {
                        path: "/",
                        expires: a.day
                    })
                })
            }
            var b = c(this),
                g = b.find(".popup_closeBtn"),
                h = a.checkbox_id;
            "on" == a.layer ? b.css({
                position: "absolute"
            }) : b.css({
                position: "fixed"
            });
            "none" == a.openType && b.show();
            "hide" == c.cookie("popupWrap") ? b.hide() : ("slide" == a.openType && (b.hide(), setTimeout(d, a.openDelayTime)), setTimeout(e/*, a.autoCloseTime*/ + a.openDelayTime), f())
        })
    }
})(jQuery);

$('.popupWrap').DB_topFloating({
    checkbox_id:document.getElementById('popup_check'),       
    layer:"off",                                                  
    openType:"off",                                          
    openDelayTime:1000,                                          
    closeType:"slide",                                           
    //autoCloseTime: 9999999,                                           
    slideSpeed:500,                                            
    day:1,											           
    bugHeight:0                                                
});
