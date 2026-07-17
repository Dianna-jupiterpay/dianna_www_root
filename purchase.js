/*@preserve
|| ######################################################################## ||
|| # encorePOS 1.3.100.105                                                # ||
|| # purchase.js                                                          # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
@endpreserve*/

var cVersion = getVersionNumber(); //"1.2.300.135";

var wideSet = false;
var lineEditor;
var lineEditorVar;
var navButtons = [];
var navFocus = 0;
var poItems;
var poNumber = "";
var poFreight = 0;
var poNotes = "";
var poVendor = '0';
var totalBlock;
var poFinishOpts;
var poSaved = false;
var poOpenOrder = false;
var isReceive = false;
var rcvNumber = "";
var rcvInvoice = "";
var vendorPool = [];

var uid = getCookie("uid");
var sLevel = getCookie("sLevel");
var cSerNbr = getCookie("snbr");

var lEditing = false;
var currLine = 0;
var lPauseKeys = false;
var lMsgUp = false;

var noCache = false;
var itemListData;
var itemListTable;
var itemListFirstTime = true;
var vendListData;
var f5LastRow;
var refundLast;
var gBarDiscLast;
var globalFocusElement = "";

var itemMatch = false;
var matchCodeNum;

var ctxMenu;
var ctxMenuVisible = false;

var svgSearch;

var anTaxRates;  // array of autonumeric inputs on tax rate table in settings

// screen layout vars
var isMobile = false;
var hostOS;
var cusDivHeight;
var saleDivTop1;
var saleDivTop2;
var gBarTop1;
var gBarTop2;
var totalDivTop1;
var totalDivTop2;
var menuButtTop;

// buttons that toggle
var emptyPOBtns = "#exportBtn, #voidBtn, #noteBtn, #printBtn, #finishBtn, #freightBtn";
var activePOBtns = "#importBtn, #editPOBtn";

var	tooltipsShown = false;

// setup vars -- need to become dynamic
var stationID = 'EPOS';
var purchSet;

// multi-lingual stuff
var translator;
var languageVar = 'en';
var dict;

// scanner stuff
var listener;

// for pdf import
var totalPageCount;

//track whether valid close of purchase.html
var validClose = false;

function purchLoader() {
	init();
}

function init() {
    let cSID = getCookie('_SID');
    if (cSID===null || cSID===undefined || cSID==='') {
        window.location.replace("login.html");
        return;
    }

    //Detect Browser or Tab Close Events
    $(window).on('beforeunload', function (e) {
        var localStorageTime = localStorage.getItem('storagetime')
        if (localStorageTime != null && localStorageTime != undefined) {
            var currentTime = new Date().getTime(),
                timeDifference = currentTime - localStorageTime;

            if (timeDifference < 25) {
                //Browser Closed
                console.log('Browser Closed')
                localStorage.removeItem('storagetime')
            } else {
                //Browser Tab Closed
                console.log('Browser Tab Closed');
                localStorage.setItem('storagetime', new Date().getTime());
            }
            if (!validClose) {
				/*
                localStorage.setItem('uid', '');
                setCookie("_SID", '');
                setCookie("uid", '');
                setCookie("user", '');
                setCookie("userLast", '');
				*/
            }

        } else {
            localStorage.setItem('storagetime', new Date().getTime());
        }
	});

	// Attach the event keypress to exclude the F5 refresh
	$(document).on('keydown', function (e) {
		if (e.keyCode == 116) {
			validClose = true;
		}
	});

	if (cSerNbr === "8501809") {        
		console.log('uid: ' + typeof uid + ':"' + uid + '"');
		console.log('sLevel: ' + typeof sLevel + ':"' + sLevel + '"');
	}

	if (typeof (Storage) !== "undefined") {
		localStorage.setItem("uid", uid);
	} else {
		console.log("No Storage");
	};
	// end cookies

	if (uid === "" && sLevel === "") {
		window.location.replace("login.html");
	}

	loadItemListData();  // async call

	purchSetUp();

/****** BEGIN key listener setup ******
	let inp = document.getElementById('scanText');

	listener = new window.keypress.Listener(inp);

	let keyFuncs = [
	{   keys: "up",
        on_keyup: function() {
            return shortcutUp();
        }
    },
	{   keys: "down",
	    on_keyup: function() {
		    return shortcutDown();
	    }
    }];
	listener.register_many(keyFuncs);
/****** END key listener setup ******/

	dict = setDictionary();  // in ePosDict.js

// BEGIN jquery spinner extension
(function($) {
	$.extend({
	  spin: function(spin, opts) {
  
		if (opts === undefined) {
		  opts = {
			lines: 13, // The number of lines to draw
			length: 38, // The length of each line
			width: 17, // The line thickness
			radius: 45, // The radius of the inner circle
			scale: 1, // Scales overall size of the spinner
			corners: 1, // Corner roundness (0..1)
			color: '#ffffff', // CSS color or array of colors
			fadeColor: 'transparent', // CSS color or array of colors
			opacity: 0.25, // Opacity of the lines
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			speed: 1, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
		  };
		}

		var data = $('body').data();

		if (data.spinner) {
		  data.spinner.stop();
		  delete data.spinner;
		  $("#spinner_modal").remove();
		  return this;
		}
  
		if (spin) {
  
		  var spinElem = this;
  
		  $('body').append('<div id="spinner_modal" style="background-color: rgba(0, 0, 0, 0.3); width:100%; height:100%; position:fixed; top:0px; left:0px; z-index:' + (opts.zIndex - 1) + '"/>');
		  spinElem = $("#spinner_modal")[0];
  
		  data.spinner = new Spinner($.extend({
			color: $('body').css('color')
		  }, opts)).spin(spinElem);
		}
  
	  }
	});
})(jQuery);
// END jquery spinner extension

	$('#scanText').keypress(function (e) {
		let ignore_key_codes = [0];
// console.log( 'document keypress:',e.which, 'target:',$(e.target).parent().attr('id'));
        if ( $(e.target).parent().attr('id') === 'itemOrderForm' && $(e.target).is('input') ) {
	    } else if ($.inArray(e.which, ignore_key_codes) >= 0) {
			e.preventDefault();
		} else if (e.which == 13) { // the enter key code
			get_item(); // $('#barcGo').click();
			$('#scanText').val("");
			return false;
		};
	});
	
	//--- BEGIN retrieve stored data
	try {
		poItems      = JSON.parse(localStorage.getItem('poItems')) || { data: [] };
	} catch (err) {
		console.log( 'we caught a data load err poItems' );
        poItems      = { data: [] };
	}
	try {
		poVendor     = localStorage.getItem('poVendor') || '0';
	} catch (err) {
		console.log( 'we caught a data load err poVendor' );
		poVendor     = '';
	}
	try {
		poNumber     = localStorage.getItem('poNumber') || '';
	} catch (err) {
		console.log( 'we caught a data load err poNumber' );
		poNumber     = '';
	}
	try {
		poNotes      = localStorage.getItem('poNotes') || '';
	} catch (err) {
		console.log( 'we caught a data load err poNotes' );
		poNotes      = '';
	}
	try {
		poFreight    = parseFloat(localStorage.getItem('poFreight')) || 0;
	} catch (err) {
		console.log( 'we caught a data load err poFreight' );
		poFreight    = 0;
	}
	try {
		totalBlock   = JSON.parse(localStorage.getItem('totalBlock')) || { subTotal: 0, tax: 0, fee: 0, tip: 0, promo: 0, total: 0 };
	} catch (err) {
		console.log( 'we caught a data load err totalBlock' );
		totalBlock   = { subTotal: 0, tax: 0, fee: 0, tip: 0, promo: 0, total: 0 };
	}
	try {
		poFinishOpts = JSON.parse(localStorage.getItem('poFinishOpts')) || { 
			poPrint: true, 
			poExport: false, 
			poReceive: false, 
			remember: false, 
			rcvPrint: true, 
			rcvVari: false, 
			rcvPrices: false, 
			rcvLabels: false,
			rcvRemember: false
		};
	} catch (err) {
		console.log( 'we caught a data load err poFinishOpts' );
		poFinishOpts = { 
			poPrint: true, 
			poExport: false, 
			poReceive: false, 
			remember: false, 
			rcvPrint: true, 
			rcvVari: false, 
			rcvPrices: false, 
			rcvLabels: false,
			rcvRemember: false
		};
	}
	try {
		isReceive    = JSON.parse(localStorage.getItem('isReceive')) || false;
	} catch (err) {
		console.log( 'we caught a data load err isReceive' );
		isReceive    = false;
	}
	try {
		rcvNumber    = localStorage.getItem('rcvNumber') || '';
	} catch (err) {
		console.log( 'we caught a data load err rcvNumber' );
		rcvNumber    = '';
	}
	try {
		rcvInvoice   = localStorage.getItem('rcvInvoice') || '';
	} catch (err) {
		console.log( 'we caught a data load err rcvInvoice' );
		rcvInvoice   = '';
	}
	try {
		vendorPool   = JSON.parse(localStorage.getItem('vendorPool')) || [];
	} catch (err) {
		console.log( 'we caught a data load err vendorPool' );
		vendorPool   = [];
		localStorage.setItem('vendorPool', JSON.stringify(vendorPool));
	}
	//--- END retrieve stored data

	//----- define function to check if sale table is in overflow
	$.fn.overflownY=function(){
		var e=this[0];
		return e.scrollHeight>e.clientHeight;
	}

	ctxMenu = document.querySelector("#saleContextMenu");

	ctxMenu.addEventListener("click", e => {
		e.stopImmediatePropagation();
		if (ctxMenuVisible) toggleMenu("hide", ctxMenu);
	});

	$(document).on( "contextmenu", function(e) {
		e.preventDefault();
		return;
	});

    $("#purchTableBody").on( "contextmenu", "td", function(e){
		e.preventDefault();
		//return;  // goes away

		var idx    = $(this).index();
		var row    = $(this).parent()
		var rowNbr = $(this).parent().index();
		var color  = $(row).css('color');

//		console.log( "cell:", idx, "row:", row, "color:", color );
		if (color !== 'rgb(255, 0, 0)') {
			posContextMenu(rowNbr,idx,e);
		}
	});

	purchTableCellClick();

	//----  SHORTCUT KEY HANDLERS
	/*
	F1 = Help
	F2 = Exit
	F3 = Items
	F4 = Void
	F5 = Delete
	F6 = Edit
	F7 = Note
	F8 = Vendor List
	F9 = Finish
	F10 = Freight
	*/

	Mousetrap.bind("f1",function() { return false; } ); // keyLogger( 112 ); alert('f1 pressed'); });
	Mousetrap.bind("f2",function() { keyLogger( 113 ); $( "#logoutBtn" ).trigger( "click" ); } );
	Mousetrap.bind("f3",function() { keyLogger( 114 ); $( "#itemListBtn" ).trigger( "click" ); return false; } );
	
//	Mousetrap.bind("f4",function() { poVoid(); } );  // keyLogger( 115 ); poVoid(); } ); // $( "#voidBtn" ).trigger( "click" ); } );
    Mousetrap.bind('f4', function(e) { poVoid(); return false; });

	Mousetrap.bind("f5",function() { keyLogger( 116 ); $( "#deleteBtn" ).trigger( "click" ); return false; } );
	Mousetrap.bind("f6",function() { keyLogger( 117 ); $( "#editBtn" ).trigger( "click" ); return false; } );
	Mousetrap.bind("f7",function() { return false; } ); // keyLogger( 118 ); $( "#noteBtn" ).trigger( "click" ); } );
	Mousetrap.bind("f8",function() { return false; } ); // keyLogger( 119 ); $( "#vendListBtn" ).trigger( "click" ); } );

//	Mousetrap.bind("f9",function() { postOrder(); } );  // keyLogger( 120 ); postOrder(); } ); // $( "#finishBtn" ).trigger( "click" ); } );
    Mousetrap.bind('f9', function(e) { postOrder(); return false; });

	Mousetrap.bind("f10",function() { return false; } ); // keyLogger( 121 ); $( "#freightBtn" ).trigger( "click" ); } );
	//Mousetrap.bind("f12",function() { return false; } ); // keyLogger( 121 ); $( "#freightBtn" ).trigger( "click" ); } );
/*
	Mousetrap.bind("shift+f10", function() { atCase(); });
	Mousetrap.bind("alt+f9", function() { alert("Delivery"); } );
	Mousetrap.bind("alt+f10", function() { toggleNav(); } );

	Mousetrap.bind('alt+s', function() { searchInputFocus(); } );
	//Mousetrap.bind('alt+t', function () { tableFocus(); } );

	Mousetrap.bind('alt+a', function() { lookupSort( 'A' ); } );
	Mousetrap.bind('alt+b', function() { lookupSort( 'B' ); } );
	Mousetrap.bind('alt+c', function() { lookupSort( 'C' ); } );
	Mousetrap.bind('alt+d', function() { lookupSort( 'D' ); } );
	Mousetrap.bind('alt+i', function() { lookupSort( 'I' ); } );
	Mousetrap.bind('alt+l', function() { lookupSort( 'L' ); } );
	Mousetrap.bind('alt+m', function() { lookupSort( 'M' ); } );
	Mousetrap.bind('alt+n', function() { lookupSort( 'N' ); } );
	Mousetrap.bind('alt+o', function() { lookupSort( 'O' ); } );
	Mousetrap.bind('alt+p', function() { lookupSort( 'P' ); } );
	Mousetrap.bind('alt+r', function() { lookupSort( 'R' ); } );
	Mousetrap.bind('alt+u', function() { lookupSort( 'U' ); } );
	Mousetrap.bind('alt+y', function() { lookupSort( 'Y' ); } );
	Mousetrap.bind('alt+z', function() { lookupSort( 'Z' ); } );
*/
	Mousetrap.bind("esc", function() { escKeyFunc(); return false; } );

	Mousetrap.bind( "up", function() { shortcutUp(); return false; } );
	Mousetrap.bind( "down", function() { shortcutDown(); return false; }, );
	Mousetrap.bind( "left", function() { shortcutLeft(); return false; } );
	Mousetrap.bind( "right", function() { shortcutRight(); return false; } );

	//Mousetrap.bind( "right", function() { keyLogger( 39 ); openNav(); });
	//Mousetrap.bind( "left", function() { keyLogger( 37 ); closeNav(); });

	Mousetrap.bind('alt+pagedown', function() { altPageDown(); return false; } );
	Mousetrap.bind('alt+pageup', function() { altPageUp(); return false; } );
	
	if ($(document).width()>1280) {
		//$('#purchTableDiv').css({'width': 'calc(95% - 230px)'});
		//$('#customerDiv').css({'width': 'calc(40% - 200px)'});
		//$('#cashSale').css({'min-width': 'calc(40% - 200px)'});
//		openNav();
	}

    // Swipe to open sidenav
	$('#mySidenav','#menuButton').on('swiperight', function(e) { 
		openNav();
	});

	// Swipe to close sidenav
	$('#mySidenav','#menuButton').on('swipeleft', function(e) { 
		closeNav();
	});

	closeNav(true);

/*
	$('body').on('keypress',function (e) {
		console.log( 'event:',e );
		keyLogger( e.which );
		focusBarc(e.which);
	});
*/
/*
	let timer;
	let cLastIn = 0;
    let doingDL = false;
    let c2DDL   = '';
    const barcChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ #.`*+]'-\\";
	$('body').on('keydown', function (e) {
		//console.log('keydown:',e.which, e.key, e.metaKey, e.shiftKey, cLastIn, doingDL);
		if ($("#Modal_itemList").is(":visible") ||
			$("#Modal_custList").is(":visible") ||
			$("#ModalTender").is(":visible") ||
			$('#modalPopItem').is(":visible") ||
			lPauseKeys ) {
			return;
		}

		if (e.which===123) {
			e.preventDefault();
//			doCoupon("f12");
			return;
		}

		// keep going, clear timer
		if (doingDL && timer) clearTimeout(timer);

		if (!doingDL && cLastIn === 16 && e.which === 50) {
			doingDL = true;
			c2DDL = '@';
			$("#ModalID").show();

			// record break
		} else if (doingDL && e.which === 16 && (cLastIn === 40 || cLastIn === 13)) {
			c2DDL += "\n";

			// double <Enter> means done
		} else if ((doingDL && e.which === 13 && cLastIn === 13)) {
			doingDL = false;
			idScan(c2DDL);
			c2DDL = '';

			// some states don't use double <Enter>, set timer to finish
		} else if ((doingDL && e.which === 13)) {
			timer = setTimeout(function () {
				doingDL = false;
				idScan(c2DDL);
				c2DDL = '';
			},
				500);

		} else if (doingDL && e.key.length === 1) {
			//console.log( 'adding to c2DDL');
			c2DDL += e.key;

		} else if (doingDL && e.key.length > 1) {
			// nothing

		} else if (barcChars.includes(e.key)) {
			//console.log( 'focusBarc!', $("#scanText").val());
			cLastIn = e.which;
			$("#scanText").focus();
			return;
			//focusBarc(e.key);

		} else if (e.which === 13) {
			cLastIn = e.which;
			get_item();

		} else {
			cLastIn = e.which;
			$("#scanText").focus();

			return;
		}

		if (doingDL) cPriorIn = new Date().getTime();  // track time for last keystroke
		cLastIn = e.which;

		e.cancelBubble = true;
		e.returnValue = false;

		//e.stopPropagation works in Firefox.
		if (e.stopPropagation) {
			e.stopPropagation();
			e.preventDefault();
		}

	});
*/
	// Manage formatting of purchTableBody on resize event
	$(window).resize(function (e) {
		purchTableDivSize();
		paintCurrentLine();
		$('#purchTableBody').focus();// $('#scanText').focus();
	});

	setSvgVars();

	/* Item/Customer List Search Button */
	$(".listSearchImage").prepend(svgSearch);

	translator = $('body').translate({ lang: "en", t: dict }); //start with English

	document.addEventListener("visibilitychange", function () {
		if (document.visibilityState === 'visible') {
			if ( globalFocusElement.length > 0 ) {
				$(globalFocusElement).focus().select();
			} else {
			    closeNav();
				focusBarc();
			}
		}
	});
/*
    $( document ).ready(function() {
	    console.log( 'on ready, document height:',$(document).height() );
	});
*/
	$(document).on('hidden.ac.message', function() {
		f5LastRow = null;
		refundLast = null;
	    gBarDiscLast = null;
		messageRemove();
		$("#purchTableBody td").removeClass("groupEm");
	});
	
	$(document).on('shown.ac.message', function() {
		lMsgUp = true;
	});

	$("#headerCheckmark").prop("indeterminate", false);

	$("#purchTableBody").on('click', "td:nth-child(1)", function(e){
		e.stopPropagation();

		let line = $(this).parent()[0].sectionRowIndex;
		currLine = line + 1;
		paintCurrentLine();	
	
		setTimeout( function() {
			let checked = $("#purchTableBody td:nth-child(1) input:checked");
			let lShow = checked.length > 0;
			if (lShow) {
				let rowColor = $(checked).parentsUntil('tbody').last().find('td:eq(2)').css('color');
				if (rowColor === 'rgb(255, 0, 0)') {
					// showItemList(item);
					$("#gFuncSearch").show();
				} else {
					$("#gFuncSearch").hide();
				}
				$(".addItemBtn").hide();
				if (poItems.data[currLine-1].newItem && checked.length === 1) {
				    $('.matchFunc').show() }
				else {
					$('.matchFunc').hide() }
				$(".gFuncBar").css({"display": "block"})
				$("#headerCheckmark").prop("indeterminate", true);
		    } else {
				$("#headerCheckmark").prop("indeterminate", false);
				$(".gFuncBar").css({"display": "none"});
				$(".addItemBtn").show();
		    }
		}, 0 );
	});

	$("#purchTableHdr th:nth-child(1) input").on('change', function(e){
		var isCheck = $("#headerCheckmark").is(':checked');
		var isDunno = $("#headerCheckmark").prop("indeterminate");
		var nbrChecked = $("#purchTableBody td:nth-child(1) input:checked").length;

		e.stopPropagation();
		
		setTimeout( function() {
			if (poItems.data.length===0 || nbrChecked > 0) {
			    $("#purchTableBody td:nth-child(1) input").prop("checked",false);
				$("#headerCheckmark").prop("checked", false);
				$("#headerCheckmark").prop("indeterminate", false);
				$(".gFuncBar").css({"display": "none"});
				$(".addItemBtn").show();
			} else if (isCheck) {
				$("#purchTableBody td:nth-child(1) input").prop("checked",true);
				$(".addItemBtn").hide();
				$(".gFuncBar").css({"display": "block"})
		    } else {
			    $("#purchTableBody td:nth-child(1) input").prop("checked",false);
				$(".gFuncBar").css({"display": "none"});
				$(".addItemBtn").show();
			}
		}, 0);
	});

	// JQuery-UI tooltips
	$( function() {
		$( document ).tooltip({
		  disabled: false,
		  position: {
			my: "left+15 center",
			at: "center top",
			using: function( position, feedback ) {
			  $( this ).css( position );
			  $( "<div>" )
				.addClass( feedback.vertical )
				.addClass( feedback.horizontal )
				.appendTo( this );
			}
		  }
		});
		$('#itemChart').tooltip({
			position: {
				my: "right+15 center",
				at: "right top",
				using: function( position, feedback ) {
					$( this ).css( position );
					$( "<div>" )
					  .addClass( feedback.vertical )
					  .addClass( feedback.horizontal )
					  .appendTo( this );
				}
			}
		})
	});

/* BEGIN gFuncBar Button Actions */
	$(".trashFunc").on("click", function() {
		var aRows = [];
		$("#purchTableBody td:nth-child(1) input:checked").each( function(idx,val) {
			aRows.push( $(this).closest('tr').index() + 1 );
		});

//		console.log( "Deleting rows:",aRows.join() );

		$(".ui-tooltip").remove();
		$(".ui-helper-hidden-accessible div").remove();
		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#purchTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");
		$(".addItemBtn").show();

		purchTableDeleteRow( aRows );
	});

	$(".searchFunc").on("click", function() {
		var checked = $("#purchTableBody td:nth-child(1) input:checked");
		var item = $(checked).parentsUntil('tbody').last().find('td:eq(2)').text() +
		           ' @ $' + (checked).parentsUntil('tbody').last().find('td:eq(6)').text();
		var row  = $(checked).parentsUntil('tbody').last().find('td:eq(1)').text();
//		console.log( "item is:",item, ", row is:",row);

		$(".ui-tooltip").remove();
		$(".ui-helper-hidden-accessible div").remove();
		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#purchTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");
		$(".addItemBtn").show();

		currLine = row;

		showItemList( item );
	});
/*
	$(".returnFunc").on("click", function() {
		var aRows = [];
		$("#purchTableBody td:nth-child(1) input:checked").each( function(idx,val) {
			aRows.push( $(this).closest('tr').index() + 1 );
		});

//		console.log( "Returning rows:",aRows.join() );
//		console.log( "now aRows =", aRows );

		$(".ui-tooltip").remove();
		$(".ui-helper-hidden-accessible div").remove();
		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#purchTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");

		itemReturn( aRows );

	});
*/
	$(".editFunc").on("click", function() {
		var nRow = $("#purchTableBody td:nth-child(1) input:checked").closest('tr').index() + 1;

//		console.log( "Editing row:",nRow);

		$(".ui-tooltip").remove();
		$(".ui-helper-hidden-accessible div").remove();
		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#purchTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");
		$(".addItemBtn").show();

		f6Edit( nRow );

	});

	$(".discFunc").on("click", function() {
		var aRows = [];
		$("#purchTableBody td:nth-child(1) input:checked").each( function(idx,val) {
			aRows.push( $(this).closest('tr').index() + 1 );
		});

//		console.log( "Discounting rows:",aRows.join() );
//		console.log( "now aRows =", aRows );

		$(".ui-tooltip").remove();
		$(".ui-helper-hidden-accessible div").remove();
		gBarDisc( aRows );

	});

	$(".infoFunc").on("click", function() {
		var nRow = $("#purchTableBody td:nth-child(1) input:checked").first().closest('tr').index() + 1;

		$(".ui-tooltip").remove();
		$(".ui-helper-hidden-accessible div").remove();
		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#purchTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");
		$(".addItemBtn").show();

		currLine = nRow;
		paintCurrentLine();
		showPopItem();
	});

	$(".matchFunc").on("click", function() {
		var nRow = $("#purchTableBody td:nth-child(1) input:checked").first().closest('tr').index() + 1;

		$(".ui-tooltip").remove();
		$(".ui-helper-hidden-accessible div").remove();
		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#purchTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");
		$(".addItemBtn").show();

		currLine = nRow;
		paintCurrentLine();
		matchItem();
	});

	setgBarTitles();
    /* END gFuncBar Button Actions */

	//----- set mousedown to close side menu
	$('#purchTableBody, #scanText, #totalTableDiv, #customerDiv, #cashSale').on("mousedown", function() {
		    if ($('#mySidenav').attr('viewMe')==='true') closeNav();
	    }
	);

	
	// sort function buttons alphabetically...
	/*
	var $buttons = $("#func2 button");
	var lastButton = $buttons[$buttons.length-1];  // save "Back" button
	var $funcButtons = $buttons.slice(0, -1);  // don't sort "Back" button
    var sortedButtons = $funcButtons.sort(function (a, b) {
        var vA = $(a).text();
        var vB = $(b).text();
        return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
    });
	$("#func2").html( sortedButtons );
	$("#func2").append( lastButton );
	*/

	//---- select all on focus
	$("#itemOrderForm input[type=text]").focus(function () {
		var save_this = $(this);
		window.setTimeout(function () {
			save_this.select();
		}, 10);
	});

	$('input.deptTax' ).on( 'focus', function() { $(this).parent().siblings().css({'background-color': '#b3dcf1'})});
	$('input.deptTax' ).on( 'blur', function() { $(this).parent().siblings().css({'background-color': ''})});

	//---- numbers only
	new AutoNumeric('#itemOrderCaseQty', { decimalPlaces: 0 });
	new AutoNumeric('#itemOrderQtyPerCase', { decimalPlaces: 0 });
	new AutoNumeric('#itemOrderUnitQty', { decimalPlaces: 0 });
	new AutoNumeric('#itemOrderUnitCost', { decimalPlaces: 4 });
	new AutoNumeric('#itemOrderCaseCost', { decimalPlaces: 2 });
	new AutoNumeric('#itemOrderBroken', { decimalPlaces: 2 });
	new AutoNumeric('#itemOrderTotalCost', { decimalPlaces: 2 });
	new AutoNumeric.multiple('.newQtyInput', { decimalPlaces: 0 });
	new AutoNumeric.multiple('.newPriceInput', { decimalPlaces: 2 });
	new AutoNumeric.multiple('.newMarkUp', { decimalPlaces: 1 });
	new AutoNumeric('#newFlatTax', { decimalPlaces: 4 });

	//resizableGrid( purchTable );

	purchTableDivSize();

	$("#versionNbrDiv").text("v"+cVersion);

	getVendors('PO_vendorSelect');

	$.post( 'getImportTypes', function (reply) {
		if (reply.result === 'success') {
			$.each(reply.imports, function(idx, subArr){
				$("#importFormat").append($("<option>",{
					  value: subArr[0],
					  text: subArr[1]
				}));
			});
		}
	});


	$('#PO_vendorSelect').on('change', function () {
		let vendNbr = $('#PO_vendorSelect').val();

		poVendor = vendNbr;
		localStorage.setItem('poVendor', poVendor);

		$('#recallBtnDiv').hide();

		if (poItems.data.length === 0 && vendNbr !== '0') {
			$('#loadAllBtnDiv').show();
			$('#suggestBtn').prop('disabled', false);
			$('#voidBtn').prop('disabled', false);
			$.post('findSavedOrders?',
			    {
				    "vendnum": vendNbr
			    },
				function (reply) {
					if (reply.result === 'found') { $('#recallBtnDiv').show(); }
				}
			);
		} else if (vendNbr === '0') {
			$('#suggestBtn').prop('disabled', true);
			$('#recallBtnDiv').hide();
			$('#loadAllBtnDiv').hide();
		}
	});

	importVendors();

	$("#importFormat").change( function() {
		let format = $("#importFormat").val();
		if (format.substring(0,4) === 'pdf_') {
			$("#importFileInput").attr("accept",".pdf");
		} else {
			$("#importFileInput").attr("accept",".csv");
		}
	});

	$('#rcvPriceInput').on('keyup', function (e) {
		if (e.key === 'Enter' || e.keyCode === 13) {
			let idx = currLine-1
			let newPrice = parseFloat( $(this).val() ).toFixed(2);
			$('#rcvPriceInputSpan').hide();
			$('#rcvPriceText').text( newPrice );
			$('#rcvPriceText').show();
			postRcvEdit( 'price', idx, newPrice );
		} else if (e.key === 'Escape' || e.keyCode === 27) {
			$('#rcvPriceInputSpan').hide();
			$('#rcvPriceText').show();
		}
	});
	$('#rcvPriceInput').on('blur', function () {
			$('#rcvPriceInputSpan').hide();
			$('#rcvPriceText').show();
	});

	$('#rcvQtyCaseInput').on('keyup', function (e) {
		if (e.key === 'Enter' || e.keyCode === 13) {
			let idx = currLine-1;
			let newQtyCase = parseInt( $(this).val() ).toFixed(0);
			$('#rcvQtyCaseInputSpan').hide();
			$('#rcvQtyCaseText').text( newQtyCase );
			$('#rcvQtyCaseText').show();
			postRcvEdit( 'qty_case', idx, newQtyCase );
		} else if (e.key === 'Escape' || e.keyCode === 27) {
			$('#rcvQtyCaseInputSpan').hide();
			$('#rcvQtyCaseText').show();
		}
	});
	$('#rcvQtyCaseInput').on('blur', function () {
			$('#rcvQtyCaseInputSpan').hide();
			$('#rcvQtyCaseText').show();
	});

	$('#invoiceNbrInput').on('keyup', function (e) {
		if (e.key === 'Enter' || e.keyCode === 13) {
			rcvInvoice = $(this).val();
			localStorage.setItem('rcvInvoice', rcvInvoice);
		}
	});
	$('#invoiceNbrInput').on('blur', function () {
		rcvInvoice = $(this).val();
		localStorage.setItem('rcvInvoice', rcvInvoice);
	});

	$("#modalInfoClose").click(function () {
        closeModalInfo();
    });

	$('#importForm').on('submit', function(e) {
		e.preventDefault();
		poImportDo();
	});

	$("#importFileInput").on('change', function () {
		importFileButtonChanged();
	});

	$("#importFileDefine").click( function(e) {
		e.preventDefault();
		newImportFileType();
	});

	setSvgVars();

	$('#settingsMain').tabs();

	setTimeout( function() {
		$.spin(true);
		purchTableLoadData();
		updateTotalBox();
		$("#purchTableBody").scrollTop(0);
		currLine = 1;
		paintCurrentLine();

		if (isReceive) {
			switchToReceive();
		} else if (poItems.data.length > 0 &&
			typeof rcvInvoice === 'string' &&
			rcvInvoice !== '0' &&
			rcvInvoice !== '') {
				$('#invoiceNbrInput').val(rcvInvoice);
				$('#invoiceSpan').show()
		}
		if (!isReceive) {
			$('#receiveBtn').on('click', poReceive);
		}

		$.spin(false);
	}, 25 );

} // end of init function
///////////////////////////////////////////////////////////////////////////////////////////////
	
function importVendors() {
	$.post("getVendors()", "", function (data, status) {
		if (data.length > 0) {
			var aOpts = [];
			for (var i = 0; i < data.length; i++) {
				var label = data[i][0];
				var val = data[i][1];
				aOpts.push({ label: label, value: val });
			}
		}
		VirtualSelect.init({
			ele: '#importVendorSelect',
			multiple: true,
			search: false,
			disableSelectAll: true,
			optionsSelectedText: "vendors selected",
			optionSelectedText: "vendor selected",
			optionHeight: "25px",
			optionsCount: "20",
			options: aOpts
		});

		var observer = new MutationObserver(function (mutations) {
			if ($(".vscomp-dropbox-container").is(":visible")) {
				$(".vscomp-arrow").addClass('up');
			} else {
				$(".vscomp-arrow").removeClass('up');
			}
		});
		var target = document.querySelector('.vscomp-dropbox-container');
		observer.observe(target, {
			attributes: true
		});
	});
}

function scannerRead(e) {
	var cLastIn = 0;
	var doingDL = false;
	var c2DDL = '';
	const barcChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ #.`*+]'-\\";

			console.log('keydown:',e.which, e.key, e.metaKey, e.shiftKey, cLastIn, doingDL);
			if (cLastIn===16 && e.which===50) {
				console.log( 'doing dl' );
				doingDL = true;
				c2DDL = '@';
			} else if (doingDL && cLastIn===13 && e.which===13) {
				alert('dl: ' + c2DDL);
				doingDL = false;
				c2DDL = '';
				console.log( 'end DL, doingDL =', doingDL);
			} else if (doingDL && e.key.length === 1) {
				c2DDL += e.key;
			} else if (barcChars.includes(e.key)) {
				focusBarc(e.which);
			}
	
			cLastIn = e.which;
	
			e.cancelBubble = true;
			e.returnValue = false;
	
			//e.stopPropagation works in Firefox.
			if (e.stopPropagation) {
				e.stopPropagation();
				e.preventDefault();
			}	
}

/**
 * Load all data into purchTable or emptyRow if no data.
 */
function purchTableLoadData() {
	console.log('** purchTableLoadData **');
//	console.log('purchTableBody height:', $('#purchTableBody').height());

	$("#purchTableBody").empty();

	// reset header for no scrollbar (in case coming in from a void)
	$("#purchTableHdr tr").css({"padding-right": "0px"});

	if (poItems.data.length===0) {
		var nWide     =  $("#purchTableHdr tr").width();
		var emptyHTML = '<tr class="noDataRow" id="emptyRow"><td colspan="9" style="width: ' + 
						nWide + 'px">No Items in Order</td></tr>'
		$("#purchTableBody").html(emptyHTML);
		$("#purchTableHdrRow th:eq(0)").children().css("display", "none");

		$('#PO_orderNbr').text('Pending');

		$("#itemBtns").hide();
		$('#saveBtnDiv').hide();

		$(emptyPOBtns).prop("disabled", true);
		$(activePOBtns).prop("disabled", false);

		if( $('#PO_vendorSelect').val() === '0' ) {
			$('#suggestBtn').prop('disabled', true);
		} else {
			$('#suggestBtn').prop('disabled', false);
		}
		return;
	}

	$("#purchTableHdrRow th:eq(0)").children().css("display", "block");
	$("#itemBtns").css("display", "block");

	if (typeof poNumber === 'string' && poNumber !== '') {
		$('#PO_orderNbr').text( ((poNumber === 'undefined') ? 'n/a' : poNumber) );
	} else {
	}

	$.each( poItems.data, function(idx,item) {
		purchTableInsertRow(item, true);
		//console.log('>>>', idx, 'purchTableBody height:', $('#purchTableBody').height());
	});

	if ( poNotes !== '') {
		$('#noteBtnIcon').addClass( 'rainbow-text' );
		$('#noteBtn').attr('title', 'Has Notes');
	}

	fillInfoBox( poItems.data[1] );

/*
	if (poItems.data.length > 0) {
		purchTableAddItemRow();
	}
*/
	$('#purchTableBody tr').click( function() {
		currLine = parseInt( $(this).find('td').eq(1).text() );
//		console.log( 'currline now =', currLine );
		$('#purchTableBody tr td').removeClass('highlighted');
		$(this).find('td').addClass('highlighted');

		let nLine = parseInt(currLine,10);
		fillInfoBox(poItems.data[nLine-1]);

	});
}

function purchTableAddItemRow() {
	var rowText = '<tr><td><div class="cross"></div></td>';
	rowText += '<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>';
	rowText += '<td>&nbsp;</td></tr>';

	$("#purchTableBody").append( rowText );
}

/**
 * Add a row to the purchTable from a prepared item record.
 * @param {Object} item - The item record from poItems.data.
 * @param {Logical} lFromLoad - Flag for calling function.
 */
function purchTableInsertRow( item, lFromLoad ) {
	//console.log('** purchTableInsertRow **');

	let rowText =  '<tr><td>';
		rowText += '<label class="saleCheckContainer">&nbsp;<input type="checkbox">';
		rowText += '<span class="saleCheckmark"></span></label></td>';
	
	const cCost  = item.caseCost.toFixed(2);
	const uCost  = item.unitCost.toFixed(4);
	const total  = item.total.toFixed(2);

	rowText += '<td>' + item.rowId + '</td>'
	if (!item.itemNbr.replace(/\s/g, '').length) {
		rowText += '<td>' + item.item + '<span class="emptyItemNbr material-icons" onclick="getItemNbr(this)" title="No item number - click to add">priority_high&nbsp;</span></td>';
	} else {
		rowText += '<td>' + item.item + '</td>';
	}
	rowText += '<td>' + item.cases + '</td>';
	rowText += '<td>' + item.units + '</td>'
	rowText += '<td>' + cCost + '</td>';
	rowText += '<td>' + uCost + '</td>';
	rowText += '<td>' + total + '</td>';
	rowText += '</tr>';

	if ($("#purchTableBody tr").length===1 && $("#purchTableBody td").length===1) {
		$("#purchTableBody").empty();
		$("#purchTableHdrRow th:eq(0)").children().css("display", "block");
	}

	$("#purchTableBody").append( rowText );

	if (item.cases < 0 || item.units < 0) {
		$("#purchTableBody tr").last().find("td").addClass("refunded");
	} else if (item.newItem) {
		$("#purchTableBody tr").last().find("td").addClass("newItem");
	}

	if ($("#purchTableBody").overflownY()) {
		$("#purchTableHdr tr").css({"padding-right": "17px"});
		$("#purchTableBody").scrollTop( $("#purchTableBody").prop("scrollHeight") );
	} else {
		$("#purchTableHdr tr").css({"padding-right": "0px"});
	}

	$(emptyPOBtns).prop("disabled", false);
	$(activePOBtns).prop("disabled", true);
	$('#suggestBtn').prop('disabled', true);

	$('#loadAllBtnDiv').hide();
	$('#recallBtnDiv').hide();
	$("#itemBtns").show();
		
	if (!poSaved) { $('#saveBtnDiv').show(); }

	if (!lFromLoad) {
		fillInfoBox( item );
	}
}

/**
 * Delete a row or rows from the purchTable.
 * @param xRow - Either a number indicating row or an array of row numbers.
 */
function purchTableDeleteRow(xRow) {
	f5LastRow = []; // reset undo array

	if (typeof xRow === 'number') {
		var aR = [xRow];
	} else {
		var aR = xRow.slice(0);
		aR.sort((a, b) => b - a);  // sort to descending order so we delete from bottom -> up
	}

//	console.log( "delete aR = ", aR );

	$.each( aR, function(idx,nR) {
		let rowData = poItems.data[nR-1];

		//----- delete product row
		poItems.data.splice(nR-1, 1);

		$("#purchTableBody tr:nth-child(" + nR + ")").remove();

		f5LastRow.push( rowData );
		
	});

	if ($("#purchTableBody tr").length > 0) {
		purchTableRenumberData();
	} else {
		localStorage.setItem('poItems', JSON.stringify(poItems));
		purchTableLoadData();
	}


	if ($("#purchTableBody").overflownY()) {
		$("#purchTableHdr tr").css({"padding-right": "17px"});
	} else {
		$("#purchTableHdr tr").css({"padding-right": "0px"});
	}

	paintCurrentLine();
	updateTotalBox('delete');
	
	let qtyList = [];
	// 1st look for items that have qty_on_ord to adjust
	$.each( f5LastRow, function(idx,item) {
		if (item.fromLPOS) {
			let qty_on_ord = (item.cases * item.caseQty) + item.units;
			qtyList.push( [ item.code_num, qty_on_ord ] );
		}
	});

	if (qtyList.length > 0) {
		$.post( 'poDeleteRows?', { 'poNumber': poNumber, 'items': JSON.stringify( qtyList ) } );
	}

//	console.log("f5LastRow:",f5LastRow);
	var chtml = '<span class="messageText">' + dict.delUndone[languageVar] + '.</span><span class="messageClose" onclick="messageRemove();">&times;</span>';


	if (f5LastRow.length===1) {
		var f5html = '<span class="messageText">' + dict.Line[languageVar] + " " + aR[0] + " " + dict.delUndoSingle[languageVar] + ".</span>" + 
		             '<a role="button" href="#" onclick="f5UndoLast();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
	} else {
		var len = f5LastRow.length;
		var f5html = '<span class="messageText">' + len + " " + dict.delUndoMulti[languageVar] + ".</span>" + 
		             '<a role="button" href="#" onclick="f5UndoLast();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
	}

	if (poItems.data.length === 0 && isReceive) {
		vex.dialog.confirm({
			unsafeMessage: '<h3>Cancel Session?</h3>' + 
			    'No items remain. Cancel this session?',
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: 'Yes' }),
				$.extend({}, vex.dialog.buttons.NO, { text: 'No' })
			],
			afterOpen: function () {
				lPauseKeys = true;
				Mousetrap.unbind('esc')
				playNotify();
			},
			afterClose: function () {
				Mousetrap.bind('esc', function() {escKeyFunc();});
				lPauseKeys = false;
			},
			callback: function (value) {
				if (value) {
					actOnClear();
				}
			}
		});
	} else {
		$(document).message({content: f5html, html: true, expire: 8000});
	}

}

/**
 * Update a row or rows in the purchTable.
 * @param xRow - Either a row number or an array of row numbers.
 */
function purchTableUpdateRow(xRow) {
//	console.log('** purchTableUpdateRow **');
	var aR;

	if (typeof xRow === 'number') {
		aR = [xRow];
	} else if (typeof xRow === 'string') {
		aR = [Number(xRow)];
	} else {
		aR = xRow.slice(0);
	}

	$.each( aR, function(idx,nR) {
		let item   = poItems.data[nR-1];

		let cCost = item.caseCost.toFixed(2);
		let uCost = item.unitCost.toFixed(4);
		let total = item.total.toFixed(2);
			
		if (typeof item.disc == 'number') {
			var nDiscX = ( 100 - item.disc ) / 100;
			nPrice = ( nDiscX * item.price ).toFixed(2);
		}
	
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(4)").html(item.cases);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(5)").html(item.units);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(6)").html(cCost);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(7)").html(uCost);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(8)").html(total);
	});
}

function purchTableRenumberData() {
	$.each(poItems.data, function( idx, value ) {
		poItems.data[idx].rowId = (idx + 1).toString() + '.';
	});

	localStorage.setItem('poItems', JSON.stringify(poItems));

	$.each( poItems.data, function(idx,item) {
		$("#purchTableBody tr:nth-child(" + (idx+1) + ") td:nth-child(2)").html(item.rowId);
	});
}
	
function purchTableEditOrderRow(xRow) {
	var aR;

	if (typeof xRow === 'number') {
		aR = [xRow];
	} else if (typeof xRow === 'string') {
		aR = [Number(xRow)];
	} else {
		aR = xRow.slice(0);
	}

	$.each( aR, function(idx,nR) {
		var item   = poItems.data[nR-1];
		var xDisc  = (typeof item.disc !== 'number' || item.disc === 0) ? '' : item.disc.toFixed(2);
		var nTotal = item.total.toFixed(2);
		var nPrice = item.price.toFixed(2);
		var nDepo  = (typeof item.depo !== 'number' || item.depo === 0) ? '' : (item.depo>=10) ? item.depo.toFixed(2) : item.depo.toFixed(3);
		
		if (typeof item.disc == 'number') {
			var nDiscX = ( 100 - item.disc ) / 100;
			nPrice = ( nDiscX * item.price ).toFixed(2);
		}

		//----- this is for the order stuff
		if (item.code_num.trim().length > 0) {
			$("#purchTableBody tr:nth-child(" + nR + ")").css({"color": ""});
			//$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(1)").html("");
		}
	
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(3)").html(item.item);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(4)").html(item.pack);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(5)").html(item.qty);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(6)").html(xDisc);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(7)").html(nPrice);
		$("#purchTableBody tr:nth-child(" + nR + ") td:nth-child(8)").html(nTotal);
	});
}

function getVendors(cEl) {
	$.post("getVendors()", "", function (data, status) {
		if (data.length > 0) {
			var select = document.getElementById(cEl);
			aVends = data;
			for (var i = 0; i < data.length; i++) {
				var opt = data[i];
				var el = document.createElement("option");
				el.textContent = opt[0];
				el.value = opt[1];
				select.appendChild(el);
			};
			//---- set vendor
			$('#PO_vendorSelect').val(poVendor); //.change();
			console.log('set PO_vendorSelect to:', poVendor);

			if (poItems.data.length === 0) {
				$.post('findSavedOrders?',
					{
						"vendnum": poVendor
					},
					function (reply) {
						if (reply.result === 'found') { $('#recallBtnDiv').show(); }
					}
				);
			}

		};
	})
	.fail(function (xhr, ajaxOptions, thrownError) {
		swal("Oops...", "error getting vendors: " + thrownError, "error");
	});
}

// Return selected vendor
function getVendorSelected(cEl) {
//    var itypes = document.getElementById(cEl);
//    var result = itypes.options[itypes.selectedIndex].value;
	var result = $(cEl).val();
	console.log( "Vendors:", result );
    return result;
}

function toggleTips(lShow) {
	if (tooltipsShown || typeof lShow === 'boolean' && lShow === false) {
		$('[title]').mouseout();
		tooltipsShown = false;
	} else {
		$('[title]').mouseover();
		tooltipsShown = true;
	}
}

function get_item( cStr, mode ) {
	let vendor = $('#PO_vendorSelect').val();

	if (!cStr) { 
		cStr = $("#scanText").val().toUpperCase();
		mode = 'CODE';
	}

	closeNav();

	if (lMsgUp) messageRemove();

	cStr = cStr.replace(/\s+$/, '')
	if ( cStr === "" ) {
		return;
	} else {
		$("#scanText").val('');
	}

	$("#barcGo").disabled=true;
	
	$.post( "POgetItem?", 
	    { "code": cStr, "mode": mode, "vendor": vendor, "receiving": isReceive }, 
		function (item, status, xhr) {
			if (vendor==="0" && item.brand.indexOf('not found') > -1) {
				$(document).message({ content: 'Please select a vendor.', html: true, expire: 8000 });
			}else if (item.brand.indexOf('not found') > -1) {
				var s = "<span class='messageText'>Item code: " + item.code + " - " + item.brand + "</span><span class='messageClose' onclick='messageRemove();'>&times;</span>";
				$(document).message({ content: s, html: true, expire: 8000 });
	    	} else {
				showItemOrder( item );
			} 
		}
	)
    // Code to run if the request fails; the raw request and
    // status codes are passed to the function
    .fail(function( xhr, status, errorThrown ) {
		if ( xhr.responseText.includes('<p>') || xhr.responseText.includes('<br>') ) {
			var s= dict.scanError[languageVar] + "</br><br>" + xhr.responseText
			vexAlert(s);
		} else {
			var s= dict.scanError[languageVar] + " - " + xhr.responseText
			$(document).message({ content: s, html: true, expire: 8000 });
		}
		return;
    });

    $("#barcGo").disabled=false;

	$('#scanText').focus();

} // end of get_item

function poItemAdd( item ) {
	var lMatch = false;
	var lineData = {
		"rowId":      (poItems.data.length + 1).toString() + '.',
		"avgCost":    item.avgCost,
		"barcode":    item.barcode,
		"brand":      item.brand,
		"descrip":    item.descrip,
		"itemNbr":    item.itemNbr,
		"item":       item.brand.trim() + ( item.descrip.trim().length === 0 ? '' : ' ' ) + item.descrip.trim() + ( item.size.trim().length === 0 ? '' : ' ' ) + item.size.trim(),
		"size":       item.size,
		"cases":      item.cases,
		"units":      item.units,
		"caseCost":   item.unitCost * item.caseQty,
		"unitCost":   item.unitCost,
		"lastCost":   item.lastCost,
		"total":      ( item.cases * item.unitCost * item.caseQty ) + ( item.units * item.unitCost ),
		"taxRate":    item.taxRate,
		"ounces":     item.ounces,
		"code_num":   item.code_num,
		"caseQty":    item.caseQty,
		"isDeposit":  item.isDeposit,
		"depositAmt": item.depositAmt,
		"lastWeek":   item.lastWeek,
		"mtd":        item.mtd,
		"notes":      item.notes,
		"onHand":     item.onHand,
		"onOrder":    item.onOrder,
		"orderLot":   item.orderLot,
		"parQty":     item.parQty,
		"price":      item.price,
		"reordPt":    item.reordPt,
		"stdQty":     item.stdQty,
		"thisWeek":   item.thisWeek,
		"units":      item.units,
		"yrAgo":      item.yrAgo
	};

	if (isReceive) {
		lineData.fromLPOS = false;
		lineData.ordCases = lineData.cases;
		lineData.ordUnits = lineData.units;
	}

	$('td').each( function () {
		$(this).css('background-color', '');
	} );
/*
	//----- check for duplicates
		for (i = 0; i < poItems.data.length; i++) {
			if (poItems.data[i].barcode === item.barcode && poItems.data[i].pack === Number(item.pack)) {
				var nDiscX = ((100 - Number(poItems.data[i].disc)) / 100);
				poItems.data[i].qty = nQty + poItems.data[i].qty;
				poItems.data[i].total = Number((nDiscX * (poItems.data[i].qty * poItems.data[i].price)).toFixed(2));

				localStorage.setItem('poItems', JSON.stringify(poItems));

				purchTableUpdateRow( i+1 );

				chtml = '<span class="messageText">' + dict.groupEm[languageVar] + ' ' + (i+1) + '. </span><span class="messageClose" onclick="messageRemove();">&times;</span>';
 			    $(document).message({ content: chtml, html: true, expire: 3000 });
		
				$("#purchTableBody tr:nth-child(" + (i+1) + ") td:nth-child(5)").addClass( "groupEm");

				lMatch = true;
				break;
			}
		}
*/
	if (!lMatch) {
		poItems.data.push(lineData);
		localStorage.setItem('poItems', JSON.stringify(poItems));
		
		purchTableInsertRow( lineData );
		
		currLine = poItems.data.length;
		paintCurrentLine();
	}

	// playBeep();
	updateTotalBox();
	focusBarc();
}

function updateTotalBox(cFrom) {
	let sub = 0;
	let dep = 0;
	let tax = 0;
	let tot = 0;

	if (purchSet === null) { return; }

	poItems.data.forEach(function (item, idx) {
		let qty = item.units + ( item.cases * item.caseQty );
		sub += item.total;
		
		if ( purchSet.poDoDepos && item.isDeposit) {
			dep += qty * item.depositAmt;
		}

		if (item.tax) {
			tax += item.tax
		} else if ( purchSet.poDoTax ) {
			if ( purchSet.poTaxType === 'A' ) {
				tax += item.taxRate * qty * item.unitCost;
			} else {
				tax += item.taxRate * qty * item.ounces;
			}
		}
	});
	
	tot = sub + dep + tax + poFreight;

	$("#subTotal").text(numberWithCommas(sub.toFixed(2)));
	$("#depTotal").text(numberWithCommas(dep.toFixed(2)));
	$("#taxTotal").text(numberWithCommas(tax.toFixed(2)));
	$("#freightTotal").text(numberWithCommas(poFreight.toFixed(2)));
	$("#total").text(numberWithCommas(tot.toFixed(2)));

	toggleTips(false);

}
	
function doNothing(el) {
    alert( "function not completed" );
}

function poVoid() {
    if ( poItems.data.length > 0 && poNumber === '' ) {		
		vex.dialog.confirm({
			unsafeMessage: '<h3>' + dict.f4poTitle[languageVar] + '</h3>' + dict.f4poPrompt[languageVar],
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
			],
			afterOpen: function () {
				lPauseKeys = true;
				Mousetrap.unbind('esc')
				playNotify();
			},
			afterClose: function () {
				Mousetrap.bind('esc', function() {escKeyFunc();});
				lPauseKeys = false;
			},
			callback: function (value) {
				if (value) {
					actOnClear();
				}
			}
		} );
	} else if ( poItems.data.length > 0 ) {
		vex.dialog.confirm({
			unsafeMessage: '<h3>Void this order?</h3>' +
			            '<br>Please select an option for the order:',
			input: [
				'<div class="vex-custom-field-wrapper">',
				'<div class="poVoidPrompt vex-custom-input-wrapper">',
				'<input type="radio" id="poVoidSave" class="poVoidRadio" name="poVoidSave" value="save" checked />',
				'<label for="poVoidSave" class="poVoidLabel">Save this order to the list of Open Orders</label><br>',
				'<input type="radio" id="poVoidDelete" class="poVoidRadio" name="poVoidSave" value="trash" />',
				'<label for="poVoidDelete" class="poVoidLabel">Permanently delete and DO NOT save this order</label>',
				'</div>',
				'</div>'
			].join(''),
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
			],
			afterOpen: function () {
				pauseBodyKeypress();
	
				$('.vex-content').attr('id', 'poVoidBox');
				let width = $("#note").width();
				$("#note").css({ "max-width": width, "min-width": width });
				playNotify();
			},
			callback: function (data) {
				if (!data) {
					resetBodyKeypress();
					return;
				}
				resetBodyKeypress();

				let option = data.poVoidSave;
				if (option === 'save') {
					poPost(true);
					return;
				} else {
					let qtyList = [];
					// 1st look for items that have qty_on_ord to adjust
					$.each( poItems.data, function(idx,item) {
						if (item.fromLPOS) {
							let qty_on_ord = (item.cases * item.caseQty) + item.units;
							qtyList.push( [ item.code_num, qty_on_ord ] );
						}
					});

					$.post('poVoid?', {"poNumber": poNumber, "qtyList": JSON.stringify(qtyList)});
				}
				actOnClear();
			}
		});
	} else {
		actOnClear();
	}
}

function actOnClear() {
	isReceive  = false;
	poItems    = { data: [] };
	poNumber   = '';
	poFreight  = 0;
	poNotes    = '';
	poVendor   = '0';
	rcvNumber  = '';
	rcvInvoice = '';
	vendorPool = [];

	localStorage.setItem('isReceive', JSON.stringify(isReceive));
	localStorage.setItem('poItems', JSON.stringify(poItems));
	localStorage.setItem('poNumber', poNumber);
	localStorage.setItem('poFreight', poFreight);
	localStorage.setItem('poNotes', poNotes);
	localStorage.setItem('poVendor', poVendor);
	localStorage.setItem('rcvNumber', rcvNumber);
	localStorage.setItem('rcvInvoice', rcvInvoice);
	localStorage.setItem('vendorPool', JSON.stringify(vendorPool));

	poSaved = false;
	poOpenOrder = false;

	endReceive();
	
	fillInfoBox();

	$('#PO_vendorSelect').val('0');
	$('#PO_orderNbr').html('Pending');

	$(emptyPOBtns).prop("disabled", true);
	$(activePOBtns).prop("disabled", false);
	$('#suggestBtn').prop('disabled', true);
	$('#saveBtnDiv').hide();
	$('#recallBtnDiv').hide();
	$("#itemBtns").hide();

	//---- undo receive in case
	$('#receiveBtn').prop("disabled",false);
	$('#receiverSpan').hide();
	$('#invoiceSpan').hide();
	$('#receiveInfo').hide();
	$("#receiveModeDiv").hide();
	$('#invoiceNbrInput').val('');

	$('#statTable').show();

	$('#noteBtnIcon').removeClass( 'rainbow-text' );
	$('#noteBtn').attr( 'title', 'Notes' );

	purchTableLoadData();
	updateTotalBox();

	toggleTips(false);
}

/********************************************************************************************************
 * fill/clear item infoBox
 * @param {object} item - item object or if empty == clear display
 *******************************************************************************************************/
 function fillInfoBox( item ) {
	if (typeof item === 'undefined') {
		$('#itemName').html( '&nbsp;' );
		$('#itemName').html( '&nbsp;' );
		$('#onHand').html( '&nbsp;' );
		$('#qtyCase').html( '&nbsp;' );
		$('#onOrd').html( '&nbsp;' );
		$('#thisWeek').html( '&nbsp;' );
		$('#parQty').html( '&nbsp;' );
		$('#lastWeek').html( '&nbsp;' );
		$('#reordPt').html( '&nbsp;' );
		$('#mth2Date').html( '&nbsp;' );
		$('#yrAgo').html( '&nbsp;' );
		$('#suggQty').html( '&nbsp;' );

	} else {
		const suggested = suggestedQty( item );

		$('#itemName').html( item.brand + ' ' + item.descrip + ' ' + item.size );

		if (isReceive) {
			let arr = calcMargMark(item);

			$('#oldMargin').text( arr[0] );
			$('#newMargin').text( arr[1] );
			$('#oldMarkup').text( arr[2] );
			$('#newMarkup').text( arr[3] );
			
			$('#rcvStdQty').html( item.stdQty + '&nbsp;' + '@' + '&nbsp;' );
			$('#rcvPriceText').text( item.price );
			$('#rcvPriceText').attr( 'oldvalue', item.price );
			$('#rcvPriceInput').val( item.price );

			$('#rcvQtyCaseText').text( item.caseQty );
			$('#rcvQtyCaseText').attr( 'oldvalue', item.caseQty );
			$('#rcvQtyCaseInput').val( item.caseQty );

		} else {
			$('#onHand').html( item.onHand );
			$('#qtyCase').html( item.caseQty );
			$('#onOrd').html( item.onOrder );
			$('#thisWeek').html( item.thisWeek );
			$('#parQty').html( item.parQty );
			$('#lastWeek').html( item.lastWeek );
			$('#reordPt').html( item.reordPt );
			$('#mth2Date').html( item.mtd );
			$('#yrAgo').html( item.yrAgo );
			$('#suggQty').html( suggested );
		}
	}
}

function calcMargMark(item) {
	let arr     = [];
	let price   = parseFloat( item.price );
	let qty     = parseInt( item.stdQty );
	let oldCost = parseFloat( item.lastCost );
	let newCost = item.unitCost;

	let oldMarg, newMarg, oldMark, newMark;
	if (price === 0) {
		oldMarg = 0;
	} else {
	    oldMarg = ( ( price - ( qty * oldCost ) ) / price ) * 100;
	}
	if (price === 0) {
		newMarg = 0;
	} else {
	    newMarg = ( ( price - ( qty * newCost ) ) / price ) * 100;
	}
	if (oldCost === 0) {
		oldMark = 0;
	} else {
	    oldMark = ( ( price - ( qty * oldCost ) ) / oldCost ) * 100;
	}
	if (newCost === 0) {
		newMark = 0;
	} else {
	    newMark = ( ( price - ( qty * newCost ) ) / newCost ) * 100;
	}

	arr.push( oldMarg.toFixed(1) + '%' );
	arr.push( newMarg.toFixed(1) + '%' );
	arr.push( oldMark.toFixed(1) + '%' );
	arr.push( newMark.toFixed(1) + '%' );

	return arr;
}

function showItemList() {
	// 1st check if we have received list data... if not, wait
	if (!itemListData){
		$.spin('true');
		console.log('showItemList() waiting...');
		setTimeout( function() { $.spin('false'); showItemList(); }, 1000)
		return;
	}

	if ($("#itemListTableDiv").children().length > 0) {
		$("#Modal_itemList").show();
		itemListTable.grid.jsGrid("loadData");

		searchInputFocus();
			
		if (itemListFirstTime) {
		    setTimeout( function() { $("#itemListTableDiv .jsgrid-header-row th:eq(2)").trigger('click'); }, 150 ) // start off with brand sort
			itemListFirstTime = false;
		}

		lPauseKeys = true;
		return;
	}

	itemListTable = makeJSGridObject('item');

	lPauseKeys = true;

	f3Header();

	$("#itemListTableDiv .jsgrid-filter-row td").addClass("searchCell");
// restore later	$("#itemListTableDiv .jsgrid-filter-row").hide();

	$("#itemListTableDiv .jsgrid-load-panel, #itemListTableDiv .jsgrid-load-shader").css("z-index", "10000");

	searchInputFocus();

	if (itemListFirstTime) {
		setTimeout( function() { $("#itemListTableDiv .jsgrid-header-row th:eq(2)").trigger('click'); }, 150 ) // start off with brand sort
		itemListFirstTime = false;
	}
}

function closeItemList() {
	$("#itemListTableDiv input").val('');
	
	$("#Modal_itemList").hide();
	$("#itemListTitle span").text("Product List");
	itemListTable.grid.jsGrid("clearFilter")
	$("#barcGo").disabled=false;
	lPauseKeys = false;
	   
// restore later    updateTotalBox();
	focusBarc();
}

function matchItem() {
	const bran = poItems.data[currLine-1].item.substring(0,5);
	matchCodeNum = poItems.data[currLine-1].code_num;
	itemMatch = true;
	showItemList();
	$("#itemListTitle span").text("Product List - searching for: " + poItems.data[currLine-1].item);
	$("#itemListTableDiv .jsgrid-filter-row td:eq(2) input").val(bran);
	itemListTable.grid.jsGrid("search");
}

function updateMatchedItem( matchedItem ) {
	const codeNbr = matchedItem.code_num; // this is the item selected from F3
	const idx     = currLine - 1;
	const vendNbr = $('#PO_vendorSelect').val(); // poItems.data[idx].vendNbr;
	const itemNbr = poItems.data[idx].itemNbr;

	$.post( "poItemMatch?",
	    { codeNbr: codeNbr,
		  vendNbr: vendNbr,
		  itemNbr: itemNbr
	    },
		function(reply) {
			if (reply.brand === 'not found') {
				swal("Oops...", "Unable to effect match.", "error");
				return;
			}
			// replace record in poItems.data with reply.item
			poItems.data[idx].newItem = false;
			poItems.data[idx].code_num = codeNbr;
			poItems.data[idx].brand = reply.brand;
			poItems.data[idx].descrip = reply.descrip;
			poItems.data[idx].size = reply.size;
			poItems.data[idx].item = reply.item;
			poItems.data[idx].onHand = reply.onHand;
			poItems.data[idx].onOrder = reply.onOrder;
			poItems.data[idx].mtd = reply.mtd;
			poItems.data[idx].yrAgo = reply.yrAgo;
			poItems.data[idx].lastWeek = reply.lastWeek;
			poItems.data[idx].thisWeek = reply.thisWeek;
			poItems.data[idx].price = reply.price;
			poItems.data[idx].lastCost = reply.lastCost;
			poItems.data[idx].parQty = reply.parQty;
			poItems.data[idx].reordPt = reply.reordPt;

			localStorage.setItem('poItems', JSON.stringify(poItems));

			$("#purchTableBody tr:nth-child(" + currLine + ") td:nth-child(3)").html(reply.item);
			paintCurrentLine();
		}
	)
	.fail(function (xhr, status, error) {
		const txt = dict.errorMsg[languageVar] + '<br><br>' + error + '<br>' + xhr.responseText;
		vexAlert(txt);
	});
}

/**
 * Show customer pick list.
 * @param {string} caller - The function calling customer list.
 * @param {string} dlNbr - The driver license nbr scanned (if from scan).
 * @param {string} bDay - The birthdate scanned (if from scan).
 */
function showCustList(caller, dlNbr, bDay) {
	if (!caller) caller = 'f8';
	if (!dlNbr) dlNbr = '';
	if (!bDay) bDay = '';
	
	if ( $("#custListTableDiv").children().length > 0 ) {
//		console.log( "list already exists");
		custListTable.caller = caller;
		custListTable.dlNbr = dlNbr;
		custListTable.bDay = bDay;
		$("#Modal_custList").show();
		custListTable.grid.jsGrid("loadData");
	
		lPauseKeys = true;
		return;
	}

	custListTable = makeJSGridObject('customer');
	custListTable.caller = caller;
	custListTable.dlNbr = dlNbr;
	custListTable.bDay = bDay;

	lPauseKeys = true;

	f8Header();

	$("#custListTableDiv .jsgrid-filter-row td").addClass("searchCell");
	$("#custListTableDiv .jsgrid-filter-row").hide();

	$("#custListTableDiv .jsgrid-load-panel, #custListTableDiv .jsgrid-load-shader").css("z-index","10000");

	$("#custListTableDiv .jsgrid-header-row th:eq(1)").trigger('click');  // start off with name sort

}

function closeCustList() {
	$("#Modal_custList").hide();
	custListTable.grid.jsGrid("clearFilter");
	custListTable.grid.jsGrid("loadData");
	lPauseKeys = false;
	$('#scanText').val('');
}

function f3Header() {
/*
	$("#itemListTableDiv .jsgrid-header-row th:eq(0)").html(dict.f3Barcode[languageVar]);
	$("#itemListTableDiv .jsgrid-header-row th:eq(1)").html(dict.f3Brand[languageVar]);
	$("#itemListTableDiv .jsgrid-header-row th:eq(2)").html(dict.f3Descrip[languageVar]);
	$("#itemListTableDiv .jsgrid-header-row th:eq(3)").html(dict.f3Size[languageVar]);
	$("#itemListTableDiv .jsgrid-header-row th:eq(4)").html(dict.f3Type[languageVar]);
	$("#itemListTableDiv .jsgrid-header-row th:eq(5)").html(dict.f3Price[languageVar]);
*/
	$("#itemListTableDiv .jsgrid-header-row th:eq(0)").css("text-align", "left");
	$("#itemListTableDiv .jsgrid-header-row th:eq(1)").css("text-align", "left");
	$("#itemListTableDiv .jsgrid-header-row th:eq(2)").css("text-align", "left");
	$("#itemListTableDiv .jsgrid-header-row th:eq(3)").css("text-align", "left");
	$("#itemListTableDiv .jsgrid-header-row th:eq(4)").css("text-align", "left");
	$("#itemListTableDiv .jsgrid-header-row th:eq(5)").css("text-align", "left");
}

function f8Header() {
/*
	$("#custListTableDiv .jsgrid-header-row th:eq(0)").html(dict.f8Number[languageVar]);
	$("#custListTableDiv .jsgrid-header-row th:eq(1)").html(dict.f8Name[languageVar]);
	$("#custListTableDiv .jsgrid-header-row th:eq(2)").html(dict.f8Phone[languageVar]);
	$("#custListTableDiv .jsgrid-header-row th:eq(3)").html(dict.f8Purchases[languageVar]);
	$("#custListTableDiv .jsgrid-header-row th:eq(4)").html(dict.f8LastOrder[languageVar]);
	$("#custListTableDiv .jsgrid-header-row th:eq(5)").html(dict.f8CityST[languageVar]);
	$("#custListTableDiv .jsgrid-header-row th:eq(6)").html(dict.f8Zip[languageVar]);
*/
	$("#custListTableDiv .jsgrid-header-row th:eq(1)").css("text-align", "left");
	$("#custListTableDiv .jsgrid-header-row th:eq(2)").css("text-align", "left");
}

/**
 * Make itemList or custList using js-grid
 * @param {string} type - Either 'item' or 'customer'
 */
function makeJSGridObject( type ) {
	var obj;
	var db;
	var dataSource;
	var parent; 
	var pager;
	var pagerText;
	var gridDiv;
	var myGrid;
	var listFields;

	switch (type) {
			case 'item':
			dataSource = itemListData; //.data;
			parent = '#Modal_itemList';
			pager = '#itemListPager';
			pagerText = '{first} {prev} {next} {last}';
			gridDiv = '#itemListTableDiv';
			db = {
				loadData: function(filter) {
					return $.grep(this.items, function(item) {
						return (!filter.barcode || item.barcode.indexOf(filter.barcode.toUpperCase()) > -1)
							&& (!filter.brand || item.brand.indexOf(filter.brand.toUpperCase()) > -1)
							&& (!filter.code_num || item.code_num.indexOf(filter.code_num.toUpperCase()) > -1)
							&& (!filter.descrip || item.descrip.indexOf(filter.descrip.toUpperCase()) > -1)
							&& (!filter.size || item.size.indexOf(filter.size.toUpperCase()) > -1)
							&& (!filter.type || item.type.indexOf(filter.type.toUpperCase()) > -1)
					});
				},
				items: dataSource
			};
			listFields = [
				{ name: "code_num", type: "text", width: 75, align: "left", headerTemplate: function() {return 'SKU';} },
				{ name: "barcode", type: "text", width: 75, align: "left", headerTemplate: function() {return dict.f3Barcode[languageVar];} },
				{ name: "brand", type: "text", width: 125, align: "left", headerTemplate: function() {return dict.f3Brand[languageVar];} },
				{ name: "descrip", type: "text", width: 160, align: "left", headerTemplate: function() {return dict.f3Descrip[languageVar];} },
				{ name: "size", type: "text", width: 50, align: "left", headerTemplate: function() {return dict.f3Size[languageVar];} },
				{ name: "type", type: "text", width: 130, align: "left", headerTemplate: function() {return dict.f3Type[languageVar];} },
				{ name: "price", type: "number", width: 60, filtering: false,itemTemplate: function(value, item) { return value.toFixed(2).toString(); }, headerTemplate: function() {return dict.f3Price[languageVar];} },
				{ name: "typenum", type: "text", visible: false }
			];		
			break;

			case 'customer':
			dataSource = custListData.data;
			parent = '#Modal_custList';
			pager = '#custListPager';
			pagerText = '{first} {prev} {next} {last}';
			gridDiv = '#custListTableDiv';
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
				{ name: 'custnum', type: "text", width: 50, align: "right", headerTemplate: function() {return dict.f8Number[languageVar];} },
				{ name: 'name', type: "text", width: 200, align: "left", headerTemplate: function() {return dict.f8Name[languageVar];} },
				{ name: 'phone', type: "text", width: 75, align: "left", headerTemplate: function() {return dict.f8Phone[languageVar];} },
				{ name: 'purchases', type: "number", width: 50, filtering: false, headerTemplate: function() {return dict.f8Purchases[languageVar];} },
				{ name: 'lastOrder', type: "text", width: 75, align: "center", headerTemplate: function() {return dict.f8LastOrder[languageVar];} },
				{ name: 'citySt', type: "text", width: 100, align: "left", headerTemplate: function() {return dict.f8CityST[languageVar];} },
				{ name: 'zip', type: "text", width: 50, align: "left", headerTemplate: function() {return dict.f8Zip[languageVar];} }
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
//	console.log( 'totalPages:', obj.totalPages );

	myGrid = $(gridDiv).jsGrid({
		width: "100%",
		height: "calc(100% - 85px)",

        filtering: false,
        sorting: true,
        paging: true,
        autoload: true,
 
        pageSize: obj.rows,
		pageButtonCount: 5,
		pagerContainer: pager,
		pagerFormat: pagerText,
		pagePrevText: "<",
		pageNextText: ">",
		pageFirstText: "<<",
		pageLastText: ">>",
		pageNavigatorNextText: "&#8230;",
		pageNavigatorPrevText: "&#8230;",

		updateOnResize: true,
		
		controller: obj.db,

		onDataLoaded: function(grid,data) {
//			console.log( 'onDataLoaded table length:', $(gridDiv+" .jsgrid-grid-body tr").length );
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
//			console.log('onRefreshed rows:',$(".jsgrid-grid-body tr").length);
/*			
			$(gridDiv + " .jsgrid-cell").on("mouseenter", function () {
				$(gridDiv + " .jsgrid-grid-body tr:eq(" + obj.currLine + ") td").removeClass("highlighted");
				obj.currLine = $(this).parent().index();
				$(gridDiv + " .jsgrid-grid-body tr:eq(" + obj.currLine + ") td").addClass("highlighted");
			});
*/
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
 /*
			$("body").keypress( function(e) {
				e.stopPropagation();

				if (e.key===' ') { 
					console.log( 'space bar' );
					$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+")").trigger('click'); 
				}
			} );
*/		
		},

		rowClick: function(args) {
			args.event.stopPropagation();

			console.log('rowClick:', $(document.activeElement));
			console.log('rowClick args:', args);

			$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+") td").removeClass("highlighted");
			obj.currLine = args.itemIndex;
			$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+") td").addClass("highlighted");

//			console.log('item:'+args.item);       // data item

			if ($("#Modal_itemList").is(":visible")) {
				itemListPick( args.item );
			} else if ($("#Modal_custList").is(":visible")) {
				custListPick( args.item, obj.caller, obj.dlNbr, obj.bDay );
				obj.caller = '';
				obj.dlNbr  = '';
				obj.bDay   = '';
			}
		},
		
		onPageChanged: function( args ) {
			var lFiltered = false;

			obj.currentPage = args.pageIndex;
/* restore later
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
*/
		},
 
        fields: listFields
	});

	obj.grid = myGrid;

	return obj;
}

const loadItemListData = async () => {
	var d1 = new Date();

	$.post('getItemList?', function(reply) {
		itemListData = reply.data;
		//$.spin(false);
		var $focused = $(':focus');
//		console.log( 'focus is on:', $focused.prop('id'));
	});
/*
	if ('caches' in window) {
		// Has support!
		console.log('in loadItemListData(), cache API available');
	} else {
		// not supported
		noCache = true;
		console.log('in loadItemListData(), cache API *NOT* AVAILABLE!');
		return;
	}

	const cacheName = 'ePOS-Sales-cache'
	const url = 'getItemList?'

	const inCache = await caches.open(cacheName)
	const res = await inCache.add(url)

	var d2 = new Date();
	var nSecs = (d2-d1)/1000;
	console.log( 'Cache is saved.',nSecs,'seconds');

	const loadCache = await caches.open(cacheName)
	console.log('loadCache:',loadCache)

	const loadResponse = await loadCache.match(url)
	console.log( 'loadResponse:',loadResponse)

	const listData = await loadResponse.json() // parse JSON
	console.log('listData:',listData)

	itemListData = listData
	console.log( 'itemListData:',itemListData)
	
	$.spin(false);

	return listData
*/
}

const loadCustListData = async () => {
	var d1 = new Date();

	if ('caches' in window) {
		// Has support!
//		console.log('in loadCustListData(), cache API available');
	} else {
		// not supported
		noCache = true;
//		console.log('in loadCustListData(), cache API *NOT* AVAILABLE!');
		return;
	}

	const cacheName = 'ePOS-Sales-cache'
	const url = 'getCustListJS?'

	const inCache = await caches.open(cacheName)
	const res = await inCache.add(url)

	var d2 = new Date();
	var nSecs = (d2-d1)/1000;
//	console.log( 'Cache is saved.',nSecs,'seconds');

	const loadCache = await caches.open(cacheName)
//	console.log('loadCache:',loadCache)

	const loadResponse = await loadCache.match(url)
//	console.log( 'loadResponse:',loadResponse)

	const listData = await loadResponse.json() // parse JSON
//	console.log('listData:',listData)

	custListData = listData
//	console.log( 'custListData:',custListData)
	
	return listData
}

	const loadVendListData = async () => {
		var d1 = new Date();

		if ('caches' in window) {
			// Has support!
//			console.log('in loadvendListData(), cache API available');
		} else {
			// not supported
			noCache = true;
//			console.log('in loadvendListData(), cache API *NOT* AVAILABLE!');
			return;
		}

		const cacheName = 'ePOS-Sales-cache'
		const url = 'getVendListJS?'

		const inCache = await caches.open(cacheName)
		const res = await inCache.add(url)

		var d2 = new Date();
		var nSecs = (d2-d1)/1000;
//		console.log( 'Cache is saved.',nSecs,'seconds');

		const loadCache = await caches.open(cacheName)
//		console.log('loadCache:',loadCache)

		const loadResponse = await loadCache.match(url)
//		console.log( 'loadResponse:',loadResponse)

		const listData = await loadResponse.json() // parse JSON
//		console.log('listData:',listData)

		vendListData = listData
//		console.log( 'vendListData:',vendListData)
		
		return listData
	}

function buildItemListTable(cMode) {
	var aPageLen = [10, 20, 30, 50, 100];
	var nLen = localStorage.getItem("itemListLength");
	if (nLen === "undefined") {
		nLen = 10
	} else if ($.type(nLen) === 'string') {
		nLen = parseInt(nLen);
	};
	for (i = 0; i < aPageLen.length; i++) {
		if (aPageLen[i] >= nLen) {
			nLen = aPageLen[i];
			break;
		}
	};

	$("#itemListTableWrapper").show();
	$("#itemListTableWrapper").spin("modal");

	itemListDataTable = $('#itemListTable').DataTable({
		dom: 'ifrtlp',
		data: itemListData.data,
		lengthChange: true,
		lengthMenu: aPageLen,
		pageLength: nLen,
		/*
		scrollY:        "700px",
        scrollCollapse: true,
		paging:         false,
		*/
		keys: {
			columns: [0],
			keys: [ 32 /* SPACE */, 38 /* UP */, 40 /* DOWN */ ]
		},
		columns: [
			{ data: "barcode" },
			{ data: "brand" },
			{ data: "descrip" },
			{ data: "size" },
			{ data: "type" },
			{ data: "price" },
			{ data: "pack" },
			{ data: "typenum" },
			{ data: "code_num" }
		],
		columnDefs: [
			{ targets: [6, 7, 8], visible: false },
			{ type: 'num', targets: 5 },
			{ className: 'numericCol', targets: 5 }
		],
		select: false, /*{
			style: cMode
		},*/
		"deferRender": true,
		order: [[1, 'asc']],
		initComplete: function () {
			var cTxt = $('#itemListTable_info').text();
			cTxt = cTxt.substring(cTxt.indexOf(' of ') + 4);
			cTxt = cTxt.replace('entries', 'records');
			$('#itemListTable_info').text(cTxt);
			$("#itemListTable_filter label").prepend('(ALT+S)&nbsp;');
			$("#itemListTableWrapper").spin("modal");
		}
	});

	itemListDataTable.button(0).disable();

	itemListDataTable
		.on('search.dt', function () {
			var cTxt = $('#itemListTable_info').text();
			cTxt = cTxt.substring(cTxt.indexOf(' of ') + 4);
			cTxt = cTxt.replace('entries', 'records');
			$('#itemListTable_info').text(cTxt);
		})
		.on('length.dt', function (e, settings, len) {
			if (typeof (Storage) !== "undefined") {
				localStorage.setItem("itemListLength", len);
			}
		})
		.on('draw', function () {
			var findStr = itemListDataTable.search();
			if (findStr.length>0) {
				$("#itemListTableBody").unhighlight();
				$("#itemListTableBody").highlight(findStr);
			}
		})
		// Handle event when cell gains focus
		.on('key-focus.dt', function (e, datatable, cell) {
			// Select highlighted row
			//$(itemListDataTable.row(cell.index().row).node()).addClass('highlighted');
		})
		// Handle event when cell looses focus
		.on('key-blur.dt', function (e, datatable, cell) {
			// Deselect highlighted row
			//$(itemListDataTable.row(cell.index().row).node()).removeClass('highlighted');
		})
		// Handle key event that hasn't been handled by KeyTable
		.on('key.dt', function (e, datatable, key, cell, originalEvent) {
			// If ENTER key is pressed
			if (key === 32) {
				// Get highlighted row data
				$(itemListDataTable.row(cell.index().row).node()).dblclick();
			}
		});

	$('#itemListTable tbody').on('dblclick', 'tr', function () {
		var item = itemListDataTable.row(this).data();
		itemListPick( item );
	});
}

function itemListPick(item) {
	console.log("itemMatch:", itemMatch);

	if (itemMatch) {
		let inItem = poItems.data[currLine - 1].item;
		console.log("match item:", item);

		itemMatch = false;

		vex.dialog.confirm({
			unsafeMessage: '<h3>Confirm Match</h3>' +
				'<i>Match:</i><br>' + inItem + '<br><i>to:</i><br>' + 
				item.brand + ' ' + item.descrip + ' ' + item.size,
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: 'Match' }),
				$.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
			],
			afterOpen: function () {
				lPauseKeys = true;
				Mousetrap.unbind('esc')
				playNotify();
			},
			afterClose: function () {
				Mousetrap.bind('esc', function () { escKeyFunc(); });
				lPauseKeys = false;
			},
			callback: function (value) {
				if (value) {
					updateMatchedItem(item);
				}
			}
		});
	} else {
		get_item(item.code_num, 'list');
	}
	closeItemList();
}

function paintCurrentLine( nLine, fromNew ) {
	var direction = 'none';

	if (poItems.data.length === 0) {
		return;
	}

	if (!nLine) {
		if (currLine<1) { currLine=1 } else if (currLine > poItems.data.length) { currLine = poItems.data.length };
		nLine = currLine;
	} else {
		if ( nLine > currLine ) {
			direction = 'down';
		} else if ( currLine > nLine ) {
			direction = 'up'
		}
		currLine = nLine;
		//let elm = $('#purchTableBody tr:nth-child('+ nLine + ')');
		//elm.scrollIntoView(true);
	}

	// console.log( "paintCurrentLine:", nLine, "caller:", paintCurrentLine.caller );

	$('td').each( function () {
		$(this).css('background-color', '');
	} );

	$('#purchTableBody td').removeClass('highlighted groupEm');
	$('#purchTableBody tr:eq('+(nLine-1)+') td').addClass('highlighted'); //css('background-color', '#D5F5E3 !important');
	
//	elog('painting line:',poItems.data[nLine-1].rowId,'newItem:',poItems.data[nLine-1].newItem,'price:',poItems.data[nLine-1].price);
    
	if (!poItems.data[nLine-1].newItem) {
	    $('#purchTableBody tr:eq('+(nLine-1)+') td').removeClass("newItem");
	}

	if ( fromNew) {
		$('#purchTableBody tr:eq('+(nLine-1)+') td:nth-child(3)').text(poItems.data[nLine-1].item);
	}

	if ($("#purchTableBody").overflownY()) {
		var row = $("#purchTableBody tr:nth-child(" + nLine + ")")
		var rowTop = row.offset().top;
		var rowBottom = rowTop + row.height();
		var tableTop = $("#purchTableBody").offset().top
		var tableBottom = tableTop + $("#purchTableBody").height();
		var scrollPos = $("#purchTableBody").scrollTop();
		var maxScroll = $("#purchTableBody")[0].scrollHeight - $("#purchTableBody").height();

//      console.log( 'direction:', direction, 'rt:',rowTop, 'rb:', rowBottom, 'tt:', tableTop, 'tb', tableBottom, 'sp:', scrollPos, 'ms:', maxScroll );

		if ( direction === 'down' && rowBottom > tableBottom ) {
			$("#purchTableBody").scrollTop( Math.min( maxScroll, scrollPos + row.height() ) );
//			console.log( 'new sp dn:', $("#purchTableBody").scrollTop() );
		} else if ( direction === 'up' && rowTop < tableTop ) {
			$("#purchTableBody").scrollTop( scrollPos - ( tableTop - rowTop ) );
//			console.log( 'new sp up:', $("#purchTableBody").scrollTop() );
		}
	}

	fillInfoBox( poItems.data[ nLine-1 ] );

	//totalDivResize(true);
}

function paintRefundLine( nLine ) {
	if ( poItems.data[nLine-1].qty < 0 ) {
		$('#purchTableBody tr:nth-child('+(nLine)+')').find('td').css('color', 'red');
	} else {
		$('#purchTableBody tr:nth-child('+(nLine)+')').find('td').css('color', '#1f6b93');
	}
}

function focusBarc(key) {
	//console.log( "key =", key);
	if ( key && !key.toLowerCase() ) {
		return;
	}
}

function totalDivResize(down) {
	return;

	var high = 140;
	var highPx = high.toString() + 'px';

	if (!down && $('#totalExpanderObj').html().includes('up-arrow')) {
		$('#totalExpanderObj').html("<img src='/images/dn-arrow.png'>");
		$('#totalTableDiv').css( {height: highPx } );
		$('.taxTotalRow').hide();

        if ( pSet.doTax1 ) {
            $("#tax1Row").show();
        }
        if ( pSet.doTax2 ) {
            $("#tax2Row").show();
        }
        if ( pSet.doTax3 ) {
            $("#tax3Row").show();
        }
        if ( pSet.doFlatTax ) {
            $("#flatTaxRow").show();
        }
        if ( pSet.doVolTax ) {
            $("#volTaxRow").show();
        }

	} else {
		$('#totalExpanderObj').html("<img src='/images/up-arrow.png'>");
		$('#totalTableDiv').css( {height: '140px'} );
		$('.taxSubTotalRow').hide();
		$('.taxTotalRow').show();
	}
}

function checkHour(i) {
	return (i > 12) ? i-12 : i;
}

function checkMinutes(i) {
	return (i < 10) ? "0" + i : i;
}

function checkMeridian(i) {
	return (i > 11) ? 'PM' : 'AM';
}

function playBeep() {
	var audio = new Audio('/sounds/beep.mp3');
	audio.play();
}

function playBuzzer() {
	var audio = new Audio('/sounds/buzzer.mp3');
	audio.play();
}

function playNotify() {
	var audio = new Audio('/sounds/notify.wav');
	audio.play();
}

function playMagic() {
	var audio = new Audio('/sounds/sfx-magic.wav');
	audio.play();
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function currencyFormat(num,lSign) {
	var sign = lSign ? '$' : '';
	return sign + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function pad(str, max, chr) {
	str = str.toString();
	if (!chr) {
		chr=' ';
	}
	return str.length < max ? pad(chr + str, max) : str;
}

function toggleNav() {
//console.log( 'toggleNav:',$('#mySidenav').attr('viewMe'))	;

    if ($(document).width() > 1200) {
		return;
	}

	if ($('#mySidenav').attr('viewMe')==='true') {
		toggleSideMenu();
	} else {
		openNav();
	}
}

/* Set the width of the side navigation to 250px */
function openNav() {
	if ($("#Modal_itemList").is(":visible") || 
		$("#Modal_custList").is(":visible") || 
		$("#ModalTender").is(":visible")    ||
		$('#modalPopItem').is(":visible") ) {
		return;
	}

	//---- load array of function buttons shown	
	navButtons.length = 0;
	$('#func1').find("button").each(function (idx) {
		navButtons.push('#' + $(this).attr('id'));
	});

	$('#mySidenav').attr('viewMe', true);
    $('#mySidenav').css('left', '0px'); //'191px');
    $('#menuButton').css('left', '100px'); //'191px');
	$('#menuButton').click(closeNav);
	$('#menuButtonSpan').html('arrow_back');
	lPauseKeys = true;
	//setTimeout(function () { navFocus = 0; $( navButtons[navFocus] ).focus(); }, 0);
}

/* Set the width of the side navigation to 0 */
function closeNav(fromInit) {
	if (!fromInit) {
	    $('#scanText').focus();
	}

	if ( wideSet ||
		 $("#Modal_itemList").is(":visible") ||
		 $("#Modal_custList").is(":visible") ) {
	  return;
	}
	lPauseKeys = false;
	$('#mySidenav').attr('viewMe', false);
	$('#mySidenav').css('left', '-92px');
	$('#menuButton').css('left', '8px');
	$('#menuButton').click(openNav);
	$('#menuButtonSpan').html('more_vert');
	$('#scanText').focus();
}

function toggleSideMenu(nDiv) {
	if (!nDiv) {
		nDiv = 1;
		if( $("#func1").is(":visible") ) nDiv = 2;
	}
	if (nDiv===1) {
		$(".sidenav").css("transition","none");
		$("#menuButton").css("transition","none");
		$("#func2").hide();
		$("#func1").show();
		//---- load array of function buttons shown	
		navButtons.length = 0;
	    $('#func1').find("button").each(function (idx) {
		    navButtons.push('#' + $(this).attr('id'));
	    });
		//$('#mySidenav').css('width', '284px'); //'191px');
		//$('#menuButton').css('left', '284px'); //'191px');
		$(".sidenav").css("transition","0.2s");
		$("#menuButton").css("transition","0.2s");
	} else {
		$(".sidenav").css("transition","none");
		$("#menuButton").css("transition","none");
		//$('#mySidenav').css('width','284px');
		//$('#menuButton').css('left','284px');
		$("#func1").hide();
		$("#func2").show();
		//---- load array of function buttons shown	
		navButtons.length = 0;
	    $('#func2').find("button").each(function (idx) {
		    navButtons.push('#' + $(this).attr('id'));
	    });
		$(".sidenav").css("transition","0.2s");
		$("#menuButton").css("transition","0.2s");
	}
	//setTimeout(function () { navFocus = 0; $( navButtons[navFocus] ).focus(); }, 0);
}

function setSvgVars() {
    svgCheck   = ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M119.164,220.552L252.858,86.858C253.12,86.61 253.375,86.354 253.644,86.113C254.182,85.631 254.745,85.178 255.332,84.756C257.68,83.069 260.392,81.903 263.231,81.358C264.295,81.154 265.375,81.037 266.458,81.007C266.819,80.998 267.181,81.007 267.542,81.007C267.902,81.027 268.263,81.046 268.623,81.066C269.58,81.17 269.823,81.177 270.769,81.358C272.897,81.767 274.957,82.523 276.843,83.59C278.415,84.479 279.865,85.581 281.142,86.858C283.187,88.902 284.776,91.389 285.773,94.103C286.645,96.477 287.061,99.013 286.993,101.542C286.944,103.347 286.649,105.144 286.119,106.87C285.483,108.942 284.508,110.908 283.244,112.668C282.822,113.255 282.369,113.818 281.887,114.356C281.646,114.625 281.39,114.88 281.142,115.142L131.142,265.142L131.127,265.157C130.911,265.372 130.691,265.582 130.465,265.787C130.429,265.821 130.393,265.854 130.356,265.887L130.279,265.955L130.259,265.973L130.235,265.994C130.116,266.099 129.996,266.202 129.874,266.305L129.848,266.327L129.817,266.353L129.74,266.417L129.632,266.505L129.57,266.556L129.567,266.559L129.53,266.588L129.466,266.639L129.429,266.669L129.383,266.705L129.318,266.756L129.29,266.778C129.238,266.819 129.185,266.859 129.133,266.899L129.104,266.922L129.053,266.96L129,267L128.935,267.048L128.887,267.084L128.866,267.099C128.807,267.143 128.748,267.186 128.689,267.228L128.668,267.244L128.623,267.276L128.562,267.319L128.511,267.355L128.475,267.381L128.449,267.398L128.415,267.423L128.293,267.506L128.28,267.516L128.277,267.518C128.223,267.554 128.17,267.59 128.116,267.626L128.09,267.644L128.083,267.648L128.064,267.661L127.947,267.738L127.896,267.771L127.885,267.778L127.868,267.789L127.776,267.849L127.695,267.9L127.685,267.906L127.677,267.911C126.211,268.837 124.624,269.57 122.969,270.088L122.968,270.089L122.963,270.09L122.811,270.137L122.757,270.153L122.741,270.158L122.714,270.166L122.617,270.195L122.544,270.216L122.514,270.225L122.485,270.233L122.421,270.251L122.328,270.277L122.285,270.289L122.263,270.295L122.226,270.305L122.129,270.331L122.056,270.35L122.032,270.357L122.007,270.363L121.917,270.386L121.827,270.409L121.801,270.415L121.788,270.418L121.748,270.428L121.629,270.457L121.587,270.467L121.569,270.471L121.534,270.479L121.431,270.503L121.37,270.516L121.349,270.521L121.321,270.527L121.233,270.547L121.15,270.564L121.128,270.569L121.109,270.573L121.034,270.589L120.925,270.611L120.907,270.614L120.897,270.616L120.835,270.629L120.689,270.656L120.686,270.657L120.684,270.657C120.241,270.74 119.795,270.808 119.347,270.861L119.347,270.861L119.347,270.861L119.23,270.875L119.124,270.886L119.123,270.886L119.122,270.886C118.599,270.942 118.074,270.978 117.548,270.992L117.548,270.992L117.547,270.992L117.406,270.996L117.329,270.997L117.322,270.997L117.312,270.997L117.203,270.999L117.108,270.999L117.096,270.999L117.085,270.999L117,271L116.885,270.999L116.871,270.999L116.862,270.999L116.797,270.999L116.656,270.997L116.645,270.997L116.641,270.996C116.344,270.991 116.049,270.979 115.753,270.961L115.743,270.96L115.706,270.958L115.579,270.949L115.54,270.946L115.518,270.945L115.469,270.941L115.377,270.934L115.32,270.929L115.293,270.927L115.264,270.924L115.208,270.92L115.103,270.91L115.068,270.906L115.057,270.905C114.985,270.898 114.912,270.891 114.841,270.883L114.821,270.881L114.786,270.877L114.703,270.868L114.606,270.856L114.574,270.852L114.56,270.85C114.486,270.841 114.413,270.832 114.339,270.822L114.328,270.821L114.304,270.817L114.199,270.803L114.099,270.788L114.082,270.786L114.073,270.784C112.72,270.584 111.387,270.245 110.103,269.773C109.701,269.626 109.304,269.465 108.913,269.291L108.855,269.266L108.851,269.264L108.848,269.263L108.829,269.254C108.384,269.055 107.946,268.84 107.517,268.609C106.125,267.859 104.823,266.944 103.646,265.888L103.645,265.887L103.643,265.886L103.548,265.8L103.453,265.713L103.444,265.705L103.44,265.701C103.379,265.644 103.317,265.587 103.257,265.53L103.246,265.52L103.227,265.502L103.152,265.43L103.073,265.354L103.051,265.332L103.041,265.322C102.991,265.275 102.943,265.226 102.894,265.178L102.876,265.16L102.858,265.142L102.743,265.026L102.703,264.986L102.697,264.98C102.639,264.92 102.581,264.86 102.523,264.799L102.515,264.791L102.453,264.724L102.364,264.63L102.352,264.617L102.33,264.593L102.256,264.513L102.204,264.456L102.186,264.436L102.147,264.394L102.076,264.314L102.045,264.28L102.025,264.257L101.967,264.191L101.903,264.117L101.889,264.101L101.873,264.083C101.727,263.914 101.584,263.743 101.444,263.57C101.4,263.516 101.358,263.462 101.315,263.408C101.229,263.299 101.144,263.189 101.06,263.078L101,263L51,196.333C50.859,196.138 50.715,195.946 50.577,195.748C50.165,195.155 49.785,194.539 49.439,193.905C48.517,192.214 47.842,190.39 47.44,188.506C47.038,186.622 46.91,184.681 47.062,182.761C47.251,180.36 47.878,177.997 48.903,175.818C49.929,173.639 51.35,171.65 53.079,169.974C54.462,168.633 56.039,167.494 57.747,166.603C59.668,165.6 61.751,164.913 63.892,164.576C64.606,164.464 65.325,164.39 66.047,164.356C66.287,164.345 66.528,164.342 66.769,164.335C67.009,164.336 67.25,164.338 67.491,164.339C68.132,164.367 68.293,164.365 68.932,164.427C69.891,164.52 70.842,164.682 71.777,164.912C75.055,165.719 78.108,167.363 80.585,169.655C81.115,170.146 81.619,170.665 82.092,171.21C82.514,171.695 82.606,171.827 83,172.333L119.164,220.552Z" style=""></path></svg>';
    svgDelete  = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1" x="0px" y="0px"><g stroke="none" stroke-width="1" fill-rule="evenodd"><path d="M6.99569017,9 L7.91291186,28 L24.0871307,28 L25.0043524,9 L6.99569017,9 Z M6.99569017,7 L25.0043524,7 C26.1089219,7 27.0043524,7.8954305 27.0043524,9 C27.0043524,9.03215981 27.0035767,9.06431494 27.002026,9.09643734 L26.0848043,28.0964373 C26.0333512,29.1622753 25.1542099,30 24.0871307,30 L7.91291186,30 C6.84583264,30 5.96669139,29.1622753 5.91523825,28.0964373 L4.99801657,9.09643734 C4.94475569,7.99315268 5.79596816,7.05558727 6.89925283,7.00232639 C6.93137523,7.00077569 6.96353036,7 6.99569017,7 Z" fill-rule="nonzero"></path><path d="M10.0012477,14.0499376 C9.97366788,13.4983419 10.3984667,13.0288274 10.9500624,13.0012477 C11.5016581,12.9736679 11.9711726,13.3984667 11.9987523,13.9500624 L12.4987523,23.9500624 C12.5263321,24.5016581 12.1015333,24.9711726 11.5499376,24.9987523 C10.9983419,25.0263321 10.5288274,24.6015333 10.5012477,24.0499376 L10.0012477,14.0499376 Z" fill-rule="nonzero"></path><path d="M20.0012477,13.9500624 C20.0288274,13.3984667 20.4983419,12.9736679 21.0499376,13.0012477 C21.6015333,13.0288274 22.0263321,13.4983419 21.9987523,14.0499376 L21.4987523,24.0499376 C21.4711726,24.6015333 21.0016581,25.0263321 20.4500624,24.9987523 C19.8984667,24.9711726 19.4736679,24.5016581 19.5012477,23.9500624 L20.0012477,13.9500624 Z" fill-rule="nonzero"></path><path d="M17,24 C17,24.5522847 16.5522847,25 16,25 C15.4477153,25 15,24.5522847 15,24 L15,14 C15,13.4477153 15.4477153,13 16,13 C16.5522847,13 17,13.4477153 17,14 L17,24 Z" fill-rule="nonzero"></path><path d="M4,9 C3.44771525,9 3,8.55228475 3,8 C3,7.44771525 3.44771525,7 4,7 L28,7 C28.5522847,7 29,7.44771525 29,8 C29,8.55228475 28.5522847,9 28,9 L4,9 Z" fill-rule="nonzero"></path><path d="M18.3057458,5 L13.6942542,5 L13.3609208,7 L18.6390792,7 L18.3057458,5 Z M13.6942542,3 L18.3057458,3 C19.2834241,3 20.1178043,3.70682609 20.2785337,4.67120203 L21,9 L11,9 L11.7214663,4.67120203 C11.8821957,3.70682609 12.7165759,3 13.6942542,3 Z" fill-rule="nonzero"></path></g></svg>';
    svgEx      = '<svg id="svgEx" fill="#FF0000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M163.709,135.425L239.315,59.819C239.603,59.548 239.882,59.269 240.178,59.006C240.769,58.481 241.391,57.992 242.04,57.541C244.312,55.96 246.911,54.861 249.628,54.331C250.404,54.18 251.188,54.075 251.977,54.016C252.371,53.987 252.766,53.981 253.161,53.964C253.556,53.97 253.951,53.975 254.346,53.981C255.396,54.059 255.662,54.055 256.703,54.227C259.043,54.612 261.311,55.416 263.371,56.592C265.088,57.571 266.657,58.806 268.012,60.245C269.368,61.683 270.507,63.322 271.384,65.094C272.435,67.22 273.104,69.531 273.35,71.891C273.636,74.644 273.344,77.45 272.496,80.085C271.77,82.343 270.64,84.468 269.173,86.332C268.52,87.16 268.321,87.337 267.599,88.104L191.994,163.709L267.599,239.315C267.87,239.603 268.15,239.882 268.412,240.178C268.937,240.769 269.427,241.391 269.878,242.04C271.458,244.312 272.557,246.911 273.087,249.628C273.541,251.956 273.577,254.362 273.192,256.703C272.871,258.653 272.26,260.554 271.384,262.325C270.332,264.451 268.9,266.385 267.174,268.012C265.448,269.639 263.432,270.954 261.247,271.878C259.427,272.647 257.494,273.145 255.528,273.35C252.775,273.636 249.968,273.344 247.333,272.496C245.075,271.77 242.951,270.64 241.087,269.173C240.258,268.52 240.081,268.321 239.315,267.599L163.709,191.994L88.104,267.599C87.337,268.321 87.16,268.52 86.332,269.173C84.468,270.64 82.343,271.77 80.085,272.496C77.45,273.344 74.644,273.636 71.891,273.35C69.925,273.145 67.991,272.647 66.171,271.878C64.351,271.108 62.647,270.067 61.131,268.799C59.311,267.277 57.768,265.431 56.592,263.371C55.416,261.311 54.612,259.043 54.227,256.703C53.842,254.362 53.877,251.956 54.331,249.628C54.861,246.911 55.96,244.312 57.541,242.04C57.992,241.391 58.481,240.769 59.006,240.178C59.269,239.882 59.548,239.603 59.819,239.315L135.425,163.709L59.819,88.104C59.548,87.816 59.269,87.536 59.006,87.241C58.481,86.65 57.992,86.028 57.541,85.379C56.187,83.432 55.184,81.244 54.593,78.947C54.1,77.033 53.893,75.047 53.981,73.073C54.087,70.703 54.617,68.356 55.541,66.171C56.619,63.622 58.23,61.305 60.245,59.406C61.683,58.051 63.322,56.911 65.094,56.035C67.22,54.983 69.531,54.315 71.891,54.069C72.939,53.96 73.205,53.979 74.258,53.964C74.653,53.981 75.047,53.999 75.442,54.016C75.835,54.057 76.229,54.087 76.621,54.139C77.405,54.244 78.181,54.396 78.947,54.593C81.244,55.184 83.432,56.187 85.379,57.541C86.028,57.992 86.65,58.481 87.241,59.006C87.536,59.269 87.816,59.548 88.104,59.819L163.709,135.425Z" style=""></path></svg>';
    svgEx2     = ' fill="#FF0000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M163.709,135.425L239.315,59.819C239.603,59.548 239.882,59.269 240.178,59.006C240.769,58.481 241.391,57.992 242.04,57.541C244.312,55.96 246.911,54.861 249.628,54.331C250.404,54.18 251.188,54.075 251.977,54.016C252.371,53.987 252.766,53.981 253.161,53.964C253.556,53.97 253.951,53.975 254.346,53.981C255.396,54.059 255.662,54.055 256.703,54.227C259.043,54.612 261.311,55.416 263.371,56.592C265.088,57.571 266.657,58.806 268.012,60.245C269.368,61.683 270.507,63.322 271.384,65.094C272.435,67.22 273.104,69.531 273.35,71.891C273.636,74.644 273.344,77.45 272.496,80.085C271.77,82.343 270.64,84.468 269.173,86.332C268.52,87.16 268.321,87.337 267.599,88.104L191.994,163.709L267.599,239.315C267.87,239.603 268.15,239.882 268.412,240.178C268.937,240.769 269.427,241.391 269.878,242.04C271.458,244.312 272.557,246.911 273.087,249.628C273.541,251.956 273.577,254.362 273.192,256.703C272.871,258.653 272.26,260.554 271.384,262.325C270.332,264.451 268.9,266.385 267.174,268.012C265.448,269.639 263.432,270.954 261.247,271.878C259.427,272.647 257.494,273.145 255.528,273.35C252.775,273.636 249.968,273.344 247.333,272.496C245.075,271.77 242.951,270.64 241.087,269.173C240.258,268.52 240.081,268.321 239.315,267.599L163.709,191.994L88.104,267.599C87.337,268.321 87.16,268.52 86.332,269.173C84.468,270.64 82.343,271.77 80.085,272.496C77.45,273.344 74.644,273.636 71.891,273.35C69.925,273.145 67.991,272.647 66.171,271.878C64.351,271.108 62.647,270.067 61.131,268.799C59.311,267.277 57.768,265.431 56.592,263.371C55.416,261.311 54.612,259.043 54.227,256.703C53.842,254.362 53.877,251.956 54.331,249.628C54.861,246.911 55.96,244.312 57.541,242.04C57.992,241.391 58.481,240.769 59.006,240.178C59.269,239.882 59.548,239.603 59.819,239.315L135.425,163.709L59.819,88.104C59.548,87.816 59.269,87.536 59.006,87.241C58.481,86.65 57.992,86.028 57.541,85.379C56.187,83.432 55.184,81.244 54.593,78.947C54.1,77.033 53.893,75.047 53.981,73.073C54.087,70.703 54.617,68.356 55.541,66.171C56.619,63.622 58.23,61.305 60.245,59.406C61.683,58.051 63.322,56.911 65.094,56.035C67.22,54.983 69.531,54.315 71.891,54.069C72.939,53.96 73.205,53.979 74.258,53.964C74.653,53.981 75.047,53.999 75.442,54.016C75.835,54.057 76.229,54.087 76.621,54.139C77.405,54.244 78.181,54.396 78.947,54.593C81.244,55.184 83.432,56.187 85.379,57.541C86.028,57.992 86.65,58.481 87.241,59.006C87.536,59.269 87.816,59.548 88.104,59.819L163.709,135.425Z" style=""></path></svg>';
	svgSearch  = '<svg height="24" width="24" fill="#fff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M68.961,63.421c5.13-6.358,7.918-14.218,7.918-22.481C76.879,21.123,60.757,5,40.94,5C21.122,5,5,21.123,5,40.94  c0,19.81,16.122,35.931,35.94,35.931c8.389,0,16.335-2.859,22.746-8.122L89.4,94.699l5.324-5.27L68.961,63.421z M40.94,73.126  c-17.754,0-32.193-14.438-32.193-32.186c0-17.754,14.439-32.192,32.193-32.192c17.746,0,32.193,14.438,32.193,32.192  C73.133,58.688,58.686,73.126,40.94,73.126z"></path></svg>';
	svgSale    = '<svg height="22" width="22" fill="#2e8584" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 100" x="0px" y="0px"><path d="M60.86,57.5c0-2.3,1.38-4.31,3-4.31s3,2,3,4.31-1.38,4.31-3,4.31S60.86,59.8,60.86,57.5ZM36.19,46.81c1.57,0,3-2,3-4.31s-1.38-4.31-3-4.31-3,2-3,4.31S34.62,46.81,36.19,46.81ZM5,45.28l1.81-1.59a6.14,6.14,0,0,0,1.61-7l-.93-2.23a6.14,6.14,0,0,1,4-8.28l2.33-.65A6.14,6.14,0,0,0,18.27,20l.13-2.41a6.14,6.14,0,0,1,6.12-5.81,6.21,6.21,0,0,1,1.09.1l2.38.43a6.14,6.14,0,0,0,6.46-3.09L35.6,7.06a6.13,6.13,0,0,1,9-2l2,1.41a6.14,6.14,0,0,0,7.16,0l2-1.4a6.14,6.14,0,0,1,9,2.07l1.15,2.12a6.14,6.14,0,0,0,5.4,3.22,6.07,6.07,0,0,0,1-.09L74.6,12a6.22,6.22,0,0,1,1.06-.09,6.14,6.14,0,0,1,6.12,5.85l.11,2.41a6.14,6.14,0,0,0,4.45,5.61l2.32.66a6.14,6.14,0,0,1,4,8.3l-.94,2.22a6.14,6.14,0,0,0,1.58,7l1.8,1.6a6.14,6.14,0,0,1,0,9.2l-1.81,1.59a6.14,6.14,0,0,0-1.61,7l.93,2.23a6.14,6.14,0,0,1-4,8.28l-2.33.65A6.14,6.14,0,0,0,81.73,80l-.13,2.41a6.14,6.14,0,0,1-6.12,5.81,6.21,6.21,0,0,1-1.09-.1L72,87.74a6.13,6.13,0,0,0-6.46,3.09L64.4,92.94a6.13,6.13,0,0,1-9,2l-2-1.41a6.14,6.14,0,0,0-7.16,0l-2,1.4a6.13,6.13,0,0,1-9-2.07l-1.15-2.12a6.14,6.14,0,0,0-6.44-3.13L25.4,88a6.22,6.22,0,0,1-1.06.09,6.14,6.14,0,0,1-6.12-5.85l-.12-2.41a6.14,6.14,0,0,0-4.45-5.61l-2.32-.66a6.14,6.14,0,0,1-4-8.3l.94-2.22a6.14,6.14,0,0,0-1.58-7l-1.8-1.6A6.14,6.14,0,0,1,5,45.28ZM54.49,57.5c0,5.89,4.18,10.69,9.32,10.69s9.32-4.79,9.32-10.69S69,46.81,63.81,46.81,54.49,51.61,54.49,57.5ZM38,64.93A3.19,3.19,0,1,0,43.54,68L62,35.07A3.19,3.19,0,1,0,56.46,32ZM26.86,42.5c0,5.89,4.18,10.69,9.32,10.69s9.32-4.79,9.32-10.69-4.18-10.69-9.32-10.69S26.86,36.61,26.86,42.5Z"></path></svg>';
	svgDollar  = ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M50,10c-22.1,0-40,17.9-40,40s17.9,40,40,40s40-17.9,40-40S72.1,10,50,10z M52.8,45.2c4,1.8,6.8,3.5,8.5,5.5  c1.9,2.1,2.8,4.7,2.8,7.7c0,2.9-1,5.5-3.1,7.8c-1.6,1.8-4,3.1-6.2,4v6.5h-9.6v-6.1c-2.8-0.6-5.9-1.8-8.3-3.6l-1.5-1.2l4.5-8l2.1,1.7  c2,1.6,4.4,2.4,7.3,2.4c1.7,0,3-0.4,3.9-1.1c0.8-0.6,1.1-1.3,1.1-2.2c0-2.1-3.3-3.8-5.3-4.6c-7.9-3.4-12-7.6-12-12.6  c0-3,0.9-5.5,2.9-7.7c1.5-1.7,3.8-2.9,5.8-3.6v-6.6h9.6v6.4c2,0.5,4.5,1.4,6.8,2.6l2.1,1.2l-5.1,8.4l-2-1.7  c-1.4-1.2-3.5-1.9-6.2-1.9c-1.4,0-2.4,0.3-3.2,0.9c-0.6,0.4-0.9,0.9-0.9,1.7C46.9,40.9,47,42.6,52.8,45.2z"></path></svg>'
}

function F5Delete(nRow) {
	if (poItems.data.length === 0) {
		return;
	}
	if (!nRow) {
		nRow = currLine;
	}
	var index = nRow - 1;
	var rowData = poItems.data[index];

	vex.dialog.confirm({
		unsafeMessage: '<h3>' + dict.f5Title[languageVar] + '</h3>'+ dict.f5Prompt[languageVar] + ' ' + nRow + ' ?',
		className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
		afterOpen: function () {
			pauseBodyKeypress();
			$('.vex-content').draggable();
	    },
		callback: function (value) {
			if (value) {
				purchTableDeleteRow( nRow );
			}
			resetBodyKeypress();

		}
	})
}

function f5UndoLast() {
	messageRemove();

	if (!f5LastRow) return;

	$.each( f5LastRow, function(idx, item) {
		var index = Number(item.rowId) - 1;
		poItems.data.splice(index, 0, item);
	});

	localStorage.setItem("poItems", JSON.stringify(poItems));

	purchTableRenumberData();
	purchTableLoadData();
	paintCurrentLine();
	updateTotalBox();

	var chtml = '<span class="messageText">' + dict.delUndone[languageVar] + '.</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
	$(document).message({ content: chtml, html: true, expire: 3000 });

}

/**
  * detects click on editable cells on sales screen
  */
 function purchTableCellClick() {
	$('#purchTableBody').one('dblclick', 'td:nth-child(n+4):nth-child(-n+9)', function (e) {
		e.stopPropagation();
//		console.log('cell clicked');
		lPauseKeys = true;
		shortcutToggleFKeys('off');
		var cell = $(this);
		var idx = $(this).index();
		var row = $(this).parents('tr').index();
		paintCurrentLine(row+1);
		purchTableCellEdit(cell, idx, row);
	});
}

/**
  * Sets up clicked cell with input for editing content.
  * @param {Object} cell The cell being edited.
  * @param {Number} idx  The index of the cell.
  * @param {Number} row  The index of the parent row.
  */
function purchTableCellEdit(cell, idx, row) {
	var wide = cell.width() - 4; // allow for border
	var wide2 = wide - 4
	var html = cell.html();
	var input;
	
	if (idx === 4 || idx === 5) {
		input = $('<input type="text" class="integerOnly" id="clickEdit" style="max-width: ' + wide + 'px" />');
	} else {
		input = $('<input type="text" class="deciNumberOnly" id="clickEdit" style="max-width: ' + wide + 'px" />');
	}

	if (html.indexOf('input') > -1) {
		console.log( "! Input already exists !" );
		return;
	}

	console.log( 'cellEdit row:', row, 'cell:', idx );

	//	paintCurrentLine( row + 1 );

	input.val(html);
	cell.css({ padding: '0px' }); //'4px 5px 4px 3px' });
	cell.html(input);
	switch (idx) {

		case 3:
		case 4:
			new AutoNumeric('#clickEdit', { decimalPlaces: 0, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false });
			break;

		case 5:
		case 7:
			new AutoNumeric('#clickEdit', { decimalPlaces: 2, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false });
			break;

		case 6:
			new AutoNumeric('#clickEdit', { decimalPlaces: 4, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false });
	}

	$('input[type="text"].integerOnly').keydown(function (e) {
		elog('keydown:', e.which);
		if (e.which === 13 || e.which === 9 || e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) {
			e.preventDefault();
			purchTableCellEditSave($(this), idx, row, e.which, e.shiftKey);
		} else if (e.which === 27) {
			purchTableCellClose();
		}
	});

	$('input[type="text"].deciNumberOnly').keydown(function (e) {
		if (e.which === 13 || e.which === 9 || e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) {
			e.preventDefault();
			purchTableCellEditSave($(this), idx, row, e.which, e.shiftKey);
		} else if (e.which === 27) {
			purchTableCellClose();
		}
	});

	input.on('focus', function () {
		var save_this = $(this);
		window.setTimeout(function () {
			save_this.select();
		}, 10);
	});

	input.on('blur', function () {
		purchTableCellEditSave($(this), idx, row);
	})

	input.focus();
}

function purchTableCellEditSave(input, idx, row, key, lShift) {
	//let newVal = input.val();
	let editInp = AutoNumeric.getAutoNumericElement('#clickEdit');
	let newVal = editInp.getNumber();	
	let editVar = false;
	let oldCases = poItems.data[row].cases;
	let oldUnits = poItems.data[row].units;
	let oldCaseCost = poItems.data[row].caseCost;
	let oldUnitCost = poItems.data[row].unitCost;
	let oldTotal = poItems.data[row].total;
	let cell = input.parent();

	console.log('cellEditSave newVal:', newVal, 'cell:', idx, 'row:', row);

	switch (idx) {
		case 3:
			if (oldCases ===newVal) {
				break;
			}
			poItems.data[row].cases = newVal;
			editVar = "cases";
			break;

		case 4:
			if (oldUnits === newVal) {
				break;
			}
			poItems.data[row].units = newVal;
			editVar = "units";
			break;

		case 5:
			if (Math.round(oldCaseCost * 100) / 100 === newVal) {
				break;
			}
			poItems.data[row].caseCost = newVal;
			poItems.data[row].unitCost = poItems.data[row].caseCost / poItems.data[row].caseQty;
			editVar = "caseCost";
			break;

		case 6:
			elog('rounded old cost:',Math.round(oldUnitCost * 10000) / 10000, 'newVal:',newVal);
			if (Math.round(oldUnitCost * 10000) / 10000 === newVal) {
				break;
			}
			poItems.data[row].unitCost = newVal;
			poItems.data[row].caseCost = poItems.data[row].unitCost * poItems.data[row].caseQty;
			editVar = "unitCost";
			break;

		case 7:
			if (Math.round(oldTotal * 100) / 100 === newVal) {
				break;
			}
			poItems.data[row].total = newVal;
			let units = poItems.data[row].units + ( poItems.data[row].cases * poItems.data[row].caseQty );
			poItems.data[row].unitCost = poItems.data[row].total / units;
			poItems.data[row].caseCost = poItems.data[row].caseQty * poItems.data[row].unitCost;
			editVar = "total";
			break;
	}

	if (editVar) {
		elog('sending changes to server');
		let dataObj = cloneObj(poItems.data[row]);
		delete dataObj.promo;

		console.log('cellEditSave editVar:', editVar);

		$.post("poLineEdit?", {
			newLine: JSON.stringify(dataObj),
			editVar: editVar,
			oldCases: oldCases,
			oldUnits: oldUnits,
			oldCaseCost: oldCaseCost,
			oldUnitCost: oldUnitCost,
			uid: uid,
			register: stationID
		});

		if (editVar !== 'total') {
			//---- recalculate total
			poItems.data[row].total  = ( poItems.data[row].cases * poItems.data[row].unitCost * poItems.data[row].caseQty );
			poItems.data[row].total += ( poItems.data[row].units * poItems.data[row].unitCost );
		}
		localStorage.setItem('poItems', JSON.stringify(poItems));
	}

	input.remove();
	cell.css({ padding: '' });

	purchTableUpdateRow(row + 1);

	if (isReceive) {
		if (poItems.data[row].lastCost > poItems.data[row].unitCost) {
			$('#purchTableBody tr:nth-child('+(row+1)+') td:nth-child(8)').prepend(
				'<span class="material-icons costDown">straight</span>'
			);
		} else if (poItems.data[row].lastCost < poItems.data[row].unitCost) {
			$('#purchTableBody tr:nth-child('+(row+1)+') td:nth-child(8)').prepend(
				'<span class="material-icons costUp">straight</span>'
			);
		} else {
			$('#purchTableBody tr:nth-child('+(idx+1)+') td:nth-child(8)').prepend(
				'<span class="material-icons costDown">remove</span>'
			);
		}
	}
console.log( 'idx:',idx,'currLine:',currLine,'poItems.data.length:',poItems.data.length);
	paintCurrentLine();
	updateTotalBox();
	purchTableCellClick();
	shortcutToggleFKeys('on');
	lPauseKeys = false;

	if (((lShift && key===13) || key===38) && currLine > 1) {
		currLine--
		idx++;
		setTimeout(function () { $('#purchTableBody tr:nth-child(' + currLine + ') td:nth-child('+ idx + ')').trigger("dblclick");}, 20);
	} else if (!lShift && (key===13 || key===40) && currLine < poItems.data.length) {
		currLine++;
		idx++;
		setTimeout(function () { $('#purchTableBody tr:nth-child(' + currLine + ') td:nth-child('+ idx + ')').trigger("dblclick");}, 20);
	} else if (((lShift && key===9) || key===37) && idx>3) {
		setTimeout(function () { $('#purchTableBody tr:nth-child(' + currLine + ') td:nth-child('+ idx + ')').trigger("dblclick");}, 20);
	} else if (((lShift && key===9) || key===37) && currLine > 1 && idx===3) {
		currLine--;
		setTimeout(function () { $('#purchTableBody tr:nth-child(' + currLine + ') td:nth-child(8)').trigger("dblclick");}, 20);
	} else if (!lShift && (key===9 || key===39) && idx<7) {
		idx += 2;
		setTimeout(function () { $('#purchTableBody tr:nth-child(' + currLine + ') td:nth-child('+ idx + ')').trigger("dblclick");}, 20);
	} else if (!lShift && (key===9 || key===39) && currLine < poItems.data.length && idx===7) {
		currLine++;
		setTimeout(function () { $('#purchTableBody tr:nth-child(' + currLine + ') td:nth-child(4)').trigger("dblclick");}, 20);
	}
}

function purchTableCellClose() {
	var val  = $("#clickEdit").val();
	var cell = $("#clickEdit").parent();
	var nRow = $(cell).closest('tr').index() + 1;

	//cell.html( val );
	$("#clickEdit").remove();
	cell.css({padding: ''});

	purchTableUpdateRow( nRow );

	purchTableCellClick();
	shortcutToggleFKeys('on');
	lPauseKeys = false;
}

function f6Edit(nRow) {
	if (poItems.data.length === 0) {
		return;
	}
	if (!nRow) {
		nRow = currLine;
	}
	vex.dialog.confirm({
		unsafeMessage: [
			'<h3 style="margin: 10px 0px;">' + dict.f6Title[languageVar] + '</h3>',
			'<span style="font-size: 14px; line-height: 18px !important;">',
			poItems.data[nRow-1].brand + '<br>',
			poItems.data[nRow-1].descrip + '<br>',
			poItems.data[nRow-1].size,
			'</span>',	
		].join(''),
	    input: [
		    '<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
				    '<select id="f6FieldSelect" name="f6Edit" size="6">',
				        '<option value="cases" selected>' + dict.f6cases[languageVar] + '</option>',
				        '<option value="units">' + dict.f6units[languageVar] + '</option>',
				        '<option value="caseCost">' + dict.f6caseCost[languageVar] + '</option>',
				        '<option value="unitCost">' + dict.f6unitCost[languageVar] + '</option>',
				        '<option value="total">' + dict.Total[languageVar] + '</option>',
				    '</select>',
			    '</div>',
		    '</div>'
	    ].join(''),
	    className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
	    afterOpen: function () {
			pauseBodyKeypress();
			$('.vex-content').css('width', '350px');
			$('.vex-content').attr('id','f6Box');
			$('.vex-content').draggable({
				stop: function( event, ui ) {$("#f6FieldSelect").focus();}
			  });
		    $('#f6FieldSelect').focus();
	    },
		callback: function (data) {
			if (!data) {
				// nothing to do...
			} else if (data.f6Edit === 'cases') {
				setTimeout(function () { $('#purchTableBody tr:nth-child(' + nRow + ') td:nth-child(4)').trigger("dblclick"); }, 20);
			} else if (data.f6Edit === 'units') {
				setTimeout(function () { $('#purchTableBody tr:nth-child(' + nRow + ') td:nth-child(5)').trigger("dblclick"); }, 20);
			} else if (data.f6Edit === 'caseCost') {
				setTimeout(function () { $('#purchTableBody tr:nth-child(' + nRow + ') td:nth-child(6)').trigger("dblclick"); }, 20);
			} else if (data.f6Edit === 'unitCost') {
				setTimeout(function () { $('#purchTableBody tr:nth-child(' + nRow + ') td:nth-child(7)').trigger("dblclick"); }, 20);
			} else if (data.f6Edit === 'total') {
				setTimeout(function () { $('#purchTableBody tr:nth-child(' + nRow + ') td:nth-child(8)').trigger("dblclick"); }, 20);
			}
			resetBodyKeypress();
			return;
		}
	})
}

function pauseBodyKeypress() {
	lPauseKeys = true;
	shortcutToggleFKeys('off');
}

function resetBodyKeypress() {
	lPauseKeys = false;
	//$('body').off('keyup');  // might be set in certain vex instances
	shortcutToggleFKeys('on');
	//setTimeout( function(){ $("#scanText").focus().select(); }, 10 );
}


function keyLogger( key, meta ) {
//	console.log('keyLogger:',key);
	return;
	var msg = [ Date.now(), key, meta, "1" ];
//	console.log( 'keyLogger', key);
	$.post( "keyLogger?", { msg: JSON.stringify( msg ) } );
}

function closeCustomerDiv() {
	vex.dialog.confirm({
		unsafeMessage: '<h3>'+ dict.custEx[languageVar] +'</h3>',
		className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
		afterOpen: function() { lPauseKeys = true; },
		callback: function (value) {
			if (value) {
				customer = { "custData": {} };
				localStorage.setItem('customer', JSON.stringify(customer));

				$("#customerDiv").toggle(false);
				$("#cashSale").toggle(true);
				$("#custHistBttn").prop("disabled",true);
				//$("#purchTableDiv").css({ "top": saleDivTop1, "height": "67%" }); // "18%", "height": "52%" } );
				purchTableDivSize( { "top": saleDivTop1, "height": "67%" } );
				$('.gFuncBar').css( 'top', gBarTop1 );

				$("#customerDiv").html('<span id="customerClose" onclick="closeCustomerDiv();"title="' + dict.removeCust[languageVar] + '">&times;</span>');
				lPauseKeys = false;
			}
		}
	})
}

function posContextMenu( row, cell, event ) {
	if ( $("#Modal_itemList").is(":visible") || $("#Modal_custList").is(":visible") || (poItems.data.length < 1) ) return;

	currLine = row + 1;

	const origin = {
		left: event.pageX,
		top: event.pageY
	};
	
	switch (true) {
		case cell === 4:
		    $("#cmEdit").text(dict.editQty[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#purchTableBody tr:nth-child(' + (currLine) + ') td:nth-child(5)").trigger("dblclick"); }, 25)' );
		    break;

		case cell === 5:
		    $("#cmEdit").text(dict.editDiscount[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#purchTableBody tr:nth-child(' + (currLine) + ') td:nth-child(6)").trigger("dblclick"); }, 25)' );
		    break;

		case cell === 6:
		    $("#cmEdit").text(dict.editPrice[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#purchTableBody tr:nth-child(' + (currLine) + ') td:nth-child(7)").trigger("dblclick"); }, 25)' );
 		    break;

		case cell === 7:
		    $("#cmEdit").text(dict.editTotal[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#purchTableBody tr:nth-child(' + (currLine) + ') td:nth-child(8)").trigger("dblclick"); }, 25)' );
		    break;

		case cell === 8:
		    $("#cmEdit").text(dict.editTax[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#purchTableBody tr:nth-child(' + (currLine) + ') td:nth-child(9)").trigger("dblclick"); }, 25)' );
		    break;

	    case cell === 9:
		    $("#cmEdit").text(dict.editDepo[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#purchTableBody tr:nth-child(' + (currLine) + ') td:nth-child(10)").trigger("dblclick"); }, 25)' );
		    break;

		default:
		    $("#cmEdit").text(dict.editItem[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'f6Edit();' )

	}

	let nbr = poItems.data[currLine-1].itemNbr.trim();
	if (nbr.length === 0) { nbr = 'n/a' }
	$("#cmSKU").text("Item Nbr: " + nbr);

	let codeNum = poItems.data[row].code_num;
	if (Number.isNaN(Number(codeNum)) || Number(codeNum)===0) {
		$("#cmPop").off("click");
		$("#cmPop").addClass( "liTurnedOff")
	} else {
		$("#cmPop").on("click", function(e) { e.stopImmediatePropagation(); toggleMenu("hide", ctxMenu); showPopItem(); } );
		$("#cmPop").removeClass( "liTurnedOff")
	}

    paintCurrentLine();
	setPosition(ctxMenu,origin);

	window.addEventListener("click", e => {
		e.stopPropagation();
		if (ctxMenuVisible) toggleMenu("hide", ctxMenu);
		$(window).off('click');
	});
}

const toggleMenu = (command,obj) => {
	$(obj).toggle( command==='show');
	//ctxMenu.style.display = command === "show" ? "block" : "none";
	if ($(obj).attr('id')==='saleContextMenu') {
		ctxMenuVisible = !ctxMenuVisible;
	}
};

const setPosition = (obj,{ top, left }) => {
//	console.log( 'setPosition A:', top, left );
	top  = Math.min( top, $(window).height() - $(obj).height() );
	left = Math.min( left, ( $(window).width() - $(obj).height() ) );
//	console.log( 'setPosition B:', top, left );
	obj.style.left = `${left}px`;
	obj.style.top = `${top}px`;
	toggleMenu("show",obj);
};

function showPopItem() {
	let hasCarryUPC = false;
	let newItem = poItems.data[currLine - 1].newItem;
	let codeNum = poItems.data[currLine - 1].code_num;

	//console.log("blank codenum:", isWhitespaceString(codeNum));

	var item = poItems.data[currLine - 1].brand.trim() +
		(poItems.data[currLine - 1].descrip.trim().length === 0 ? '' : ' ') +
		poItems.data[currLine - 1].descrip.trim() +
		(!(Object.is(poItems.data[currLine - 1].size,null)) && poItems.data[currLine - 1].size.trim().length === 0 ? '' : ' ') + poItems.data[currLine - 1].size.trim();

	if (newItem) {
		$.post("newItemEdit?",
			{ codenum: poItems.data[currLine - 1].code_num },
			function (reply) {
				if (reply.msg) {
					const txt = dict.errorMsg[languageVar] + '<br><br>' + reply.msg;
					vexAlert(txt);
				} else {
					/*
					$.each(reply.cells, function (idx, val) {
						if (val[0] === 'newCasePriceQty' || val[0] === 'newUnitUPC' || val[0] === 'newCarryUPC' || val[0] === 'newCaseUPC') {
							$("#" + val[0]).html(val[1]);
						} else {
							$("#" + val[0]).val(val[1]);
						}
						if (val[0] === 'newCarryUPC') { hasCarryUPC = true; }
					});
					*/
					let upc = poItems.data[currLine - 1].barcode;

					$("#newBrand").val(poItems.data[currLine - 1].brand);
					$("#newDescrip").val(poItems.data[currLine - 1].descrip);
					$("#newCaseQty").val(poItems.data[currLine - 1].caseQty);
					$("#newStdQty").val(poItems.data[currLine - 1].stdQty);
					$("#newPrice").val(0);
					$("#newCasePriceQty").text(poItems.data[currLine - 1].caseQty);
					$("#newCasePr").val(0);
					$("#newCost").text( poItems.data[currLine - 1].unitCost.toFixed(2) );
					$("#newDepYN").val("N");
					$("#newDepAmt").val(0);
					$("#newTax1").val("Y");
					$("#newTax2").val("Y");
					$("#newTax3").val("Y");
					$("#newFlatTax").val(0);
					$("#newDiscYN").val("Y");
					$("#newFreqX").val(1);

					const caseQty = AutoNumeric.getAutoNumericElement('#newCaseQty');
					caseQty.set($('#newCaseQty').val());
					const priceInp = AutoNumeric.getAutoNumericElement('#newPrice');
					priceInp.set($('#newPrice').val());
					const stdQty = AutoNumeric.getAutoNumericElement('#newStdQty');
					stdQty.set($('#newStdQty').val());
					const carryQty = AutoNumeric.getAutoNumericElement('#newCarryQty');
					carryQty.set($('#newCarryQty').val());
					const carryInp = AutoNumeric.getAutoNumericElement('#newCarryPr');
					carryInp.set($('#newCarryPr').val());
					const caseInp = AutoNumeric.getAutoNumericElement('#newCasePr');
					caseInp.set($('#newCasePr').val());
					const depAmtInp = AutoNumeric.getAutoNumericElement('#newDepAmt');
					depAmtInp.set($('#newDepAmt').val());
					const flatInp = AutoNumeric.getAutoNumericElement('#newFlatTax');
					flatInp.set($('#newFlatTax').val());
					const freqInp = AutoNumeric.getAutoNumericElement('#newFreqX');
					freqInp.set($('#newFreqX').val());
					const unitMkUp = AutoNumeric.getAutoNumericElement('#newUnitMk');
					unitMkUp.set(0);
					const carryMkUp = AutoNumeric.getAutoNumericElement('#newCarryMk');
					carryMkUp.set(0);
					const caseMkUp = AutoNumeric.getAutoNumericElement('#newCaseMk');
					caseMkUp.set(0);

					if (!hasCarryUPC) {
						$('#newCarryRow').hide()
					} else {
						$('#newCarryRow').show()
					}

					$.each(reply.sizes, function (i, item) {
						$('#newSize').append($('<option>', {
							value: item,
							text: item
						}));
					});
					$('#newSize').val(poItems.data[currLine - 1].size);

					$.each(reply.types, function (i, item) {
						$('#newType').append($('<option>', {
							value: item[0],
							text: item[1]
						}));
					});

					$("#newUnitUPC").html("<input class='newDataCell newUPCInput' type='text' maxlength=14>");
					if ( !isWhitespaceString(upc) ) {
					    $(".newUPCInput").val( poItems.data[currLine - 1].barcode );
					}
					
					if (poItems.data[currLine - 1].removed) {
						$('#newDelete').prop("disabled", true);
					}
					if (!reply.taxes.doTax2) { $('#newTax2').prop('disabled', true); $('#newTax2').prev('div').css('color', 'darkgray'); }
					if (!reply.taxes.doTax3) { $('#newTax3').prop('disabled', true); $('#newTax3').prev('div').css('color', 'darkgray'); }
					if (!reply.taxes.doFlat) { $('#newFlatTax').prop('disabled', true); $('#newFlatTax').prev('div').css('color', 'darkgray'); }
					if (!reply.freq) { $('#newFreqX').prop('disabled', true); $('#newFreqX').prev('div').css('color', 'darkgray'); }

					$("#newItemTitle").text('New Item: ' + item);
					$("#modalNewItemContent").draggable();
					shortcutToggleFKeys('off');

					//---- make sure case price is activated if case qty > 1
					if (caseQty.getNumber() > 1) {
						$("#newToggleCasePrice").prop("checked", true);
						$("#newCasePr").prop("disabled",false);
						$("#newCaseMk").prop("disabled",false);
					}else {
						$("#newToggleCasePrice").prop("checked", false);
						$("#newCasePr").prop("disabled",true);
						$("#newCaseMk").prop("disabled",true);
					}

					if ((!vendorPool || vendorPool.length <= 1)) {
						$("#newVendorRow").hide();
					} else {
						$("#newVendorRow").show();
						$("#newVendor").empty();
						$.each(vendorPool, function(i,item) {
							$('#newVendor').append($('<option>', {
								value: item[0],
								text: item[1]
							}));
						});
						$('#newVendor').val(poItems.data[currLine - 1].vendNbr);
					}

					$("#modalNewItem").show();
				}
			})
			.fail(function (xhr, status, error) {
				const txt = dict.errorMsg[languageVar] + '<br><br>' + error + '<br>' + xhr.responseText;
				vexAlert(txt);
			});
	} else {
		$.post("popItem?", { codenum: poItems.data[currLine - 1].code_num },
			function (reply) {
				$("#popItemTitle").text('Details: ' + item);
				if (reply.msg) {
					const txt = dict.errorMsg[languageVar] + '<br><br>' + reply.msg;
					vexAlert(txt);
				} else {
					$.each(reply.cells, function (idx, val) {
						$("#" + val[0]).html(val[1]);
					});
					$("#popNotes").val(reply.notes);
					$("#modalPopItemContent").draggable();
					shortcutToggleFKeys('off');
					$("#modalPopItem").show();
					var nWide = $("#popNotes").width();
					var nHigh = $("#popNotes").parent().parent().height() - 4;
					$("#popNotes").css({ "max-width": nWide, "max-height": nHigh });
				}
			})
			.fail(function (xhr, status, error) {
				const txt = dict.errorMsg[languageVar] + '<br><br>' + error + '<br>' + xhr.responseText;
				vexAlert(txt);
			});
	}
}

function closePopItem() {
	shortcutToggleFKeys('on');
	$("#modalPopItem").hide();
	$("#modalPopItemContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
}

function closeNewItem() {
	shortcutToggleFKeys('on');
	$("#modalNewItem").hide();
	$("#modalNewItemContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
	$('#newUnitRow').show();
	$('#newCarryRow').show();
	$('#newSize').empty();
	$('#newType').empty();
	//$('#newDelete').prop("disabled",false);
}

function newCaseQtyChange() {
	const caseQtyInp = AutoNumeric.getAutoNumericElement('#newCaseQty');
	const caseQty = caseQtyInp.getNumber();
	const carryQtyInp = AutoNumeric.getAutoNumericElement('#newCarryQty');
	const carryQty = carryQtyInp.getNumber();
	const oldCaseQty = poItems.data[currLine - 1].caseQty;
	let cost = Number( $('#newCost').text() );
	
	$('#newCasePriceQty').html(caseQty);

	if (caseQty > 1) {
		$("#newToggleCasePrice").prop("checked",true);
		$("#newCasePr").prop("disabled",false);
		$("#newCaseMk").prop("disabled",false);
		$('#newCaseRow').show();
		$('#newCarryRow').hide();
	} else {
		$("#newToggleCasePrice").prop("checked",false);
		$("#newCasePr").prop("disabled",true);
		$("#newCaseMk").prop("disabled",true);
		$('#newCaseRow').hide();
		$('#newCarryRow').hide();
	}
}
function newMkupChange(qInp, mkInp, prInp) {
	const type = $("#newMkMrg").val();
	const priceInp = AutoNumeric.getAutoNumericElement('#' + prInp);
	const qty = AutoNumeric.getAutoNumericElement('#' + qInp).getNumber();
	const casePrInp = AutoNumeric.getAutoNumericElement('#newCasePr');
	const caseMkup = AutoNumeric.getAutoNumericElement('#newCaseMk');
	let casePrice = AutoNumeric.getAutoNumericElement('#newCasePr').getNumber();
	let caseQty = AutoNumeric.getAutoNumericElement('#newCaseQty').getNumber();
	let mkup = AutoNumeric.getAutoNumericElement('#' + mkInp).getNumber();
	mkup = mkup / 100;
	const cost = qty * Number($('#newCost').text());
	let price = 0;
	if (type === 'mkup') {
		price = (1 + mkup) * cost;
	} else {
		mkup = Math.min(mkup, 0.99);
		price = cost / (1 - mkup);
	}
	priceInp.set(price);

	if (prInp === 'newPrice' && casePrice === 0) {
		casePrice = caseQty * price;
		casePrInp.set(casePrice);
		mkup = mkup * 100;
		caseMkup.set(mkup);
	}
}
function newPriceChange(qInp, prInp, mkInp) {
	const type = $("#newMkMrg").val();
	const mkupInp = AutoNumeric.getAutoNumericElement('#' + mkInp);
	const qty = AutoNumeric.getAutoNumericElement('#' + qInp).getNumber();
	let price = AutoNumeric.getAutoNumericElement('#' + prInp).getNumber();
	const casePrInp = AutoNumeric.getAutoNumericElement('#newCasePr');
	const caseMkup = AutoNumeric.getAutoNumericElement('#newCaseMk');
	let casePrice = AutoNumeric.getAutoNumericElement('#newCasePr').getNumber();
	let caseQty = AutoNumeric.getAutoNumericElement('#newCaseQty').getNumber();
	const cost = qty * Number($('#newCost').text());
	let mkup = 0;
	if (type === 'mkup') {
		if (cost !== 0 && price !== 0) {
			mkup = ((price - cost) / cost) * 100;
		}
	} else {
		if (price !== 0) {
			mkup = ((price - cost) / price) * 100;
		}
	}
	mkupInp.set(mkup);

	if (prInp === 'newPrice' && casePrice === 0) {
		casePrice = caseQty * price;
		casePrInp.set(casePrice);
		caseMkup.set(mkup);
	}
}
function newMargMarkChange() {
	// call price change for all 3 sets of inputs when switching between margin and markup
	newPriceChange('newStdQty','newPrice','newUnitMk');
	newPriceChange('newCarryQty','newCarryPr','newCarryMk');
	newPriceChange('newCaseQty','newCasePr','newCaseMk');
}

function newToggleCasePrice() {
	if ( $("#newToggleCasePrice").is(":checked") ) {
		$("#newCasePr").prop("disabled",false);
		$("#newCaseMk").prop("disabled",false);
	} else {
		$("#newCasePr").val("0.00");
		$("#newCaseMk").val("0.0");
		$("#newCasePr").prop("disabled",true);
		$("#newCaseMk").prop("disabled",true);
	}
}

function newItemEditSave() {
	const unitPrice = AutoNumeric.getAutoNumericElement('#newPrice').getNumber();
	const carryPrice = AutoNumeric.getAutoNumericElement('#newCarryPr').getNumber();
	const casePrice = AutoNumeric.getAutoNumericElement('#newCasePr').getNumber();
	const unitQty = AutoNumeric.getAutoNumericElement('#newStdQty').getNumber();
	const carryQty = AutoNumeric.getAutoNumericElement('#newCarryQty').getNumber();
	const caseQty = AutoNumeric.getAutoNumericElement('#newCaseQty').getNumber();
	const depAmt = AutoNumeric.getAutoNumericElement('#newDepAmt').getNumber();
	const flatTax = AutoNumeric.getAutoNumericElement('#newFlatTax').getNumber();
	const freqX = AutoNumeric.getAutoNumericElement('#newFreqX').getNumber();

	const hasUnit = $('#newUnitRow').is(':visible');
	const hasCarry = $('#newCarryRow').is(':visible');
	const hasCasePrice = $("#newToggleCasePrice").is(":checked");

	if (unitPrice===0) {
		vexAlert('Price must be entered before saving.', "newPrice");
		return;
	} else if (hasCasePrice && casePrice===0) {
		vexAlert('Case price must be entered before saving -or- unchecked.', "newCasePr");
		return;
	}

	let barcode = '';
	if ( $("#newUnitUPC input").length > 0 ) {
		barcode = $("#newUnitUPC input").val();
	}

	let vendnum = $('#PO_vendorSelect').val();
	if ($("#newVendorRow").is(":visible")) {
		vendnum = $('#newVendor').val();
	} else if (poItems.data[currLine - 1].vendNbr) {
		vendnum = poItems.data[currLine - 1].vendNbr;
	}

	// create data object
	const data = {
		vendnum: vendnum,
		intnum: poItems.data[currLine - 1].itemNbr,
		codenum: poItems.data[currLine - 1].code_num,
		barcode: barcode,
		brand: $('#newBrand').val(),
		descrip: $('#newDescrip').val(),
		size: $('#newSize').val(),
		typenum: $('#newType').val(),
		unitCost: poItems.data[currLine - 1].unitCost,
		unitPrice: unitPrice,
		carryPrice: carryPrice,
		casePrice: casePrice,
		unitQty: unitQty,
		carryQty: carryQty,
		caseQty: caseQty,
		depAmt: depAmt,
		flatTax: flatTax,
		deposit: $('#newDepYN').val(),
		tax1: $('#newTax1').val(),
		tax2: $('#newTax2').val(),
		tax3: $('#newTax3').val(),
		discYN: $('#newDiscYN').val(),
		freqX: freqX,
		hasUnit: hasUnit,
		hasCarry: hasCarry,
		hasCasePrice: hasCasePrice,
		unitUPC: $('#newUnitUPC').text(),
		carryUPC: $('#newCarryUPC').text(),
		caseUPC: $('#newCaseUPC').text(),
		notes: $('#newNotes').val(),
		units: poItems.data[currLine - 1].units,
		cases: poItems.data[currLine - 1].cases,
		ounces: poItems.data[currLine - 1].ounces
	};

	// post edits to server
	$.post('newItemSave?', data, function (reply) {
		if (reply.msg) {
			vexAlert(reply.msg);
		} else {
			// if successful save at server, update poItems.data and save to localstorage
			poItems.data[currLine - 1].newItem = false;

			poItems.data[currLine - 1].code_num = reply.code_num;
			poItems.data[currLine - 1].barcode = reply.barcode;
			poItems.data[currLine - 1].brand = reply.brand;
			poItems.data[currLine - 1].descrip = reply.descrip;
			poItems.data[currLine - 1].itemNbr = reply.itemNbr;
			poItems.data[currLine - 1].item = reply.brand.trim() + (reply.descrip.trim().length === 0 ? '' : ' ') + reply.descrip.trim() + (reply.size.trim().length === 0 ? '' : ' ') + reply.size.trim();
			poItems.data[currLine - 1].size = reply.size;
			poItems.data[currLine - 1].taxRate = reply.taxRate;
			poItems.data[currLine - 1].ounces = reply.ounces;
			poItems.data[currLine - 1].caseQty = reply.caseQty;
			poItems.data[currLine - 1].onHand = reply.onHand;
			poItems.data[currLine - 1].onOrder = reply.onOrder;
			poItems.data[currLine - 1].parQty = reply.parQty;
			poItems.data[currLine - 1].reordPt = reply.reordPt;
			poItems.data[currLine - 1].isDeposit = reply.isDeposit;
			poItems.data[currLine - 1].depositAmt = reply.depositAmt;
			poItems.data[currLine - 1].taxRate = reply.taxRate;
			poItems.data[currLine - 1].notes = reply.notes;
			poItems.data[currLine - 1].unitCost = reply.unitCost;
			poItems.data[currLine - 1].avgCost = reply.unitCost;
			poItems.data[currLine - 1].lastCost = reply.lastCost;
			poItems.data[currLine - 1].price = reply.price;
			poItems.data[currLine - 1].stdQty = reply.stdQty;
			poItems.data[currLine - 1].vendNbr = reply.vendNbr;

			localStorage.setItem('poItems', JSON.stringify(poItems));

			paintCurrentLine(currLine, true);
		}
	})
	.fail(function (xhr, status, error) {
		vexAlert(dict.errorMsg[languageVar] + '<br><br>' + error + '<br>' + xhr.responseText);
	})
	.always(function() {
		closeNewItem();
	});
}

function newItemDelete() {
	const code = poItems.data[currLine - 1].code_num;
	const txt  = '<h3 style="margin: 10px 0px;">Remove Item?</h3>' + 
	             '<br>Remove this item from your product database?<br>' + 
				 '(It will remain on the order.)';

	vex.dialog.confirm({
		unsafeMessage: txt,
	    className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.yes[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
	    afterOpen: function () {
			pauseBodyKeypress();
			playNotify();
	    },
		callback: function (data) {
			resetBodyKeypress();
			if (data) {
				$.post( 'newItemDelete?', { codenum: code }, function(reply){
					if (reply.success) {
						poItems.data[currLine - 1].removed = true;
						localStorage.setItem('poItems', JSON.stringify(poItems));
						$('#newDelete').prop("disabled",true);

						vexAlert('This item has been removed from the database.');
					} else {
						vexAlert(dict.errorMsg[languageVar] + '<br><br>' + reply.msg);
					}
				})
			}
		}
	});
}

function shortcutUp() {
// restore later	keyLogger( 38 );
/*
	if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func1").is(":visible") ) {
		navFocus-=2;
		if (navFocus<=0) { navFocus = 0 };
		$(navButtons[navFocus]).focus();

	} else if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func2").is(":visible") ) {
		navFocus-=3;
		if (navFocus<=0) { navFocus = 0 };
		$(navButtons[navFocus]).focus();

    } else */
	if ($("#Modal_itemList").is(":visible")) {
		if ($('#itemListTableDiv .jsgrid-grid-body').is(":hover")) {
			return;
		}
		$("#itemListTableDiv .jsgrid-grid-body tr:eq("+itemListTable.currLine+") td").removeClass("highlighted");
		itemListTable.currLine --;
		if (itemListTable.currLine < 0  && itemListTable.currentPage > 1) {
			altPageUp(true);
			$("#itemListTableDiv .jsgrid-grid-body tr:eq("+itemListTable.currLine+") td").removeClass("highlighted");
			itemListTable.currLine = itemListTable.rows - 1;
		} else if (itemListTable.currLine < 0){
			itemListTable.currLine = 0;
		};
		$("#itemListTableDiv .jsgrid-grid-body tr:eq("+itemListTable.currLine+") td").addClass("highlighted");
		if (itemListTable.currLine===0) {
			$("#itemListTableDiv .jsgrid-grid-body").scrollTop(0);
		} else {
			$("#itemListTableDiv .jsgrid-grid-body").scrollTop( (itemListTable.currLine+1) * ( ( $("#itemListTableDiv .jsgrid-grid-body .jsgrid-table").height() - $("#itemListTableDiv .jsgrid-grid-body").height() ) / itemListTable.rows)  );
		}

	} else if ($("#Modal_custList").is(":visible")) {
		if ($('#custListTableDiv .jsgrid-grid-body').is(":hover")) {
			return;
		}
		$("#custListTableDiv .jsgrid-grid-body tr:eq("+custListTable.currLine+") td").removeClass("highlighted");
		custListTable.currLine --;
		if (custListTable.currLine < 0  && custListTable.currentPage > 1) {
			altPageUp(true);
			$("#custListTableDiv .jsgrid-grid-body tr:eq("+custListTable.currLine+") td").removeClass("highlighted");
			custListTable.currLine = custListTable.rows - 1;
		} else if (custListTable.currLine < 0){
			custListTable.currLine = 0;
		};
		$("#custListTableDiv .jsgrid-grid-body tr:eq("+custListTable.currLine+") td").addClass("highlighted");
		if (custListTable.currLine===0) {
			$("#custListTableDiv .jsgrid-grid-body").scrollTop(0);
		} else {
			$("#custListTableDiv .jsgrid-grid-body").scrollTop( (custListTable.currLine+1) * ( ( $("#custListTableDiv .jsgrid-grid-body .jsgrid-table").height() - $("#custListTableDiv .jsgrid-grid-body").height() ) / custListTable.rows)  );
		}

	} else if ($("#f6FieldSelect").is(":visible")) {
		var e = jQuery.Event("keydown");
		e.which = 38; // # Some key code value
		$("#f6FieldSelect").trigger(e);
		return;

	} else {
		// if (currLine<=1) { currLine = 1 } else { currLine-- };
		paintCurrentLine( Math.max( 1, currLine-1 ) );
	}
}

function shortcutDown() {
// restore later	keyLogger( 40 );
/*
	if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func1").is(":visible") ) {
		navFocus+=2;
		if (navFocus>navButtons.length-1) { navFocus = navButtons.length-1 };
		$(navButtons[navFocus]).focus();

	} else if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func2").is(":visible") ) {
			navFocus+=3;
			if (navFocus>navButtons.length-1) { navFocus = navButtons.length-1 };
			$(navButtons[navFocus]).focus();

	} else */
	if ($("#Modal_itemList").is(":visible")) {
		if ($('#itemListTableDiv .jsgrid-grid-body').is(":hover")) {
			return;
		}
		$("#itemListTableDiv .jsgrid-grid-body tr:eq("+itemListTable.currLine+") td").removeClass("highlighted");
		itemListTable.currLine ++;
		if (itemListTable.currLine > $("#itemListTableDiv .jsgrid-grid-body tr").length-1 && itemListTable.currentPage < itemListTable.totalPages) {
			altPageDown();
			// itemListTable.currLine = $(".jsgrid-grid-body tr").length-1;
		} else if (itemListTable.currLine > $("#itemListTableDiv .jsgrid-grid-body tr").length-1) {
			itemListTable.currLine = $("#itemListTableDiv .jsgrid-grid-body tr").length-1;
		}
		$("#itemListTableDiv .jsgrid-grid-body tr:eq("+itemListTable.currLine+") td").addClass("highlighted");
	
		$("#itemListTableDiv .jsgrid-grid-body").scrollTop( (itemListTable.currLine+1) * ( ( $("#itemListTableDiv .jsgrid-grid-body .jsgrid-table").height() - $("#itemListTableDiv .jsgrid-grid-body").height() ) / itemListTable.rows)  );

	} else if ($("#Modal_custList").is(":visible")) {
		if ($('#custListTableDiv .jsgrid-grid-body').is(":hover")) {
			return;
		}
		$("#custListTableDiv .jsgrid-grid-body tr:eq("+custListTable.currLine+") td").removeClass("highlighted");
		custListTable.currLine ++;
		if (custListTable.currLine > $("#custListTableDiv .jsgrid-grid-body tr").length-1 && custListTable.currentPage < custListTable.totalPages) {
			altPageDown();
			// custListTable.currLine = $(".jsgrid-grid-body tr").length-1;
		} else if (custListTable.currLine > $("#custListTableDiv .jsgrid-grid-body tr").length-1) {
			custListTable.currLine = $("#custListTableDiv .jsgrid-grid-body tr").length-1;
		}
		$("#custListTableDiv .jsgrid-grid-body tr:eq("+custListTable.currLine+") td").addClass("highlighted");
	
		$("#custListTableDiv .jsgrid-grid-body").scrollTop( (custListTable.currLine+1) * ( ( $("#custListTableDiv .jsgrid-grid-body .jsgrid-table").height() - $("#custListTableDiv .jsgrid-grid-body").height() ) / custListTable.rows)  );

	} else if ($("#f6FieldSelect").is(":visible")) {
		var e = jQuery.Event("keydown");
		e.which = 40; // # Some key code value
		$("#f6FieldSelect").trigger(e);
		return;
		
	} else {
//		if (currLine>=poItems.data.length) { currLine = poItems.data.length } else { currLine++ };
		paintCurrentLine( Math.min( poItems.data.length, currLine+1 ) );
	}
}

function shortcutLeft() {
// restore later	keyLogger( 37 );
	if ( $('#mySidenav').attr('viewMe') === 'true' ) {
		if (navFocus<=0) { navFocus = navButtons.length-1 } else { navFocus-- };
		//$(navButtons[navFocus]).focus();
	}
}

function shortcutRight() {
// restore later	keyLogger( 39 );
	if ( $('#mySidenav').attr('viewMe') === 'true' ) {
		if (navFocus>=navButtons.length) { navFocus = 0 } else { navFocus++ };
		//$(navButtons[navFocus]).focus();
	}
}

function escKeyFunc() {
	console.log( 'escape' );
    if ($("#ModalWebOrders").is(":visible")) {
		return2Dashboard();
		return;
	}
	if ($("#clickEdit").is(":visible")) purchTableCellClose();
	if ($('#Modal_itemList').is(":visible")) closeItemList();
	if ($('#modalPopItem').is(":visible")) closePopItem();
	if ( $(document).width() > 1200 && $('#mySidenav').attr('viewMe')==='true') closeNav();
	if (ctxMenuVisible) toggleMenu("hide", ctxMenu);
}

function shortcutToggleFKeys(cState) {
/*
Browser defaults:
F1 (Help)
F3 (Search)
F5 (Refresh)
F6 (focus address bar)
*/		
	if (cState.toLowerCase()==='on') {
		
/*
		Mousetrap.unbind( 'f1' );
		Mousetrap.unbind( 'f3' );
		Mousetrap.unbind( 'f5' );
		Mousetrap.unbind( 'f6' );
*/
//		Mousetrap.bind('f1', function () { keyLogger(112); alert('f1 pressed') });
		Mousetrap.bind('f3', function () { keyLogger(114); $("#itemListBtn").trigger("click"); return false; });
		Mousetrap.bind('f5', function () { keyLogger(116); $("#deleteBtn").trigger("click"); return false; });
		Mousetrap.bind('f6', function () { keyLogger(117); $("#editBtn").trigger("click"); return false; });

		Mousetrap.bind("f2",function() { keyLogger( 113 ); $( "#logoutBtn" ).trigger( "click" ); } );

		Mousetrap.bind("f4",function() { poVoid(); return false; } );  // keyLogger( 115 ); poVoid(); } ); // $( "#voidBtn" ).trigger( "click" ); } );
/*
		Mousetrap.bind("f7",function() { keyLogger( 118 ); $( "#noteBtn" ).trigger( "click" ); } );
		Mousetrap.bind("f8",function() { keyLogger( 119 ); $( "#vendListBtn" ).trigger( "click" ); } );
*/
		Mousetrap.bind("f9",function() { postOrder(); return false; } );  // keyLogger( 120 ); $( "#finishBtn" ).trigger( "click" ); } );
/*		
		Mousetrap.bind("f10",function() { keyLogger( 121 ); $( "#freightBtn" ).trigger( "click" ); } );
		Mousetrap.bind("shift+f10", function() { atCase(); });
		Mousetrap.bind("alt+f10", function() { toggleNav(); } );
*/
//		Mousetrap.bind( "up", function() { shortcutUp(); } );
//		Mousetrap.bind( "down", function() { shortcutDown(); } );	
	
	} else {
/*
		Mousetrap.unbind( 'f1' );
		Mousetrap.unbind( 'f3' );
		Mousetrap.unbind( 'f5' );
		Mousetrap.unbind( 'f6' );
*/
		Mousetrap.bind('f1', function () { return false; });
		Mousetrap.bind('f3', function(e) { if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; } });
		Mousetrap.bind('f5', function () { return false; });
		Mousetrap.bind('f6', function () { return false; });
	
		Mousetrap.unbind( 'f2' );

		Mousetrap.unbind( 'f4' );

		Mousetrap.unbind( 'f7' );
		Mousetrap.unbind( 'f8' );

		Mousetrap.unbind( 'f9' );

		Mousetrap.unbind( 'f10' );
		Mousetrap.unbind( 'shift+f10' );
		Mousetrap.unbind( 'alt+f10' );

		//Mousetrap.unbind( "up" );
		//Mousetrap.unbind( "down" );
	
	}
}

function searchInputFocus() {
	if ($("#Modal_itemList").is(":visible")) {
/* restore later		
		var lOpen = itemListTable.grid.jsGrid("option", "filtering");
		if (lOpen) {
			itemListTable.grid.jsGrid("option", "filtering", false);
			$("#itemClearSearch").hide();
			$("#itemSearch").show();
			itemListTable.grid.jsGrid("clearFilter");
		    itemListTable.grid.jsGrid("loadData");
		} else {
*/			
		itemListTable.grid.jsGrid("option", "filtering", true);
		$("#itemSearch").hide();
		$("#itemClearSearch").show();
			setTimeout(function () {
				$("#itemListTableDiv .jsgrid-filter-row td:eq(2) input").focus();
			}, 10);
// restore later		}

	} else if ($("#Modal_custList").is(":visible")) {
		var lOpen = custListTable.grid.jsGrid("option", "filtering");
		if (lOpen) {
			custListTable.grid.jsGrid("option", "filtering", false);
			$("#custClearSearch").hide();
			$("#custSearch").show();
			custListTable.grid.jsGrid("clearFilter");
			custListTable.grid.jsGrid("loadData");
		} else {
			custListTable.grid.jsGrid("option", "filtering", true);
			$("#custSearch").hide();
			$("#custClearSearch").show();
			setTimeout( function() { $("#custListTableDiv .jsgrid-filter-row td:eq(0) input").focus(); }, 100 );
		}

	}
}

function tableFocus() {
	var row;
	if ($("#Modal_itemList").is(":visible")) {
/*		
		var filteredRows = itemListDataTable.rows({filter: 'applied'});
		var nIdx = filteredRows[0][0];
		console.log('row:',nIdx);
		console.log(itemListDataTable.row(':eq(0)', { page: 'current' }).cells(':eq(0)').data());
*/
		var myrow = itemListDataTable.row(':eq(0)', { page: 'current' });
		var idx = myrow.index();
		$("#itemListTable_filter input").blur();
		itemListDataTable.cell( {row: idx, column: 0} ).focus();
		/*
		itemListDataTable.keys.enable( true );

		idx = itemListDataTable.row( {search:'applied'} ).index();
		console.log( 'row:',idx );
		itemListDataTable.cell( idx, 0 ).node().focus();
		*/
	} else if ($("#Modal_custList").is(":visible")) {
		var myrow = itemListDataTable.row(':eq(0)', { page: 'current' });
		var idx = myrow.index();
		$("#custListTable_filter input").blur();
		itemListDataTable.cell( {row: idx, column: 0} ).focus();
	}
}

function lookupSort( char ) {
	if (char==='P' && !($("#Modal_itemList").is(":visible") || $("#Modal_custList").is(":visible"))) {
		showPopItem();
	}
	else if ($("#Modal_itemList").is(":visible")) {
		let lSearchOpen = $("#itemListTableDiv .jsgrid-filter-row").is(":visible");
		if ( char === 'A' || char === 'I' ) {
			if ( languageVar === 'en' && char === 'I' ) {
			    $("#itemListTableDiv .jsgrid-header-row th:eq(3)").trigger("click");
			} else if ( languageVar === 'es' && char === 'A' ) {
				$("#itemListTableDiv .jsgrid-header-row th:eq(3)").trigger("click");
			}
		}
		switch (char) {
			case 'B':
				$("#itemListTableDiv .jsgrid-header-row th:eq(0)").trigger("click");
			    break;

			case 'D':
			    $("#itemListTableDiv .jsgrid-header-row th:eq(2)").trigger("click");
				break;

			case 'P':
			    $("#itemListTableDiv .jsgrid-header-row th:eq(5)").trigger("click");
				break;

			case 'R':
			    $("#itemListTableDiv .jsgrid-header-row th:eq(1)").trigger("click");
				break;

			case 'T':
			    $("#itemListTableDiv .jsgrid-header-row th:eq(4)").trigger("click");
				break;
			
		}
		if (!lSearchOpen) {
			$(".jsgrid-filter-row").hide();
		}

	} else if ($("#Modal_custList").is(":visible")) {
		switch (char) {
			case 'C':
				$("#custListTableDiv .jsgrid-header-row th:eq(5)").trigger('click');
				break;

			case 'L':
				$("#custListTableDiv .jsgrid-header-row th:eq(4)").trigger('click');
				break;

			case 'M':
				$("#custListTableDiv .jsgrid-header-row th:eq(0)").trigger('click');
				break;

			case 'N':
				$("#custListTableDiv .jsgrid-header-row th:eq(1)").trigger('click');
				break;

			case 'O':
			    $("#custListTableDiv .jsgrid-header-row th:eq(2)").trigger("click");
				break;

			case 'P':
				$("#custListTableDiv .jsgrid-header-row th:eq(3)").trigger('click');
				break;

			case 'Z':
				$("#custListTableDiv .jsgrid-header-row th:eq(6)").trigger('click');
				break;

		}
	}
}

function altPageDown() {
	if ($("#Modal_itemList").is(":visible")) {
		if ( itemListTable.currentPage === itemListTable.totalPages ) {
			return;
		}
		itemListTable.currentPage ++;
//		console.log( "currentPage:", itemListTable.currentPage );
		itemListTable.grid.jsGrid("openPage", itemListTable.currentPage );

	} else if ($("#Modal_custList").is(":visible")) {
		if ( custListTable.currentPage === custListTable.totalPages ) {
			return;
		}
		custListTable.currentPage ++;
//		console.log( "currentPage:", custListTable.currentPage );
		custListTable.grid.jsGrid("openPage", custListTable.currentPage );
	}
}

function altPageUp() {
	if ($("#Modal_itemList").is(":visible")) {
		if ( itemListTable.currentPage === 1 ) {
			return;
		}
		itemListTable.currentPage--
		itemListTable.currentPage = Math.max( itemListTable.currentPage, 1 );
		itemListTable.grid.jsGrid("openPage", itemListTable.currentPage );
		
	} else if ($("#Modal_custList").is(":visible")) {
		if ( custListTable.currentPage === 1 ) {
			return;
		}
		custListTable.currentPage--
		custListTable.currentPage = Math.max( custListTable.currentPage, 1 );
		custListTable.grid.jsGrid("openPage", custListTable.currentPage );
	}
}

/**
  * Returns true/false whether the number sent in is odd
  * @param {Number} num The number to test
  */
 function isOdd(num) { return num % 2;}

 function newLanguage( lang ) {
	switch (lang) {
		case 'en':	 
		    languageVar = 'en';
			translator.lang('en');
		break;

		case 'es':
		    languageVar = 'es';
			translator.lang('es');
		break;
	}

	// tender keyboard
	$(".hg-button-bksp span").text(dict.backspace[languageVar]);
	$(".hg-button-enter span").text(dict.enter[languageVar]);

	if ( $("#custListTableDiv .jsgrid-grid-body").length > 0 ) {
		$("#custListTableDiv").jsGrid({pagerFormat: '{first} {prev} {pages} {next} {last} &nbsp;&nbsp; '+dict.Records[languageVar]+': {itemCount}'});
	}

	if ( $("#itemListTableDiv .jsgrid-grid-body").length > 0 ) {
		$("#itemListTableDiv").jsGrid({pagerFormat: '{first} {prev} {pages} {next} {last} &nbsp;&nbsp; '+dict.Records[languageVar]+': {itemCount}'});
	}

	f3Header();
	f8Header();
	setgBarTitles();
	setTotalLabels();
	
	purchTableLoadData();
	paintCurrentLine();
}


function cloneObj(src) {
//	console.log( "cloneObj src:", src );
	return Object.assign({}, src);
}

function setgBarTitles() {
	$(".trashFunc").attr("title", dict.Delete[languageVar]);
	$(".discFunc").attr("title", dict.Discount[languageVar]);
//	$(".returnFunc").attr("title", dict.Refund[languageVar]);
}

function setTotalLabels() {
    $("#totSubLabel").text( dict.Subtotal[languageVar] );
    $("#totTaxLabel").text( dict.Taxes[languageVar] );
}

function messageRemove() {
	$(document).find(".message").remove();
	lMsgUp = false;
}

function go_full_screen(){
	var elem = document.documentElement;
	if (elem.requestFullscreen) {
	  elem.requestFullscreen();
	} else if (elem.msRequestFullscreen) {
	  elem.msRequestFullscreen();
	} else if (elem.mozRequestFullScreen) {
	  elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
	  elem.webkitRequestFullscreen();
	}
}

function purchTableDivSize( obj ) {
	let nSideHigh = 0;

	if (obj) {
		$("#purchTableDiv").css( obj );
	} else {
		$("#purchTableDiv").css({height: ""});  // reset height in case we overrode it
	}

	//--- check to make sure we are not too tall
	let nTop = $("#purchTableDiv").offset().top

	let nHeight = 0.95 * $(document).height() - 59 - nTop - 72; // 150;
	$("#purchTableDiv").css({ height: nHeight });

	//--- set the table body
	let nHigh = $("#purchTableDiv").height() - $("#purchTableHdrRow").height();
	$("#purchTableBody").css({ height: nHigh });

	setTimeout( function () {
		if ($(document).height() < 770) {
			let newTop = nTop + $("#purchTableDiv").height() + 10;

			let newBott = Math.max($(document).height() - newTop - $("#barcBar").outerHeight() - 10, 0);
			$("#barcBar").css({ bottom: newBott.toString() + 'px' });

			newBott = Math.max(newBott - (121 - $("#barcBar").outerHeight()), 0);
			$('#totalTableDiv').css({ bottom: newBott.toString() + 'px' });

		} else {
			$("#barcBar").css({ bottom: '' });
			$("#totalTableDiv").css({ bottom: '' });
		}
	}, 50 );

	console.log( 'doc height:', $(document).width() );
	if( $(document).width() >= 1040 ) {
		//console.log('wide logic');
		wideSet = true;
		let nWide = ( $(document).width() - 1020 ) / 2;
		$("#purchTableDiv").css({right: nWide+"px"});
		$("#versionNbrDiv").css({right: nWide+"px"});
		$("#customerBlockDiv").css({right: nWide+"px"});
		$("#totalTableDiv").css({right: nWide+"px"});
		$('#helpBtn').css({right: nWide+"px"});

		$('#menuButton').hide();
		nSideHigh = Math.max( 616, $("#purchTableDiv").height() + 291 );
		console.log( 'table high: ' + $("#purchTableDiv").height() + ', nSideHigh: ' + nSideHigh );
		$('#mySidenav').css('border-radius', '8px');
		$('#mySidenav').css('height', nSideHigh+"px");
		openNav();
		$('#mySidenav').css('left', nWide+"px");
		$('#purchTableBody, #scanText, #totalTableDiv, #customerDiv, #cashSale').off("mousedown");

	} else {
		//console.log('narrow logic');
		wideSet = false;
		let nRight = (($(document).width() - $('#purchTableDiv').width()) / 2) - 8;
		$('#menuButton').hide();
		$('#mySidenav').hide();

		$("#purchTableDiv").css({ right: nRight + "px" });
		$("#versionNbrDiv").css({ right: nRight + "px" });
		$("#customerBlockDiv").css({ right: nRight + "px" });
		$("#totalTableDiv").css({ right: nRight + "px" });
		$('#helpBtn').css({right: nRight+"px"});

		nSideHigh = Math.max( 690, $("#purchTableDiv").height() + 291 );
		$('#mySidenav').css('border-radius', '');
		$('#mySidenav').css('height', nSideHigh + "px");

		closeNav();

		setTimeout(function () {
			$('#mySidenav').show();
			let offset = $('#mySidenav').offset();
			let buttBott = $(document).height() - (offset.top + $('#mySidenav').height());

			console.log('offset.top:', offset.top,
				'doc height:', $(document).height(),
				'doc width:', $(document).width(),
				'nav height:', $('#mySidenav').height(),
				'buttBott:', buttBott);

			//---- double-check width (delayed in some cases)
			if( $(document).width() < 1060 ) {
				$('#menuButton').css({ bottom: buttBott + 'px' });
			    $('#menuButton').show();
			}
		}, 50 );
	}

	if (poItems.data.length > 0) {
		var addLeft = $("#hdr_col0 label").offset().left - 1;
	} else {
		var addLeft = $("#hdr_col0").offset().left + ( $("#hdr_col0").width() / 2) - 6;
	}
	$(".addItemBtn").css({left: addLeft});
	$(".gFuncBar").css({left: addLeft + 50});
	
	addLeft = $("#purchTableDiv").offset().left;
	$("#barcBar").css({left: addLeft});

	//--- check to see if scrollbar is in play
	if ($("#purchTableBody").overflownY()) {
		$("#purchTableHdr tr").css({"padding-right": "17px"});
	} else {
		$("#purchTableHdr tr").css({"padding-right": "0px"});
	}
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function poNote() {
	let txt = 'Order ' + ( (poNumber!=='') ? poNumber : '' ) + ' Notes';
	vex.dialog.confirm({
		unsafeMessage: '<h3 style="margin: 10px 0px;">' + txt + '</h3>',
	    input: [
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
				    '<textarea id="note" name="note" rows="4">',
				    '</textarea>',
			    '</div>',
			'</div>'
	    ].join(''),
	    className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
	    afterOpen: function () {
			pauseBodyKeypress();

			if (localStorage.hasOwnProperty('poNotes')) {
				let note = localStorage.getItem("poNotes");
				$("#note").val(note);
			}

			$('.vex-content').attr('id','f6Box');
			$('.vex-content').draggable({
				stop: function( event, ui ) {$("#note").focus();}
			});
			/*
			$('.vex-content').resizable({
				  handles: "se"
			});
			*/
			var width = $("#note").width();
			$("#note").css( {"max-width": width, "min-width": width});
			
			setTimeout( function() { $("#note").focus(); }, 0 );
	    },
		callback: function (data) {
			if (!data) {
				resetBodyKeypress();
				return;
			}

			if (!data.note || typeof data.note==='undefined') { data.note = '' };

			poNotes = data.note;
			localStorage.setItem("poNotes", poNotes);

			if (poNotes.length>0) {
				$('#noteBtnIcon').addClass( 'rainbow-text' );
				$('#noteBtn').attr('title', 'Has Notes');		
			} else {
				$('#noteBtnIcon').removeClass( 'rainbow-text' );
				$('#noteBtn').attr('title', 'Notes');		
			}
			resetBodyKeypress();
		}
	})
}

function titleCase(str) {
	return str.toLowerCase().split(' ').map(function(word) {
	  return word.replace(word[0], word[0].toUpperCase());
	}).join(' ');
}

function return2Dashboard() {
    var url= "split.html"; 
    window.location = url;
}

function poClose() {
	if ( $("#modalItemOrder").is(':visible') ) {
		return;
	}
	if (poItems.data.length===0) {
		poVendor = "0";
		localStorage.setItem("poVendor", poVendor)
	}
	//flag intentionally closing
	validClose = true;

	var url= "split.html"; 
    window.location = url;
	return;
}

function atClosing() {
	if (poItems.data.length===0) {
		poVendor = "0";
		localStorage.setItem("poVendor", poVendor)
	}
	//flag intentionally closing
	validClose = true;

	var url= "split.html"; 
    window.location = url;
	return;

	let purchSize = [ window.innerWidth, window.innerHeight ];

	let isAtMaxWidth = screen.availWidth - window.outerWidth === 0;
	let screenPixelRatio = (window.outerWidth - 8) / window.innerWidth;
	let isAtDefaultZoom = screenPixelRatio > 0.89 && screenPixelRatio <= 1.10;
	let isMaximizedAndDefaultZoom = isAtMaxWidth && isAtDefaultZoom;

	localStorage.setItem("purchSize", JSON.stringify(purchSize));
	localStorage.setItem("purchMax", isMaximizedAndDefaultZoom);

	//alert( 'isAtMaxWidth: ' + isAtMaxWidth + ', screenPixelRatio: ' + screenPixelRatio );
	//alert( 'maximized: ' + isMaximizedAndDefaultZoom + ', purchSize: ' + JSON.stringify(purchSize) );
}

function poFinishOptions() {
	if (!isReceive) { //&& !poFinishOpts.remember) {
		$('#finishPrint').prop('checked', poFinishOpts.poPrint);
		$('#finishExport').prop('checked', poFinishOpts.poExport);
		$('#finishReceive').prop('checked', poFinishOpts.poReceive);
		//$('#finishRemember').prop('checked', poFinishOpts.remember);

		$('#modalFinish').show();
	} else if (isReceive && !poFinishOpts.rcvRemember) {
		$('#rcvFinishPrint').prop('checked', poFinishOpts.rcvPrint);
		$('#rcvFinishVari').prop('checked', poFinishOpts.rcvVari);
		$('#rcvFinishPrices').prop('checked', poFinishOpts.rcvPrices);
		$('#rcvFinishLabels').prop('checked', poFinishOpts.rcvLabels);
		$('#rcvFinishRemember').prop('checked', poFinishOpts.rcvRemember);

		$('#modalRcvFinish').show();
	} else {
		poFinish();
	}
}

function poFinishOptionsSet() {
	poFinishOpts.poPrint   = $("#finishPrint").prop('checked');
	poFinishOpts.poExport  = $("#finishExport").prop('checked');
	poFinishOpts.poReceive = $("#finishReceive").prop('checked');
	poFinishOpts.remember  = false; // $("#finishRemember").prop('checked');

	localStorage.setItem("poFinishOpts", JSON.stringify(poFinishOpts));

	closeFinish();
	poFinish(true);
}

function closeFinish() {
	$('#modalFinish').hide();
}

function rcvFinishOptionsSet() {
	poFinishOpts.rcvPrint    = $("#rcvFinishPrint").prop('checked');
	poFinishOpts.rcvVari     = $("#rcvFinishVari").prop('checked');
	poFinishOpts.rcvPrices   = $("#rcvFinishPrices").prop('checked');
	poFinishOpts.rcvLabels   = $("#rcvFinishLabels").prop('checked');
	poFinishOpts.rcvRemember = $("#rcvFinishRemember").prop('checked');
	localStorage.setItem("poFinishOpts", JSON.stringify(poFinishOpts));

	purchSet.rcvVari = poFinishOpts.rcvVari;
	purchSet.rcvPrintDoc = poFinishOpts.rcvPrint;
	localStorage.setItem("purchSet", JSON.stringify(purchSet));

	closeRcvFinish();
	poFinish();
}

function closeRcvFinish() {
	$('#modalRcvFinish').hide();
}

function poFinish( lFromPurchase ) {
	let vendNbr = $('#PO_vendorSelect').val();
	let rcvSave = false;
	let newItems = 0;

	$.each(poItems.data, function (idx, item) {
		if (item.newItem) { newItems++; }
	});

	if ( newItems === 1 ) {
		vexAlert( "There is one new item remaining. It must be added, matched or deleted before proceeding.");
		return;
	} else if ( newItems > 1 ) {
		vexAlert( "There are " + newItems + " new items remaining. They must be added, matched or deleted before proceeding.");
		return;
	}

	if (vendNbr === '0') {
		vexAlert('Please select a vendor for this order.', 'PO_vendorSelect');
		return;
/*
		vex.dialog.alert({
			unsafeMessage: 'Please select a vendor for this order.',
			className: 'vex-theme-wireframe',
			afterOpen: function () {
				lPauseKeys = true;
				playNotify();
			},
			afterClose: function () {
				lPauseKeys = false;
				setTimeout(function () { $('#PO_vendorSelect').focus(); }, 25);
				return;
			}
		});
*/
	} else {
		let blanks = 0;
		$.each(poItems.data, function (idx, item) {
			if (item.cases === 0 && item.units === 0) { blanks++; return false; }
		});

		//--- purchase order
		if (blanks > 0  && !isReceive) {
			vex.dialog.open({
				unsafeMessage: '<h3>Zero Qty Item</h3>' + 
				    'One or more items have zero qty.\nDelete these items from the order?',
				className: 'vex-theme-multiButtons',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, { text: dict.Yes[languageVar] }),
					$.extend({}, vex.dialog.buttons.NO, { text: dict.No[languageVar] })
				],
				afterOpen: function () {
					pauseBodyKeypress();
					$('.vex-content').draggable();
				},
				callback: function (value) {
					let newData = {"data": []};
					if (value) {
						$.each(poItems.data, function (idx, item) {
							//---- copy non-zero qty item
							if (item.cases !== 0 || item.units !== 0) {
								newData.data.push(item);
							}
						});
						//---- now renumber the array
						$.each(newData.data, function (idx, item) {
							item.rowId = (idx + 1) + '.';
						});
						poItems = newData;
						localStorage.setItem('poItems', JSON.stringify(poItems));

						purchTableLoadData();
						updateTotalBox();

						fillInfoBox(poItems.data.at(-1));
					}

					resetBodyKeypress();
					focusBarc();
					poPost(false,rcvSave,true);
				}
			});
			return;
		//--- receiver, must be able to save if partial 
		} else if (blanks > 0  && isReceive) {
			vex.dialog.open({
				unsafeMessage: '<h3>Zero Qty Item</h3>' +
				'One or more items have zero qty.\nHow do you want to deal with these items?',
				input: [
					'<div class="vex-custom-field-wrapper">',
					'<div class="poVoidPrompt vex-custom-input-wrapper">',
					'<input type="radio" id="rcvSave" class="poVoidRadio" name="rcvZero" value="save" checked />',
					'<label for="rcvSave" class="poVoidLabel">Save to Open Order List</label><br>',
					'<input type="radio" id="rcvDelete" class="poVoidRadio" name="rcvZero" value="delete" />',
					'<label for="rcvDelete" class="poVoidLabel">DO NOT save zero items</label>',
					'</div>',
					'</div>'
				].join(''),
				className: 'vex-theme-multiButtons',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, { text: 'Proceed' }),
					$.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
				],
				afterOpen: function () {
					pauseBodyKeypress();
					$('.vex-content').draggable();
				},
				callback: function (data) {
					if (data) {
						let option = data.rcvZero;
						let newData = {"data": []};
						if (option == 'delete') {
							$.each(poItems.data, function (idx, item) {
								//---- copy non-zero qty item
								if (item.cases !== 0 || item.units !== 0) {
									newData.data.push(item);
								}
							});
							//---- now renumber the array
							$.each(newData.data, function (idx, item) {
								item.rowId = (idx + 1) + '.';
							})
							poItems = newData;
							localStorage.setItem('poItems', JSON.stringify(poItems));

							purchTableLoadData();
							updateTotalBox();

							fillInfoBox(poItems.data.at(-1));
						} else {
							rcvSave = true;
						}
					}
		
					resetBodyKeypress();
					focusBarc();
					poPost(false, rcvSave, false);
				}
			});
			return;
		}
		poPost(false, rcvSave, lFromPurchase);
	}
}

function poPost(fromVoid, rcvSave, lFromPurchase) {
	rcvSave = rcvSave || false;

	let vendNbr   = $('#PO_vendorSelect').val();
	let items     = JSON.stringify(poItems);
	let total     = $('#total').text();
	let receiving = (isReceive && !fromVoid) || (lFromPurchase && poFinishOpts.poReceive); // voided receiving sessions go to open PO list
	let errorText = ((receiving) ? 'receiver' : 'purchase order');
//elog( 'purchSet.rcvVari:', purchSet.rcvVari, 'rcvPrintDoc:', purchSet.rcvPrintDoc );

	$.spin(true);

	$.post('poPost?', {
		"vendnum":   vendNbr,
		"items":     items,
		"num":       poNumber,
		"freight":   poFreight,
		"total":     total,
		"notes":     poNotes,
		"receiver":  rcvNumber,
		"invNbr":    rcvInvoice,
		"receiving": receiving,
		"rcvSave":   rcvSave
	},
		function (reply) {
			$.spin(false);
			if (fromVoid && reply.result === 'success') {
				$.spin(false);
				actOnClear();

			} else if (!receiving && reply.result === 'success' && poFinishOpts.poPrint) {
				poPrint(reply, poItems, poNotes);
				if (poFinishOpts.poExport) {
					poNumber = reply.poNum;
					poExport(true);
				} else {
					actOnClear();
				}

			} else if (!receiving && reply.result === 'success' && poFinishOpts.poExport) {
				poNumber = reply.poNum;
				poExport(true);

			} else if (receiving && reply.result === 'success' && (purchSet.rcvPrintDoc || purchSet.rcvVari)) {
				rcvPrint(reply, poItems, purchSet, poNotes);
				actOnClear();

			} else if (reply.result === 'success') {
				actOnClear();

			} else {
				swal("Oops...", "Error posting: " + reply.msg, "error");
			}
		})
		.fail(function (xhr, ajaxOptions, thrownError) {
			$.spin(false);
			swal("Oops...", "Error posting " + errorText + ": " + thrownError, "error");
		})
		.always(function () { $.spin(false); });
}

function poExport(fromFinish) {
	let file = 'PO_' + poNumber;

	vex.dialog.open({
		unsafeMessage: '<h3>Export Order?</h3>' +
			'Confirm creating an export file of this order.',
		input: [
			'<div class="vex-custom-field-wrapper">',
			'<div class="poVoidPrompt vex-custom-input-wrapper">',
			'<input type="radio" id="exportCSV" class="poVoidRadio" name="poExportType" value="csv" checked />',
			'<label for="exportCSV" class="poVoidLabel">Create a CSV file</label><br>',
			'<input type="radio" id="exportXLSX" class="poVoidRadio" name="poExportType" value="excel" />',
			'<label for="exportXLSX" class="poVoidLabel">Create an Excel file</label>',
			'</div>',
			'</div>'
		].join(''),
		className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: 'Create' }),
			$.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
		],
		afterOpen: function () {
			pauseBodyKeypress();
			$('.vex-content').draggable();
		},
		callback: function (data) {
			if (data) {
				let option = data.poExportType;
				if (option == 'csv') {
					let csv = convertToCSV(poItems.data, 'csv');
					downloadCSV(file + '.csv', csv, fromFinish);
				} else {
					let obj = convertToCSV(poItems.data, 'excel');
					convertToXLSX(obj, file, fromFinish);
				}
			} else if (fromFinish) {
				actOnClear()
			};

			resetBodyKeypress();
		}
	});
}

function poImport() {
	/*
	if ( $("#PO_vendorSelect").val() == '0' ) {
		vexAlert( "Please select the vendor first.", "PO_vendorSelect" );
		return;
	}
	*/
	$('#importSubmit').prop( 'disabled', true );
	$('#modalImport').show();
}

function newImportFileType() {
	let inVendors = $("#PO_vendorSelect")[0].options;
	$('#customImportVendors').empty();
	$.each(inVendors, function (i, item) {
		$('#customImportVendors').append($('<option>', { 
			value: item.value,
			text : item.text 
		}));
	});

	$("#importTypeSetSave").attr("disabled", true);

    $("#Modal_importTypeSet").fadeIn("slow");

	let ht=$("#Modal_importTypeSet_Content").height();
	ht = (0.9*ht) - 270;

	$("#importTypeSetFieldPicker").height(ht+"px");

	$("#importTypeName").focus();
}

function closeimportTypeSettings() {
    $("#Modal_importTypeSet").fadeOut("slow");

	$("#importTypeName").val("");
	$("#importTypeNbrFields").val("5");

	$("#importTypeSetInstruction").text('Please enter info above and press "Apply".');
	$("#importTypeSetFieldPicker select").remove();
	$("#importTypeSetFieldPicker label").remove();
	$("#importTypeSetFieldPicker br").remove();

	$("#importTypeInfo").children().attr("disabled", false);
	$("#importTypeInfo label").css("color", "");
}

function importTypeHeaderToggle(el) {
	let chkd = $(el).is(":checked");

	if (chkd) {
		$("#importTypeHeaderYN").css("color", "#349896");
		$("#importTypeHeaderYN").text("Yes");
	} else {
		$("#importTypeHeaderYN").css("color", "#f15b7e");
		$("#importTypeHeaderYN").text("No");
	}
}

function importTypeInfoCheck() {
	if ($("#importTypeName").val().length === 0) {
		vexAlert( "Please name this import type.", "importTypeName" );
		return;
	} else if ($("#customImportVendors").val() === "0") {
		vexAlert( "Please select the vendor.", "customImportVendors" );
		return;
	}

	$("#importTypeInfo").children().attr("disabled", true);
	$("#importTypeInfo label").css("color", "gray");

	updateImportFields();
}

function updateImportFields() {
	let html = "";
	const nbrFields = $("#importTypeNbrFields").val();
	const opts = "<option value='1'>Ignore this field</option>" + 
	             "<option value='2'>Invoice Number</option>" + 
	             "<option value='3'>Invoice Date</option>" + 
				 "<option value='4'>LiquorPOS code_num</option>" + 
				 "<option value='5'>Unit Barcode</option>" +
				 "<option value='6'>Case Barcode</option>" +
				 "<option value='7'>Carrier Barcode</option>" +
				 "<option value='8'>Vendor's Item Code</option>" + 
				 "<option value='9'>Item Description</option>" + 
				 "<option value='10'>Size</option>" + 
				 "<option value='11'>Units per Case</option>" + 
				 "<option value='12'>Units per Carrier</option>" +
				 "<option value='13'>Unit Cost</option>" + 
				 "<option value='14'>Case Cost</option>" + 
				 "<option value='15'>Nbr of Units</option>" + 
				 "<option value='16'>Nbr of Cases</option>" + 
				 "<option value='17'>Line Total</option>"
		 
	$("#importTypeSetInstruction").text("Match your fields below to item data.");
	$("#importTypeSetSave").attr("disabled", false);

	for (let i = 0; i < nbrFields; i++) {
		let n = i+1;
		html += "<label for='importField" + n + "'>Field " + n + ":</label>" +
                "<select class='importSelects' id='importField" + n + "' " +
				"onchange='importFieldOptions(this);' data-formerValue='0'>" + 
				"<option value='0'>Select...</option>" + 
				opts +
				"</select><br>";
	}

	html += "<br>"

	$("#importTypeSetFieldPicker").append(html);
}

function importFieldOptions(el) {
	let oldOpt   = parseInt( $(el).attr("data-formerValue") );
	let thisOpt  = $(el).val();
	let nIdx     = oldOpt - 1;
	const optArr = [
		[1, "<option value='1'>Ignore this field</option>"],
		[2, "<option value='2'>Invoice Number</option>"], 
	    [3, "<option value='3'>Invoice Date</option>"], 
	    [4, "<option value='4'>LiquorPOS code_num</option>"], 
		[5, "<option value='5'>Unit Barcode</option>"],
		[6, "<option value='6'>Case Barcode</option>"],
		[7, "<option value='7'>Carrier Barcode</option>"],
		[8, "<option value='8'>Vendor's Item Code</option>"], 
		[9, "<option value='9'>Item Description</option>"], 
		[10, "<option value='10'>Size</option>"], 
		[11, "<option value='11'>Units per Case</option>"],
		[12, "<option value='12'>Units per Carrier</option>"],
		[13, "<option value='13'>Unit Cost</option>"], 
		[14, "<option value='14'>Case Cost</option>"], 
		[15, "<option value='15'>Nbr of Units</option>"], 
		[16, "<option value='16'>Nbr of Cases</option>"], 
		[17, "<option value='17'>Line Total</option>"]
	];

	//elog("oldOpt = ", oldOpt, "thisOpt = ", thisOpt, "nIdx = ", nIdx);

	$(el).attr("data-formerValue",thisOpt);

	if (thisOpt > 1 ) {
		$(".importSelects").not(el).find("option[value='" + thisOpt + "']").remove();
	}

	if (oldOpt > 1) {
		let row = optArr.find( findImportOption( oldOpt ) );
		// now loop thru all selects not(el)
		   // get array of options for this select
		   // look for option value >= nIdx
		   // add html either before(>) or after(=)
		$(".importSelects").not(el).each( function(inx,select) {
			let opts = $(select).find("option");
			opts.each( function(idx,el) {
				if ($(el).attr("value") === nIdx) {
					$(el).after( row[1] );
					return false;
				} else if ($(el).attr("value") > nIdx) {
					$(el).before( row[1] );
					return false;
				}
			});
		});
	}
}

function findImportOption(nIdx) {
	return optArrRow => optArrRow[0] >= nIdx;
}

function saveimportTypeSettings() {
	let doExit = false;
	let arr = [];
	let fields = [
		"bogus",
		"ignore",
		"invNum", 
		"invDate", 
		"code_num", 
		"barcode",
		"barcode_c",
		"barcode_p",
		"intnum", 
		"itemDescrip", 
		"size", 
		"qty_case",
		"pack_qty", 
		"cost", 
		"case_cost", 
		"qty", 
		"case_qty", 
		"total"
	]
	
	// add check for code_num, intnum or barcode

	$(".importSelects").each( function( idx, el ) {
		let val = $(el).val();

		if ( val === "0" ) {
			doExit = true;
			vexAlert( "All fields must be assigned.", $(el).attr('id') );
			return false;
		} else {
			arr.push( fields[val] );
		}
	});

	let locator = ( arr.includes('code_num') || arr.includes('intnum') ||
	                arr.includes('barcode') || arr.includes('barcode_c') || 
					arr.includes('barcode_p') );
	
	if (!locator) {
		vexAlert( "Fields must contain at least one of the following:<br><br>" + 
		          "&#8226;&nbsp;LiquorPOS code_num<br>" + 
				  "&#8226;&nbsp;Vendor's Item Code<br>" + 
				  "&#8226;&nbsp;A barcode", $(".importSelects:first").attr('id') );
		return false;
	}

	if ( doExit ) {
		return;
	}

	
	let settings = { 'name': $("#importTypeName").val(), 
	                 'fields': $("#importTypeNbrFields").val(), 
					 'labels': $("#importTypeHeader").is(":checked"),
					 'vendnum': $("#customImportVendors").val(),
					 'selects': JSON.stringify( arr )
                   };

	$.post( 'saveImportType', settings, function (reply) {
			if (reply.result !== 'success') {
				swal("Error", reply.msg, "error");
				return;
			} else if (reply.imports) {
				// rebuild import type select
				$("#importFormat").empty();
				$("#importFormat").append($("<option>",{
					value: 'southern',
					text: 'Southern/Glazier'
				}));
				$("#importFormat").append($("<option>",{
					value: 'dsdlink',
					text: 'Encompass/DSDLink'
				}));

				$.each(reply.imports, function(idx, subArr){
            		$("#importFormat").append($("<option>",{
                  		value: subArr[0],
                  		text: subArr[1]
            		}));
				});

				$("#importFormat").val(reply.pick);

				closeimportTypeSettings();
			}
	});
}

function poImportDo() {
	let vendors = $("#importVendorSelect").val();
	let format = $("#importFormat").val();
	let process = $("input[name='importProcess']:checked").val();

	if (vendors.length === 0){
		vexAlert("Please select one or more vendors.", "importVendorSelect");
		return;
	}

	if (format === 'select') {
		vexAlert("Please select the file format.", "importFormat");
		return;
	}

	if (format.substring(0, 4) === 'pdf_') {
		pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdfjs/pdf.worker.js';
		window.URL = window.URL || window.webkitURL || window.mozURL;

		let file = document.getElementById('importFileInput').files[0];
		if (typeof file !== 'undefined') {
			var filename = file.name;
		} else {
			return;
		};
		let url = URL.createObjectURL(file);

		$.spin(true);

		extractText(url).then(
			function (array) {
				let pdfData = {
					file: filename,
					pages: totalPageCount,
					vendnum: JSON.stringify(vendors),
					source: format,
					process: process,
					data: JSON.stringify(array)
				}

				console.log(array);
				$.post("pdfImport?", pdfData, function(reply) {
					$.spin(false);
					if (reply.result !== 'done') {
						swal('Error', reply.msg, 'error');
						return;
					}
					loadImport(reply);
					$("#PO_vendorSelect").val(vendors[0]);
					closeImport();
					poReceive();
				});
			},
			function (reason) {
				console.error(reason);
				$.spin(false);
				vexAlert("ERROR: " + reason);
			},
		);
	} else {
		let doHdr = (format === 'fintech' || format === 'southern');
		let config = {
			delimiter: ',',
			header: doHdr,
			dynamicTyping: false,
			skipEmptyLines: true,
			complete: importParseComplete
		};

		if (!$('#importFileInput')[0].files.length) {
			swal("Import", "Please pick a file to import.", "warning");
			return;
		}

		$('#importFileInput').parse({
			config: config,
			error: function (err, file) {
				console.log("CSV Parsing Error:", err, file);
				swal("Import", "An error decoding your file has occurred.", "error");
				closeImport();
				return;
			}
		});
	}
}

/**
  * Extracts text and coordinates from a PDF file
  * @param {url} url to pdf file
  *
  */
 function extractText(pdfUrl) {
	var pdf = pdfjsLib.getDocument(pdfUrl);
	return pdf.promise.then(function (pdf) {
		totalPageCount = pdf.numPages;
		console.log('nbr of pages:', totalPageCount);
		var countPromises = [];

		for (
			var currentPage = 1;
			currentPage <= totalPageCount;
			currentPage++
		) {
			var page = pdf.getPage(currentPage);
			countPromises.push(
				page.then(function (page) {
					const vport = page.getViewport({ scale: 1.0 });
					const high = vport.height;

					var textContent = page.getTextContent();
					return textContent.then(function (text) {
						return text.items
							.map(function (s) {
								const tm = s.transform;
								let x = tm[4];
								let y = high - tm[5];
								return [s.str, x, y];
							});
					});
				}),
			);
		}

		return Promise.all(countPromises).then(function (arrays) {
			let newArr = [];
			arrays.forEach((arr) => { newArr.push(arr) });
			return newArr;
		});
	});
}

function importParseComplete( results, x, y, flag ) {
	if (results && results.data && results.data.length > 0) {
		const arr = results.data;
		const source = $("#importFormat").val();
		const file = $("#importFileName").text();
		const vendors = $("#importVendorSelect").val();

		if (!flag) {
			flag = false;
		}

		const fn = ([keys, ...values]) => 
		    values.map(vs => Object.fromEntries(vs.map((v, i) => [keys[i], v])));
		const result = fn(arr);
		
		console.log(result)

		closeImport();

		$.post('poImport',
			{
				"source": source,
				"data": JSON.stringify(result),
				"file": file,
				"skipFileChk": true,
				"vendnum": JSON.stringify(vendors),
			},
			function (reply) {
				if (reply.result === 'already processed') {
					// prompt whether to process anyway
					// if yes, recall this function with a flag to skip file check
					vex.dialog.confirm({
						unsafeMessage: '<h3>Already Processed!</h3>' +
							'<br>It appears that this file was processed on ' + reply.date + 
							'<br>for PO Nbr: ' + reply.poNbr +
							'<br>Do you wish to proceed anyway?',
						className: 'vex-theme-multiButtons',
						buttons: [
							$.extend({}, vex.dialog.buttons.YES, { text: 'Proceed' }),
							$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
						],
						afterOpen: function () {
							pauseBodyKeypress();
							playNotify();
						},
						callback: function (data) {
							if (!data) {
								resetBodyKeypress();
								return;
							}
							resetBodyKeypress();
							importParseComplete(results, x, y, true);
							return;
						}
					});
					return;
				}

				if (!reply.vendSure) {
					let vendName = (!reply.vendName) ? reply.VENDNAME : reply.vendName;  // bug in xbase++ sending all caps
					vex.dialog.confirm({
						unsafeMessage: '<h3>Verify Vendor</h3>' +
									'<br>The import shows the vendor as:' +
									'<br><i>"' + vendName + '"</i>' +
									'<br>Please select the match in your database.',
						input: [
							'<div class="vex-custom-field-wrapper">',
							'<div class="poVoidPrompt vex-custom-input-wrapper">',
							'<label for="importVendSelect">Select vendor:&nbsp;</label>',
							'<select id="importVendSelect" name="importVendSelect">',
							'</select>',
							'</div>',
							'</div>'
						].join(''),
						className: 'vex-theme-multiButtons',
						buttons: [
							$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
							$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
						],
						afterOpen: function () {
							pauseBodyKeypress();

							// populate <select>
							let $options = $("#PO_vendorSelect > option").clone();
							$('#importVendSelect').append($options);

							$('.vex-content').attr('id', 'importVendorBox');
							playNotify();
						},
						callback: function (data) {
							if (!data) {
								resetBodyKeypress();
								return;
							}
							resetBodyKeypress();
							vex.closeAll();
							reply.vendNbr = data.importVendSelect;
							$.post('setVendorMatch?', {
								"vendNbr": reply.vendNbr,
								"vendName": vendName,
								"source": reply.source
							});

							loadImport(reply);
						}
					});
				} else if (reply.result === 'done' ) {
					loadImport(reply);
				}

		    }
		);
	} else {
		swal('Error', 'Unable to extract data from file.', 'error');
	}
}

function loadImport(reply) {
	if (reply.result === 'fail') {
		swal('Error', reply.msg, 'error');
		return;
	}

	$.each(reply.items, function (idx, line) {
		let row = idx + 1;
		poItems.data.push(line);
		poItems.data[idx].rowId = row + '.';
	});
	localStorage.setItem('poItems', JSON.stringify(poItems));

	poOpenOrder = true;

	if (reply.freight) {
		poFreight = reply.freight;
		localStorage.setItem('poFreight', poFreight );
	}

	closeOpenOrders();

	purchTableLoadData();

	updateTotalBox();

	purchTableDivSize();

	// store vars
	poNumber = reply.poNbr;
	poVendor = reply.vendNbr;
	rcvInvoice = reply.invNbr;

    vendorPool = reply.vendorPool;

	localStorage.setItem('poNumber', poNumber);
	localStorage.setItem('poVendor', poVendor);
	localStorage.setItem('rcvInvoice', rcvInvoice);
	localStorage.setItem('vendorPool', JSON.stringify(vendorPool));

	$('#PO_orderNbr').text( ((poNumber === 'undefined') ? 'n/a' : poNumber) );
	$('#invoiceNbrInput').val(rcvInvoice);
	$('#PO_vendorSelect').val(poVendor);

	$('#invoiceSpan').show();

	if (reply.newItems && reply.newItems > 0) {
		const txt = '<h3>Unmatched Items in Order</h3>' +
					'This order contains ' + reply.newItems + ' new or unmatched items, ' +
					'shown in orange.<br><br>' +
					'Use the item info window to set prices for new items,<br>' + 
					'-- OR --' + 
					'<br>Use the match tool to ' +
					'find the existing item in your inventory.';
		vexAlert(txt);

		paintCurrentLine(1);
		resetBodyKeypress();
	}
	paintCurrentLine(1);
	resetBodyKeypress();
}

function closeImport() {
	$('#modalImport').hide();
	$('#importFileInput').val('');
	$('#importFormat').val('select');
	document.querySelector('#importVendorSelect').reset();
	$('#importFileName').text('No file picked.');
}

function importFileButtonChanged() {
    let str = $('#importFileInput').val();
    let res = str.split('\\').pop().split('/').pop();
    $('#importFileName').text('File: ' + res);
	$('#importSubmit').prop( 'disabled', false );
}


function loadAllItems() {
	$.spin(true);
	$.post('loadAllItems?', {'vendnum': poVendor},
	    function (reply) {
			if (reply.result !== 'fail') {
				$.each(reply.items, function (idx, line) {
					let row = idx + 1;
					poItems.data.push(line);
					poItems.data[idx].rowId = row + '.';
				});
				localStorage.setItem('poItems', JSON.stringify(poItems));
			
				poOpenOrder = true;
			
				if (reply.freight) {
					poFreight = reply.freight;
					localStorage.setItem('poFreight', poFreight );
				}
			
				closeOpenOrders();
			
				purchTableLoadData();
			
				updateTotalBox();
			
				purchTableDivSize();
			
				// store vars
/*				poNumber = reply.poNbr;
				localStorage.setItem('poNumber', poNumber);
				$('#PO_orderNbr').text( ((poNumber === 'undefined') ? 'n/a' : poNumber) );

				$('#invoiceSpan').show();
*/			
				$('#purchTableBody').scrollTop(0);

				paintCurrentLine(1);
				resetBodyKeypress();
				$.spin(false);
			} else {
				$.spin(false);
				swal("Oops...", "Error getting items: " + reply.msg, "error");
			}
	})
	.fail(function (xhr, ajaxOptions, thrownError) {
		$.spin(false);
		swal("Oops...", "error getting vendors: " + thrownError, "error");
	})
	.always( function() {$.spin(false);});
}

function saveVendorInvoiceNbr() {
	if (poNumber !== '' && rcvInvoice !== '') {
		$.post('saveVendorInvoiceNbr?', {
			"poNum":  poNumber,
			"invNum": rcvInvoice
		});
	}
}

function poReceive() {
	toggleTips(false);

	if (poItems.data.length === 0) {
		poEdit('receive');
		return;
	}

	let codes = [];
	$.each(poItems.data, function (idx, item) {
		codes.push(item.code_num);
	});

	$.post('rcvGetNbr?',
		{ "codes": JSON.stringify(codes) },
		function (reply) {
			if (reply.result === 'success') {
				rcvNumber = reply.rcvNbr;
				localStorage.setItem("rcvNumber", JSON.stringify(rcvNumber));

				switchToReceive();
			} else {
				swal("Oops...", "Error getting receiver nbr: " + reply.result, "error");
			}
		}
	);
}

function endReceive(lIn) {
	const rcvNbr = rcvNumber;

	console.log( "click in:", lIn);
	isReceive = false;
	console.log( "isReceive", isReceive );
	localStorage.setItem('isReceive', JSON.stringify(isReceive));
	rcvNumber = "";
	localStorage.setItem("rcvNumber", JSON.stringify(rcvNumber));

	$('#receiverNbr').text( '' );
	$('#invoiceNbrInput').val( '' );

	$('#saveBtnDiv').show();
	$('#statTable').show();
	$('#receiverSpan').hide();
	$('#invoiceSpan').hide();
	$('#receiveInfo').hide();
	$('#receiveModeDiv').hide();

	$('#receiveBtnIcon').text('checklist_rtl').css('color','');
	$('#receiveBtnText').css('color','');
	$('#receiveBtn').off('click');
	$('#receiveBtn').on('click', poReceive);
	$('.ui-helper-hidden-accessible').hide();
	$('#receiveBtn').attr('title', 'Receive PO');

	$.each( poItems.data, function(idx,item) {
		$('#purchTableBody tr:nth-child('+(idx+1)+') td:nth-child(8) .material-icons').remove();
	});

	if (lIn) {
		$.post('rcvRecycleNbr?', {rcvNbr: rcvNbr});
	}
}

function switchToReceive() {
	isReceive = true;
	localStorage.setItem('isReceive', JSON.stringify(isReceive));

	$('#receiveBtnIcon').text('cancel').css('color','red');
	$('#receiveBtnText').css('color','red');
	$('#receiveBtn').off('click');
	$('#receiveBtn').on('click', function() { endReceive(true); });
	$('.ui-helper-hidden-accessible').hide();
	$('#receiveBtn').attr('title', 'Cancel Receive');

	$('#receiverNbr').text( rcvNumber );
	$('#invoiceNbrInput').val( rcvInvoice );

	$('#saveBtnDiv').hide();
	$('#statTable').hide();
	//$('#itemBtns').hide();
	//$('#receiveBtn').prop("disabled",true);

	$('#receiverSpan').show();
	$('#invoiceSpan').show();
	$('#receiveInfo').show();
	$('#receiveModeDiv').show();

	$.each( poItems.data, function(idx,item) {
		if (poItems.data[idx].lastCost > poItems.data[idx].unitCost) {
			$('#purchTableBody tr:nth-child('+(idx+1)+') td:nth-child(8)').prepend(
				'<span class="material-icons costDown">straight</span>'
			);
		} else if (poItems.data[idx].lastCost < poItems.data[idx].unitCost) {
			$('#purchTableBody tr:nth-child('+(idx+1)+') td:nth-child(8)').prepend(
				'<span class="material-icons costUp">straight</span>'
			);
		} else {
			$('#purchTableBody tr:nth-child('+(idx+1)+') td:nth-child(8)').prepend(
				'<span class="material-icons costDown">remove</span>'
			);
		}
		//---- save order qty in case a partial receiver is done
		poItems.data[idx].ordCases = poItems.data[idx].cases;
		poItems.data[idx].ordUnits = poItems.data[idx].units;
	});
	
	fillInfoBox( poItems.data[ currLine - 1 ] );
}

function rcvEditPrice() {
	let oldVal = $('#rcvPriceText').text();
	$('#rcvPriceText').attr('oldvalue',oldVal);
	$('#rcvPriceText').hide();
	$('#rcvPriceInputSpan').show();
	setTimeout( function() { toggleTips(false);  $('#rcvPriceInput').focus().select(); }, 10 );
}

function rcvEditQtyCase () {
	let oldVal = $('#rcvQtyCaseText').text();
	$('#rcvQtyCaseText').attr('oldvalue',oldVal);
	$('#rcvQtyCaseText').hide();
	$('#rcvQtyCaseInputSpan').show();
	setTimeout( function() { toggleTips(false);  $('#rcvQtyCaseInput').focus().select(); }, 10 );
}

function postRcvEdit( type, idx, val ) {
	let codenum = poItems.data[idx].code_num;
	let msgText = ( (type==='qty_case') ? 'qty/case' : 'price' );
	let row     = idx + 1;

    $.post('postRcvEdit?', {
		"type":    type,
		"codenum": codenum,
		"value":   val
	    },
		function(reply) {
			let s = "";
			if (reply.result==='success') {
				if (type==='price') {
					poItems.data[idx].price = val;
					localStorage.setItem('poItems', JSON.stringify(poItems));
				} else {
					poItems.data[idx].caseQty = val;
					localStorage.setItem('poItems', JSON.stringify(poItems));
				}
				s = "<span class='messageText'>The " + msgText + " for line " + row + " has been updated.</span><span class='messageClose' onclick='messageRemove();'>&times;</span>";
			} else {
				s = "<span class='messageText'>Error trying to update " + msgText + " for line " + row + ": " + reply.result + "</span><span class='messageClose' onclick='messageRemove();'>&times;</span>";
			}
			$(document).message({ content: s, html: true, expire: 8000 });	
		}	
	);
}

function showItemOrder( item ) {
	/*
	$('#itemOrderPhantom4').hide();
	$('label[for="itemOrderPhantom4"]').hide();
	$('#itemOrderBroken').hide();
	$('label[for="itemOrderBroken"]').hide();
	$('#itemOrderBreak1').hide();
	$('#itemOrderBreak2').hide();
	$('#itemOrderForm').css({margin-top: '30px'})
	*/
	$(window).off("resize");
	/*
	poDoTax: false,
	poDoDepos: false,
	poTaxType: 'A',
	poBroken: false,
	poTooltips: true
    */

	$('#itemOrderAdd').off('click');

	const caseQty = AutoNumeric.getAutoNumericElement('#itemOrderCaseQty');
	const qtyPerCase = AutoNumeric.getAutoNumericElement('#itemOrderQtyPerCase');
	const caseCost = AutoNumeric.getAutoNumericElement('#itemOrderCaseCost');
	const unitQty = AutoNumeric.getAutoNumericElement('#itemOrderUnitQty');
	const unitCost = AutoNumeric.getAutoNumericElement('#itemOrderUnitCost');
	const broken = AutoNumeric.getAutoNumericElement('#itemOrderBroken');
	const total = AutoNumeric.getAutoNumericElement('#itemOrderTotalCost');
	const suggested = suggestedQty( item );

	let cases = Number( suggested.split("C")[0] );
	let units = Number( suggested.match(/C(.*?)U/i)[1] );

	toggleBroken( false );

	// fill text spans & inputs on form and text on infoBox
	/* Form first */
	$('#itemOrderHdr2').text( item.brand + ' ' + item.descrip + ' ' + item.size );
	caseQty.set( cases );
	qtyPerCase.set( item.caseQty );
	caseCost.set( item.caseQty * item.unitCost );
	unitQty.set( units );
	unitCost.set( item.unitCost );
	broken.set('0');
	total.set( item.caseQty * item.unitCost );
	
	/* Now the infoBox */
	fillInfoBox( item );

	$('#modalItemOrder').show();
	setTimeout( function(){
		$('#itemOrderForm input').prop("disabled",false);
		$('#itemOrderAdd').prop("disabled",false);
		$('#itemOrderAdd').on('click', function() { addItem2Order( item ) });
		$('#itemOrderCaseQty').focus();
		setTimeout( function(){
			$('#itemOrderCaseQty').select();
		},10);
	},10);
}
function closeItemOrder() {
	$('#modalItemOrder').hide();

	$('#itemOrderForm input').prop("disabled",true);
	$('#itemOrderAdd').prop("disabled",true);

	$('#itemOrderAdd').off('click');

	$(window).resize(function (e) {
		purchTableDivSize();
		paintCurrentLine();
		$('#purchTableBody').focus();// $('#scanText').focus();
	});
}
function toggleBroken( lActive ) {
	if (lActive) {
		$('#itemOrderBroken').prop("disabled", false);
		$('label[for="itemOrderPhantom4"]').css({ color: '' });
		$('label[for="itemOrderBroken"]').css({ color: '' });
	} else {
		$('#itemOrderBroken').prop("disabled", true);
		$('label[for="itemOrderPhantom4"]').css({ color: 'gray' });
		$('label[for="itemOrderBroken"]').css({ color: 'gray' });
	}
}

function itemOrderCalc(el) {
	const caseQty = AutoNumeric.getAutoNumericElement('#itemOrderCaseQty');
	const qtyPerCase = AutoNumeric.getAutoNumericElement('#itemOrderQtyPerCase');
	const caseCost = AutoNumeric.getAutoNumericElement('#itemOrderCaseCost');
	const unitQty = AutoNumeric.getAutoNumericElement('#itemOrderUnitQty');
	const unitCost = AutoNumeric.getAutoNumericElement('#itemOrderUnitCost');
	const broken = AutoNumeric.getAutoNumericElement('#itemOrderBroken');
	const total = AutoNumeric.getAutoNumericElement('#itemOrderTotalCost');

	let nQC = parseInt( $("#itemOrderCaseQty").val() );
	let nCQ = parseInt( $("#itemOrderQtyPerCase").val() );
	let nCC = parseFloat( $("#itemOrderCaseCost").val() );
	let nQU = parseInt( $("#itemOrderUnitQty").val() );
	let nUC = parseFloat( $("#itemOrderUnitCost").val() );
	let nBC = parseFloat( $("#itemOrderBroken").val() );
	let nTC = parseFloat( $("#itemOrderTotalCost").val() );
	let nTT = ( nQC * nCC ) + ( nQU * nUC );
	let cEl = $(el).attr("id");

console.log( 'cEl:', cEl );

	switch ( cEl ) {
		case 'itemOrderCaseQty':
			nTT = ( nQC * nCC ) + ( nQU * nUC );
			total.set( nTT );
			break;

		case 'itemOrderQtyPerCase':
			nUC = nCC / Math.max( nCQ, 1 );
			unitCost.set( nUC );
			break;

		case 'itemOrderCaseCost':
			nUC = nCC / Math.max( nCQ, 1 );
			unitCost.set( nUC );

			nTT = ( nQC * nCC ) + ( nQU * nUC );
			total.set( nTT );
			break;

		case 'itemOrderUnitQty':
			toggleBroken( nQU != 0 );

			nTT = ( nQC * nCC ) + ( nQU * nUC );
			total.set( nTT );
			break;

		case 'itemOrderUnitCost':
			nCC = nUC * nCQ;
			caseCost.set( nCC );

			nTT = ( nQC * nCC ) + ( nQU * nUC );
			total.set( nTT );

			break;

		case 'itemOrderBroken':
			nTT = ( nQC * nCC ) + ( nQU * ( nUC + nBC ) );
			total.set( nTT );

			break;

		case 'itemOrderTotalCost':
			let nUnits = ( nQC * nCQ ) + nQU;
			nUC = nTC / Math.max( nUnits, 1 );
			nCC = nUC * nCQ;

			unitCost.set( nUC );
			caseCost.set( nCC );

			break;
	}
}
function roundToTwo(num) {
	num = Math.round( ( num + Number.EPSILON ) * 100 ) / 100;
    return num.toFixed(2);
}
function roundToFour(num) {
	num = Math.round( ( num + Number.EPSILON ) * 10000 ) / 10000;
    return num.toFixed(4);
}
function suggestedQty(item) {
	let units = 0;
	let cases = 0;
	let subPar = 0;
	let caseQty = Math.max(item.caseQty, 1);

	//---- use par qty & reorder pt
	if (item.parQty > 0 && item.reordPt > 0 && item.reordPt > item.onHand + item.onOrder) {
		subPar = item.parQty - item.onHand - item.onOrder;

	//---- use par qty
	} else if (item.parQty > 0 && item.reordPt === 0) {
		subPar = item.parQty - item.onHand - item.onOrder;

	//---- use reorder pt	
	} else if (item.parQty === 0 && item.reordPt > 0) {
		subPar = item.reordPt - item.onHand - item.onOrder;

	//---- use mth yr ago
	} else if (item.parQty === 0 && item.reordPt === 0) {
		subPar = item.yrAgo - item.mtd - item.onHand - item.onOrder;
	}
	
	//---- case lot or units?
	if (subPar > 0 && item.orderLot != 'U') {
		cases = Math.floor(subPar / caseQty);
		cases += (subPar % caseQty > 0 ? 1 : 0);
	} else if (subPar > 0) {
		units = subPar;
	}

	return (cases.toString() + 'C ' + units.toString() + 'U');
}

function addItem2Order( item ) {
	$('#itemOrderForm input').prop("disabled",true);
	$('#itemOrderAdd').prop("disabled",true);

	const caseQty = AutoNumeric.getAutoNumericElement('#itemOrderCaseQty');
	const qtyPerCase = AutoNumeric.getAutoNumericElement('#itemOrderQtyPerCase');
	const unitQty = AutoNumeric.getAutoNumericElement('#itemOrderUnitQty');
	const unitCost = AutoNumeric.getAutoNumericElement('#itemOrderUnitCost');
	const broken = AutoNumeric.getAutoNumericElement('#itemOrderBroken');

	item.cases = caseQty.getNumber();
	item.units = unitQty.getNumber();
	item.caseQty = qtyPerCase.getNumber();
	item.unitCost = unitCost.getNumber();
	item.unitCost += broken.getNumber();
	
	// console.log( 'addItem2Order:',item );

	$('#receiveBtn').prop("disabled",true);

	closeItemOrder();

	poItemAdd( item );
}

const purchSetUp = async () => {
	try {
		purchSet = JSON.parse(localStorage.getItem('purchSet')) || null;
	} catch (err) {
		purchSet = null;
	}

	console.log('purchSet:', purchSet);
	console.log('typeof purchSet:', typeof purchSet);

	$.post( 'poGetDepts', function(reply) {
		if (reply.unauth) {
			vex.dialog.alert({
				unsafeMessage: 'Unauthorized access.',
				className: 'vex-theme-wireframe',
				afterOpen: function() {
					lPauseKeys = true;
					playNotify();
				},
				afterClose: function() {
					lPauseKeys = false;
					window.location.href = 'split.html';
				}
			});
		} else if (reply.aDepts && typeof reply.aDepts === 'object') {
			$.each( reply.aDepts, function( idx, dept ) {
				let row =  '<tr>';
				    row += '<td>' + dept[0] + '</td>';
				    row += '<td>' + dept[1] + '</td>';
					row += '<td><input class="deptTax" id="' + dept[0] + '"></td>';
					row += '</tr>'
				$('#setDeptTable tbody').append( row );
			});

			anTaxRates = new AutoNumeric.multiple('.deptTax', { decimalPlaces: 6, maximumValue: '1' });
			$.each( reply.aDepts, function( idx, dept ) {
				anTaxRates[idx].set(dept[2]);
			});
		}
	});

	if (purchSet == null) {
		$.post('poGetSettings?', function (reply) {
			if (reply.noData) {
				console.log('received reply:', reply, 'using default settings');
				purchSet = {
					poDoDepos:   false,
					poDoTax:     false,
					poTaxType:   'A',
					poBroken:    false,
					poTooltips:  true,
					poLoadSort:  'A',
					rcvVari: false,
					rcvPrintDoc: false,
					rcvDocType:  'A'
				}
				
			} else {
				console.log('purchSetUp defined by host');
				purchSet = {
					poDoDepos:   reply.poDoDepos,
					poDoTax:     reply.poDoTax,
					poTaxType:   reply.poTaxType,
					poBroken:    reply.poBroken,
					poTooltips:  reply.poTooltips,
					poLoadSort:  reply.poLoadSort,
					rcvVari:     reply.rcvVari,
					rcvPrintDoc: reply.rcvPrintDoc,
					rcvDocType:  reply.rcvDocType
				}
			}
			localStorage.setItem('purchSet', JSON.stringify(purchSet));
			updateTotalBox();
		});
	} else {
		console.log('purchSetUp found purchSet === null');
	}
}

function showSettings() {
	let check  = $('#setDoTax');
	let check2 = $('#setPrintRcvDoc')

	toggleTips(false);

	// console.log( 'showSettings, purchSet:', purchSet );

	$('#setDeposit').prop('checked', purchSet.poDoDepos);
	$('#setDoTax').prop('checked', purchSet.poDoTax);
	$('#setBroken').prop('checked', purchSet.poBroken);
	$('#setTooltips').prop('checked', purchSet.poTooltips);
	$('input[name="taxType"][value="' + purchSet.poTaxType + '"]').prop('checked', true);
	$('#setCostVari').prop('checked', purchSet.rcvVari);
	$('#setPrintRcvDoc').prop('checked', purchSet.rcvPrintDoc);
	$('input[name="rcvDocType"][value="' + purchSet.rcvDocType + '"]').prop('checked', true);
	$('#rcvRememberOpt').prop('checked', poFinishOpts.rcvRemember);

	//	poFinishOpts.rcvRemember = $("#rcvFinishRemember").prop('checked');

	if (purchSet.poLoadSort === 'A') {
		$('#setLoadAllDept').prop('checked', true);
		$('#setLoadAllBrand').prop('checked', false);
	} else {
		$('#setLoadAllDept').prop('checked', false);
		$('#setLoadAllBrand').prop('checked', true);
	}


	toggleTaxSet( check );
	toggleRcvDocSet( check2 );

	$('#modalSettings').show();
	$( "#settingsMain" ).tabs( "option", "active", 0 );
}
// poFinishOptions()

function closeSettings() {
	let disabled = !$( "#setTooltips" ).is(":checked" );
	// console.log( 'tooltips disabled =',disabled);

	$( document ).tooltip( "option", "disabled", disabled );

	$('#modalSettings').hide();

	hideDepts(false);
}

function settingsSave() {
	purchSet.poDoDepos = $('#setDeposit').prop('checked');
	purchSet.poDoTax = $('#setDoTax').prop('checked');
	purchSet.poTaxType = $("input[name='taxType']:checked").val();
	purchSet.poBroken = $('#setBroken').prop('checked');
	purchSet.poTooltips = $('#setTooltips').prop('checked');
	purchSet.poLoadSort = $("input[name='sortType']:checked").val();
	purchSet.rcvVari = $('#setCostVari').prop('checked');
	purchSet.rcvPrintDoc = $('#setPrintRcvDoc').prop('checked');
	purchSet.rcvDocType = $("input[name='rcvDocType']:checked").val();
	poFinishOpts.rcvRemember = $('#rcvRememberOpt').prop('checked');

	localStorage.setItem('purchSet', JSON.stringify(purchSet));
	localStorage.setItem("poFinishOpts", JSON.stringify(poFinishOpts));

	$.post('poSaveSettings?', {
		poDoDepos: purchSet.poDoDepos,
		poDoTax: purchSet.poDoTax,
		poTaxType: purchSet.poTaxType,
		poBroken: purchSet.poBroken,
		poLoadSort: purchSet.poLoadSort,
		rcvVari: purchSet.rcvVari,
		rcvPrintDoc: purchSet.rcvPrintDoc,
		rcvDocType: purchSet.rcvDocType,
		poTooltips: purchSet.poTooltips
	});

	saveTaxRates();

	closeSettings();
}

function saveTaxRates() {
	let aTax = [];

	$('#setDeptTable tbody tr').each( function( idx, el ) {
		let nbr = $(this).find('td').first().text();
		let int = parseInt(nbr, 10)
		let tax = anTaxRates[ idx ].getNumber();
		aTax.push( [int, tax] );
	});

	console.log( 'aTax:', aTax );

	$.post( 'saveTaxRates?', {aTax: JSON.stringify(aTax)}, function(reply) {
		if (reply.reply !== 'success') {
			swal("Oops...", "Error saving tax rates: " + reply.reply, "error");
		}
	})
	.fail(function (xhr, ajaxOptions, thrownError) {
		swal("Oops...", "error getting vendors: " + thrownError, "error");
	});
}

function toggleTaxSet(check) {
	if ( $(check).is(':checked') ) {
		$('#setTaxPercent').prop('disabled', false);
		$('#setTaxVolume').prop('disabled', false);
		$('label[for="setTaxPercent"').css({color: '#1f6b93'});
		$('label[for="setTaxVolume"').css({color: '#1f6b93'});
		$('#setEditDept').prop('disabled', false);
	} else {
		$('#setTaxPercent').prop('disabled', true);
		$('#setTaxVolume').prop('disabled', true);
		$('label[for="setTaxPercent"').css({color: 'gray'});
		$('label[for="setTaxVolume"').css({color: 'gray'});
		$('#setEditDept').prop('disabled', true);
	}
}

function toggleRcvDocSet(check) {
	if ( $(check).is(':checked') ) {
		$('#setRcvDocGP').prop('disabled', false);
		$('#setRcvDocNotes').prop('disabled', false);
		$('label[for="setRcvDocGP"').css({color: '#1f6b93'});
		$('label[for="setRcvDocNotes"').css({color: '#1f6b93'});
	} else {
		$('#setRcvDocGP').prop('disabled', true);
		$('#setRcvDocNotes').prop('disabled', true);
		$('label[for="setRcvDocGP"').css({color: 'gray'});
		$('label[for="setRcvDocNotes"').css({color: 'gray'});
	}
}

function showDepts() {
	//--- for show/hide effect
	const hideoptions = { "direction" : "right", "mode" : "hide"};
	const showoptions = { "direction" : "left", "mode" : "show"};
	//--- for table caption
	const captions = ['Enter tax rate for each department. Set to zero if untaxed. Ex: Enter 5% as 0.050000',
                      'Enter tax per ounce. Set to zero if untaxed. Ex: Enter 5 cents as 0.05'];
	const taxVals = ['A','B'];
	let taxType = $("input[name='taxType']:checked").val();
	let idx = taxVals.indexOf( taxType );

	$('#setTableCaption').html( captions[idx] );

	$('#setDeptSaveDiv').hide();
	$('#settingsButtonDiv').hide();
	$('#settingsForm').effect('slide', hideoptions, 500);
	$('#setDeptTableDiv').effect('slide', showoptions, 1000,
	    function() {
			$('#setDeptSaveDiv').show();
		    $('#settingsButtonDiv').show();
	    });
	setTimeout( function() { $('#setDeptTable tbody input').first().focus()}, 50 );
}
function hideDepts(doEffect) {
	const hideoptions = { "direction": "left", "mode": "hide" };
	const showoptions = { "direction": "right", "mode": "show" };

	//--- skip effects if settings is closing
	if (doEffect) {
		$('#setDeptSaveDiv').hide();
		$('#settingsButtonDiv').hide();
		$('#setDeptTableDiv').effect('slide', hideoptions, 500);
		$('#settingsForm').effect('slide', showoptions, 1000,
			function () {
				$('#setDeptSaveDiv').show();
				$('#settingsButtonDiv').show();
			});
	} else {
		$('#setDeptTableDiv').hide();
		$('#settingsForm').show();
	}
}

/**
 * Populate PO table with suggested order for selected vendor.
 */
function poSuggOrd() {
	let vendnum = $('#PO_vendorSelect').val();

	if (vendnum === '0') {
		vexAlert( 'Please select a vendor for the order.', 'PO_vendorSelect' );
		return;
	}

	$.spin(true);

	$.post( 'suggOrd?', {'vendnum': vendnum}, function(reply) {
		if (reply.items.length === 0) {
			$.spin(false);
			swal( "No Items", "No items for this vendor found that need to be ordered.", "info" );
		} else {
			$.each( reply.items, function( idx, item ) {
				item.rowId = (idx + 1).toString() + '.';
				item.item  = item.brand.trim() + ( item.descrip.trim().length === 0 ? '' : ' ' ) + item.descrip.trim() + ( item.size.trim().length === 0 ? '' : ' ' ) + item.size.trim();
				item.total = ( item.cases * item.unitCost * item.caseQty ) + ( item.units * item.unitCost );
				item.caseCost = item.caseQty * item.unitCost;
			});

			poItems.data = reply.items;
			localStorage.setItem('poItems', JSON.stringify(poItems));
	
			purchTableLoadData();
			updateTotalBox();

			currLine = 1;
			$('#purchTableBody').scrollTop(0);
			fillInfoBox( poItems.data[0] );
			$('#purchTableBody tr').first().find('td').attr('class','highlighted');

			$.spin(false);
		}
	})
	.fail(function (xhr, ajaxOptions, thrownError) {
		$.spin(false);
		swal("Oops...", "error getting suggestions: " + thrownError, "error");
	})
	.always( function() {
		$.spin(false);
	});
}

/**
 * Add vendor item number to item when missing.
 * @param {Object} span - The <span> element clicked.
 */
 function getItemNbr(span) {
	lPauseKeys = true;
	shortcutToggleFKeys('off');

	let row = $(span).parents('tr').index();
	paintCurrentLine(row + 1);

	vex.dialog.open({
		input: [
			"<h3>Vendor's Item Number for:</h3>",
			'<span class="vexItemText">' + poItems.data[row].item + '</span>',
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<label for="itemNbrInput" class="f7Label">Item nbr:</label>',
			'<input id="itemNbrInput" name="itemNbrInput" type="text" autocomplete="off" spellcheck="false" maxlength="10"/>',
			'</div>',
			'</div>'
		].join(''),
		className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
		afterOpen: function () {
			pauseBodyKeypress();

			//document.getElementById("itemNbrInput").addEventListener("keyup", forceInputUppercase, false);
			$('.vex-content').draggable();
			$("#itemNbrInput").focus();
		},
		callback: function (data) {
			if (!data) {
				resetBodyKeypress();
				focusBarc();
				return;
			} else {
				let nbr = data.itemNbrInput.toUpperCase();
				let vendNbr = $('#PO_vendorSelect').val();

				poItems.data[row].itemNbr = nbr;
				localStorage.setItem('poItems', JSON.stringify(poItems));

				$.post( 'setNewIntnum?', {
					'code_num': poItems.data[row].code_num, 
					'intnum': nbr,
					'vendnum': vendNbr 
				});

				$(span).remove();
				resetBodyKeypress();
				focusBarc();
			}
		}
	})
}

function getFreight() {
	lPauseKeys = true;
	shortcutToggleFKeys('off');

	vex.dialog.open({
		input: [
			"<h3>Freight Amount</h3>",
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<label for="freightInput" class="f7Label">Enter freight amount:</label>',
			'<input id="freightInput" name="freightInput" type="text" autocomplete="off" spellcheck="false" maxlength="10"/>',
			'</div>',
			'</div>'
		].join(''),
		className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
		afterOpen: function () {
			$("#freightInput").val( poFreight );
			new AutoNumeric('#freightInput', { decimalPlaces: 2 });
			
			pauseBodyKeypress();

			$('.vex-content').draggable();
			$("#freightInput").focus();
		},
		callback: function (data) {
			if (!data) {
				resetBodyKeypress();
				focusBarc();
				return;

			} else {
				poFreight = parseFloat( data.freightInput );
				localStorage.setItem('poFreight', poFreight);

				resetBodyKeypress();
				updateTotalBox();
			}
		}
	});
}

function poMakePrint() {
	let vendNbr = $('#PO_vendorSelect').val();

	if (vendNbr === '0') {
		vexAlert('Please select a vendor for this order.', 'PO_vendorSelect');
/*		
		vex.dialog.alert({
			unsafeMessage: 'Please select a vendor for this order.',
			className: 'vex-theme-wireframe',
			afterOpen: function () {
				lPauseKeys = true;
				playNotify();
			},
			afterClose: function () {
				lPauseKeys = false;
				setTimeout(function () { $('#PO_vendorSelect').focus(); }, 25);
				return;
			}
		});
*/
		return;
	}

	$.spin(true);

	$.post('poPrintInfo?',
		{
			"vendnum": vendNbr,
			"num": poNumber,
			"notes": poNotes,
			"receiver": rcvNumber,
			"invNbr": rcvInvoice,
			"receiving": isReceive
		},
		function (reply) {
			$.spin(false);
			poPrint(reply, poItems, poNotes);
			if (reply.poNum !== poNumber) {
				poNumber = reply.poNum;
				localStorage.setItem('poNumber', poNumber);
				$('#PO_orderNbr').text( ((poNumber === 'undefined') ? 'n/a' : poNumber) );
			}
			if (isReceive && rcvNumber !== reply.rcvNbr) {
				rcvNumber = reply.rcvNbr;
				localStorage.setItem("rcvNumber", JSON.stringify(rcvNumber));
				$('#receiverNbr').text(rcvNumber);
			}
		}
	)
	.always(function () {
		$.spin(false);
	});
}

function poEdit(from) {
	if (poItems.data.length === 0) {
		if (!from) { from = 'edit' };
		$.spin(true);

		$.post("getOpenOrders?",
			{
				station: stationID,
				vendNbr: poVendor
			},
			function (reply) {
				$.spin(false);
				if (reply.openOrders) {
					showOpenOrders(reply.openOrders, from);
				} else if (reply.result && reply.msg) {
					vexAlert(reply.msg);
				}
			})
			.fail(function () {
				$.spin(false);
				vexAlert(dict.errorMsg[languageVar]);
			})
			.always(function () { $.spin(false); });
	}
}

function showOpenOrders(data, whereFrom) {
	let db = {
		loadData: function(filter) {
			
		    return $.grep(this.items, function(item) {
				return (!filter.Nbr || item.Nbr.toString().indexOf(filter.Nbr.toString()) > -1)
					&& (!filter.Vendor || item.Vendor.toUpperCase().indexOf(filter.Vendor.toUpperCase()) > -1)  // item.Name.indexOf(cName > -1))
			});
		},
		items: data
	};

	let listFields = [
		{ name: "Nbr", type: "number", width: 50, align: "right", headerTemplate: function() {return 'PO #';} },
		{ name: "Date", type: "date", width: 75, align: "center" },
		{ name: "Vendor", type: "text", width: 300, align: "left" },
		{ name: "Amount", type: "number", width: 75, align: "right", filtering: false },
		{ name: "Lines", width: 50, align: "center", filtering: false, sorting: false }
	];

	pauseBodyKeypress();
	$("#scanText").prop("disabled",true);
	$("#ModalOpenOrders").show();

	$("#openOrdersListTableDiv").jsGrid({
		width: "100%",
		height: "calc( 100% - 80px )",
	
		filtering: true,
		editing: false,
		sorting: true,
		paging: false,
	
		data: data,
		controller: db,
		noDataContent: dict.noOrders[languageVar],
	
		fields: listFields,

		onDataLoaded: function(grid,data) {
//			console.log("onDataLoaded");
			let filter = $("#openOrdersListTableDiv").jsGrid("getFilter");

			for (let [key, value] of Object.entries(filter)) {
				if (value && value.length > 0) {
					var nPos = listFields.findIndex(function (element) { return element.name === key });
					$("#openOrdersListTableDiv tbody td:nth-child(" + (nPos + 1) + ")").each(function () {
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

			$("#openOrdersListTableDiv input").attr( 'type', 'search' );
			$("#openOrdersListTableDiv input").on('search', function(){console.log("change"); if ($(this).val()==="") { $("#openOrdersListTableDiv").jsGrid("loadData")}});
			lPauseKeys = true;

		},
/*
		onInit: function () {
			setTimeout(function () {
				$("#openOrdersListTableDiv input[type='search']").each( function(idx,el) {
				let width = $(this).width() - 14;
				$(this).css({ "width": width }); });
			}, 25 );
		},
*/
		onRefreshed: function() {
			//console.log("onRefreshed");
			let filter = $("#openOrdersListTableDiv").jsGrid("getFilter");
			//console.log( "filter:", filter );

			for (let [key, value] of Object.entries(filter)) {
				//console.log("key:",key,"type:",typeof key);
				if (value && value.length > 0) {
					var nPos = listFields.findIndex(function (element) { return element.name === key });
					$("#openOrdersListTableDiv tbody td:nth-child(" + (nPos + 1) + ")").each(function () {
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

			$("#openOrdersListTableDiv input").attr( 'type', 'search' );

			lPauseKeys = true;
		},
		
		rowDoubleClick: function(args) {
			console.log( 'double click detected');
		},
		
		rowClick: function(args) {
			let sorting = JSON.stringify( $("#openOrdersListTableDiv").jsGrid("getSorting") );
			console.log('sort:', sorting);
			$("#ModalOpenOrders").attr('sort', sorting);

			$.post( "loadOpenOrder?", {"poNum": args.item.Nbr},
			    function(reply) {
					if (reply.items && poItems.data.length > 0) {
						console.log('double tap on order row!');
					} else if (reply.items) {
						$.each( reply.items, function(idx,line) {
							poItems.data.push(line);
						});
						localStorage.setItem('poItems', JSON.stringify(poItems));

						poOpenOrder = true;

						closeOpenOrders();

						purchTableLoadData();

						updateTotalBox();

						purchTableDivSize();
						
						// store vars
						poNumber  = reply.poNumber;
						poNotes   = reply.poNotes;
						poFreight = reply.poFreight;
						poVendor  = reply.vendNbr;

						localStorage.setItem('poNumber', poNumber);
						localStorage.setItem('poNotes', poNotes);
						localStorage.setItem('poFreight', poFreight);
						localStorage.setItem('poVendor', poVendor);

						if (reply.invNbr) {
							rcvInvoice = reply.invNbr;
							localStorage.setItem('rcvInvoice', rcvInvoice);
							$('#invoiceNbrInput').val(rcvInvoice);
							$('#invoiceSpan').show();
						}

						$('#PO_orderNbr').text( ((poNumber === 'undefined') ? 'n/a' : poNumber) );
						$('#PO_vendorSelect').val(poVendor);

						if (reply.poNotes && poNotes.length>0) {
							$('#noteBtnIcon').addClass( 'rainbow-text' );
							$('#noteBtn').attr('title', 'Has Notes');			
						}
					
						if (whereFrom === 'receive') {
							switchToReceive();
						}
						
						paintCurrentLine(1);

						resetBodyKeypress();

				    } else if (reply.msg) {
						vexAlert(reply.msg);
					} else {
						vexAlert(dict.errorMsg[languageVar]);
				    };
			})
			.fail(function () {
				vexAlert(dict.errorMsg[languageVar]);
			});
		}
	});

	//-- pull sort attr from modal to see if we had a sort
	$("#ModalOpenOrders").attr('sort', '');

	$("#openOrdersListTableDiv .jsgrid-header-row > th:eq(0)").click();  // set sort to po nbr

	Mousetrap.bind('home', function () { 
		$(".jsgrid-grid-body").scrollTop(0);
	});

	Mousetrap.bind('end', function () { 
		var maxScroll = $(".jsgrid-grid-body")[0].scrollHeight - $(".jsgrid-grid-body").height();
		$(".jsgrid-grid-body").scrollTop(maxScroll);
	});
}

function closeOpenOrders() {
	$("#scanText").prop("disabled",false);
	$("#ModalOpenOrders").hide();
	$("#openOrdersListTableDiv").empty();
	Mousetrap.unbind('home');
	Mousetrap.unbind('end');
	resetBodyKeypress();
}

function poSaveOrder() {
	if (poItems.data.length === 0) { return; }

	let saveNote = '';

	vex.dialog.confirm({
		unsafeMessage: '<h3 style="margin: 2px 0px;">Save this order as a template?</h3>',
		input: [
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<span id="saveNoteLabel">Enter a note to help identify order:</span>',
			'<br>',
			'<input id="note" class="saveNoteInput" name="note" maxlength="50" autocomplete="off"/>',
			'</div>',
			'</div>'
		].join(''),
		className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
		afterOpen: function () {
			pauseBodyKeypress();

			$('.vex-content').attr('id', 'saveNoteLabelBox');
			$('.vex-content').draggable({
				stop: function (event, ui) { $("#note").focus(); }
			});
			let width = $("#note").width();
			$("#note").css({ "max-width": width, "min-width": width });

			setTimeout(function () { $("#note").focus(); }, 0);
		},
		callback: function (data) {
			if (!data) {
				resetBodyKeypress();
				return;
			}
			resetBodyKeypress();
			let saveNote = data.note;

			let items = JSON.stringify(poItems.data);

			$.post('poSaveOrder?',
				{
					"vendnum": poVendor,
					"poNum":   poNumber,
					"freight": poFreight,
					"items":   items,
					"note":    saveNote
				},
				function (reply) {
					let msg;

					if (reply.result === 'success') {
						if (reply.poNum !== poNumber) {
							poNumber = reply.poNum;
							localStorage.setItem('poNumber', poNumber);
							$('#PO_orderNbr').text( ((poNumber === 'undefined') ? 'n/a' : poNumber) );
						}

						msg = '<span class="messageText">Order #' + poNumber + ' has been saved for future recall.</span>' +
							'<span class="messageClose material-icons" onclick="messageRemove();">close</span>';

						poSaved = true;
						$('#saveBtnDiv').hide();

						$(document).message({
							content: msg,
							html: true,
							expire: 8000
						});

					} else {
						vexAlert(reply.result);
					}
				})
				.fail(function () {
					vexAlert(dict.errorMsg[languageVar]);
				});
		}
	})
}

function poShowOrderTemplates() {
	if (poItems.data.length === 0) {
		$.spin(true);

		$.post( "getOrderTemplates?", {"vendnum": poVendor}, function(reply) {
			$.spin(false);
			if (reply.orders) {
				showOrderTemplates(reply);
			} else if (reply.result && reply.msg) {
				vexAlert(reply.msg);
			}
		})
		.fail(function () {
			$.spin(false);
			vexAlert(dict.errorMsg[languageVar]);
		})
		.always(function() { $.spin( false ); } );
	}
}

function showOrderTemplates(reply) {
	let data = reply.orders;

	let db = {
		loadData: function(filter) {
			
		    return $.grep(this.items, function(item) {
				return (!filter.Nbr || item.Nbr.toString().indexOf(filter.Nbr.toString()) > -1)
					&& (!filter.Vendor || item.Vendor.toUpperCase().indexOf(filter.Vendor.toUpperCase()) > -1)  // item.Name.indexOf(cName > -1))
			});
		},
		items: data
	};

	let listFields = [
		{ name: "orderNbr", type: "number", width: 75, align: "right", headerTemplate: function() {return 'Orig. PO#';} },
		{ name: "date", type: "date", width: 75, align: "center", headerTemplate: function() {return 'Date Saved';} },
		{ name: "note", type: "text", width: 300, align: "left", filtering: false, headerTemplate: function() {return 'Note';} },
		{ name: "lines", width: 50, align: "center", filtering: false, sorting: false, headerTemplate: function() {return 'Lines';} },
		{ name: "vendnum", type: "text", visible: false }

	];

	pauseBodyKeypress();
	$("#scanText").prop("disabled",true);
	$('#orderTemplatesListTitleSpan').append( reply.vendor );
	$("#ModalOrderTemplates").show();

	$("#orderTemplatesListTableDiv").jsGrid({
		width: "100%",
		height: "calc( 100% - 80px )",
	
		filtering: false,
		editing: false,
		sorting: true,
		paging: false,
	
		data: data,
		controller: db,
		noDataContent: dict.noOrders[languageVar],
	
		fields: listFields,

		onRefreshed: function() {
			lPauseKeys = true;
		},
		
		rowDoubleClick: function(args) {
			console.log( 'double click detected');
		},
		
		rowClick: function(args) {
			let sorting = JSON.stringify( $("#orderTemplatesListTableDiv").jsGrid("getSorting") );
			console.log('sort:', sorting);
			$("#ModalOrderTemplates").attr('sort', sorting);

			$.post( "loadOrderTemplate?", {"poNum": args.item.orderNbr},
			    function(reply) {
					if (reply.items && poItems.data.length > 0) {
						console.log('double tap on order row!');
					} else if (reply.items) {
						$.each( reply.items, function(idx,line) {
							poItems.data.push(line);
						});
						localStorage.setItem('poItems', JSON.stringify(poItems));

						closeOrderTemplates();

						purchTableLoadData();

						updateTotalBox();

						purchTableDivSize();
						
						// store vars
						poNumber  = '';
						poNotes   = reply.poNotes;
						poFreight = reply.poFreight;

						localStorage.setItem('poNumber', poNumber);
						localStorage.setItem('poNotes', poNotes);
						localStorage.setItem('poFreight', poFreight);

						$('#PO_orderNbr').text('Pending');
						
						paintCurrentLine(1);

						resetBodyKeypress();

				    } else if (reply.msg) {
						vexAlert(reply.msg);
					} else {
						vexAlert(dict.errorMsg[languageVar]);
				    };
			})
			.fail(function () {
				vexAlert(dict.errorMsg[languageVar]);
			});
		}
	});

	Mousetrap.bind('home', function () { 
		$(".jsgrid-grid-body").scrollTop(0);
	});

	Mousetrap.bind('end', function () { 
		var maxScroll = $(".jsgrid-grid-body")[0].scrollHeight - $(".jsgrid-grid-body").height();
		$(".jsgrid-grid-body").scrollTop(maxScroll);
	});
/*
	$("#orderTemplatesListTableDiv tr td:nth-child(4)").hover(
		function() {
			let idx = $(this).parent().index();
			let text = data[idx].notes;
			$(this).attr( 'title', text );
		}, 
		function() {
			return;
		}
	);

$("#orderTemplatesListTableDiv tr td:nth-child(4)").each(
	function(i,val) {
		let idx = $(this).parent().index();
		let text = data[idx].notes;
		$(this).attr( 'title', text );
	} ); 
*/
}

function closeOrderTemplates() {
	$("#scanText").prop("disabled",false);
	$("#ModalOrderTemplates").hide();
	$("#orderTemplatesListTableDiv").empty();
	$('#orderTemplatesListTitleSpan').text('Order Templates for: ');
	Mousetrap.unbind('home');
	Mousetrap.unbind('end');
	resetBodyKeypress();
}


function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var expires = '';
    if (exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        expires = ";expires=" + d.toUTCString();
    }
    document.cookie = cname + "=" + cvalue + expires + ";path=/";
}

function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function elog() {
	let text = '';
	for (let i = 0; i < arguments.length; i++) {
		if (i>0) { text += ' ' };
		text += arguments[i];
	}
	console.log(text);
}

function showItemOrderInfo(data) {
    let cSubTitle = "";
    let ndraws = 0;

	toggleTips(false);

    $("#modalInfoTitle").text("Inventory Info Window");

    $.post("itemInfoWindow?", { codeNum: data },
        function (jData, status) {
            $("#modalInfoBody").html(jData.htmlText);

            $("#itemInfoBrand").text(jData.brand);
            $("#itemInfoDescrip").text(jData.descrip);
            $("#itemInfoSize").text(jData.size);
            $("#itemInfoType").text(jData.type);
            $("#itemInfoQtyCase").text(jData.qtycase);
            $("#itemInfoQoH").text(jData.qoh);
            $("#itemInfoQoO").text(jData.qoo);
            $("#itemInfoCurrMonth").text(jData.curr);
            $("#itemInfoLastMonth").text(jData.last);
            $("#itemInfoPrice").text(jData.price);
            $("#itemInfoCost").text(jData.cost);
            $("#itemInfoGMDols").text(jData.gmdols);
            $("#itemInfoGMPerc").text(jData.gmperc);

            if (jData.qoh < 0) {
                $("#itemInfoQoH").css('color', 'red');
            } else {
                $("#itemInfoQoH").css('color', '');
            };

            if (jData.barcodes.length === 0) {
                $("#itemInfoBarcodes").append('<option value=" ">N/A</option>');
            } else {
                $.each(jData.barcodes, function (index, item) {
                    $('#itemInfoBarcodes')
                        .append($('<option>', { value: index })
                            .text(item));
                });
            };

            if (jData.vendcodes.length === 0) {
                $("#itemInfoVendCode").append('<option value=" ">N/A</option>');
            } else {
                $.each(jData.vendcodes, function (index, item) {
                    $('#itemInfoVendCode')
                        .append($('<option>', { value: index })
                            .text(item));
                });
            };

            cSubTitle = jData.brand + " / " + jData.descrip + " / " + jData.size

            $(document).keydown(function (e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    closeModalInfo();
                }
            });

            $("#modalInfo").css("z-index", 99999);
            $("#modalInfo").toggle(true);

            $("#itemInfoTableTitle").toggle(true);

            // post for table data
            $.post("itemPurchaseTable?", { codeNum: data },
                function (tableData, status) {
                    itemPurchaseTable = $('#itemPurchaseTable').DataTable({
                        responsive: true,
                        dom: 'Bfrtilp',
                        buttons: [
                            {
                                extend:    'copyHtml5',
                                text:      svgCopy,
                                titleAttr: '  Copy to Clipboard  '
                            },
                            {
                                extend: 'excel',
                                text: svgExcel,
                                titleAttr: '  Excel File  ',
                                title: 'Item Purchase History ' + todayString()
                            },                            
                            {
                                extend: 'pdf',
                                text:   svgPdf,
                                titleAttr: '  PDF File  ',
                                orientation: 'portrait',
                                title: 'Item Purchase History',
                                header: true,
                                message: '__MESSAGE__',
                                customize: function (doc) {
                                    doc.content.forEach(function (content) {
                                        if (content.style == 'message') {
                                            content.text = cSubTitle;
                                        }
                                    })
                                }
                            },
                            {
                                extend: 'print',
                                text: svgPrint,
                                titleAttr: '  Print  ',
                                orientation: 'portrait',
                                title: 'Item Purchase History',
                                customize: function (window) {
                                    $(window.document.body).find('h1')
                                        .css('text-align', 'center')
                                        .css('font-family', 'Tahoma, sans-serif')
                                        .css('font-size', '18px')
                                        .append('<br><span style="font-size: 14px;">' + cSubTitle + '</span>');
                                    $(window.document.body).find('table')
                                        .css('font-size', '12px')
                                        .css('font-family', 'Tahoma, sans-serif');

                                    window.document.close();
                                    window.onafterprint = function(event) {  window.close(); };                        
                                    window.print();                       
                                }
                            }
                        ],
                        data: tableData,
                        select: false,
                        columns: [
                            { "width": "9%" },
                            { "width": "19%" },
                            { "width": "9%", "class": "zoomReceiver" },
                            { "width": "9%" },
                            { "width": "9%" },
                            { "width": "9%" },
                            { "width": "9%" },
                            { "width": "9%" },
                            { "width": "9%" },
                            { "width": "9%" }
                        ],
                        columnDefs: [
                            { type: 'num-fmt', targets: [4, 5, 6, 7, 8, 9] },
                            { className: 'numericCol', targets: [4, 5, 6, 7, 8, 9] },
                        ],
                        ordering: false,
                        "fnDrawCallback": function () {
                            $("#itemInfoWaitp").toggle(false);
                            $("#itemPurchaseTableWrapper").toggle(true);
                            $("#itemInfoTableTitle").toggle(true);
                            $('.dataTables_length').css('padding-top', '0.755em');
                            $('.dataTables_length').css('padding-left', '0.755em');
                            var cShow = $('.dataTables_length > label').text();
                            if (cShow.indexOf('--') < 0) {
                                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                            };
                        },
                        initComplete: function() {
                            const iItemTable = $('#itemPurchaseTable').DataTable();
        
                            const info = iItemTable.page.info();
                            if (info.pages === 1) {
                                $('#itemPurchaseTable_paginate').hide();
                            }
        
                            iItemTable.on('click', 'td', function (e, dt, type, indexes) {
                                if ($(this).index() === 2) {
                                    const nRow = iItemTable.row( $(this).parent() ).index();
                                    const rowData = iItemTable.rows( nRow ).data().toArray();
                                    showReceiver( rowData[0][2] );
                                }
                            });
                        
                        }
                    })
                });
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
            $("#modalInfo").hide();
        });
}

function showItemSalesInfo(codenum, cStart, cEnd) {
    var cSubTitle = "";
    var ndraws = 0;

    $("#modalInfoTitle").text("Item Sales Info");

    $.post("itemSalesInfoWindow?", { codeNum: codenum, cStart: cStart, cEnd: cEnd },
        function (jData, status) {
            $("#modalInfoBody").html(jData.htmlText);

            $("#itemInfoBrand").text(jData.brand);
            $("#itemInfoDescrip").text(jData.descrip);
            $("#itemInfoSize").text(jData.size);
            $("#itemInfoType").text(jData.type);
            $("#itemInfoQtyCase").text(jData.qtycase);
            $("#itemInfoQoH").text(jData.qoh);
            $("#itemInfoQoO").text(jData.qoo);
            $("#itemInfoCurrMonth").text(jData.curr);
            $("#itemInfoLastMonth").text(jData.last);
            $("#itemInfoPrice").text(jData.price);
            $("#itemInfoCost").text(jData.cost);
            $("#itemInfoGMDols").text(jData.gmdols);
            $("#itemInfoGMPerc").text(jData.gmperc);

            if (jData.qoh < 0) {
                $("#itemInfoQoH").css('color', 'red');
            } else {
                $("#itemInfoQoH").css('color', '');
            };

            cSubTitle = jData.brand + " / " + jData.descrip + " / " + jData.size

            $(document).keydown(function (e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    closeModalInfo();
                }
            });

            $("#modalInfo").css("z-index", 99999);
            $("#modalInfo").toggle(true);

            $("#itemInfoTableTitle").toggle(true);

            itemSalesTable = $('#itemSalesTable').DataTable({
                responsive: true,
                dom: 'Bfrtilp',
                buttons: [
                    {
                        extend: 'copyHtml5',
                        text: svgCopy,
                        titleAttr: '  Copy to Clipboard  '
                    },
                    {
                        extend: 'excel',
                        text: svgExcel,
                        titleAttr: '  Excel File  ',
                        title: 'Item Sales History ' + todayString()
                    },
                    {
                        extend: 'pdf',
                        text: svgPdf,
                        titleAttr: '  PDF File  ',
                        orientation: 'portrait',
                        title: 'Item Sales History',
                        header: true,
                        message: '__MESSAGE__',
                        customize: function (doc) {
                            doc.content.forEach(function (content) {
                                if (content.style == 'message') {
                                    content.text = cSubTitle;
                                }
                            })
                        }
                    },
                    {
                        extend: 'print',
                        text: svgPrint,
                        titleAttr: '  Print  ',
                        orientation: 'portrait',
                        title: 'Item Sales History',
                        customize: function (window) {
                            $(window.document.body).find('h1')
                                .css('text-align', 'center')
                                .css('font-family', 'Tahoma, sans-serif')
                                .css('font-size', '18px')
                                .append('<br><span style="font-size: 14px;">' + cSubTitle + '</span>');
                            $(window.document.body).find('table')
                                .css('font-size', '12px')
                                .css('font-family', 'Tahoma, sans-serif');

                            window.document.close();
                            window.onafterprint = function (event) { window.close(); };
                            window.print();
                        }
                    }
                ],
                data: jData.tableData,
                select: false,
                columns: [
                    { "width": "14%" },
                    { "width": "14%", "class": "zoomInvoice" },
                    { "width": "16%" },
                    { "width": "14%" },
                    { "width": "14%" },
                    { "width": "14%" },
                    { "width": "14%" }
                ],
                columnDefs: [
                    { type: 'num-fmt', targets: [1, 3, 4, 5, 6] },
                    { className: 'numericCol', targets: [1, 3, 4, 5, 6] },
                ],
                ordering: false,
                "fnDrawCallback": function () {
                    $("#itemInfoWaitp").toggle(false);
                    $("#itemSalesTableWrapper").toggle(true);
                    $("#itemInfoTableTitle").toggle(true);
                    $('.dataTables_length').css('padding-top', '0.755em');
                    $('.dataTables_length').css('padding-left', '0.755em');
                    var cShow = $('.dataTables_length > label').text();
                    if (cShow.indexOf('--') < 0) {
                        $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                    };
                },
                initComplete: function() {
                    const iSaleTable = $('#itemSalesTable').DataTable();

                    const info = iSaleTable.page.info();
                    if (info.pages === 1) {
                        $('#itemSalesTable_paginate').hide();
                    }

                    iSaleTable.on('click', 'td', function (e, dt, type, indexes) {
                        if ($(this).index() === 1) {
                            const nRow = iSaleTable.row( $(this).parent() ).index();
                            const rowData = iSaleTable.rows( nRow ).data().toArray();
                            showInvoice( rowData[0][1] );
                        }
                    });
                
                }
            })
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
            $("#modalInfo").hide();
        });
}

function closeModalInfo() {
    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            return;
        }
    });

    $("#modalInfoContent").scrollTop(0);
    $("#modalInfo").css("z-index", -1);
    $("#modalInfo").toggle(false);
    $("#modalInfoBody").html('');
    $("#modalInfoTitle").text("");
    $("#modalInfoCloseBar").css("width");
}

function showItemSalesChart(cCode) {
	toggleTips(false);
    $.spin('true');

    let $div = $('div[id="modalInfo"]');
    // Clone it and assign the new ID
    let $klon = $div.clone().prop('id', 'modalItemSalesChart');
    // Finally insert $klon after the previous
    $div.after($klon);

    $("#modalItemSalesChart #modalInfoContent").prop('id', 'modalItemSalesChartContent');
    $("#modalItemSalesChart #modalInfoCloseBar").prop('id', 'modalItemSalesChartCloseBar');
    $("#modalItemSalesChart #modalInfoClose").prop('id', 'modalItemSalesChartClose');
    $("#modalItemSalesChart #modalInfoTitle").prop('id', 'modalItemSalesChartTitle');
    $("#modalItemSalesChart #modalInfoBody").prop('id', 'modalItemSalesChartBody');

    $("#modalItemSalesChartTitle").text("18 Month Sales History");
    $('#modalItemSalesChartBody').html('');

    $('#modalItemSalesChartClose').off( 'click' );
	$('#modalItemSalesChartClose').on( 'click', closeItemSalesChart);

	let nHeight = ($('#modalInfoBody').is(':visible') ? $('#modalInfoBody').height() : $(document).height() );
    let nWidth  = ($('#modalInfoBody').is(':visible') ? $('#modalInfoBody').width() : $(document).width() );

    $.post("itemSalesHistoryChart?", { cCode: cCode, height: nHeight, width: nWidth },
        function (jData, status) {
            $("#modalItemSalesChartBody").html(jData.htmlText);

            var ctx = document.getElementById("itemSalesChart").getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: jData.labels,
                    datasets: [{
                        label: jData.cText,
                        data: jData.dataPoints,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Units'
                            }
                        }]
                    }
                }
            });

			$("#modalItemSalesChart").css("z-index", 99999);
            $("#modalItemSalesChart").show();
        }
    )
    .always( function() {
        $.spin('false');
    });
}

function closeItemSalesChart() {
    $("#modalItemSalesChart").toggle(false);
    $("#modalItemSalesChart").remove();
}

function setSvgVars() {
    svgCopy    = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 256 256" x="0px" y="0px"><path d="M202.88 60.16h-34.585v-15.36c-0.025-7.066-5.734-12.775-12.8-12.8h-102.374c-7.066 0.025-12.775 5.735-12.8 12.8v138.24c0.026 7.065 5.734 12.774 12.8 12.8h34.586v15.334c0.025 7.065 5.734 12.774 12.8 12.8h102.374c7.065-0.025 12.774-5.734 12.8-12.8v-138.24c-0.025-7.066-5.709-12.775-12.8-12.775zM53.12 185.6c-0.691 0-1.306-0.281-1.818-0.768-0.486-0.487-0.742-1.101-0.742-1.792v-138.24c0-0.691 0.282-1.306 0.742-1.792 0.486-0.486 1.101-0.742 1.818-0.768h102.374c0.691 0 1.305 0.282 1.817 0.768 0.487 0.486 0.743 1.101 0.743 1.792v15.334h-10.675c-3.072 0.026-6.093 0.794-8.96 1.946-2.867 1.178-5.581 2.739-7.782 4.864l-35.891 35.174c-2.201 2.176-3.789 4.864-5.017 7.731-1.203 2.867-1.997 5.888-2.022 8.986v66.765h-34.586zM135.577 76.467v26.317c0 0.691-0.281 1.305-0.743 1.792-0.487 0.487-1.101 0.743-1.817 0.768h-26.957l29.517-28.877zM205.44 211.2c0 0.691-0.281 1.305-0.743 1.792-0.487 0.487-1.101 0.743-1.817 0.768h-102.374c-0.691 0-1.305-0.281-1.817-0.768-0.487-0.487-0.743-1.101-0.743-1.792v-92.391c0-0.768 0.205-1.971 0.563-3.225h34.483c7.066-0.025 12.774-5.734 12.8-12.8v-32.231c0.589-0.103 1.152-0.179 1.561-0.179h55.501c0.691 0 1.305 0.281 1.817 0.768 0.487 0.487 0.743 1.101 0.743 1.792v138.266z"></path></svg>';
    svgExcel   = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><polygon fill="none" points="15,95 85,95 85,20.009 69.991,5 15,5 "></polygon><polygon points="85,95 15,95 15,5 69.991,5 64.991,0 10,0 10,100 90,100 90,25.009 85,20.009 "></polygon><polygon points="87.001,28.009 82.001,23.009 66.992,23.009 66.993,7.999 61.992,2.999 61.992,28.009 "></polygon><rect x="60.072" y="11.481" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 118.5608 77.536)" width="30.534" height="5.466"></rect><g><polygon points="27.121,46.135 42.344,46.135 72.932,76.795 72.932,79.839 56.222,79.839 27.121,50.738  "></polygon><g><polygon points="68.516,69.297 71.394,65.961 71.394,62.986 62.22,62.986   "></polygon><polygon points="58.573,59.331 69.905,50.596 69.835,46.135 54.753,46.135 50.069,50.807   "></polygon><polygon points="37.079,63.765 27.068,73.749 27.068,76.795 50.109,76.795   "></polygon></g></g></svg>';
    svgPdf     = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path d="M57.676 45.883c-1.881-2.097-3.739-4.44-5.412-6.548 -0.789-0.996-1.544-1.946-2.25-2.809l-0.052-0.063c1.034-2.945 1.625-5.355 1.757-7.165 0.335-4.611-0.18-7.581-1.573-9.078 -0.941-1.013-2.354-1.366-3.683-0.919 -0.952 0.319-2.241 1.174-2.978 3.432 -1.098 3.366-0.566 9.327 2.556 14.257 -1.393 3.648-3.335 7.84-5.48 11.831 -4.085 1.432-7.341 3.315-9.678 5.599 -3.053 2.98-4.294 5.938-3.406 8.114 0.547 1.348 1.812 2.152 3.383 2.152 1.094 0 2.277-0.395 3.422-1.141 2.891-1.89 6.666-8.187 8.691-11.836 4.189-1.308 8.325-1.843 10.427-2.046 0.951-0.092 1.895-0.165 2.804-0.216 3.679 3.885 6.688 5.934 9.46 6.445 0.558 0.104 1.116 0.156 1.661 0.156 2.259 0 4.126-0.901 4.997-2.41 0.657-1.14 0.644-2.47-0.037-3.65 -1.538-2.663-6.18-4.129-13.071-4.129C58.718 45.86 58.206 45.867 57.676 45.883zM32.364 60.615c-0.547 0.357-1.109 0.57-1.505 0.57 -0.075 0-0.126-0.008-0.155-0.015 -0.069-0.349 0.179-1.858 2.624-4.247 1.148-1.122 2.6-2.146 4.319-3.052C35.478 57.361 33.526 59.856 32.364 60.615zM46.811 23.82c0.255-0.781 0.571-1.134 0.768-1.2 0.005-0.001 0.009-0.003 0.013-0.004 0.19 0.214 0.998 1.437 0.636 6.431 -0.063 0.871-0.275 1.972-0.632 3.28C46.428 29.319 46.107 25.977 46.811 23.82zM53.062 46.181c-1.862 0.179-4.698 0.548-7.862 1.297 1.227-2.45 2.363-4.933 3.312-7.234 0.329 0.412 0.666 0.835 1.008 1.268 1.145 1.443 2.431 3.065 3.764 4.649L53.062 46.181zM69.251 51.739c0.052 0.09 0.051 0.126 0.038 0.15 -0.147 0.255-0.812 0.66-1.969 0.66 -0.323 0-0.667-0.033-1.022-0.099 -1.444-0.267-3.128-1.265-5.135-3.045C66.609 49.665 68.81 50.978 69.251 51.739z"/><path d="M65.093 5H19.813c-2.775 0-5.03 2.249-5.03 5.031v79.938c0 2.779 2.255 5.031 5.03 5.031h60.373c2.781 0 5.03-2.252 5.03-5.031V25.124L65.093 5zM65.093 12.113l13.011 13.011H65.093V12.113zM80.187 89.969H19.813V10.031h40.249v15.093c0 2.779 2.25 5.031 5.03 5.031h15.094V89.969z"/><path d="M41.688 69.355c-0.411-0.363-0.904-0.627-1.464-0.782 -0.553-0.158-1.345-0.238-2.354-0.238h-3.349c-0.637 0-1.117 0.146-1.428 0.437 -0.314 0.294-0.475 0.77-0.475 1.413v9.932c0 0.578 0.143 1.028 0.425 1.34 0.287 0.32 0.669 0.483 1.135 0.483 0.446 0 0.822-0.163 1.116-0.485 0.288-0.316 0.435-0.772 0.435-1.355v-3.397h2.141c1.653 0 2.923-0.361 3.772-1.074 0.864-0.722 1.303-1.79 1.303-3.175 0-0.645-0.106-1.235-0.317-1.755C42.416 70.172 42.1 69.721 41.688 69.355zM39.524 73.508c-0.187 0.252-0.454 0.429-0.818 0.543 -0.387 0.12-0.88 0.182-1.468 0.182H35.73v-3.438h1.508c1.359 0 1.91 0.271 2.129 0.492 0.292 0.312 0.434 0.711 0.434 1.218C39.801 72.923 39.708 73.26 39.524 73.508z"/><path d="M54.059 69.565c-0.543-0.475-1.157-0.804-1.825-0.977 -0.65-0.168-1.438-0.254-2.339-0.254h-3.401c-0.629 0-1.099 0.151-1.398 0.451s-0.451 0.77-0.451 1.398v9.448c0 0.443 0.039 0.798 0.119 1.083 0.091 0.324 0.287 0.577 0.582 0.752 0.281 0.17 0.675 0.252 1.201 0.252h3.401c0.602 0 1.152-0.039 1.635-0.117 0.492-0.08 0.959-0.22 1.387-0.415 0.432-0.197 0.834-0.463 1.199-0.791 0.457-0.42 0.838-0.903 1.132-1.438 0.291-0.533 0.51-1.138 0.648-1.796 0.138-0.652 0.208-1.383 0.208-2.17C56.156 72.583 55.449 70.757 54.059 69.565zM51.786 78.602c-0.169 0.147-0.372 0.265-0.604 0.348 -0.243 0.086-0.479 0.141-0.704 0.162 -0.237 0.022-0.572 0.034-0.996 0.034h-1.728V70.9h1.473c0.771 0 1.432 0.084 1.966 0.249 0.499 0.152 0.929 0.521 1.278 1.099 0.358 0.591 0.54 1.508 0.54 2.727C53.011 76.694 52.6 77.913 51.786 78.602z"/><path d="M65.899 68.335h-6.152c-0.41 0-0.742 0.061-1.014 0.186 -0.291 0.132-0.508 0.347-0.646 0.64 -0.128 0.274-0.19 0.609-0.19 1.024v9.914c0 0.597 0.146 1.056 0.431 1.364 0.291 0.316 0.671 0.477 1.129 0.477 0.449 0 0.826-0.158 1.12-0.471 0.286-0.309 0.431-0.77 0.431-1.37v-3.995h4.048c0.453 0 0.808-0.109 1.053-0.326 0.255-0.225 0.384-0.527 0.384-0.899 0-0.371-0.126-0.674-0.376-0.9 -0.243-0.222-0.6-0.334-1.061-0.334h-4.048v-2.796h4.892c0.479 0 0.848-0.115 1.097-0.343 0.255-0.232 0.384-0.541 0.384-0.918 0-0.369-0.129-0.675-0.385-0.911C66.744 68.449 66.376 68.335 65.899 68.335z"/></g></svg>';
    svgPrint   = '<svg height="30" width="30" fill="#2E8584" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><path style="font-size:medium;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-indent:0;text-align:start;text-decoration:none;line-height:normal;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;text-anchor:start;baseline-shift:baseline;opacity:1;color:#000000;fill-opacity:1;stroke:none;stroke-width:5.99999904999999960;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate;font-family:Sans;-inkscape-font-specification:Sans" d="M 20.6875 5 A 3.0002995 3.0002995 0 0 0 18 8 L 18 37 L 15 37 C 11.173892 37 8 40.173892 8 44 L 8 76 C 8 79.826108 11.173892 83 15 83 L 18 83 L 18 92 A 3.0002995 3.0002995 0 0 0 21 95 L 79 95 A 3.0002995 3.0002995 0 0 0 82 92 L 82 83 L 85 83 C 88.826108 83 92 79.826108 92 76 L 92 44 C 92 40.173892 88.826108 37 85 37 L 24 37 L 24 11 L 65.65625 11 L 76 21.53125 L 76 30 A 3.0002995 3.0002995 0 1 0 82 30 L 82 20.3125 A 3.0002995 3.0002995 0 0 0 81.15625 18.21875 L 69.0625 5.90625 A 3.0002995 3.0002995 0 0 0 66.90625 5 L 21 5 A 3.0002995 3.0002995 0 0 0 20.6875 5 z M 15 43 L 85 43 C 85.605892 43 86 43.394108 86 44 L 86 76 C 86 76.605892 85.605892 77 85 77 L 82 77 L 82 72 A 3.0002995 3.0002995 0 0 0 79 69 L 21 69 A 3.0002995 3.0002995 0 0 0 20.6875 69 A 3.0002995 3.0002995 0 0 0 18 72 L 18 77 L 15 77 C 14.394108 77 14 76.605892 14 76 L 14 44 C 14 43.394108 14.394108 43 15 43 z M 21.6875 47 A 3.0040663 3.0040663 0 1 0 22 53 L 32 53 A 3.0002995 3.0002995 0 1 0 32 47 L 22 47 A 3.0002995 3.0002995 0 0 0 21.6875 47 z M 68 47 C 66.343146 47 65 48.343146 65 50 C 65 51.656854 66.343146 53 68 53 C 69.656854 53 71 51.656854 71 50 C 71 48.343146 69.656854 47 68 47 z M 78 47 C 76.343146 47 75 48.343146 75 50 C 75 51.656854 76.343146 53 78 53 C 79.656854 53 81 51.656854 81 50 C 81 48.343146 79.656854 47 78 47 z M 24 75 L 76 75 L 76 89 L 24 89 L 24 75 z "></path></svg>';
    svgColVis  = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M82.5,5h-65c-6.6,0-12,5.4-12,12v66c0,6.6,5.4,12,12,12h65c6.6,0,12-5.4,12-12V17C94.5,10.4,89.1,5,82.5,5z M88.5,17v6h-23  V11h17C85.8,11,88.5,13.7,88.5,17z M38.5,23V11h23v12H38.5z M61.5,27v62h-23V27H61.5z M17.5,11h17v12h-23v-6  C11.5,13.7,14.2,11,17.5,11z M11.5,83V27h23v62h-17C14.2,89,11.5,86.3,11.5,83z M82.5,89h-17V27h23v56C88.5,86.3,85.8,89,82.5,89z   M15.5,40c0-1.1,0.9-2,2-2h11c1.1,0,2,0.9,2,2s-0.9,2-2,2h-11C16.4,42,15.5,41.1,15.5,40z M30.5,52c0,1.1-0.9,2-2,2h-11  c-1.1,0-2-0.9-2-2s0.9-2,2-2h11C29.6,50,30.5,50.9,30.5,52z M30.5,64c0,1.1-0.9,2-2,2h-11c-1.1,0-2-0.9-2-2s0.9-2,2-2h11  C29.6,62,30.5,62.9,30.5,64z M30.5,76c0,1.1-0.9,2-2,2h-11c-1.1,0-2-0.9-2-2s0.9-2,2-2h11C29.6,74,30.5,74.9,30.5,76z M42.5,40  c0-1.1,0.9-2,2-2h11c1.1,0,2,0.9,2,2s-0.9,2-2,2h-11C43.4,42,42.5,41.1,42.5,40z M42.5,52c0-1.1,0.9-2,2-2h11c1.1,0,2,0.9,2,2  s-0.9,2-2,2h-11C43.4,54,42.5,53.1,42.5,52z M42.5,64c0-1.1,0.9-2,2-2h11c1.1,0,2,0.9,2,2s-0.9,2-2,2h-11C43.4,66,42.5,65.1,42.5,64  z M57.5,76c0,1.1-0.9,2-2,2h-11c-1.1,0-2-0.9-2-2s0.9-2,2-2h11C56.6,74,57.5,74.9,57.5,76z M84.5,40c0,1.1-0.9,2-2,2h-11  c-1.1,0-2-0.9-2-2s0.9-2,2-2h11C83.6,38,84.5,38.9,84.5,40z M84.5,52c0,1.1-0.9,2-2,2h-11c-1.1,0-2-0.9-2-2s0.9-2,2-2h11  C83.6,50,84.5,50.9,84.5,52z M84.5,64c0,1.1-0.9,2-2,2h-11c-1.1,0-2-0.9-2-2s0.9-2,2-2h11C83.6,62,84.5,62.9,84.5,64z M84.5,76  c0,1.1-0.9,2-2,2h-11c-1.1,0-2-0.9-2-2s0.9-2,2-2h11C83.6,74,84.5,74.9,84.5,76z"></path></svg>';
    svgClose   = '<svg height="30" width="30" fill="#e60000" xmlns:x="http://ns.adobe.com/Extensibility/1.0/" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:graph="http://ns.adobe.com/Graphs/1.0/" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="-949 951 100 100" xml:space="preserve"><switch><foreignObject requiredExtensions="http://ns.adobe.com/AdobeIllustrator/10.0/" x="0" y="0" width="1" height="1"></foreignObject><g i:extraneous="self"><g><g><path d="M-887.3,1038.1h-7.4v-74.2h7.4v29.6h3.3V963c0-1.3-1-2.4-2.3-2.4h-8.4v-6.9c0-1.2-1-2-2.3-1.6l-35.6,9.6      c-1.2,0.3-2.2,1.6-2.2,2.9v73c0,1.2,1,2.5,2.2,2.9l35.6,9.6c1.2,0.3,2.3-0.4,2.3-1.6v-6.9h8.4c1.2,0,2.3-1.1,2.3-2.4v-30.6h-3.3      V1038.1z M-902.7,1003c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S-901.6,1003-902.7,1003z"></path></g><g><path d="M-863.3,1000.7l-9.7-9.7c-0.3-0.3-0.8-0.1-0.8,0.3v5.5h-17.1c-0.3,0-0.5,0.2-0.5,0.5v7.5c0,0.3,0.2,0.5,0.5,0.5h17.1      v5.5c0,0.4,0.5,0.6,0.8,0.3l9.7-9.7C-863.1,1001.1-863.1,1000.9-863.3,1000.7z"></path></g></g></g></switch></svg>';  //style="enable-background:new -949 951 100 100;" 
    svgShow    = '<svg id="svgHideShow" height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M50,38c-6.6,0-12,5.4-12,12c0,6.6,5.4,12,12,12s12-5.4,12-12C62,43.4,56.6,38,50,38z M50,45c-2.8,0-5,2.2-5,5h-2  c0-3.9,3.1-7,7-7V45z"></path><path d="M50,26c-16.3,0-31.5,8.8-39.7,23l-0.6,1l0.6,1C18.5,65.2,33.7,74,50,74s31.5-8.8,39.7-23l0.6-1l-0.6-1  C81.5,34.8,66.3,26,50,26z M14.3,50c5.3-8.7,13.6-15,23.1-18C31.7,36,28,42.5,28,50c0,7.5,3.7,14,9.4,18C27.9,65,19.7,58.7,14.3,50z   M32,50c0-9.9,8.1-18,18-18s18,8.1,18,18c0,9.9-8.1,18-18,18S32,59.9,32,50z M62.6,68c5.7-4,9.4-10.6,9.4-18c0-7.5-3.7-14-9.4-18  c9.5,3,17.7,9.3,23.1,18C80.3,58.7,72.1,65,62.6,68z"></path></svg>';
    svgHide    = '<svg id="svgHideShow" height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M50,62c6.6,0,12-5.4,12-12c0-1-0.1-2-0.4-3L47,61.6C48,61.9,49,62,50,62z"></path><path d="M89.7,49c-3.6-6.3-8.7-11.6-14.6-15.5l-2.9,2.9c5.4,3.4,10,8,13.5,13.6c-5.3,8.7-13.6,15-23.1,18c5.7-4,9.4-10.6,9.4-18  c0-3.8-1-7.5-2.7-10.6l-3,3c1.1,2.3,1.7,4.9,1.7,7.6c0,9.9-8.1,18-18,18c-2.7,0-5.3-0.6-7.6-1.7l-2.5,2.5l-0.5,0.5L36.7,72  c4.3,1.3,8.7,2,13.3,2c16.3,0,31.5-8.8,39.7-23l0.6-1L89.7,49z"></path><path d="M28.6,68.6l-10,10l2.8,2.8l60-60l-2.7-2.7l-0.1-0.1l-11,11C62.1,27.2,56.1,26,50,26c-16.3,0-31.5,8.8-39.7,23l-0.6,1l0.6,1  C14.6,58.6,21.1,64.6,28.6,68.6z M50,45c-2.8,0-5,2.2-5,5h-2c0-3.9,3.1-7,7-7V45z M61.2,36l-4.3,4.3C55,38.8,52.6,38,50,38  c-6.6,0-12,5.4-12,12c0,2.6,0.8,5,2.2,6.9l-4.3,4.3c-2.5-3.1-4-7-4-11.2c0-9.9,8.1-18,18-18C54.2,32,58.1,33.5,61.2,36z M37.4,32  C31.7,36,28,42.5,28,50c0,5.3,1.9,10.3,5.1,14.1l-1.6,1.6c-7-3.5-13-8.8-17.2-15.7C19.7,41.3,27.9,35,37.4,32z"></path></svg>';
    svgAdd     = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.181,81.82C0.607,64.246,0.607,35.754,18.18,18.18  c17.574-17.574,46.066-17.573,63.64,0c17.573,17.573,17.573,46.066,0,63.639C64.246,99.393,35.754,99.393,18.181,81.82z   M76.516,23.484C61.871,8.839,38.128,8.839,23.483,23.484C8.839,38.128,8.839,61.872,23.484,76.517  c14.644,14.644,38.388,14.644,53.033,0C91.161,61.872,91.161,38.129,76.516,23.484z M49.999,74.958  c-1.964,0.001-3.557-1.601-3.557-3.577l0-17.904l-17.904,0c-1.975,0-3.577-1.593-3.577-3.558c0-1.965,1.602-3.557,3.577-3.557  l17.904,0l0-17.904c0.001-1.975,1.592-3.577,3.557-3.577c1.964,0,3.558,1.602,3.558,3.577l-0.001,17.904l17.904-0.001  c1.975,0.001,3.576,1.594,3.576,3.558c0.001,1.966-1.599,3.559-3.576,3.558l-17.905,0l0,17.905  C53.559,73.358,51.965,74.959,49.999,74.958z"></path></svg>';
    svgDelete  = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1" x="0px" y="0px"><g stroke="none" stroke-width="1" fill-rule="evenodd"><path d="M6.99569017,9 L7.91291186,28 L24.0871307,28 L25.0043524,9 L6.99569017,9 Z M6.99569017,7 L25.0043524,7 C26.1089219,7 27.0043524,7.8954305 27.0043524,9 C27.0043524,9.03215981 27.0035767,9.06431494 27.002026,9.09643734 L26.0848043,28.0964373 C26.0333512,29.1622753 25.1542099,30 24.0871307,30 L7.91291186,30 C6.84583264,30 5.96669139,29.1622753 5.91523825,28.0964373 L4.99801657,9.09643734 C4.94475569,7.99315268 5.79596816,7.05558727 6.89925283,7.00232639 C6.93137523,7.00077569 6.96353036,7 6.99569017,7 Z" fill-rule="nonzero"></path><path d="M10.0012477,14.0499376 C9.97366788,13.4983419 10.3984667,13.0288274 10.9500624,13.0012477 C11.5016581,12.9736679 11.9711726,13.3984667 11.9987523,13.9500624 L12.4987523,23.9500624 C12.5263321,24.5016581 12.1015333,24.9711726 11.5499376,24.9987523 C10.9983419,25.0263321 10.5288274,24.6015333 10.5012477,24.0499376 L10.0012477,14.0499376 Z" fill-rule="nonzero"></path><path d="M20.0012477,13.9500624 C20.0288274,13.3984667 20.4983419,12.9736679 21.0499376,13.0012477 C21.6015333,13.0288274 22.0263321,13.4983419 21.9987523,14.0499376 L21.4987523,24.0499376 C21.4711726,24.6015333 21.0016581,25.0263321 20.4500624,24.9987523 C19.8984667,24.9711726 19.4736679,24.5016581 19.5012477,23.9500624 L20.0012477,13.9500624 Z" fill-rule="nonzero"></path><path d="M17,24 C17,24.5522847 16.5522847,25 16,25 C15.4477153,25 15,24.5522847 15,24 L15,14 C15,13.4477153 15.4477153,13 16,13 C16.5522847,13 17,13.4477153 17,14 L17,24 Z" fill-rule="nonzero"></path><path d="M4,9 C3.44771525,9 3,8.55228475 3,8 C3,7.44771525 3.44771525,7 4,7 L28,7 C28.5522847,7 29,7.44771525 29,8 C29,8.55228475 28.5522847,9 28,9 L4,9 Z" fill-rule="nonzero"></path><path d="M18.3057458,5 L13.6942542,5 L13.3609208,7 L18.6390792,7 L18.3057458,5 Z M13.6942542,3 L18.3057458,3 C19.2834241,3 20.1178043,3.70682609 20.2785337,4.67120203 L21,9 L11,9 L11.7214663,4.67120203 C11.8821957,3.70682609 12.7165759,3 13.6942542,3 Z" fill-rule="nonzero"></path></g></svg>';
    svgEdit    = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 100" x="0px" y="0px"><path d="M21.40784,86.3042a1.41985,1.41985,0,0,0,2.14508,1.35461l14.03344-8.4425-14.587-9.21185Z"></path><path d="M77.41229,16.152a4.16189,4.16189,0,0,0-1.29669-5.74133L68.56653,5.64343a4.16208,4.16208,0,0,0-5.74127,1.29676l-3.20179,5.07025,14.587,9.21167Z"></path><rect x="18.37957" y="36.92967" width="60.52339" height="17.25218" transform="translate(-15.84888 62.35815) rotate(-57.7272)"></rect><rect x="15.30518" y="90.04358" width="69.38965" height="4.95642" rx="1.08856" ry="1.08856"></rect></svg>';
    svgRefresh = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path d="M66.562,74.61c-4.887,3.392-10.621,5.189-16.582,5.192l-0.401-0.007c-0.794-0.006-1.588-0.048-2.368-0.117   l-0.96-0.121c-0.618-0.077-1.236-0.166-1.836-0.277c-0.262-0.048-0.522-0.112-0.781-0.176l-0.315-0.07   c-0.59-0.14-1.173-0.277-1.747-0.449l-0.822-0.271c-0.656-0.224-1.319-0.45-1.964-0.715l-0.178,0.421l-0.252-0.611   c-0.749-0.332-1.489-0.676-2.309-1.109c-2.429-1.333-4.644-2.98-6.69-5.018c-0.605-0.6-1.18-1.228-1.728-1.891l-0.357,0.297   l0.013-0.73c-3.618-4.494-5.737-9.827-6.213-15.515c4.881-0.134,9.188-0.484,9.602-1.307c0.149-0.296,0.5-0.988-3.344-7.162   c-1.785-2.875-9.448-14.482-11.476-14.482C13.657,30.557,4.444,45.29,2.274,49.683c-1.036,2.104-0.938,2.531-0.733,2.809   c0.484,0.653,5.001,0.901,9.276,0.987c0.449,7.049,2.772,13.793,6.809,19.595l0.459-0.127l-0.293,0.424   c0.341,0.481,0.71,0.934,1.077,1.383l0.905,1.151c0.714,0.857,1.473,1.67,2.25,2.464l0.221,0.227   c2.601,2.588,5.565,4.801,8.801,6.56l0.277,0.16c0.931,0.49,1.884,0.937,2.856,1.364l0.717,0.318   c0.829,0.345,1.677,0.638,2.71,0.982c0.344,0.121,0.691,0.235,1.045,0.344c0.749,0.224,1.515,0.408,2.289,0.59l0.356,0.086   c0.393,0.089,0.784,0.179,1.419,0.31c0.137,0.038,0.271,0.066,0.398,0.089c0.58,0.105,1.167,0.172,1.753,0.239l1.218,0.153   C47.393,89.917,48.699,90,50,90c8.029,0,15.785-2.438,22.428-7.07c2.309-1.606,2.872-4.781,1.256-7.073   C72.122,73.647,68.794,73.042,66.562,74.61z"></path><path d="M97.917,50.387c-0.396-0.774-4.294-1.128-8.855-1.278c-0.36-7.245-2.697-14.185-6.822-20.126l-0.382,0.255   l0.21-0.574c-0.529-0.749-1.097-1.447-1.721-2.2l-0.198-0.261c-3.984-4.801-8.909-8.473-14.644-10.931l-0.473-0.207   c-0.905-0.37-1.829-0.698-2.76-1.007l-0.354-0.118c-0.213-0.073-0.434-0.15-0.653-0.213c-0.812-0.239-1.632-0.443-2.467-0.631   l-0.383-0.089c-0.331-0.077-0.663-0.156-1.001-0.223l-0.669-0.153c-0.393-0.07-0.784-0.111-1.183-0.153l-1.961-0.242   c-1.045-0.096-2.078-0.134-3.363-0.166l-0.411-0.006c-8.052,0.006-15.798,2.442-22.39,7.032c-1.122,0.778-1.871,1.944-2.11,3.283   c-0.236,1.339,0.063,2.687,0.848,3.803c1.556,2.209,4.891,2.802,7.128,1.24c4.88-3.395,10.608-5.189,16.831-5.189h0.006   c0.861,0.006,1.709,0.047,2.544,0.127l0.771,0.096c0.695,0.083,1.377,0.182,2.05,0.312l0.883,0.204   c0.663,0.144,1.319,0.303,1.961,0.491l0.611,0.208c0.736,0.239,1.464,0.5,2.388,0.889c4.221,1.798,8.001,4.616,10.988,8.211   c3.835,4.638,6.024,10.258,6.442,16.27c-4.476,0.07-9.48,0.304-9.997,0.998c-0.204,0.28-0.3,0.704,0.733,2.802   c2.174,4.402,11.387,19.136,13.586,19.196h0.022c2.011,0,9.509-11.367,11.408-14.411C98.42,51.388,98.069,50.689,97.917,50.387z"></path></g></svg>';
    svgStop    = '<svg height="30" width="30" fill="#E40B0B" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" version="1.1" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;" viewBox="0 0 621 590" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><g><polygon class="fil0" points="449,0 621,164 619,426 452,590 169,590 2,426 0,164 172,0 "></polygon></g></svg>';
    svgRepeat  = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="-909 491 100 100" style="enable-background:new -909 491 100 100;" xml:space="preserve"><g><rect x="-874.8" y="529.6" width="11.7" height="2.5"></rect><rect x="-874.8" y="535" width="20.8" height="2.5"></rect><path d="M-830.7,549.3c-0.9-0.2-1.8,0.3-2,1.2c-2.2,8.5-7.5,15.7-15,20.1c-7.5,4.5-16.4,5.8-24.9,3.6   c-17.5-4.4-28.2-22.3-23.8-39.9c4.3-16.9,21.1-27.4,38-24.2l-1.2,4.8l12.9-3.6l-9.6-9.3l-1.2,4.9c-18.7-3.7-37.3,7.9-42,26.6   c-4.9,19.3,6.9,39.1,26.2,44c3,0.8,6,1.1,8.9,1.1c6.4,0,12.8-1.7,18.5-5.1c8.3-4.9,14.2-12.8,16.6-22.2   C-829.2,550.5-829.8,549.5-830.7,549.3z"></path><path d="M-821.8,517.7c-2.1-2.4-5.7-2.6-8.1-0.6l-0.4,0.4l-0.6,0.5l-2.3,2l-0.3,0.2l-10.6,9.3h0l-0.6,0.5v-6.5   c0-0.9-0.8-1.7-1.7-1.7H-881c-0.9,0-1.7,0.8-1.7,1.7v41c0,0.9,0.8,1.7,1.7,1.7h34.6c0.9,0,1.7-0.8,1.7-1.7v-19.3l3.9-3.4l2.2-1.9   l3.2-2.8l2.2-1.9l1.1-1l6-5.2l2.5-2.1l1.1-1l0.2-0.2C-819.9,523.8-819.7,520.1-821.8,517.7z M-848,562.9h-31.2v-37.6h31.2v7.8   l-7,6.1l-2.8,2.4v-1.4h-17v2.5h15.7l0,0l-3.4,3h-12.3v2.5h10.8l-1.8,3.3l-0.2,0.3l-2.7,5.2c0,0,0,0,0,0l-0.2,0.3   c-0.1,0.4,0,0.9,0.3,1.2c0.3,0.3,0.7,0.4,1.1,0.4c0,0,0.1,0,0.1,0l0.4-0.1l11.6-4.2c0.2-0.1,0.3-0.2,0.4-0.2l7.1-6.1V562.9z    M-860.6,548.7C-860.6,548.7-860.6,548.7-860.6,548.7c0.5,0.4,1.1,0.9,1.6,1.5c0.6,0.7,1,1.2,1.3,1.8c0,0,0,0,0,0   c0.1,0.3,0.3,0.6,0.4,0.8l-4.6,1.7l-1.8-2l2.3-4.3h0C-861.1,548.3-860.8,548.5-860.6,548.7z M-831.4,530.6l-3.6,3.1l-5.5,4.8   l-2.2,1.9l-2,1.8l-3.3,2.9l-7.3,6.4c-0.1-0.2-0.2-0.5-0.4-0.7c-0.4-0.7-0.9-1.4-1.6-2.2c-0.1-0.2-0.3-0.3-0.4-0.5   c-0.5-0.5-1-1-1.5-1.4c-0.2-0.2-0.4-0.3-0.6-0.4l0.5-0.5l0.2-0.2l7.1-6.2l3.9-3.4l0.4-0.3l1.4-1.2l1.6-1.4l4.1-3.6l0.8-0.7l0.5-0.5   l3.9-3.4c2.9,1.5,4.1,3.8,4.6,5L-831.4,530.6z M-830,529.4c-0.6-1.4-1.8-3.5-4.6-5l0.7-0.6c2.9,1.5,4.1,3.9,4.5,5.1L-830,529.4z    M-823.8,524.1l-1,0.8l-0.4,0.4l-0.2,0.2l-1.2,1l-0.5,0.4l-1.1,1l-0.4,0.3c-0.5-1.4-1.8-3.5-4.5-5.1l0.1-0.1l0.1-0.1l1.8-1.6l1.1-1   l1.1-1l0.3-0.2v0l0.2-0.2c1.4-1.2,3.6-1.1,4.8,0.3C-822.3,520.7-822.4,522.9-823.8,524.1z"></path></g></svg>';
    svgUndo    = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><polygon points="0.159,49.886 0,50.002 45.525,83.338 45.525,83.107  "></polygon><polygon points="2.561,48.127 45.525,79.59 45.525,79.111 2.888,47.887  "></polygon><polygon points="5.29,46.128 45.525,75.593 45.525,75.113 5.618,45.888  "></polygon><polygon points="8.019,44.13 45.525,71.596 45.525,71.116 8.347,43.89  "></polygon><polygon points="10.749,42.131 45.525,67.598 45.525,67.118 11.077,41.891  "></polygon><polygon points="32.914,25.898 32.586,26.139 45.525,35.613 45.525,35.135  "></polygon><polygon points="35.643,23.9 35.315,24.14 45.525,31.616 45.525,31.137  "></polygon><polygon points="38.373,21.9 38.045,22.141 45.525,27.617 45.525,27.139  "></polygon><polygon points="41.102,19.902 40.775,20.142 45.525,23.62 45.525,23.142  "></polygon><polygon points="43.832,17.903 43.504,18.143 45.525,19.622 45.525,19.144  "></polygon><polygon points="1.196,49.126 45.525,81.589 45.525,81.109 1.523,48.887  "></polygon><polygon points="3.925,47.128 45.525,77.592 45.525,77.111 4.253,46.888  "></polygon><polygon points="6.655,45.129 45.525,73.594 45.525,73.115 6.982,44.889  "></polygon><polygon points="9.385,43.129 45.525,69.596 45.525,69.116 9.712,42.89  "></polygon><polygon points="12.114,41.131 45.525,65.598 45.525,65.119 12.442,40.891  "></polygon><polygon points="34.279,24.898 33.952,25.139 45.525,33.613 45.525,33.135  "></polygon><polygon points="37.008,22.9 36.681,23.14 45.525,29.616 45.525,29.138  "></polygon><polygon points="39.737,20.901 39.41,21.141 45.525,25.618 45.525,25.14  "></polygon><polygon points="42.467,18.902 42.14,19.142 45.525,21.621 45.525,21.143  "></polygon><polygon points="45.196,16.903 44.869,17.143 45.525,17.623 45.525,17.145  "></polygon><polygon points="27.425,49.864 13.807,39.892 13.479,40.131 45.525,63.6 45.525,63.395 72.759,83.338 72.759,82.855 27.566,49.762     "></polygon><polygon points="30.154,47.866 16.536,37.893 16.208,38.133 29.827,48.105 29.64,48.243 72.759,79.818 72.759,78.857    30.295,47.763  "></polygon><polygon points="32.884,45.867 19.265,35.894 18.938,36.134 32.556,46.106 32.369,46.244 72.759,75.822 72.759,74.861    33.025,45.764  "></polygon><polygon points="35.613,43.868 21.995,33.895 21.667,34.135 35.286,44.107 35.099,44.245 72.759,71.824 72.759,70.863    35.754,43.765  "></polygon><polygon points="38.342,41.869 24.724,31.896 24.396,32.136 38.016,42.108 37.828,42.246 72.759,67.827 72.759,66.866    38.483,41.766  "></polygon><polygon points="54.833,49.74 41.213,39.767 41.073,39.869 27.455,29.896 27.127,30.136 40.746,40.108 40.558,40.247    72.759,63.828 72.759,63.393 54.475,50.002  "></polygon><polygon points="57.562,47.741 43.943,37.768 43.802,37.87 30.184,27.897 29.856,28.138 43.475,38.11 43.287,38.248 56.906,48.222     "></polygon><polygon points="60.291,45.742 46.672,35.769 46.017,36.249 59.637,46.223  "></polygon><polygon points="63.021,43.743 49.401,33.77 48.745,34.25 62.363,44.224  "></polygon><polygon points="65.75,41.744 52.13,31.771 51.475,32.251 65.094,42.225  "></polygon><polygon points="68.48,39.744 54.859,29.771 54.205,30.251 67.824,40.225  "></polygon><polygon points="71.21,37.745 57.59,27.771 56.936,28.252 70.555,38.226  "></polygon><polygon points="72.759,34.882 60.318,25.772 59.663,26.253 72.759,35.843  "></polygon><polygon points="72.759,30.885 63.049,23.773 62.393,24.254 72.759,31.845  "></polygon><polygon points="72.759,26.886 65.777,21.774 65.123,22.255 72.759,27.847  "></polygon><polygon points="72.759,22.889 68.508,19.775 67.854,20.256 72.759,23.849  "></polygon><polygon points="72.759,18.891 71.236,17.776 70.581,18.257 72.759,19.852  "></polygon><polygon points="28.79,48.865 15.171,38.892 14.844,39.132 28.462,49.104 28.275,49.242 72.759,81.818 72.759,80.857    28.931,48.762  "></polygon><polygon points="31.519,46.866 17.9,36.893 17.573,37.133 31.192,47.105 31.004,47.243 72.759,77.82 72.759,76.859 31.66,46.763     "></polygon><polygon points="34.25,44.866 20.631,34.894 20.304,35.133 33.923,45.106 33.734,45.244 72.759,73.823 72.759,72.861    34.389,44.765  "></polygon><polygon points="36.979,42.867 23.36,32.895 23.033,33.134 36.652,43.107 36.464,43.245 72.759,69.825 72.759,68.864 37.12,42.765     "></polygon><polygon points="39.708,40.869 26.09,30.896 25.763,31.136 39.381,41.108 39.193,41.246 72.759,65.827 72.759,64.867    39.849,40.766  "></polygon><polygon points="56.197,48.74 42.578,38.768 42.438,38.87 28.819,28.896 28.492,29.137 42.111,39.109 41.922,39.247 55.541,49.221     "></polygon><polygon points="58.927,46.742 45.308,36.769 45.167,36.871 31.548,26.898 31.221,27.138 44.84,37.11 44.652,37.248 58.271,47.222     "></polygon><polygon points="61.657,44.741 48.038,34.769 47.382,35.248 61.001,45.222  "></polygon><polygon points="64.387,42.743 50.768,32.77 50.111,33.249 63.73,43.223  "></polygon><polygon points="67.115,40.744 53.496,30.771 52.84,31.25 66.46,41.225  "></polygon><polygon points="69.846,38.745 56.225,28.771 55.568,29.251 69.189,39.225  "></polygon><polygon points="72.574,36.746 58.955,26.772 58.299,27.253 71.918,37.227  "></polygon><polygon points="72.759,32.883 61.686,24.773 61.027,25.253 72.759,33.843  "></polygon><polygon points="72.759,28.885 64.414,22.774 63.758,23.255 72.759,29.846  "></polygon><polygon points="72.759,24.888 67.143,20.775 66.486,21.256 72.759,25.848  "></polygon><polygon points="72.759,20.89 69.872,18.776 69.217,19.257 72.759,21.851  "></polygon><polygon points="72.602,16.777 71.945,17.258 72.759,17.853 72.759,16.893  "></polygon><polygon points="77.236,33.33 72.759,36.61 72.574,36.746 71.918,37.227 71.21,37.745 70.555,38.226 69.846,38.745 69.189,39.225    68.48,39.744 67.824,40.225 67.115,40.744 66.46,41.225 65.75,41.744 65.094,42.225 64.387,42.743 63.73,43.223 63.021,43.743    62.363,44.224 61.657,44.741 61.001,45.222 60.291,45.742 59.637,46.223 58.927,46.742 58.271,47.222 57.562,47.741 56.906,48.222    56.197,48.74 55.541,49.221 54.833,49.74 54.475,50.002 72.759,63.393 77.236,66.67 100,83.338 100,50.002 100,16.662  "></polygon></g></svg>';
    svgDupe    = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.599,66.795H45.201c-6.627,0-12-5.373-12-12V28.405c0-6.627,5.372-12,12-12  h26.399c6.628,0,12,5.373,12,12v26.389C83.6,61.422,78.227,66.795,71.599,66.795z M76.431,28.436c0-2.651-2.149-4.8-4.8-4.8H45.222  c-2.651,0-4.8,2.149-4.8,4.8v26.402c0,2.651,2.149,4.8,4.8,4.8h26.409c2.651,0,4.8-2.149,4.8-4.8V28.436z M69.211,45.249h-7.246  v7.193c0,1.312-1.064,2.377-2.377,2.377h-2.4c-1.313,0-2.377-1.064-2.377-2.377v-7.193h-7.246c-1.313,0-2.376-1.064-2.376-2.377  v-2.454c0-1.313,1.064-2.377,2.376-2.377h7.246v-7.246c0-1.313,1.064-2.377,2.377-2.377h2.4c1.313,0,2.377,1.064,2.377,2.377v7.246  h7.246c1.313,0,2.377,1.064,2.377,2.377v2.454C71.588,44.185,70.524,45.249,69.211,45.249z M28.422,76.438h21.556  c2.624,0,4.749-2.108,4.792-4.722h7.217C61.92,78.286,56.585,83.595,50,83.595H28.401c-6.627,0-12-5.373-12-12V50.006  c0-6.625,5.369-11.995,11.993-11.999v7.287c-2.637,0.016-4.771,2.156-4.771,4.797v21.548C23.622,74.289,25.771,76.438,28.422,76.438  z"></path></svg>';
    svgEx      = '<svg id="svgEx" fill="#FF0000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M163.709,135.425L239.315,59.819C239.603,59.548 239.882,59.269 240.178,59.006C240.769,58.481 241.391,57.992 242.04,57.541C244.312,55.96 246.911,54.861 249.628,54.331C250.404,54.18 251.188,54.075 251.977,54.016C252.371,53.987 252.766,53.981 253.161,53.964C253.556,53.97 253.951,53.975 254.346,53.981C255.396,54.059 255.662,54.055 256.703,54.227C259.043,54.612 261.311,55.416 263.371,56.592C265.088,57.571 266.657,58.806 268.012,60.245C269.368,61.683 270.507,63.322 271.384,65.094C272.435,67.22 273.104,69.531 273.35,71.891C273.636,74.644 273.344,77.45 272.496,80.085C271.77,82.343 270.64,84.468 269.173,86.332C268.52,87.16 268.321,87.337 267.599,88.104L191.994,163.709L267.599,239.315C267.87,239.603 268.15,239.882 268.412,240.178C268.937,240.769 269.427,241.391 269.878,242.04C271.458,244.312 272.557,246.911 273.087,249.628C273.541,251.956 273.577,254.362 273.192,256.703C272.871,258.653 272.26,260.554 271.384,262.325C270.332,264.451 268.9,266.385 267.174,268.012C265.448,269.639 263.432,270.954 261.247,271.878C259.427,272.647 257.494,273.145 255.528,273.35C252.775,273.636 249.968,273.344 247.333,272.496C245.075,271.77 242.951,270.64 241.087,269.173C240.258,268.52 240.081,268.321 239.315,267.599L163.709,191.994L88.104,267.599C87.337,268.321 87.16,268.52 86.332,269.173C84.468,270.64 82.343,271.77 80.085,272.496C77.45,273.344 74.644,273.636 71.891,273.35C69.925,273.145 67.991,272.647 66.171,271.878C64.351,271.108 62.647,270.067 61.131,268.799C59.311,267.277 57.768,265.431 56.592,263.371C55.416,261.311 54.612,259.043 54.227,256.703C53.842,254.362 53.877,251.956 54.331,249.628C54.861,246.911 55.96,244.312 57.541,242.04C57.992,241.391 58.481,240.769 59.006,240.178C59.269,239.882 59.548,239.603 59.819,239.315L135.425,163.709L59.819,88.104C59.548,87.816 59.269,87.536 59.006,87.241C58.481,86.65 57.992,86.028 57.541,85.379C56.187,83.432 55.184,81.244 54.593,78.947C54.1,77.033 53.893,75.047 53.981,73.073C54.087,70.703 54.617,68.356 55.541,66.171C56.619,63.622 58.23,61.305 60.245,59.406C61.683,58.051 63.322,56.911 65.094,56.035C67.22,54.983 69.531,54.315 71.891,54.069C72.939,53.96 73.205,53.979 74.258,53.964C74.653,53.981 75.047,53.999 75.442,54.016C75.835,54.057 76.229,54.087 76.621,54.139C77.405,54.244 78.181,54.396 78.947,54.593C81.244,55.184 83.432,56.187 85.379,57.541C86.028,57.992 86.65,58.481 87.241,59.006C87.536,59.269 87.816,59.548 88.104,59.819L163.709,135.425Z" style=""></path></svg>';
    svgEx2     = ' fill="#FF0000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M163.709,135.425L239.315,59.819C239.603,59.548 239.882,59.269 240.178,59.006C240.769,58.481 241.391,57.992 242.04,57.541C244.312,55.96 246.911,54.861 249.628,54.331C250.404,54.18 251.188,54.075 251.977,54.016C252.371,53.987 252.766,53.981 253.161,53.964C253.556,53.97 253.951,53.975 254.346,53.981C255.396,54.059 255.662,54.055 256.703,54.227C259.043,54.612 261.311,55.416 263.371,56.592C265.088,57.571 266.657,58.806 268.012,60.245C269.368,61.683 270.507,63.322 271.384,65.094C272.435,67.22 273.104,69.531 273.35,71.891C273.636,74.644 273.344,77.45 272.496,80.085C271.77,82.343 270.64,84.468 269.173,86.332C268.52,87.16 268.321,87.337 267.599,88.104L191.994,163.709L267.599,239.315C267.87,239.603 268.15,239.882 268.412,240.178C268.937,240.769 269.427,241.391 269.878,242.04C271.458,244.312 272.557,246.911 273.087,249.628C273.541,251.956 273.577,254.362 273.192,256.703C272.871,258.653 272.26,260.554 271.384,262.325C270.332,264.451 268.9,266.385 267.174,268.012C265.448,269.639 263.432,270.954 261.247,271.878C259.427,272.647 257.494,273.145 255.528,273.35C252.775,273.636 249.968,273.344 247.333,272.496C245.075,271.77 242.951,270.64 241.087,269.173C240.258,268.52 240.081,268.321 239.315,267.599L163.709,191.994L88.104,267.599C87.337,268.321 87.16,268.52 86.332,269.173C84.468,270.64 82.343,271.77 80.085,272.496C77.45,273.344 74.644,273.636 71.891,273.35C69.925,273.145 67.991,272.647 66.171,271.878C64.351,271.108 62.647,270.067 61.131,268.799C59.311,267.277 57.768,265.431 56.592,263.371C55.416,261.311 54.612,259.043 54.227,256.703C53.842,254.362 53.877,251.956 54.331,249.628C54.861,246.911 55.96,244.312 57.541,242.04C57.992,241.391 58.481,240.769 59.006,240.178C59.269,239.882 59.548,239.603 59.819,239.315L135.425,163.709L59.819,88.104C59.548,87.816 59.269,87.536 59.006,87.241C58.481,86.65 57.992,86.028 57.541,85.379C56.187,83.432 55.184,81.244 54.593,78.947C54.1,77.033 53.893,75.047 53.981,73.073C54.087,70.703 54.617,68.356 55.541,66.171C56.619,63.622 58.23,61.305 60.245,59.406C61.683,58.051 63.322,56.911 65.094,56.035C67.22,54.983 69.531,54.315 71.891,54.069C72.939,53.96 73.205,53.979 74.258,53.964C74.653,53.981 75.047,53.999 75.442,54.016C75.835,54.057 76.229,54.087 76.621,54.139C77.405,54.244 78.181,54.396 78.947,54.593C81.244,55.184 83.432,56.187 85.379,57.541C86.028,57.992 86.65,58.481 87.241,59.006C87.536,59.269 87.816,59.548 88.104,59.819L163.709,135.425Z" style=""></path></svg>';
    svgCheck   = '<svg id="svgCheck" fill="#45c0bd" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M119.164,220.552L252.858,86.858C253.12,86.61 253.375,86.354 253.644,86.113C254.182,85.631 254.745,85.178 255.332,84.756C257.68,83.069 260.392,81.903 263.231,81.358C264.295,81.154 265.375,81.037 266.458,81.007C266.819,80.998 267.181,81.007 267.542,81.007C267.902,81.027 268.263,81.046 268.623,81.066C269.58,81.17 269.823,81.177 270.769,81.358C272.897,81.767 274.957,82.523 276.843,83.59C278.415,84.479 279.865,85.581 281.142,86.858C283.187,88.902 284.776,91.389 285.773,94.103C286.645,96.477 287.061,99.013 286.993,101.542C286.944,103.347 286.649,105.144 286.119,106.87C285.483,108.942 284.508,110.908 283.244,112.668C282.822,113.255 282.369,113.818 281.887,114.356C281.646,114.625 281.39,114.88 281.142,115.142L131.142,265.142L131.127,265.157C130.911,265.372 130.691,265.582 130.465,265.787C130.429,265.821 130.393,265.854 130.356,265.887L130.279,265.955L130.259,265.973L130.235,265.994C130.116,266.099 129.996,266.202 129.874,266.305L129.848,266.327L129.817,266.353L129.74,266.417L129.632,266.505L129.57,266.556L129.567,266.559L129.53,266.588L129.466,266.639L129.429,266.669L129.383,266.705L129.318,266.756L129.29,266.778C129.238,266.819 129.185,266.859 129.133,266.899L129.104,266.922L129.053,266.96L129,267L128.935,267.048L128.887,267.084L128.866,267.099C128.807,267.143 128.748,267.186 128.689,267.228L128.668,267.244L128.623,267.276L128.562,267.319L128.511,267.355L128.475,267.381L128.449,267.398L128.415,267.423L128.293,267.506L128.28,267.516L128.277,267.518C128.223,267.554 128.17,267.59 128.116,267.626L128.09,267.644L128.083,267.648L128.064,267.661L127.947,267.738L127.896,267.771L127.885,267.778L127.868,267.789L127.776,267.849L127.695,267.9L127.685,267.906L127.677,267.911C126.211,268.837 124.624,269.57 122.969,270.088L122.968,270.089L122.963,270.09L122.811,270.137L122.757,270.153L122.741,270.158L122.714,270.166L122.617,270.195L122.544,270.216L122.514,270.225L122.485,270.233L122.421,270.251L122.328,270.277L122.285,270.289L122.263,270.295L122.226,270.305L122.129,270.331L122.056,270.35L122.032,270.357L122.007,270.363L121.917,270.386L121.827,270.409L121.801,270.415L121.788,270.418L121.748,270.428L121.629,270.457L121.587,270.467L121.569,270.471L121.534,270.479L121.431,270.503L121.37,270.516L121.349,270.521L121.321,270.527L121.233,270.547L121.15,270.564L121.128,270.569L121.109,270.573L121.034,270.589L120.925,270.611L120.907,270.614L120.897,270.616L120.835,270.629L120.689,270.656L120.686,270.657L120.684,270.657C120.241,270.74 119.795,270.808 119.347,270.861L119.347,270.861L119.347,270.861L119.23,270.875L119.124,270.886L119.123,270.886L119.122,270.886C118.599,270.942 118.074,270.978 117.548,270.992L117.548,270.992L117.547,270.992L117.406,270.996L117.329,270.997L117.322,270.997L117.312,270.997L117.203,270.999L117.108,270.999L117.096,270.999L117.085,270.999L117,271L116.885,270.999L116.871,270.999L116.862,270.999L116.797,270.999L116.656,270.997L116.645,270.997L116.641,270.996C116.344,270.991 116.049,270.979 115.753,270.961L115.743,270.96L115.706,270.958L115.579,270.949L115.54,270.946L115.518,270.945L115.469,270.941L115.377,270.934L115.32,270.929L115.293,270.927L115.264,270.924L115.208,270.92L115.103,270.91L115.068,270.906L115.057,270.905C114.985,270.898 114.912,270.891 114.841,270.883L114.821,270.881L114.786,270.877L114.703,270.868L114.606,270.856L114.574,270.852L114.56,270.85C114.486,270.841 114.413,270.832 114.339,270.822L114.328,270.821L114.304,270.817L114.199,270.803L114.099,270.788L114.082,270.786L114.073,270.784C112.72,270.584 111.387,270.245 110.103,269.773C109.701,269.626 109.304,269.465 108.913,269.291L108.855,269.266L108.851,269.264L108.848,269.263L108.829,269.254C108.384,269.055 107.946,268.84 107.517,268.609C106.125,267.859 104.823,266.944 103.646,265.888L103.645,265.887L103.643,265.886L103.548,265.8L103.453,265.713L103.444,265.705L103.44,265.701C103.379,265.644 103.317,265.587 103.257,265.53L103.246,265.52L103.227,265.502L103.152,265.43L103.073,265.354L103.051,265.332L103.041,265.322C102.991,265.275 102.943,265.226 102.894,265.178L102.876,265.16L102.858,265.142L102.743,265.026L102.703,264.986L102.697,264.98C102.639,264.92 102.581,264.86 102.523,264.799L102.515,264.791L102.453,264.724L102.364,264.63L102.352,264.617L102.33,264.593L102.256,264.513L102.204,264.456L102.186,264.436L102.147,264.394L102.076,264.314L102.045,264.28L102.025,264.257L101.967,264.191L101.903,264.117L101.889,264.101L101.873,264.083C101.727,263.914 101.584,263.743 101.444,263.57C101.4,263.516 101.358,263.462 101.315,263.408C101.229,263.299 101.144,263.189 101.06,263.078L101,263L51,196.333C50.859,196.138 50.715,195.946 50.577,195.748C50.165,195.155 49.785,194.539 49.439,193.905C48.517,192.214 47.842,190.39 47.44,188.506C47.038,186.622 46.91,184.681 47.062,182.761C47.251,180.36 47.878,177.997 48.903,175.818C49.929,173.639 51.35,171.65 53.079,169.974C54.462,168.633 56.039,167.494 57.747,166.603C59.668,165.6 61.751,164.913 63.892,164.576C64.606,164.464 65.325,164.39 66.047,164.356C66.287,164.345 66.528,164.342 66.769,164.335C67.009,164.336 67.25,164.338 67.491,164.339C68.132,164.367 68.293,164.365 68.932,164.427C69.891,164.52 70.842,164.682 71.777,164.912C75.055,165.719 78.108,167.363 80.585,169.655C81.115,170.146 81.619,170.665 82.092,171.21C82.514,171.695 82.606,171.827 83,172.333L119.164,220.552Z" style=""></path></svg>';
    svgRemember= '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 80 80" x="0px" y="0px"><path d="M56.5,70.15h-24a5.93,5.93,0,0,1-5.92-5.92V60.42c-2.17-1-9-4.59-9-11.36V37.28a3.9,3.9,0,0,1,3.89-3.89c2.16,0,7.27,2.55,7.27,6.57h-2c0-2.62-4-4.57-5.27-4.57a1.87,1.87,0,0,0-1.89,1.89V49.06c0,6.51,8.27,9.73,8.36,9.76l.64.24v5.17a3.93,3.93,0,0,0,3.92,3.92h24a3.93,3.93,0,0,0,3.92-3.92V29.54h2V64.23A5.93,5.93,0,0,1,56.5,70.15Z"></path><path d="M55.72,76.83H34.41A3.79,3.79,0,0,1,30.62,73V72a3.8,3.8,0,0,1,3.79-3.8H55.72A3.8,3.8,0,0,1,59.51,72V73A3.79,3.79,0,0,1,55.72,76.83ZM34.41,70.15A1.8,1.8,0,0,0,32.62,72V73a1.79,1.79,0,0,0,1.79,1.79H55.72A1.79,1.79,0,0,0,57.51,73V72a1.8,1.8,0,0,0-1.79-1.8Z"></path><path d="M27.74,46a1,1,0,0,1-1-1V6.73a1,1,0,0,1,2,0V45A1,1,0,0,1,27.74,46Z"></path><path d="M45.58,29.91h-2a3.21,3.21,0,0,0-6.42,0h-2a5.21,5.21,0,0,1,10.42,0Z"></path><path d="M37.16,6.73h-2a3.21,3.21,0,1,0-6.42,0h-2a5.21,5.21,0,1,1,10.42,0Z"></path><path d="M62.42,29.91h-2a3.21,3.21,0,0,0-6.42,0H52a5.21,5.21,0,0,1,10.42,0Z"></path><path d="M54,29.91H52a3.21,3.21,0,1,0-6.42,0h-2a5.21,5.21,0,1,1,10.42,0Z"></path><path d="M36.16,35.13a1,1,0,0,1-1-1V6.73a1,1,0,0,1,2,0v27.4A1,1,0,0,1,36.16,35.13Z"></path><path d="M44.58,35.13a1,1,0,0,1-1-1V29.91a1,1,0,1,1,2,0v4.22A1,1,0,0,1,44.58,35.13Z"></path><path d="M53,35.13a1,1,0,0,1-1-1V29.91a1,1,0,1,1,2,0v4.22A1,1,0,0,1,53,35.13Z"></path><path d="M22.23,18.67c-2.44,0-4.34-2.77-4.34-6.31s1.9-6.31,4.34-6.31c2,0,8.37,4.2,10.28,5.48l1.23.83-1.23.83C30.6,14.47,24.22,18.67,22.23,18.67Zm0-10.62c-1.11,0-2.34,1.77-2.34,4.31s1.23,4.31,2.34,4.31c.86,0,4.54-2.11,7.91-4.31-3.37-2.2-7.06-4.3-7.91-4.31Z"></path><path d="M41.68,18.67c-2,0-8.38-4.2-10.28-5.48l-1.24-.83,1.24-.83c1.9-1.28,8.28-5.48,10.28-5.48,2.43,0,4.34,2.77,4.34,6.31S44.11,18.67,41.68,18.67Zm-7.91-6.31c3.37,2.2,7,4.3,7.91,4.31,1.11,0,2.34-1.77,2.34-4.31s-1.23-4.31-2.34-4.31C40.82,8.06,37.14,10.16,33.77,12.36Z"></path><path d="M21.08,24.07a1,1,0,0,1,0-2c.4,0,9.88-.23,9.88-9.71a1,1,0,0,1,2,0C33,23.84,21.2,24.07,21.08,24.07Z"></path><path d="M42.83,24.07h0C42.7,24.07,31,23.84,31,12.36a1,1,0,0,1,2,0c0,9.48,9.49,9.71,9.89,9.71a1,1,0,0,1,0,2Z"></path><path d="M35.38,13.36H28.07a1,1,0,0,1,0-2h7.31a1,1,0,0,1,0,2Z"></path></svg>';
    svgSort    = '<svg height="40" width="40" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#45c0bd" viewBox="0 0 100 100" version="1.1" x="0px" y="0px"><desc>Created with Sketch.</desc><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill-rule="nonzero" fill="#45c0bd"><path d="M64.762917 57.3560188L64.762917 62.8153679C64.762917 63.108043 64.604555 63.4856378 64.4092057 63.6856473L55.1782727 73.1367874C54.9806692 73.3391048 54.6661994 73.3367969 54.4708501 73.1367874L45.2399171 63.6856473C45.0423136 63.4833299 44.8862058 63.0960004 44.8862058 62.8153679L44.8862058 57.3560188C44.8862058 57.0633437 45.0433373 57.0087685 45.2371688 57.207224L52.2374684 64.3745182C52.4275595 64.5691439 52.5884314 64.5067503 52.5884314 64.2266044L52.5884314 48.8911881C52.5884314 48.6150665 52.8103628 48.383939 53.0841291 48.383939L56.5649937 48.383939C56.844985 48.383939 57.0606914 48.6110421 57.0606914 48.8911881L57.0606914 64.2266044C57.0606914 64.502726 57.2178229 64.5729736 57.4116544 64.3745182L64.411954 57.207224C64.6020451 57.0125982 64.762917 57.0753863 64.762917 57.3560188ZM36.237083 42.6439812L36.237083 37.1846321C36.237083 36.891957 36.395445 36.5143622 36.5907943 36.3143527L45.8217273 26.8632126C46.0193308 26.6608952 46.3338006 26.6632031 46.5291499 26.8632126L55.7600829 36.3143527C55.9576864 36.5166701 56.1137942 36.9039996 56.1137942 37.1846321L56.1137942 42.6439812C56.1137942 42.9366563 55.9566627 42.9912315 55.7628312 42.792776L48.7625316 35.6254818C48.5724405 35.4308561 48.4115686 35.4932497 48.4115686 35.7733956L48.4115686 51.1088119C48.4115686 51.3849335 48.1896372 51.616061 47.9158709 51.616061L44.4350063 51.616061C44.155015 51.616061 43.9393086 51.3889579 43.9393086 51.1088119L43.9393086 35.7733956C43.9393086 35.497274 43.7821771 35.4270264 43.5883456 35.6254818L36.588046 42.792776C36.3979549 42.9874018 36.237083 42.9246137 36.237083 42.6439812Z"/></g></g></svg>';
}

function todayString() {
    var d = new Date();

    var month = d.getMonth() + 1;
    var day = d.getDate();

    var dstring = d.getFullYear() + '/' +
        (('' + month).length < 2 ? '0' : '') + month + '/' +
        (('' + day).length < 2 ? '0' : '') + day;

    return dstring;
};

function convertToCSV(arr,type) {
	let subset  = [];
	let now     = new Date();
	let dateStr = dateWithSlashes( now );

	//-- create clone obj minus unneeded fields
	$.each( arr, function(idx,item){
    let clone = (({ 
		avgCost,
		brand, 
		caseQty,
		code_num,
		itemNbr,
		descrip,
		depositAmt,
		isDeposit,
		lastCost,
		mtd,
		onHand,
		onOrder,
		orderLot,
		ordCases,
		ordUnits,
		ounces,
		notes,
		parQty,
		price,
		reordPt,
		stdQty,
		taxRate,
		thisWeek,
		lastWeek,
		yrAgo,
		...o }) => o)(item);

		//-- add fields/transform others
		clone.rowId        = clone.rowId.slice(0,-1); // get rid of the period
		clone.unitsPerCase = poItems.data[idx].caseQty;
		clone.posSKU       = poItems.data[idx].code_num;
		clone.vendorSKU    = poItems.data[idx].itemNbr.trim();
		clone.barcode      = clone.barcode.trim();
		clone.vendor       = $('#PO_vendorSelect option:selected').text();
		clone.date         = dateStr;
		clone.poNbr        = poNumber;

		if (isReceive) {
			clone.invoiceNbr  = rcvInvoice;
			clone.receiverNbr = rcvNumber;
		}

		if (type === 'csv') {
			clone.caseCost = clone.caseCost.toFixed(2);
			clone.unitCost = clone.unitCost.toFixed(4);
			clone.total    = clone.total.toFixed(2);
		} else {
			clone.rowId = parseInt( clone.rowId );
		}

		subset.push( clone );
	});

	//-- now sort clone obj's fields to make CSV more readable
	$.each( subset, function(idx,item){
		subset[idx] = moveObjectElement( 'poNbr', '', item );	
	});

	$.each( subset, function(idx,item){
		subset[idx] = moveObjectElement( 'rowId', 'poNbr', item );	
	});

	$.each( subset, function(idx,item){
		subset[idx] = moveObjectElement( 'posSKU', 'rowId', item );
	});

	$.each( subset, function(idx,item){
		subset[idx] = moveObjectElement( 'item', 'posSKU', item );
	});

	$.each( subset, function(idx,item){
		subset[idx] = moveObjectElement( 'vendorSKU', 'total', item );
	});

	$.each( subset, function(idx,item){
		subset[idx] = moveObjectElement( 'units', 'cases', item );
	});

	$.each( subset, function(idx,item){
		subset[idx] = moveObjectElement( 'unitCost', 'caseCost', item );
	});
	if (type === 'excel') {
		return subset;
	}

	const array = [Object.keys(subset[0])].concat(subset)
  
	return array.map(it => {
	  return Object.values(it).toString()
	}).join('\n')
}

function downloadCSV(filename, text, clearIt) {
	// Create an invisible element
	const a = document.createElement("a");
	a.style.display = "none";
	document.body.appendChild(a);
  
	// Set the HREF to a Blob representation of the data to be downloaded
	a.href = window.URL.createObjectURL(
	  new Blob([text], { type: "text/plain;charset=utf-8" })
	);
  
	// Use download attribute to set set desired file name
	a.setAttribute("download", filename);
  
	// Trigger the download by simulating click
	a.click();
  
	// Cleanup
	window.URL.revokeObjectURL(a.href);
	document.body.removeChild(a);

	if (clearIt) {
		actOnClear();
	}
  }

// small algorithm which allows to move keys, it's like jQuery .insertAfter() method. You have to provide:
// currentKey: the key you want to move
// afterKey: position to move-after the currentKey, null or '' if it must be in position [0]
// obj: object
function moveObjectElement(currentKey, afterKey, obj) {
    var result = {};
    var val = obj[currentKey];
    delete obj[currentKey];
    var next = -1;
    var i = 0;
    if(typeof afterKey == 'undefined' || afterKey == null) afterKey = '';
    $.each(obj, function(k, v) {
        if((afterKey == '' && i == 0) || next == 1) {
            result[currentKey] = val; 
            next = 0;
        }
        if(k == afterKey) { next = 1; }
        result[k] = v;
        ++i;
    });
    if(next == 1) {
        result[currentKey] = val; 
    }
    if(next !== -1) return result; else return obj;
}


function dateWithDashes(d) {
    const curr_date = d.getDate();
    const curr_month = d.getMonth() + 1;
    const curr_year = d.getFullYear();

    return (curr_month + "-" + curr_date + "-" + curr_year);
}

function dateWithSlashes(d,noYear) {
    const dd = d.getDate();
    const mm = d.getMonth() + 1;
    const y = d.getFullYear();
    if (noYear) {
        return (mm + '/'+ dd);
    } else {
        return (mm + '/'+ dd + '/'+ y);
    }
}

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

function convertToXLSX(obj, ws_name, clearIt) {
	const filename = ws_name + ".xlsx";

	let wb = XLSX.utils.book_new();
	let ws = XLSX.utils.json_to_sheet(obj);

	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	/* write workbook */
	XLSX.writeFile(wb, filename, {cellStyles: true});

	if (clearIt) {
		actOnClear();
	}
}

function notAvailable() {
    swal("Sorry, not available :(", "The function you have selected is coming soon!", "info");
}

/**
  * Wrapper for vax.dialog.alert
  * @param {Text} txt Text to display in alert box
  * @param {Text} cEl Optional - element to focus after alert closes
  */
function vexAlert(txt, cEl) {
	vex.dialog.alert({
		unsafeMessage: txt,
		className: 'vex-theme-wireframe',
		afterOpen: function() {
			lPauseKeys = true;
			playNotify();
		},
		afterClose: function() {
			lPauseKeys = false;
			if (cEl) {
				setTimeout(function() { $('#'+cEl).focus(); }, 25);
			}
		}
	});
}

const isWhitespaceString = str => !/\S/.test(str);
