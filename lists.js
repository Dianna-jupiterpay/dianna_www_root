/*@preserve
|| ######################################################################## ||
|| # encorePOS 1.3.100.105                                                # ||
|| # lists.js                                                              # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
@endpreserve*/

//const { strict } = require("assert");

//const { format } = require("path");

function showjsItemList() {
	if ($("#jsItemListTableDiv").children().length > 0) {
		console.log("list already exists");
		$("#modaljsItemList").show();
		jsItemListTable.grid.jsGrid("loadData");

		return;
	}

	jsItemListTable = makeJSGridObject('item');

	f3Header();

	$("#jsItemListTableDiv .jsgrid-filter-row td").addClass("searchCell");
	$("#jsItemListTableDiv .jsgrid-filter-row").hide();

	$("#jsItemListTableDiv .jsgrid-load-panel, #jsItemListTableDiv .jsgrid-load-shader").css("z-index", "10000");

	setTimeout(function() {
	    $("#jsItemListTableDiv .jsgrid-header-row th:eq(1)").trigger('click');  // start off with brand sort
	}, 50);
}

function closejsItemList() {
	$("#modaljsItemList").hide();
	$("#jsItemListTableDiv").jsGrid("clearFilter")
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

/**
 * Show customer pick list.
 * @param {string} caller - The function calling customer list.
 * @param {string} dlNbr - The driver license nbr scanned (if from scan).
 * @param {string} bDay - The birthdate scanned (if from scan).
 */
function showjsCustList(caller, dlNbr, bDay) {
	//	
	if (!caller) caller = 'F8';
	if (!dlNbr) dlNbr = '';
	if (!bDay) bDay = '';
	
	if ( $("#jsCustListTableDiv").children().length > 0 ) {
		console.log( "list already exists");
		jsCustListTable.caller = caller;
		jsCustListTable.dlNbr = dlNbr;
		jsCustListTable.bDay = bDay;
		$("#modaljsCustList").show();
		jsCustListTable.grid.jsGrid("loadData");
	
		return;
	}

	jsCustListTable = makeJSGridObject('customer');
	jsCustListTable.caller = caller;
	jsCustListTable.dlNbr = dlNbr;
	jsCustListTable.bDay = bDay;

	f8Header();

	$("#jsCustListTableDiv .jsgrid-filter-row td").addClass("searchCell");
	$("#jsCustListTableDiv .jsgrid-filter-row").hide();

	$("#jsCustListTableDiv .jsgrid-load-panel, #jsCustListTableDiv .jsgrid-load-shader").css("z-index","10000");

	setTimeout(function() {
	    $("#jsCustListTableDiv .jsgrid-header-row th:eq(1)").trigger('click');  // start off with name sort
	}, 50);
}

function closejsCustList() {
	$("#modaljsCustList").hide();
	$("#custSearch").show();
	$("#custClearSearch").hide();
	jsCustListTable.grid.jsGrid("destroy");
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function showjsVendList() {
	if ($("#jsVendListTableDiv").children().length > 0) {
		console.log("list already exists");
		$("#modaljsVendList").show();
		jsVendListTable.grid.jsGrid("loadData");

		return;
	}

	jsVendListTable = makeJSGridObject('vend');

	vendHeader();

	$("#jsVendListTableDiv .jsgrid-filter-row td").addClass("searchCell");
	$("#jsVendListTableDiv .jsgrid-filter-row").hide();

	$("#jsVendListTableDiv .jsgrid-load-panel, #jsVendListTableDiv .jsgrid-load-shader").css("z-index", "10000");

	setTimeout(function() {
	    $("#jsVendListTableDiv .jsgrid-header-row th:eq(1)").trigger('click');  // start off with company sort
	}, 50);
}

function closejsVendList() {
	$("#modaljsVendList").hide();
	$("#jsVendListTableDiv").jsGrid("clearFilter");
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function showjsEmplList() {
	if ($("#jsEmplListTableDiv").children().length > 0) {
		console.log("list already exists");
		$("#modaljsEmplList").show();
		jsEmplListTable.grid.jsGrid("loadData");

		return;
	}

	jsEmplListTable = makeJSGridObject('empl');

	emplHeader();

	$("#jsEmplListTableDiv .jsgrid-filter-row td").addClass("searchCell");
	$("#jsEmplListTableDiv .jsgrid-filter-row").hide();

	$("#jsEmplListTableDiv .jsgrid-load-panel, #jsEmplListTableDiv .jsgrid-load-shader").css("z-index", "10000");

	setTimeout(function() {
	    $("#jsEmplListTableDiv .jsgrid-header-row th:eq(1)").trigger('click');  // start off with name sort
	}, 50);
}

function closejsEmplList() {
	$("#modaljsEmplList").hide();
	$("#jsEmplListTableDiv").jsGrid("clearFilter");
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function f3Header() {
	$("#jsItemListTableDiv .jsgrid-header-row th:eq(0)").css("text-align", "left");
	$("#jsItemListTableDiv .jsgrid-header-row th:eq(1)").css("text-align", "left");
	$("#jsItemListTableDiv .jsgrid-header-row th:eq(2)").css("text-align", "left");
	$("#jsItemListTableDiv .jsgrid-header-row th:eq(3)").css("text-align", "left");
	$("#jsItemListTableDiv .jsgrid-header-row th:eq(4)").css("text-align", "left");
}

function f8Header() {
	$("#jsCustListTableDiv .jsgrid-header-row th:eq(1)").css("text-align", "left");
	$("#jsCustListTableDiv .jsgrid-header-row th:eq(2)").css("text-align", "left");
}

function vendHeader() {
	$("#jsVendListTableDiv .jsgrid-header-row th:eq(1)").css("text-align", "left");
	$("#jsVendListTableDiv .jsgrid-header-row th:eq(2)").css("text-align", "left");
	$("#jsVendListTableDiv .jsgrid-header-row th:eq(3)").css("text-align", "left");
}

function emplHeader() {
	$("#jsEmplListTableDiv .jsgrid-header-row th:eq(1)").css("text-align", "left");
	$("#jsEmplListTableDiv .jsgrid-header-row th:eq(2)").css("text-align", "left");
	$("#jsEmplListTableDiv .jsgrid-header-row th:eq(4)").css("text-align", "left");
}

function makeJSGridObject( type ) {
	var obj;
	var db;
	var dataSource;
	var parent; 
	var pager;
	var gridDiv;
	var myGrid;
	var listFields;

	switch (type) {
			case 'item':
			dataSource = itemListData.data;
			parent = '#modaljsItemList';
			pager = '#jsItemListPager';
			gridDiv = '#jsItemListTableDiv';
			db = {
				loadData: function(filter) {
					return $.grep(this.items, function(item) {
						return (!filter.barcode || item.barcode.indexOf(filter.barcode.toUpperCase()) > -1)
							&& (!filter.brand || item.brand.indexOf(filter.brand.toUpperCase()) > -1)
							&& (!filter.descrip || item.descrip.indexOf(filter.descrip.toUpperCase()) > -1)
							&& (!filter.size || item.size.indexOf(filter.size.toUpperCase()) > -1)
							&& (!filter.type || item.type.indexOf(filter.type.toUpperCase()) > -1)
					});
				},
				items: dataSource
			};
			listFields = [
				{ name: "barcode", type: "text", width: 75, align: "left", headerTemplate: "Barcode" },
				{ name: "brand", type: "text", width: 125, align: "left", headerTemplate: "Brand" },
				{ name: "descrip", type: "text", width: 160, align: "left", headerTemplate: "Descrip" },
				{ name: "size", type: "text", width: 50, align: "left", headerTemplate: "Size" },
				{ name: "type", type: "text", width: 130, align: "left", headerTemplate: "Type" },
				{ name: "price", type: "number", width: 60, filtering: false, headerTemplate: "Price" },
				{ name: "code_num", type: "text", visible: false }
			];		
			break;

			case 'customer':
			dataSource = custListData.data;
			parent = '#modaljsCustList';
			pager = '#jsCustListPager';
			gridDiv = '#jsCustListTableDiv';
			db = {
				loadData: function(filter) {
					return $.grep(this.items, function(item) {
						return (!filter.custnum || item.custnum.indexOf(filter.custnum) > -1 || item.custnum.indexOf(filter.custnum.toUpperCase()) > -1)
							&& (!filter.name || item.name.indexOf(filter.name) > -1 || item.name.indexOf(filter.name.toUpperCase()) > -1)
							&& (!filter.phone || item.phone.indexOf(filter.phone) > -1 || item.phone.indexOf(filter.phone.toUpperCase()) > -1)
							&& (!filter.lastOrder || item.lastOrder.indexOf(filter.lastOrder) > -1 || item.lastOrder.indexOf(filter.lastOrder.toUpperCase()) > -1)
							&& (!filter.citySt || item.citySt.indexOf(filter.citySt) > -1 || item.citySt.indexOf(filter.citySt.toUpperCase()) > -1)
							&& (!filter.zip || item.zip.indexOf(filter.zip) > -1 || item.zip.indexOf(filter.zip.toUpperCase()) > -1)
					});
				},
				items: dataSource
			};
			listFields = [
				{ name: 'custnum', type: "text", width: 50, align: "right", headerTemplate: "Number" },
				{ name: 'name', type: "text", width: 200, align: "left", headerTemplate: "Name" },
				{ name: 'phone', type: "text", width: 75, align: "left", headerTemplate: "Phone" },
				{ name: 'purchases', type: "number", width: 50, filtering: false, headerTemplate: "Purchases" },
				{ name: 'lastOrder', type: "text", width: 75, align: "center", headerTemplate: "Last Order" },
				{ name: 'citySt', type: "text", width: 100, align: "left", headerTemplate: "City ST" },
				{ name: 'zip', type: "text", width: 50, align: "left", headerTemplate: "Zip" }
			];
			break;

			case 'vend':
			dataSource = vendListData.data;
			parent = '#modaljsVendList';
			pager = '#jsVendListPager';
			gridDiv = '#jsVendListTableDiv';
			db = {
				loadData: function(filter) {
					return $.grep(this.items, function(item) {
						return (!filter.vendnum || item.vendnum.indexOf(filter.vendnum) > -1 || item.vendnum.indexOf(filter.vendnum.toUpperCase()) > -1)
							&& (!filter.company || item.company.indexOf(filter.company) > -1 || item.company.indexOf(filter.company.toUpperCase()) > -1)
                            && (!filter.salesPer || item.salesPer.indexOf(filter.salesPer) > -1 || item.salesPer.indexOf(filter.salesPer.toUpperCase()) > -1)
							&& (!filter.phone || item.phone.indexOf(filter.phone) > -1 || item.phone.indexOf(filter.phone.toUpperCase()) > -1)
					});
				},
				items: dataSource
			};
			listFields = [
				{ name: 'vendnum', type: "text", width: 50, align: "right", headerTemplate: "Number" },
				{ name: 'company', type: "text", width: 200, align: "left", headerTemplate: "Company" },
				{ name: 'salesPer', type: "text", width: 75, align: "left", headerTemplate: "Sales Person" },
				{ name: 'phone', type: "text", width: 75, align: "left", headerTemplate: "Phone" }
			];
			break;

            case 'empl':
			dataSource = emplListData.data;
			parent = '#modaljsEmplList';
			pager = '#jsEmplListPager';
			gridDiv = '#jsEmplListTableDiv';
			db = {
				loadData: function(filter) {
					return $.grep(this.items, function(item) {
						return (!filter.empnum || item.empnum.indexOf(filter.empnum) > -1 || item.empnum.indexOf(filter.empnum.toUpperCase()) > -1)
							&& (!filter.name || item.name.indexOf(filter.name) > -1 || item.name.indexOf(filter.name.toUpperCase()) > -1)
							&& (!filter.phone || item.phone.indexOf(filter.phone) > -1 || item.phone.indexOf(filter.phone.toUpperCase()) > -1)
					});
				},
				items: dataSource
			};
			listFields = [
				{ name: 'id', type: "text", width: 50, align: "right", headerTemplate: "ID Nbr" },
				{ name: 'last_name', type: "text", width: 200, align: "left", headerTemplate: "Last Name" },
                { name: 'first_name', type: "text", width: 150, align: "left", headerTemplate: "First Name" },
                { name: 'initial', type: "text", width: 50, align: "left", headerTemplate: "M.I." },
				{ name: 'phone', type: "text", width: 75, align: "left", headerTemplate: "Phone" }
			];
			break;
    }

	//----- our list object
	obj = {
		currentPage: 1,
		totalPages: 0,
		rows: 0,
		height: 0,
		currLine: 0,
		db: db,
		listFields: listFields,
		caller: '',
		dlNbr: '',
		bDay: ''
	}

	$(parent).show();

																					 // 85 = y-coord of top of div (after other elements)
																					 // 28/33 = header height
																					 // 55 = spacer JS-Grid throws on bottom
	obj.rows   = Math.round( ( $(document).height() - 85 - 28 - 55 ) / 27 ) - 1;     // 27/32 = height of cell with 14px font
	obj.height = $(document).height() - 85;
	obj.totalPages = Math.round( dataSource.length / obj.rows );
	if ( dataSource.length % obj.rows > 0 ) {
		obj.totalPages++; // check for remainders and add one page if so
	}
	console.log( 'totalPages:', obj.totalPages );

	myGrid = $(gridDiv).jsGrid({
		width: "100%",
		height: "calc(100% - 85px)",

        editing: true,

        filtering: false,
        sorting: true,
        paging: true,
        autoload: true,
 
        pageSize: obj.rows,
		pageButtonCount: 5,
		pagerContainer: pager,
		pagerFormat: '{first} {prev} {next} {last}',
		pagePrevText: '<svg width="24pt" height="24pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="m60.418 75c-1.1055-0.003906-2.1602-0.44531-2.9375-1.2305l-20.832-20.832h-0.003907c-1.6133-1.625-1.6133-4.25 0-5.875l20.832-20.832h0.003907c1.6523-1.418 4.1172-1.3203 5.6562 0.21875 1.5391 1.5391 1.6328 4 0.21875 5.6562l-17.875 17.895 17.875 17.895c1.1836 1.1914 1.5352 2.9805 0.89453 4.5312s-2.1523 2.5664-3.832 2.5742z" fill="white"/></svg>', //"<",
		pageNextText: '<svg width="24pt" height="24pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="m39.582 75c-1.6797-0.007812-3.1914-1.0234-3.832-2.5742s-0.28906-3.3398 0.89453-4.5312l17.875-17.895-17.875-17.895c-1.4141-1.6562-1.3203-4.1172 0.21875-5.6562 1.5391-1.5391 4.0039-1.6367 5.6562-0.21875l20.832 20.832h0.003907c1.6133 1.625 1.6133 4.25 0 5.875l-20.832 20.832h-0.003907c-0.77734 0.78516-1.832 1.2266-2.9375 1.2305z" fill="white"/></svg>', //">",
        pageFirstText: '<svg width="24pt" height="24pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="m77.082 79.168c-0.73438-0.015625-1.4531-0.22266-2.082-0.60547l-41.668-25c-1.2422-0.75391-2.0039-2.1055-2.0039-3.5625s0.76172-2.8086 2.0039-3.5625l41.668-25c1.2891-0.74609 2.8789-0.74609 4.168 0 1.2734 0.73438 2.0664 2.0898 2.082 3.5625v50c0 1.1055-0.4375 2.1641-1.2188 2.9453s-1.8438 1.2227-2.9492 1.2227zm-33.562-29.168 29.398 17.645v-35.289z" fill="white"/><path d="m22.918 79.168c-2.3008 0-4.168-1.8672-4.168-4.168v-50c0-2.3008 1.8672-4.168 4.168-4.168s4.1641 1.8672 4.1641 4.168v50c0 1.1055-0.4375 2.1641-1.2188 2.9453s-1.8398 1.2227-2.9453 1.2227z" fill="white"/></svg>',
		pageLastText: '<svg width="24pt" height="24pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="m22.918 79.168c-2.3008 0-4.168-1.8672-4.168-4.168v-50c-0.007812-1.4961 0.78906-2.8789 2.082-3.625 1.2891-0.74609 2.8789-0.74609 4.168 0l41.668 25c1.2422 0.75391 2.0039 2.1055 2.0039 3.5625s-0.76172 2.8086-2.0039 3.5625l-41.668 25c-0.62109 0.40234-1.3438 0.63281-2.082 0.66797zm4.168-46.812-0.003907 35.289 29.398-17.645z" fill="white"/><path d="m77.082 79.168c-2.3008 0-4.1641-1.8672-4.1641-4.168v-50c0-2.3008 1.8633-4.168 4.1641-4.168s4.168 1.8672 4.168 4.168v50c0 1.1055-0.4375 2.1641-1.2188 2.9453s-1.8438 1.2227-2.9492 1.2227z" fill="white"/></svg>', //">>",
		pageNavigatorNextText: "&#8230;",
		pageNavigatorPrevText: "&#8230;",

		updateOnResize: true,
		
		controller: obj.db,

		onDataLoaded: function(grid,data) {
			console.log( 'onDataLoaded table length:', $(gridDiv+" .jsgrid-grid-body tr").length );
			$(gridDiv+" .jsgrid-row:eq(0) td").addClass("highlighted");
			obj.currLine = 0;

			var filter = $(gridDiv).jsGrid("getFilter");

			for (let [key, value] of Object.entries(filter)) {
				if (value.length > 0) {
					var nPos = obj.listFields.findIndex(function (element) { return element.name === key });
					$(gridDiv + " tbody td:nth-child(" + (nPos + 1) + ")").each(function () {
						var rawText = $(this).text();
						var cellText = rawText.toUpperCase();
						var searchText = value.toUpperCase();
						var searchLen = searchText.length;
						var nIndex = cellText.indexOf(searchText);

						if (nIndex > -1) {
							$(this).html(rawText.substring(0, nIndex) +
								"<span class=\"searchTerm\">" +
								rawText.substring(nIndex, nIndex + searchLen) +
								"</span>" +
								rawText.substring(nIndex + searchLen));
						}
					});
				};
			}

			$(".jsgrid-pager-page, .jsgrid-pager-nav-button").on('click', function(){ $(this).find("a").trigger('click')} );

			$(gridDiv + " .searchCell input").attr( 'type', 'search' );
			$(gridDiv + " .searchCell input").on('search', function(){console.log("change"); if ($(this).val()==="") { $(gridDiv).jsGrid("loadData")}});

			lPauseKeys = true;
/*
			$("body").keypress( function(e) {
				e.stopPropagation();

				console.log( 'from loaded, keypress which:', e.which, 'key:', e.key, 'len:', e.key.length, 'bubbles:', e.bubbles, 'code:', e.code );

				if (e.key===' ') { 
					console.log( 'space bar' );
					$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+")").trigger('click'); 
				}
			} );
*/		
		},

		onRefreshed: function() {
			$(gridDiv+" .jsgrid-grid-body tr:eq(0) td").addClass("highlighted");
			obj.currLine = 0;
			$(gridDiv+" .jsgrid-grid-body").scrollTop(0);
			console.log('onRefreshed rows:',$(".jsgrid-grid-body tr").length);
			
			$(gridDiv + " .jsgrid-cell").on("mouseenter", function () {
				$(gridDiv + " .jsgrid-grid-body tr:eq(" + obj.currLine + ") td").removeClass("highlighted");
				obj.currLine = $(this).parent().index();
				$(gridDiv + " .jsgrid-grid-body tr:eq(" + obj.currLine + ") td").addClass("highlighted");
			});

			var filter = $(gridDiv).jsGrid("getFilter");

			for (let [key, value] of Object.entries(filter)) {
				if (value.length > 0) {
					var nPos = obj.listFields.findIndex(function (element) { return element.name === key });
					$(gridDiv + " tbody td:nth-child(" + (nPos + 1) + ")").each(function () {
						var rawText = $(this).text();
						var cellText = rawText.toUpperCase();
						var searchText = value.toUpperCase();
						var searchLen = searchText.length;
						var nIndex = cellText.indexOf(searchText);

						if (nIndex > -1) {
							$(this).html(rawText.substring(0, nIndex) +
								"<span class=\"searchTerm\">" +
								rawText.substring(nIndex, nIndex + searchLen) +
								"</span>" +
								rawText.substring(nIndex + searchLen));
						}
					});
				};
			}

			$(".jsgrid-pager-page, .jsgrid-pager-nav-button").on('click', function(){ $(this).find("a").trigger('click')} );

			$(gridDiv + " .searchCell input").attr( 'type', 'search' );
/*
			// check for resize
			console.log( 'obj.height:', obj.height, 'calc:', $(document).height() - 85 );
			if ( obj.height !== $(document).height() - 85 ) {
				obj.height = $(document).height() - 85;
				console.log( 'old rows:', obj.rows );
				obj.rows   = Math.round( ( obj.height - 33 - 55 ) / 32 ) - 1;
				console.log( 'new rows:', obj.rows );
				obj.totalPages = Math.round( dataSource.length / obj.rows );
				if ( dataSource.length % obj.rows > 0 ) {
					obj.totalPages++; // check for remainders and add one page if so
				}
				$(gridDiv).jsGrid( { pageSize: obj.rows } );
			}
*/
            lPauseKeys = true;
 
		},

		rowClick: function(args) {
            let active = $(gridDiv).attr('id');

			console.log('active:', active, 'focused:', $(document.activeElement));

			$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+") td").removeClass("highlighted");
			obj.currLine = args.itemIndex;
			$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+") td").addClass("highlighted");

			if (active === 'jsItemListTableDiv') {
                console.log("popItem args:", args);
                console.log( "Going for popItem(). args.item:", args.item);
				popItem(args);

            } else if (active === 'jsCustListTableDiv' ) {
				popCust( args );
			} else if (active === 'jsVendListTableDiv' ) {
				popVend( args );
			} else if (active === 'jsEmplListTableDiv' ) {
                popEmpl( args );
            }
		},
		
		onPageChanged: function( args ) {
			var lFiltered = false;

			obj.currentPage = args.pageIndex;

			var filter = $(gridDiv).jsGrid("getFilter");
			console.log('filter:',filter);

			for (let [key, value] of Object.entries(filter)) {
				if (value.length > 0){
					lFiltered = true;
				};
			}

			if (!lFiltered) {
			    setTimeout( function() { $(gridDiv+" .jsgrid-filter-row").hide(); }, 100 );
				console.log( 'onPageChanged' );
			};
		},
 
        fields: listFields
	});

	obj.grid = myGrid;

	return obj;
}
/*
function popModal(args) {
    let active = $(document.activeElement).closest(".jsgrid-table").attr('id');

    console.log('active:', active, 'focused:', $(document.activeElement));

    $(gridDiv + " .jsgrid-grid-body tr:eq(" + obj.currLine + ") td").removeClass("highlighted");
    obj.currLine = args.itemIndex;
    $(gridDiv + " .jsgrid-grid-body tr:eq(" + obj.currLine + ") td").addClass("highlighted");

    if (active === 'jsItemListTableDiv') {
        console.log("popItem args:", args);
        console.log("Going for popItem(). args.item:", args.item);
        popItem(args);

    } else if (active === 'jsCustListTableDiv') {
        popCust(args);
    } else if (active === 'jsVendListTableDiv') {
        popVend(args);
    }
}
*/
function searchInputFocus(el) {
    let id = $(el).attr("id");

	if (id.includes("item")) {
		var lOpen = jsItemListTable.grid.jsGrid("option", "filtering");
		if (lOpen) {
			jsItemListTable.grid.jsGrid("option", "filtering", false);
			$("#itemClearSearch").hide();
			$("#itemSearch").show();
			$("#itemListAdd").show();
			jsItemListTable.grid.jsGrid("clearFilter");
		    jsItemListTable.grid.jsGrid("loadData");
            jsItemListTable.grid.jsGrid("sort", { field: "brand", order: "asc" });
		} else {
			jsItemListTable.grid.jsGrid("option", "filtering", true);
			$("#itemSearch").hide();
			$("#itemClearSearch").show();
			$("#itemListAdd").hide();
			setTimeout( function() { $("#jsItemListTableDiv .jsgrid-filter-row td:eq(0) input").focus(); }, 100 );
		}

	} else if (id.includes("cust")) {
		var lOpen = jsCustListTable.grid.jsGrid("option", "filtering");
		if (lOpen) {
			jsCustListTable.grid.jsGrid("option", "filtering", false);
			$("#custClearSearch").hide();
			$("#custSearch").show();
			jsCustListTable.grid.jsGrid("clearFilter");
			jsCustListTable.grid.jsGrid("loadData");
            jsCustListTable.grid.jsGrid("sort", { field: "name", order: "asc" });
		} else {
			jsCustListTable.grid.jsGrid("option", "filtering", true);
			$("#custSearch").hide();
			$("#custClearSearch").show();
			setTimeout( function() { $("#jsCustListTableDiv .jsgrid-filter-row td:eq(0) input").focus(); }, 100 );
		}

	} else if (id.includes("vend")) {
        var lOpen = jsVendListTable.grid.jsGrid("option", "filtering");
		if (lOpen) {
			jsVendListTable.grid.jsGrid("option", "filtering", false);
			$("#vendClearSearch").hide();
			$("#vendSearch").show();
			jsVendListTable.grid.jsGrid("clearFilter");
			jsVendListTable.grid.jsGrid("loadData");
            jsVendListTable.grid.jsGrid("sort", { field: "company", order: "asc" });
		} else {
			jsVendListTable.grid.jsGrid("option", "filtering", true);
			$("#vendSearch").hide();
			$("#vendClearSearch").show();
			setTimeout( function() { $("#jsVendListTableDiv .jsgrid-filter-row td:eq(1) input").focus(); }, 100 );
		}

    } else if (id.includes("empl")) {
        var lOpen = jsEmplListTable.grid.jsGrid("option", "filtering");
		if (lOpen) {
			jsEmplListTable.grid.jsGrid("option", "filtering", false);
			$("#emplClearSearch").hide();
			$("#emplSearch").show();
			jsEmplListTable.grid.jsGrid("clearFilter");
			jsEmplListTable.grid.jsGrid("loadData");
            jsEmplListTable.grid.jsGrid("sort", { field: "last_name", order: "asc" });
		} else {
			jsEmplListTable.grid.jsGrid("option", "filtering", true);
			$("#emplSearch").hide();
			$("#emplClearSearch").show();
			setTimeout( function() { $("#jsEmplListTableDiv .jsgrid-filter-row td:eq(1) input").focus(); }, 100 );
		}
    }
}

async function loadItemListData() {
	let d1 = new Date();
	let d2, nSecs;
	const url = 'getItemList?';

	try {
		const response = await fetch(url);

		// Check if the response was successful (status code 200-299)
    	if (!response.ok) {
      		throw new Error(`HTTP error getting itemList! status: ${response.status}`);
    	}

    	// Parse the response body as JSON
    	itemListData = await response.json();
		d2 = new Date();
		nSecs = (d2-d1)/1000;
		console.log( 'itemListData is loaded.',nSecs,'seconds');

  	} catch (error) {
    	console.error("Error fetching itemList:", error);
	}
}

async function loadCustListData() {
	let d1 = new Date();
	let d2, nSecs;
	const url = 'getCustListJS?';

	try {
		const response = await fetch(url);

		// Check if the response was successful (status code 200-299)
    	if (!response.ok) {
      		throw new Error(`HTTP error getting custList! status: ${response.status}`);
    	}

    	// Parse the response body as JSON
    	custListData = await response.json();
		d2 = new Date();
		nSecs = (d2-d1)/1000;
		console.log( 'custListData is loaded.',nSecs,'seconds');

  	} catch (error) {
    	console.error("Error fetching custList:", error);
	}
}

async function loadVendListData() {
	let d1 = new Date();
	let d2, nSecs;
	const url = 'getVendListPOS?';

	try {
		const response = await fetch(url);

		// Check if the response was successful (status code 200-299)
    	if (!response.ok) {
      		throw new Error(`HTTP error getting vendList! status: ${response.status}`);
    	}

    	// Parse the response body as JSON
    	vendListData = await response.json();
		d2 = new Date();
		nSecs = (d2-d1)/1000;
		console.log( 'vendListData is loaded.',nSecs,'seconds');

  	} catch (error) {
    	console.error("Error fetching vendList:", error);
	}
}

async function loadEmplListData() {
    let d1 = new Date();
    let d2, nSecs;
    const url = 'getEmployeeList?';

    try {
        const response = await fetch(url);

        // Check if the response was successful (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error getting emplList! status: ${response.status}`);
        }

        // Parse the response body as JSON
        emplListData = await response.json();
        d2 = new Date();
        nSecs = (d2-d1)/1000;
        console.log( 'emplListData is loaded.',nSecs,'seconds');

    } catch (error) {
        console.error("Error fetching emplList:", error);
    }
}

function popItem(args) {
    let index   = args.itemIndex;
    let obj     = args.item;
    let codeNum = obj.code_num.substring(0, 8);
    
    $.spin('true');

    if (Number.isNaN(Number(codeNum)) || Number(codeNum) === 0) return;  //misc sale items, etc

    console.log( "Starting popItem, index:", index,"codenum:", codeNum );

    let item = obj.brand.trim() +
        (obj.descrip.trim().length === 0 ? '' : ' ') +
        obj.descrip.trim() +
        (obj.size.trim().length === 0 ? '' : ' ') + obj.size.trim();

    console.log("in popItem, codeNum: |" + codeNum + "|, item:", item);

    console.log( "itemListData.data[index]:", itemListData.data[index]);

    $.post("popItem?",
        { codenum: codeNum, uid: uid },
        function (reply) {
            if (reply.result === 'fail') {
                vex.dialog.alert({
                    unsafeMessage: 'Error:<br><br>' + reply.msg, // unsafeMessage option allows html in text
                    className: 'vex-theme-wireframe' // Overwrites defaultOptions
                });
            } else {
                $("#popTabs").tabs({
                    active: 0,
                    activate: function (event, ui) {
                        let tab = ui.newPanel.selector;
                        if (tab.includes("popSalesHistory") || tab.includes("popPurchHistory")) {
                            $(".popEditButtonDiv").hide();
                            $(".popButtonDiv").hide();
                        } else if ($("#modalPopItem").attr("data-mode") === 'view') {
                            $(".popEditButtonDiv").show();
                        } else {
                            $(".popButtonDiv").show();
                        }
                    }
                });

                $("#popItemTitle").text('Details: ' + item);

                $.each(reply.cells, function (idx, val) {
                    $("#" + val[0]).html(val[1]);
                });
                $("#popNotes").val(reply.notes);

                $("#popBarcode").data("barcodes", reply.barcodes);

                $("#popVendor").data("vendnum", reply.vendnum);

                $(".popPopHide").hide();
                $(".popButtonDiv").hide();

                $("#Modal_popItem_close").html('&times;');
                $("#Modal_popItem_close").on("click", function () { closePopItem(); });
                $("#Modal_popItem_close").addClass('close');

                $("#popAvgCostLabel").text("Avg Cost:");

                $(".popEditButtonDiv").show();

                $("#itemSalesHistoryTab").show();
                $("#itemPurchHistoryTab").show();

                $("#modalPopItem").attr("data-mode", "view");
                $("#modalPopItem").data("codeNbr", codeNum);
                $("#modalPopItem").data("index", index);
                $("#modalPopItem").show();

                $( "#popTabs" ).tabs( "option", "active", 0 );

                let nWide = $("#popNotes").width();
                let nHigh = $("#popNotes").parent().parent().height() - 4;
                $("#popNotes").css({ "max-width": nWide, "max-height": nHigh });
            }
        })
        .fail(function (xhr, status, error) {
            vex.dialog.alert({
                unsafeMessage: 'Error:<br><br>' + error + '<br>' + xhr.responseText, // unsafeMessage option allows html in text
                className: 'vex-theme-wireframe' // Overwrites defaultOptions
            });
        });

        $.spin('false');
}

function closePopItem() {
    // clear retained item data
    $("#modalPopItem").data("codeNbr", "");
    $("#modalPopItem").data("index", "");
    $("#popBarcode").data("barcodes", []);
    $("#popVendor").data("vendnum", "");
    $("#popNotes").val("");
    $(".popDataCell").empty();

    // reset UI
    $("#popBarcBttnDiv").hide();
	$("#modalPopItem").hide();
	$("#modalPopItemContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
    $(".popDataCell").css("border", "1px solid #097764");
    $("#popNotes").prop("disabled", true);
}

function editPopItem() {
    jsItemListAdd('edit');
}

function jsItemListAdd(notNew) {
    let vals = [];
    let selects = [];

    $.spin('true');

    notNew = notNew !== null;

    if (notNew) {
        $("#popBarcBttnDiv").show();
    } else {
        $("#popBarcBttnDiv").hide();
    }

    $("#popItemTitle").text('New Item');

    $(".popDataCell").css("border", "none");

    $(".popDataCell").each(function (idx, el) {
        let id = $(el).prop('id');
        let inp = id + "Inp";

        if (notNew && !$(el).hasClass('popDataSelect')) {
            vals.push([inp, $(el).text()]);
        } else if (notNew && $(el).hasClass('popDataSelect')) {
            inp = id + "Select";
            selects.push([inp, $(el).text()]);
        }

        if (id === 'popNotes') {
            $(el).prop("disabled", false);
        } else if (id === 'popType') {
            let type = $("#popType").text();
            fillPopType(type);
        } else if (id === 'popUser1') {
            fillPopUserFields();
        } else if (id === 'popUser2') {
            null;
        } else if (id === 'popSize') {
            let size = $("#popSize").text();
            fillPopSize(size);
        } else if (id === 'popClass') {
            let cls = $("#popClass").text();
            fillPopClass(cls);
        } else if (id === 'popVendor') {
            fillPopVendor();
        } else if (id === 'popPool') {
            let pool = $("#popPool").text();
            fillPopPool(pool);
        } else if (id === 'popBarcode') {
            fillPopBarcode();
        } else if (id === 'popOrderLot') {
            $(el).html('<input type="radio" id="popOrdLotCase" name="popOrderLot" value="C" checked/>' +
                '<label for="popOrdLotCase">Case</label>' +
                '<input type="radio" id="popOrdLotUnit" name="popOrderLot" value="U"/>' +
                '<label for="popOrdLotUnit">Unit</label>');
        } else if (id === "popCasePr") {
            $(el).html("<input type='text' class='popPriceQty' id='" + id + "Qty" +
                "' disabled><span>&nbsp;@&nbsp;</span><input type='text' class='popPriceAmt' id='" + id + "Amt'>");
        } else if ($(el).hasClass('popQtyPrice')) {
            $(el).html("<input type='text' class='popPriceQty' id='" + id + "Qty" +
                "'><span>&nbsp;@&nbsp;</span><input type='text' class='popPriceAmt' id='" + id + "Amt'>");
        } else if ($(el).hasClass('popDataCheck')) {
            $(el).html("<input type='checkbox' class='itemAddCheck' id='" + inp +
                "' unchecked><span id='" + inp + "Char' class='itemCheckboxChar'>No</span>");
        } else if ($(el).hasClass('popData3State')) {
            $(el).html("<input type='checkbox' class='itemAdd3State' data-state='0' id='" + inp +
                "' unchecked><span id='" + inp + "Char' class='itemCheckboxChar'>No</span>");
        } else if ($(el).hasClass('popTableCell3')) {
            $(el).html("<input class='itemAddWide' id='" + inp + "'>");
        } else if ($(el).hasClass('popMarkUp')) {
            $(el).html("<input type='text' class='itemAddNarrow popMarkUpInp' id='" + inp + "'>");
        } else if ($(el).hasClass('popMargin')) {
            $(el).html("<input type='text' class='itemAddNarrow popMarginInp' id='" + inp + "'>");
        } else if ($(el).hasClass('popDataDate')) {
            $(el).html("<input type='date' class='itemAddDate' id='" + inp + "'>");
        } else {
            $(el).html("<input type='text' class='itemAddNarrow' id='" + inp + "'>");
        }

        //---- prepare for autoNumeric
        if ($(el).hasClass('popInt6')) {
            $(el).find('input').addClass('popAnInt6');
        } else if ($(el).hasClass('popInt4')) {
            $(el).find('input').addClass('popAnInt4');
        } else if ($(el).hasClass('popInt2')) {
            $(el).find('input').addClass('popAnInt2');
        } else if ($(el).hasClass('popInt8')) {
            $(el).find('input').addClass('popAnInt8');
        } else if ($(el).hasClass('popDeci2_10')) {
            $(el).find('input').addClass('popAnDeci2_10');
        } else if ($(el).hasClass('popDeci2_6')) {
            $(el).find('input').addClass('popAnDeci2_6');
        } else if ($(el).hasClass('popDeci3_7')) {
            $(el).find('input').addClass('popAnDeci3_7');
        } else if ($(el).hasClass('popDeci4_8')) {
            $(el).find('input').addClass('popAnDeci4_8');
        } else if ($(el).hasClass('popDeci4_12')) {
            $(el).find('input').addClass('popAnDeci4_12');
        }
    });

    //----- apply autoNumeric
    $('.popAnInt6').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '999999', minimumValue: '-999999', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnInt4').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '9999', minimumValue: '-9999', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnInt2').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '99', minimumValue: '-999999.99', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnInt8').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '99999999', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnDeci2_10').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '9999999.99', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnDeci2_6').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '999.99', minimumValue: '-999999.99', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnDeci3_7').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 3, emptyInputBehavior: 'zero', maximumValue: '999.999', minimumValue: '-999999.99', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnDeci4_8').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 4, emptyInputBehavior: 'zero', maximumValue: '999.9999', minimumValue: '-999999.99', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popAnDeci4_12').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 4, emptyInputBehavior: 'zero', maximumValue: '9999999.9999', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });

    $(".popPriceQty").each(function (idx, el) {
        let nn;
        if ($(el).prop("id") === 'popCasePrQty') {
            nn = new AutoNumeric(el, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '999999', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        } else {
            nn = new AutoNumeric(el, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '99', minimumValue: '-999999.99', roundingMethod: 'C' })
        }
        $(el).data("autonumeric", nn);
        nn.set("0");
    });

    $(".popPriceAmt").each(function (idx, el) {
        let nn;
        if ($(el).prop("id") === 'popPriceAmt') {
            nn = new AutoNumeric(el, { decimalPlaces: 4, emptyInputBehavior: 'zero', maximumValue: '9999999.9999', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        } else {
            nn = new AutoNumeric(el, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '9999999.99', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        }
        $(el).data("autonumeric", nn);
        nn.set("0");
    });

    $(".itemAdd3State").on('click', function () {
        let id = $(this).prop("id");
        let state = parseInt($(this).attr("data-state"));

        state = (state + 1) % 3; // Cycle through the three states
        $(this).attr("data-state", state);

        switch (state) {
            case 0: // Unchecked
                $(this).prop("checked", false);
                $(this).prop("indeterminate", false);
                $("#" + id + "Char").text("No");
                break;
            case 1: // Checked
                $(this).prop("checked", true);
                $(this).prop("indeterminate", false);
                $("#" + id + "Char").text("Yes");
                break;
            case 2: // Indeterminate
                $(this).prop("checked", false); // Indeterminate state is visually distinct, but the `checked` property should be false
                $(this).prop("indeterminate", true);
                $("#" + id + "Char").text("Alt");
                break;
        }

    });

    $(".itemAddCheck").on('click', function () {
        let id = $(this).prop("id");

        if ($(this).prop("checked")) {
            $("#" + id + "Char").text("Yes");
        } else {
            $("#" + id + "Char").text("No");
        }
    });

    $("#popCaseQInp").on("change", function () {
        let nn = $(this).data('autonumeric');
        let val = nn.getNumber();
        let nc = $("#popCasePrQty").data('autonumeric');
        nc.set(val);
    });
/*
    $(".popDataCell input").on("keyup", function () {
        let upper = $(this).val();
        $(this).val(upper.toUpperCase());
    });
*/
    $("#popAvgCostInp").on("change", function () {
        let nn = $(this).data('autonumeric');
        let val = nn.getNumber();
        let nc = $("#popCaseQInp").data('autonumeric');
        let casQ = nc.getNumber();
        let casP = val * casQ;

        $("#popLastCostInp").data('autonumeric').set(val);
        $("#popCaseCostInp").data('autonumeric').set(casP);
        $("#popLastCaseInp").data('autonumeric').set(casP);
    });

    $("#popPriceAmt").on("change", function () {
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        let pr = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let qty = $("#popPriceQty").data('autonumeric').getNumber();
        let marg, mkup;

        pr = pr === 0 ? 1 : pr;
        qty = qty === 0 ? 1 : qty;
        cost = cost === 0 ? 1 : cost;
        last = last === 0 ? 1 : cost;

        marg = ((pr - (qty * cost)) / pr) * 100;
        marg = Math.abs(marg) > 999.99 ? 0 : marg;
        $("#popUnitMargInp").data('autonumeric').set(marg);
        marg = ((pr - (qty * last)) / pr) * 100;
        marg = Math.abs(marg) > 999.99 ? 0 : marg;
        $("#popLastMargInp").data('autonumeric').set(marg);
        mkup = ((pr - (qty * cost)) / (qty * cost)) * 100;
        mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
        $("#popUnitMkUpInp").data('autonumeric').set(mkup);
        mkup = ((pr - (qty * last)) / (qty * last)) * 100;
        mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
        $("#popLastMkUpInp").data('autonumeric').set(mkup);
    });

    $("#popCasePrAmt").on("change", function () {
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        let pr = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let casQ = $("#popCaseQInp").data('autonumeric').getNumber();
        let marg, mkup;

        pr = pr === 0 ? 1 : pr;
        casQ = casQ === 0 ? 1 : casQ;
        cost = cost === 0 ? 1 : cost;
        last = last === 0 ? 1 : cost;

        marg = ((pr - (casQ * cost)) / pr) * 100;
        marg = Math.abs(marg) > 999.99 ? 0 : marg;
        $("#popCaseMargInp").data('autonumeric').set(marg);
        marg = ((pr - (casQ * last)) / pr) * 100;
        marg = Math.abs(marg) > 999.99 ? 0 : marg;
        $("#popLastCaseMargInp").data('autonumeric').set(marg);
        mkup = ((pr - (casQ * cost)) / (casQ * cost)) * 100;
        mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
        $("#popCaseMkUpInp").data('autonumeric').set(mkup);
        mkup = ((pr - (casQ * last)) / (casQ * last)) * 100;
        mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
        $("#popLastCaseMkUpInp").data('autonumeric').set(mkup);
    });

    $(".popMarginInp").on("change", function () {
        // pr   = qty * ( cost / ( 1 - ( marg / 100 ) ) )
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        let id = $(this).prop("id");
        let marg = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let qty = $("#popPriceQty").data('autonumeric').getNumber();
        let casQ = $("#popCaseQInp").data('autonumeric').getNumber();
        let pr, mkup;

        pr = pr === 0 ? 1 : pr;
        qty = qty === 0 ? 1 : qty;
        casQ = casQ === 0 ? 1 : casQ;
        cost = cost === 0 ? 1 : cost;
        last = last === 0 ? 1 : cost;
        if (id.includes("LastCase")) {
            pr = casQ * (last / (1 - (marg / 100)));
            $("#popCasePrAmt").data('autonumeric').set(pr);
            marg = ((pr - (casQ * cost)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popCaseMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (casQ * last)) / (casQ * last)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popLastCaseMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (casQ * cost)) / (casQ * cost)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popCaseMkUpInp").data('autonumeric').set(mkup);

        } else if (id.includes("Case")) {
            pr = casQ * (cost / (1 - (marg / 100)));
            $("#popCasePrAmt").data('autonumeric').set(pr);
            marg = ((pr - (casQ * last)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popLastCaseMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (casQ * cost)) / (casQ * cost)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popCaseMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (casQ * last)) / (casQ * last)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popLastCaseMkUpInp").data('autonumeric').set(mkup);

        } else if (id.includes("Last")) {
            pr = qty * (last / (1 - (marg / 100)));
            $("#popPriceAmt").data('autonumeric').set(pr);
            marg = ((pr - (qty * cost)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popUnitMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (qty * last)) / (qty * last)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popLastMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (qty * cost)) / (qty * cost)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popUnitMkUpInp").data('autonumeric').set(mkup);

        } else {
            pr = qty * (cost / (1 - (marg / 100)));
            $("#popPriceAmt").data('autonumeric').set(pr);
            marg = ((pr - (qty * last)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popLastMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (qty * cost)) / (qty * cost)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popUnitMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (qty * last)) / (qty * last)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popLastMkUpInp").data('autonumeric').set(mkup);
        }
    });

    $(".popMarkUpInp").on("change", function () {
        // pr = qty * cost * ( 1 + ( mkup / 100 ) )
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        let id = $(this).prop("id");
        let mkup = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let qty = $("#popPriceQty").data('autonumeric').getNumber();
        let casQ = $("#popCaseQInp").data('autonumeric').getNumber();
        let pr, marg;

        if (id.includes("LastCase")) {
            pr = casQ * last * (1 + (mkup / 100));
            $("#popCasePrAmt").data('autonumeric').set(pr);
            mkup = ((pr - (casQ * cost)) / (casQ * cost)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popCaseMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (casQ * last)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popLastCaseMargInp").data('autonumeric').set(marg);
            marg = ((pr - (casQ * cost)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popCaseMargInp").data('autonumeric').set(marg);

        } else if (id.includes("Case")) {
            pr = casQ * cost * (1 + (mkup / 100));
            $("#popCasePrAmt").data('autonumeric').set(pr);
            mkup = ((pr - (casQ * last)) / (casQ * last)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popLastCaseMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (casQ * cost)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popCaseMargInp").data('autonumeric').set(marg);
            marg = ((pr - (casQ * last)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popLastCaseMargInp").data('autonumeric').set(marg);

        } else if (id.includes("Last")) {
            pr = qty * last * (1 + (mkup / 100));
            $("#popPriceAmt").data('autonumeric').set(pr);
            mkup = ((pr - (qty * cost)) / (qty * cost)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popUnitMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (qty * last)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popLastMargInp").data('autonumeric').set(marg);
            marg = ((pr - (qty * cost)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popUnitMargInp").data('autonumeric').set(marg);

        } else {
            pr = qty * cost * (1 + (mkup / 100));
            $("#popPriceAmt").data('autonumeric').set(pr);
            mkup = ((pr - (qty * last)) / (qty * last)) * 100;
            mkup = Math.abs(mkup) > 999.99 ? 0 : mkup;
            $("#popLastMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (qty * cost)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popUnitMargInp").data('autonumeric').set(marg);
            marg = ((pr - (qty * last)) / pr) * 100;
            marg = Math.abs(marg) > 999.99 ? 0 : marg;
            $("#popLastMargInp").data('autonumeric').set(marg);
        }
    });

    $(".popDataCell input").prop("autocomplete", "off");

    let nn = $("#popPriceQty").data("autonumeric");
    nn.set(1);

    if (notNew) {
        $.each(vals, function (idx, arr) {
            let txt = '#' + arr[0];

            if ($(txt).hasClass("itemAdd3State")) {
                switch (arr[1]) {
                    case "N": // Unchecked
                        $(txt).prop("checked", false);
                        $(txt).prop("indeterminate", false);
                        $(txt).attr("data-state", 0);
                        $(txt + "Char").text("No");
                        break;
                    case "Y": // Checked
                        $(txt).prop("checked", true);
                        $(txt).prop("indeterminate", false);
                        $(txt).attr("data-state", 1);
                        $(txt + "Char").text("Yes");
                        break;
                    case "1": // Indeterminate
                        $(txt).prop("checked", false);
                        $(txt).prop("indeterminate", true);
                        $(txt).attr("data-state", 2);
                        $(txt + "Char").text("Alt");
                        break;
                }

            } else if ($(txt).hasClass("itemAddCheck")) {
                if (arr[1] === 'Y') {
                    $(txt).prop("checked", true);
                    $(txt + "Char").text("Yes");
                } else {
                    $(txt).prop("checked", false);
                    $(txt + "Char").text("No");
                }

            } else if (arr[0] === "popOrderLotInp") {
                if (arr[1].substring(0, 1) === 'C') {
                    $("#popOrdLotCase").prop("checked", true);
                    $("#popOrdLotUnit").prop("checked", false);
                } else {
                    $("#popOrdLotCase").prop("checked", false);
                    $("#popOrdLotUnit").prop("checked", true);
                }

            } else if (arr[0] === "popPriceInp") {
                let xx = arr[1].indexOf(" @ ");
                let qq = arr[1].substring(0, xx);
                let pp = arr[1].substring(xx + 3);
                $("#popPriceQty").data("autonumeric").set(qq);
                $("#popPriceAmt").data("autonumeric").set(pp);

            } else if (arr[0] === "popCasePrInp") {
                let xx = arr[1].indexOf(" @ ");
                let qq = arr[1].substring(0, xx);
                let pp = arr[1].substring(xx + 3);
                $("#popCasePrQty").data("autonumeric").set(qq);
                $("#popCasePrAmt").data("autonumeric").set(pp);

            } else if ($(txt).data("autonumeric") !== null && $(txt).data("autonumeric") !== undefined) {
                $(txt).data("autonumeric").set(arr[1]);

            } else {
                $(txt).val(arr[1]);
            }
        });
    }

    if (!notNew) {
        /*
        $("#itemSalesHistoryTab").hide();
        $("#itemPurchHistoryTab").hide();
        */
        $("#popTabs").tabs({
            active: 0,
            activate: function (event, ui) {
                let tab = ui.newPanel.selector;
                if (tab.includes("History")) {
                    $(".popEditButtonDiv").hide();
                    $(".popButtonDiv").hide();
                } else if ($("#modalPopCust").attr("data-mode") === 'view') {
                    $(".popEditButtonDiv").show();
                } else {
                    $(".popButtonDiv").show();
                }
            }
        });
    }
    $(".popDateLabel").hide();
    $(".popDataDate").hide();
    $(".popPopHide").show();
    $(".popEditButtonDiv").hide();
    $(".popButtonDiv").show();

    $("#Modal_popItem_close").html('&nbsp;');
    $("#Modal_popItem_close").on("click", null);
    $("#Modal_popItem_close").removeClass('close');

    $("#popAvgCostLabel").text("Unit Cost:");

    $("#popNotes").prop("disabled", false);

    $("#modalPopItem").attr("data-mode", "edit");
    $("#modalPopItem").show();

    if (notNew) {
        $("#popPriceAmt").trigger('change');
        $("#popCasePrAmt").trigger('change');
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveItem('edit'); });

        setTimeout(function () {
            $.each(selects, function (idx, arr) {
                let txt = '#' + arr[0] + " option";
                let els =$(txt).filter(function () {
                    return $(this).text().trim() === arr[1];
                })
                $(els[0]).prop("selected", true);
            });
            $.spin('false');
        }, 250);
    } else {
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveItem('new'); });
        $.spin('false');
    }

    setTimeout(function () { $('#popBarcodeInp').focus(); }, 25);
}

function fillPopBarcode() {
    let barcs = $("#popBarcode").data("barcodes");
    if (!barcs) {
        $("#popBarcode").html("<input id='popBarcodeInp' class='itemAddNarrow'>");
        return;
    }
    $("#popBarcode").html("<select id='popBarcodeSelect'></select>");
    $.each(barcs, function(idx, arr) {
        $("#popBarcodeSelect").append('<option value="' + arr[0] + '">' + arr[0] + '</option>');
    });

    if (barcs.length < 2) {
        $("#popBarcodeDeleteSpan").hide();
    } else {
        $("#popBarcodeDeleteSpan").show();
    }   
}

function fillPopSize(txt) {
    $("#popSize").html("<select id='popSizeSelect'></select>");
    $("#popSizeSelect").append('<option value="">&nbsp;</option>');
    
    $.post( "getSizes?", function(reply) {
        $.each(reply, function(idx,val) {
            $("#popSizeSelect").append('<option value="' + val + '">' + val + '</option>');
        });
            
        $("#popSizeSelect option").each(function () {
            if ($.trim($(this).text()) === txt.trim()) {
                $(this).prop('selected', true);
            }
        });
    });
}

function fillPopClass(txt) {
    $("#popClass").html("<select id='popClassSelect'></select>");
    
    $("#popClassSelect").append('<option value="S">STD</option>');
    $("#popClassSelect").append('<option value="K">KIT</option>');
    $("#popClassSelect").append('<option value="V">SVC</option>');
    $("#popClassSelect").append('<option value="W">WGT</option>');
            
    $("#popClassSelect option").each(function () {
        if ($.trim($(this).text()) === txt.trim()) {
            $(this).prop('selected', true);
        }
    });
}

function fillPopType(txt) {
    $("#popType").html("<select id='popTypeSelect'></select>");
    
    $.post( "getInvTypes?", function(reply) {
        $.each(reply, function(idx,aTyp) {
            $("#popTypeSelect").append('<option value="' + aTyp[1] + '">' + aTyp[0] + '</option>');
        });
            
        $("#popTypeSelect option").each(function () {
            if ($.trim($(this).text()) === txt.trim()) {
                $(this).prop('selected', true);
            }
        });
    });
}

function fillPopVendor() {
    let vendnum = $("#popVendor").data("vendnum");

    $("#popVendor").html("<select id='popVendorSelect'></select>");
    $("#popVendorSelect").append('<option value=" ">&nbsp;</option>');

    $.each(vendListData.data, function (idx, aVend) {
        $("#popVendorSelect").append('<option value="' + aVend.vendnum + '">' + aVend.company + '</option>');
    });

    $("#popVendorSelect").val(vendnum);

}

function fillPopPool(txt) {
    $("#popPool").html("<select id='popPoolSelect'></select>")
    $("#popPoolSelect").append('<option value="0">&nbsp;</option>');

    $.post("getDiscPools?", function (aPools) {
        $.each(aPools, function (idx, aRay) {
            $("#popPoolSelect").append('<option value="' + aRay[0] + '">' + aRay[1] + '</option>');
        });

        if (txt === 'N/A') {
            $("#popPoolSelect").val("0");
        } else {
            $("#popPoolSelect option").each(function () {
                console.log("popPoolSelect option text:", $(this).text(), "val:", $(this).val(), "match:", $.trim($(this).text()) === txt.trim());
                if ($.trim($(this).text()) === txt.trim()) {
                    $(this).prop('selected', true);
                }
            });
        }
    });
}

function fillPopUserFields() {
    $("#popUser1").html("<select id='popUser1Select'></select>");
    $("#popUser2").html("<select id='popUser2Select'></select>");
    $("#popUser1Select").append('<option value=" ">&nbsp;</option>');
    $("#popUser2Select").append('<option value=" ">&nbsp;</option>');

    $.post("getUserFields?", function (data) {
        if (data.aUser1.length === 0) {
            $("#popUser1Label").css("color", "gray");
            $("#popUser1Select").prop("disabled", true);
        } else {
            $.each(data.aUser1, function (idx, aRay) {
                $("#popUser1Select").append('<option value="' + aRay[0] + '">' + aRay[1] + '</option>');
            });

            $("#popUser1Label").css("color", "#1f6b93");
            $("#popUser1Label").text(data.cUser1 + ":");
        }

        if (data.aUser2.length === 0) {
            $("#popUser2Label").css("color", "gray");
            $("#popUser2Select").prop("disabled", true);
        } else {
            $.each(data.aUser2, function (idx, aRay) {
                $("#popUser2Select").append('<option value="' + aRay[0] + '">' + aRay[1] + '</option>');
            });

            $("#popUser2Label").css("color", "#1f6b93");
            $("#popUser2Label").text(data.cUser2 + ":");
        };
    });
}

function fillPopUser2() {
    $("#popUser2").html("<select id='popUser2Select'></select>");
}

function popSaveItem(mode) {
    let codeNbr = "";
    let index;
    let aData = [];
    let bran = $.trim($("#popBrandInp").val());

    if (bran === "") {
        vexAlert("Brand field can not be empty.", "popBrandInp");
        return;
    }

    if (mode === 'edit') {
        codeNbr = $("#modalPopItem").data("codeNbr");
        index   = $("#modalPopItem").data("index");
    }

    $(".popDataCell").children().each(function (idx, el) {
        let id = $(el).prop("id");
        let val = $(el).val();
        let tag = $(el).prop("tagName").toUpperCase();
        let nn = $(el).data("autonumeric");
        let val2 = "";
        let ns;
        const aV = ["N", "Y", "1"];

        if (nn !== undefined) {
            val = nn.getNumber();
        } else if ($(el).hasClass("itemAdd3State")) {
            ns = parseInt($(el).attr("data-state"));
            val = aV[ns];
        } else if ($(el).hasClass("itemAddCheck")) {
            val = $(el).prop("checked") ? "Y" : "N";
        } else if (tag === 'SELECT') {
            if (id === "popPoolSelect") {
                val = parseInt(val);
                console.log( "popPoolSelect value:", val );
            }
            val2 = $("#" + id + " option:selected").text();
            val2 = $.trim(val2);
        } else if (id.includes("MkUp") || id.includes("Marg")) {
            return true;
        } else if (id.includes("InpChar")) {
            return true;
        } else if (id === "popOrdLotCase") {
            val = $('input[name="popOrderLot"]:checked').val();
        } else if (id === "popOrdLotUnit") {
            return true;
        } else if (tag === 'LABEL' || tag === 'SPAN') {
            return true;
        }

        aData.push([id, val]);
        console.log('{ "' + id + '", ' + val + ', ' + typeof val + ' }, ;');

        if (tag === "SELECT") {
            aData.push([id + "Text", val2]);
            console.log('{ "' + id + "Text" + '", ' + val2 + ', ' + typeof val2 + ' }, ;');
        }
    });

    aData.push([ "popNotes", $("#popNotes").val() ]);

    if (mode === 'edit') {
        console.log("popSaveItem calling itemEdit?, index =",index);

        $.post("itemEdit?", { "from": "LIST", "user": uid, "codenum": codeNbr, "data": JSON.stringify(aData) }, function (reply) {
            let newObj;

            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            //---- update item in list data
            const editedItem = itemListData.data.find( item => item.code_num === codeNbr );

            editedItem.barcode = reply.barcode;
            editedItem.brand   = reply.brand;
            editedItem.descrip = reply.descrip;
            editedItem.size    = reply.size;
            editedItem.type    = reply.type;
            editedItem.price   = reply.price;

            //---- reload data and sort
            const sorting = jsItemListTable.grid.jsGrid("getSorting");
            jsItemListTable.grid.jsGrid("loadData");
            jsItemListTable.grid.jsGrid("sort", sorting);

            closePopItem();

        });

    } else {
        $.post("itemAdd?", { "from": "LIST", "user": uid, "data": JSON.stringify(aData) }, function (reply) {
            let newObj;

            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            newObj = {
                "barcode": reply.barcode,
                "brand": reply.brand,
                "descrip": reply.descrip,
                "size": reply.size,
                "type": reply.type,
                "price": reply.price,
                "code_num": reply.codenum
            };

            //---- add item to list data
            itemListData.data.push(newObj);
            itemListData.data.sort( function(a,b) {
                let itemA = (a.brand + ' ' + a.descrip + ' ' + a.size).toUpperCase();
                let itemB = (b.brand + ' ' + b.descrip + ' ' + b.size).toUpperCase();           
                if (itemA < itemB) {
                    return -1;
                }
                if (itemA > itemB) {
                    return 1;
                }
                return 0;
            });

            //------ find page for the new item
            const newIndex = itemListData.data.findIndex( item => item.code_num === newObj.code_num );
            const pageSize = $(".jsgrid-grid-body tr").length;
            const pageNumber = Math.floor(newIndex / pageSize) + 1;
            const sorting = jsItemListTable.grid.jsGrid("getSorting");

            //---- reload data and sort, then page to new item
            jsItemListTable.grid.jsGrid("loadData");
            jsItemListTable.grid.jsGrid("sort", sorting);
            jsItemListTable.grid.jsGrid("openPage", pageNumber);

            closePopItem();
        });
    }

}

function popBarcodeDelete() {
    let barc = $("#popBarcodeSelect").val();

    if (barc === undefined) {
        vexAlert("No barcode selected to delete.");
        return;
    }
    vex.dialog.confirm({
        message: "Are you sure you want to delete barcode: " + barc + " ?", 
        callback: function(confirmed) {
            if (confirmed) {
                $.post("itemBarcodeDelete?", { "user": uid, "codenum": $("#modalPopItem").data("codeNbr"), "barcode": barc }, function(reply) {
                    if (reply.result !== 'success') {
                        vexAlert(reply.msg);
                        return;
                    } else {
                        $("#popBarcodeSelect option[value='" + barc + "']").remove();
                        if ($("#popBarcodeSelect option").length < 2) {
                            $("#popBarcodeDeleteSpan").hide();
                        }
                        vexAlert("Barcode: " + barc + " deleted.");
                    }
                });
            }
        }
    });
}

function popBarcodeForm( mode ) {
    let title = (mode === 'add') ? "Add Barcode" : "Edit Barcode";
    let barc = (mode === 'add') ? "" : $("#popBarcodeSelect").val();
    let barcArr = $("#popBarcode").data("barcodes");
    let qty = (mode === 'add') ? "0" : barcArr.find( arr => arr[0] === barc )[1];
    let price = (mode === 'add') ? "0.00" : barcArr.find( arr => arr[0] === barc )[2];

	vex.dialog.confirm({
		unsafeMessage: '<h3 id="popBarcodeFormTitle" style="margin: 10px 0px;">' + title + '</h3>',
	    input: [
		    '<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="popBarcodeFormBarc" class="f7Label">Barcode:</label>',
					'<input class="vexF7Input" id="popBarcodeFormBarc" name="popBarcodeFormBarc" type="text" value="' + barc + '" maxlength="14"/>',
			    '</div>',
			'</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="popBarcodeFormQty" class="f7Label">Qty:</label>',
					'<input class="vexF7Input" id="popBarcodeFormQty" name="popBarcodeFormQty" type="text" />',
                    '<span class="f7Hint">Leave "0" for std qty</span>',
			    '</div>',
		    '</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="popBarcodeFormPrice" class="f7Label">Price:</label>',
				    '<input class="vexF7Input" id="popBarcodeFormPrice" name="popBarcodeFormPrice" type="text" />',
                    '<span class="f7Hint">Leave "0.00" for std price</span>',
			    '</div>',
		    '</div>'
	    ].join(''),
	    className: 'vex-theme-multiButtons',
	    afterOpen: function () {
			let anQty = new AutoNumeric('#popBarcodeFormQty', { decimalPlaces: 0 });
			let anPrice = new AutoNumeric('#popBarcodeFormPrice', { decimalPlaces: 2 });
            let oldBarc = $('#popBarcodeFormBarc').val().trim();

            anQty.set(qty);
            anPrice.set(price);
			$('#popBarcodeFormBarc').data("oldVal", oldBarc);

		},
		beforeClose: function(data) {
			let barc = $('#popBarcodeFormBarc').val().trim();
            if (!data) {
                return true;
            } else if (barc === "") {
                playBuzzer();
                vexAlert("Barcode can not be empty.", "popBarcodeFormBarc");
                return false;
            } else {
                return true;
            }
		},
		callback: function (data) {
			let an1 = AutoNumeric.getAutoNumericElement( document.querySelector('#popBarcodeFormPrice') );
			let an2 = AutoNumeric.getAutoNumericElement( document.querySelector('#popBarcodeFormQty') );
            let title = $("#popBarcodeFormTitle").text();
			let barc = $('#popBarcodeFormBarc').val().trim().toUpperCase();
            let oldBarc = $('#popBarcodeFormBarc').data("oldVal");

            price = an1.getNumber();
			qty = an2.getNumber();
			an1.remove();
			an2.remove();

            //---- if cancel was clicked, data will be false, if the form validation failed
            if (!data) {
				return;
			}

            if (title.includes("Add")) {
                console.log("Adding barcode: " + barc + ", qty: " + qty + ", price: " + price);
                $.post("itemBarcodeAdd?", { "user": uid, 
                                            "codenum": $("#modalPopItem").data("codeNbr"), 
                                            "barcode": barc, 
                                            "qty": qty, 
                                            "price": price 
                                          }, 
                    function(reply) {
                    if (reply.result !== 'success') {
                        vexAlert(reply.msg);
                        return;
                    } else {
                        $("#popBarcodeSelect").append('<option value="' + barc + '">' + barc + '</option>');
                        $("#popBarcodeSelect").val(barc);
                        $("#popBarcode").data("barcodes").push([barc, qty, price]);
                        $("#popBarcodeDeleteSpan").show();
                        vexAlert("Barcode: " + barc + " added.");
                    }
                });
            } else {
                console.log("Editing barcode: " + barc + ", qty: " + qty + ", price: " + price);
                $.post("itemBarcodeEdit?", { "user": uid, 
                                             "codenum": $("#modalPopItem").data("codeNbr"), 
                                             "new_barcode": barc, 
                                             "old_barcode": oldBarc,
                                             "qty": qty, 
                                             "price": price }, 
                    function(reply) {
                    if (reply.result !== 'success') {
                        vexAlert(reply.msg);
                        return;
                    } else {
                        let barcArr = $("#popBarcode").data("barcodes");
                        let barcObj = barcArr.find( arr => arr[0] === oldBarc );
                        barcObj[0] = barc;
                        barcObj[1] = qty;
                        barcObj[2] = price;
                        vexAlert("Barcode: " + barc + " updated.");
                    }
                });
		    }
        }
    });
}

function showSizeList() {
    $.post("getSizeList?", function (reply) {
        $("#smallListTitle").text("Item Sizes List");
        $("#smallListTableHdr").html("<tr class='smallListTableHdrBottomRow'><th>Size</th><th>Ounces</th><th>ML</th><th>Units/Case</th></tr>");

        $.each(reply, function (idx, arr) {
            let tr = idx === 0 ? "tr class='smallListTableSelected'" : "tr";

            $('#smallListTableBody').append('<' + tr + '><td>' + arr[0] + '</td><td>' + arr[1] +
                '</td><td>' + arr[2] + '</td><td>' + arr[3] +
                '</td></tr>');
        });

        $('#smallListTable').off('click');

        $('#smallListTable').on('click', function (event) {
            const clickedRow = event.target.closest('tr');

            // Ensure a row was actually clicked and it's not the table header
            if (clickedRow && clickedRow.parentNode.tagName === 'TBODY') {
                $("#smallListTable tr").removeClass('smallListTableSelected');

                // Add the 'selected' class to the newly clicked row
                $(clickedRow).addClass('smallListTableSelected');

                const firstCellText = $(clickedRow).find('td:first-child').text();
                console.log('Selected row data (first cell):', firstCellText);
            }
        });

        $("#smallListAddBtn").off('click');
        $("#smallListEditBtn").off('click');
        $("#smallListDeleteBtn").off('click');

        $("#smallListAddBtn").on('click', function(e) {
            e.stopPropagation();
            sizeAddEdit('add');
        });
        $("#smallListEditBtn").on('click', function(e) {
            e.stopPropagation();
            sizeAddEdit('edit');
        });
        $("#smallListDeleteBtn").on('click', function(e) {
            e.stopPropagation();
            console.log("Delete clicked");
            sizeDelete();
        });

        $("#modalSmallList").show();
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        swal("Oops...", "Error getting sizes: " + thrownError, "error");
        $("#modalSmallList").hide();
    });
}

function closeSmallList() {
    $("#modalSmallList").hide();
    $("#smallListTableHdr").empty();
    $("#smallListTableBody").empty();
    $(".modalSmallListBody").css("width", "800px");  // types list sets to a larger width
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function sizeAddEdit(mode) {
    let size  = "";
    let oz    = "";
    let ml    = "";
    let qcs   = "";
    let title = "";
    
    if (mode==='edit') {
        size  = $(".smallListTableSelected td:nth-child(1)").text();
        oz    = $(".smallListTableSelected td:nth-child(2)").text();
        ml    = $(".smallListTableSelected td:nth-child(3)").text();
        qcs   = $(".smallListTableSelected td:nth-child(4)").text();
        title = 'Edit Size: ' + size;
    } else {
        title = "Add New Size";
    }

    let markup = "" +
        "<label for='listSize' class='smallListDialogLabel'>Size:</label>" +
        "<input type='text' class='smallListDialogInput' id='listSize' name='listSize' maxlength='5'/>" +
        "<br><br>" +
        "<label for='listOZ' class='smallListDialogLabel'>Ounces:</label>" +
        "<input type='text' class='smallListDialogInput' id='listOZ' name='listOZ' maxlength='8'/>" +
        "<br><br>" +
        "<label for='listML' class='smallListDialogLabel'>Milliliters:</label>" +
        "<input type='text' class='smallListDialogInput' id='listML' name='listML' maxlength='8'/>" +
        "<br><br>" +
        "<label for='listQCS' class='smallListDialogLabel'>Units/Case:</label>" +
        "<input type='text' class='smallListDialogInput' id='listQCS' name='listQCS' maxlength='6'/>"

    $("#smallListDialogBody").html( markup );

    if (mode === 'edit') {
        $("#listSize").val(size);
        $("#listOZ").val(oz);
        $("#listML").val(ml);
        $("#listQCS").val(qcs);

        $("#listSize").prop( 'disabled', true );
    }

    $(".smallListDialogInput").on("keyup", function() {
        let upper = $(this).val();
        $(this).val( upper.toUpperCase() );
    });

    $(".smallListDialogInput").attr("autocomplete", "off");
    
    $(".smallListDialogInput").focus(function(){
        $(this).select();
    });

    if (!AutoNumeric.isManagedByAutoNumeric('#listOZ')) {
        new AutoNumeric('#listOZ', { decimalPlaces: 3, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false,unformatOnSubmit: true });
        new AutoNumeric('#listML', { decimalPlaces: 2, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false, unformatOnSubmit: true });
        new AutoNumeric('#listQCS', { decimalPlaces: 0, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false, unformatOnSubmit: true });
    }

    const ozInp = AutoNumeric.getAutoNumericElement('#listOZ');
    mode==='edit' ? ozInp.set(Number(oz)) : ozInp.set(0);
    const mlInp = AutoNumeric.getAutoNumericElement('#listML');
    mode==='edit' ? mlInp.set(Number(ml)) : mlInp.set(0);
    const qcsInp = AutoNumeric.getAutoNumericElement('#listQCS');
    mode==='edit' ? qcsInp.set(Number(qcs)) : qcsInp.set(0);

    let smallListBox = $("#smallListDialog").dialog({
            autoOpen: false,
            height: 400,
            width: 400,
            position: { my: "center", at: "center", of: $('#modalSmallListBody') },
            modal: true,
            close: function() {
                ozInp.remove();
                mlInp.remove();
                qcsInp.remove();
                $("#smallListDialog").dialog("destroy");
            },
            buttons: [
                {
                    id: "smallListSubmit",
                    text: "Save",
                    click: function (event) {
                        let xSize = $("#listSize").val();
                        let xOz   = ozInp.getNumber();
                        let xMl   = mlInp.getNumber();
                        let xQcs  = qcsInp.getNumber();
                        let obj   = {"size": xSize, "oz": xOz, "ml": xMl, "qcs": xQcs};

                        if (mode==='edit') {
                            $.post("editSize?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    $(".smallListTableSelected td:nth-child(2)").text(xOz);
                                    $(".smallListTableSelected td:nth-child(3)").text(xMl);
                                    $(".smallListTableSelected td:nth-child(4)").text(xQcs);

                                }
                            });
                        } else {
                            // need to check if the size exists before the post
                            $.post("addNewSize?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    let idx = Number(reply.idx) - 1;
                                    let row = $("#smallListTableBody tr:nth-child(" + idx + ")");
                                    
                                    $(".smallListTableSelected").removeClass("smallListTableSelected");

                                    $(row).after('<tr class="smallListTableSelected"><td>' + xSize + '</td><td>' + xOz +
                                                 '</td><td>' + xMl + '</td><td>' + xQcs + '</td></tr>');

                                    let $targetRow = $('.smallListTableSelected').first();
                                    let $scrollContainer = $('#smallListTableDiv');
                                    let scrollToPosition = $targetRow.offset().top - $scrollContainer.offset().top + $scrollContainer.scrollTop();
                                    $scrollContainer.animate({
                                        scrollTop: scrollToPosition
                                    }, 800);
                                }
                            });
                        }

                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                },
                {
                    id: "smallListCancel",
                    text: "Cancel",
                    click: function () {
                        $("#smallListDialogBody").empty();
                        /*
                        let caseInp = AutoNumeric.getAutoNumericElement('#DOHOrderCases');
                        let unitInp = AutoNumeric.getAutoNumericElement('#DOHOrderUnits');
                        caseInp.remove();
                        unitInp.remove();
                        */

                        /*
                        // if in DOHOrder array, keep it selected if in there:
                        let DOHOrder = JSON.parse(localStorage.getItem('DOHOrder')) || [];
                        let index = DOHOrder.findIndex(x => x.codenum === code);
                        if ( index > -1) {
                            DOHOrder.splice(index, 1);
                            localStorage.setItem('DOHOrder',JSON.stringify(DOHOrder));
                        }
                        */
                        $(this).dialog("close");
                        // $(this).dialog("destroy");
                        // DOHOrderQtyDialog = null;
                    }
                }]
        });

    $(".ui-dialog-title").text(title);

    smallListBox.dialog("open");

}

function sizeDelete() {
    let size = $(".smallListTableSelected td:nth-child(1)").text();

    $("<div id='smallListMsg'><p>Are you sure you want to delet the size: " + size + "?</p></div>").dialog({
        modal: true,
        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
        close: function () {
            $("#smallListMsg").dialog("destroy");
        },
        buttons: [
            {
                id: "sizeDeleteYes",
                text: "Yes",
                click: function () {
                    $.post("deleteSize?", { "size": size }, function (reply) {
                        $(this).prop("disabled",true);

                        if (reply.result !== "success") {
                            playBeep();
                            $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                modal: true,
                                position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                close: function () {
                                    $("#smallListMsg").dialog("destroy");
                                }
                            });
                        } else {
                            let idx = $(".smallListTableSelected").index();
                            console.log("1. idx for highlight:",idx);

                            idx = Math.max(idx, 1);
                            console.log("2. idx for highlight:",idx);

                            $(".smallListTableSelected").remove();

                            let row = $("#smallListTableBody tr:nth-child(" + idx + ")");
                            $(row).addClass("smallListTableSelected");

                            $("#smallListMsg").dialog("destroy");
                        }
                    });
                }
            },
            {
                id: "sizeDeleteNo",
                text: "No",
                click: function () {
                    $("#smallListMsg").dialog("destroy");
                }
            }
        ]
    });
}

function showDeptList() {
    $.post("getInvDepts?", function (reply) {
        $("#smallListTitle").text("Inventory Departments");
        $("#smallListTableHdr").html("<tr class='smallListTableHdrBottomRow'><th class='smallListHdrCellCenter'>Nbr</th><th>Department</th><th class='smallListHdrCellCenter'>Tax Rate</th>" +
                                     "<th class='smallListHdrCellCenter'>Age Verify</th></tr>");

        reply.sort( function(a,b) {
            return Number(a[1]) - Number(b[1]);
        });

        $.each(reply, function (idx, arr) {
            let tr = idx === 0 ? "tr class='smallListTableSelected'" : "tr";

            $('#smallListTableBody').append('<' + tr + '><td class="smallListDataCellRight">' + arr[1] + '</td><td>' + arr[0] +
                '</td><td class="smallListDataCellRight">' + arr[2] + '</td><td class="smallListDataCellCenter">' + ((arr[3]) ? 'Yes' : 'No') +
                '</td></tr>');
        });

        $('#smallListTable').off('click');

        $('#smallListTable').on('click', function (event) {
            const clickedRow = event.target.closest('tr');

            // Ensure a row was actually clicked and it's not the table header
            if (clickedRow && clickedRow.parentNode.tagName === 'TBODY') {
                $("#smallListTable tr").removeClass('smallListTableSelected');

                // Add the 'selected' class to the newly clicked row
                $(clickedRow).addClass('smallListTableSelected');

                const firstCellText = $(clickedRow).find('td:first-child').text();
                console.log('Selected row data (first cell):', firstCellText);
            }
        });

        $("#smallListAddBtn").off('click');
        $("#smallListEditBtn").off('click');
        $("#smallListDeleteBtn").off('click');

        $("#smallListAddBtn").on('click', function(e) {
            e.stopPropagation();
            deptAddEdit('add');
        });
        $("#smallListEditBtn").on('click', function(e) {
            e.stopPropagation();
            deptAddEdit('edit');
        });
        $("#smallListDeleteBtn").on('click', function(e) {
            e.stopPropagation();
            console.log("Delete clicked");
            deptDelete();
        });


        $("#modalSmallList").show();
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        swal("Oops...", "Error getting depts: " + thrownError, "error");
        $("#modalSmallList").hide();
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    });
}

function deptAddEdit(mode) {
    let deptNum  = "";
    let dept     = "";
    let tax      = "";
    let age      = "";
    let title    = "";
    
    if (mode==='edit') {
        deptNum  = $(".smallListTableSelected td:nth-child(1)").text();
        dept     = $(".smallListTableSelected td:nth-child(2)").text();
        tax      = $(".smallListTableSelected td:nth-child(3)").text();
        age      = $(".smallListTableSelected td:nth-child(4)").text();
        title    = 'Edit Dept: ' + dept;
        if (Number(deptNum)===0 && dept.trim()!=="Unassigned") {
            $("<div id='smallListMsg'><p>Dept Nbr 0's name may not be edited.</p></div>").dialog({
                modal: true,
                position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                close: function() {
                    $("#smallListMsg").dialog("destroy");
                }
            });
            return;
        }
    } else {
        title = "Add New Department";
    }

    let markup = "" +
        "<label for='listDeptNum' class='smallListDialogLabel'>Dept Nbr:</label>" +
        "<input type='text' class='smallListDialogInput' id='listDeptNum' name='listDeptNum' maxlength='2'/>" +
        "<br><br>" +
        "<label for='listDept' class='smallListDialogLabel'>Dept Name:</label>" +
        "<input type='text' class='smallListDialogInput' id='listDept' name='listDept' maxlength='15'/>" +
        "<br><br>" +
        "<label for='listTax' class='smallListDialogLabel'>Tax Rate:</label>" +
        "<input type='text' class='smallListDialogInput' id='listTax' name='listTax' maxlength='11'/>" +
        "<br><br>" +
        "<label for='listAge' class='smallListDialogLabel'>Age Verify:</label>" +
        "<select class='smallListDialogSelect' id='listAge' name='listAge'>" +
        "<option value='Yes'>Yes</option>" +
        "<option value='No'>No</option>" +
        "</select>"

    $("#smallListDialogBody").html( markup );

    $("#smallListDialog").attr('title', title);

    if (mode === 'edit') {
        $("#listDeptNum").val(deptNum);
        $("#listDept").val(dept);
        $("#listTax").val(tax);
        $("#listAge").val(age);

        $("#listDeptNum").prop( 'disabled', true );
    } else {
        $("label[for='listDeptNum']").hide();
        $("#listDeptNum").hide();
    }

    $(".smallListDialogInput").attr("autocomplete", "off");
    
    $(".smallListDialogInput").focus(function(){
        $(this).select();
    });

    if (!AutoNumeric.isManagedByAutoNumeric('#listTax')) {
        new AutoNumeric('#listTax', { decimalPlaces: 9, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false,unformatOnSubmit: true });
    }

    const taxInp = AutoNumeric.getAutoNumericElement('#listTax');
    mode==='edit' ? taxInp.set(Number(tax)) : taxInp.set(0);

    let smallListBox = $("#smallListDialog").dialog({
            autoOpen: false,
            height: 400,
            width: 400,
            position: { my: "center", at: "center", of: $('#modalSmallListBody') },
            modal: true,
            close: function() {
                taxInp.remove();
                $("#smallListDialog").dialog("destroy");
            },
            buttons: [
                {
                    id: "smallListSubmit",
                    text: "Save",
                    click: function (event) {
                        let xDeptNum = $("#listDeptNum").val();
                        let xDept    = $("#listDept").val();
                        let xTax     = taxInp.getNumber().toFixed(9);
                        let xAge     = $("#listAge").val();
                        let obj      = {"deptNum": xDeptNum, "dept": xDept, "tax": xTax, "age": xAge};

                        if (mode==='edit') {
                            $.post("editDept?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    $(".smallListTableSelected td:nth-child(2)").text(xDept);
                                    $(".smallListTableSelected td:nth-child(3)").text(xTax);
                                    $(".smallListTableSelected td:nth-child(4)").text(xAge);

                                }
                            });
                        } else {
                            // need to check if the dept exists before the post
                            $.post("addNewDept?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    xDeptNum = Number(reply.deptNum);
                                    
                                    $(".smallListTableSelected").removeClass("smallListTableSelected");

                                    $("#smallListTableBody tr").last().after('<tr class="smallListTableSelected"><td class="smallListDataCellRight">' + xDeptNum + 
                                                                               '</td><td>' + xDept + '</td><td class="smallListDataCellRight">' + xTax +
                                                                               '</td><td class="smallListDataCellCenter">' + xAge + '</td></tr>');

                                    let $targetRow = $('.smallListTableSelected').first();
                                    let $scrollContainer = $('#smallListTableDiv');
                                    let scrollToPosition = $targetRow.offset().top - $scrollContainer.offset().top + $scrollContainer.scrollTop();
                                    $scrollContainer.animate({
                                        scrollTop: scrollToPosition
                                    }, 800);
                                }
                            });
                        }

                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                },
                {
                    id: "smallListCancel",
                    text: "Cancel",
                    click: function () {
                        $("#smallListDialogBody").empty();
                        /*
                        let caseInp = AutoNumeric.getAutoNumericElement('#DOHOrderCases');
                        let unitInp = AutoNumeric.getAutoNumericElement('#DOHOrderUnits');
                        caseInp.remove();
                        unitInp.remove();
                        */

                        /*
                        // if in DOHOrder array, keep it selected if in there:
                        let DOHOrder = JSON.parse(localStorage.getItem('DOHOrder')) || [];
                        let index = DOHOrder.findIndex(x => x.codenum === code);
                        if ( index > -1) {
                            DOHOrder.splice(index, 1);
                            localStorage.setItem('DOHOrder',JSON.stringify(DOHOrder));
                        }
                        */
                        $(this).dialog("close");
                        // $(this).dialog("destroy");
                        // DOHOrderQtyDialog = null;
                    }
                }]
        });

    $(".ui-dialog-title").text(title);

    smallListBox.dialog("open");

}

