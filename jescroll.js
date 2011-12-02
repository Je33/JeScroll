/**
 * 
 * JeScroll - v0.0.1beta1 - 2011-11-02
 * author: Evgeny Koltsov, Russia
 * http://rocketmind.ru/
 *
 * Copyright (c) 2011 Rocketmind Digital
 * Dual licensed under the MIT and GPL licenses.
 * 
 * Requirements:
 * JQuery v1.4.1 or later
 * 
 * Description:
 * Simple JQuery plugin for scrolling panels with support for mouse wheel
 * 
 * Usage:
 * $("<jquery selector (http://api.jquery.com/category/selectors/)>").jescroll(params);
 * Object @params by default:
 * 		ouseStep: 30,
 * 		scrollWidth: 10,
 * 		scrollBackground: 'silver',
 * 		scrollBorder: 0,
 * 		controlWidth: 10,
 * 		controlBackground: 'gray',
 * 		controlBorder: 0
 * 
 * ToDo:
 * - adding a horizontal mode
 * - more options
 * - more cross browser compatible
 * - more beer
 * - more bitches
 * 
 */

$(function($) {
	
	$.event.special.mousewheel = {
		setup: function() {
			var handler = $.event.special.mousewheel.handler;
			
			if ($.browser.mozilla)
				$(this).bind('mousemove.mousewheel', function(event) {
					$.data(this, 'mwcursorposdata', {
						pageX: event.pageX,
						pageY: event.pageY,
						clientX: event.clientX,
						clientY: event.clientY
					});
				});
		
			if ( this.addEventListener )
				this.addEventListener(($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
			else
				this.onmousewheel = handler;
		},
		
		teardown: function() {
			var handler = $.event.special.mousewheel.handler;
			
			$(this).unbind('mousemove.mousewheel');
			
			if (this.removeEventListener)
				this.removeEventListener(($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
			else
				this.onmousewheel = function(){};
			
			$.removeData(this, 'mwcursorposdata');
		},
		
		handler: function(event) {
			var args = Array.prototype.slice.call(arguments, 1);
			
			event = $.event.fix(event || window.event);
			// Get correct pageX, pageY, clientX and clientY for mozilla
			$.extend(event, $.data(this, 'mwcursorposdata') || {});
			var delta = 0, returnValue = true;
			
			if (event.wheelDelta) delta = event.wheelDelta/120;
			if (event.detail) delta = -event.detail/3;
			if ($.browser.opera) delta = -event.wheelDelta;
			
			event.data  = event.data || {};
			event.type  = "mousewheel";
			
			args.unshift(delta);
			args.unshift(event);

			return $.event.handle.apply(this, args);
		}
	};

	$.fn.extend({
		mousewheel: function(fn) {
			return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
		},
		
		unmousewheel: function(fn) {
			return this.unbind("mousewheel", fn);
		}
	});

	$.fn.jescroll = function(options) {

		var settings = $.extend({
			
			'mouseStep': 30,
			'scrollWidth': 10,
			'scrollBackground': 'silver',
			'scrollBorder': 0,
			'controlWidth': 10,
			'controlBackground': 'gray',
			'controlBorder': 0
			
		}, options);

		return this.each(function() {

			var th = $(this),
				inner = th.html();
			
			var str = '<div class="jescroll-view"><div class="jescroll-pane"></div></div>';
				str += '<div class="jescroll-scroll"><div class="jescroll-ctrl"></div></div>';
			
			th.html(str);
			
			var ctrl = th.find('.jescroll-ctrl');
			var scrol = th.find('.jescroll-scroll');
			var pane = th.find('.jescroll-pane');
			var view = th.find('.jescroll-view');
			var c = 0;
			
			scrol.css({
				'float': 'right',
				'position': 'relative',
				'height': th.height(),
				'width': settings.scrollWidth,
				'background': settings.scrollBackground,
				'border': settings.scrollBorder
			});
			
			ctrl.css({
				'position': 'absolute',
				'width': settings.controlWidth,
				'background': settings.controlBackground,
				'border': settings.controlBorder
			});
			
			view.css({
				'position': 'relative',
				'float': 'left',
				'height': th.height(),
				'width': th.width() - scrol.width()
			});
			
			pane.css({
				'position': 'absolute',
				'width': view.width()
			}).html(inner);

			ctrl.unbind('click');
			th.unbind('mousewheel');
			pane.height('');
			ctrl.height('');

			var st = -settings.mouseStep;

			var viewHeight = view.height();
			var paneHeight = pane.height();
			var scrolHeight = scrol.height();
			var ctrlHeight = Math.round((viewHeight * scrolHeight) / paneHeight);
			ctrlHeight = (ctrlHeight > scrolHeight) ? scrolHeight : ctrlHeight;
			ctrl.css('height', ctrlHeight);
			ctrl.css('top', 0);
			pane.css('top', 0);
			th.find('.ctrl-vertical-top').first().css('height', ctrlHeight / 2);
			var px = paneHeight / scrolHeight;
			var canDg = false;
			var shift;

			ctrl.mousedown(function(event) {
				if (!event) {
					event = $(window).event;
				}
				canDg = true;
				shift = event.clientY - parseInt(ctrl.position().top);
				return false;
			});

			$(document).mousemove(
					function(event) {
						if (!event) {
							event = $(window).event;
						}
						if (canDg) {
							var newPos = event.clientY - shift;
							if ((newPos <= scrolHeight - ctrlHeight) && (newPos >= 0)) {
								ctrl.css('top', newPos);
							} else if (newPos > scrolHeight - ctrlHeight) {
								ctrl.css('top', (scrolHeight - ctrlHeight));
							} else {
								ctrl.css('top', 0);
							}
							pane.stop().css(
									{
										'top' : Math.round(parseInt(ctrl.position().top)
												* px * (-1))
									});
							return false;
						}
						return false;
					});

			$(document).mouseup(function() {
				canDg = false;
			});

			th.mousewheel(function(event, delta) {
				var wpx = delta;
				if (wpx) {
					var curPos = parseInt(ctrl.position().top);
					var newPos = wpx * st + curPos;
					if ((newPos <= scrolHeight - ctrlHeight) && (newPos >= 0)) {
						ctrl.css('top', newPos);
					} else if (newPos > scrolHeight - ctrlHeight) {
						ctrl.css('top', (scrolHeight - ctrlHeight));
					} else {
						ctrl.css('top', 0);
					}
					pane.stop().css(
							{
								'top' : Math.round(parseInt(ctrl.position().top) * px
										* (-1))
							});
					return false;
				}
				if (event.preventDefault) {
					event.preventDefault();
				}
				event.returnValue = false;
				if (!event) {
					event = window.event;
				}
				if (event.stopPropagation)
					event.stopPropagation();
				else
					event.cancelBubble = true;
				if (event.preventDefault)
					event.preventDefault();
				else
					event.returnValue = false;
			});

			scrol.mousedown(function(event) {
				var newPos = event.clientY - scrol.offset().top
						- Math.round(ctrlHeight / 2);
				if ((newPos <= scrolHeight - ctrlHeight) && (newPos >= 0)) {
					ctrl.css('top', newPos);
				} else if (newPos > scrolHeight - ctrlHeight) {
					ctrl.css('top', (scrolHeight - ctrlHeight));
				} else {
					ctrl.css('top', 0);
				}
				pane.stop().css({
					top : Math.round(parseInt(ctrl.position().top) * px * (-1))
				}, 500);
				return false;
			});

		});

	};
	
});