$(function(){
	var ctl = $(".user-action");
	if(ctl.length > 0){
		ctl = ctl.eq(0);
	}else{
		return;
	}
	ctl.hover(function(){
		$(this).addClass("user-sel");
	}, function(){
		$(this).removeClass("user-sel");
	});
});

$(function(){
	var thumbs = $(".banner-switch:eq(0) .thumb"), intros = $(".banner-switch:eq(0) .intro");
	var ctls = $(".switch-bar:eq(0) .item");
	var tlen = thumbs.length, ilen = intros.length;
	var _t = null, _it = null, index = 0;
	if(tlen < 1 || ilen < 1 || tlen != ilen){
		return false;
	}

	function moveIn(tbj, ibj){
		$(tbj).animate({"left": "25px", "opacity": 1}, {duration: 400, easing: "easeOutBack"});
		if(_t){
			clearTimeout(_t);
			_t = null;
		}
		_t = setTimeout(function(){
			$(ibj).animate({"left": "385px", "opacity": 1}, {duration: 400, easing: "easeOutBack"});
		},200);
	}
	moveIn(thumbs[index], intros[index]);
	function moveOut(tbj, ibj, callback){
		$(tbj).animate({"left": "-500px", "opacity": 0}, {duration: 400, easing: "easeInBack", complete: function(){
			$(tbj).css("left", "1000px");
			callback && callback();
		}});
		if(_t){
			clearTimeout(_t);
			_t = null;
		}
		_t = setTimeout(function(){
			$(ibj).animate({"left": "-700px", "opacity": 0}, {duration: 400, easing: "easeInBack", complete: function(){
				$(ibj).css("left", "1000px");
			}});
		},200);
	}

	function autoPlay(){
		if(_it){
			clearInterval(_it);
			_it = null;
		}
		_it = setInterval(function(){
			var ni = index + 1;
			if(ni == tlen){ni = 0;}
			moveOut(thumbs[index], intros[index], function(){
				moveIn(thumbs[ni], intros[ni]);
			});
			$(ctls[index]).removeClass("select");
			$(ctls[ni]).addClass("select");
			index = ni;
		}, 5000);
	}
	autoPlay();

	ctls.bind("mouseover", function(){
		clearInterval(_it);
		_it = null;
	});
	ctls.bind("mouseout", function(){
		autoPlay();
	});

	ctls.bind("click", function(){
		var num = $.inArray(this, ctls);
		moveOut(thumbs[index], intros[index], function(){
			moveIn(thumbs[num], intros[num]);
		});
		$(ctls[index]).removeClass("select");
		$(ctls[num]).addClass("select");
		index = num;
	});
});