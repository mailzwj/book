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