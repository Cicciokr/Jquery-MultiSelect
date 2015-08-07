/*
* SelectMultiple v 0.1
* Copyright (c) 2015 Francesco Pantisano Original By Louis Cuny v 0.9.11
*
*/

!function ($) {

	"use strict";

	var SelectMultiple = function (element, options) {
		this.options = options;
		this.$element = $(element);
		this.$container = $('<div/>', { 'class': "ms-container" });
		this.$selectableContainer = $('<div/>', { 'class': 'ms-selectable' });
		this.$selectionContainer = $('<div/>', { 'class': 'ms-selection' });
		this.$selectableUl = $('<ul/>', { 'class': "ms-list", 'tabindex': '-1' });
		this.$selectionUl = $('<ul/>', { 'class': "ms-list", 'tabindex': '-1' });
		this.scrollTo = 0;
		this.idUl = $(element).attr("id");
		this.elemsSelector = 'li:visible:not(.ms-optgroup-label,.ms-optgroup-container,.' + options.disabledClass + ')';
	};

    SelectMultiple.prototype = {
		constructor: SelectMultiple,

		init: function () {
			var that = this, ms = this.$element;

			if (ms.next('.ms-container').length === 0) {
				ms.css({ position: 'absolute', left: '-9999px' });
				ms.attr('id', ms.attr('id') ? ms.attr('id') : Math.ceil(Math.random() * 1000) + 'selectMultiple');
				this.$container.attr('id', 'ms-' + ms.attr('id'));
				this.$container.addClass(that.options.cssClass);
				this.$selectableUl.css("height", that.options.height);
				this.$selectionUl.css("height", that.options.height);
				//debugger;

				if (that.options.dataSource.length > 0) {
					for (var i = 0; i < that.options.dataSource.length; i++) {
						that.options.dataSource[i].ulselected = false;
						that.generateListFromDataSource(that.options, i, that.options.dataSource[i]);
					}
				} else {
					ms.find('option').each(function () {
						that.generateListFromOption(this);
					});
				}

				this.$selectionUl.find('.ms-optgroup-label').hide();

				if (that.options.selectableHeader) {
					that.$selectableContainer.append(that.options.selectableHeader);
				}
				that.$selectableContainer.append(that.$selectableUl);
				if (that.options.selectableFooter) {
					that.$selectableContainer.append(that.options.selectableFooter);
				}

				if (that.options.selectionHeader) {
					that.$selectionContainer.append(that.options.selectionHeader);
				}
				that.$selectionContainer.append(that.$selectionUl);
				if (that.options.selectionFooter) {
					that.$selectionContainer.append(that.options.selectionFooter);
				}

				that.$container.append(that.$selectableContainer);
				that.$container.append("<ul class=\"ms-control\"></ul>");
				that.$container.append(that.$selectionContainer);
				that.$container.append("<ul class=\"ms-control-selected\"></ul>");
				ms.after(that.$container);


				that.activeButton(that.$container.find(".ms-control"), that.options.buttons);
				that.activeButton(that.$container.find(".ms-control-selected"), that.options.buttonsSelected);

				var action = that.options.dblClick ? true : false;
				var actionClick = that.options.clickEvent;

				that.$selectableUl.on(actionClick, 'li', function () {

					if (!$(this).hasClass("k-state-selected")) {
						$(this).addClass("k-state-selected");
					} else {
						$(this).removeClass("k-state-selected");
					}
				});

				that.$selectionUl.on(actionClick, 'li', function () {

					if (!$(this).hasClass("k-state-selected")) {
						$(this).addClass("k-state-selected");
					} else {
						$(this).removeClass("k-state-selected");
					}
				});


				if (action) {
					that.$selectableUl.on('dblclick', 'li', function () {

						if (!$(this).hasClass("k-state-selected")) {
							$(this).addClass("k-state-selected");
						} else {
							$(this).removeClass("k-state-selected");
						}

						that._toSelected();
					});

					that.$selectionUl.on('dblclick', 'li', function () {

						if (!$(this).hasClass("k-state-selected")) {
							$(this).addClass("k-state-selected");
						} else {
							$(this).removeClass("k-state-selected");
						}

						that._toSelectable();
					});
				}

				ms.on('focus', function () {
					that.$selectableUl.focus();
				})
			}

			if (typeof that.options.afterInit === 'function') {
				that.options.afterInit.call(this, this.$container);
			}
		},
		'generateListFromDataSource': function (option, index, element) {
			var that = this,
		          ms = that.$element,
		          attributes = "class=\"no-selection "+ element[option.value] + "\" data-index=" + index,
				  $option = element;
		
					var selectableLi = $('<li ' + attributes + '><span>' + that.escapeHTML($option[option.label]) + '</span></li>'),
		          selectedLi = selectableLi.clone(),
		          value = $option[option.value];
					var elementId = that.idUl + "-" + index;
					//elementId = that.sanitize(value);
		
					selectableLi
		        .data('ms-value', value)
					//.addClass('ms-elem-selectable')
		        .attr('id', elementId + '-selectable');
		
					selectedLi
		        .data('ms-value', value)
					//.addClass('ms-elem-selection')
		        .attr('id', elementId + '-selection')
		        .hide();

			if (('disabled' in $option && $option['disabled']) || ms.prop('disabled')) {
				selectedLi.addClass(that.options.disabledClass);
				selectableLi.addClass(that.options.disabledClass);
			}
			index = index == undefined ? that.$selectableUl.children().length : index;

			selectableLi.insertAt(index, that.$selectableUl);
			selectedLi.insertAt(index, that.$selectionUl);
		},

		'escapeHTML': function (text) {
			if(typeof text != 'undefined')
			{
			text = text.replace("<br />", " ");
			text = text.replace("<BR />", " ");
			text = text.replace("<BR>", " ");
			text = text.replace("<BR/>", " ");
			text = text.replace("&#8364;", "&euro;");
			return text;
			}
		},
		'activeButton': function ($containerBtn, buttons) {
			var that = this;
			$.each(buttons, function (i, item) {
				var btn = $("<li class=\"btn btn-default " + item.cssClass + "\">" + item.text + "</li>");
				btn.on(that.options.clickEvent, function (e) {
					that[item.click]();
				});
				$containerBtn.append(btn);
			});
		},

		'activeMouse': function ($list) {
			var that = this;

			$('body').on('mouseenter', that.elemsSelector, function () {
				$(this).parents('.ms-container').find(that.elemsSelector).removeClass('ms-hover');
				$(this).addClass('ms-hover');
			});

			$('body').on('mouseleave', that.elemsSelector, function () {
				$(this).parents('.ms-container').find(that.elemsSelector).removeClass('ms-hover'); ;
			});
		},

		'refresh': function () {
			this.destroy();
			this.$element.selectMultiple(this.options);
		},

		'destroy': function () {
			$("#ms-" + this.$element.attr("id")).remove();
			this.$element.css('position', '').css('left', '')
			this.$element.removeData('selectMultiple');
		},
		'_toSelectable': function () {
			//id = index-selected hide, index-selectable show
			var that = this, ms = this.$element, selectedElement = [];

			var selected = that.$selectionUl.find(".k-state-selected");
			$.each(selected, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				selectedElement.push(that.options.dataSource[dataIndex]);
			});

			if (that.checkSelectableElement(selectedElement)) {
				//this.$selectableUl.append(selectable);
				$.each(selected, function (i, item) {
					$(item).removeClass("k-state-selected");
					var dataIndex = $(item).attr("data-index");
					$("#" + that.idUl + "-" + dataIndex + "-selection").hide();
					$("#" + that.idUl + "-" + dataIndex + "-selectable").show();
					that.options.dataSource[dataIndex].ulselected = false;
				});
			}
		},
		'_toSelected': function () {
			var that = this, ms = this.$element, selectedElement = [];

			var selectable = this.$selectableUl.find(".k-state-selected");
			$.each(selectable, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				selectedElement.push(that.options.dataSource[dataIndex]);
			});

			if (that.checkSelectedElement(selectedElement)) {
				//this.$selectionUl.append(selectable);
				$.each(selectable, function (i, item) {
					$(item).removeClass("k-state-selected");
					var dataIndex = $(item).attr("data-index");
					$("#" + that.idUl + "-" + dataIndex + "-selection").show();
					$("#" + that.idUl + "-" + dataIndex + "-selectable").hide();
					that.options.dataSource[dataIndex].ulselected = true;
				});
			}
		},
		'_allToSelectable': function () {
			var that = this,
          ms = this.$element, selectedElement = [];

			var selected = this.$selectionUl.find("li:visible");

			$.each(selected, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				selectedElement.push(that.options.dataSource[dataIndex]);
			});

			if (that.checkSelectableElement(selectedElement)) {

				$.each(selected, function (i, item) {
					$(item).removeClass("k-state-selected");
					var dataIndex = $(item).attr("data-index");
					$("#" + that.idUl + "-" + dataIndex + "-selection").hide()
					$("#" + that.idUl + "-" + dataIndex + "-selectable").show();
					that.options.dataSource[dataIndex].ulselected = false;
				});
			}
		},
		'_allToSelected': function () {
			var that = this, ms = this.$element, selectedElement = [];

			//var selectable = this.$selectableUl.find("li");
			var selectable = this.$selectableUl.find("li:visible");

			$.each(selectable, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				selectedElement.push(that.options.dataSource[dataIndex]);
			});


			if (that.checkSelectedElement(selectedElement)) {
				//this.$selectionUl.append(selectable);
				$.each(selectable, function (i, item) {
					$(item).removeClass("k-state-selected");
					var dataIndex = $(item).attr("data-index");
					$("#" + that.idUl + "-" + dataIndex + "-selection").show()
					$("#" + that.idUl + "-" + dataIndex + "-selectable").hide();
					that.options.dataSource[dataIndex].ulselected = true;
				});
			}
		},
		'_toSelectedUp': function () {
			var that = this, ms = this.$element;
			var selectedItem = this.$selectionUl.find(".k-state-selected");
			if (selectedItem.length > 1) {
				alert("Selezionare una riga per volta");
			} else {
				var previosLI = $(selectedItem).prevAll("li:visible").first();
				$(selectedItem).insertBefore($(previosLI));
			}
		},
		'_toSelectedDown': function () {
			var that = this, ms = this.$element;

			var selectedItem = this.$selectionUl.find(".k-state-selected");
			if (selectedItem.length > 1) {
				alert("Selezionare una riga per volta");
			} else {
				var previosLI = $(selectedItem).nextAll("li:visible").first();
				$(selectedItem).insertAfter($(previosLI));
			}
		},
		checkSelectedElement: function (selectedElement) {
			var that = this, ms = this.$element, ret = true;
			if (typeof that.options.beforeSelect === 'function') {
				ret = that.options.beforeSelect.call(this, selectedElement);
				if (ret == null || typeof ret == 'undefined') ret = true;
			}

			if (ret) {
				if (typeof that.options.afterSelect === 'function') {
					that.options.afterSelect.call(this, selectedElement);
				}
			}

			return ret;
		},
		checkSelectableElement: function (selectedElement) {
			var that = this, ms = this.$element, ret = true;
			if (typeof that.options.beforeSelectable === 'function') {
				ret = that.options.beforeSelectable.call(this, selectedElement);
				if (ret == null || typeof ret == 'undefined') ret = true;
			}

			if (ret) {
				if (typeof that.options.afterSelectable === 'function') {
					that.options.afterSelectable.call(this, selectedElement);
				}
			}

			return ret;
		},
		returnSelected: function () {
			var that = this, ms = this.$element, selectedElement = [];
			var selectedItem = this.$selectionUl.find("li:visible");
			$.each(selectedItem, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				var thisElement = that.options.dataSource[dataIndex];
				selectedElement.push(thisElement);
			});

			return selectedElement;
		},
		returnSelectable: function () {
			var that = this, ms = this.$element, selectedElement = [];

			var selectedItem = this.$selectableUl.find("li:visible");
			$.each(selectedItem, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				var thisElement = that.options.dataSource[dataIndex];
				selectedElement.push(thisElement);
			});

			return selectedElement;
		},
		setDatasource: function (datasource) {
			var that = this;
			that.options.dataSource.length = 0;
			that.options.dataSource = datasource;
			that.refresh();
		},
		setSelectedElement: function (element) {
			var that = this;
			for (var i = 0; i < element.length; i++) {
				var value = element[i][that.options.value];

				var item = that.$selectionContainer.find("." + value);
				if (item != null && typeof item != 'undefined') {
					//$(item).addClass("k-state-selected");
					var dataIndex = $(item).attr("data-index");

					that.$selectionContainer.find("ul").append($("#" + that.idUl + "-" + dataIndex + "-selection"));
					$("#" + that.idUl + "-" + dataIndex + "-selection").show();
					$("#" + that.idUl + "-" + dataIndex + "-selectable").hide();
					if (typeof that.options.dataSource[dataIndex] != 'undefined' && that.options.dataSource[dataIndex] != null) {
						that.options.dataSource[dataIndex].ulselected = true;
					}
				}
			}

		},
		sanitize: function (value) {
			var hash = 0, i, character;
			if (value.length == 0) return hash;
			var ls = 0;
			for (i = 0, ls = value.length; i < ls; i++) {
				character = value.charCodeAt(i);
				hash = ((hash << 5) - hash) + character;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		}
	};

	/* plugin definition
	* ======================= */

	$.fn.selectMultiple = function (options) {
		var option = arguments[0],
        args = arguments;

		return this.each(function () {
			var $this = $(this),
			data = $this.data('selectMultiple');

			var isTouchSupported = ("ontouchend" in document);
			var event = isTouchSupported ? "touchend" : "click";
			option.clickEvent = event;

			var options = $.extend({}, $.fn.selectMultiple.defaults, $this.data(), typeof option === 'object' && option);

			if (!data) { $this.data('selectMultiple', (data = new SelectMultiple(this, options))); }

			if (typeof option === 'string') {
				data[option](args[1]);
			} else {
				data.init();
			}
		});
	};

	$.fn.selectMultiple.defaults = {
		keySelect: [32],
		disabledClass: 'disabled',
		dblClick: true,
		cssClass: '',
		value: 'Value',
		label: 'Text',
		dataSource: [],
		clickEvent: 'click',
		height: 'auto',
		beforeSelect: function (data) {
			return true;
		},
		beforeSelectable: function (data) {
			return true;
		},
		buttons: [{ click: "_toSelected", text: ">", cssClass: "" }, { click: "_toSelectable", text: "<", cssClass: "" }, { click: "_allToSelected", text: ">>", cssClass: "" }, { click: "_allToSelectable", text: "<<", cssClass: ""}],
		buttonsSelected: [{ click: "_toSelectedUp", text: " ", cssClass: "arrow-up" }, { click: "_toSelectedDown", text: " ", cssClass: "arrow-down"}]
	};

	$.fn.selectMultiple.Constructor = SelectMultiple;

	$.fn.insertAt = function (index, $parent) {
		return this.each(function () {
			if (index === 0) {
				$parent.prepend(this);
			} else {
				$parent.children().eq(index - 1).after(this);
			}
		});
	}

} (window.jQuery);