function deptDelete() {
    let deptNum = $(".smallListTableSelected td:nth-child(1)").text();
    let dept    = $(".smallListTableSelected td:nth-child(2)").text();

    if (Number(deptNum) < 10) {
        playBeep();
        $("<div id='smallListMsg'><p>Department numbers 0-9 may not de deleted.</p></div>").dialog({
            modal: true,
            position: { my: "center", at: "center", of: $("#modalSmallListBody") },
            close: function () {
                $("#smallListMsg").dialog("destroy");
            }
        });
        return;
    }

    $("<div id='smallListMsg'><p>Are you sure you want to delete the department: " + dept + "?</p></div>").dialog({
        modal: true,
        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
        close: function () {
            $("#smallListMsg").dialog("destroy");
        },
        buttons: [
            {
                id: "deptDeleteYes",
                text: "Yes",
                click: function () {
                    $.post("deleteDept?", { "deptNum": deptNum }, function (reply) {
                        $(this).prop("disabled",true);

                        if (reply.result !== "success") {
                            playBeep();
                            $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                modal: true,
                                position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                close: function () {
                                    $("#smallListMsg").dialog("destroy");
                                }
                            });
                        } else {
                            let idx = $(".smallListTableSelected").index();
                            console.log("1. idx for highlight:",idx);

                            idx = Math.max(idx, 1);
                            console.log("2. idx for highlight:",idx);

                            $(".smallListTableSelected").remove();

                            let row = $("#smallListTableBody tr:nth-child(" + idx + ")");
                            $(row).addClass("smallListTableSelected");

                            $("#smallListMsg").dialog("destroy");
                        }
                    });
                }
            },
            {
                id: "deptDeleteNo",
                text: "No",
                click: function () {
                    $("#smallListMsg").dialog("destroy");
                }
            }
        ]
    });
}

