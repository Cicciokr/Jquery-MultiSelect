/*
* MultiSelect v0.9.11
* Copyright (c) 2012 Francesco Pantisano
*/

!function ($) {

	"use strict";


	/* MULTISELECT CLASS DEFINITION
	* ====================== */

	var MultiSelect = function (element, options) {
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
		this.ctrlPressed = false;
	};

	MultiSelect.prototype = {
		constructor: MultiSelect,

		init: function () {
			var that = this, ms = this.$element;

			if (ms.next('.ms-container').length === 0) {
				ms.css({ position: 'absolute', left: '-9999px' });
				ms.attr('id', ms.attr('id') ? ms.attr('id') : Math.ceil(Math.random() * 1000) + 'multiselect');
				that.$container.attr('id', 'ms-' + ms.attr('id'));
				that.$container.addClass(that.options.cssClass);
				that.$selectableUl.css("height", that.options.height);
				that.$selectionUl.css("height", that.options.height);

				if (that.options.dataSource.length > 0) {
					for (var i = 0; i < that.options.dataSource.length; i++) {
						that.options.dataSource[i].ulselected = false;
						//						if (that.options.orderBtn) {
						//							that.options.dataSource[i].order = that.options.dataSource[i].DirezioneOrdinamento;
						//						}
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

				//that.activeMouse(that.$selectableUl);
				//that.activeKeyboard(that.$selectableUl);

				that.activeButton(that.$container.find(".ms-control"), that.options.buttons);
				that.activeButton(that.$container.find(".ms-control-selected"), that.options.buttonsSelected);

				var action = that.options.dblClick ? 'dblclick' : that.options.clickEvent;
				var actionClick = that.options.clickEvent;

				that.$selectableUl.on(actionClick, 'li', function (e) {
					if (!e.ctrlKey) {
						that.$selectableUl.find("li").removeClass("k-state-selected");
					}

					if (!$(this).hasClass("k-state-selected")) {
						$(this).addClass("k-state-selected");
					} else {
						$(this).removeClass("k-state-selected");
					}
				});

				if (that.options.orderBtn) {
					that.$selectionUl.on(actionClick, 'li span.orderBtn', function (e) {
						e.preventDefault();
						var $this = $(this);
						var order = "asc";

						if (!$this.hasClass("k-i-arrow-n")) {
							$this.addClass("k-i-arrow-n");
							$this.removeClass("k-i-arrow-s");
							$this.attr('alt', 'ordinamento<br />crescente');
						} else {
							$this.removeClass("k-i-arrow-n");
							$this.addClass("k-i-arrow-s");
							order = "desc";
							$this.attr('alt', 'ordinamento<br />decrescente');
						}


						var dataIndex = $this.parent().attr("data-index");
						var thisElement = that.options.dataSource[dataIndex];
						//thisElement.order = order;
						thisElement.DirezioneOrdinamento = order;
						return false;
					});
				}

				that.$selectionUl.on(actionClick, 'li', function (e) {
					if (!e.ctrlKey) {
						that.$selectionUl.find("li").removeClass("k-state-selected");
					}

					if (!$(this).hasClass("k-state-selected")) {
						$(this).addClass("k-state-selected");
					} else {
						$(this).removeClass("k-state-selected");
					}
				});

				if (action == 'dblclick') {
					that.$selectableUl.on(action, 'li', function () {
						console.log("doppio click");	
						$(this).addClass("k-state-selected");
						that._toSelected();
					});
					if (!that.options.orderBtn) {
						that.$selectionUl.on(action, 'li', function () {
							if (!$(this).hasClass("k-state-selected")) {
								$(this).addClass("k-state-selected");
							} else {
								$(this).removeClass("k-state-selected");
							}

							that._toSelectable();
						});
					}
				}

				ms.on('focus', function () {
					that.$selectableUl.focus();
				})
			}

			/*var selectedValues = ms.find('option:selected').map(function () { return $(this).val(); }).get();
			that.select(selectedValues, 'init');*/

			if (typeof that.options.afterInit === 'function') {
				that.options.afterInit.call(this, this.$container);
			}
		},
		'generateListFromDataSource': function (option, index, element) {
			var that = this, orderBtn = "", ms = that.$element, attributes = "class=\"no-selection " + element[option.value] + "\" data-index=" + index, $option = element;
			
			if (option.orderBtn) {
				var orderCls = "";
				var alt = '';
				if ('DirezioneOrdinamento' in $option) {
					console.log("$option.DirezioneOrdinamento: ", $option.DirezioneOrdinamento);
					if ($option.DirezioneOrdinamento == "asc") {
						orderCls = "k-i-arrow-n";
						alt = 'ordinamento<br />crescente';
					} else if ($option.DirezioneOrdinamento == "desc") {
						orderCls = "k-i-arrow-s";
						alt = 'ordinamento<br />decrescente';
					} else {
						$option.DirezioneOrdinamento = "asc";
						orderCls = "k-i-arrow-n";
						alt = 'ordinamento<br />crescente';
					}
				}

				orderBtn = "<span alt='" + alt + "' style\"cursor:hand;\" class=\"k-icon " + orderCls + " no-margin-top orderBtn no-selection pull-right\"></span>";
			}

			var label = that.escapeHTML($option[option.label]);
			var tooltip = $option[option.tooltip] != null ? that.escapeHTML($option[option.tooltip]) : '';

			var selectableLi = $("<li " + attributes + "><span alt='" + tooltip + "'>" + label + "</li>"),
				selectedLi = $("<li " + attributes + "><span alt='" + tooltip + "'>" + label + "</span>" + orderBtn + "</li>"),
			value = $option[option.value];
			var elementId = that.idUl + "-" + index;
			//elementId = that.sanitize(value);
			selectableLi.data('ms-value', value).attr('id', elementId + '-selectable');
			//.addClass('ms-elem-selectable')
			selectedLi.data('ms-value', value).attr('id', elementId + '-selection').hide();
			//.addClass('ms-elem-selection')
			if (('disabled' in $option && $option['disabled']) || ms.prop('disabled')) {
				selectedLi.addClass(that.options.disabledClass);
				selectableLi.addClass(that.options.disabledClass);
			}

			index = index == undefined ? that.$selectableUl.children().length : index;

			selectableLi.insertAt(index, that.$selectableUl);
			selectedLi.insertAt(index, that.$selectionUl);
		},

		'escapeHTML': function (text) {
			text = text.replace("<br />", " ");
			text = text.replace("<BR />", " ");
			text = text.replace("<BR>", " ");
			text = text.replace("<BR/>", " ");
			text = text.replace("&#8364;", "&euro;");
			return text;
		},
		'activeButton': function ($containerBtn, buttons) {
			var that = this;
			$.each(buttons, function (i, item) {
				var btn = $("<li class=\"k-button " + item.cssClass + "\">" + item.text + "</li>");
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
			this.$element.multiSelect(this.options);
		},

		'destroy': function () {
			$("#ms-" + this.$element.attr("id")).remove();
			this.$element.css('position', '').css('left', '')
			this.$element.removeData('multiselect');
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

			var selectable = that.$selectableUl.find(".k-state-selected");
			$.each(selectable, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				selectedElement.push(that.options.dataSource[dataIndex]);
			});

			if (that.checkSelectedElement(selectedElement)) {
				//this.$selectionUl.append(selectable);
				$.each(selectable, function (i, item) {
					$(item).removeClass("k-state-selected");
					var dataIndex = $(item).attr("data-index");
					$("#" + that.idUl + "-" + dataIndex + "-selection").appendTo(that.$selectionUl);
					$("#" + that.idUl + "-" + dataIndex + "-selection").show();
					$("#" + that.idUl + "-" + dataIndex + "-selectable").hide();
					that.options.dataSource[dataIndex].ulselected = true;
				});
			}
		},
		'_allToSelectable': function () {
			var that = this,
          ms = this.$element, selectedElement = [];

			//var selected = this.$selectionUl.find("li");
			var selected = this.$selectionUl.find("li:visible");

			$.each(selected, function (i, item) {
				var dataIndex = $(item).attr("data-index");
				selectedElement.push(that.options.dataSource[dataIndex]);
			});

			if (that.checkSelectableElement(selectedElement)) {
				//this.$selectableUl.append(selectable);
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
			/*that.$selectableContainer.html("");
			that.$selectionContainer.html("");

			if (that.options.dataSource.length > 0) {
			for (var i = 0; i < that.options.dataSource.length; i++) {
			that.options.dataSource[i].ulselected = false;
			that.generateListFromDataSource(that.options, i, that.options.dataSource[i]);
			}
			}*/
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
						if ('DirezioneOrdinamento' in that.options.dataSource[dataIndex] && 'DirezioneOrdinamento' in element[i]) {
							that.options.dataSource[dataIndex].DirezioneOrdinamento = element[i].DirezioneOrdinamento;
						}

						if ('SequenzaOrdinamento' in that.options.dataSource[dataIndex] && 'SequenzaOrdinamento' in element[i]) {
							that.options.dataSource[dataIndex].SequenzaOrdinamento = element[i].SequenzaOrdinamento;
						}
					}
				}
			}

			//that._toSelected();
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

	/* MULTISELECT PLUGIN DEFINITION
	* ======================= */

	$.fn.multiSelect = function (options) {
		var option = arguments[0],
        args = arguments;

		return this.each(function () {
			var $this = $(this),
			data = $this.data('multiselect');

			var isTouchSupported = ("ontouchend" in document);
			var event = isTouchSupported ? "touchend" : "click";
			option.clickEvent = event;

			var options = $.extend({}, $.fn.multiSelect.defaults, $this.data(), typeof option === 'object' && option);

			if (!data) { $this.data('multiselect', (data = new MultiSelect(this, options))); }

			if (typeof option === 'string') {
				data[option](args[1]);
			} else {
				data.init();
			}
		});
	};

	$.fn.multiSelect.defaults = {
		keySelect: [32],
		selectableOptgroup: false,
		disabledClass: 'disabled',
		dblClick: true,
		keepOrder: false,
		orderBtn: false,
		cssClass: '',
		value: 'ValueCombo',
		label: 'TestoCombo',
		tooltip: 'DescrizioneEstesaElemento',
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

	$.fn.multiSelect.Constructor = MultiSelect;

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