function showDiscPoolList() {
    $.post("getDiscPools?", function (reply) {
        $("#smallListTitle").text("Discount Pools");
        $("#smallListTableHdr").html("<tr class='smallListTableHdrTopRow'>" +
                                        "<th class='smallListHdrCellCenter'></th><th class='smallListHdrCellLeft'></th>" +
                                        "<th class='smallListHdrCellCenter'>Discount</th><th>Trigger</th><th>Trigger Amt</th><th>Unit of</th><th>Price or</th>" +
                                     "</tr>" +
                                     "<tr class='smallListTableHdrBottomRow'>" +
                                        "<th>Nbr</th><th>Name</th><th>Mode</th><th>Type</th>" +
                                        "<th>(Units/Vol)</th><th>Measure</th><th>Percent</th>" +
                                     "</tr>");

        $.each(reply, function (idx, arr) {
            let tr = idx === 0 ? "tr class='smallListTableSelected'" : "tr";

            $('#smallListTableBody').append('<' + tr + '><td class="smallListDataCellRight">' + arr[0] + '</td><td>' + arr[1] +
                '</td><td class="smallListDataCellCenter">' + ((arr[2]==='$') ? 'Price' : 'Percent') + '</td><td class="smallListDataCellCenter">' + ((arr[3]==='V') ? 'Volume' : 'Units') +
                '</td><td class="smallListDataCellCenter">' + arr[4] + '</td>' +
                '<td class="smallListDataCellCenter">' + ((arr[3]==='U') ? 'Units' : (arr[5]==='G') ? 'Gallons' : 'Liters') + '</td>' +
                '<td class="smallListDataCellRight">' + arr[6] + '</td></tr>');
        });

        $('#smallListTable').off('click');

        $('#smallListTable').on('click', function (event) {
            const clickedRow = event.target.closest('tr');

            // Ensure a row was actually clicked and it's not the table header
            if (clickedRow && clickedRow.parentNode.tagName === 'TBODY') {
                $("#smallListTable tr").removeClass('smallListTableSelected');

                // Add the 'selected' class to the newly clicked row
                $(clickedRow).addClass('smallListTableSelected');

                const firstCellText = $(clickedRow).find('td:first-child').text();
                console.log('Selected row data (first cell):', firstCellText);
            }
        });

        $("#smallListAddBtn").off('click');
        $("#smallListEditBtn").off('click');
        $("#smallListDeleteBtn").off('click');

        $("#smallListAddBtn").on('click', function(e) {
            e.stopPropagation();
            discPoolAddEdit('add');
        });
        $("#smallListEditBtn").on('click', function(e) {
            e.stopPropagation();
            discPoolAddEdit('edit');
        });
        $("#smallListDeleteBtn").on('click', function(e) {
            e.stopPropagation();
            console.log("Delete clicked");
            discPoolDelete();
        });


        $("#modalSmallList").show();
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        swal("Oops...", "Error getting discpools: " + thrownError, "error");
        $("#modalSmallList").hide();
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    });
}

function discPoolAddEdit(mode) {
    let id       = "";
    let discPool = "";
    let porp     = "";
    let type     = "";
    let amt      = "";
    let um       = "";
    let disc     = "";
    let title    = "";
    
    if (mode==='edit') {
        id       = $(".smallListTableSelected td:nth-child(1)").text();
        discPool = $(".smallListTableSelected td:nth-child(2)").text();
        porp     = ($(".smallListTableSelected td:nth-child(3)").text()==='Price' ? '$' : '%');
        type     = ($(".smallListTableSelected td:nth-child(4)").text()==='Units' ? 'U' : 'V');
        amt      = $(".smallListTableSelected td:nth-child(5)").text();
        um       = $(".smallListTableSelected td:nth-child(4)").text()==='Units' ? 'U' : ($(".smallListTableSelected td:nth-child(6)").text()==='Gallons' ? 'G' : 'L');
        disc     = $(".smallListTableSelected td:nth-child(7)").text();
        title    = 'Edit Discount Pool';
    } else {
        title = "Add New Discount Pool";
    }

    let markup = "" +
        "<label for='listid' class='smallListDialogLabel'>Pool Nbr:</label>" +
        "<input type='text' class='smallListDialogInput' id='listid' name='listid' maxlength='7'/>" +
        "<br><br>" +
        "<label for='listName' class='smallListDialogLabel'>Pool Name:</label>" +
        "<input type='text' class='smallListDialogInput' name='listName' id='listName' maxlength='15' style='width: 215px;'/>" +
        "<br><br>" +
        "<label for='listMode' class='smallListDialogLabel'>Discount Mode:</label>" +
        "<select class='smallListDialogSelect' id='listMode' name='listMode'>" +
        "<option value='$'>Price</option>" +
        "<option value='%'>Percent</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listTrigger' class='smallListDialogLabel'>Trigger Type:</label>" +
        "<select class='smallListDialogSelect' id='listTrigger' name='listTrigger'>" +
        "<option value='U'>Units</option>" +
        "<option value='V'>Volume</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listAmt' class='smallListDialogLabel'>Trigger Amt:</label>" +
        "<input type='text' class='smallListDialogInput' id='listAmt' name='listAmt' maxlength='6'/>" +
        "<br><br>" +
        "<label for='listMeasure' class='smallListDialogLabel'>Measure:</label>" +
        "<select class='smallListDialogSelect' id='listMeasure' name='listMeasure'>" +
        "<option value='U'>Units</option>" +
        "<option value='G'>Gallons</option>" +
        "<option value='L'>Liters</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listDisc' class='smallListDialogLabel'>Discount Price:</label>" +
        "<input type='text' class='smallListDialogInput' id='listDisc' name='listDisc' maxlength='6'/>"


    $("#smallListDialogBody").html( markup );

    $("#smallListDialog").attr('title', title);

    if (mode === 'edit') {
        $("#listid").val(id);
        $("#listName").val(discPool);
        $("#listMode").val(porp);
        $("#listTrigger").val(type);
        //$("#listAmt").val(amt);
        $("#listMeasure").val(um);
        $//("#listDisc").val(disc);

        $("#listid").prop( 'disabled', true );
    } else {
        $("label[for='listid']").hide();
        $("#listid").hide();
    }

    $("#listMode").on("change", function() {
        if ($(this).val()==='$') {
            $("label[for='listDisc").text('Discount Price:');
        } else {
            $("label[for='listDisc").text('Discount %:');
        }
    });

    $("#listTrigger").on("change", function() {
        let xUm = $(this).val();
        if (xUm==='U') {
            $("#listMeasure").val('U');
        } else if ($("#listMeasure").val()==='U') {
            $("#listMeasure").val('G');
        }
    });

    $(".smallListDialogInput").on("keyup", function() {
        let upper = $(this).val();
        $(this).val( upper.toUpperCase() );
    });

    $(".smallListDialogInput").attr("autocomplete", "off");
    
    $(".smallListDialogInput").focus(function(){
        $(this).select();
    });

    if (!AutoNumeric.isManagedByAutoNumeric('#listAmt')) {
        new AutoNumeric('#listAmt', { decimalPlaces: 1, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false,unformatOnSubmit: true });
        new AutoNumeric('#listDisc', { decimalPlaces: 4, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false,unformatOnSubmit: true });
    }

    const amtInp = AutoNumeric.getAutoNumericElement('#listAmt');
    mode==='edit' ? amtInp.set(Number(amt)) : amtInp.set(0);
    const discInp = AutoNumeric.getAutoNumericElement('#listDisc');
    mode==='edit' ? discInp.set(Number(disc)) : discInp.set(0);

    let smallListBox = $("#smallListDialog").dialog({
            autoOpen: false,
            height: 450,
            width: 450,
            position: { my: "center", at: "center", of: $('#modalSmallListBody') },
            modal: true,
            close: function() {
                amtInp.remove();
                discInp.remove();
                $("#smallListDialog").dialog("destroy");
            },
            buttons: [
                {
                    id: "smallListSubmit",
                    text: "Save",
                    click: function (event) {
                        let xId    = $("#listid").val();
                        let xName  = $("#listName").val();
                        let xPorp  = $("#listMode").val();
                        let xType  = $("#listTrigger").val();
                        let xAmt   = amtInp.getNumber().toFixed(1);
                        let xUm    = $("#listMeasure").val();
                        let xDisc  = discInp.getNumber().toFixed(4);
                        let obj    = {"id": xId, "name": xName, "mode": xPorp, "measure": xType, "qty": xAmt, "voltype": xUm, "disc": xDisc};

                        if (mode==='edit') {
                            $.post("editDiscPool?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    $(".smallListTableSelected td:nth-child(2)").text(xName);
                                    $(".smallListTableSelected td:nth-child(3)").text((xPorp==='$' ? 'Price' : 'Percent'));
                                    $(".smallListTableSelected td:nth-child(4)").text((xType==='U' ? 'Unit' : 'Volume'));
                                    $(".smallListTableSelected td:nth-child(5)").text(xAmt);
                                    $(".smallListTableSelected td:nth-child(6)").text((xUm==='U' ? 'Units' : (xUm==='G' ? 'Gallons' : 'Liters')));
                                    $(".smallListTableSelected td:nth-child(7)").text(xDisc);
                                }
                            });
                        } else {
                            // need to check if the discPool exists before the post
                            $.post("addNewDiscPool?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    xId = Number(reply.id);
                                    
                                    $(".smallListTableSelected").removeClass("smallListTableSelected");

                                    $("#smallListTableBody tr").last().after('<tr class="smallListTableSelected"><td>' + xId + '</td><td>' + xName + 
                                        '</td><td class="smallListDataCellCenter">' + ((xPorp==='$') ? 'Price' : 'Percent') + 
                                        '</td><td class="smallListDataCellCenter">' + ((xType==='V') ? 'Volume' : 'Units') +
                                        '</td><td class="smallListDataCellCenter">' + xAmt + '</td>' + 
                                        '<td class="smallListDataCellCenter">' + (xUm==='U' ? 'Units' : (xUm==='G' ? 'Gallons' : 'Liters')) + '</td>' +
                                        '<td class="smallListDataCellRight">' + xDisc + '</td></tr>');

                                    let $targetRow = $('.smallListTableSelected').first();
                                    let $scrollContainer = $('#smallListTableDiv');
                                    let scrollToPosition = $targetRow.offset().top - $scrollContainer.offset().top + $scrollContainer.scrollTop();
                                    $scrollContainer.animate({
                                        scrollTop: scrollToPosition
                                    }, 800);
                                }
                            });
                        }

                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                },
                {
                    id: "smallListCancel",
                    text: "Cancel",
                    click: function () {
                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                }]
        });

    $(".ui-dialog-title").text(title);

    smallListBox.dialog("open");

}

function discPoolDelete() {
    let id   = $(".smallListTableSelected td:nth-child(1)").text();
    let pool = $(".smallListTableSelected td:nth-child(2)").text();

    $("<div id='smallListMsg'><p>Are you sure you want to delete the discount pool: " + pool + "?</p></div>").dialog({
        modal: true,
        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
        close: function () {
            $("#smallListMsg").dialog("destroy");
        },
        buttons: [
            {
                id: "discPoolDeleteYes",
                text: "Yes",
                click: function () {
                    $.post("deleteDiscPool?", { "id": id }, function (reply) {
                        $(this).prop("disabled",true);

                        if (reply.result !== "success") {
                            playBeep();
                            $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                modal: true,
                                position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                close: function () {
                                    $("#smallListMsg").dialog("close");
                                }
                            });
                        } else {
                            let idx = $(".smallListTableSelected").index();
                            console.log("1. idx for highlight:",idx);

                            idx = Math.max(idx, 1);
                            console.log("2. idx for highlight:",idx);

                            $(".smallListTableSelected").remove();

                            let row = $("#smallListTableBody tr:nth-child(" + idx + ")");
                            $(row).addClass("smallListTableSelected");

                            $("#smallListMsg").dialog("close");
                        }
                    });
                }
            },
            {
                id: "discPoolDeleteNo",
                text: "No",
                click: function () {
                    $("#smallListMsg").dialog("destroy");
                }
            }
        ]
    });
}

function showTypesList() {
    $.post("getInvTypesList?", function (reply) {
        $("#smallListTitle").text("Inventory Types");
        $("#smallListTableHdr").html("<tr class='smallListTableHdrTopRow'>" +
                                        "<th class='smallListHdrCellHidden'></th>" +
                                        "<th class='smallListHdrCellLeft'></th>" +
                                        "<th></th>" +
                                        "<th>Mixed</th>" +
                                        "<th>Mixed</th>" +
                                        "<th>Pre-Disc</th>" +
                                        "<th>Pre-Disc</th>" +
                                        "<th>Pre-Disc</th>" +
                                        "<th>Volume</th>" +
                                     "</tr>" +
                                     "<tr class='smallListTableHdrBottomRow'>" +
                                        "<th class='smallListHdrCellHidden'></th>" +"<th>Type</th>" +
                                        "<th>Department</th>" +
                                        "<th>Quantity</th>" +
                                        "<th>Discount</th>" +
                                        "<th>Tax 1</th>" +
                                        "<th>Tax 2</th>" +
                                        "<th>Tax 3</th>" +
                                        "<th>Tax</th>" +
                                     "</tr>");

        $.each(reply.types, function (idx, arr) {
            let tr = idx === 0 ? "tr class='smallListTableSelected'" : "tr";
            let ds = Number(arr[4]).toFixed(2);

            $('#smallListTableBody').append('<' + tr + '>' +
                    '<td class="smallListDataCellHidden">' + arr[1] + '</td>' +
                    '<td>' + arr[0] + '</td>' +
                    '<td>' + arr[2] + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[3] + '</td>' +
                    '<td class="smallListDataCellCenter">' + ds + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[5] + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[6] + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[7] + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[8] + '</td>' +
                '</tr>');
        });

        $("#smallListDialog").data("depts", reply.depts);

        $('#smallListTable').off('click');

        $('#smallListTable').on('click', function (event) {
            const clickedRow = event.target.closest('tr');

            // Ensure a row was actually clicked and it's not the table header
            if (clickedRow && clickedRow.parentNode.tagName === 'TBODY') {
                $("#smallListTable tr").removeClass('smallListTableSelected');

                // Add the 'selected' class to the newly clicked row
                $(clickedRow).addClass('smallListTableSelected');

                const firstCellText = $(clickedRow).find('td:first-child').text();
                console.log('Selected row data (first cell):', firstCellText);
            }
        });

        $("#smallListAddBtn").off('click');
        $("#smallListEditBtn").off('click');
        $("#smallListDeleteBtn").off('click');

        $("#smallListAddBtn").on('click', function(e) {
            e.stopPropagation();
            typeAddEdit('add');
        });
        $("#smallListEditBtn").on('click', function(e) {
            e.stopPropagation();
            typeAddEdit('edit');
        });
        $("#smallListDeleteBtn").on('click', function(e) {
            e.stopPropagation();
            console.log("Delete clicked");
            typeDelete();
        });

        $(".modalSmallListBody").css("width","900px");

        $("#modalSmallList").show();
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        swal("Oops...", "Error getting types: " + thrownError, "error");
        $("#modalSmallList").hide();
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    });
}

function typeAddEdit(mode) {
    let typeNum = "";
    let type    = "";
    let dept    = "";
    let mQty    = "";
    let mDisc   = "";
    let tax1    = "";
    let tax2    = "";
    let tax3    = "";
    let vTax    = "";
    let title   = "";
    let deptArr = $("#smallListDialog").data("depts");
    
    if (mode==='edit') {
        typeNum = $(".smallListTableSelected td:nth-child(1)").text();
        type    = $(".smallListTableSelected td:nth-child(2)").text();
        dept    = $(".smallListTableSelected td:nth-child(3)").text();
        mQty    = $(".smallListTableSelected td:nth-child(4)").text();
        mDisc   = $(".smallListTableSelected td:nth-child(5)").text();
        tax1    = $(".smallListTableSelected td:nth-child(6)").text().substring(0,1);
        tax2    = $(".smallListTableSelected td:nth-child(7)").text().substring(0,1);
        tax3    = $(".smallListTableSelected td:nth-child(8)").text().substring(0,1);
        vTax    = $(".smallListTableSelected td:nth-child(9)").text().substring(0,1);
        title   = "Edit Type: " + type;

        console.log( "typeNum:", typeNum, "mQty:", mQty);
    } else {
        title = "Add New Inventory Type";
    }

    let markup = "" +
        "<label for='listName' class='smallListDialogLabel'>Type Name:</label>" +
        "<input type='text' class='smallListDialogInput' name='listName' id='listName' " +
        "maxlength='30' style='width: 215px; text-transform: uppercase;'/>" +
        "<br><br>" +
        "<label for='listDept' class='smallListDialogLabel'>Department:</label>" +
        "<select class='smallListDialogSelect' id='listDept' name='listDept'>" +
        "</select>" +
        "<br><br>" +
        "<label for='listMixQty' class='smallListDialogLabel'>Mixed Qty:</label>" +
        "<input type='text' class='smallListDialogInput' id='listMixQty' name='listMixQty' maxlength='3'/>" +
        "<br><br>" +
        "<label for='listMixDisc' class='smallListDialogLabel'>Mixed Disc:</label>" +
        "<input type='text' class='smallListDialogInput' id='listMixDisc' name='listMixDisc' maxlength='5'/>" +
        "<br><br>" +
        "<label for='listTax1' class='smallListDialogLabel'>Tax1 Pre-Disc:</label>" +
        "<select class='smallListDialogSelect' id='listTax1' name='listTax1'>" +
        "<option value='Y'>Yes</option>" +
        "<option value='N'>No</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listTax2' class='smallListDialogLabel'>Tax2 Pre-Disc:</label>" +
        "<select class='smallListDialogSelect' id='listTax2' name='listTax2'>" +
        "<option value='Y'>Yes</option>" +
        "<option value='N'>No</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listTax3' class='smallListDialogLabel'>Tax3 Pre-Disc:</label>" +
        "<select class='smallListDialogSelect' id='listTax3' name='listTax3'>" +
        "<option value='Y'>Yes</option>" +
        "<option value='N'>No</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listVTax' class='smallListDialogLabel'>Charge Vol Tax:</label>" +
        "<select class='smallListDialogSelect' id='listVTax' name='listVTax'>" +
        "<option value='Y'>Yes</option>" +
        "<option value='N'>No</option>" +
        "</select>"


    $("#smallListDialogBody").html( markup );

    $("#smallListDialog").attr('title', title);

    $.each(deptArr, function(idx,arr) {
        $("#listDept").append('<option value="' + arr[0] + '">' + arr[1] + '</option>');
    });

    if (mode === 'edit') {
        $("#listName").val(type);
        $("#listDept option:contains('" + dept + "')").prop("selected", true);
        //$("#listMixQty").val(mQty);
        //$("#listMixDisc").val(mDisc);
        $("#listTax1").val(tax1);
        $("#listTax2").val(tax2);
        $("#listTax3").val(tax3);
        $("#listVTax").val(vTax);
    }

    $(".smallListDialogInput").attr("autocomplete", "off");
    
    $(".smallListDialogInput").focus(function(){
        $(this).select();
    });

    if (!AutoNumeric.isManagedByAutoNumeric('#listMixQty')) {
        new AutoNumeric('#listMixQty', { decimalPlaces: 0, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false,unformatOnSubmit: true });
        new AutoNumeric('#listMixDisc', { decimalPlaces: 2, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false,unformatOnSubmit: true });
    }

    const mixQInp = AutoNumeric.getAutoNumericElement('#listMixQty');
    mode==='edit' ? mixQInp.set(Number(mQty)) : mixQInp.set(0);
    const mDiscInp = AutoNumeric.getAutoNumericElement('#listMixDisc');
    mode==='edit' ? mDiscInp.set(Number(mDisc)) : mDiscInp.set(0);

    let smallListBox = $("#smallListDialog").dialog({
            autoOpen: false,
            height: 500,
            width: 450,
            position: { my: "center", at: "center", of: $('#modalSmallListBody') },
            modal: true,
            close: function() {
                mixQInp.remove();
                mDiscInp.remove();
                $("#smallListDialog").dialog("destroy");
            },
            buttons: [
                {
                    id: "smallListSubmit",
                    text: "Save",
                    click: function (event) {
                        let deptName = $("#listDept option:selected").text();
                        let xType = $("#listName").val();
                        let xDept = $("#listDept").val();
                        let xQty  = mixQInp.getNumber().toFixed(0);
                        let xDisc = mDiscInp.getNumber().toFixed(2);
                        let xTax1 = $("#listTax1").val().substring(0,1);
                        let xTax2 = $("#listTax2").val().substring(0,1);
                        let xTax3 = $("#listTax3").val().substring(0,1);
                        let xVTax = $("#listVTax").val().substring(0,1);

                        console.log("xDisc:", xDisc);

                        let obj   = {"typeNum": typeNum, "type": xType, "dept": xDept, "mQty": xQty, "mDisc": xDisc,
                                     "tax1": xTax1, "tax2": xTax2, "tax3": xTax3, "vTax": xVTax};

                        if (mode==='edit') {
                            $.post("editType?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    $(".smallListTableSelected td:nth-child(2)").text(xType);
                                    $(".smallListTableSelected td:nth-child(3)").text(deptName);
                                    $(".smallListTableSelected td:nth-child(4)").text(xQty);
                                    $(".smallListTableSelected td:nth-child(5)").text(xDisc);
                                    $(".smallListTableSelected td:nth-child(6)").text((xTax1==='Y') ? 'Yes' : 'No');
                                    $(".smallListTableSelected td:nth-child(7)").text((xTax2==='Y') ? 'Yes' : 'No');
                                    $(".smallListTableSelected td:nth-child(8)").text((xTax3==='Y') ? 'Yes' : 'No');
                                    $(".smallListTableSelected td:nth-child(9)").text((xVTax==='Y') ? 'Yes' : 'No');
                                }
                            });
                        } else {
                            // need to check if the types exists before the post
                            $.post("addNewType?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    xId = Number(reply.typeNum);
                                    
                                    $(".smallListTableSelected").removeClass("smallListTableSelected");

                                    $("#smallListTableBody tr").last().after('<tr class="smallListTableSelected">' +
                                            '<td class="smallListDataCellHidden">' + typeNum + '</td>' +
                                            '<td>' + xType + '</td>' +
                                            '<td>' + deptName + '</td>' +
                                            '<td class="smallListDataCellRight">' + mQty + '</td>' +
                                            '<td class="smallListDataCellRight">' + mDisc +'</td>' +
                                            '<td class="smallListDataCellCenter">' + (xTax1==='N' ? 'No' : 'Yes') + '</td>' + 
                                            '<td class="smallListDataCellCenter">' + (xTax2==='N' ? 'No' : 'Yes') + '</td>' +
                                            '<td class="smallListDataCellCenter">' + (xTax3==='N' ? 'No' : 'Yes') + '</td>' +
                                            '<td class="smallListDataCellCenter">' + (xVTax==='N' ? 'No' : 'Yes') + '</td>' +
                                        '</tr>');

                                    let $targetRow = $('.smallListTableSelected').first();
                                    let $scrollContainer = $('#smallListTableDiv');
                                    let scrollToPosition = $targetRow.offset().top - $scrollContainer.offset().top + $scrollContainer.scrollTop();
                                    $scrollContainer.animate({
                                        scrollTop: scrollToPosition
                                    }, 800);
                                }
                            });
                        }

                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                },
                {
                    id: "smallListCancel",
                    text: "Cancel",
                    click: function () {
                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                }]
        });

    $(".ui-dialog-title").text(title);

    smallListBox.dialog("open");

}

function typeDelete() {
    let typeNum = $(".smallListTableSelected td:nth-child(1)").text();
    let type    = $(".smallListTableSelected td:nth-child(2)").text();

    $("<div id='smallListMsg'><p>Are you sure you want to delete the type: " + type + "?</p></div>").dialog({
        modal: true,
        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
        close: function () {
            $("#smallListMsg").dialog("destroy");
        },
        buttons: [
            {
                id: "typeDeleteYes",
                text: "Yes",
                click: function () {
                    $.post("deleteType?", { "typeNum": typeNum }, function (reply) {
                        $(this).prop("disabled",true);

                        if (reply.result !== "success") {
                            playBeep();
                            $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                modal: true,
                                position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                close: function () {
                                    $("#smallListMsg").dialog("close");
                                }
                            });
                        } else {
                            let idx = $(".smallListTableSelected").index();
                            console.log("1. idx for highlight:",idx);

                            idx = Math.max(idx, 1);
                            console.log("2. idx for highlight:",idx);

                            $(".smallListTableSelected").remove();

                            let row = $("#smallListTableBody tr:nth-child(" + idx + ")");
                            $(row).addClass("smallListTableSelected");

                            $("#smallListMsg").dialog("close");
                        }
                    });
                }
            },
            {
                id: "typeDeleteNo",
                text: "No",
                click: function () {
                    $("#smallListMsg").dialog("destroy");
                }
            }
        ]
    });
}

function showCusTypeList() {
    $.post("getCusTypeList?", function (reply) {
        $("#smallListTitle").text("Customer Types");
        $("#smallListTableHdr").html("<tr class='smallListTableHdrTopRow'>" +
                                        "<th class='smallListHdrCellHidden'></th>" +
                                        "<th class='smallListHdrCellLeft'></th>" +
                                        "<th>Custom</th>" +
                                        "<th>Print</th>" +
                                        "<th>Invoice</th>" +
                                        "<th></th>" +
                                     "</tr>" +
                                     "<tr class='smallListTableHdrBottomRow'>" +
                                        "<th class='smallListHdrCellHidden'></th>" +
                                        "<th class='smallListHdrCellLeft'>Type Name</th>" +
                                        "<th>Invoice</th>" +
                                        "<th>Invoice</th>" +
                                        "<th>Type</th>" +
                                        "<th class='smallListHdrCellLeft'>Printer</th>" +
                                     "</tr>");

        $.each(reply.types, function (idx, arr) {
            let tr = idx === 0 ? "tr class='smallListTableSelected'" : "tr";
            let prn = arr[5];

            if (prn.length > 20) {
                prn = prn.substring(0,27) + '...';
            }

            $('#smallListTableBody').append('<' + tr + '>' +
                    '<td class="smallListDataCellHidden">' + arr[0] + '</td>' +
                    '<td>' + arr[1] + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[2] + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[3] + '</td>' +
                    '<td class="smallListDataCellCenter">' + arr[4] + '</td>' +
                    '<td>' + prn + '</td>' +
                '</tr>');
        });

        $("#smallListDialog").data("printers", reply.printers);

        $('#smallListTable').off('click');

        $('#smallListTable').on('click', function (event) {
            const clickedRow = event.target.closest('tr');

            // Ensure a row was actually clicked and it's not the table header
            if (clickedRow && clickedRow.parentNode.tagName === 'TBODY') {
                $("#smallListTable tr").removeClass('smallListTableSelected');

                // Add the 'selected' class to the newly clicked row
                $(clickedRow).addClass('smallListTableSelected');

                const firstCellText = $(clickedRow).find('td:first-child').text();
                console.log('Selected row data (first cell):', firstCellText);
            }
        });

        $("#smallListAddBtn").off('click');
        $("#smallListEditBtn").off('click');
        $("#smallListDeleteBtn").off('click');

        $("#smallListAddBtn").on('click', function(e) {
            e.stopPropagation();
            cusTypeAddEdit('add');
        });
        $("#smallListEditBtn").on('click', function(e) {
            e.stopPropagation();
            cusTypeAddEdit('edit');
        });
        $("#smallListDeleteBtn").on('click', function(e) {
            e.stopPropagation();
            console.log("Delete clicked");
            cusTypeDelete();
        });

        $(".modalSmallListBody").css("width","900px");

        $("#modalSmallList").show();
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        swal("Oops...", "Error getting cusTypes: " + thrownError, "error");
        $("#modalSmallList").hide();
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    });
}

function cusTypeAddEdit(mode) {
    let cusTypeNum = "";
    let cusType    = "";
    let customInv  = "";
    let printInv   = "";
    let invType    = "";
    let printer    = "";
    let prnArr     = $("#smallListDialog").data("printers");
    
    if (mode==='edit') {
        cusTypeNum = $(".smallListTableSelected td:nth-child(1)").text();
        cusType    = $(".smallListTableSelected td:nth-child(2)").text();
        customInv  = $(".smallListTableSelected td:nth-child(3)").text().substring(0,1);
        printInv   = $(".smallListTableSelected td:nth-child(4)").text().substring(0,1);
        invType    = $(".smallListTableSelected td:nth-child(5)").text().substring(0,1);
        printer    = $(".smallListTableSelected td:nth-child(6)").text().replace('...','');
        title      = "Edit Customer Type: " + cusType;

        printInv = (printInv==='S' ? 'A' : printInv);
        invType  = (invType==='8' ? 'Y' : '2');
    } else {
        title = "Add New Customer Type";
    }

    let markup = "" +
        "<label for='listName' class='smallListDialogLabel'>Type Name:</label>" +
        "<input cusType='text' class='smallListDialogInput' name='listName' id='listName' maxlength='25' style='width: 215px;'/>" +
        "<br><br>" +
        "<label for='listCustom' class='smallListDialogLabel'>Custom Invoice:</label>" +
        "<select class='smallListDialogSelect' id='listCustom' name='listCustom'>" +
        "<option value='Y'>Yes</option>" +
        "<option value='N'>No</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listPrintInv' class='smallListDialogLabel'>Print Invoice:</label>" +
        "<select class='smallListDialogSelect' id='listPrintInv' name='listPrintInv'>" +
        "<option value='Y'>Yes</option>" +
        "<option value='N'>No</option>" +
        "<option value='A'>Saved Amt > 0</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listInvType' class='smallListDialogLabel'>Invoice Type:</label>" +
        "<select class='smallListDialogSelect' id='listInvType' name='listInvType'>" +
        "<option value='2'>40-Column</option>" +
        "<option value='Y'>80-Column</option>" +
        "</select>" +
        "<br><br>" +
        "<label for='listPrinter' class='smallListDialogLabel'>Printer:</label>" +
        "<select class='smallListDialogSelectLge' id='listPrinter' name='listPrinter'>" +
        "<option value=' ' selected></option>" +
        "</select>"

    $("#smallListDialogBody").html( markup );

    $("#smallListDialog").attr('title', title);

    $.each(prnArr, function(idx,prn) {
        $("#listPrinter").append('<option value="' + idx + '">' + prn + '</option>');
    });

    if (mode === 'edit') {
        $("#listName").val(cusType);
        $("#listCustom").val(customInv);
        $("#listPrintInv").val(printInv);
        $("#listInvType").val(invType);
        $("#listPrinter option:contains('" + printer + "')").prop("selected", true);
    }

    $(".smallListDialogInput").attr("autocomplete", "off");
    
    $(".smallListDialogInput").focus(function(){
        $(this).select();
    });

    let smallListBox = $("#smallListDialog").dialog({
            autoOpen: false,
            height: 500,
            width: 550,
            position: { my: "center", at: "center", of: $('#modalSmallListBody') },
            modal: true,
            close: function() {
                $("#smallListDialog").dialog("destroy");
            },
            buttons: [
                {
                    id: "smallListSubmit",
                    text: "Save",
                    click: function (event) {
                        let xCusType = $("#listName").val();
                        let xCustomInv = $("#listCustom").val();
                        let xPrintInv = $("#listPrintInv").val().substring(0,1);
                        let xInvType = $("#listInvType").val();
                        let xPrinter = $("#listPrinter option:selected").text().substring(0,27) + '...';
        comsole.log("First xPrintInv:", xPrintInv);
                        
                        let obj   = {"cusTypeNum": cusTypeNum, "cusType": xCusType, "customInv": xCustomInv,
                                     "printInv": xPrintInv, "invType": xInvType, "printer": xPrinter}

                        if (mode==='edit') {
                            $.post("editCusType?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    xCustomInv = (xCustomInv==='Y' ? 'Yes' : 'No');
                                    xPrintInv  = (xPrintInv==='Y' ? 'Yes' : (xPrintInv==='N' ? 'No' : 'Saved Amt > 0'));
                                    xInvType   = (xInvType==='Y' ? '80-Column' : '40-Column');
comsole.log("Second xPrintInv:", xPrintInv);
                                    $(".smallListTableSelected td:nth-child(2)").text(xCusType);
                                    $(".smallListTableSelected td:nth-child(3)").text(xCustomInv);
                                    $(".smallListTableSelected td:nth-child(4)").text(xPrintInv);
                                    $(".smallListTableSelected td:nth-child(5)").text(xInvType);
                                    $(".smallListTableSelected td:nth-child(6)").text(xPrinter);
                                }
                            });
                        } else {
                            // need to check if the cusTypes exists before the post
                            $.post("addNewCusType?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    $(".smallListTableSelected").removeClass("smallListTableSelected");

                                    xCustomInv = (xCustomInv==='Y' ? 'Yes' : 'No');
                                    xPrintInv  = (xPrintInv==='Y' ? 'Yes' : (xPrintInv==='N' ? 'No' : 'Saved Amt > 0'));
                                    xInvType   = (xInvType==='Y' ? '80-Column' : '40-Column');

                                    $("#smallListTableBody tr").last().after('<tr class="smallListTableSelected">' +
                                            '<td class="smallListDataCellHidden">' + reply.cusTypeNum + '</td>' +
                                            '<td>' + xCusType + '</td>' +
                                            '<td class="smallListDataCellCenter">' + xCustomInv + '</td>' +
                                            '<td class="smallListDataCellCenter">' + xPrintInv + '</td>' +
                                            '<td class="smallListDataCellCenter">' + xInvType +'</td>' +
                                            '<td>' + xPrinter + '</td>' + 
                                        '</tr>');

                                    let $targetRow = $('.smallListTableSelected').first();
                                    let $scrollContainer = $('#smallListTableDiv');
                                    let scrollToPosition = $targetRow.offset().top - $scrollContainer.offset().top + $scrollContainer.scrollTop();
                                    $scrollContainer.animate({
                                        scrollTop: scrollToPosition
                                    }, 800);
                                }
                            });
                        }

                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                },
                {
                    id: "smallListCancel",
                    text: "Cancel",
                    click: function () {
                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                }]
        });

    $(".ui-dialog-title").text(title);

    smallListBox.dialog("open");

}

function cusTypeDelete() {
    let cusTypeNum = $(".smallListTableSelected td:nth-child(1)").text();
    let cusType    = $(".smallListTableSelected td:nth-child(2)").text();

    $("<div id='smallListMsg'><p>Are you sure you want to delete the cusType: " + cusType + "?</p></div>").dialog({
        modal: true,
        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
        close: function () {
            $("#smallListMsg").dialog("destroy");
        },
        buttons: [
            {
                id: "cusTypeDeleteYes",
                text: "Yes",
                click: function () {
                    $.post("deleteCusType?", { "cusTypeNum": cusTypeNum }, function (reply) {
                        $(this).prop("disabled",true);

                        if (reply.result !== "success") {
                            playBeep();
                            $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                modal: true,
                                position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                close: function () {
                                    $("#smallListMsg").dialog("close");
                                }
                            });
                        } else {
                            let idx = $(".smallListTableSelected").index();
                            console.log("1. idx for highlight:",idx);

                            idx = Math.max(idx, 1);
                            console.log("2. idx for highlight:",idx);

                            $(".smallListTableSelected").remove();

                            let row = $("#smallListTableBody tr:nth-child(" + idx + ")");
                            $(row).addClass("smallListTableSelected");

                            $("#smallListMsg").dialog("close");
                        }
                    });
                }
            },
            {
                id: "cusTypeDeleteNo",
                text: "No",
                click: function () {
                    $("#smallListMsg").dialog("destroy");
                }
            }
        ]
    });
}

function popCust(args) {
    let isNew = args === null;
    let index;
    let obj;
    let custnum;    
console.log("In popCust, isNew:", isNew);

    $.spin('true');

    if (isNew) {
        index = 0;
        obj = null;
        custnum = 0;
    } else {
        index = args.itemIndex;
        obj = args.item;
        custnum = obj.custnum;

        if (Number.isNaN(Number(custnum)) || Number(custnum) === 0) return;  //misc sale items, etc
        console.log("Starting popCust, index:", index, "custnum:", custnum);

        console.log("in popCust, custnum: |" + custnum + "|, name:", obj.name);

        console.log("custListData.data[index]:", custListData.data[index]);
    }

    $.post("popCust?",
        { custnum: custnum, uid: uid, isNew: isNew ? 'Y' : 'N' },
        function (reply) {
            if (reply.result === 'fail') {
                vex.dialog.alert({
                    unsafeMessage: 'Error:<br><br>' + reply.msg, // unsafeMessage option allows html in text
                    className: 'vex-theme-wireframe' // Overwrites defaultOptions
                });
            } else {
                $("#popCustTabs").tabs({
                    active: 0,
                    activate: function (event, ui) {
                        let tab = ui.newPanel.selector;
                        if (tab.includes("popCustSalesHistory")) {
                            $(".popEditButtonDiv").hide();
                            $(".popButtonDiv").hide();
                        } else if ($("#modalPopCust").attr("data-mode") === 'view') {
                            $(".popEditButtonDiv").show();
                        } else {
                            $(".popButtonDiv").show();
                        }
                    }
                });

                if (isNew) {
                    $("#popCustTitle").html('Add New Customer');
                } else {
                    $("#popCustTitle").html('Details: ' + obj.name + '&nbsp;(Nbr: ' + custnum + ')');

                    $.each(reply.cells, function (idx, val) {
                        if (val[0] === "popCustDelivSameAsBill") {
                            if (val[1] === 'Y' || val[1] === ' ') {
                                $("#popCustDeliveryCheck").text("Yes");
                            } else {
                                $("#popCustDeliveryCheck").text("No");
                            }
                        } else if (val[0] === "popCustVolTax") {
                            if (val[1] === 'Y' || isBlank(val[1])) {
                                $("#popCustVolumeTax").text("Yes");
                            } else {
                                $("#popCustVolumeTax").text("No");
                            }
                        } else {
                            $("#" + val[0]).html(val[1]);
                        }
                    });
                    $("#popCustNotes").val(reply.notes);
                }

                let tf1 = [];
                let tf2 = [];
                let tf3 = [];
                let tfF = [];
                let htm = "";
                $.each( reply.depts, function (idx, txt) {
                    let nbr  = txt.substring(0,2).trim();
                    let disc = reply.discounts.substring((3*idx),(3*idx)+2);
                    let lvl  = reply.priceLvl.substring(idx,idx+1);
                    
                    let chk1 = reply.taxFree.substring(idx,idx+1);
                    let chk2 = reply.taxFree2.substring(idx,idx+1);
                    let chk3 = reply.taxFree3.substring(idx,idx+1);
                    let chkF = reply.taxFreeF.substring(idx,idx+1);

                    let st1  = (chk1 === '1') ? '2' : (chk1 === 'N') ? '0' : '1';
                    let st2  = (chk2 === '1') ? '2' : (chk2 === 'N') ? '0' : '1';
                    let st3  = (chk3 === '1') ? '2' : (chk3 === 'N') ? '0' : '1';
                    let stF  = (chkF === '1') ? '2' : (chkF === 'N') ? '0' : '1';

                    tf1.push( [nbr,chk1] );
                    tf2.push( [nbr,chk2] );
                    tf3.push( [nbr,chk3] );
                    tfF.push( [nbr,chkF] );

                    disc = isBlank(disc) ? '0.0' : disc;
                    disc = (Number(disc)/10).toFixed(1);
                    lvl  = (isBlank(lvl) ? 'A' : lvl);
                    chk1 = (isBlank(chk1) || chk1==='N') ? 'checked' : '';
                    chk2 = (isBlank(chk2) || chk2==='N') ? 'checked' : '';
                    chk3 = (isBlank(chk3) || chk3==='N') ? 'checked' : '';
                    chkF = (isBlank(chkF) || chkF==='N') ? 'checked' : '';

                    htm +=
                    '<div class="popTableRow popTaxPriceDeptRow">' +
                        '<div class="popTaxPriceCell">' + txt + '</div>' +
                        '<div class="popTaxPriceCell"><input type="checkbox" class="popCust3State" id="popCustTax1Set_' + nbr + 
                            '" ' + chk1 + ' data-state="' + st1 + '" /><label for="popCustTax1Set_' + nbr +
                             '">Taxed</label></div>' +
                        '<div class="popTaxPriceCell "><input type="checkbox" class="popCust3State" id="popCustTax2Set_' + nbr + 
                            '" ' + chk2 + ' data-state="' + st2 + '" /><label for="popCustTax2Set_' + nbr + 
                            '">Taxed</label></div>' +
                        '<div class="popTaxPriceCell "><input type="checkbox" class="popCust3State" id="popCustTax3Set_' + nbr + 
                            '" ' + chk3 + ' data-state="' + st3 + '" /><label for="popCustTax3Set_' + nbr + 
                            '">Taxed</label></div>' +
                        '<div class="popTaxPriceCell "><input type="checkbox" class="popCust3State" id="popCustTaxFSet_' + nbr + 
                            '" ' + chkF + ' data-state="' + stF + '" /><label for="popCustTaxFSet_' + nbr + 
                            '">Taxed</label></div>' +
                        '<div class="popTaxPriceCell popCenterAligned"><input type="text" class="popCustDiscInput popCustAnDeci1_4"' +
                            'id="popCustDiscSet_' + nbr + '" value="' + disc + '" maxlength="4" style="width: 50px;" /></div>' +
                        '<div class="popTaxPriceCell popPriceLvlSelect"><select class="popCustPriceLvlSelect"' +
                            'id="popCustPriceLvlSet_' + nbr + '">' +
                            '<option value="A"' +  (lvl === 'A' ? ' selected' : '') + '>A Level</option>' +
                            '<option value="B"' +  (lvl === 'B' ? ' selected' : '') + '>B Level</option>' +
                            '<option value="C"' +  (lvl === 'C' ? ' selected' : '') + '>C Level</option>' +
                            '<option value="D"' +  (lvl === 'D' ? ' selected' : '') + '>D Level</option>' +
                            '<option value="E"' +  (lvl === 'E' ? ' selected' : '') + '>E Level</option>' + 
                            '<option value="F"' +  (lvl === 'F' ? ' selected' : '') + '>F Level</option>' +
                            '<option value="G"' +  (lvl === 'G' ? ' selected' : '') + '>G Level</option>' +
                            '<option value="H"' +  (lvl === 'H' ? ' selected' : '') + '>H Level</option>' +  
                            '<option value="I"' +  (lvl === 'I' ? ' selected' : '') + '>I Level</option>' +
                            '<option value="J"' +  (lvl === 'J' ? ' selected' : '') + '>J Level</option>' +
                        '</select></div>' +
                    '</div>'
                });
                $("#popCustTaxPriceHeader").after(htm);

                $(".popPopHide").hide();
                $(".popButtonDiv").hide();

                $("#Modal_popCust_close").html('&times;');
                $("#Modal_popCust_close").on("click", function () { closePopCust(); });
                $("#Modal_popCust_close").addClass('close');

                $(".popEditButtonDiv").show();

                $("#custSalesHistoryTab").show();

                $("#popCustTaxPriceTable input").prop('disabled', true);   
                $("#popCustTaxPriceTable select").prop('disabled', true);

                $("#modalPopCust").attr("data-mode", "view");
                $("#modalPopCust").data("custnum", custnum);
                $("#modalPopCust").data("index", index);
                $("#modalPopCust").show();

                $( "#popCustTabs" ).tabs( "option", "active", 0 );

                if ($("#popCustVolumeTax").text() === 'Yes') {
                    $("div[id^='popCustDeliv']").css("font-style","italic");
                }
console.log("tf1:", tf1);
                $.each(tf1, function(idx,arr) {
                    if (arr[1] === '1') {
                        $('#popCustTax1Set_' + arr[0]).prop('indeterminate', true);
                        $("label[for='popCustTax1Set_" + arr[0] + "']").text('Alt Tax');
                    } else if (arr[1] === 'Y') {
                        $("label[for='popCustTax1Set_" + arr[0] + "']").text('No Tax');
                    }
                });
                $.each(tf2, function(idx,arr) {
                    if (arr[1]  === '1') {
                        $('#popCustTax2Set_' + arr[0]).prop('indeterminate', true);
                        $("label[for='popCustTax2Set_" + arr[0] + "']").text('Alt Tax');
                    } else if (arr[1] === 'Y') {
                        $("label[for='popCustTax2Set_" + arr[0] + "']").text('No Tax');
                    }   
                });
                $.each(tf3, function(idx,arr) {
                    if (arr[1] === '1') {
                        $('#popCustTax3Set_' + arr[0]).prop('indeterminate', true);
                        $("label[for='popCustTax3Set_" + arr[0] + "']").text('Alt Tax');
                    } else if (arr[1] === 'Y') {
                        $("label[for='popCustTax3Set_" + arr[0] + "']").text('No Tax');
                    }
                });
                $.each(tfF, function(idx,arr) {
                    if (arr[1] === '1') {
                        $('#popCustTaxFSet_' + arr[0]).prop('indeterminate', true);
                        $("label[for='popCustTaxFSet_" + arr[0] + "']").text('Alt Tax');
                    } else if (arr[1] === 'Y') {
                        $("label[for='popCustTaxFSet_" + arr[0] + "']").text('No Tax');
                    }
                });

                let nWide = $("#popCustNotes").width();
                let nHigh = $("#popCustNotes").parent().parent().height() - 4;
                $("#popCustNotes").css({ "max-width": nWide, "max-height": nHigh });

                //----- adding new customer, so go straigh to add/edit
                if (isNew) {
                    addEditPopCust(null);
                }
            }
        })
        .fail(function (xhr, status, error) {
            vex.dialog.alert({
                unsafeMessage: 'Error:<br><br>' + error + '<br>' + xhr.responseText, // unsafeMessage option allows html in text
                className: 'vex-theme-wireframe' // Overwrites defaultOptions
            });
        });

        $.spin('false');
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function closePopCust() {
	$("#modalPopCust").hide();
	$("#modalPopCustContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
    $("#modalPopCust").data("custnum", "");
    $("#popCustNotes").val("");
    $("#popCustDeliveryNotes").val("");
    $(".popTaxPriceDeptRow").remove();
    $(".popCustDataCell").css("border", "1px solid #097764");
    $("#popCustNotes").prop("disabled", true);
}

function addEditPopCust(notNew) {
    let vals = [];
    let selects = [];

    $.spin('true');

    notNew = notNew !== null;

    $("#popCustTitle").text('New Customer');

    $(".popCustDataCell").each(function (idx, el) {
        let id = $(el).prop('id');
        let inp = id + "Inp";

        if ($(el).hasClass('popNoEdit')) {
            return; // continue to next iteration
        } else if (notNew && id === 'popCustBDay') {
            let txt = $(el).text();
            if (!isBlank(txt)) {
                let parts = txt.split(' ');
                vals.push([id + 'MthInp', parts[0]]);
                vals.push([id + 'DayInp', parts[1]]);
            } else {
                vals.push([id + 'MthInp', ' ']);
                vals.push([id + 'DayInp', ' ']);
            }
        } else if (notNew && !$(el).hasClass('popCustDataSelect')) {
            vals.push([inp, $(el).text()]);
        } else if (notNew && $(el).hasClass('popCustDataSelect')) {
            inp = id + "Select";
            selects.push([inp, $(el).text()]);
        }

        if (id === 'popCustNotes') {
            $(el).prop("disabled", false);
        } else if (id === 'popCustCustType') {
            fillPopCustType();
        } else if ($(el).hasClass('popCustDataSelect')) {
            $(el).html("<select class='itemAddSelect' id='" + inp + "'></select>");
            if (id.includes('State')) {
                fillStateSelect(inp);
            }
        } else if ($(el).hasClass('popCustDataCheck')) {
            $(el).html("<input type='checkbox' class='popCustCheck' id='" + inp +
                "' unchecked><span id='" + inp + "Char' class='itemCheckboxChar'>No</span>");
        } else if (id.includes('Phone')) {
            $(el).html("<input type='tel' class='popCustPhoneInput' id='" + inp + "'>");
        } else if ($(el).hasClass('popTableCell3')) {
            $(el).html("<input type='text' class='itemAddWide' id='" + inp + "'>");
        } else if ($(el).hasClass('popCustDatePick')) {
            $(el).html("<input type='date' class='itemAddDate' id='" + inp + "'>");
        } else if (id === 'popCustBDay') {
            $(el).html("<select class='itemAddMonth' id='" + id + 'MthInp' + "'></select>" +
                      "&nbsp;<select class='itemAddDay' id='" + id + 'DayInp' + "'></select>");
        } else {
            $(el).html("<input type='text' class='itemAddNarrow' id='" + inp + "'>");
        }

        fillBDayPickers()

        //---- prepare for autoNumeric
        if ($(el).hasClass('popCustInt1')) {
            $(el).find('input').addClass('popCustAnInt1');
        } else if ($(el).hasClass('popCustInt10')) {
            $(el).find('input').addClass('popCustAnInt10');
        } else if ($(el).hasClass('popCustDeci2_10')) {
            $(el).find('input').addClass('popCustAnDeci2_10');
        } else if ($(el).hasClass('popCustDeci1_4')) {
            $(el).find('input').addClass('popCustAnDeci1_4');
        }
    });

    //----- apply autoNumeric
    $('.popCustAnInt1').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '9', minimumValue: '0', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popCustAnInt10').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '9999999999', minimumValue: '-9999999999', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popCustAnDeci2_10').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '9999999.99', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popCustAnDeci1_4').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 1, emptyInputBehavior: 'zero', maximumValue: '99.9', minimumValue: '0', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });

    //---- apply intltel phone input
    $('.popCustPhoneInput').each(function (idx, el) {
        window.intlTelInput(el, {
            initialCountry: "us",
            separateDialCode: true,
            utilsScript: "js/utils.js",
            countrySearch: false,
            separateDialCode: false,
            allowPhonewords: false,
            strictMode: true
        });

        el.placeholder = "(555) 555-0123";
    });

    $(".popCust3State").on('change', function () {
        let id = $(this).prop("id");
        let state = parseInt($(this).attr("data-state"));

        state = (state + 1) % 3; // Cycle through the three states
        $(this).attr("data-state", state);

        switch (state) {
            case 0: // Unchecked
                $(this).prop("checked", false);
                $(this).prop("indeterminate", false);
                $("label[for='" + id + "']").text("No Tax");
                break;
            case 1: // Checked
                $(this).prop("checked", true);
                $(this).prop("indeterminate", false);
                $("label[for='" + id + "']").text("Taxed");
                break;
            case 2: // Indeterminate
                $(this).prop("checked", false); // Indeterminate state is visually distinct, but the `checked` property should be false
                $(this).prop("indeterminate", true);
                $("label[for='" + id + "']").text("Alt Tax");
                break;
        }
    });

    $(".popCustCheck").on('click', function () {
        let id = $(this).prop("id");

        if ($(this).prop("checked")) {
            $("#" + id + "Char").text("Yes");
        } else {
            $("#" + id + "Char").text("No");
        }
    });

    $(".popCustDataCell input").prop("autocomplete", "off");

    if (notNew) {
    console.log("Populating existing customer data, vals:", vals);
        $.each(vals, function (idx, arr) {
            let txt = '#' + arr[0];

            if ($(txt).hasClass("popCustCheck")) {
    console.log("Setting check for:", txt, "to:", arr[1]);
                if (arr[1].substring(0, 1) === 'Y') {
                    $(txt).prop("checked", true);
                    $(txt + "Char").text("Yes");
                } else {
                    $(txt).prop("checked", false);
                    $(txt + "Char").text("No");
                }
            } else if (arr[0] === 'popCustBDayInp') {
    console.log("Setting bday for:", txt, "to:", arr[1]);
                $(txt).val(arr[1]);
            } else if ($(txt).data("autonumeric") !== null && $(txt).data("autonumeric") !== undefined) {
                let nbr = arr[1].replace(/[$,]/g, '');
                $(txt).data("autonumeric").set(nbr);

            } else {
                $(txt).val(arr[1]);
            }
        });
    } else {
        $("#popCustDeliveryCheckInp").prop("checked", true);
        $("#popCustDeliveryCheckInpChar").text("Yes");
    }

    $('.popCustDiscInput').focus(function() {
        var self = $(this);
        setTimeout(function() {
            self.select();
        }, 1); // A small delay to ensure the browser registers the focus before selecting.
    });

    $('#popCustBDayMthInp').on('change', populateDays);

    $("#popCustDeliveryCheckInp").on('change', function() {
        if ($(this).is(':checked') === true ) {
            $("#popCustShipping input[type='text']").prop("disabled",true);
            $("#popCustShipping input[type='tel']").prop("disabled",true);
            $("#popCustShipping select").prop("disabled",true);
        } else {
            $("#popCustShipping input[type='text']").prop("disabled",false);
            $("#popCustShipping input[type='tel']").prop("disabled",false);
            $("#popCustShipping select").prop("disabled",false);
        }
    });

    // new customer add
    if (!notNew) {
        //$("#popCustSalesHistory").hide();
        $("#popCustStateSelect").val(custListData.state);
console.log("Setting new customer state to:", custListData.state);
    }

    $(".popDateLabel").hide();
    $(".popDataDate").hide();
    $(".popPopHide").show();
    $(".popEditButtonDiv").hide();
    $(".popButtonDiv").show();

    $(".popCustDataCell").css("border", "none");

    $("#Modal_popCust_close").html('&nbsp;');
    $("#Modal_popCust_close").on("click", null);
    $("#Modal_popCust_close").removeClass('close');

    $("#popCustTaxPriceTable input").prop('disabled', false);   
    $("#popCustTaxPriceTable select").prop('disabled', false);

    $("#popCustNotes").prop("disabled", false);

    $("#modalPopCust").attr("data-mode", "edit");
    $("#modalPopCust").show();

    $("#popCustDeliveryCheckInp").trigger('change');
    //$(".popCust3State").trigger('change');

    if (notNew) {
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveCust('edit'); });

        setTimeout(function () {
            $.each(selects, function (idx, arr) {
                let txt = '#' + arr[0] + " option";
                $(txt).filter(function () {
                    return $(this).text().trim() === arr[1];
                }).prop("selected", true);
            });
            if (!notNew) {
                $("#popCustStateSelect").val(custListData.state);
            }
            $.spin('false');
        }, 250);
    } else {
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveCust('new'); });
        setTimeout(function () {
            $("#popCustStateInp").val(custListData.state);
            $.spin('false');
        }, 250);
    }

    setTimeout(function () { $('#popCustLastNameInp').focus(); }, 25);
}

function fillPopCustType() {
    $("#popCustCustType").html("<select id='popCustCustTypeSelect'></select>");
    $("#popCustCustTypeSelect").append('<option value=" ">&nbsp;</option>');

    $.post( "getCusTypes?", function(reply) {
        $.each(reply.aCusts, function(idx,aTyp) {
            $("#popCustCustTypeSelect").append('<option value="' + aTyp[1] + '">' + aTyp[0] + '</option>');
        });
    });
}

function fillStateSelect(selectId) {
    let states = [
        'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
        'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
        'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
        'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
        'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
    ];
    for (let i = 0; i < states.length; i++) {
        $('#' + selectId).append('<option value="' + states[i] + '">' + states[i] + '</option>');
    }
}

function fillBDayPickers() {
    let monthSelect = $('#popCustBDayMthInp');
    let daySelect = $('#popCustBDayDayInp');
    let months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    monthSelect.empty();
    daySelect.empty();

    monthSelect.append('<option value=" ">&nbsp;</option>');
    daySelect.append('<option value=" ">&nbsp;</option>');

    for (let i = 1; i <= 12; i++) {
        monthSelect.append('<option value="' + months[i-1] + '">' + months[i-1] + '</option>');
    }
    for (let i = 1; i <= 31; i++) {
        daySelect.append('<option value="' + i + '">' + i + '</option>');
    }
}

function populateDays() {
    let month = $('#popCustBDayMthInp').val();
    let daySelect = $('#popCustBDayDayInp');
    let months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    let monthIndex = months.indexOf(month) + 1;
    let daysInMonth = new Date(2000, monthIndex, 0).getDate(); // Year 2000 is a leap year
    
    if (monthIndex === 0) {
        return; // Invalid month
    }

    daySelect.empty();
    daySelect.append('<option value=" ">&nbsp;</option>');

    for (let i = 1; i <= daysInMonth; i++) {
        daySelect.append('<option value="' + i + '">' + i + '</option>');
    }
}

function popSaveCust(mode) {
    let custnum = "";
    let index;
    let aData = [];
    let tf1   = [];
    let tf2   = [];
    let tf3   = [];
    let tfF   = [];
    let disc  = [];
    let pLvl  = [];

    if (mode === 'edit') {
        custnum = $("#modalPopCust").data("custnum");
        index   = $("#modalPopCust").data("index");
    }

    $(".popCustDataCell").children().each(function (idx, el) {
        let id   = $(el).prop("id");
        let val  = $(el).val();
        let tag  = $(el).prop("tagName").toUpperCase();
        let nn   = $(el).data("autonumeric");
        let val2 = "";
        let ns;
        const aV = ["N", "Y", "1"];

        if ($(el).hasClass("iti")) {
            return true; // skip the intl-tel-input div
        } else if (nn !== undefined) {
            val = nn.getNumber();
console.log("AutoNumeric value for", id, "is", val);
        } else if ($(el).hasClass("popCust3State")) {
            ns = parseInt($(el).attr("data-state"));
            val = aV[ns];
        } else if ($(el).hasClass("popCustCheck")) {
            val = $(el).prop("checked") ? "Y" : "N";
        } else if (tag === 'SELECT') {
            val2 = $("#" + id + " option:selected").text().trim();
        } else if (id.includes("Char")) {
            return true;
        } else if (tag === 'LABEL' || tag === 'SPAN') {
            return true;
        }

        aData.push([id, val]);

        if (tag === "SELECT") {
            aData.push([id + "Text", val2]);
        }
    });

    $(".popCustPhoneInput").each(function(idx,el) {
        let phoneNum = $(el).val();
        aData.push([ $(el).prop("id"), formatPhoneNumber(phoneNum) ]);
    });

    aData.push([ "popCustNotes", $("#popCustNotes").val() ]);
    aData.push([ "popCustDeliveryNotes", $("#popCustDelivNotes").val() ]);

    $("input[id^='popCustTax1Set_']").each(function(idx,el) {
        const aV = ["Y", "N", "1"];
        let nbr = $(el).prop("id").split('_')[1];
        let state = parseInt($(el).attr("data-state"));
        let val = aV[state];
        tf1.push( [nbr, val] );
    });
    $("input[id^='popCustTax2Set_']").each(function(idx,el) {
        const aV = ["Y", "N", "1"];
        let nbr = $(el).prop("id").split('_')[1];
        let state = parseInt($(el).attr("data-state"));
        let val = aV[state];
        tf2.push( [nbr, val] );
    });
    $("input[id^='popCustTax3Set_']").each(function(idx,el) {
        const aV = ["Y", "N", "1"];
        let nbr = $(el).prop("id").split('_')[1];
        let state = parseInt($(el).attr("data-state"));
        let val = aV[state];
        tf3.push( [nbr, val] );
    });
    $("input[id^='popCustTaxFSet_']").each(function(idx,el) {
        const aV = ["Y", "N", "1"];
        let nbr = $(el).prop("id").split('_')[1];
        let state = parseInt($(el).attr("data-state"));
        let val = aV[state];
        tfF.push( [nbr, val] );
    });
    $("input[id^='popCustDiscSet_']").each(function(idx,el) {
        let nbr = $(el).prop("id").split('_')[1];
        let nn = $(el).data("autonumeric");
        let val = nn.getNumber();
        disc.push( [nbr, val] );
    });
    $("select[id^='popCustPriceLvlSet_']").each(function(idx,el) {
        let nbr = $(el).prop("id").split('_')[1];
        let val = $("#" + $(el).prop("id")).val();
        pLvl.push( [nbr, val] );
    });

    if (mode === 'edit') {
        console.log("popSaveItem calling itemEdit?, index =",index);

        $.post("custEdit?", { "from": "LIST", "user": uid, "custnum": custnum, 
                              "data": JSON.stringify(aData),
                              "tf1":  JSON.stringify(tf1),
                              "tf2":  JSON.stringify(tf2),
                              "tf3":  JSON.stringify(tf3),
                              "tfF":  JSON.stringify(tfF),
                              "disc": JSON.stringify(disc),
                              "pLvl": JSON.stringify(pLvl),
                            }, function (reply) {
            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            let newObj = reply.custObj;

            //---- update item in list data
            const editedCust = custListData.data.find( customer => customer.custnum === custnum );

            editedCust.address   = newObj.address;
            editedCust.checks    = newObj.checks;
            editedCust.citySt    = newObj.citySt;
            editedCust.lastOrder = newObj.lastOrder;
            editedCust.name      = newObj.name;
            editedCust.phone     = newObj.phone;
            editedCust.purchases = newObj.purchases;
            editedCust.zip       = newObj.zip;

            const sorting = jsCustListTable.grid.jsGrid("getSorting");
            jsCustListTable.grid.jsGrid("loadData");
            jsCustListTable.grid.jsGrid("sort", sorting);
        });

    } else {
        $.post("custAdd?", { "from": "LIST", "user": uid, 
                             "data": JSON.stringify(aData),
                             "tf1":  JSON.stringify(tf1),
                             "tf2":  JSON.stringify(tf2),
                             "tf3":  JSON.stringify(tf3),
                             "tfF":  JSON.stringify(tfF),
                             "disc": JSON.stringify(disc),
                             "pLvl": JSON.stringify(pLvl),
                           }, function (reply) {
            let newObj;

            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            newObj = reply.custObj

            //---- add item to list data
            custListData.data.push(newObj);
            custListData.data.sort( function(a,b) {
                let nameA = a.name.toUpperCase();
                let nameB = b.name.toUpperCase();           
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });

            const newIndex = custListData.data.findIndex( customer => customer.custnum === newObj.custnum );
            const pageSize = $(".jsgrid-grid-body tr").length;
            const pageNumber = Math.floor(newIndex / pageSize) + 1;
            const sorting = jsCustListTable.grid.jsGrid("getSorting");

            //---- reload data and sort, then page to new customer
            jsCustListTable.grid.jsGrid("loadData");
            jsCustListTable.grid.jsGrid("sort", sorting);
            jsCustListTable.grid.jsGrid("openPage", pageNumber);

        });
    }
    closePopCust();
}

function popVend(args) {
    let isNew = args === null;
    let index;
    let obj;
    let vendnum;    
console.log("In popVend, isNew:", isNew);

    $.spin('true');

    if (isNew) {
        index = 0;
        obj = null;
        vendnum = 0;
    } else {
        index = args.itemIndex;
        obj = args.item;
        vendnum = obj.vendnum;

        if (Number.isNaN(Number(vendnum)) || Number(vendnum) === 0) return;
        console.log("Starting popVend, index:", index, "vendnum:", vendnum);
        console.log("in popVend, vendnum: |" + vendnum + "|, company:", obj.company);
    }

    $.post("popVend?",
        { vendnum: vendnum, uid: uid, isNew: isNew ? 'Y' : 'N' },
        function (reply) {
            if (reply.result === 'fail') {
                vex.dialog.alert({
                    unsafeMessage: 'Error:<br><br>' + reply.msg, // unsafeMessage option allows html in text
                    className: 'vex-theme-wireframe' // Overwrites defaultOptions
                });
            } else {
                $("#popVendTabs").tabs({
                    active: 0,
                    activate: function (event, ui) {
                        let tab = ui.newPanel.selector;
                        if (tab.includes("popVendPurchHistory")) {
                            $(".popEditButtonDiv").hide();
                            $(".popButtonDiv").hide();
                        } else if ($("#modalPopVend").attr("data-mode") === 'view') {
                            $(".popEditButtonDiv").show();
                        } else {
                            $(".popButtonDiv").show();
                        }
                    }
                });

                if (isNew) {
                    $("#popVendTitle").html('Add New Vendor');
                } else {
                    $("#popVendTitle").html('Details: ' + obj.company + '&nbsp;(Nbr: ' + vendnum + ')');

                    $.each(reply.cells, function (idx, val) {
                        $("#" + val[0]).html(val[1]);
                    });
                    $("#popVendNotes").val(reply.notes);
                }

                $(".popPopHide").hide();
                $(".popButtonDiv").hide();

                $("#Modal_popVend_close").html('&times;');
                $("#Modal_popVend_close").on("click", function () { closePopVend(); });
                $("#Modal_popVend_close").addClass('close');

                $(".popEditButtonDiv").show();

                $("#modalPopVend").attr("data-mode", "view");
                $("#modalPopVend").data("vendnum", vendnum);
                $("#modalPopVend").data("index", index);
                $("#modalPopVend").show();

                $( "#popVendTabs" ).tabs( "option", "active", 0 );

/*
                let nWide = $("#popVendNotes").width();
                let nHigh = $("#popVendNotes").parent().parent().height() - 4;
                $("#popVendNotes").css({ "max-width": nWide, "max-height": nHigh });
*/
                //----- adding new vendor, so go straight to add/edit
                if (isNew) {
                    addEditPopVend(null);
                } else {
                    $("#modalPopVend").show();
                }
            }
        })
        .fail(function (xhr, status, error) {
            vex.dialog.alert({
                unsafeMessage: 'Error:<br><br>' + error + '<br>' + xhr.responseText, // unsafeMessage option allows html in text
                className: 'vex-theme-wireframe' // Overwrites defaultOptions
            });
        });

        $.spin('false');
}

function closePopVend() {
	$("#modalPopVend").hide();
	$("#modalPopVendContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
    $("#modalPopVend").data("vendnum", "");
    $("#popVendNotes").val("");
    $("#popVendDeliveryNotes").val("");
    $(".popVendDataCell").css("border", "1px solid #097764");
    $("#popVendNotes").prop("disabled", true);
}

function addEditPopVend(notNew) {
    let vals = [];

    $.spin('true');

    notNew = notNew !== null;

    $(".popVendDataCell").each(function (idx, el) {
        let id = $(el).prop('id');
        let inp = id + "Inp";

        if ($(el).hasClass('popNoEdit')) {
            return; // continue to next iteration
        } else if (notNew) {
            vals.push([inp, $(el).text()]);
        }

        if (id === 'popVendNotes') {
            $(el).prop("disabled", false);
        } else if (id.includes('Phone') || id.includes('Fax')) {
            $(el).html("<input type='tel' class='popVendPhoneInput' id='" + inp + "'>");
        } else if ($(el).hasClass('popVendDataSelect')) {
            $(el).html("<select class='itemAddSelect' id='" + inp + "'></select>");
            if (id.includes('State')) {
                fillStateSelect(inp);
            }
        } else if ($(el).hasClass('popTableCell3')) {
            $(el).html("<input type='text' class='itemAddWide' id='" + inp + "'>");
        } else {
            $(el).html("<input type='text' class='itemAddNarrow' id='" + inp + "'>");
        }

        //---- prepare for autoNumeric
        if ($(el).hasClass('popVendInt4')) {
            $(el).find('input').addClass('popVendAnInt4');
        } else if ($(el).hasClass('popVendDeci2_10')) {
            $(el).find('input').addClass('popVendAnDeci2_10');
        }
    });

    //----- apply autoNumeric
    $('.popVendAnInt4').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '9999', minimumValue: '0', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popVendAnDeci2_10').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '9999999.99', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });

    //---- apply intltel phone input
    $('.popVendPhoneInput').each(function (idx, el) {
        window.intlTelInput(el, {
            initialCountry: "us",
            separateDialCode: true,
            utilsScript: "js/utils.js",
            countrySearch: false,
            separateDialCode: false,
            allowPhonewords: false,
            strictMode: true
        });

        el.placeholder = "(555) 555-0123";
    });

    $(".popVendDataCell input").prop("autocomplete", "off");

    if (notNew) {
    console.log("Populating existing vendor data, vals:", vals);
        $.each(vals, function (idx, arr) {
            let txt = '#' + arr[0];

            if ($(txt).data("autonumeric") !== null && $(txt).data("autonumeric") !== undefined) {
                let nbr = arr[1].replace(/[$,]/g, '');
                $(txt).data("autonumeric").set(nbr);

            } else {
                $(txt).val(arr[1]);
            }
        });
    }

    $(".popDateLabel").hide();
    $(".popDataDate").hide();
    $(".popPopHide").show();
    $(".popEditButtonDiv").hide();
    $(".popButtonDiv").show();

    $("#Modal_popVend_close").html('&nbsp;');
    $("#Modal_popVend_close").on("click", null);
    $("#Modal_popVend_close").removeClass('close');

    $("#popVendTaxPriceTable input").prop('disabled', false);   
    $("#popVendTaxPriceTable select").prop('disabled', false);

    $(".popVendDataCell").css("border", "none");

    $("#popVendNotes").prop("disabled", false);

    $("#modalPopVend").attr("data-mode", "edit");
    $("#modalPopVend").show();

    if (notNew) {
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveVend('edit'); });
    } else {
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveVend('new'); });
    }

    $.spin('false');

    setTimeout(function () { $('#popVendCompanyInp').focus(); }, 25);
}

function popSaveVend(mode) {
    let vendnum = "";
    let index;
    let aData = [];

    if (mode === 'edit') {
        vendnum = $("#modalPopVend").data("vendnum");
        index   = $("#modalPopVend").data("index");
    }

    $(".popVendDataCell").children().each(function (idx, el) {
        let id   = $(el).prop("id");
        let val  = $(el).val();
        let tag  = $(el).prop("tagName").toUpperCase();
        let nn   = $(el).data("autonumeric");
        let val2 = "";
        let ns;
        const aV = ["N", "Y", "1"];

        if ($(el).hasClass("iti")) {
            return true; // skip the intl-tel-input div
        } else if (nn !== undefined) {
            val = nn.getNumber();
        } else if (id.includes("Char")) {
            return true;
        } else if (tag === 'LABEL' || tag === 'SPAN') {
            return true;
        }

        aData.push([id, val]);
    });

    $(".popVendPhoneInput").each(function(idx,el) {
        let phoneNum = $(el).val();
        aData.push([ $(el).prop("id"), formatPhoneNumber(phoneNum) ]);
    });

    aData.push([ "popVendNotes", $("#popVendNotes").val() ]);

    if (mode === 'edit') {
        console.log("popSaveItem calling itemEdit?, index =",index);
        console.log("vendor aData:", aData);

        $.post("vendEdit?", { "from": "LIST", "user": uid, "vendnum": vendnum, 
                              "data": JSON.stringify(aData)
                            }, function (reply) {
            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            let newObj = reply.vendObj;

            //---- update item in list data
            const editedVend = vendListData.data.find( vendor => vendor.vendnum === vendnum );

            editedVend.company     = newObj.company;
            editedVend.phone       = newObj.phone;
            editedVend.salesPerson = newObj.salesPerson;

            const sorting = jsVendListTable.grid.jsGrid("getSorting");
            jsVendListTable.grid.jsGrid("loadData");
            jsVendListTable.grid.jsGrid("sort", sorting);
        });

    } else {
        $.post("vendAdd?", { "from": "LIST", "user": uid, 
                             "data": JSON.stringify(aData)
                           }, function (reply) {
            let newObj;

            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            newObj = reply.vendObj

            //---- add item to list data
            vendListData.data.push(newObj);
            vendListData.data.sort( function(a,b) {
                let nameA = a.company.toUpperCase();
                let nameB = b.company.toUpperCase();           
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });

            const newIndex = vendListData.data.findIndex( vendor => vendor.vendnum === newObj.vendnum );
            const pageSize = $(".jsgrid-grid-body tr").length;
            const pageNumber = Math.floor(newIndex / pageSize) + 1;
            const sorting = jsVendListTable.grid.jsGrid("getSorting");

            //---- reload data and sort, then page to new vendor
            jsVendListTable.grid.jsGrid("loadData");
            jsVendListTable.grid.jsGrid("sort", sorting);
            jsVendListTable.grid.jsGrid("openPage", pageNumber);

        });
    }
    closePopVend();
}

function popEmpl(args) {
    let isNew = args === null;
    let index;
    let obj;
    let emplID;
    let userName;
console.log("In popEmpl, isNew:", isNew);
console.log("args:", args);

    $.spin('true');

    if (isNew) {
        index = 0;
        obj = null;
        emplID = "";
        userName = "";
    } else {
        index = args.itemIndex;
        obj = args.item;
        emplID = obj.id;
        userName = obj.userName;

        if ( (typeof emplID !== "string" || emplID.trim() === "") && (typeof userName !== "string" || userName.trim() === "") ) {
            $.spin('false');
            console.log("Invalid emplID and UserName, returning");
            return;
        }
        console.log("Starting popEmpl, index:", index, "emplID:", emplID);
        console.log("in popEmpl, emplID: |" + emplID + "|, name:", obj.name);
    }

    $.post("popEmpl?",
        { emplID: emplID, uid: uid, userName: userName, isNew: isNew ? 'Y' : 'N' },
        function (reply) {
            if (reply.result === 'fail') {
                vex.dialog.alert({
                    unsafeMessage: 'Error:<br><br>' + reply.msg, // unsafeMessage option allows html in text
                    className: 'vex-theme-wireframe' // Overwrites defaultOptions
                });
            } else {
                $("#popEmplTabs").tabs({
                    active: 0,
                    activate: function (event, ui) {
                        let tab = ui.newPanel.selector;
                        if (tab.includes("popEmplTimeClock")) {
                            $(".popEditButtonDiv").hide();
                            $(".popButtonDiv").hide();
                        } else if ($("#modalPopEmpl").attr("data-mode") === 'view') {
                            $(".popEditButtonDiv").show();
                        } else {
                            $(".popButtonDiv").show();
                        }
                    }
                });

                if (isNew) {
                    $("#popEmplTitle").html('Add New Employee');
                } else {
                    $("#popEmplTitle").html('Details: ' + obj.name + '&nbsp;(ID: ' + emplID + ')');

                    $.each(reply.cells, function (idx, val) {
                        $("#" + val[0]).html(val[1]);
                    });
                }
/*
                $.each(reply.timeClock, function(idx, arr) {
                    let row = '<tr class="popEmplTimeClockRow">' +
                              '<td class="popEmplTimeClockDateCell">' + arr[0] + '</td>' +
                              '<td class="popEmplTimeClockTimeCell">' + arr[1] + '</td>' +
                              '<td class="popEmplTimeClockInOutCell">' + arr[2] + '</td>' +
                              '</tr>';
                    $("#timeClockTableBody").append(row);
                });

                $("#timeClockExportBtn").off('click');
                $("#timeClockExportBtn").on('click', function() {
                    timeClockExport(obj.name, emplID);
                });
*/
                $(".popPopHide").hide();
                $(".popButtonDiv").hide();

                $("#Modal_popEmpl_close").html('&times;');
                $("#Modal_popEmpl_close").on("click", function () { closePopEmpl(); });
                $("#Modal_popEmpl_close").addClass('close');

                $(".popEditButtonDiv").show();

                $("#modalPopEmpl").attr("data-mode", "view");
                $("#modalPopEmpl").data("emplID", emplID);
                $("#modalPopEmpl").data("index", index);
                $("#modalPopEmpl").show();

                $( "#popEmplTabs" ).tabs( "option", "active", 0 );

/*
                let nWide = $("#popEmplNotes").width();
                let nHigh = $("#popEmplNotes").parent().parent().height() - 4;
                $("#popEmplNotes").css({ "max-width": nWide, "max-height": nHigh });
*/
                //----- adding new emplor, so go straight to add/edit
                if (isNew) {
                    addEditPopEmpl(null);
                } else {
                    $(".popGridNoShow").hide();
                    $("#modalPopEmpl").show();
                }
            }
        })
        .fail(function (xhr, status, error) {
            vex.dialog.alert({
                unsafeMessage: 'Error:<br><br>' + error + '<br>' + xhr.responseText, // unsafeMessage option allows html in text
                className: 'vex-theme-wireframe' // Overwrites defaultOptions
            });
        });

        $.spin('false');
}

function closePopEmpl() {
	$("#modalPopEmpl").hide();
	$("#modalPopEmplContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
    $("#modalPopEmpl").data("emplID", "");
    $("#modalPopEmplBody input").remove();
    $(".popEmplDataCell").css("border", "1px solid #097764");
    $("#popEmplNotes").prop("disabled", true);
}

function addEditPopEmpl(notNew) {
    let vals = [];

console.log("In addEditPopEmpl, notNew:", notNew);

    $.spin('true');

    $(".popGridNoShow").show();

    notNew = notNew !== null;

    $(".popEmplDataCell").each(function (idx, el) {
        let id = $(el).prop('id');
        let inp = id + "Inp";

        if ($(el).hasClass('popNoEdit')) {
            return; // continue to next iteration
        } else if (notNew) {
            if ($(el).hasClass('popGridDataDate')) {
                let dt = convertDateToSysFormat($(el).text());
                if (dt.includes("undefined")) {
                    dt = "";
                }
                vals.push([inp, dt]);
            } else if ($(el).hasClass('popGridCheckbox')) {
                let txt = $(el).text().trim().toUpperCase();
                let chk = txt[0] === 'Y' ? true : false;
                vals.push([inp, chk]);
            } else {
                vals.push([inp, $(el).text()]);
            }
        }

        if (id === 'popEmplNotes') {
            $(el).prop("disabled", false);
        } else if (id.includes('Phone') || id.includes('Fax')) {
            $(el).html("<input type='tel' class='popEmplPhoneInput' id='" + inp + "'>");
        } else if ($(el).hasClass('popGridCheckbox')) {
            $(el).html("<input type='checkbox' class='emplItemAddCheckbox' id='" + inp + "'><label for='" + inp + "'></label>");
        } else if ($(el).hasClass('popGridPassword')) {
            $(el).html("<input type='password' class='emplItemAddWide' id='" + inp + "'>");
        } else if ($(el).hasClass('popGridSingleInput')) {
            $(el).html("<input type='text' class='emplItemAddWide' id='" + inp + "'>");
        } else if ($(el).hasClass('popGridDataDate')) {
            $(el).html("<input type='date' class='emplItemAddNarrow' id='" + inp + "'>");
        } else if ($(el).hasClass('popEmplDataSelect')) {
            $(el).html("<select id='" + inp + "'></select>");
            if (id.includes('State')) {
                fillStateSelect(inp);
            }
        } else {
            $(el).html("<input type='text' class='emplItemAddNarrow' id='" + inp + "'>");
        }

        //---- prepare for autoNumeric
        if ($(el).hasClass('popEmplInt2')) {
            $(el).find('input').addClass('popEmplAnInt2');
        } else if ($(el).hasClass('popEmplDeci2_10')) {
            $(el).find('input').addClass('popEmplAnDeci2_10');
        }
    });

    //----- apply autoNumeric
    $('.popEmplAnInt2').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '99', minimumValue: '0', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });
    $('.popEmplAnDeci2_10').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '9999999.99', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C' });
        $(an).data("autonumeric", nn);
        nn.set("0");
    });

    //---- apply intltel phone input
    $('.popEmplPhoneInput').each(function (idx, el) {
        window.intlTelInput(el, {
            initialCountry: "us",
            separateDialCode: true,
            utilsScript: "js/utils.js",
            countrySearch: false,
            separateDialCode: false,
            allowPhonewords: false,
            strictMode: true
        });

        el.placeholder = "(555) 555-0123";  // override default placeholder
    });

    $(".popEmplDataCell input").prop("autocomplete", "off");

    $(".emplItemAddCheckbox").off('change');
    $(".emplItemAddCheckbox").on('change', function() {
        let lbl = $('label[for="' + $(this).prop('id') + '"]');
        lbl.text( $(this).prop('checked') ? ' Yes' : ' No' );
    });

    if (notNew) {
        console.log("Populating existing employee data, vals:", vals);
        $.each(vals, function (idx, arr) {
            let txt = '#' + arr[0];
            let type = $(txt).prop('type');

            if (type === 'checkbox') {
                $(txt).prop('checked', arr[1]);
                $('label[for="' + arr[0] + '"]').text(arr[1] ? ' Yes' : ' No');
            } else if ($(txt).data("autonumeric") !== null && $(txt).data("autonumeric") !== undefined) {
                let nbr = arr[1].replace(/[$,]/g, '');
                $(txt).data("autonumeric").set(nbr);
            } else {
                $(txt).val(arr[1]);
            }
        });
    } else {
        const inp = document.querySelector('#popEmplLevelInp');
        const an = AutoNumeric.getAutoNumericElement(inp);
        an.set("99");  // default level to 99 (lowest)

        $(".emplItemAddCheckbox").trigger('change');
        $("#popEmplNewPswdInp").prop('checked', true);
    }

    $(".emplItemAddCheckbox").off('change');
    $(".emplItemAddCheckbox").on('change', function() {
        let lbl = $('label[for="' + $(this).prop('id') + '"]');
        lbl.text( $(this).prop('checked') ? ' Yes' : ' No' );
    });
    $("#popEmplNewPswdInp").on('change', function() {
        if ($(this).is(':checked')) {
            $("#popEmplPasswordInp").prop('disabled', false);
            $("#popEmplPassword2Inp").prop('disabled', false);
            $("#popEmplPasswordInp").parent().prev().css('color', '#2889bd');
            $("#popEmplPassword2Inp").parent().prev().css('color', '#2889bd');
        } else {
            $("#popEmplPasswordInp").prop('disabled', true);
            $("#popEmplPassword2Inp").prop('disabled', true);
            $("#popEmplPasswordInp").parent().prev().css('color', 'darkgray');
            $("#popEmplPassword2Inp").parent().prev().css('color', 'darkgray');
        }
    });
    $("#popEmplNewPswdInp").trigger('change');

    $("#popEmplPassword2Inp").on('change', function() {
        //---- TODO: add password validation logic here
        if ($("#popEmplPasswordInp").val() !== $("#popEmplPassword2Inp").val()) {
            // passwords do not match
            $("#popEmplPassword2Inp").css('border', '1px solid red');
            $("#popEmplPassword2Inp").addClass('popEmplFocusedInput');
            $("#popEmplPswdHint").text("Passwords do not match.");
            setTimeout(function () { $('#popEmplPassword2Inp').focus(); }, 50);
        } else {
            $("#popEmplPassword2Inp").css('border', '');
            $("#popEmplPassword2Inp").removeClass('popEmplFocusedInput');
            $("#popEmplPswdHint").text("");
        }
    });

    $(".popDateLabel").hide();
    $(".popDataDate").hide();
    $(".popPopHide").show();
    $(".popEditButtonDiv").hide();
    $(".popButtonDiv").show();

    $("#Modal_popEmpl_close").html('&nbsp;');
    $("#Modal_popEmpl_close").on("click", null);
    $("#Modal_popEmpl_close").removeClass('close');

    $("#popEmplMiddleInp").attr('maxlength', '1');
    $("#popEmplUserIDInp").attr('maxlength', '6');
    $(".popEmplDataCell").css("border", "none");

    $("#modalPopEmpl").attr("data-mode", "edit");
    $("#modalPopEmpl").show();

    if (notNew) {
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveEmpl('edit'); });
    } else {
        $(".popSaveBtn").off('click');
        $(".popSaveBtn").on('click', function () { popSaveEmpl('new'); });
    }

    $.spin('false');

    setTimeout(function () { $('#popEmplUserIDInp').focus(); }, 25);
}

function popSaveEmpl(mode) {
    let emplID = $("#modalPopEmpl").data("emplID");
    let userName = $("#popEmplUserNameInp").val().trim();
    let index;
    let aData = [];

    if (mode === 'edit') {
        index = $("#modalPopEmpl").data("index");
    }

    $(".popEmplDataCell").children().each(function (idx, el) {
        let id   = $(el).prop("id");
        let val  = $(el).val();
        let tag  = $(el).prop("tagName").toUpperCase();
        let nn   = $(el).data("autonumeric");
        let type = $(el).prop("type");
        let val2 = "";
        let ns;
        const aV = ["N", "Y", "1"];

        if ($(el).hasClass("iti")) {
            return true; // skip the intl-tel-input div
        } else if (type === 'checkbox') {
            val = $(el).prop('checked');
        } else if (nn !== undefined) {
            val = nn.getNumber();
        } else if (id.includes("Char")) {
            return true;
        } else if (tag === 'LABEL' || tag === 'SPAN') {
            return true;
        }

        aData.push([id, val]);
    });

    $(".popEmplPhoneInput").each(function(idx,el) {
        let phoneNum = $(el).val();
        aData.push([ $(el).prop("id"), formatPhoneNumber(phoneNum) ]);
    });

    console.log("popSaveEmpl aData:", aData, "mode:", mode, "emplID:", emplID);

    //---- check for required fields
    if ($("#popEmplPasswordInp").val() !== $("#popEmplPassword2Inp").val()) {
        vexAlert("Passwords do not match.");
        setTimeout(function () { $('#popEmplPassword2Inp').focus(); }, 25);
        return;
    }
    if (userName === "") {
        vexAlert("User Name is required.");
        setTimeout(function () { $('#popEmplUserNameInp').focus(); }, 25);
        return;
    }
    if ($("#popEmplUserIDInp").val().trim() === "") {
        vexAlert("User ID is required.");
        setTimeout(function () { $('#popEmplUserIDInp').focus(); }, 25);
        return;
    }

    if (mode === 'edit') {
        console.log("popSaveItem calling itemEdit?, index =",index);

        $.post("emplEdit?", { "from": "LIST", "user": uid, "emplID": emplID, "userName": userName,
                              "data": JSON.stringify(aData)
                            }, function (reply) {
            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            let newObj = reply.emplObj;

            //---- update item in list data
            const editedEmpl = emplListData.data.find( employee => employee.id === emplID );

            editedEmpl.id         = newObj.id;
            editedEmpl.name       = newObj.name;
            editedEmpl.first_name = newObj.first_name;
            editedEmpl.last_name  = newObj.last_name;
            editedEmpl.initial    = newObj.initial;
            editedEmpl.email      = newObj.email;
            editedEmpl.phone      = newObj.phone;

            const sorting = jsEmplListTable.grid.jsGrid("getSorting");
            jsEmplListTable.grid.jsGrid("loadData");
            jsEmplListTable.grid.jsGrid("sort", sorting);
        });

    } else {
        $.post("emplAdd?", { "from": "LIST", "user": uid, "emplID": emplID, "userName": userName,
                             "data": JSON.stringify(aData)
                           }, function (reply) {
            let newObj;

            if (reply.result !== 'success') {
                vexAlert(reply.msg);
                return;
            }

            newObj = reply.emplObj

            //---- add item to list data
            emplListData.data.push(newObj);
            emplListData.data.sort( function(a,b) {
                let nameA = a.name.toUpperCase();
                let nameB = b.name.toUpperCase();           
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });

            const newIndex = emplListData.data.findIndex( employee => employee.id === newObj.id );
            const pageSize = $(".jsgrid-grid-body tr").length;
            const pageNumber = Math.floor(newIndex / pageSize) + 1;
            const sorting = jsEmplListTable.grid.jsGrid("getSorting");

            //---- reload data and sort, then page to new employee
            jsEmplListTable.grid.jsGrid("loadData");
            jsEmplListTable.grid.jsGrid("sort", sorting);
            jsEmplListTable.grid.jsGrid("openPage", pageNumber);

        });
    }
    closePopEmpl();
}

/*
function timeClockExport(employee, emplID) {
    let title = "Time Clock Export";
    let markup = "" +
        "<label for='startDate' class='smallListDialogLabel'>Start:</label>" +
        "<input type='date' class='smallListDialogDateInput' id='tcStartDate' name='startDate' />" +
        "<br><br>" +
        "<label for='endDate' class='smallListDialogLabel'>End:</label>" +
        "<input type='date' class='smallListDialogDateInput' id='tcEndDate' name='endDate' />" +
        "<br><br>" +
        "<fieldset class='smallListDialogFieldset'>" +
        "<legend class='smallListDialogLegend'>&nbsp;Export Scope&nbsp;</legend>" +
        "<input type='radio' class='smallListDialogRadio' id='timeClockSingle' name='exportScope' value='single' checked>" +
        "<label for='timeClockSingle' class='smallListDialogLabelRadio'>" + employee + " Only</label><br>" +
        "<input type='radio' class='smallListDialogRadio' id='timeClockAll' name='exportScope' value='all'>" +
        "<label for='timeClockAll' class='smallListDialogLabelRadio'>All Employees</label>" +
        "</fieldset>";

    $("#smallListDialogBody").html( markup );

    $(".smallListDialogInput").attr("autocomplete", "off");
    
    let smallListBox = $("#smallListDialog").dialog({
            autoOpen: false,
            height: 400,
            width: 400,
            position: { my: "center", at: "center", of: $('#modalSmallListBody') },
            modal: true,
            close: function() {
                $("#smallListDialog").dialog("destroy");
            },
            buttons: [
                {
                    id: "smallListSubmit",
                    text: "Export",
                    click: function (event) {
                        let startDate = $("#tcStartDate").val();
                        let endDate = $("#tcEndDate").val();
                        let exportScope = $("input[name='exportScope']:checked").val();
                        let obj = {"startDate": startDate, "endDate": endDate, "exportScope": exportScope, "emplID": emplID, "name": employee };
                            $.post("timeClockExport?", obj, function(reply) {
                                if (reply.result !== "success") {
                                    playBeep();
                                    $("<div id='smallListMsg'><p>Error!<br>" + reply.msg + "</p></div>").dialog({
                                        modal: true,
                                        position: { my: "center", at: "center", of: $("#modalSmallListBody") },
                                        close: function() {
                                            $("#smallListMsg").dialog("destroy");
                                        }
                                    });
                                } else {
                                    let aData = reply.data;
                                    let fileName = reply.fileName;
                                    exportToExcel(aData, fileName);
                                }
                            });

                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                },
                {
                    id: "smallListCancel",
                    text: "Cancel",
                    click: function () {
                        $("#smallListDialogBody").empty();
                        $(this).dialog("close");
                    }
                }]
        });

    $(".ui-dialog-title").text(title);

    //-------- LOAD DEFAULT DATES ---------
    // Create a new Date object for the current date and time
    let oneWeekAgo = new Date();
    // Subtract 8 days.
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 8);
    let isoString = oneWeekAgo.toISOString().split('T')[0];
    $("#tcStartDate").val(isoString);

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let isoString2 = yesterday.toISOString().split('T')[0];
    $("#tcEndDate").val(isoString2);

    smallListBox.dialog("open");

}
*/

function popDeleteItem() {
    let codeNbr = $("#modalPopItem").data("codeNbr");
    let index = $("#modalPopItem").data("index");
    let item = itemListData.data.find(obj => obj.code_num.trim() === codeNbr.trim());

    console.log("In popDeleteItem, codeNbr:", codeNbr, "index:", index);
    console.log("item before deletion:", item);

    vex.dialog.confirm({
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
                       svgAlert + '</svg><br>' +
                       'Are you sure you want to delete this item? ' +
                       'This action cannot be undone.',
        callback: function (value) {
            if (value) {
                // Your delete logic here
                console.log("Deleting item with codeNbr:", codeNbr, "and index:", index);

                // First post to server to delete item
                $.post("popDeleteItem", { codeNbr: codeNbr, user: uid }, function(reply) {
                    if (reply.result === "success") {
                        // Delete from itemListData.data using codeNbr lookup
                        const targetIndex = itemListData.data.findIndex(item => item.code_num === codeNbr);
                        if (targetIndex !== -1) {
                            itemListData.data.splice(targetIndex, 1);
                        }
                        
                        // Remove item from table using item object
                        $("#jsItemListTableDiv").jsGrid("deleteItem", item);

                        // find page for the deleted item
                        const pageSize = $(".jsgrid-grid-body tr").length;
                        const pageNumber = Math.floor(targetIndex / pageSize) + 1;
                        const sorting = jsItemListTable.grid.jsGrid("getSorting");

                        // reload data and sort, then page to deleted item
                        jsItemListTable.grid.jsGrid("loadData");
                        jsItemListTable.grid.jsGrid("sort", sorting);
                        jsItemListTable.grid.jsGrid("openPage", pageNumber);

                        closePopItem();
                    }
                });
            }
        }
    });
}

function popDeleteCust() {
    let custnum = $("#modalPopCust").data("custnum");
    let index = $("#modalPopCust").data("index");
    let customer = custListData.data.find(obj => obj.custnum.trim() === custnum.trim());

    console.log("In popDeleteCust, custnum:", custnum, "index:", index);
    console.log("customer before deletion:", customer);

    vex.dialog.confirm({ 
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
                       svgAlert + '</svg><br>' +
                       'Are you sure you want to delete this customer? ' +
                       'This action cannot be undone.',
        callback: function (value) {
            if (value) {
                // Your delete logic here
                console.log("Deleting customer with custnum:", custnum, "and index:", index);

                // First post to server to delete customer
                $.post("popDeleteCust", { custnum: custnum, user: uid }, function(reply) {
                    if (reply.result === "success") {
                        // Delete from custListData.data using custnum lookup
                        const targetIndex = custListData.data.findIndex(cust => cust.custnum === custnum);
                        if (targetIndex !== -1) {
                            custListData.data.splice(targetIndex, 1);
                        }
                        
                        // Remove customer from table using customer object
                        $("#jsCustListTableDiv").jsGrid("deleteItem", customer);

                        // find page for the deleted customer
                        const pageSize = $(".jsgrid-grid-body tr").length;
                        const pageNumber = Math.floor(targetIndex / pageSize) + 1;
                        const sorting = jsCustListTable.grid.jsGrid("getSorting");

                        // reload data and sort, then page to deleted customer
                        jsCustListTable.grid.jsGrid("loadData");
                        jsCustListTable.grid.jsGrid("sort", sorting);
                        jsCustListTable.grid.jsGrid("openPage", pageNumber);

                        closePopCust();
                    }
                });
            }
        }
    });
}

function popDeleteVend() {
    let vendnum = $("#modalPopVend").data("vendnum");
    let index = $("#modalPopVend").data("index");
    let vendor = vendListData.data.find(obj => obj.vendnum.trim() === vendnum.trim());

    vex.dialog.confirm({ 
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
                       svgAlert + '</svg><br>' +
                       'Are you sure you want to delete this vendor? ' +
                       'This action cannot be undone.',
        callback: function (value) {
            if (value) {
                // Your delete logic here
                console.log("Deleting vendor with vendnum:", vendnum, "and index:", index);

                // First post to server to delete vendor
                $.post("popDeleteVend", { vendnum: vendnum, user: uid }, function(reply) {
                    if (reply.result === "success") {
                        // Delete from vendListData.data using vendnum lookup
                        const targetIndex = vendListData.data.findIndex(vend => vend.vendnum === vendnum);
                        if (targetIndex !== -1) {
                            vendListData.data.splice(targetIndex, 1);
                        }
                        
                        // Remove vendor from table using vendor object
                        $("#jsVendListTableDiv").jsGrid("deleteItem", vendor);

                        // find page for the deleted vendor
                        const pageSize = $(".jsgrid-grid-body tr").length;
                        const pageNumber = Math.floor(targetIndex / pageSize) + 1;
                        const sorting = jsVendListTable.grid.jsGrid("getSorting");

                        // reload data and sort, then page to deleted vendor
                        jsVendListTable.grid.jsGrid("loadData");
                        jsVendListTable.grid.jsGrid("sort", sorting);
                        jsVendListTable.grid.jsGrid("openPage", pageNumber);

                        closePopVend();
                    }
                });
            }
        }
    });
}

function popDeleteEmpl() {
    let emplID = $("#modalPopEmpl").data("emplID");
    let index = $("#modalPopEmpl").data("index");

    vex.dialog.confirm({ 
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
                       svgAlert + '</svg><br>' +
                       'Are you sure you want to delete this employee? ' +
                       'This action cannot be undone.',
        callback: function (value) {
            if (value) {
                // Your delete logic here
                console.log("Deleting employee with emplID:", emplID, "and index:", index);

                // First post to server to delete employee
                $.post("popDeleteEmpl", { emplID: emplID, user: uid }, function(reply) {
                    if (reply.result === "success") {
                        // Delete from emplListData.data using emplID lookup
                        const targetIndex = emplListData.data.findIndex(empl => empl.emplID === emplID);
                        if (targetIndex !== -1) {
                            emplListData.data.splice(targetIndex, 1);
                        }
                        
                        // Remove employee from table using index
                        let row = $(".jsgrid-table tbody").find("tr").eq(index);
                        $("#jsEmplListTableDiv").jsGrid("deleteItem", row);

                        // find page for the deleted employee
                        const pageSize = $(".jsgrid-grid-body tr").length;
                        const pageNumber = Math.floor(targetIndex / pageSize) + 1;
                        const sorting = jsEmplListTable.grid.jsGrid("getSorting");

                        // reload data and sort, then page to deleted employee
                        jsEmplListTable.grid.jsGrid("loadData");
                        jsEmplListTable.grid.jsGrid("sort", sorting);
                        jsEmplListTable.grid.jsGrid("openPage", pageNumber);

                        closePopEmpl();
                    }
                });
            }
        }
    });
}

function convertDateToSysFormat(dateString) {
  // Split the input string into parts using the '-' delimiter
  const parts = dateString.split('/'); // parts will be ["mm", "dd", "yyyy"]
console.log("convertDate input:", dateString, "parts:", parts);

  // Rearrange the parts into the YYYY-MM-DD format
  const formattedDate = `${parts[2]}-${parts[0]}-${parts[1]}`;
console.log("convertDate output:", formattedDate);

  return formattedDate;
}

function formatPhoneNumber(phoneNumberString) {
  // Remove all non-digit characters
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return match[1] + '-' + match[2] + '-' + match[3];
  }
  return phoneNumberString; // Return original if it doesn't match
}

function popRemoteInv() {
    notAvailable();
    return;
}

function exportToExcel(data, fileName) {
    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data"); // "Data" is the sheet name

    // Write the workbook and trigger a file download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
