/*==========================================================================*\
|| ######################################################################## ||
|| # encorePOS 1.3.100.105                                                # ||
|| # pos.js                                                               # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
\*==========================================================================*/

var cVersion = getVersionNumber();
var lineEditor;
var lineEditorVar;
var navButtons = [];
var navFocus = 0;
var dataSet;
var customer;
var taxExempt = {ex1: false, ex2: false, ex3: false, exFlat: false, exVol: false};
var taxDue = {tax1: 0, tax2: 0, tax3: 0, flatTax: 0, volTax: 0};
var cashTaxDue = {tax1: 0, tax2: 0, tax3: 0, flatTax: 0, volTax: 0};
var lEditing = false;
var currLine = 0;
var lPauseKeys = false;
var lMsgUp = false;
var uid;
var oldID;
var drawer;

// types invalid for certain functions (case sale, promo, 2-fer, etc)
const invalidTypes = ["00", "01", "02", "59", "60", "K", "V", "CA", "CP", "IP", "IS", "LO", "LP", "FQ", "FC" ]

var noCache = false;
var itemListData;
var itemListTable;
var custListData;
var custListTable;
var vendListData;
var f5LastRow;
var refundLast;
var gBarDiscLast;
var globalFocusElement = "";

var ctxMenu;
var ctxMenuVisible = false;

var svgSearch;
var svgAlert;
var svgGiftCard;

var invNbr = '';
var initials = '';
var zipcode = '';

// tender vars
var lExitTender = false;
var nTender = 1;
var lFirstEnter = true;
var activeTender;
var aTenders = [];
var cashSuggs = [];
var aCardAns = [];
var aGiftCards = [];
var totalDue = 0;
var cashTotal = 0;
var amtIn = 0;
var penny = 0;  // rounding on cash sale to eliminate pennies
var tenderKeyboard;

// screen layout vars
var isMobile;
var hostOS;
var cusDivHeight;
var saleDivTop1;
var saleDivTop2;
var gBarTop1;
var gBarTop2;
var totalDivTop1;
var totalDivTop2;
var menuButtTop;

// quick keys that toggle
var qKeys = "#deleteBtn, #editBtn, #discBtn, #tenderBtn, #caseBtn, #atCaseBtn, #refundBtn, #qLine1, #qLine2, #qAll1, #qAll2, #deliveryBtn, #popBtn"

// setup vars -- need to become dynamic
var stationID = 'EPOS';
var pSet;

// multi-lingual stuff
var translator;
var languageVar = 'en';
var dict;

// scanner stuff

function initDialogFallbackLayer() {
	var supportsDialog = typeof window.HTMLDialogElement !== "undefined" &&
		window.HTMLDialogElement.prototype &&
		typeof window.HTMLDialogElement.prototype.showModal === "function" &&
		typeof window.HTMLDialogElement.prototype.close === "function";

	if (supportsDialog) {
		return;
	}

	if (!window.__eposDialogFallbackWarned) {
		console.warn("encorePOS: Native <dialog> support not detected. Using fallback modal layer.");
		window.__eposDialogFallbackWarned = true;
	}

	var patchDialog = function(dialogEl) {
		if (!dialogEl || dialogEl.__eposDialogFallbackPatched) {
			return;
		}

		dialogEl.__eposDialogFallbackPatched = true;

		dialogEl.showModal = function() {
			var $el = window.jQuery ? window.jQuery(dialogEl) : null;

			if ($el && typeof $el.dialog === "function") {
				if (!$el.data("eposDialogFallbackInit")) {
					$el.dialog({
						autoOpen: false,
						modal: true,
						resizable: false,
						draggable: false,
						width: "auto",
						minHeight: 0,
						create: function() {
							window.jQuery(this).parent().find(".ui-dialog-titlebar").hide();
						}
					});
					$el.data("eposDialogFallbackInit", true);
				}

				try {
					if (!$el.dialog("isOpen")) {
						$el.dialog("open");
					}
				} catch (err) {
					$el.dialog("open");
				}
				return;
			}

			dialogEl.setAttribute("open", "");
			dialogEl.style.display = "block";
			dialogEl.style.position = "fixed";
			dialogEl.style.top = "50%";
			dialogEl.style.left = "50%";
			dialogEl.style.transform = "translate(-50%, -50%)";
			dialogEl.style.zIndex = "100000";
		};

		dialogEl.close = function() {
			var $el = window.jQuery ? window.jQuery(dialogEl) : null;

			if ($el && typeof $el.dialog === "function" && $el.data("eposDialogFallbackInit")) {
				try {
					if ($el.dialog("isOpen")) {
						$el.dialog("close");
					}
				} catch (err) {
				}
				return;
			}

			dialogEl.removeAttribute("open");
			dialogEl.style.display = "none";
		};
	};

	var dialogs = document.querySelectorAll("dialog");
	for (var i = 0; i < dialogs.length; i++) {
		patchDialog(dialogs[i]);
	}

	if (typeof window.MutationObserver === "function" && document.body) {
		var observer = new MutationObserver(function(mutations) {
			for (var i = 0; i < mutations.length; i++) {
				var addedNodes = mutations[i].addedNodes;
				for (var j = 0; j < addedNodes.length; j++) {
					var node = addedNodes[j];
					if (!node || node.nodeType !== 1) {
						continue;
					}

					if (node.tagName && node.tagName.toLowerCase() === "dialog") {
						patchDialog(node);
					}

					if (node.querySelectorAll) {
						var nestedDialogs = node.querySelectorAll("dialog");
						for (var k = 0; k < nestedDialogs.length; k++) {
							patchDialog(nestedDialogs[k]);
						}
					}
				}
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}
}

function salesLoader() {
	initDialogFallbackLayer();

	uid = getCookie('uid')
	oldID = getCookie('oldID')

   let cSID = getCookie('_SID');
	let cUID = uid;

    if (cSID===null || cSID===undefined || cSID==='') {
        window.location.replace("posLogin.html");
        return;
    } else {
		$.post( "sessionCheck?", { SID: cSID, UID: cUID, FROM: "POS" }, 
			function(reply) {
				if (reply.result === 'success') {
					init();
				} else {
					window.location.replace("posLogin.html");
					return;
				}
			}
		)
	}
}

function init() {

	uid = localStorage.getItem('uid');
	drawer = localStorage.getItem('drawer');

console.log("on start, drawer:", drawer, "type:", typeof drawer);

	(function ($) {
        $.fn.replaceClass = function (pFromClass, pToClass) {
            return this.removeClass(pFromClass).addClass(pToClass);
        };
    }(jQuery));

	var d1 = new Date()

	dict = setDictionary();  // in ePosDict.js
console.log( "in int, dict =", dict);
	loadItemListData();

	loadCustListData();

	loadVendListData();
	
	getClientInfo(); // determine if mobile

console.log('os:',hostOS,'\nisMobile:',isMobile);
console.log( 'screen height:', $(document).height());
console.log( 'on init, document height:',$(document).height() );
console.log( 'on init, document width:',$(document).width() );

isMobile = false;

	if (isMobile) {
		cusDivHeight = ($(document).height() * .125).toString() + 'px';
		saleDivTop1  = '160px';
		saleDivTop2  = (($(document).height() * .125) + 105).toString() + 'px';
		gBarTop1     = '120px'
		gBarTop2     = (($(document).height() * .125) + 85).toString() + 'px';
		totalDivTop1 = $('#totalTableDiv').position().top.toString() + 'px'; // ($(document).height() * .750).toString() + 'px';
		totalDivTop2 = 'calc( 95% - 154px)';
		menuButtTop  = $('#menuButton').position().top.toString() + 'px';
		//$('#scanText').attr( 'readonly', 'readonly' );
	} else {
		cusDivHeight = '12.5%';
		saleDivTop1  = '160px';
		saleDivTop2  = 'calc( 12.5% + 132px )';
		gBarTop1     = '120px'
		gBarTop2     = 'calc( 12.5% + 92px )';
		totalDivTop1 = 'calc( 95% - 40px)';
		totalDivTop2 = 'calc(95% - 153px)';
		menuButtTop  = 'calc( 95% - 44px )';
	}

	$("#versionDiv").text("v" + getVersionNumber());

	//$('#customerDiv').css( 'min-height', cusDivHeight );
	$('#saleTableDiv').css( 'top', saleDivTop1 );
	$('.gFuncBar').css( 'top', gBarTop1 );
	$('#totalTableDiv').css( 'top', totalDivTop1 );
	//$("#payDiv").css( 'top', menuButtTop );
	$('#menuButton').css( 'top', menuButtTop );

	//------ set values in setting object
	$.post("pSettings?", {"drawer": drawer}, function (reply) {
		if (reply.result === 'success') {
			pSet = reply.settings;
		} else {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' +
						reply.msg + "<br>You are using the default settings.<br>Please contact your system admin.",
				className: 'vex-theme-wireframe',       // Overwrites defaultOptions
				afterOpen: function() {
					pauseBodyKeypress()
					$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
				},
				afterClose: function() { if (($("#drawerInit").is(":visible"))) { 
													pauseBodyKeypress();
													$("#drawerInitAmount").focus();
												 } else { 
													resetBodyKeypress();
												 }
				}
			});

			pSet = ePosSetUp();
		}
		morepSetActions();
	})
	.fail(function () {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' + 
						"Error retrieving settings.<br>You are using the default settings.<br>Please contact your system admin.",
				className: 'vex-theme-wireframe',       // Overwrites defaultOptions
				afterOpen: function() {
					lPauseKeys = true; 
					$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
				},
				afterClose: function() { if (($("#drawerInit").is(":visible"))) { 
													pauseBodyKeypress();
													$("#drawerInitAmount").focus();
												 } else { 
													resetBodyKeypress();
												 }
				}
			});

		pSet = ePosSetUp();
		morepSetActions();
	})
	.always(function() {
		//----- handle login if set to trigger time clock
    	let fromLogin = localStorage.getItem('fromLogin');  // distinguishes new session from a screen refresh
    	localStorage.setItem('fromLogin', false);
    	if (pSet.loginAsTimeClock && fromLogin === 'true') {
        	$.post("submitTimeClock", {"inOut": "I", "userID": oldID});
    	}
	});

    $.post( "pdInit?" );

	$('#menuButton').on('click', openNav);

	$('#scanText').keypress(function (e) {
		var ingnore_key_codes = [0];
		if ($.inArray(e.keyCode, ingnore_key_codes) >= 0) {
			e.preventDefault();
		} else if (e.keyCode == 13) { // the enter key code
			get_item(); // $('#barcGo').click();
			$('#scanText').val("");
			return false;
		};
	});

	try{
		dataSet  = JSON.parse(localStorage.getItem('dataSet')) || { "data": [] };
		customer = JSON.parse(localStorage.getItem('customer')) || { "custData": {} };
		taxExempt = JSON.parse(localStorage.getItem('taxExempt')) || {ex1: false, ex2: false, ex3: false, exFlat: false, exVol: false};

    } catch (err) {
        dataSet  = { "data": [] };
		customer = { "custData": {} };
		taxExempt = {ex1: false, ex2: false, ex3: false, exFlat: false, exVol: false};
	}
	
	if (typeof dataSet === 'object' && Object.keys(dataSet).length === 0) {
		dataSet = { "data": [] };
		localStorage.setItem('dataSet', JSON.stringify(dataSet));
	}

	//----- define function to check if sale table is in overflow
	$.fn.overflownY=function(){var e=this[0];return e.scrollHeight>e.clientHeight;}

//	startTime();  do after pSet is laoded to have legalAge setting, now in morepSetActions()

	ctxMenu = document.querySelector(".contextMenu");

	ctxMenu.addEventListener("click", e => {
		if (ctxMenuVisible) toggleMenu("hide");
	});

	$("#saleTableBody").on( "contextmenu", "td", function(e){
		e.preventDefault();
		var idx = $(this).index();
		var row = $(this).parent().index();

		console.log( "cell:", idx, "row:", row );
		posContextMenu(row,idx,e);
	});

	$("#saleTableBody").on( "click", "td", function(e){
		var idx = $(this).index();
		var row = $(this).parent().index();
		console.log( "row clicked:", row, "idx:", idx );
		if (idx < 4) {
			currLine = row + 1;
			paintCurrentLine();
		}
	});

	saleTableCellClick();

	//----  SHORTCUT KEY HANDLERS
	/*
	F1 = Help
	F2 = Exit
	F3 = Items
	F4 = Void
	F5 = Delete
	F6 = Edit
	F7 = Discount
	F8 = Customer
	F9 = Tender
	F10 = Case Sale
	*/

   shortcut.add("F1",function() { keyLogger( 112 ); });
	shortcut.add("F2",function() { keyLogger( 113 ); $( "#logoutBtn" ).trigger( "click" ); } );
	shortcut.add("F3",function() { keyLogger( 114 ); $( "#itemListBtn" ).trigger( "click" ); } );
	shortcut.add("F4",function() { keyLogger( 115 ); $( "#voidBtn" ).trigger( "click" ); } );
	shortcut.add("F5",function() { keyLogger( 116 ); $( "#deleteBtn" ).trigger( "click" ); } );
	shortcut.add("F6",function() { keyLogger( 117 ); $( "#editBtn" ).trigger( "click" ); } );
	shortcut.add("F7",function() { keyLogger( 118 ); $( "#discBtn" ).trigger( "click" ); } );
	shortcut.add("F8",function() { keyLogger( 119 ); $( "#custListBtn" ).trigger( "click" ); } );
	shortcut.add("F9",function() { console.log("F9 pressed"); $( "#tenderBtn" ).trigger( "click" ); } );
	shortcut.add("ALT+F9", function() { alert("Not Implemented"); } );
	shortcut.add("Ctrl+F9", function() { secureCheck("ZWSDP", "showCashDrop"); } );
	shortcut.add("F10",function() { keyLogger( 121 ); $( "#caseBtn" ).trigger( "click" ); } );
	shortcut.add("Shift+F10", function() { atCaseLine(); });
	shortcut.add("ALT+F10", function() { toggleNav(); } );

	shortcut.add('ALT+S', function() { searchInputFocus(); } );
	//shortcut.add('ALT+T', function () { tableFocus(); } );
/*
	shortcut.add('ALT+A', function() { lookupSort( 'A' ); } );
	shortcut.add('ALT+B', function() { lookupSort( 'B' ); } );
	shortcut.add('ALT+C', function() { lookupSort( 'C' ); } );
	shortcut.add('ALT+D', function() { lookupSort( 'D' ); } );
	shortcut.add('ALT+I', function() { lookupSort( 'I' ); } );
	shortcut.add('ALT+L', function() { lookupSort( 'L' ); } );
	shortcut.add('ALT+M', function() { lookupSort( 'M' ); } );
	shortcut.add('ALT+N', function() { lookupSort( 'N' ); } );
	//shortcut.add('ALT+O', function() { lookupSort( 'O' ); } );
	shortcut.add('ALT+P', function() { lookupSort( 'P' ); } );
	shortcut.add('ALT+R', function() { lookupSort( 'R' ); } );
	shortcut.add('ALT+U', function() { lookupSort( 'U' ); } );
	shortcut.add('ALT+Y', function() { lookupSort( 'Y' ); } );
	shortcut.add('ALT+Z', function() { lookupSort( 'Z' ); } );
*/
	shortcut.add("ESC", function() { escKeyFunc(); } );

	shortcut.add( "UP", function() { shortcutUp(); } );
	shortcut.add( "DOWN", function() { shortcutDown(); } );
	shortcut.add( "LEFT", function() { shortcutLeft(); } );
	shortcut.add( "RIGHT", function() { shortcutRight(); } );

	//shortcut.add( "RIGHT", function() { keyLogger( 39 ); openNav(); });
	//shortcut.add( "LEFT", function() { keyLogger( 37 ); closeNav(); });

	shortcut.add('ALT+pageDown', function() { altPageDown(); } );
	shortcut.add('ALT+pageUp', function() { altPageUp(); } );

	if ($(document).width()>1280) {
		//$('#saleTableDiv').css({'width': 'calc(95% - 230px)'});
		//$('#customerDiv').css({'width': 'calc(40% - 200px)'});
		//$('#cashSale').css({'min-width': 'calc(40% - 200px)'});
		openNav();
	}

    // Swipe to open sidenav
	$('#mySidenav','#menuButton').on('swiperight', function(e) { 
		openNav();
	});

	// Swipe to close sidenav
	$('#mySidenav','#menuButton').on('swipeleft', function(e) { 
		closeNav();
	});

	closeNav();

/*
	$('body').on('keypress',function (e) {
		console.log( 'event:',e );
		keyLogger( e.which );
		focusBarc(e.which);
	});
    */

	let timer;
	let cLastIn = 0;
   let doingDL = false;
   let c2DDL   = '';
   const barcChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz #.`*+]'-\\Backspace";

	$('body').on('keydown', function (e) {
		// console.log('keydown:',e.which, e.key, e.metaKey, e.shiftKey, e.ctrlKey, cLastIn, doingDL);
		if (e.ctrlKey && e.shiftKey && e.key === 'I') {
			let txt = $('#scanText').val();
			$('#scanText').val(txt);
			return;
		}

		if (lPauseKeys && e.which == 123) {
			e.preventDefault();
		} else if (e.which===123) {
			e.preventDefault();
			doCoupon("F12");
			return;
		}

		if ($("#scanText").is(":focus")) {
			console.log("#scanText has focus, exiting.")
			return;
		}

		if ($("#custSeek").is(":visible")) {
			custSeekActions(e);
			return;
		}

		if ($("#Modal_itemList").is(":visible") ||
			$("#Modal_custList").is(":visible") ||
			$("#ModalTender").is(":visible") ||
			$('#modalPopItem').is(":visible") ||
			lPauseKeys ) {
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
			focusBarc(e.key);
			//$("#scanText").focus();
			return;

		} else if (e.which === 13) {
			cLastIn = e.which;
			if ($("#posErrorDialog").is(":visible")) {
				$("#posErrorOkBtn").click();
			} else {
				get_item();
			}

		} else if (e.which === 38) {
			let newLine = Math.max(1, currLine-1);
			//console.log("up, currLine =", currLine, "newLine =", newLine);
			paintCurrentLine(newLine);

		} else if (e.which === 40) {
			let newLine = Math.min(dataSet.data.length, currLine+1);
			//console.log("down, currLine =", currLine, "newLine =", newLine);
			paintCurrentLine(newLine);

		} else {
			//console.log( 'nothing...', barcChars.includes(e.key), e.key);
			cLastIn = e.which;
			const scanText = document.getElementById("scanText");
			const evt = new KeyboardEvent('keydown', { charCode: e.which, keyCode: e.which, key: e.key, metaKey: e.metaKey, shiftKey: e.shiftKey, altKey: e.altKey });
			//console.log("evt:", evt);
			scanText.dispatchEvent(evt);

			//$('#scanText').trigger('keypress', e.key);
			//$("#scanText").focus();
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

	// Swipe to close custList
	$('#custListTitleBar').on('swipeup', function (e) {
		closeCustList();
	});

	// Manage formatting of saleTableBody on resize event
	$(window).resize(function (e) {
		saleTableDivSize();
		paintCurrentLine();
		//$('#scanText').focus();
	});

	setSvgVars();
/*
	let Keyboard = window.SimpleKeyboard.default;

	tenderKeyboard = new Keyboard( {
		layout: {
			default: ["1 2 3", "4 5 6", "7 8 9", "0 . 00", "{bksp} {enter}"],
		},
		theme: "hg-theme-default hg-layout-numeric numeric-theme",
		inputPattern: /^-?\d*[.]?\d{0,2}$/,
		physicalKeyboardHighlight: true,
		preventMouseDownDefault: true,
		disableCaretPositioning: true
	});
*/
	$(".hg-button-bksp span").text(dict.backspace[languageVar]);
	$(".hg-button-enter span").html(dict.enter[languageVar]);

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

/* The following block ensures we save the sale data if clerk leaves the document */
	window.onbeforeunload = saveBeforeUnload;

    $( document ).ready(function() {
	    console.log( 'on ready, document height:',$(document).height() );
	});

	$(document).on('hidden.ac.message', function() {
		f5LastRow = null;
		refundLast = null;
	    gBarDiscLast = null;
		messageRemove();
		$("#saleTableBody td").removeClass("groupEm");
	});
	
	$(document).on('shown.ac.message', function() {
		lMsgUp = true;
		console.log( "message shown", lMsgUp );
	});

	currLine = dataSet.data.length;
	paintCurrentLine();	

	console.log( "init currLine =", currLine );

	$("#headerCheckmark").prop("indeterminate", false);
	console.log('check indeterminate:',$("#headerCheckmark").prop("indeterminate"));

	$("#saleTableBody").off('click', "td:nth-child(1)").on('click', "td:nth-child(1)", function(e){
		e.stopPropagation();

		console.log( 'check clicked' );

		setTimeout( function() {
			let lShow  = $("#saleTableBody td:nth-child(1) input:checked").length > 0;
			let lMulti = $("#saleTableBody td:nth-child(1) input:checked").length > 1;

			if (lShow) {
				$(".gFuncBar").css({"display": "block"})
				$("#headerCheckmark").prop("indeterminate", true);
			} else {
				$("#headerCheckmark").prop("indeterminate", false);
				$(".gFuncBar").css({"display": "none"});
		    }

			if (lMulti) { 
				$(".editFunc").css({"display": "none"});
				$(".infoFunc").css({"display": "none"});
			} else {
				$(".editFunc").css({"display": "inline-block"});
				$(".infoFunc").css({"display": "inline-block"});
			}
		}, 0 );
	});

	$("#headerCheckmark").on('change', function(e){
		var isCheck = $("#headerCheckmark").is(':checked');
		var isDunno = $("#headerCheckmark").prop("indeterminate");

		e.stopPropagation();
		
		console.log( 'before timeout, headerCheckmark is:checked =',isCheck, 'indeterminate = ',isDunno );

		setTimeout( function() {
			if (isCheck) {
				console.log("headerCheckmark on change is hiding edit and info");
				$(".editFunc").css({"display": "none"});
				$(".infoFunc").css({"display": "none"});
			} else {
				console.log("headerCheckmark on change is showing edit and info");
				$(".editFunc").css({"display": "inline-block"});
				$(".infoFunc").css({"display": "inline-block"});
			}
		}, 0);
	});

	$("#saleTableHdr th:nth-child(1) input").on('change', function(e){
		var isCheck = $("#headerCheckmark").is(':checked');
		var isDunno = $("#headerCheckmark").prop("indeterminate");
		var nbrChecked = $("#saleTableBody td:nth-child(1) input:checked").length;

		e.stopPropagation();
		
		console.log( 'before timeout, checkbox is:checked =',isCheck, 'indeterminate = ',isDunno, "nbrChecked =", nbrChecked );

		setTimeout( function() {
			if (dataSet.data.length===0 || nbrChecked > 0) {
			    $("#saleTableBody td:nth-child(1) input").prop("checked",false);
				$("#headerCheckmark").prop("checked", false);
				$("#headerCheckmark").prop("indeterminate", false);
				$(".gFuncBar").css({"display": "none"});
			} else if (isCheck) {
			    $("#saleTableBody td:nth-child(1) input").prop("checked",true);
				$(".gFuncBar").css({"display": "block"})
		    } else {
			    $("#saleTableBody td:nth-child(1) input").prop("checked",false);
				$(".gFuncBar").css({"display": "none"});
			}
			if (isCheck || nbrChecked > 1) {
				console.log("table checkmark on change is hiding edit and info");
				$(".editFunc").css({"display": "none"});
				$(".infoFunc").css({"display": "none"});
			} else {
				console.log("table checkmark on change is showing edit and info");
				$(".editFunc").css({"display": "inline-block"});
				$(".infoFunc").css({"display": "inline-block"});
			}
		}, 0);
	});

/*  Removed - causes problems on touch screen, use native tooltips instead
	// JQuery-UI tooltips
	$( function() {
		$( document ).tooltip({
		  position: {
			my: "center bottom+30",
			at: "center bottom",
			using: function( position, feedback ) {
			  $( this ).css( position );
			  $( "<div>" )
				.addClass( feedback.vertical )
				.addClass( feedback.horizontal )
				.appendTo( this );
			}
		  }
		});
	});
*/

/* BEGIN gFuncBar Button Actions */
	$(".trashFunc").on("click", function() {
		var aRows = [];
		$("#saleTableBody td:nth-child(1) input:checked").each( function(idx,val) {
			aRows.push( $(this).closest('tr').index() + 1 );
		});

		console.log( "Deleting rows:",aRows );

		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#saleTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");

		saleDeleteRow( aRows );
	});

	$(".refundFunc").on("click", function() {
		var aRows = [];
		$("#saleTableBody td:nth-child(1) input:checked").each( function(idx,val) {
			aRows.push( $(this).closest('tr').index() + 1 );
		});

		console.log( "Returning rows:",aRows.join() );
		console.log( "now aRows =", aRows );

		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#saleTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");

		itemReturn( aRows );

	});

	$(".discFunc").on("click", function() {
		var aRows = [];
		$("#saleTableBody td:nth-child(1) input:checked").each( function(idx,val) {
			aRows.push( $(this).closest('tr').index() + 1 );
		});

		console.log( "Discounting rows:",aRows.join() );
		console.log( "now aRows =", aRows );

		gBarDisc( aRows );

	});

	$(".editFunc").on("click", function() {
		var nRow = $("#saleTableBody td:nth-child(1) input:checked").first().closest('tr').index() + 1;

		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#saleTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");

		currLine = nRow;
		paintCurrentLine();
		F6Edit(nRow);
	});

	$(".infoFunc").on("click", function() {
		var nRow = $("#saleTableBody td:nth-child(1) input:checked").first().closest('tr').index() + 1;

		$("#headerCheckmark").prop("checked", false);
		$("#headerCheckmark").prop("indeterminate", false);		
		$("#saleTableBody td:nth-child(1) input").prop("checked",false);
		$(".gFuncBar").css("display","none");

		currLine = nRow;
		paintCurrentLine();
		showPopItem();
	});

	setgBarTitles();
    /* END gFuncBar Button Actions */

	//----- set mousedown to close side menu
	$('#saleTableBody, #scanText, #totalTableDiv, #customerDiv, #cashSale').on("mousedown", function() {
		    if ($('#mySidenav').attr('viewMe')==='true') closeNav();
	    }
	);

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
	window.addEventListener("focus", function(event) {
		if ($("#ModalTenderContent").is(":visible")) {
			//$("#tenderInput").focus();
		} else {
			focusBarc();
		}
	}, false);

	saleTableDivSize();
	saleTableLoadData();

	$(".gFuncBar").css({"display": "block"});
	$(".gFuncBar").css({"display": "none"});

	setTimeout(function() {
		$("#scanText").val("");
		focusBarc();
	}, 25);

} // end of init function
///////////////////////////////////////////////////////////////////////////////////////////////

function morepSetActions() {
	setFunctionButtons();  // in ePosSet.js

	getTaxInfo();  // in ePosSet.js

	setLanguage(pSet.salesScreenLanguage);

	if (Object.keys(customer.custData).length > 0) {
		let cusText = "Nbr: " + customer.custData.custnum + "<br>" +
			titleCase(customer.custData.name) + "<br>";

		if (customer.custData.address.length > 0) { cusText += customer.custData.address + '<br>' };

		if (customer.custData.citySt.indexOf(',') > -1) {
			cusText += titleCase(customer.custData.citySt.substr(0, customer.custData.citySt.indexOf(',')));
			cusText += customer.custData.citySt.substr(customer.custData.citySt.indexOf(','));
		} else {
			cusText += customer.custData.citySt
		}

		cusText += " " + customer.custData.zip + '<br>' + customer.custData.phone;
		
		if (pSet.doChecksOK && customer.custData.checks === 'N') {
			cusText += "<span id='checksOK'>" + dict.noChecks[languageVar] + "</span>";
		} else if (pSet.doChecksOK) {
			cusText += "<span id='checksOK'>" + dict.checksOK[languageVar] + "</span>";
		};

		$("#customerDiv").append(cusText);

		//$("#saleTableDiv").css( { "top": saleDivTop2, "height": "58%" } );  // "calc( 12.5% + 105px )", "height": "43%" } );
		saleTableDivSize({ "top": saleDivTop2, "height": "58%" });
		$('.gFuncBar').css('top', gBarTop2);
		$("#cashSale").toggle(false);
		$("#customerDiv").toggle(true);
		$("#custHistBttn").prop("disabled", false);
	} else {
		$("#custHistBttn").prop("disabled", true);
	};

	startTime();  // do after pSet load to have legalAge setting

	if (!pSet.doLegalAge) {
		$("#legalDate").hide();
	}

	$("#qLine1 span.funcLeft:eq(0)").prepend(pSet.qDisc1.toFixed(2));
	$("#qLine2 span.funcLeft:eq(0)").prepend(pSet.qDisc2.toFixed(2));
	$("#qAll1 span.funcLeft:eq(0)").prepend(pSet.qDiscAll1.toFixed(2));
	$("#qAll2 span.funcLeft:eq(0)").prepend(pSet.qDiscAll2.toFixed(2));

	// if dual-pricing is active, remove total table, otherwise remove cash total table
	if (pSet.doDualPricing) {
		$("#totalTableDiv").remove();
		$("#cashTotalPrompt").show();
		$("#cashTotalAmount").show();
	}
	else {
		$("#cashTotalTableDiv").remove();
		$("#cashTotalPrompt").hide();
		$("#cashTotalAmount").hide();
	}

	if (pSet.customMiscSaleDo) {
		shortcut.add("ALT+"+pSet.customMiscSaleKey, function() { miscSale('C'); } );
	}
	
	paintCurrentLine();
	updateTotalBox();

	setTenderButtons();
	drawerCheck();

}

function setTenderButtons() {
	let nBttns = 2; // always show cash and card

	// show/hide tender buttons based on settings, count how many for sizing
	if (pSet.acceptChecks) {
		nBttns++;
		$("#checkButton").show();
	} else {
		$("#checkButton").hide();
	}
	if (pSet.doHouseChg && !isEmpty(customer.custData)) {
		nBttns++;
		$("#houseButton").show();
	} else {
		$("#houseButton").hide();
	}
	if (pSet.tenderType5.trim().length !== 0) {
		nBttns++;
		$("#type5Button").text(pSet.tenderType5);
		$("#type5Button").show();
	} else {
		$("#type5Button").hide();
	}
	if (pSet.tenderType6.trim().length !== 0) {
		nBttns++;
		$("#type6Button").text(pSet.tenderType6);
		$("#type6Button").show();
	} else {
		$("#type6Button").hide();
	}
	if (pSet.tenderType7.trim().length !== 0) {
		nBttns++;
		$("#type7Button").text(pSet.tenderType7);
		$("#type7Button").show();
	} else {
		$("#type7Button").hide();
	}
	if (pSet.tenderType8.trim().length !== 0) {
		nBttns++;
		$("#type8Button").text(pSet.tenderType8);
		$("#type8Button").show();
	} else {
		$("#type8Button").hide();
	}
	if (pSet.giftCertDo) {
		nBttns++;
		$("#giftButton").show();
	} else {
		$("#giftButton").hide();
	}
	if (pSet.tenderForeign) {
		nBttns++;
		if (pSet.tenderForeignLabel.trim().length !== 0) {
			$("#foreignButton").text(pSet.tenderForeignLabel);
		} else {
			$("#foreignButton").text(dict.Foreign[languageVar]);
		}
		$("#foreignButton").show();
	} else {
		$("#foreignButton").hide();
	}

	// set dialog size to fit buttons
	if (nBttns < 4) {
		$("#ModalTenderContent").css({"width": "810px"});
		$("#tenderTypes").css({"min-width": "365px", "max-width": "365px", "height": "460px"});
	} else if (nBttns < 7) {
		$("#ModalTenderContent").css({"width": "810px"});
		$("#tenderTypes").css({"min-width": "365px", "max-width": "365px", "height": "502px"});
	} else if (nBttns < 9) {
		$("#ModalTenderContent").css({"width": "920px"});
		$("#tenderTypes").css({"min-width": "475px", "max-width": "475px", "height": "502px"});
	} else {
		$("#ModalTenderContent").css({"height": "620px"});
		$("#tenderTypes").css({"min-width": "475px", "max-width": "475px", "height": "565px"});
	}
}

function drawerCheck() {
console.log( "drawerCheck, drawer:", drawer, "type:", typeof drawer, "length:", drawer.length );
	if (drawer.length === 0) {
		// need to get drawer nbr
		showDrawerNbrGet();
	}

	$.post("drawerCheck?", {drawer: drawer}, function(reply) {
		let txt = "Drawer #" + drawer + " | " + "v" + getVersionNumber();
		$("#versionDiv").text(txt);

		if (reply.result === "OPEN") {
			focusBarc();
		} else if (reply.result === "NEW") {
			drawerInitShow();
		} else {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' +
						"An error occurred opening the drawer file", // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe',       // Overwrites defaultOptions
				afterOpen: function() {
					lPauseKeys = true; 
					playBuzzer();
					$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
				},
				afterClose: function() {logOut();}
			});
		}
	})
	.fail( function() {
		vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' +
						"An error occurred opening the drawer file", // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe',       // Overwrites defaultOptions
				afterOpen: function() {
					lPauseKeys = true; 
					playBuzzer();
					$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
				},
				afterClose: function() {logOut();}
		});
	});
}

function drawerInitShow() {
	document.getElementById('drawerInitAmount').addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {
			$('#drawerInitOK').click();
		}
		if ((e.key < '0' || e.key > '9') && e.key !== '.') {
			e.preventDefault(); // Prevents the character from being added to the input
		}
	});

	$("#drawerInitAmount").val("");
	$("#drawerInit").show();
	lPauseKeys = true; 
	pauseBodyKeypress();

	setTimeout(function() {
		$("#drawerInitAmount").focus();
	}, 25);
}

function drawerInitCancel() {
	$("#drawerInit").hide();
	lPauseKeys = false; 
	resetBodyKeypress();
}

function drawerInit() {
	let amount = $("#drawerInitAmount").val();

	$.post("drawerInit?", {drawer: drawer, amount: amount}, function(reply) {
		if (reply.result !== 'success') {
			resetBodyKeypress();
			$("#drawerInit").hide();

			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' + 
						"An error occurred initializing the drawer file", // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe',       // Overwrites defaultOptions
				afterOpen: function() {
					lPauseKeys = true; 
					playBuzzer();
					$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
			},
			afterClose: function() {logOut();}
		    });
		}
	})
	.always( function() {
		resetBodyKeypress();
		$("#drawerInit").hide();
	});
}

function showDrawerNbrGet() {
	const modal = document.getElementById('drawerNbrGet');
   let nn = new AutoNumeric("#drawerNbrGetInput", { decimalPlaces: 0, maximumValue: '99999', minimumValue: '1', digitGroupSeparator: '' });
	
	lPauseKeys = true;
	pauseBodyKeypress();
	modal.showModal();

	$("#drawerNbrGetInput").off('keypress').on('keypress', function (e) {
		if (e.key === 'Enter') {
			$('#drawerNbrGetOK').click();
		}
		if ((e.key < '0' || e.key > '9') && e.key !== '.') {
			e.preventDefault(); // Prevents the character from being added to the input
		}
	});

	setTimeout(function() {
		$("#drawerNbrGetInput").focus();
	}, 25);
}

function drawerNbrSubmit() {
	const modal = document.getElementById('drawerNbrGet');
	let an = AutoNumeric.getAutoNumericElement("#drawerNbrGetInput");
	drawer = $("#drawerNbrGetInput").val().trim();

	an.remove();
	
	console.log("Drawer number submitted:", drawer, "typeof:", typeof drawer);
	// save to localStorage
	localStorage.setItem('drawer', drawer);

	modal.close();
	lPauseKeys = false;
	resetBodyKeypress();

	//---- now check if a drawer file is open
	drawerCheck();
}

function logOut() {
	let from = localStorage.getItem('cameFrom');
	localStorage.setItem('cameFrom', '');

	if (pSet.loginAsTimeClock) {
		$.post("submitTimeClock", {"inOut": "O", "userID": oldID});
	}

	if (from === 'dash') {
		setTimeout( function() {
			window.location.replace("split.html");
		}, 20 );
		return;
	}

	//---- don't reset if going back to backoffice (might be multitasking)
	localStorage.setItem('drawer','');

	$.post( "logOut('POS')", function(reply) {
		window.onbeforeunload = null;
		$('body').html( reply );
		setTimeout( function() {
			window.location.replace("posLogin.html");
		}, 2000 )
	});
}

function scannerRead(e) {
	var cLastIn = 0;
	var doingDL = false;
	var c2DDL = '';
	const barcChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ #.`*+]'-\\";

			//console.log('keydown:',e.which, e.key, e.metaKey, e.shiftKey, cLastIn, doingDL);
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

function saveBeforeUnload(){
	setTimeout( writeDataVars, 0 );
	return "Goodbye.";
}

function writeDataVars() {
	localStorage.setItem('dataSet', JSON.stringify(dataSet));
	localStorage.setItem('customer', JSON.stringify(customer));
	localStorage.setItem('taxExempt', JSON.stringify(taxExempt));
}

/**
 * Load all data into saleTable or emptyRow if no data.
 */
function saleTableLoadData() {
	console.log('** saleTableLoadData **');

	$("#saleTableBody").empty();

	// reset header for no scrollbar (in case coming in from a void)
	$("#saleTableHdr tr").css({"padding-right": "0px"});

	if (dataSet.data.length===0) {
		var nWide     =  $("#saleTableHdr tr").width();
		var emptyHTML = '<tr class="noDataRow" id="emptyRow"><td colspan="9" style="width: ' + 
						nWide + 'px">'+ dict.emptyText[languageVar]+'</td></tr>'
		$("#saleTableBody").html(emptyHTML);
		$("#saleTableHdrRow th:eq(0)").children().css("display", "none");
		$("#payDiv").css("display", "none");
		$(qKeys).prop("disabled", true);
		console.log("qKeys disabled");
		return;
	}

	$("#saleTableHdrRow th:eq(0)").children().css("display", "block");
	$("#payDiv").css("display", "block");

	$.each( dataSet.data, function(idx,item) {
		saleTableInsertRow(item);
	});
}

/**
 * Add a row to the saleTable from a prepared item record.
 * @param {Object} item - The item record from dataSet.data.
 */
function saleTableInsertRow( item ) {
	console.log('** saleTableInsertRow **');

	var taxKeys = Object.keys(taxExempt);
   var taxFilter = taxKeys.filter(function(key) {
      return taxExempt[key];
   });

	var rowText = '<tr><td><label class="saleCheckContainer">&nbsp;<input type="checkbox"><span class="saleCheckmark"></span></label></td>';
	var nPrice = item.price.toFixed(2);
	var nTotal = item.total.toFixed(2);
	var xDisc  = (item.disc==null || item.disc === 0) ? '' : item.disc.toFixed(2);
	var xPromo = (item.promo===null || item.promo==='false') ? '' : item.promo;
	var nDepo  = (typeof item.depo !== 'number' || item.depo === 0) ? '' : (item.depo>=10) ? item.depo.toFixed(2) : item.depo.toFixed(3);
	var cTax   = (isKeyEmpty(item,'tax') || item.tax===null || item.tax === 0 || item.tax.trim() === '') ? 'T' : item.tax;
	cTax       = (taxFilter.length > 0) ? 'E' : cTax;

    if (item.disc !== null) {
		var nDiscX = ( 100 - item.disc ) / 100;
		nPrice = ( nDiscX * item.price ).toFixed(2);
	}

	rowText += '<td>' + item.rowId + '</td>';
	rowText += '<td>' + item.item + '</td>';
	rowText += '<td>' + item.pack + '</td>';
	rowText += '<td>' + item.qty + '</td>';
	rowText += '<td>' + xDisc + '</td>';
	rowText += '<td>' + nPrice + '</td>';
	rowText += '<td>' + nTotal + '</td>';
	rowText += '<td>' + cTax + '</td>';
	rowText += '<td>' + nDepo + '</td>';
	rowText += '<td>' + xPromo + '</td></tr>';

	console.log("Nbr of rows:",$("#saleTableBody tr").length,"Nbr of cells:",$("#saleTableBody td").length);

	if ($("#saleTableBody tr").length===1 && $("#saleTableBody td").length===1) {
		$("#saleTableBody").empty();
		$("#saleTableHdrRow th:eq(0)").children().css("display", "block");
		$("#payDiv").css("display", "block");
	}

	$("#saleTableBody").append( rowText );

	if (item.qty < 0) {
		$("#saleTableBody tr").last().find("td").addClass("refunded");
	}

	if ($("#saleTableBody").overflownY()) {
		$("#saleTableHdr tr").css({"padding-right": "17px"});
	} else {
		$("#saleTableHdr tr").css({"padding-right": "0px"});
	}

	$(qKeys).prop("disabled", false);
	console.log("qKeys enabled");
}

function saleDeleteRow(xRow) {
	secureCheck( "ZWSF5", "saleTableDeleteRow", xRow );
}

/**
 * Delete a row or rows from the saleTable.
 * @param xRow - Either a number indicating row or an array of row numbers.
 */
function saleTableDeleteRow(xRow) {
	console.log("Deleting rows:", xRow, "typeOf:", typeof xRow);
	let aR;
	let over = $("#securityOverrideOK").attr("data-overUID");
	let len;
	let f5html;

	if (over==="" || over===undefined) {
		over = uid
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	f5LastRow = []; // reset undo array

	if (typeof xRow === 'number') {
		aR = [xRow];
	} else if (typeof xRow === 'string') {
		aR = xRow.split(",").map(Number);
	} else {
		aR = xRow
	}

	if (aR.length > 1) {
		aR.sort((a, b) => b - a);  // sort to descending order so we delete from bottom -> up
	}

	console.log( "delete aR = ", aR );

	$.each( aR, function(idx,nR) {
		var rowData = dataSet.data[nR-1];
		var coupon = false;

		//---- check for a related coupon entry...
		if (nR < dataSet.data.length && 
			(dataSet.data[nR].barcode === rowData.barcode && 
				dataSet.data[nR].codenum.trim() === "CPN" && 
				aR.indexOf(nR+1) === -1)) {
					coupon = true;
		}

		//----- delete the coupon row first
		if (coupon) {
			var coupData = dataSet.data[nR];

			dataSet.data.splice(nR, 1);
			$("#saleTableBody tr:nth-child(" + (nR + 1) + ")").remove();

			$.post("salesLineDelete?", {
				codenum: coupData.codenum, barc: coupData.barcode, qty: coupData.qty,
				price: coupData.price, uid: over, register: drawer, brand: coupData.brand
			});
		}
		
		//----- now delete product row
		dataSet.data.splice(nR-1, 1);
		
		$("#saleTableBody tr:nth-child(" + nR + ")").remove();

		$.post("salesLineDelete?", {
			codenum: rowData.codenum, barc: rowData.barcode, qty: rowData.qty,
			price: rowData.price, uid: over, register: drawer, brand: rowData.brand, descrip: rowData.descrip
		});
		
		f5LastRow.push( rowData );
		if (coupon)	f5LastRow.push( coupData );  // push coupon after product to preserve order on undo
		
	});

	if ($("#saleTableBody tr").length > 0) {
		saleTableRenumberData();
	} else {
		localStorage.setItem('dataSet', JSON.stringify(dataSet));
		saleTableLoadData();
	}


	if ($("#saleTableBody").overflownY()) {
		$("#saleTableHdr tr").css({"padding-right": "17px"});
	} else {
		$("#saleTableHdr tr").css({"padding-right": "0px"});
	}

	paintCurrentLine();
	updateTotalBox('delete');	

	console.log("f5LastRow:",f5LastRow, "len:", f5LastRow.length);

	if (f5LastRow.length===1) {
		f5html = '<span class="messageText">' + dict.Line[languageVar] + " " + aR[0] + " " + dict.delUndoSingle[languageVar] + ".</span>" + 
		             '<a role="button" href="#" onclick="f5UndoLast();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
	} else {
		len = f5LastRow.length;
		f5html = '<span class="messageText">' + len + " " + dict.delUndoMulti[languageVar] + ".</span>" + 
		             '<a role="button" href="#" onclick="f5UndoLast();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
	}

	$(document).message({content: f5html, html: true, expire: 8000});

}

/**
 * Update a row or rows in the saleTable.
 * @param xRow - Either a row number or an array of row numbers.
 */
function saleTableUpdateRow(xRow) {
	console.log('** saleTableUpdateRow **');
	var aR;

	if (typeof xRow === 'number') {
		aR = [xRow];
	} else if (typeof xRow === 'string') {
		aR = [Number(xRow)];
	} else {
		aR = xRow.slice(0);
	}

	var taxKeys = Object.keys(taxExempt);
    var taxFilter = taxKeys.filter(function(key) {
        return taxExempt[key];
    });

	console.log( "update aR = ", aR );

	$.each( aR, function(idx,nR) {
		var item   = dataSet.data[nR-1];
		var xDisc  = (typeof item.disc !== 'number' || item.disc === 0) ? '' : item.disc.toFixed(2);
		var nTotal = item.total.toFixed(2);
		var nPrice = item.price.toFixed(2);
		var nDepo  = (typeof item.depo !== 'number' || item.depo === 0) ? '' : (item.depo>=10) ? item.depo.toFixed(2) : item.depo.toFixed(3);
		var cTax   = (item.tax==null || item.tax === 0) ? 'T' : item.tax;
		cTax       = (taxFilter.length > 0) ? 'E' : cTax;
		
		var nDiscX = ( 100 - item.disc ) / 100;
		nPrice = ( nDiscX * item.price ).toFixed(2);
	
		$("#saleTableBody tr:nth-child(" + nR + ") td:nth-child(4)").html(item.pack);
		$("#saleTableBody tr:nth-child(" + nR + ") td:nth-child(5)").html(item.qty);
		$("#saleTableBody tr:nth-child(" + nR + ") td:nth-child(6)").html(xDisc);
		$("#saleTableBody tr:nth-child(" + nR + ") td:nth-child(7)").html(nPrice);
		$("#saleTableBody tr:nth-child(" + nR + ") td:nth-child(8)").html(nTotal);
		$("#saleTableBody tr:nth-child(" + nR + ") td:nth-child(9)").html(cTax);
		$("#saleTableBody tr:nth-child(" + nR + ") td:nth-child(10)").html(nDepo);

		if (item.qty < 0) {
			$("#saleTableBody tr:nth-child(" + nR + ") td").addClass("refunded");
		} else {
			$("#saleTableBody tr:nth-child(" + nR + ") td").removeClass("refunded");
		}
	});
}

function saleTableRenumberData() {
	$.each(dataSet.data, function( idx, value ) {
		dataSet.data[idx].rowId = (idx + 1).toString() + '.';
	});

	localStorage.setItem('dataSet', JSON.stringify(dataSet));

	$.each( dataSet.data, function(idx,item) {
		$("#saleTableBody tr:nth-child(" + (idx+1) + ") td:nth-child(2)").html(item.rowId);
	});
}
	
function get_item( cStr, fromPickPack = false ) {
	if (!cStr) cStr = $("#scanText").val().toUpperCase();

	console.log( "get_item:", cStr );

	closeNav();

	if (lMsgUp) messageRemove();

	cStr = cStr.replace(/\s+$/, '')
	if ( cStr === "" ) {
		return;
	} else {
		$("#scanText").val('');
	}

	if (cStr.charCodeAt(0)===64 && cStr.charCodeAt(1)===40 && cStr.charCodeAt(2)===120) {
		alert('DL detected:\n'+ cStr);
		return;
	}

	$("#barcGo").disabled=true;
	
	//---- receipt barcode scanned
	if (cStr.startsWith("ZQR")) {
		findReceipt(cStr);
		return;
	}

	switch (cStr) {
		case "RET":
		case "RF":
			secureCheck("ZWSRF", "itemReturnDialog");
			return;

		case "R":
			secureCheck("ZWSR_", "showReprintReceipt");
			return;

		case "M":
			secureCheck("ZWSM1", "miscSale", 'M');
			return;

		case "B":
			secureCheck("ZWSM2", "miscSale", 'B');
			return;

		case "K":
			secureCheck("ZWSM5", "miscSale", 'K');
			return;

		case "S":
			secureCheck("ZWSM4", "miscSale", 'S');
			return;

		case "V":
			secureCheck("ZWSM3", "miscSale", 'V');
			return;

		case "Q":
		case "W":
		case "A":
		case "Z":
			secureCheck("ZWSQD", "discQwikKey", cStr);
			return;

		case "C":
		case "CD":
			secureCheck("ZWSC_", "openCashDrawer");
			return;

		case "L":
			secureCheck("", "doLotto");
			return;

		case "D":
			secureCheck("ZWSD_", "doDeposit");
			return;

		case "E":
			secureCheck("ZWSE_", "doExpense");
			return;

		case "P":
			secureCheck("", "doPayment");
			return;

		case "TX":
			secureCheck("ZWSTX", "makeExempt");
			return;

		case "SN":
			secureCheck("", "saleNote");
			return;

		case "N":
			doCoupon("N");
			return;

		case "CC":
			secureCheck("ZWSCC", "doCashChk");
			return;

		case "PT":
			secureCheck("ZWSPT", "doPending");
			return;

		case 'T':
		case 'TT':
			doFerLine(cStr);
			return;

		case 'TIP':
			doTip();
			return;

		case 'EMP':
			showTimeClock();
			return;

		case 'GC':
			secureCheck("", "showGiftCard");
			return;

		case (cStr.match(/^ZQC/) || cStr.match(/^%ZQC/) || {}).input:
			var nPos = cStr.indexOf("ZQC") + 3;
			var cNum = cStr.substring(nPos).trim();
			var cust = custListData.data.find(x => x.custnum.trim() === cNum);
			if (!cust) {
				vex.dialog.alert({
					unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' +
						"Customer Nbr " + cNum + " not found.",    // unsafeMessage option allows html in text
					className: 'vex-theme-wireframe',       // Overwrites defaultOptions
					afterOpen: function () {
						lPauseKeys = true;
						playBuzzer();
						$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
					},
					afterClose: function () { lPauseKeys = false; }
				});
				return;
			}
			//console.log("find:", cust);
			custListPick(cust);
			playMagic();
			return;
	}

	//-- 2fer, 3fer
	if ((cStr.length > 3 && cStr.substring(0,2)==='TX') || cStr.substring(0,3)==='TTX') {
		$.post( "posDoFer?", {barcode: cStr}, function(reply) {
			var item = reply;
			var qty = 1;
	
			if (item.brand.indexOf('not found') > -1) {
				var s = "<span class='messageText'>Barcode: " + item.barcode + " - " + item.brand + "</span><span class='messageClose' onclick='messageRemove();'>&times;</span>";
				$(document).message({ content: s, html: true, expire: 8000 });
			} else {
				qty = Number( item.qty );
				saleItemAdd( item, qty );
			} 
		})
		// Code to run if the request fails; the raw request and
		// status codes are passed to the function
		.fail(function( xhr, status, errorThrown ) {
			if ( xhr.responseText.includes('<p>') || xhr.responseText.includes('<br>') ) {
				var s= dict.scanError[languageVar] + "</br><br>" + xhr.responseText
				vex.dialog.alert({
					unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' + s,
					className: 'vex-theme-wireframe',
					afterOpen: function () {
						lPauseKeys = true;
						playBuzzer();
					},
					afterClose: function () {
						lPauseKeys = false;
					}
				});
			} else {
				var s= dict.scanError[languageVar] + " - " + xhr.responseText
				$(document).message({ content: s, html: true, expire: 8000 });
			}
		});
		$("#barcGo").disabled=false;

		if (!isMobile) {
			//$('#scanText').focus();
		} else {
			//$('#scanText').attr('readonly','readonly');
		}
		return;
	}
	
	$.post( "posGetItem?", { cBarcode: cStr, custnum: customer.custData.custnum, fromPickPack: fromPickPack }, function (item, status, xhr) {
		var qty = 1;

		if (item.brand.indexOf('not found') > -1) {
			if (pSet.lockScreenNotFound) {
				showNotFoundDialog(item);
			} else {
				var s = "<span class='messageText'>Barcode: " + item.barcode + " - " + item.brand + "</span><span class='messageClose' onclick='messageRemove();'>&times;</span>";
				$(document).message({ content: s, html: true, expire: 8000 });
			}
		} else if (pSet.pickPackDoOnF3 && item.packArr && item.packArr.length > 0) {
			pickPack(item);
			return;
	   } else {
			qty = Number( item.qty );
			saleItemAdd( item, qty );
		} 
	})
    // Code to run if the request fails; the raw request and
    // status codes are passed to the function
    .fail(function( xhr, status, errorThrown ) {
		if ( xhr.responseText.includes('<p>') || xhr.responseText.includes('<br>') ) {
			var s= dict.scanError[languageVar] + "</br><br>" + xhr.responseText
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' + s,
				className: 'vex-theme-wireframe',
				afterOpen: function () {
					lPauseKeys = true;
					playBuzzer();
				},
				afterClose: function () {
					lPauseKeys = false;
				}
			})
		} else {
			var s= dict.scanError[languageVar] + " - " + xhr.responseText
			$(document).message({ content: s, html: true, expire: 8000 });
		}
		return;
    });

    $("#barcGo").disabled=false;

	if (!isMobile) {
		//$('#scanText').focus();
	} else {
		//$('#scanText').attr('readonly','readonly');
	}

} // end of get_item

function openCashDrawer() {
	if (pSet.noSaleLog) {
		reason = noSaleLogSelect();
	} else {
		$.post("openCashDrawer?", {"user": uid, "reason": ""});	
	}
}

function noSaleLogSelect() {
	let newArray = new Array(5).fill('');
	$.each( pSet.noSaleReasons, function( idx, value ) {
		newArray[idx] = value;
	});

	vex.dialog.open({
		input: [
			'<h3>' + dict.noSaleLog[languageVar] + '</h3>',
			'<div class="vex-custom-field-wrapper">',
			'<div class="noSaleLogSelect">',
			'<select id="noSaleLogSelect" name="noSaleLogSelect" size="5">',
			'<option value="' + newArray[0] + '" selected>' + newArray[0] + '</option>',
			'<option value="' + newArray[1] + '">' + newArray[1] + '</option>',
			'<option value="' + newArray[2] + '">' + newArray[2] + '</option>',
			'<option value="' + newArray[3] + '">' + newArray[3] + '</option>',
			'<option value="' + newArray[4] + '">' + newArray[4] + '</option>',
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
			lPauseKeys = true;
			shortcut.remove('esc');
			console.log("noSaleLogSelect afterOpen, lPauseKeys:", lPauseKeys);
			pauseBodyKeypress();
			$("body").on('keyup', function (e) {
				if ($("#noSaleLogSelect").is(":visible")) {
					let idx = $("#noSaleLogSelect").prop('selectedIndex');
					switch (e.which) {
						case 38: // up
							idx = (idx <= 0) ? 4 : idx - 1;
							$("#noSaleLogSelect").prop('selectedIndex', idx);
							break;

						case 40: // down
							idx = (idx >= 4) ? 0 : idx + 1;
							$("#noSaleLogSelect").prop('selectedIndex', idx);
							break;

						case 32: // spacebar
							$(".vex-dialog-button.vex-dialog-button-primary").click();
							break;

						default: return; // exit this handler for other keys
					}
					e.preventDefault(); // prevent the default action (scroll / move caret)
				}
			});

			$('#noSaleLogSelect').focus();
		},
		callback: function (data) {
			if (!data) {
				lPauseKeys = false;
				shortcut.add('esc', function () { escKeyFunc(); });
				resetBodyKeypress();
				return;
			}
			console.log("noSaleLog.data: ", data);
			let reason = data.noSaleLogSelect;
			if (reason === "Cash Drop") {
				showCashDrop();
			} else {
				$.post("openCashDrawer?", {"uid": uid, "drawer": drawer, "reason": data.noSaleLogSelect});	
				lPauseKeys = false;
				shortcut.add('esc', function () { escKeyFunc(); });
				resetBodyKeypress();
			}
		}
	})
}

function saleItemAdd( item, nQty ) {
	console.log( '** saleItemAdd **' );
	var lMatch = false;
	var itemText = item.brand.trim() + ( item.descrip.trim().length === 0 ? '' : ' ' ) + item.descrip.trim() + ( item.size.trim().length === 0 ? '' : ' ' ) + item.size.trim();
	var lineData = {
		"rowId": (dataSet.data.length + 1).toString() + '.',
		"brand": item.brand,
		"descrip": item.descrip,
		"size": item.size,
		"item": itemText,
		"pack": Number(item.pack),
		"qty": nQty,
		"disc": (item.disc) ? Number(item.disc) : null,
		"price": Number(item.price),
		"promo": (!item.promo || item.promo == 'false') ? null : '<span class="salesPromoSpan" title="On Sale">&#36;</span>',
		"total": nQty * Number(item.price),
		"barcode": item.barcode,
		"codenum": item.codenum,
		"type": item.type,
		"tax": item.tax,
		"depo": nQty * Number(item.pack) * Number(item.depo),
		"caseQty": item.caseQty,
		"pool": item.pool,
		"discBy": ''
	};

	if (typeof lineData.disc == 'number' && lineData.disc != 0) {
		var nDisc = 1 - lineData.disc/100;
		lineData.total = lineData.qty * Number(lineData.price) * nDisc;
	}

	$('td').each( function () {
		$(this).css('background-color', '');
	} );

	//----- group same barcodes
	if (item.barcode.length > 1 || !'M B K S V'.includes(item.barcode)) {  // skip one letter barcodes (misc sale)
		for (i = 0; i < dataSet.data.length; i++) {
			if (dataSet.data[i].barcode === item.barcode && dataSet.data[i].pack === Number(item.pack)) {
				var nDiscX = ((100 - Number(dataSet.data[i].disc)) / 100);
				dataSet.data[i].qty = nQty + dataSet.data[i].qty;
				dataSet.data[i].total = Number((nDiscX * (dataSet.data[i].qty * dataSet.data[i].price)).toFixed(2));

				localStorage.setItem('dataSet', JSON.stringify(dataSet));

				saleTableUpdateRow( i+1 );

				chtml = '<span class="messageText">' + dict.groupEm[languageVar] + ' ' + (i+1) + '. </span><span class="messageClose" onclick="messageRemove();">&times;</span>';
 			    $(document).message({ content: chtml, html: true, expire: 3000 });
		
				$("#saleTableBody tr:nth-child(" + (i+1) + ") td:nth-child(5)").addClass( "groupEm");

				lMatch = true;
				break;
			}
		}
	}

	if (!lMatch) {
		dataSet.data.push(lineData);
		localStorage.setItem('dataSet', JSON.stringify(dataSet));
		
		saleTableInsertRow( lineData );
		
		currLine = dataSet.data.length;
		paintCurrentLine();
	}

	let up = itemText;
	let dn = nQty + ' @ ' + Number(item.price).toFixed(2);
	dn = dn.padStart(20, ' ');

	$.post("pDisp?", { "up": up, "dn": dn });

	playBeep();
	updateTotalBox();
	focusBarc();
}

function updateTotalBox(cFrom) {
	$.post( "updateSalesTotalDiv", 
		{ data: JSON.stringify(dataSet.data),
		  taxExempt: JSON.stringify(taxExempt),
		  custnum: customer.custData.custnum
		},
		function(reply) {
			$("#subTotal").text( numberWithCommas( reply.subtotal.toFixed(2) ) ); 
			$("#taxTotal").text( numberWithCommas( reply.tax.toFixed(2) ) ); 
			$("#totalRetn").text( numberWithCommas( reply.returns.toFixed(2) ) );
			$("#totalDepo").text( numberWithCommas( reply.deposit.toFixed(2) ) );
			$("#total").text( numberWithCommas( reply.total.toFixed(2) ) );

			taxDue.tax1	 = reply.tax1;
			taxDue.tax2	 = reply.tax2;
			taxDue.tax3	 = reply.tax3;
			taxDue.flatTax = reply.flatTax;
			taxDue.volTax  = reply.volTax;

			if (pSet.doDualPricing) {
				$("#cashSubTotal").text( numberWithCommas( reply.cashSubTotal.toFixed(2) ) ); 
				$("#cashTaxTotal").text( numberWithCommas( reply.cashTax.toFixed(2) ) ); 
				$("#cashTotalRetn").text( numberWithCommas( reply.returns.toFixed(2) ) );
				$("#cashTotalDepo").text( numberWithCommas( reply.deposit.toFixed(2) ) );
				$("#cashTotal").text( numberWithCommas( reply.cashTotal.toFixed(2) ) );

				cashTaxDue.tax1	 = reply.cashTax1;
				cashTaxDue.tax2	 = reply.cashTax2;
				cashTaxDue.tax3	 = reply.cashTax3;
				cashTaxDue.flatTax = reply.cashFlatTax;
				cashTaxDue.volTax  = reply.cashVolTax;
			}

			// minimum price was enforced on one or more items, so we need to update those rows in the table and then alert the user which rows were affected and why
			if (reply.minPrice) {
				// do stuff here to update rows affected...
				// reply.minPrice : [ [ nRow 1-based, newPrice, newDisc ], ...]
				var aR = [];
				$.each( reply.minPrice, function(idx,item) {
					var index  = item[0] - 1;
					var nDiscX = (100 - item[2]) / 100;
					dataSet.data[index].price = item[1];
					dataSet.data[index].disc  = item[2];
					dataSet.data[index].total = Number((nDiscX * (dataSet.data[index].qty * dataSet.data[index].price)).toFixed(2));
					aR.push(item[0]);
				});
				localStorage.setItem('dataSet', JSON.stringify(dataSet));
				saleTableUpdateRow( aR );
				var cMsg = "<h3>" + dict.minPriceTitle[languageVar] + "</h3>" + dict.saleRow[languageVar];
				(aR.length>1) ? ( cMsg += 's ' ) : ( cMsg += ' ' );
				cMsg += aR.join() + ' ' + dict.minPriceMsg[languageVar];
				vex.dialog.alert({
					unsafeMessage: cMsg,    // unsafeMessage option allows html in text
					className: 'vex-theme-wireframe',       // Overwrites defaultOptions
					afterOpen: function() {
						playBuzzer();
					}
				});
			}

			// limit to cost was enforced on one or more items, so we need to update those rows in the table and then alert the user which rows were affected and why
			if (reply.limit2Cost) {
				// do stuff here to update rows affected...
				// reply.limit2Cost : [ [ nRow 1-based, newPrice, newDisc ], ...]
				var aR = [];
				$.each( reply.limit2Cost, function(idx,item) {
					var index  = item[0] - 1;
					var nDiscX = (100 - item[2]) / 100;
					dataSet.data[index].price = item[1];
					dataSet.data[index].disc  = item[2];
					dataSet.data[index].total = Number((nDiscX * (dataSet.data[index].qty * dataSet.data[index].price)).toFixed(2));
					aR.push(item[0]);
				});
				localStorage.setItem('dataSet', JSON.stringify(dataSet));
				saleTableUpdateRow( aR );
				var cMsg = "<h3>" + dict.limit2CostTitle[languageVar] + "</h3>" + dict.saleRow[languageVar];
				(aR.length>1) ? ( cMsg += 's ' ) : ( cMsg += ' ' );
				cMsg += aR.join() + ' ' + dict.limit2CostMsg[languageVar];
				vex.dialog.alert({
					unsafeMessage: cMsg,    // unsafeMessage option allows html in text
					className: 'vex-theme-wireframe',       // Overwrites defaultOptions
					afterOpen: function() {
						playBuzzer();
					}
				});
			}

			if (reply.discPool && cFrom != 'delete') {
				// do stuff here to update rows affected...
				// reply.discPool : [ [ nRow 1-based, newPrice, newDisc ], ...]
				var aR = [];
				$.each( reply.discPool, function(idx,item) {
					var index  = item[0] - 1;
					var nDiscX = (100 - item[2]) / 100;
					dataSet.data[index].price = item[1];
					dataSet.data[index].disc  = item[2];
					dataSet.data[index].total = Number((nDiscX * (dataSet.data[index].qty * dataSet.data[index].price)).toFixed(2));
					aR.push(item[0]);
				});
				localStorage.setItem('dataSet', JSON.stringify(dataSet));
				saleTableUpdateRow( aR );

				var cMsg = '<span class="messageText">' + dict.discPoolMsg[languageVar];
				(aR.length>1) ? ( cMsg += 's ' ) : ( cMsg += ' ' );
				cMsg += aR.join() + '. </span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: cMsg, html: true, expire: 3000 });
			}

			if (reply.smart2Fer) {
				// do stuff here to update rows affected...
				// reply.smart2Fer : [ [ nRow 1-based, newPrice, newDisc ], ...]
				var aR = [];
				$.each( reply.smart2Fer, function(idx,item) {
					var index  = item[0] - 1;
					if (typeof item[2] === 'string') item[2] = Number(item[2]);
					var nDiscX = (100 - item[2]) / 100;
					if (pSet.twoFerAsDisc) {
						// keep reg price, set discount
						dataSet.data[index].disc  = item[2];
						dataSet.data[index].total = Number((nDiscX * (dataSet.data[index].qty * dataSet.data[index].price)).toFixed(2));
					} else {
						dataSet.data[index].price = item[1];
						dataSet.data[index].total = Number((dataSet.data[index].qty * dataSet.data[index].price).toFixed(2));
					}
					aR.push(item[0]);
				});
				localStorage.setItem('dataSet', JSON.stringify(dataSet));
				saleTableUpdateRow( aR );

				var cMsg = '<span class="messageText">Two-Fer Price Applied to Row';
				(aR.length>1) ? ( cMsg += 's ' ) : ( cMsg += ' ' );
				cMsg += aR.join() + '. </span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: cMsg, html: true, expire: 3000 });
			}

			if (reply.smart3Fer) {
				// do stuff here to update rows affected...
				// reply.smart3Fer : [ [ nRow 1-based, newPrice, newDisc ], ...]
				var aR = [];
				$.each( reply.smart3Fer, function(idx,item) {
					var index  = item[0] - 1;
					if (typeof item[2] === 'string') item[2] = Number(item[2]);
					var nDiscX = (100 - item[2]) / 100;
					if (pSet.twoFerAsDisc) {
						// keep reg price, set discount
						dataSet.data[index].disc  = item[2];
						dataSet.data[index].total = Number((nDiscX * (dataSet.data[index].qty * dataSet.data[index].price)).toFixed(2));
					} else {
						dataSet.data[index].price = item[1];
						dataSet.data[index].total = Number((dataSet.data[index].qty * dataSet.data[index].price).toFixed(2));
					}
					aR.push(item[0]);
				});
				localStorage.setItem('dataSet', JSON.stringify(dataSet));
				saleTableUpdateRow( aR );

				var cMsg = '<span class="messageText">Three-Fer Price Applied to Row';
				(aR.length>1) ? ( cMsg += 's ' ) : ( cMsg += ' ' );
				cMsg += aR.join() + '. </span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: cMsg, html: true, expire: 3000 });
			}

			if (reply.smartCase) {
				// do stuff here to update rows affected...
				// reply.smartCase : [ [ nRow 1-based, newPrice, newDisc ], ...]
				var aR = [];
				$.each( reply.smartCase, function(idx,item) {
					var index  = item[0] - 1;
					if (typeof item[2] === 'string') item[2] = Number(item[2]);
					var nDiscX = (100 - item[2]) / 100;
					if (pSet.twoFerAsDisc) {
						// keep reg price, set discount
						dataSet.data[index].disc  = item[2];
						dataSet.data[index].total = Number((nDiscX * (dataSet.data[index].qty * dataSet.data[index].price)).toFixed(2));
					} else {
						dataSet.data[index].price = item[1];
						dataSet.data[index].total = Number((dataSet.data[index].qty * dataSet.data[index].price).toFixed(2));
					}
					aR.push(item[0]);
				});
				localStorage.setItem('dataSet', JSON.stringify(dataSet));
				saleTableUpdateRow( aR );

				var cMsg = '<span class="messageText">Case Price Applied to Row';
				(aR.length>1) ? ( cMsg += 's ' ) : ( cMsg += ' ' );
				cMsg += aR.join() + '. </span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: cMsg, html: true, expire: 3000 });
			}

			if (cFrom === 'exempt') {
				let aR = range(currLine,1);
				console.log( "aR:", aR);
				saleTableUpdateRow( aR );
			}
		}
	)
}

function doNothing(el) {
    $(document).message({ content: "Option not available.", html: true, expire: 3000 });
}

function clearAll() {
    if ( dataSet.data.length > 0 ) {		
		vex.dialog.confirm({
			unsafeMessage: '<h3>' + dict.f4Title[languageVar] + '</h3><br>'+ dict.f4Prompt[languageVar],
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
			],
			afterOpen: function () {
				lPauseKeys = true;
				shortcut.remove('esc');
			},
			afterClose: function () {
				shortcut.add('esc', function() {escKeyFunc();});
				lPauseKeys = false;
			},
			callback: function (value) {
				if (value) {
					actOnClear();
				}
			}
		} );
	} else {
		actOnClear();
	}
}

function actOnClear(lTenderedSale) {
	var dataArr = [];
	var dataObj;
	var i;
	let itemArray;

	$("scanText").val('');

	//----- clone dataSet.data to delete promo SVG before sending
	for (i = 0; i < dataSet.data.length; i++) { 
		dataObj = cloneObj( dataSet.data[i] );
		delete dataObj.promo;
		dataArr.push(dataObj);
	}

	//---- if we are clearing for a tendered sale, we don't want to send item data to pdVoid, 
	//     we just want to trigger the void process which will handle the rest, so we send an 
	// 	 empty array. For a regular clear (not from tender) we send the item data to pdVoid 
	//     so it can log the void reason against each item.
	if (lTenderedSale) {
		itemArray = [];	
	} else {
		itemArray = dataArr
	};


	$.post("pdVoid?", { items: JSON.stringify(itemArray), uid: uid, drawer: drawer }, function (obj) {
		if (obj.result && obj.result === 'success') {
			dataSet = { "data": [] };
			localStorage.setItem('dataSet', JSON.stringify(dataSet));

			customer = { "custData": {} };
			localStorage.setItem('customer', JSON.stringify(customer));

			localStorage.removeItem("saleNote");

			initials = '';
			zipcode = '';

			$("#customerDiv").html('<span id="customerClose" onclick="closeCustomerDiv();" title="' + dict.removeCust[languageVar] + '">&times;</span>');
			$("#customerDiv").toggle(false);
			$("#cashSale").toggle(true);
			$("#custHistBttn").prop("disabled",true);
			//$("#saleTableDiv").css( { "top": saleDivTop1, "height": "67%" }); // "18%", "height": "52%" } );
			saleTableDivSize( { "top": saleDivTop1, "height": "67%" });
			$('.gFuncBar').css('top', gBarTop1);

			$(qKeys).prop("disabled", true);
			console.log("qKeys disabled");

			//--- reset taxExempt settings
			taxExempt.ex1 = false;
			taxExempt.ex2 = false;
			taxExempt.ex3 = false;
			taxExempt.exFlat = false;
			taxExempt.exVol = false;
			localStorage.setItem('taxExempt', JSON.stringify(taxExempt));

			//clear taxDue
			taxDue.tax1 = 0;
			taxDue.tax2 = 0;
			taxDue.tax3 = 0;
			taxDue.flatTax = 0;
			taxDue.volTax = 0;
			
			saleTableLoadData();
			updateTotalBox();
		} else {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe' // Overwrites defaultOptions
			});
		}
	})
	.fail(function () {
		vex.dialog.alert({
			unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
					svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
			className: 'vex-theme-wireframe' // Overwrites defaultOptions
		});
	})
	.always(function () {
		focusBarc();
	});

}

function showItemList() {
	if ($("#itemListTableDiv").children().length > 0) {
		console.log("list already exists");
		$("#Modal_itemList").show();
		itemListTable.grid.jsGrid("loadData");

		lPauseKeys = true;
		return;
	}

	itemListTable = makeJSGridObject('item');

	lPauseKeys = true;

	f3Header();

	$("#itemListTableDiv .jsgrid-filter-row td").addClass("searchCell");
	$("#itemListTableDiv .jsgrid-filter-row").hide();

	$("#itemListTableDiv .jsgrid-load-panel, #itemListTableDiv .jsgrid-load-shader").css("z-index", "10000");

	$("#itemListTableDiv .jsgrid-header-row th:eq(1)").trigger('click');  // start off with brand sort

}

function closeItemList() {
	$("#Modal_itemList").hide();
	$("#itemListTableDiv").jsGrid("clearFilter")
	$("#barcGo").disabled=false;
	lPauseKeys = false;
	resetBodyKeypress();
	   
   updateTotalBox();
	focusBarc();
}

/**
 * Show customer pick list.
 * @param {string} caller - The function calling customer list.
 * @param {string} dlNbr - The driver license nbr scanned (if from scan).
 * @param {string} bDay - The birthdate scanned (if from scan).
 */
function showCustList(caller, dlNbr, bDay) {
	//	
	if (!caller) caller = 'F8';
	if (!dlNbr) dlNbr = '';
	if (!bDay) bDay = '';
	
	if ( $("#custListTableDiv").children().length > 0 ) {
		console.log( "list already exists");
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
	custListTable.grid.jsGrid("destroy");
	/*
	custListTable.grid.jsGrid("clearFilter");
	custListTable.grid.jsGrid("loadData");
	*/
	lPauseKeys = false;
	resetBodyKeypress();

	$('#scanText').val('');
	focusBarc();
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
			parent = '#Modal_itemList';
			pager = '#itemListPager';
			gridDiv = '#itemListTableDiv';
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
			if (pSet.f3ShowQOH) {
				listFields = [
					// { name: "promo", title: "On Sale", type: "icon", width: 28, filtering: false, sorting: false, itemTemplate: function() {return $('<img src="images/saletag.ico" alt="On Sale">');}, headerTemplate: function() {return $('<img src="images/saletag.ico" alt="On Sale">');} },
					{ name: "barcode", type: "text", width: 75, align: "left", headerTemplate: function() {return dict.f3Barcode[languageVar];} },
					{ name: "brand", type: "text", width: 125, align: "left", headerTemplate: function() {return dict.f3Brand[languageVar];} },
					{ name: "descrip", type: "text", width: 160, align: "left", headerTemplate: function() {return dict.f3Descrip[languageVar];} },
					{ name: "size", type: "text", width: 50, align: "left", headerTemplate: function() {return dict.f3Size[languageVar];} },
					{ name: "type", type: "text", width: 130, align: "left", headerTemplate: function() {return dict.f3Type[languageVar];} },
					{ name: "price", type: "number", width: 60, filtering: false, headerTemplate: function() {return dict.f3Price[languageVar];} },
					{ type: "text", width: 25, align: "center", filtering: false, headerTemplate: function() {return "QoH";} },
					{ name: "code_num", type: "text", visible: false }
				];
			} else {
				listFields = [
					{ name: "barcode", type: "text", width: 75, align: "left", headerTemplate: function() {return dict.f3Barcode[languageVar];} },
					{ name: "brand", type: "text", width: 125, align: "left", headerTemplate: function() {return dict.f3Brand[languageVar];} },
					{ name: "descrip", type: "text", width: 160, align: "left", headerTemplate: function() {return dict.f3Descrip[languageVar];} },
					{ name: "size", type: "text", width: 50, align: "left", headerTemplate: function() {return dict.f3Size[languageVar];} },
					{ name: "type", type: "text", width: 130, align: "left", headerTemplate: function() {return dict.f3Type[languageVar];} },
					{ name: "price", type: "number", width: 60, filtering: false, headerTemplate: function() {return dict.f3Price[languageVar];} },
					{ name: "code_num", type: "text", visible: false }
				];
			}
			if (pSet.f3ShowPromo) {
				listFields.push( { name: "promo", title: "On Sale", type: "text", width: 28, filtering: false, css: "onSaleCell", sorting: false, headerTemplate: function() {return $('<img src="images/saletag.ico" alt="On Sale">');},
					itemTemplate: function(value, item) {
						if (item.promo === true) {
							return $('<img class="onSaleCell" src="images/saletag.ico" alt="On Sale">');
						} else {
							return '';
						} 
					}
				 }
				);
			}
			break;

			case 'customer':
			dataSource = custListData.data;
			parent = '#Modal_custList';
			pager = '#custListPager';
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
	console.log( 'totalPages:', obj.totalPages );

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
		pagerFormat: '{first} {prev} {next} {last}',
		pagePrevText: "<",
		pageNextText: ">",
		pageFirstText: "<<",
		pageLastText: ">>",
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

			$(".jsgrid-pager-page, .jsgrid-pager-nav-button").off('click').on('click', function(){ $(this).find("a").trigger('click')} );

			$(gridDiv + " .searchCell input").attr( 'type', 'search' );
			$(gridDiv + " .searchCell input").off('search').on('search', function(){console.log("change"); if ($(this).val()==="") { $(gridDiv).jsGrid("loadData")}});

			lPauseKeys = true;
			pauseBodyKeypress();
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

			if (pSet.f3ShowQOH && gridDiv === '#itemListTableDiv') {
				let barcs = [];
				$(".jsgrid-table tbody tr td:first-child").each(function() {
					var barc = $(this).text();
					barcs.push(barc);
				});

				$.post("getQoH?", { barcodes: JSON.stringify(barcs) }, function(reply) {
					if (reply.result && reply.result === 'success') {
						if (pSet.f3ShowPromo) {
							$(".jsgrid-table tbody tr td:nth-last-child(2)").each(function(idx) {
								$(this).text(reply.data[idx]);
							});
						} else {
							$(".jsgrid-table tbody tr td:last-child").each(function(idx) {
								$(this).text(reply.data[idx]);
							});
						}
					}
				});
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
				pauseBodyKeypress();
 
		},

		rowClick: function(args) {
			console.log('focused:', $(document.activeElement));

			$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+") td").removeClass("highlighted");
			obj.currLine = args.itemIndex;
			$(gridDiv+" .jsgrid-grid-body tr:eq("+obj.currLine+") td").addClass("highlighted");

			console.log('item:'+args.item);       // data item

			if ($("#Modal_itemList").data("calledFrom") === "notFound") {
				$("#Modal_itemList").data("calledFrom", "");
				$.post("notFound?", { item: JSON.stringify(args.item) }, function(reply) {
					if (reply.result && reply.result === 'success') {
						// Handle success
						chtml = '<span class="messageText">Item code successfully added.</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
						time = 3000;
						$(document).message({ content: chtml, html: true, expire: time });
					}
				});
				return;
			}

			if ($("#Modal_itemList").is(":visible")) {
				if (pSet.negativeQOHWarning && args.item.qoh <= 0) {
					vex.dialog.confirm({
						unsafeMessage: '<h3>Negative QOH</h3><br>This item has negative qty on hand. Proceed?', // unsafeMessage option allows html in text
						className: 'vex-theme-multiButtons',
						buttons: [
							$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
							$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
						],
						afterOpen: function () {
							playBuzzer();
						},
						callback: function (value) {
							if (value) {
								itemListPick( args.item );
								lPauseKeys = false;
								resetBodyKeypress();
							}
						}
					});
				} else {
					itemListPick( args.item );
					lPauseKeys = false;
					resetBodyKeypress();
				}
			} else if ($("#Modal_custList").is(":visible")) {
				console.log( 'custnum picked:', args.item.custnum);
				if (obj.caller === 'reprint') {
					$("#reprintListCustomer").val( args.item.custnum );
					custListPick( args.item, obj.caller, obj.dlNbr, obj.bDay );
					showReprintListFilter(true);
					return;
				}
				custListPick( args.item, obj.caller, obj.dlNbr, obj.bDay );
				obj.caller = '';
				obj.dlNbr  = '';
				obj.bDay   = '';
				lPauseKeys = false;
				resetBodyKeypress();
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
		var nQty = 1;

		item.codenum = item.code_num;  // for compatibilty

		if (pSet.f3QtyPrompt) {
			vex.dialog.open({
				input: [
					'<h3>'+ dict.f3QtyTitle[languageVar] +'</h3>',
					  '<div class="vex-custom-field-wrapper">',
						'<div class="f3QtyPrompt">',
						  dict.f3QtyPrompt[languageVar] + item.brand + ' ' + item.descrip + ' ' + item.size,
						'</div>',
					    '<div class="vex-custom-input-wrapper">',
					      '<label for="f3Qty" class="f7Label">'+ dict.Qty[languageVar] +':</label>',
					      '<input class="vexF7Input" id="f3Qty" name="f3Qty" type="text" value="1" />',
						'</div>',
					  '</div>',
					'</div>'
				].join(''),
				className: 'vex-theme-multiButtons',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
					$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
				],
				afterOpen: function () {
					lPauseKeys = true;
					shortcut.remove('esc');
					new AutoNumeric('#f3Qty', { decimalPlaces: 0 });
				},
				afterClose: function () {
					lPauseKeys = false;
					shortcut.add('esc', function() {escKeyFunc();});
				},
				callback: function (data) {
					if (!data) {
						return;
					}
					nQty = Number( data.f3Qty );
					let an = AutoNumeric.getAutoNumericElement('#f3Qty');
					if (an) {
						an.remove();
					}
					saleItemAdd( item, nQty );
				}
			})
		} else {
			saleItemAdd( item, nQty );
		}
	});
}

function itemListPick( item ) {
	var nQty = 1;

	item.codenum = item.code_num;  // for compatibilty

	if (pSet.pickPackDoOnF3 && item.packArr && item.packArr.length > 0) {
		pickPack( item );
	} else if (pSet.f3QtyPrompt) {
		vex.dialog.open({
			input: [
				'<h3>'+ dict.f3QtyTitle[languageVar] +'</h3>',
				'<div class="vex-custom-field-wrapper">',
				  '<div class="f3QtyPrompt">',
					dict.f3QtyPrompt[languageVar] + item.brand + ' ' + item.descrip + ' ' + item.size,
				  '</div>',
				  '<div class="vex-custom-input-wrapper">',
					'<label for="f3Qty" class="f7Label">'+ dict.Qty[languageVar] +':</label>',
					'<input class="vexF7Input" id="f3Qty" name="f3Qty" type="text" value="1" />',
				  '</div>',
				'</div>',
			  '</div>'
	        ].join(''),
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
			],
			afterOpen: function () {
				lPauseKeys = true;
				shortcut.remove('esc');
				new AutoNumeric('#f3Qty', { decimalPlaces: 0 });
			},
			afterClose: function () {
				lPauseKeys = false;
				shortcut.add('esc', function() {escKeyFunc();});
			},
			callback: function (data) {
				if (!data) {
					return;
				}
				var cQty = '';
				nQty = Number( data.f3Qty );
				if (nQty>1) {
					cQty = nQty + 'X';
				}
				get_item( cQty + item.barcode );				
				//saleItemAdd( item, nQty );
			}
		});
	} else {
		get_item( item.barcode );				
		//saleItemAdd( item, nQty );
	}
}

function pickPack(item) {
	const modal = $('#pickPackDialog')[0];
	$("#pickPackItemBrand").text(item.brand.trim());
	$("#pickPackItemDesc").text(item.descrip.trim());
	$("#pickPackItemSize").text(item.size.trim());

	$("#pickPackTableBody").empty();
	item.packArr.forEach(function (pack, idx) {
		const row = `<tr data-barcode="${pack[0]}"
			${idx === 0 ? 'class="pickPackHighlight">' : '>'}
			<td>${pack[1]}</td>
			<td>@</td>
			<td>$ ${pack[2]}</td>
		</tr>`;
		$("#pickPackTableBody").append(row);
	});

	$(modal).off('keydown').on('keydown', function (event) {
		event.stopPropagation();
		if (event.key === 'ArrowDown') {
			const currRow = $('.pickPackHighlight')[0];
			if (currRow) {
				const nextRow = $(currRow).next()[0];
				if (nextRow) {
					$(currRow).removeClass('pickPackHighlight');
					$(nextRow).addClass('pickPackHighlight');
				}
			}
		} else if (event.key === 'ArrowUp') {
			const currRow = $('.pickPackHighlight')[0];
			if (currRow) {
				const prevRow = $(currRow).prev()[0];
				if (prevRow) {
					$(currRow).removeClass('pickPackHighlight');
					$(prevRow).addClass('pickPackHighlight');
				}
			}
		} else if (event.key === 'Enter' || event.key === ' ') {
			const currRow = $('.pickPackHighlight')[0];
			if (currRow) {
				let barcode = $(currRow).data('barcode');

				// do qty prompt
				if (barcode && pSet.f3QtyPrompt) {
					vex.dialog.open({
						input: [
							'<h3>' + dict.f3QtyTitle[languageVar] + '</h3>',
							'<div class="vex-custom-field-wrapper">',
							'<div class="f3QtyPrompt">',
							dict.f3QtyPrompt[languageVar] + item.brand + ' ' + item.descrip + ' ' + item.size,
							'</div>',
							'<div class="vex-custom-input-wrapper">',
							'<label for="f3Qty" class="f7Label">' + dict.Qty[languageVar] + ':</label>',
							'<input class="vexF7Input" id="f3Qty" name="f3Qty" type="text" value="1" />',
							'</div>',
							'</div>',
							'</div>'
						].join(''),
						className: 'vex-theme-multiButtons',
						buttons: [
							$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
							$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
						],
						afterOpen: function () {
							lPauseKeys = true;
							shortcut.remove('esc');
							new AutoNumeric('#f3Qty', { decimalPlaces: 0 });
						},
						afterClose: function () {
							lPauseKeys = false;
							shortcut.add('esc', function () { escKeyFunc(); });
						},
						callback: function (data) {
							if (!data) {
								return;
							}
							var cQty = '';
							nQty = Number(data.f3Qty);
							if (nQty > 1) {
								cQty = nQty + 'X';
							}
							get_item(cQty + barcode, true);
							//saleItemAdd( item, nQty );
						}
					});
				} else if (barcode) {
					console.log('selected pack:', barcode);
					get_item(barcode, true);
				}
			}
			modal.close();
		}
	});

	modal.showModal();

}

function closePickPackDialog() {
	$('#pickPackDialog')[0].close();
}

/**
 * Send info about customer selected from Customer Pick List
 * @param {Object} cust - The customer selected.
 * @param {string} caller - The function that invoked customer list.
 * @param {string} dlNbr - The driver license number scanned (if coming from scan).
 * @param {string} bDay - The birthdate scanned (if coming from scan).
 */
function custListPick(cust, caller, dlNbr, bDay) {
	if (caller === 'reprint') {
		$("#Modal_custList").hide();
		return;
	} else if (caller === 'DL') {
		$.post( "dlAddToCust?", {custnum: cust.custnum, dlNbr: dlNbr, bDay: bDay} );
		closeID();
	}
	
	customer = { "custData": cust };
	localStorage.setItem('customer', JSON.stringify(customer));

	$("#customerDiv").html('<span id="customerClose" onclick="closeCustomerDiv();" title="' + dict.removeCust[languageVar] + '">&times;</span>');
	var cusText = "Nbr: " + customer.custData.custnum + "<br>";
	cusText += titleCase( customer.custData.name ) + "<br>";
	if (customer.custData.address.length > 0) { cusText += customer.custData.address + '<br>' };
	if (customer.custData.citySt.indexOf(',') > -1) {
		cusText += titleCase(customer.custData.citySt.substr(0, customer.custData.citySt.indexOf(','))); 
		cusText += customer.custData.citySt.substr(customer.custData.citySt.indexOf(',')); 
	} else {
		cusText += customer.custData.citySt
	}
	cusText += " " + customer.custData.zip + '<br>' + customer.custData.phone;
	if (pSet.doChecksOK && customer.custData.checks === 'N') {
		cusText += "<span id='checksOK'>" + dict.noChecks[languageVar] + "</span>";
	} else if (pSet.doChecksOK) {
		cusText += "<span id='checksOK'>" + dict.checksOK[languageVar] + "</span>";
	};

	$("#customerDiv").append( cusText );

	//$("#saleTableDiv").css({ "top": saleDivTop2, "height": "58%" });  // "calc( 12.5% + 105px )", "height": "43%" } );
	saleTableDivSize( { "top": saleDivTop2, "height": "58%" } )
	$('.gFuncBar').css( 'top', gBarTop2 );
	
	$("#cashSale").toggle(false);
	$("#customerDiv").toggle(true);
	$("#custHistBttn").prop("disabled",false);
	$("#Modal_custList").hide();

	setTimeout( function() { focusBarc(); }, 100 );

}

function paintCurrentLine( nLine ) {
	if (dataSet.data.length === 0) {
		return;
	}
	if (!nLine) {
		if (currLine<1) { currLine=1 } else if (currLine > dataSet.data.length) { currLine = dataSet.data.length };
		nLine = currLine;
	} else {
		currLine = nLine;
	}

	// console.log( "paintCurrentLine:", nLine, "caller:", paintCurrentLine.caller );

	$('td').each( function () {
		$(this).css('background-color', '');
	} );

	$('#saleTableBody td').removeClass('highlighted groupEm');
	$('#saleTableBody tr:eq('+(nLine-1)+') td').addClass('highlighted'); //css('background-color', '#D5F5E3 !important');

	if ($("#saleTableBody").overflownY()) {
		var row = $("#saleTableBody tr:nth-child(" + nLine + ")")
		$("#saleTableBody").scrollTop( row.offset().top - ($("#saleTableBody").height()/2) );
	}

	totalDivResize(true);
}

function paintRefundLine( nLine ) {
	if ( dataSet.data[nLine-1].qty < 0 ) {
		$('#saleTableBody tr:nth-child('+(nLine)+')').find('td').css('color', 'red');
	} else {
		$('#saleTableBody tr:nth-child('+(nLine)+')').find('td').css('color', '#1f6b93');
	}
}

function focusBarc(key) {
	// console.log( "key =", key);
	if ( key == null && !$("#ModalTender").is(":visible")) {
		//$('#scanText').focus();
		return;
	} else if ( !$("#Modal_custList").is(':visible') && 
		 !lEditing  && 
		 !$("#ModalTender").is(':visible') ) {//&& 
		 //!$("#scanText").is( ":focus" ) ) {

		let scanVal = $('#scanText').val().replace(/\0/g, '');
		if (scanVal.length>0 && key==="Backspace") {
			scanVal = scanVal.substring(0, scanVal.length-1);
		} else if (key !== "Backspace") {
			scanVal += key;
		}
		if ( scanVal == 'undefined' ) {
			return;
		}
		console.log( 'scanVal =', scanVal, "lPauseKeys =", lPauseKeys );
		$('#scanText').val( scanVal );
	    
	    if (!isMobile) {
			//$('#scanText').focus();
		} else {
			//$('#scanText').attr('readonly','readonly');
		}
	} else if ( $("#ModalTender").is(':visible') ) {
		//$('#tenderInput').focus();
	} else {
		console.log('focusBarc nothing...');
		//$('#scanText').focus();
	}
}

function totalDivResize(down) {
	$(".totalExpander").show();

	if (!down && $('.totalExpanderObj').html().includes('up-arrow')) {
		$('.totalExpanderObj').html("<img src='/images/dn-arrow.png'>");
		$('.totalTableDiv').css({'top': totalDivTop2, 'height': '163px'});
		$('.subTotalRow').show();
	} else {
		if ($('.totalExpanderObj').html().includes('dn-arrow')) {
			$('.totalExpanderObj').html("<img src='/images/up-arrow.png'>");
		}
		$('.totalTableDiv').css({'top': totalDivTop1,'height': '50px'});
		$('.subTotalRow').hide();
	}
}

function startTime() {
	var today = new Date(),
	    d = today.toLocaleDateString(),
		h = checkHour(today.getHours()),
		m = checkMinutes(today.getMinutes()),
		p = checkMeridian(today.getHours());
		$('#dateDisplay').html( d + '  ' + h + ":" + m + p );

		today.setFullYear( today.getFullYear() - pSet.legalAge );
	    d = today.toLocaleDateString();
		$('#legalDate').html( 'Legal: ' + d );

		t = setTimeout(function () {
			startTime()
		}, 1000);
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
	var audio = new Audio('../sounds/beep.mp3');
	audio.play();
}

function playBuzzer() {
	var audio = new Audio('../sounds/buzzer.mp3');
	audio.play();
}

function playMagic() {
	var audio = new Audio('../sounds/sfx-magic.wav');
	audio.play();
}

function playOkay() {
	var audio = new Audio('../sounds/okay.mp3');
	audio.play();
}

function playWarning() {
	var audio = new Audio('../sounds/warning.mp3');
	audio.play();
}

function playError() {
	var audio = new Audio('../sounds/error.mp3');
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
console.log( 'toggleNav:',$('#mySidenav').attr('viewMe'))	;

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

	$("#func1").show();
	$('#mySidenav').attr('viewMe', true);
   $('#mySidenav').css('left', '0px'); //'191px');
   $('#menuButton').css('left', '284px'); //'191px');
	$('#menuButton').off('click').on('click', closeNav);
	$('#menuButton').html('arrow_back');
	lPauseKeys = true;
	// setTimeout(function () { navFocus = 0; console.log( 'focusing:', $( navButtons[navFocus] ) ); $( navButtons[navFocus] ).focus(); }, 0);
}

/* Set the width of the side navigation to 0 */
function closeNav() {
	if ($("#Modal_itemList").is(":visible") || $("#Modal_custList").is(":visible")) {
		return;
	}
	lPauseKeys = false;
	$('#mySidenav').attr('viewMe', false);
	//$('#mySidenav').css('width','8px');
	$('#mySidenav').css('left', '-276px');
	$('#menuButton').css('left', '8px');
	$('#menuButton').off('click').on('click', openNav);
	$('#menuButton').html('more_vert');
	$("#func1").hide();
	$("#func2").hide();
	if (!isMobile) {
		//$('#scanText').focus();
	} else {
		//$('#scanText').attr('readonly','readonly');
	}
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
	setTimeout(function () { navFocus = 0; $( navButtons[navFocus] ).focus(); }, 0);
}

/**
 * JavaScript Client Detection
 * (C) viazenetti GmbH (Christian Ludwig)
 */
function getClientInfo() {
	var unknown = '-';
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;

	// mobile version
	var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

	// system
	var os = unknown;
	var clientStrings = [
		{ s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
		{ s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
		{ s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
		{ s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
		{ s: 'Windows Vista', r: /Windows NT 6.0/ },
		{ s: 'Windows Server 2003', r: /Windows NT 5.2/ },
		{ s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
		{ s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
		{ s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
		{ s: 'Windows 98', r: /(Windows 98|Win98)/ },
		{ s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
		{ s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
		{ s: 'Windows CE', r: /Windows CE/ },
		{ s: 'Windows 3.11', r: /Win16/ },
		{ s: 'Android', r: /Android/ },
		{ s: 'Open BSD', r: /OpenBSD/ },
		{ s: 'Sun OS', r: /SunOS/ },
		{ s: 'Linux', r: /(Linux|X11)/ },
		{ s: 'iOS', r: /(iPhone|iPad|iPod)/ },
		{ s: 'Mac OS X', r: /Mac OS X/ },
		{ s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
		{ s: 'QNX', r: /QNX/ },
		{ s: 'UNIX', r: /UNIX/ },
		{ s: 'BeOS', r: /BeOS/ },
		{ s: 'OS/2', r: /OS\/2/ },
		{ s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
	];
	for (var id in clientStrings) {
		var cs = clientStrings[id];
		if (cs.r.test(nAgt)) {
			os = cs.s;
			break;
		}
	}

	var osVersion = unknown;

	if (/Windows/.test(os)) {
		osVersion = /Windows (.*)/.exec(os)[1];
		os = 'Windows';
	}

	switch (os) {
		case 'Mac OS X':
			osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
			break;

		case 'Android':
			osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
			break;

		case 'iOS':
			osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
			osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
			break;
	}

	hostOS = os + ' ' + osVersion;
	isMobile = mobile;
}

function setSvgVars() {
   svgCheck   = ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M119.164,220.552L252.858,86.858C253.12,86.61 253.375,86.354 253.644,86.113C254.182,85.631 254.745,85.178 255.332,84.756C257.68,83.069 260.392,81.903 263.231,81.358C264.295,81.154 265.375,81.037 266.458,81.007C266.819,80.998 267.181,81.007 267.542,81.007C267.902,81.027 268.263,81.046 268.623,81.066C269.58,81.17 269.823,81.177 270.769,81.358C272.897,81.767 274.957,82.523 276.843,83.59C278.415,84.479 279.865,85.581 281.142,86.858C283.187,88.902 284.776,91.389 285.773,94.103C286.645,96.477 287.061,99.013 286.993,101.542C286.944,103.347 286.649,105.144 286.119,106.87C285.483,108.942 284.508,110.908 283.244,112.668C282.822,113.255 282.369,113.818 281.887,114.356C281.646,114.625 281.39,114.88 281.142,115.142L131.142,265.142L131.127,265.157C130.911,265.372 130.691,265.582 130.465,265.787C130.429,265.821 130.393,265.854 130.356,265.887L130.279,265.955L130.259,265.973L130.235,265.994C130.116,266.099 129.996,266.202 129.874,266.305L129.848,266.327L129.817,266.353L129.74,266.417L129.632,266.505L129.57,266.556L129.567,266.559L129.53,266.588L129.466,266.639L129.429,266.669L129.383,266.705L129.318,266.756L129.29,266.778C129.238,266.819 129.185,266.859 129.133,266.899L129.104,266.922L129.053,266.96L129,267L128.935,267.048L128.887,267.084L128.866,267.099C128.807,267.143 128.748,267.186 128.689,267.228L128.668,267.244L128.623,267.276L128.562,267.319L128.511,267.355L128.475,267.381L128.449,267.398L128.415,267.423L128.293,267.506L128.28,267.516L128.277,267.518C128.223,267.554 128.17,267.59 128.116,267.626L128.09,267.644L128.083,267.648L128.064,267.661L127.947,267.738L127.896,267.771L127.885,267.778L127.868,267.789L127.776,267.849L127.695,267.9L127.685,267.906L127.677,267.911C126.211,268.837 124.624,269.57 122.969,270.088L122.968,270.089L122.963,270.09L122.811,270.137L122.757,270.153L122.741,270.158L122.714,270.166L122.617,270.195L122.544,270.216L122.514,270.225L122.485,270.233L122.421,270.251L122.328,270.277L122.285,270.289L122.263,270.295L122.226,270.305L122.129,270.331L122.056,270.35L122.032,270.357L122.007,270.363L121.917,270.386L121.827,270.409L121.801,270.415L121.788,270.418L121.748,270.428L121.629,270.457L121.587,270.467L121.569,270.471L121.534,270.479L121.431,270.503L121.37,270.516L121.349,270.521L121.321,270.527L121.233,270.547L121.15,270.564L121.128,270.569L121.109,270.573L121.034,270.589L120.925,270.611L120.907,270.614L120.897,270.616L120.835,270.629L120.689,270.656L120.686,270.657L120.684,270.657C120.241,270.74 119.795,270.808 119.347,270.861L119.347,270.861L119.347,270.861L119.23,270.875L119.124,270.886L119.123,270.886L119.122,270.886C118.599,270.942 118.074,270.978 117.548,270.992L117.548,270.992L117.547,270.992L117.406,270.996L117.329,270.997L117.322,270.997L117.312,270.997L117.203,270.999L117.108,270.999L117.096,270.999L117.085,270.999L117,271L116.885,270.999L116.871,270.999L116.862,270.999L116.797,270.999L116.656,270.997L116.645,270.997L116.641,270.996C116.344,270.991 116.049,270.979 115.753,270.961L115.743,270.96L115.706,270.958L115.579,270.949L115.54,270.946L115.518,270.945L115.469,270.941L115.377,270.934L115.32,270.929L115.293,270.927L115.264,270.924L115.208,270.92L115.103,270.91L115.068,270.906L115.057,270.905C114.985,270.898 114.912,270.891 114.841,270.883L114.821,270.881L114.786,270.877L114.703,270.868L114.606,270.856L114.574,270.852L114.56,270.85C114.486,270.841 114.413,270.832 114.339,270.822L114.328,270.821L114.304,270.817L114.199,270.803L114.099,270.788L114.082,270.786L114.073,270.784C112.72,270.584 111.387,270.245 110.103,269.773C109.701,269.626 109.304,269.465 108.913,269.291L108.855,269.266L108.851,269.264L108.848,269.263L108.829,269.254C108.384,269.055 107.946,268.84 107.517,268.609C106.125,267.859 104.823,266.944 103.646,265.888L103.645,265.887L103.643,265.886L103.548,265.8L103.453,265.713L103.444,265.705L103.44,265.701C103.379,265.644 103.317,265.587 103.257,265.53L103.246,265.52L103.227,265.502L103.152,265.43L103.073,265.354L103.051,265.332L103.041,265.322C102.991,265.275 102.943,265.226 102.894,265.178L102.876,265.16L102.858,265.142L102.743,265.026L102.703,264.986L102.697,264.98C102.639,264.92 102.581,264.86 102.523,264.799L102.515,264.791L102.453,264.724L102.364,264.63L102.352,264.617L102.33,264.593L102.256,264.513L102.204,264.456L102.186,264.436L102.147,264.394L102.076,264.314L102.045,264.28L102.025,264.257L101.967,264.191L101.903,264.117L101.889,264.101L101.873,264.083C101.727,263.914 101.584,263.743 101.444,263.57C101.4,263.516 101.358,263.462 101.315,263.408C101.229,263.299 101.144,263.189 101.06,263.078L101,263L51,196.333C50.859,196.138 50.715,195.946 50.577,195.748C50.165,195.155 49.785,194.539 49.439,193.905C48.517,192.214 47.842,190.39 47.44,188.506C47.038,186.622 46.91,184.681 47.062,182.761C47.251,180.36 47.878,177.997 48.903,175.818C49.929,173.639 51.35,171.65 53.079,169.974C54.462,168.633 56.039,167.494 57.747,166.603C59.668,165.6 61.751,164.913 63.892,164.576C64.606,164.464 65.325,164.39 66.047,164.356C66.287,164.345 66.528,164.342 66.769,164.335C67.009,164.336 67.25,164.338 67.491,164.339C68.132,164.367 68.293,164.365 68.932,164.427C69.891,164.52 70.842,164.682 71.777,164.912C75.055,165.719 78.108,167.363 80.585,169.655C81.115,170.146 81.619,170.665 82.092,171.21C82.514,171.695 82.606,171.827 83,172.333L119.164,220.552Z" style=""></path></svg>';
   svgDelete  = '<svg height="30" width="30" fill="#2E8584" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1" x="0px" y="0px"><g stroke="none" stroke-width="1" fill-rule="evenodd"><path d="M6.99569017,9 L7.91291186,28 L24.0871307,28 L25.0043524,9 L6.99569017,9 Z M6.99569017,7 L25.0043524,7 C26.1089219,7 27.0043524,7.8954305 27.0043524,9 C27.0043524,9.03215981 27.0035767,9.06431494 27.002026,9.09643734 L26.0848043,28.0964373 C26.0333512,29.1622753 25.1542099,30 24.0871307,30 L7.91291186,30 C6.84583264,30 5.96669139,29.1622753 5.91523825,28.0964373 L4.99801657,9.09643734 C4.94475569,7.99315268 5.79596816,7.05558727 6.89925283,7.00232639 C6.93137523,7.00077569 6.96353036,7 6.99569017,7 Z" fill-rule="nonzero"></path><path d="M10.0012477,14.0499376 C9.97366788,13.4983419 10.3984667,13.0288274 10.9500624,13.0012477 C11.5016581,12.9736679 11.9711726,13.3984667 11.9987523,13.9500624 L12.4987523,23.9500624 C12.5263321,24.5016581 12.1015333,24.9711726 11.5499376,24.9987523 C10.9983419,25.0263321 10.5288274,24.6015333 10.5012477,24.0499376 L10.0012477,14.0499376 Z" fill-rule="nonzero"></path><path d="M20.0012477,13.9500624 C20.0288274,13.3984667 20.4983419,12.9736679 21.0499376,13.0012477 C21.6015333,13.0288274 22.0263321,13.4983419 21.9987523,14.0499376 L21.4987523,24.0499376 C21.4711726,24.6015333 21.0016581,25.0263321 20.4500624,24.9987523 C19.8984667,24.9711726 19.4736679,24.5016581 19.5012477,23.9500624 L20.0012477,13.9500624 Z" fill-rule="nonzero"></path><path d="M17,24 C17,24.5522847 16.5522847,25 16,25 C15.4477153,25 15,24.5522847 15,24 L15,14 C15,13.4477153 15.4477153,13 16,13 C16.5522847,13 17,13.4477153 17,14 L17,24 Z" fill-rule="nonzero"></path><path d="M4,9 C3.44771525,9 3,8.55228475 3,8 C3,7.44771525 3.44771525,7 4,7 L28,7 C28.5522847,7 29,7.44771525 29,8 C29,8.55228475 28.5522847,9 28,9 L4,9 Z" fill-rule="nonzero"></path><path d="M18.3057458,5 L13.6942542,5 L13.3609208,7 L18.6390792,7 L18.3057458,5 Z M13.6942542,3 L18.3057458,3 C19.2834241,3 20.1178043,3.70682609 20.2785337,4.67120203 L21,9 L11,9 L11.7214663,4.67120203 C11.8821957,3.70682609 12.7165759,3 13.6942542,3 Z" fill-rule="nonzero"></path></g></svg>';
   svgEx      = '<svg id="svgEx" fill="#FF0000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M163.709,135.425L239.315,59.819C239.603,59.548 239.882,59.269 240.178,59.006C240.769,58.481 241.391,57.992 242.04,57.541C244.312,55.96 246.911,54.861 249.628,54.331C250.404,54.18 251.188,54.075 251.977,54.016C252.371,53.987 252.766,53.981 253.161,53.964C253.556,53.97 253.951,53.975 254.346,53.981C255.396,54.059 255.662,54.055 256.703,54.227C259.043,54.612 261.311,55.416 263.371,56.592C265.088,57.571 266.657,58.806 268.012,60.245C269.368,61.683 270.507,63.322 271.384,65.094C272.435,67.22 273.104,69.531 273.35,71.891C273.636,74.644 273.344,77.45 272.496,80.085C271.77,82.343 270.64,84.468 269.173,86.332C268.52,87.16 268.321,87.337 267.599,88.104L191.994,163.709L267.599,239.315C267.87,239.603 268.15,239.882 268.412,240.178C268.937,240.769 269.427,241.391 269.878,242.04C271.458,244.312 272.557,246.911 273.087,249.628C273.541,251.956 273.577,254.362 273.192,256.703C272.871,258.653 272.26,260.554 271.384,262.325C270.332,264.451 268.9,266.385 267.174,268.012C265.448,269.639 263.432,270.954 261.247,271.878C259.427,272.647 257.494,273.145 255.528,273.35C252.775,273.636 249.968,273.344 247.333,272.496C245.075,271.77 242.951,270.64 241.087,269.173C240.258,268.52 240.081,268.321 239.315,267.599L163.709,191.994L88.104,267.599C87.337,268.321 87.16,268.52 86.332,269.173C84.468,270.64 82.343,271.77 80.085,272.496C77.45,273.344 74.644,273.636 71.891,273.35C69.925,273.145 67.991,272.647 66.171,271.878C64.351,271.108 62.647,270.067 61.131,268.799C59.311,267.277 57.768,265.431 56.592,263.371C55.416,261.311 54.612,259.043 54.227,256.703C53.842,254.362 53.877,251.956 54.331,249.628C54.861,246.911 55.96,244.312 57.541,242.04C57.992,241.391 58.481,240.769 59.006,240.178C59.269,239.882 59.548,239.603 59.819,239.315L135.425,163.709L59.819,88.104C59.548,87.816 59.269,87.536 59.006,87.241C58.481,86.65 57.992,86.028 57.541,85.379C56.187,83.432 55.184,81.244 54.593,78.947C54.1,77.033 53.893,75.047 53.981,73.073C54.087,70.703 54.617,68.356 55.541,66.171C56.619,63.622 58.23,61.305 60.245,59.406C61.683,58.051 63.322,56.911 65.094,56.035C67.22,54.983 69.531,54.315 71.891,54.069C72.939,53.96 73.205,53.979 74.258,53.964C74.653,53.981 75.047,53.999 75.442,54.016C75.835,54.057 76.229,54.087 76.621,54.139C77.405,54.244 78.181,54.396 78.947,54.593C81.244,55.184 83.432,56.187 85.379,57.541C86.028,57.992 86.65,58.481 87.241,59.006C87.536,59.269 87.816,59.548 88.104,59.819L163.709,135.425Z" style=""></path></svg>';
   svgEx2     = ' fill="#FF0000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 328 328" version="1.1" xml:space="preserve" style="" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421"><path d="M163.709,135.425L239.315,59.819C239.603,59.548 239.882,59.269 240.178,59.006C240.769,58.481 241.391,57.992 242.04,57.541C244.312,55.96 246.911,54.861 249.628,54.331C250.404,54.18 251.188,54.075 251.977,54.016C252.371,53.987 252.766,53.981 253.161,53.964C253.556,53.97 253.951,53.975 254.346,53.981C255.396,54.059 255.662,54.055 256.703,54.227C259.043,54.612 261.311,55.416 263.371,56.592C265.088,57.571 266.657,58.806 268.012,60.245C269.368,61.683 270.507,63.322 271.384,65.094C272.435,67.22 273.104,69.531 273.35,71.891C273.636,74.644 273.344,77.45 272.496,80.085C271.77,82.343 270.64,84.468 269.173,86.332C268.52,87.16 268.321,87.337 267.599,88.104L191.994,163.709L267.599,239.315C267.87,239.603 268.15,239.882 268.412,240.178C268.937,240.769 269.427,241.391 269.878,242.04C271.458,244.312 272.557,246.911 273.087,249.628C273.541,251.956 273.577,254.362 273.192,256.703C272.871,258.653 272.26,260.554 271.384,262.325C270.332,264.451 268.9,266.385 267.174,268.012C265.448,269.639 263.432,270.954 261.247,271.878C259.427,272.647 257.494,273.145 255.528,273.35C252.775,273.636 249.968,273.344 247.333,272.496C245.075,271.77 242.951,270.64 241.087,269.173C240.258,268.52 240.081,268.321 239.315,267.599L163.709,191.994L88.104,267.599C87.337,268.321 87.16,268.52 86.332,269.173C84.468,270.64 82.343,271.77 80.085,272.496C77.45,273.344 74.644,273.636 71.891,273.35C69.925,273.145 67.991,272.647 66.171,271.878C64.351,271.108 62.647,270.067 61.131,268.799C59.311,267.277 57.768,265.431 56.592,263.371C55.416,261.311 54.612,259.043 54.227,256.703C53.842,254.362 53.877,251.956 54.331,249.628C54.861,246.911 55.96,244.312 57.541,242.04C57.992,241.391 58.481,240.769 59.006,240.178C59.269,239.882 59.548,239.603 59.819,239.315L135.425,163.709L59.819,88.104C59.548,87.816 59.269,87.536 59.006,87.241C58.481,86.65 57.992,86.028 57.541,85.379C56.187,83.432 55.184,81.244 54.593,78.947C54.1,77.033 53.893,75.047 53.981,73.073C54.087,70.703 54.617,68.356 55.541,66.171C56.619,63.622 58.23,61.305 60.245,59.406C61.683,58.051 63.322,56.911 65.094,56.035C67.22,54.983 69.531,54.315 71.891,54.069C72.939,53.96 73.205,53.979 74.258,53.964C74.653,53.981 75.047,53.999 75.442,54.016C75.835,54.057 76.229,54.087 76.621,54.139C77.405,54.244 78.181,54.396 78.947,54.593C81.244,55.184 83.432,56.187 85.379,57.541C86.028,57.992 86.65,58.481 87.241,59.006C87.536,59.269 87.816,59.548 88.104,59.819L163.709,135.425Z" style=""></path></svg>';
	svgSearch  = '<svg height="24" width="24" fill="#fff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M68.961,63.421c5.13-6.358,7.918-14.218,7.918-22.481C76.879,21.123,60.757,5,40.94,5C21.122,5,5,21.123,5,40.94  c0,19.81,16.122,35.931,35.94,35.931c8.389,0,16.335-2.859,22.746-8.122L89.4,94.699l5.324-5.27L68.961,63.421z M40.94,73.126  c-17.754,0-32.193-14.438-32.193-32.186c0-17.754,14.439-32.192,32.193-32.192c17.746,0,32.193,14.438,32.193,32.192  C73.133,58.688,58.686,73.126,40.94,73.126z"></path></svg>';
	svgSale    = ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"><g><g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)" style="fill:#2e8584"><svg fill="#2e8584" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 100" x="0px" y="0px"><path d="M60.86,57.5c0-2.3,1.38-4.31,3-4.31s3,2,3,4.31-1.38,4.31-3,4.31S60.86,59.8,60.86,57.5ZM36.19,46.81c1.57,0,3-2,3-4.31s-1.38-4.31-3-4.31-3,2-3,4.31S34.62,46.81,36.19,46.81ZM5,45.28l1.81-1.59a6.14,6.14,0,0,0,1.61-7l-.93-2.23a6.14,6.14,0,0,1,4-8.28l2.33-.65A6.14,6.14,0,0,0,18.27,20l.13-2.41a6.14,6.14,0,0,1,6.12-5.81,6.21,6.21,0,0,1,1.09.1l2.38.43a6.14,6.14,0,0,0,6.46-3.09L35.6,7.06a6.13,6.13,0,0,1,9-2l2,1.41a6.14,6.14,0,0,0,7.16,0l2-1.4a6.14,6.14,0,0,1,9,2.07l1.15,2.12a6.14,6.14,0,0,0,5.4,3.22,6.07,6.07,0,0,0,1-.09L74.6,12a6.22,6.22,0,0,1,1.06-.09,6.14,6.14,0,0,1,6.12,5.85l.11,2.41a6.14,6.14,0,0,0,4.45,5.61l2.32.66a6.14,6.14,0,0,1,4,8.3l-.94,2.22a6.14,6.14,0,0,0,1.58,7l1.8,1.6a6.14,6.14,0,0,1,0,9.2l-1.81,1.59a6.14,6.14,0,0,0-1.61,7l.93,2.23a6.14,6.14,0,0,1-4,8.28l-2.33.65A6.14,6.14,0,0,0,81.73,80l-.13,2.41a6.14,6.14,0,0,1-6.12,5.81,6.21,6.21,0,0,1-1.09-.1L72,87.74a6.13,6.13,0,0,0-6.46,3.09L64.4,92.94a6.13,6.13,0,0,1-9,2l-2-1.41a6.14,6.14,0,0,0-7.16,0l-2,1.4a6.13,6.13,0,0,1-9-2.07l-1.15-2.12a6.14,6.14,0,0,0-6.44-3.13L25.4,88a6.22,6.22,0,0,1-1.06.09,6.14,6.14,0,0,1-6.12-5.85l-.12-2.41a6.14,6.14,0,0,0-4.45-5.61l-2.32-.66a6.14,6.14,0,0,1-4-8.3l.94-2.22a6.14,6.14,0,0,0-1.58-7l-1.8-1.6A6.14,6.14,0,0,1,5,45.28ZM54.49,57.5c0,5.89,4.18,10.69,9.32,10.69s9.32-4.79,9.32-10.69S69,46.81,63.81,46.81,54.49,51.61,54.49,57.5ZM38,64.93A3.19,3.19,0,1,0,43.54,68L62,35.07A3.19,3.19,0,1,0,56.46,32ZM26.86,42.5c0,5.89,4.18,10.69,9.32,10.69s9.32-4.79,9.32-10.69-4.18-10.69-9.32-10.69S26.86,36.61,26.86,42.5Z"></path></svg></g></g></svg>';
	svgDollar  = ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M50,10c-22.1,0-40,17.9-40,40s17.9,40,40,40s40-17.9,40-40S72.1,10,50,10z M52.8,45.2c4,1.8,6.8,3.5,8.5,5.5  c1.9,2.1,2.8,4.7,2.8,7.7c0,2.9-1,5.5-3.1,7.8c-1.6,1.8-4,3.1-6.2,4v6.5h-9.6v-6.1c-2.8-0.6-5.9-1.8-8.3-3.6l-1.5-1.2l4.5-8l2.1,1.7  c2,1.6,4.4,2.4,7.3,2.4c1.7,0,3-0.4,3.9-1.1c0.8-0.6,1.1-1.3,1.1-2.2c0-2.1-3.3-3.8-5.3-4.6c-7.9-3.4-12-7.6-12-12.6  c0-3,0.9-5.5,2.9-7.7c1.5-1.7,3.8-2.9,5.8-3.6v-6.6h9.6v6.4c2,0.5,4.5,1.4,6.8,2.6l2.1,1.2l-5.1,8.4l-2-1.7  c-1.4-1.2-3.5-1.9-6.2-1.9c-1.4,0-2.4,0.3-3.2,0.9c-0.6,0.4-0.9,0.9-0.9,1.7C46.9,40.9,47,42.6,52.8,45.2z"></path></svg>'
   svgAlert   = '<path d="m84.371 95.309h-68.75c-5.582-0.003906-10.742-2.9844-13.527-7.8203-2.7891-4.8398-2.7852-10.793 0.007812-15.629l34.34-59.371c2.793-4.8242 7.9492-7.793 13.523-7.793 5.5781 0 10.73 2.9688 13.523 7.793l34.398 59.371h0.003906c1.8477 3.1797 2.5117 6.9102 1.8789 10.531-0.63672 3.6211-2.5273 6.9062-5.3438 9.2695-2.8164 2.3633-6.3789 3.6562-10.055 3.6484zm-34.371-82.809c-2.7891 0.011719-5.3594 1.5-6.7617 3.9102l-34.379 59.371c-1.3984 2.4141-1.3984 5.3945-0.003906 7.8125s3.9727 3.9062 6.7656 3.9062h68.75c2.7891 0 5.3672-1.4883 6.7617-3.9062 1.3945-2.418 1.3945-5.3984-0.003906-7.8125l-34.398-59.371c-1.3945-2.4023-3.9531-3.8867-6.7305-3.9102z" fill="#ff814a"/>' +
                '<path d="m50 61.691c-2.1602 0-3.9102-1.7539-3.9102-3.9102v-19.891c-0.054688-1.0703 0.33203-2.1172 1.0703-2.8906 0.73828-0.77734 1.7617-1.2188 2.8359-1.2188 1.0703 0 2.0938 0.44141 2.832 1.2188 0.73828 0.77344 1.125 1.8203 1.0703 2.8906v19.918c-0.007813 2.1484-1.7539 3.8828-3.8984 3.8828z" fill="#ff814a"/>' +
                '<path d="m53.91 71.488c0 5.2148-7.8203 5.2148-7.8203 0 0-5.2109 7.8203-5.2109 7.8203 0z" fill="#ff814a"/>'
   svgError   = '<path d="m83.941 16.059c-18.695-18.797-49.086-18.879-67.883-0.18359s-18.879 49.086-0.18359 67.883l0.18359 0.18359c18.695 18.797 49.086 18.879 67.883 0.18359s18.879-49.086 0.18359-67.883zm-33.941 75.941c-23.195 0-42-18.805-42-42s18.805-42 42-42 42 18.805 42 42c-0.027344 23.184-18.816 41.973-42 42zm23.336-65.336c-2.9297-2.9258-7.6758-2.9258-10.605 0l-12.73 12.73-12.727-12.73c-2.9297-2.9297-7.6797-2.9297-10.605 0-2.9297 2.9297-2.9297 7.6797 0 10.605l12.727 12.73-12.73 12.727c-2.9297 2.9297-2.9297 7.6797 0 10.605 2.9297 2.9297 7.6797 2.9297 10.605 0l12.73-12.727 12.727 12.727c2.9297 2.9297 7.6797 2.9297 10.605 0 2.9297-2.9297 2.9297-7.6797 0-10.605l-12.727-12.727 12.727-12.727c2.9258-2.9336 2.9258-7.6758 0.003907-10.609z" fill="#ff001b"/>'
	svgClock   = '<svg version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="m50 10c-22.066 0-40 17.934-40 40s17.934 40 40 40 40-17.934 40-40-17.934-40-40-40zm0 4c19.906 0 36 16.094 36 36s-16.094 36-36 36-36-16.094-36-36 16.094-36 36-36zm-0.21875 1.9688c-0.98438 0.10938-1.8008 1.043-1.7812 2.0312v4c-0.015625 1.0547 0.94141 2.0273 2 2.0273s2.0156-0.97266 2-2.0273v-4c0.023438-1.1328-1.0898-2.1562-2.2188-2.0312zm-22.406 11.406c-0.78125 0.78125-0.78125 2.0312 0 2.8125s2.0312 0.78125 2.8125 0 0.78125-2.0312 0-2.8125c-1.0352-0.85156-1.9648-0.66797-2.8125 0zm42.438 0c-0.78125 0.78125-0.78125 2.0312 0 2.8125s2.0312 0.78125 2.8125 0 0.78125-2.0312 0-2.8125c-1.0352-0.85156-1.9688-0.75781-2.8125 0zm-20.031 0.59375c-0.98438 0.10938-1.8008 1.043-1.7812 2.0312v19.625c0.023438 1.0078 0.25391 1.4023 0.90625 2.0938l11.688 11.688c0.73828 0.76172 2.1094 0.76562 2.8555 0.011719 0.74609-0.75391 0.72266-2.125-0.042969-2.8555l-11.406-11.406v-19.156c0.023438-1.1328-1.0898-2.1562-2.2188-2.0312zm-31.969 20.031c-1.0469 0.050781-1.957 1.0469-1.9062 2.0938s1.0469 1.957 2.0938 1.9062h4c1.0547 0.015625 2.0273-0.94141 2.0273-2s-0.97266-2.0156-2.0273-2zm60 0c-1.0469 0.050781-1.957 1.0469-1.9062 2.0938s1.0469 1.957 2.0938 1.9062h4c1.0547 0.015625 2.0273-0.94141 2.0273-2s-0.97266-2.0156-2.0273-2zm-50.438 21.812c-0.78125 0.78125-0.78125 2.0312 0 2.8125s2.0312 0.78125 2.8125 0 0.78125-2.0312 0-2.8125c-1.0352-0.85156-1.875-0.67969-2.8125 0zm42.438 0c-0.78125 0.78125-0.78125 2.0312 0 2.8125s2.0312 0.78125 2.8125 0 0.78125-2.0312 0-2.8125c-1.0352-0.85156-2.0312-0.625-2.8125 0zm-20.031 6.1562c-0.98438 0.10938-1.8008 1.043-1.7812 2.0312v4c-0.015625 1.0547 0.94141 2.0273 2 2.0273s2.0156-0.97266 2-2.0273v-4c0.023438-1.1328-1.0898-2.1562-2.2188-2.0312z" fill="#1f6b93"/></svg>'
	svgGiftCard = '<path d="m86.027 26.926-51.566-13.664c-5.9336-1.8789-10.742-0.51172-13.203 3.7461l-1.0195 1.7656c-4.1523 0.53906-7.3594 3.1211-8.4102 7.043-0.011719 0.050782-0.25391 1.6367-0.25391 1.6367-3.8281 1.3672-6.5742 5.0273-6.5742 9.3164v40.91c0 5.4492 4.4336 9.8867 9.8867 9.8867h70.227c5.4492 0 9.8867-4.4336 9.8867-9.8867v-40.91c0-5.1445-3.9492-9.3789-8.9727-9.8438zm-52.363-11.055c0.019532 0.007812 31.934 8.4648 31.934 8.4648s-42.078-5.5703-42.199-5.582l0.21875-0.37891c2.2969-3.9805 6.7305-3.5586 10.047-2.5039zm-19.184 10.582c1.1406-4.0898 5.2969-5.4375 8.9219-4.957l40.66 5.3867s-49.492 0.003907-49.648 0.011719zm77.793 51.223c0 3.9453-3.2109 7.1602-7.1602 7.1602h-17.047c0-0.75391-0.60938-1.3633-1.3633-1.3633s-1.3633 0.60938-1.3633 1.3633h-50.453c-3.9492 0-7.1602-3.2109-7.1602-7.1602v-30.68h4.0898c0.75391 0 1.3672-0.61328 1.3672-1.3633 0-0.75391-0.61328-1.3672-1.3672-1.3672h-4.0898v-7.5c0-3.9492 3.2109-7.1602 7.1602-7.1602h50.453v4.0938c0 0.75391 0.61328 1.3633 1.3633 1.3633 0.75391 0 1.3672-0.60938 1.3672-1.3633v-4.0898h17.047c3.9453 0 7.1602 3.2109 7.1602 7.1602v40.91z" fill="#1f6a93"/>' +
                 '<path d="m66.703 72.562c-0.75391 0-1.3633 0.60938-1.3633 1.3633v5.457c0 0.75391 0.61328 1.3633 1.3633 1.3633 0.75391 0 1.3672-0.60938 1.3672-1.3633v-5.457c0-0.75-0.61328-1.3633-1.3672-1.3633zm0-10.91c-0.75391 0-1.3633 0.60938-1.3633 1.3633v5.457c0 0.75391 0.61328 1.3633 1.3633 1.3633 0.75391 0 1.3672-0.60938 1.3672-1.3633v-5.4531c0-0.75391-0.61328-1.3633-1.3672-1.3672z" fill="#1f6a93"/>' +
                 '<path d="m88.863 44.27h-4.1641c0.21875-0.75391 0.55859-1.4922 0.87891-2.1758 0.66406-1.4258 1.3477-2.9023 0.52734-4.1914-0.84375-1.3242-2.7852-1.5-4.5742-1.5-3.4922 0-6.2695 0.74219-8.8711 2.3789l-0.007812-0.003906c-0.64844-0.4375-1.3789-0.74219-2.1484-0.89062-0.59766-0.12109-1.3711-0.066407-2.1758 0.011719-0.44531 0.042968-0.91016 0.089843-1.3594 0.089843-0.42969 0-0.89062-0.046875-1.3359-0.089843-0.78906-0.078126-1.5508-0.12891-2.1367-0.015626h-0.003906c-0.73047 ' +
					  '0.13672-1.4258 0.41406-2.0547 0.8125-2.9219-1.8906-5.6836-2.2969-8.875-2.2969-1.7891 0-3.7305 0.17969-4.5742 1.5-0.82422 1.2891-0.13672 2.7656 0.52734 4.1914 0.33594 0.72266 0.69531 1.5039 0.91016 2.3047l0.003907 0.003907c-0.48438 0.21875-0.79297 0.70312-0.79297 1.2344 0 0.5625 0.33984 1.043 0.82422 1.25-0.21094 0.84375-0.58984 1.6719-0.94141 2.4297-0.66406 1.4258-1.3477 2.9023-0.52734 4.1914 0.84375 1.3203 2.7852 1.5 4.5742 1.5 0.44141 0 0.87891-0.019531 1.3125-0.058594-3.0977 ' +
					  '4.7188-4.9961 9.2109-5.0898 9.4297h-0.003906c-0.1875 0.44922-0.12109 0.96094 0.17188 1.3516 0.29297 0.38672 0.76953 0.58984 1.2539 0.53125l4.5977-0.5625 1.8789 4.6758c0.20703 0.51953 0.71094 0.85547 1.2656 0.85547h0.058594v-0.003906c0.57812-0.023437 1.0742-0.41016 1.2461-0.96484 0.027344-0.097656 2.4961-8.1211 6.0859-13.887v1.1914h-0.003906c0 0.75391 0.61328 1.3672 1.3633 1.3672 0.75391 0 1.3672-0.61328 1.3672-1.3672v-2.3125c4.0859 5.8398 6.75 14.891 6.7773 14.992 0.16016 0.55859 0.66016 0.95312 1.2422 0.98047l0.066406 0.003906c0.55469 0 ' +
					  '1.0586-0.33594 1.2656-0.85547l1.8789-4.6758 4.5977 0.5625c0.47656 0.054688 0.94141-0.14062 1.2383-0.51562 0.29297-0.375 0.37109-0.875 0.20312-1.3203-0.085938-0.22656-1.8594-4.8711-4.8516-9.4531 0.34375 0.023438 0.6875 0.039062 1.0352 0.039062 1.7891 0 3.7305-0.17969 4.5742-1.5 0.82422-1.2891 0.13672-2.7656-0.52734-4.1914-0.33594-0.72656-0.69922-1.5156-0.91406-2.3164h4.2031l0.003906-0.003906c0.75391 0 1.3633-0.60938 1.3633-1.3633 0-0.75391-0.60937-1.3633-1.3633-1.3633zm-24.852-3.707c0.57422-0.13672 2.0117 0.14453 2.9766 0.15234 0.88281 0.007812 2.4688-0.26953 2.9805-0.15625 1.2305 0.26953 1.9453 0.95312 2.168 2.1562 ' +
					  '0.089843 0.47266 0.29297 1.7031 0.29297 2.9844 0 1.2891-0.20703 2.5234-0.29297 2.9922-0.22656 1.2031-0.94141 1.8828-2.1719 2.1562-0.54297 0.12109-2.0547-0.17188-2.9805-0.16406-0.91797 0.007812-2.3867 0.28516-2.9648 0.16016-1.2188-0.25781-1.9297-0.94922-2.168-2.1641l-0.003906 0.007812c-0.19141-0.98047-0.29297-1.9766-0.30078-2.9766 0-1.2031 0.19141-2.3906 0.30469-2.9961 0.22656-1.1953 0.96094-1.8711 2.1602-2.1523zm-13.656 11.469c0.070312-0.35938 0.40234-1.0742 0.63672-1.5703 0.60547-1.3008 1.3594-2.9219 1.3594-4.7578s-0.75391-3.457-1.3594-4.7578c-0.23047-0.49609-0.5625-1.2109-0.63672-1.5703 0.22266-0.089844 0.8125-0.24609 ' +
					  '2.2109-0.24609 2.6445 0 4.8047 0.29688 7.0664 1.6562h-0.003906c-0.21094 0.45312-0.36719 0.93359-0.45703 1.4297-0.16016 0.84766-0.35156 2.1445-0.35156 3.4961 0.011719 1.1719 0.12891 2.3477 0.35156 3.5 0.09375 0.48047 0.23828 0.92578 0.42969 1.3359-2.0469 0.89844-4.5039 1.7305-7.0352 1.7305-1.3945 0-1.9883-0.15625-2.2109-0.24219zm7.4922 13.914-0.90234-2.2422c-0.23047-0.57031-0.81641-0.91797-1.4297-0.84375l-3.207 0.39062c1.0703-2.1953 2.9453-5.7148 5.3359-8.9531 0.03125-0.042969 0.054688-0.089844 0.078125-0.13281 1.3516-0.41797 2.6055-0.94141 3.7188-1.4609l0.003906 0.003906c0.62109 0.40234 1.3125 0.68359 2.0391 0.82031 0.13672 ' +
					  '0.027344 0.27734 0.046875 0.42969 0.058594-2.6875 3.8633-4.8242 8.9883-6.0664 12.359zm18.961-11.484c2.3125 3.0625 4.0859 6.6016 5.0781 8.8008l-3.2969-0.40234c-0.61328-0.074219-1.1992 0.27344-1.4297 0.84375l-0.88281 2.1953c-1.2148-3.3672-3.3125-8.4453-6.0625-12.332 0.097656-0.011718 0.19531-0.023437 0.28516-0.039062h0.003906c0.74219-0.14453 1.4492-0.43359 2.082-0.84766 1.2188 0.56641 2.6016 1.1445 4.1016 1.582 0.035156 0.070312 0.074219 0.13672 0.12109 0.19922zm4.7148-2.1836c-2.5664 0-5.0547-0.85156-7.1172-1.7656 0.1875-0.41797 0.32422-0.85938 0.40625-1.3125 0.12891-0.67969 0.33984-2.0352 0.33984-3.4961 0-1.457-0.21484-2.8125-0.33984-3.4883-0.082031-0.45312-0.21875-0.89453-0.40625-1.3125 2.0781-1.2344 4.2734-1.7734 7.1172-1.7734 1.3945 0 1.9883 0.15625 2.2109 0.24609-0.070313 0.35938-0.40234 1.0742-0.63672 1.5703-0.60547 1.3008-1.3594 2.9219-1.3594 4.7578s0.75391 3.457 1.3594 4.7578c0.23047 0.49609 0.5625 1.2109 0.63672 1.5703-0.22266 0.089844-0.8125 0.24219-2.2109 0.24219zm-64.25-5.2812h5.4531c0.75391 0 1.3672-0.61328 1.3672-1.3633 0-0.75391-0.61328-1.3672-1.3672-1.3672h-5.4531c-0.75391 0-1.3633 0.61328-1.3633 1.3672 0 0.75 0.60938 1.3633 1.3633 1.3633zm27.273-2.7266h-5.457c-0.75391 0-1.3633 0.60938-1.3633 1.3633 0 0.75391 0.60938 1.3633 1.3633 1.3633h5.457c0.75 0 1.3633-0.60938 1.3633-1.3633 0-0.75391-0.61328-1.3633-1.3633-1.3633zm-10.91 0h-5.457c-0.75391 0-1.3633 0.60938-1.3633 1.3633 0 0.75391 0.60938 1.3633 1.3633 1.3633h5.457c0.75391 0 1.3633-0.60938 1.3633-1.3633 0-0.75391-0.60938-1.3633-1.3633-1.3633zm-8.4258 19.281c0 0.75391 0.60937 1.3633 1.3633 1.3633 0.75391 0 1.3633-0.60937 1.3633-1.3633 0-2.5039-2.0859-4.6016-4.8672-5.1289v-0.71094c0-0.75391-0.61328-1.3633-1.3672-1.3633-0.75 0-1.3633 0.60938-1.3633 1.3633v0.71094c-2.7812 0.52734-4.8672 2.625-4.8672 5.1289 0 2.5039 2.0859 4.6055 4.8672 5.1328v4.9883c-1.2461-0.39453-2.1406-1.3008-2.1406-2.3242 0-0.75391-0.60938-1.3633-1.3633-1.3633-0.75391 0-1.3633 0.60938-1.3633 1.3633 0 2.5039 2.0859 4.6016 4.8672 5.1289v0.71094c0 0.75391 0.60938 1.3633 1.3633 1.3633s1.3633-0.60938 1.3633-1.3633v-0.71094c2.7812-0.52734 4.8672-2.625 4.8672-5.1289s-2.0859-4.6055-4.8672-5.1328v-4.9883c1.2461 0.39453 2.1406 1.3008 2.1406 2.3242zm-7.0117 0c0-1.0234 0.89453-1.9297 2.1406-2.3242v4.6484c-1.2461-0.39453-2.1406-1.3008-2.1406-2.3242zm7.0117 7.7969c0 1.0234-0.89453 1.9297-2.1406 2.3242v-4.6484c1.2461 0.39062 2.1406 1.2969 2.1406 2.3242z" fill="#1f6a93"/>'
}

//////////////////////////////
function miscSale(typ) {
	let lines = pSet.customMiscSaleDo ? 6 : 5;
	var lCancel = false;
	var lSelect = false;
	if (!typ) {
		typ = "M";
		lSelect = true;
	}
	console.log( 'misc typ:', typ, 'lSelect:', lSelect );

	$("#scanText").val('');

	vex.dialog.confirm({
		unsafeMessage: '<h3 style="margin: 10px 0px;">' + dict.miscTitle[languageVar] + '</h3>',
	    input: [
		    '<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
				    '<select id="miscSelect" name="miscSelect" size="' + lines + '">',
				        '<option value="B"' + (typ==='B' ? ' selected' : '') + '>B - ' + dict.miscBeer[languageVar] + '</option>',
				        '<option value="K"' + (typ==='K' ? ' selected' : '') + '>K - ' + dict.miscLiquor[languageVar] + '</option>',
				        '<option value="M"' + (typ==='M' ? ' selected' : '') + '>M - ' + dict.miscMisc[languageVar] + '</option>',
				        '<option value="S"' + (typ==='S' ? ' selected' : '') + '>S - ' + dict.miscSnacks[languageVar] + '</option>',
				        '<option value="V"' + (typ==='V' ? ' selected' : '') + '>V - ' + dict.miscWine[languageVar] + '</option>',
				    '</select>',
			    '</div>',
			'</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="miscPrice" class="f7Label">' + dict.Price[languageVar] + ':</label>',
					'<input class="vexF7Input" id="miscPrice" name="miscPrice" type="text" value="0.00" />',
					'<span id="priceMsg" style="color: red; margin-left: 12px; display: none;">Please enter a price.</span>',
			    '</div>',
		    '</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="miscQty" class="f7Label">' + dict.Qty[languageVar] + ':</label>',
				    '<input class="vexF7Input" id="miscQty" name="miscQty" type="text" value="1" />',
			    '</div>',
		    '</div>'
	    ].join(''),
	    className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
	    afterOpen: function () {
			var focusObj = (lSelect) ? $("#miscSelect") : $("#miscPrice");

			pauseBodyKeypress();

			if (pSet.customMiscSaleDo) {
				let html = '<option value="C">C - ' + pSet.customMiscSaleLabel + '</option>';
				$('#miscSelect').append(html);
			}
			
			new AutoNumeric('#miscPrice', { decimalPlaces: 2 });
			new AutoNumeric('#miscQty', { decimalPlaces: 0 });
			
			$('#miscSelect').val(typ);

			//$('.vex-content').css('width', '350px');
			$('.vex-content').attr('id','f6Box');
			$('.vex-content').draggable({
				stop: function( event, ui ) {focusObj.focus();}
			});
			
			$('body').on('keyup', function (e) {
				if (e.which === 66) {
					$('#miscSelect option:eq(0)').prop('selected', true);
					$("#miscSelect").change();
				} else if (e.which === 75) {
					$('#miscSelect option:eq(1)').prop('selected', true);
					$("#miscSelect").change();
				} else if (e.which === 77) {
					$('#miscSelect option:eq(2)').prop('selected', true);
					$("#miscSelect").change();
				} else if (e.which === 83) {
					$('#miscSelect option:eq(3)').prop('selected', true);
					$("#miscSelect").change();
				} else if (e.which === 86) {
					$('#miscSelect option:eq(4)').prop('selected', true);
					$("#miscSelect").change();
				} else if (e.which === 67 && pSet.customMiscSaleDo) {
					$('#miscSelect option:eq(5)').prop('selected', true);
					$("#miscSelect").change();
				} else if (e.which === 38) { // up
					switch ($("#miscSelect").prop('selectedIndex')) {
						case 1:
							$('#miscSelect option:eq(0)').prop('selected', true);
							break;
						case 2:
							$('#miscSelect option:eq(1)').prop('selected', true);
							break;
						case 3:
							$('#miscSelect option:eq(2)').prop('selected', true);
							break;
						case 4:
							$('#miscSelect option:eq(3)').prop('selected', true);
							break;
						case 5:
							$('#miscSelect option:eq(4)').prop('selected', true);
					};
					$("#miscSelect").change();
				} else if (e.which === 40) { // down
					switch ($("#miscSelect").prop('selectedIndex')) {
						case 0:
							$('#miscSelect option:eq(1)').prop('selected', true);
							break;
						case 1:
							$('#miscSelect option:eq(2)').prop('selected', true);
							break;
						case 2:
							$('#miscSelect option:eq(3)').prop('selected', true);
							break;
						case 3:
							$('#miscSelect option:eq(4)').prop('selected', true);
							break;
						case 4:
							if (pSet.customMiscSaleDo) {
								$('#miscSelect option:eq(5)').prop('selected', true);
							}
					};
					$("#miscSelect").change();
				};
			});

			$('#miscSelect').on('change', '', function(e) {
				setTimeout( function() { $("#miscPrice").focus(); $("#miscPrice").select(); },0)
			});
			
			setTimeout( function() {
				$("body").on("keyup", function(e) { if (e.which === 27) lCancel = true; } );
				$("button.vex-dialog-button-secondary").on("mouseup",function(){ console.log("cancel click"); lCancel = true; });
				$("#expenseAmount").focus().select();
			}, 100 );

			setTimeout( function() { focusObj.focus(); }, 0 );
		},
		beforeClose: function() {
			if (Number( $("#miscPrice").val() ) !== 0 || lCancel) return true;
			$("#priceMsg").show();
			playBuzzer();
			setTimeout( function() { $("#miscPrice").focus().select(); }, 1 );
			return false;
		},
		callback: function (data) {
			if (!data || lCancel) {
				let an1 = AutoNumeric.getAutoNumericElement( document.querySelector('#miscPrice') );
				let an2 = AutoNumeric.getAutoNumericElement( document.querySelector('#miscQty') );
				an1.remove();
				an2.remove();
				resetBodyKeypress();
				return;
			}
			var miscItem = {};
			if (data.miscSelect === 'B') {
				miscItem.type    = "60";
				miscItem.brand   = dict.miscBeer[languageVar].toUpperCase();
				miscItem.descrip = dict.miscMisc[languageVar].toUpperCase();
				miscItem.codenum = "BEER";
				miscItem.tax     = (pSet.miscTaxB1==='Y' || pSet.miscTaxB2==='Y' || pSet.miscTaxB3==='Y' || pSet.miscTaxB1==='1' || pSet.miscTaxB2==='1' || pSet.miscTaxB3==='1') ? 'T' : 'N';
			} else if (data.miscSelect === 'K') {
				miscItem.type    = "K";
				miscItem.brand   = dict.miscLiquor[languageVar].toUpperCase();
				miscItem.descrip = dict.miscMisc[languageVar].toUpperCase();
				miscItem.codenum = "LIQUOR";
				miscItem.tax     = (pSet.miscTaxK1==='Y' || pSet.miscTaxK2==='Y' || pSet.miscTaxK3==='Y' || pSet.miscTaxK1==='1' || pSet.miscTaxK2==='1' || pSet.miscTaxK3==='1') ? 'T' : 'N';
			} else if (data.miscSelect === 'M') {
				miscItem.type    = "59";
				miscItem.brand   = "MISC";
				miscItem.descrip = dict.Item[languageVar].toUpperCase();
				miscItem.codenum = "MISC";
				miscItem.tax     = (pSet.miscTaxM1==='Y' || pSet.miscTaxM2==='Y' || pSet.miscTaxM3==='Y' || pSet.miscTaxM1==='1' || pSet.miscTaxM2==='1' || pSet.miscTaxM3==='1') ? 'T' : 'N';
			} else if (data.miscSelect === 'S') {
				miscItem.type    = "02";
				miscItem.brand   = dict.miscSnacks[languageVar].toUpperCase();
				miscItem.descrip = dict.miscMisc[languageVar].toUpperCase();
				miscItem.codenum = "SNACK";
				miscItem.tax     = (pSet.miscTaxS1==='Y' || pSet.miscTaxS2==='Y' || pSet.miscTaxS3==='Y' || pSet.miscTaxS1==='1' || pSet.miscTaxS2==='1' || pSet.miscTaxS3==='1') ? 'T' : 'N';
			} else if (data.miscSelect === 'V') {
				miscItem.type    = "V";
				miscItem.brand   = dict.miscWine[languageVar].toUpperCase();
				miscItem.descrip = dict.miscMisc[languageVar].toUpperCase();
				miscItem.codenum = "WINE";
				miscItem.tax     = (pSet.miscTaxV1==='Y' || pSet.miscTaxV2==='Y' || pSet.miscTaxV3==='Y' || pSet.miscTaxV1==='1' || pSet.miscTaxV2==='1' || pSet.miscTaxV3==='1') ? 'T' : 'N';
			} else if (data.miscSelect === 'C' && pSet.customMiscSaleDo) {
				miscItem.type    = pSet.customMiscSaleType;
				miscItem.brand   = pSet.customMiscSaleLabel.toUpperCase();
				miscItem.descrip = dict.miscMisc[languageVar].toUpperCase();
				miscItem.codenum = "CUSTMISC";
				miscItem.tax     = (pSet.miscTaxC1==='Y' || pSet.miscTaxC2==='Y' || pSet.miscTaxC3==='Y' || pSet.miscTaxC1==='1' || pSet.miscTaxC2==='1' || pSet.miscTaxC3==='1') ? 'T' : 'N';
			}

			miscItem.size = "";
			miscItem.pack = 1;
			miscItem.price = Number( data.miscPrice );
			miscItem.barcode = "";
			miscItem.depo = 0;
			miscItem.pool = 0;

			let an1 = AutoNumeric.getAutoNumericElement( document.querySelector('#miscPrice') );
			let an2 = AutoNumeric.getAutoNumericElement( document.querySelector('#miscQty') );
			miscItem.price = an1.getNumber();
			miscItem.qty = an2.getNumber();
			an1.remove();
			an2.remove();

			resetBodyKeypress();
			saleItemAdd( miscItem, miscItem.qty );
		}
	});
}

//////////////////////////////
function doLotto() {

	vex.dialog.confirm({
		unsafeMessage: '<h3 style="margin: 10px 0px;">' + dict.lottoTitle[languageVar] + '</h3>',
	    input: [
		    '<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
				    '<select id="lottoSelect" name="lottoSelect" size="4">',
				        '<option value="LO" selected>A. ' + dict.lottoSale[languageVar] + '</option>',
				        '<option value="IS">B. ' + dict.instantSale[languageVar] + '</option>',
				        '<option value="LP">C. ' + dict.lottoPayout[languageVar] + '</option>',
				        '<option value="IP">D. ' + dict.instantPayout[languageVar] + '</option>',
				    '</select>',
			    '</div>',
			'</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="lottoPrice" class="f7Label">' + dict.Price[languageVar] + ':</label>',
				    '<input class="vexF7Input" id="lottoPrice" name="lottoPrice" type="text" value="1.00" />',
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

			$('body').on('keyup', function (e) {
				if (e.which===65) {
					$('#lottoSelect option:eq(0)').prop('selected', true);
				} else if (e.which===66) {
					$('#lottoSelect option:eq(1)').prop('selected', true);
				} else if (e.which===67) {
					$('#lottoSelect option:eq(2)').prop('selected', true);
			    } else if (e.which===68) {
				    $('#lottoSelect option:eq(3)').prop('selected', true);
				} else if (e.which===38) { // up
					switch ($("#lottoSelect").prop('selectedIndex')) {
						case 1:
							$('#lottoSelect option:eq(0)').prop('selected', true);
							break;
						case 2:
							$('#lottoSelect option:eq(1)').prop('selected', true);
							break;
						case 3:
						    $('#lottoSelect option:eq(2)').prop('selected', true);
					};
					$("#lottoSelect").change();
				} else if (e.which===40) { // down
					switch ($("#lottoSelect").prop('selectedIndex')) {
						case 0:
							$('#lottoSelect option:eq(1)').prop('selected', true);
							break;
						case 1:
							$('#lottoSelect option:eq(2)').prop('selected', true);
							break;
						case 2:
						    $('#lottoSelect option:eq(3)').prop('selected', true);
					};
					$("#lottoSelect").change();
				};
			});

			$('#lottoSelect').on('change', '', function(e) {
				setTimeout( function() { $("#lottoPrice").focus(); $("#lottoPrice").select(); },0)
			});
			
			new AutoNumeric('#lottoPrice', { decimalPlaces: 2 });
			
			$('.vex-content').attr('id','f6Box');
			$('.vex-content').draggable({
				stop: function( event, ui ) {$("#lottoPrice").focus();}
			});
			
			setTimeout( function() { $("#lottoPrice").focus(); }, 0 );
	    },
		afterClose: function() {
			resetBodyKeypress();
		},
		callback: function (data) {
			if (!data) {
				resetBodyKeypress();
				return;
			}
			var lottoItem = {};
			lottoItem.price = Number( data.lottoPrice );
			lottoItem.descrip = "";
			if (data.lottoSelect === 'LO') {
				lottoItem.type    = "LO";
				lottoItem.brand   = dict.lottoSale[languageVar].toUpperCase();
				lottoItem.codenum = "LOTTSALE";
			} else if (data.lottoSelect === 'IS') {
				lottoItem.type    = "IS";
				lottoItem.brand   = dict.instantSale[languageVar].toUpperCase();
				lottoItem.codenum = "INSTSALE";
			} else if (data.lottoSelect === 'LP') {
				lottoItem.type    = "LP";
				lottoItem.brand   = dict.lottoPayout[languageVar].toUpperCase();
				lottoItem.codenum = "LOTTPAY";
				lottoItem.price = -lottoItem.price;
			} else if (data.lottoSelect === 'IP') {
				lottoItem.type    = "IP";
				lottoItem.brand   = dict.instantPayout[languageVar].toUpperCase();
				lottoItem.codenum = "INSTPAY";
				lottoItem.price = -lottoItem.price;
			}

			lottoItem.size = "";
			lottoItem.pack = 1;
			lottoItem.barcode = "";
			lottoItem.depo = 0;
			lottoItem.tax = 'N';

			resetBodyKeypress();
			saleItemAdd( lottoItem, 1 );
		}
	})
}

function itemReturn( xRow, lUndo ) {
	secureCheck("ZWSRF", "itemReturnDo", xRow );
}

function itemReturnDo(xRow, lUndo=false) {
	console.log('** itemReturn **', "xRow =", xRow, "lUndo = ", lUndo);
	var aR = [currLine];
	var lPos = false;
	var over = $("#securityOverrideOK").attr("data-overUID");

	if (over==="" || over===undefined) {
		over = uid
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	if (typeof xRow === 'undefined') {
		aR = [currLine];
	} else if (typeof xRow === 'number') {
		aR = [xRow];
	} else if (typeof xRow === 'string') {
		aR = xRow.split(",").map(Number);
	}

	refundLast = aR;

	console.log("refund aR = ", aR);

	$.each(aR, function (idx, nR) {
		var index = nR - 1;
		var nDiscX = (100 - dataSet.data[index].disc) / 100;

		dataSet.data[index].qty = -dataSet.data[index].qty;
		dataSet.data[index].total = Number((nDiscX * (dataSet.data[index].qty * dataSet.data[index].price)).toFixed(2));

		localStorage.setItem('dataSet', JSON.stringify(dataSet));

		if (dataSet.data[index].qty >= 0) {
			console.log("setting str to ' un'");
			lPos = true;
		}

		$.post('salesLineRefund?', {
			qty: dataSet.data[index].qty,
			pric: dataSet.data[index].price,
			codenum: dataSet.data[index].codenum,
			barc: dataSet.data[index].barcode,
			uid: over,
			register: drawer,
			brand: dataSet.data[index].brand
		});
	});

	saleTableUpdateRow(aR);

	var chtml;
	var len = aR.length;
	var time = 8000;

	if (lPos && !lUndo) {
		chtml = '<span class="messageText">' + len + " " + dict.refUndone[languageVar] + ". " + '</span><a role="button" href="#" onclick="refundLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
	} else if (!lUndo) {
		if (len === 1 && !lUndo) {
			chtml = '<span class="messageText">' + dict.Line[languageVar] + " " + aR[0] + " " + dict.refUndoSingle[languageVar]  + ". " + 
			        '</span><a role="button" href="#" onclick="refundLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
		} else if (!lUndo) {
			chtml = '<span class="messageText">' + len + " " + dict.refUndoMulti[languageVar] + ". " + 
			        '</span><a role="button" href="#" onclick="refundLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
		}
	} else if (lUndo) {
		chtml = '<span class="messageText">' + dict.refUndone[languageVar] + '. </span><span class="messageClose" onclick="messageRemove();">&times;</span>';
		time = 3000;
	}

	$(document).message({ content: chtml, html: true, expire: time });

	updateTotalBox();
}

function refundLastUndo() {
	console.log( "***** REFUND UNDO *****");
	console.log( "refundLast:", refundLast )

	messageRemove();

	if (!refundLast) return;

	itemReturn( refundLast, true );
}

function itemReturnDialog(nRow) {
	var over = $("#securityOverrideOK").attr("data-overUID");

	if (over==="" || over===undefined) {
		over = uid
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	if (!nRow) {
		nRow = currLine;
	}

	vex.dialog.open({
		input: [
			'<h3>' + dict.Refunds[languageVar] + '</h3>',
			'<fieldset>',
			    '<legend>&nbsp;' + dict.Mode[languageVar] + '&nbsp;</legend>',
			    '<div id="refModeBox">',
					'<br>',
					    '<label class="vexRadioBox">' + dict.refundSingleLine[languageVar] + '.',
			            '<input class="vexRadioInput" type="radio" checked="checked" name="refRadio" value="single">',
			            '<span class="vexRadioButton"></span>',
			        '</label><br>',
			        '<label class="vexRadioBox">' + dict.refundAllLines[languageVar] + '.',
			            '<input class="vexRadioInput" type="radio" name="refRadio" value="all">',
			            '<span class="vexRadioButton"></span>',
			        '</label>',
			    '</div>',
			'</fieldset>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="refLineNbr" class="refLabel">' + dict.LineNbr[languageVar] + ':</label>',
			        '<input class="vexF7Input" id="refLineNbr" name="refLineNbr" type="text"/>',
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

			let an = new AutoNumeric('#refLineNbr', { decimalPlaces: 0 });
			$('.vex-content').draggable();

			console.log('dataSet length', dataSet.data.length);

			if (dataSet.data.length === 1) {
				$("#refModeBox").css("color", "darkgray");
				$("label[for='refLineNbr']").css("color", "darkgray");
				$(".vexRadioInput").attr("disabled", true);
				$("#refLineNbr").attr("disabled", true);
				an.set(1);
			} else {
				an.set(currLine);
				setTimeout(function() {
					$("#refLineNbr").focus().select();
				}, 25);
			}
		},
		callback: function (data) {
			var rowObj;
			if (!data) {
				resetBodyKeypress();
				return;
			} else if (data.refRadio === 'single') {
				var nRow = data.refLineNbr;
				var index = nRow - 1;
				var nDiscX = ( ( 100 - dataSet.data[index].disc ) / 100 );
				dataSet.data[index].qty = -dataSet.data[index].qty;
				dataSet.data[index].total = Number( ( nDiscX * ( dataSet.data[index].qty * dataSet.data[index].price ) ).toFixed(2) );
			
				localStorage.setItem( 'dataSet', JSON.stringify(dataSet) );
				currLine = nRow;
			
				$.post( 'salesLineRefund?', { 
					qty: dataSet.data[index].qty,
					pric: dataSet.data[index].price, 
					codenum: dataSet.data[index].codenum, 
					barc: dataSet.data[index].barcode, 
					uid: over, 
					register: drawer, 
					brand: dataSet.data[index].brand
				});

				saleTableUpdateRow( nRow );

			} else {
				var aLog = [];
				var rowObj;
				var nDiscX;

				$.each( dataSet.data, function( idx, val ) {
					aLog.push( [ 
						dataSet.data[idx].price, 
						nDiscX * dataSet.data[idx].price, 
						dataSet.data[idx].codenum, 
						dataSet.data[idx].qty, 
						dataSet.data[idx].barcode
					] );

				    nDiscX = ( ( 100 - dataSet.data[idx].disc ) / 100 );
					dataSet.data[idx].qty = -dataSet.data[idx].qty;
					dataSet.data[idx].total = Number( ( nDiscX * ( dataSet.data[idx].qty * dataSet.data[idx].price ) ).toFixed(2) );

					$.post( 'salesLineRefund?', { 
						qty: dataSet.data[idx].qty,
						pric: dataSet.data[idx].price, 
						codenum: dataSet.data[idx].codenum, 
						barc: dataSet.data[idx].barcode, 
						uid: over, 
						register: drawer,
						brand: dataSet.data[idx].brand
					});

					saleTableUpdateRow( idx + 1 )
					
				})

				localStorage.setItem( 'dataSet', JSON.stringify(dataSet) );
				currLine = dataSet.data.length;
			
			}

			resetBodyKeypress();
			updateTotalBox();
			paintCurrentLine();
		}
	});
}

function F5Delete(nRow) {
	if (dataSet.data.length === 0) {
		return;
	}
	if (!nRow || nRow==='undefined') {
		nRow = currLine;
	}
	var index = nRow - 1;
	var rowData = dataSet.data[index];

	vex.dialog.confirm({
		unsafeMessage: '<h3>' + dict.f5Title[languageVar] + '</h3><br>'+ dict.f5Prompt[languageVar] + ' ' + nRow + ' ?',
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
				saleTableDeleteRow( nRow );
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
		dataSet.data.splice(index, 0, item);
	});

	saleTableRenumberData();
	saleTableLoadData();
	paintCurrentLine();
	updateTotalBox();

	var chtml = '<span class="messageText">' + dict.delUndone[languageVar] + '.</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
	$(document).message({ content: chtml, html: true, expire: 3000 });

}

/**
  * detects click on editable cells on sales screen
  */
 function saleTableCellClick() {
	const editableSelector = 'td:nth-child(n+5):nth-child(-n+10)';
	$('#saleTableBody').off('click.saleCellEdit', editableSelector).on('click.saleCellEdit', editableSelector, function (e) {
		e.stopPropagation();
		console.log('cell clicked');
		lPauseKeys = true;
		shortcutToggleFKeys('off');
		var cell = $(this);
		var idx = $(this).index();
		var row = $(this).parents('tr').index();
		paintCurrentLine(row+1);
		saleTableCellEdit(cell, idx, row);
	});
}

/**
  * Sets up clicked cell with input for editing content.
  * @param {Object} cell The cell being edited.
  * @param {Number} idx  The index of the cell.
  * @param {Number} row  The index of the parent row.
  */
 function saleTableCellEdit( cell, idx, row ) {
	var wide = cell.width() - 4; // allow for border
	var html = cell.html();
	var input;
	//--- no edits allowed on gift certs ---
	if (dataSet.data[row].codenum === "GIFTCERT") {
		playError();
		focusBarc();
		return;
	}
	// No discounts on coupons, payments or promo items if option is set
	if (idx===5 && (dataSet.data[row].codenum === 'CPN' || dataSet.data[row].codenum === 'Payments' ||
		(!pSet.discOnPromo && !isKeyEmpty( dataSet.data[row], 'promo') ) ) ) {
			resetBodyKeypress();
			playBuzzer();
			let chtml = '<span class="messageText">Can not discount item.' + 
					      '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
			$(document).message({ content: chtml, html: true, expire: 3000 });
			saleTableCellClick();
			shortcutToggleFKeys('on');
			lPauseKeys = false;
			return;
	}

	if( idx===8 ) {
		input = $('<select id="clickEdit" style="max-width: '+ wide +'px">' +
		          '<option value="T">T</option>' + 
				  '<option value="N">N</option>' + 
				  '<option value="E">E</option>' + 
				  '<option value="1">1</option></select>');
	} else {
	    input = $('<input type="text" id="clickEdit" style="max-width: '+ wide +'px" />');
	}

	if (html.indexOf('input')>-1 || html.indexOf('select')>-1) {
		console.log( "! Input already exists !" );
		return;
	}

	console.log( 'cellEdit row:', row, 'cell:', idx );

//	paintCurrentLine( row + 1 );

	input.val(html);
	cell.css({padding: '4px 5px 4px 3px'});
	cell.html(input);
    switch (idx) {
		case 4:
		new AutoNumeric('#clickEdit', { decimalPlaces: 0, digitGroupSeparator: "" });
		break;

		case 5:
		case 6:
		case 7:
		new AutoNumeric('#clickEdit', { decimalPlaces: 2, digitGroupSeparator: "" });
		break;

		case 9:
		new AutoNumeric('#clickEdit', { decimalPlaces: 3, digitGroupSeparator: "" });
	}

	input.off('keypress').on('keypress', function(e) {
		console.log('input keypress:',e.which);
		if (e.which === 13) {
			e.preventDefault();
			e.stopPropagation();
			saleTableCellEditSave( $(this), idx, row );
		} else if (e.which === 27) {
			e.preventDefault();
			e.stopPropagation();
			saleTableCellClose();
		}
	});
	input.on('focus', function() { 
		var save_this = $(this);
		window.setTimeout (function(){ 
		   save_this.select(); 
		},10);
	});

	input.on('blur', function() {
		saleTableCellClose();  // $(this), idx, row );
	})

	input.focus();

}

function saleTableCellEditSave(input, idx, row) {
	var newVal = input.val();
	var editVar;
	var oldQty = dataSet.data[row].qty;
	var oldPrice = dataSet.data[row].price;
	var oldDisc = dataSet.data[row].disc;
	var oldTax = dataSet.data[row].tax;
	var oldDepo = dataSet.data[row].depo;
	var cell = input.parent();
	var over = $("#securityOverrideOK").attr("data-overUID");
	let newPrice;

	if (over === "" || over === undefined) {
		over = uid
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	console.log('cellEditSave newVal:', newVal, 'cell:', idx, 'row:', row);

	switch (idx) {
		case 4:
			let newQty = parseInt(newVal, 10)
			if (newQty >= 0) {
				dataSet.data[row].qty = newQty;
				editVar = "qty";
			} else {
				playBuzzer();
				editVar = "NO";
				let chtml = '<span class="messageText">' + dict.actionDenied[languageVar] +
					'</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: chtml, html: true, expire: 3000 });
			}
			newPrice = newQty;
			break;

		case 5:
			if (dataSet.data[nRow].codenum === 'CPN' || dataSet.data[nRow].codenum === 'Payments' ||
				(!pSet.discOnPromo && !isKeyEmpty( dataSet.data[nRow], 'promo') ) ) {
					resetBodyKeypress();
					playBuzzer();
					let chtml = '<span class="messageText">Can not discount item.' + 
					            '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
					$(document).message({ content: chtml, html: true, expire: 3000 });
					return;
			}
			oldPrice = oldDisc;
			dataSet.data[row].disc = Number(newVal);
			newPrice = dataSet.data[row].disc;
			editVar = "disc";
			break;

		case 6:
			editVar = "price";
console.log('F6Edit, price change, oldPrice:', oldPrice, 'newVal:', newVal);

			let nPrice = Number(newVal);
			if (nPrice < 0) {
				playBuzzer();
				editVar = "NO";
				let chtml = '<span class="messageText">' + dict.actionDenied[languageVar] +
					'</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: chtml, html: true, expire: 3000 });
				return;
			} else if (pSet.f6AsDisc) {
				let nPerc = 100 * (1 - (nPrice / dataSet.data[row].price));
				let cDisc = nPerc.toFixed(2);
				dataSet.data[row].disc = Number(cDisc);
				newPrice = nPrice;
			} else {
				dataSet.data[row].price = nPrice;
				newPrice = nPrice;
			}

			//---- prompt to make this a permanent price change
			//---- if yes, post to server
			let miscCodenums = "MISC BEER LIQUOR SNACK WINE CUSTMISC"
			if (pSet.askF6Permanent && !miscCodenums.includes(dataSet.data[row].codenum.trim())) {
				vex.dialog.confirm({
					unsafeMessage: '<h3>' + dict.f6PermanentTitle[languageVar] + '</h3><br>' + dict.f6PermanentPrompt[languageVar],
					className: 'vex-theme-multiButtons',
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, { text: dict.Yes[languageVar] }),
						$.extend({}, vex.dialog.buttons.NO, { text: dict.No[languageVar] })
					],
					afterOpen: function () {
						pauseBodyKeypress();
						lPauseKeys = true;
					},
					callback: function (value) {
						if (value) {
							$.post("permanentPriceEdit?", {
								codenum: dataSet.data[row].codenum,
								brand: dataSet.data[row].brand,
								oldValue: oldPrice,
								newValue: newPrice,
								oldDisc: oldDisc,
								uid: over,
								drawer: drawer,
								field: "price"
							});
							priceEditItemListData(dataSet.data[row].codenum, newPrice);
						}
						resetBodyKeypress();
						lPauseKeys = false;
					}
				});
				//---- make zero price changes permanent immediately if setting enabled
			} else if (oldPrice === 0 && pSet.makeF6Permanent) {
				$.post("permanentPriceEdit?", {
					codenum: dataSet.data[row].codenum,
					brand: dataSet.data[row].brand,
					oldValue: oldPrice,
					newValue: newPrice,
					uid: over,
					drawer: drawer,
					field: "price"
				});
				priceEditItemListData(dataSet.data[row].codenum, newPrice);
			}

			break;

		case 7:
			editVar = "total";
			let nTot = Number(newVal);
			if (nTot < 0) {
				playBuzzer();
				editVar = "NO";
				let chtml = '<span class="messageText">' + dict.actionDenied[languageVar] +
					'</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: chtml, html: true, expire: 3000 });
			} else if (pSet.f6AsDisc) {
				dataSet.data[row].total = nTot;
				let nPric = dataSet.data[row].total / dataSet.data[row].qty;
				var nPerc = 100 * (1 - (nPric / dataSet.data[row].price));
				var cDisc = nPerc.toFixed(2);
				dataSet.data[row].disc = Number(cDisc);
				newPrice = nPric;
			} else {
				dataSet.data[row].total = nTot;
				dataSet.data[row].price = Number((dataSet.data[row].total / dataSet.data[row].qty).toFixed(2));
				newPrice = dataSet.data[row].price;
			}

			if (pSet.askF6Permanent) {
				// 		prompt to make this a permanent price change
				//			if yes, post to server
				vex.dialog.confirm({
					unsafeMessage: '<h3>' + dict.f6PermanentTitle[languageVar] + '</h3><br>' + dict.f6PermanentPrompt[languageVar],
					className: 'vex-theme-multiButtons',
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, { text: dict.Yes[languageVar] }),
						$.extend({}, vex.dialog.buttons.NO, { text: dict.No[languageVar] })
					],
					afterOpen: function () {
						pauseBodyKeypress();
						lPauseKeys = true;
					},
					callback: function (value) {
						if (value) {
							$.post("permanentPriceEdit?", {
								codenum: dataSet.data[row].codenum,
								brand: dataSet.data[row].brand,
								oldValue: oldPrice,
								newValue: newPrice,
								oldDisc: oldDisc,
								uid: over,
								drawer: drawer,
								field: "price"
							});
							priceEditItemListData(dataSet.data[row].codenum, newPrice);
						}

						resetBodyKeypress();
						lPauseKeys = false;
					}
				});
				//---- make zero price changes permanent immediately if setting enabled
			} else if (oldPrice === 0 && pSet.makeF6Permanent) {
				$.post("permanentPriceEdit?", {
					codenum: dataSet.data[row].codenum,
					brand: dataSet.data[row].brand,
					oldValue: oldPrice,
					newValue: newPrice,
					uid: over,
					drawer: drawer,
					field: "price"
				});
				priceEditItemListData(dataSet.data[row].codenum, newPrice);
			}
			break;

		case 8:
			dataSet.data[row].tax = newVal;
			editVar = "tax";

			// prompt to make this a permanent price change
			//	if yes, post to server
			if (pSet.askF6Permanent) {
				vex.dialog.confirm({
					unsafeMessage: '<h3>' + dict.f6PermanentTitle[languageVar] + '</h3><br>' + dict.f6PermanentPrompt[languageVar],
					className: 'vex-theme-multiButtons',
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, { text: dict.Yes[languageVar] }),
						$.extend({}, vex.dialog.buttons.NO, { text: dict.No[languageVar] })
					],
					afterOpen: function () {
						pauseBodyKeypress();
						lPauseKeys = true;
					},
					callback: function (value) {
						if (value) {
							$.post("permanentPriceEdit?", {
								codenum: dataSet.data[row].codenum,
								brand: dataSet.data[row].brand,
								oldValue: oldTax,
								newValue: newVal,
								uid: over,
								drawer: drawer,
								field: "tax"
							});
							priceEditItemListData(dataSet.data[row].codenum, newVal);
						}
						resetBodyKeypress();
						lPauseKeys = false;
					}
				});
			}
			break;

		case 9:
			dataSet.data[row].depo = Number(newVal);
			editVar = "deposit";

			// prompt to make this a permanent price change
			//	if yes, post to server
			if (pSet.askF6Permanent) {
				vex.dialog.confirm({
					unsafeMessage: '<h3>' + dict.f6PermanentTitle[languageVar] + '</h3><br>' + dict.f6PermanentPrompt[languageVar],
					className: 'vex-theme-multiButtons',
					buttons: [
						$.extend({}, vex.dialog.buttons.YES, { text: dict.Yes[languageVar] }),
						$.extend({}, vex.dialog.buttons.NO, { text: dict.No[languageVar] })
					],
					afterOpen: function () {
						pauseBodyKeypress();
						lPauseKeys = true;
					},
					callback: function (value) {
						if (value) {
							$.post("permanentPriceEdit?", {
								codenum: dataSet.data[row].codenum,
								brand: dataSet.data[row].brand,
								oldValue: oldDepo,
								newValue: newVal,
								uid: over,
								drawer: drawer,
								field: "depo"
							});
							priceEditItemListData(dataSet.data[row].codenum, newVal);
						}
						resetBodyKeypress();
						lPauseKeys = false;
					}
				});
			}

			break;
	}

	if (editVar === "NO") {
		input.remove();
		cell.css({ padding: '' });

		saleTableUpdateRow(row + 1);

		paintCurrentLine();
		updateTotalBox();
		saleTableCellClick();
		shortcutToggleFKeys('on');
		lPauseKeys = false;

		return;
	}

	var dataObj = cloneObj(dataSet.data[row]);
	delete dataObj.promo;

	console.log("in saleslineedit, over:", over);
	$.post("salesLineEdit?", {
		newLine: JSON.stringify(dataObj),
		editVar: editVar,
		oldQty: oldQty,
		oldPrice: oldPrice,
		newPrice: newPrice,
		oldDisc: oldDisc,
		uid: over,
		register: drawer,
		brand: dataSet.data[row].brand
	});

	if (editVar !== 'total') {
		var nDisc = (dataSet.data[row].disc == null) ? 0 : dataSet.data[row].disc
		var nDiscX = ((100 - nDisc) / 100);

		//---- recalculate total
		dataSet.data[row].total = Number((nDiscX * (dataSet.data[row].qty * dataSet.data[row].price)).toFixed(2));
		localStorage.setItem('dataSet', JSON.stringify(dataSet));
	}

	input.remove();
	cell.css({ padding: '' });

	saleTableUpdateRow(row + 1);

	paintCurrentLine();
	updateTotalBox();
	saleTableCellClick();
	shortcutToggleFKeys('on');
	lPauseKeys = false;
}

function saleTableCellClose() {
	var val  = $("#clickEdit").val();
	var cell = $("#clickEdit").parent();

	cell.html( val );
	$("#clickEdit").remove();
	cell.css({padding: ''});

	saleTableCellClick();
	shortcutToggleFKeys('on');
	lPauseKeys = false;
}

/**
 * 
 * @param {*} codenum 
 * @param {*} newPrice 
 */
function priceEditItemListData(codenum, newPrice) {
	//	update the itemList with new price
	const obj = itemListData.data.find(item => item.codenum === codenum);
	if (obj) {
		obj.price = newPrice;
	}
}

function F6Edit(nRow) {
	if (dataSet.data.length === 0) {
		return;
	}
	if (nRow===undefined || nRow===null || isNaN(Number(nRow))) {
		nRow = currLine;
	}
	if (dataSet.data[nRow-1].codenum === "GIFTCERT") {
		playError();
		focusBarc();
		return;
	}
console.log("In F6Edit, nRow:", nRow, "currLine:", currLine, "truth:", (nRow===undefined || nRow===null), "type:", typeof nRow, "nbr:", Number(nRow));
	vex.dialog.confirm({
		unsafeMessage: [
			'<h3 style="margin: 10px 0px;">' + dict.f6Title[languageVar] + '</h3>',
			'<span style="font-size: 14px;">',
			dataSet.data[nRow-1].item,
			'</span>',	
		].join(''),
	    input: [
		    '<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
				    '<select id="f6FieldSelect" name="f6Edit" size="6">',
				        '<option value="qty" selected>' + dict.f6Qty[languageVar] + '</option>',
				        '<option value="disc">' + dict.f6Disc[languageVar] + '</option>',
				        '<option value="price">' + dict.Price[languageVar] + '</option>',
				        '<option value="total">' + dict.Total[languageVar] + '</option>',
				        '<option value="tax">' + dict.Tax[languageVar] + '</option>',
				        '<option value="depo">' + dict.Dep[languageVar] + '</option>',
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
			} else if (data.f6Edit === 'qty') {
				setTimeout(function () { $('#saleTableBody tr:nth-child(' + nRow + ') td:nth-child(5)').trigger("click"); }, 20);
			} else if (data.f6Edit === 'disc') {
				setTimeout(function () { $('#saleTableBody tr:nth-child(' + nRow + ') td:nth-child(6)').trigger("click"); }, 20);
			} else if (data.f6Edit === 'price') {
				setTimeout(function () { $('#saleTableBody tr:nth-child(' + nRow + ') td:nth-child(7)').trigger("click"); }, 20);
			} else if (data.f6Edit === 'total') {
				setTimeout(function () { $('#saleTableBody tr:nth-child(' + nRow + ') td:nth-child(8)').trigger("click"); }, 20);
			} else if (data.f6Edit === 'tax') {
				setTimeout(function () { $('#saleTableBody tr:nth-child(' + nRow + ') td:nth-child(9)').trigger("click"); }, 20);
			} else if (data.f6Edit === 'depo') {
				setTimeout(function () { $('#saleTableBody tr:nth-child(' + nRow + ') td:nth-child(10)').trigger("click"); }, 20);
			}
			resetBodyKeypress();
			return;
		}
	})
}

function pauseBodyKeypress() {
	lPauseKeys = true;
	shortcutToggleFKeys('off');
	console.log('body keypress paused, lPauseKeys = ', lPauseKeys);
}

function resetBodyKeypress() {
	lPauseKeys = false;
	$('body').off('keyup');  // might be set in certain vex instances
	shortcutToggleFKeys('on');
	console.log('body keypress resumed, lPauseKeys = ', lPauseKeys);
	//setTimeout( function(){ $("#scanText").focus().select(); }, 10 );
}

function F7Disc(nLine) {
	var over = $("#securityOverrideOK").attr("data-overUID");

	if (over==="" || over===undefined) {
		over = uid
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	if (dataSet.data.length === 0) {
		return;
	}

	vex.dialog.open({
		input: [
			'<h3>' + dict.f7Title[languageVar] + '</h3>',
			'<fieldset>',
			'<legend>&nbsp;' + dict.Mode[languageVar] + '&nbsp;</legend>',
			'<div id="f7ModeBox">',
				'<br><label class="vexRadioBox">' + dict.f7SingleLine[languageVar] + '.',
					'<input class="vexRadioInput" type="radio" checked="checked" name="f7Radio" value="single" data-nline="' + nLine + '">',
					'<span class="vexRadioButton"></span>',
				'</label><br>',
				'<label class="vexRadioBox">' + dict.f7AllLines[languageVar] + '.',
					'<input class="vexRadioInput" type="radio" name="f7Radio" value="all">',
					'<span class="vexRadioButton"></span>',
				'</label>',
			'</div>',
			'</fieldset>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="f7Percent" class="f7Label">' + dict.Percent[languageVar] + ':</label>',
				    '<input class="vexF7Input" id="f7Percent" name="f7Percent" type="text" value="0.00" />',
			    '</div>',
		    '</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="f7LineNbr" class="f7Label">' + dict.LineNbr[languageVar] + ':</label>',
				    '<input class="vexF7Input" id="f7LineNbr" name="f7LineNbr" type="text" value="' + currLine + '" />',
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
			let nLine = Number( $("input[name='f7Radio']:checked").data('nline') );
			console.log("in F7 afterOpen, nLine:", nLine);

			new AutoNumeric('#f7Percent', AutoNumeric.getPredefinedOptions().percentageUS2dec);
			new AutoNumeric('#f7LineNbr', { decimalPlaces: 0 });
			$('.vex-content').draggable();

			console.log('dataSet length',dataSet.data.length, 'nLine:', nLine);
			
			if (dataSet.data.length === 1 || nLine) {
				$("#f7ModeBox").css("color","#eee");
				$("label[for='f7LineNbr']").css("color","#eee");
				$(".vexRadioInput").attr("disabled",true);
				$("#f7LineNbr").attr("disabled",true);
				$("#f7Percent").focus();
			}
		},
		callback: function (data) {
			var rowObj;
			let an1 = AutoNumeric.getAutoNumericElement('#f7Percent');
			let an2 = AutoNumeric.getAutoNumericElement('#f7LineNbr');
			gBarDiscLast = [];

			if (!data) {
				resetBodyKeypress();
				an1.remove();
				an2.remove();
				return;
			} else if (data.f7Radio==='single') {
				var nDisc = Number( data.f7Percent.replace('%','') );
				var nDiscX = ( ( 100 - nDisc ) / 100 );
				var nRow = Number( data.f7LineNbr ) - 1;

				console.log( 'data:', data );
				console.log( 'single', nDisc, nDiscX, nRow);

				if (nDisc === 0) {
					nDisc = null;
				}

				// can't discount coupon, payment
				if (dataSet.data[nRow].codenum === 'CPN' || dataSet.data[nRow].codenum === 'Payments' ||
					(!pSet.discOnPromo && !isKeyEmpty( dataSet.data[nRow], 'promo') ) ) {
					resetBodyKeypress();
					playBuzzer();
					an1.remove();
					an2.remove();
					let chtml = '<span class="messageText">Can not discount item.' + 
					            '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
					$(document).message({ content: chtml, html: true, expire: 3000 });
					return;
				}
				
				// save existing disc for undo
				gBarDiscLast.push([nRow,dataSet.data[nRow].disc]);

				$.post( 'logDiscount?', { 
					nQty: dataSet.data[nRow].qty,
					oldPric: dataSet.data[nRow].price, 
					newPric: nDiscX * dataSet.data[nRow].price, 
					codenum: dataSet.data[nRow].codenum, 
					barc: dataSet.data[nRow].barcode,
					brand: dataSet.data[nRow].brand,
					uid: over, 
					register: drawer
				});
				dataSet.data[nRow].disc = nDisc;
				dataSet.data[nRow].total = Number( ( nDiscX * ( dataSet.data[nRow].qty * dataSet.data[nRow].price ) ).toFixed(2) );

				localStorage.setItem( 'dataSet', JSON.stringify(dataSet) );

				saleTableUpdateRow( nRow + 1 );

				var chtml = '<span class="messageText">' + dict.saleRow[languageVar] + " " + data.f7LineNbr + " " + dict.discounted[languageVar] + ". " + 
				            '</span><a role="button" href="#" onclick="discLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
			
					
			} else {
				var nDisc = Number( data.f7Percent.replace('%','') );
				var nDiscX = ( ( 100 - nDisc ) / 100 );
				var aLog = [];

				console.log( 'data:', data );
				console.log( 'all', nDisc, nDiscX );

				if (nDisc === 0) {
					nDisc = null;
				}
				
				$.each( dataSet.data, function( idx, val ) {
				    // can't discount coupon, payment
				    if (dataSet.data[idx].codenum === 'CPN' || dataSet.data[idx].codenum === 'Payments' ||
						(!pSet.discOnPromo && !isKeyEmpty( dataSet.data[idx], 'promo') ) ) {
						playBuzzer();
						let chtml = '<span class="messageText">Can not discount item.' + 
					            	'</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
						$(document).message({ content: chtml, html: true, expire: 3000 });
						return;
					}

					// save existing disc for undo
					gBarDiscLast.push([idx,dataSet.data[idx].disc]);
			
					aLog.push( [ 
						dataSet.data[idx].price, 
						nDiscX * dataSet.data[idx].price, 
						dataSet.data[idx].codenum, 
						dataSet.data[idx].qty, 
						dataSet.data[idx].barcode,
						dataSet.data[idx].brand
					] );
					dataSet.data[idx].disc = nDisc;
					dataSet.data[idx].total = Number( ( nDiscX * ( dataSet.data[idx].qty * dataSet.data[idx].price ) ).toFixed(2) );

					saleTableUpdateRow( idx + 1 );
				})

				    $.post( 'logDiscount?', { 
					    newDisc: nDisc, uid: over, register: drawer, aLog: JSON.stringify(aLog)
				    });

			        localStorage.setItem( 'dataSet', JSON.stringify(dataSet) );

				    var chtml;
					if (dataSet.data.length > 1) {
						chtml = '<span class="messageText">' + dataSet.data.length + ' ' + dict.gBarDiscMsg[languageVar] + ". " + 
							    '</span><a role="button" href="#" onclick="discLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
					} else {
						chtml = '<span class="messageText">' + dict.gBarDiscMsg1[languageVar] + ". " + 
							    '</span><a role="button" href="#" onclick="discLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
					}
					
			}

			if (gBarDiscLast.length > 0) {
				updateTotalBox();
				$(document).message({ content: chtml, html: true, expire: 8000 });
			}

			resetBodyKeypress();
			an1.remove();
			an2.remove();
		}
	})
}

function gBarDisc(xRow) {
	secureCheck( "ZWSF7", "gBarDiscDo", xRow );
}

function gBarDiscDo(xRow) {
	var over = $("#securityOverrideOK").attr("data-overUID");

	if (over==="" || over===undefined) {
		over = uid
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	gBarDiscLast = [];

	vex.dialog.open({
		input: [
			'<h3>' + dict.f7Title[languageVar] + '</h3>',
	        '<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper" data-aR="' + xRow + '">',
			        '<label for="gDiscPercent" class="f7Label">' + dict.gBarDiscPrompt[languageVar] + ':</label>',
				    '<input class="vexF7Input" id="gDiscPercent" name="gDiscPercent" type="text" value="0.00" />',
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

			new AutoNumeric('#gDiscPercent', AutoNumeric.getPredefinedOptions().percentageUS2dec);
			$('.vex-content').draggable();
			$("#gDiscPercent").focus();
		},
		callback: function (data) {
			var rowObj;
			let aR = $('.vex-custom-input-wrapper').attr('data-aR');
			
			if (typeof aR === 'undefined') {
				aR = [currLine];
			} else {
				aR = aR.split(',').map(function (item) {
					return Number(item);
				});
			}

			if (!data) {
				resetBodyKeypress();
				return;
			} else {
				var nDisc = Number( data.gDiscPercent.replace('%','') );
				var nDiscX = ( ( 100 - nDisc ) / 100 );
				var aLog = [];

				console.log( 'data:', data );
				console.log( 'all', nDisc, nDiscX );

				if (nDisc === 0) {
					nDisc = null;
				}

				console.log('aR in callback:', aR);

				$.each(aR, function (idx, nR) {
					var index = nR - 1;

					// can't discount coupon, payment
					if (dataSet.data[index].codenum === 'CPN' || dataSet.data[index].codenum === 'Payments' ||
						(!pSet.discOnPromo && !isKeyEmpty( dataSet.data[index], 'promo') ) ) {
						playBuzzer();
						let chtml = '<span class="messageText">Can not discount item.' + 
					            	'</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
						$(document).message({ content: chtml, html: true, expire: 3000 });
						return;
					}
			
					// save existing disc for undo
					gBarDiscLast.push([index,dataSet.data[index].disc]);
			
					// data for exception log
					aLog.push( [ 
						dataSet.data[index].price, 
						nDiscX * dataSet.data[index].price, 
						dataSet.data[index].codenum, 
						dataSet.data[index].qty, 
						dataSet.data[index].barcode,
						dataSet.data[index].brand
					] );

					dataSet.data[index].disc = nDisc;
					dataSet.data[index].total = Number( ( nDiscX * ( dataSet.data[index].qty * dataSet.data[index].price ) ).toFixed(2) );

				})

				$("#headerCheckmark").prop("checked", false);
				$("#headerCheckmark").prop("indeterminate", false);		
				$("#saleTableBody td:nth-child(1) input").prop("checked",false);
				$(".gFuncBar").css("display","none");
		
				// see if any valid discounts occurred, otherwise skip remaining...
				var len = gBarDiscLast.length;
				if (len > 0) {
					$.post( 'logDiscount?', { 
						newDisc: nDisc, uid: over, register: drawer, aLog: JSON.stringify(aLog)
					});
	
					localStorage.setItem( 'dataSet', JSON.stringify(dataSet) );
	
					saleTableUpdateRow(aR);

					updateTotalBox();

					var time = 8000;
				    var chtml = '<span class="messageText">' + len + " " + dict.gBarDiscMsg[languageVar] + ". " + 
				                '</span><a role="button" href="#" onclick="discLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
			
					$(document).message({ content: chtml, html: true, expire: time });
				}
			
				resetBodyKeypress();
				focusBarc();
			}
		}
	})
}

function discQwikKey(cKey) {
	var over = $("#securityOverrideOK").attr("data-overUID");

	if (over==="" || over===undefined) {
		over = uid
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	gBarDiscLast = [];

	if (cKey === 'Q' || cKey === 'W') {
		var nDisc = (cKey === 'Q') ? pSet.qDisc1 : pSet.qDisc2;
		var nDiscX = ((100 - nDisc) / 100);
		var nRow = currLine - 1;

		if (nDisc === 0) {
			nDisc = null;
		}

		if (dataSet.data[nRow].codenum === 'CPN' || dataSet.data[nRow].codenum === 'Payments' ||
			(!pSet.discOnPromo && !isKeyEmpty( dataSet.data[nRow], 'promo') ) ) {
			playBuzzer();
			let chtml = '<span class="messageText">Can not discount item.' + 
					      '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
			$(document).message({ content: chtml, html: true, expire: 3000 });
			return;
		}

		// save existing disc for undo
		gBarDiscLast.push([nRow,dataSet.data[nRow].disc]);
			
		$.post('logDiscount?', {
			nQty: dataSet.data[nRow].qty,
			oldPric: dataSet.data[nRow].price,
			newPric: nDiscX * dataSet.data[nRow].price,
			codenum: dataSet.data[nRow].codenum,
			barc: dataSet.data[nRow].barcode,
			brand: dataSet.data[nRow].brand,
			uid: over,
			register: drawer 
		});
		dataSet.data[nRow].disc = nDisc;
		dataSet.data[nRow].total = Number((nDiscX * (dataSet.data[nRow].qty * dataSet.data[nRow].price)).toFixed(2));

		localStorage.setItem('dataSet', JSON.stringify(dataSet));

		saleTableUpdateRow(nRow + 1);

		var chtml = '<span class="messageText">' + dict.qwikDiscLineMsg[languageVar] + " " + currLine + ". " + 
					'</span><a role="button" href="#" onclick="discLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';
	
		$(document).message({ content: chtml, html: true, expire: 8000 });		

	} else {
		var nDisc = (cKey === 'A') ? pSet.qDiscAll1 : pSet.qDiscAll2;
		var nDiscX = ((100 - nDisc) / 100);
		var aLog = [];

		console.log('all', nDisc, nDiscX);

		if (nDisc === 0) {
			nDisc = null;
		}

		$.each(dataSet.data, function (idx, val) {
			// can't discount coupon, payment
			if (dataSet.data[idx].codenum === 'CPN' || dataSet.data[idx].codenum === 'Payments' ||
				(!pSet.discOnPromo && !isKeyEmpty(dataSet.data[idx], 'promo')) ) {
				playBuzzer();
				let chtml = '<span class="messageText">Can not discount item.' + 
					         '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
				$(document).message({ content: chtml, html: true, expire: 3000 });
				return;
			}
	
			// save existing disc for undo
			gBarDiscLast.push([idx,dataSet.data[idx].disc]);
			
			aLog.push([
				dataSet.data[idx].price,
				nDiscX * dataSet.data[idx].price,
				dataSet.data[idx].codenum,
				dataSet.data[idx].qty,
				dataSet.data[idx].barcode,
				dataSet.data[idx].brand
			]);
			dataSet.data[idx].disc = nDisc;
			dataSet.data[idx].total = Number((nDiscX * (dataSet.data[idx].qty * dataSet.data[idx].price)).toFixed(2));

			saleTableUpdateRow(idx + 1);
		})

		if (gBarDiscLast.length > 0) {
		    $.post('logDiscount?', {
			    newDisc: nDisc, uid: over, register: drawer, aLog: JSON.stringify(aLog)
		    });

		    localStorage.setItem('dataSet', JSON.stringify(dataSet));

   		    var chtml = '<span class="messageText">' + dict.qwikDiscAllMsg[languageVar] + 
		                '</span><a role="button" href="#" onclick="discLastUndo();">' + dict.UNDO[languageVar] + '</a><span class="messageClose" onclick="messageRemove();">&times;</span>';

			$(document).message({ content: chtml, html: true, expire: 8000 });		
		}
	}
	if (gBarDiscLast.length > 0) {
		updateTotalBox();
	}
}

function discLastUndo() {
	messageRemove();

	if (!gBarDiscLast) return;

	var aR = [];
	var aLog = [];
	var nDisc;

	$.each( gBarDiscLast, function(idx,arr){
		nDisc = Number( arr[1] );
		var index = arr[0];
		var nR = index + 1;
		var nDiscX = ( ( 100 - nDisc ) / 100 );

		aR.push( nR );
	
		// data for exception log
		aLog.push( [ 
			dataSet.data[index].price, 
			nDiscX * dataSet.data[index].price, 
			dataSet.data[index].codenum, 
			dataSet.data[index].qty, 
			dataSet.data[index].barcode,
			dataSet.data[index].brand
		] );

		dataSet.data[index].disc = nDisc;
		dataSet.data[index].total = Number( ( nDiscX * ( dataSet.data[index].qty * dataSet.data[index].price ) ).toFixed(2) );

	});

	$.post( 'logDiscount?', { 
		newDisc: nDisc, uid: uid, register: drawer, aLog: JSON.stringify(aLog)
	});

	localStorage.setItem( 'dataSet', JSON.stringify(dataSet) );

	saleTableUpdateRow(aR);

	var chtml = '<span class="messageText">' + dict.gBarDiscUndo[languageVar] + ". " + 
				'</span><span class="messageClose" onclick="messageRemove();">&times;</span>';

	$(document).message({ content: chtml, html: true, expire: 8000 });

	updateTotalBox();
}

function keyLogger( key, meta ) {
	// console.log('keyLogger:',key);
	return;
	var msg = [ Date.now(), key, meta, "1" ];
//	console.log( 'keyLogger', key);
	$.post( "keyLogger?", { msg: JSON.stringify( msg ) } );
}

function atCaseLine(cType) {
	console.log("in atCaseLine, cType:", cType, "currLine:", currLine, "pSet.twoFerLinePrompt:", pSet.twoFerLinePrompt);
	if (dataSet.data.length === 0) {
		return;
	} else if (pSet.twoFerLinePrompt) {
			vex.dialog.open({
				input: [
					'<h3>Case Sale</h3>',
					   '<div class="vex-custom-field-wrapper">',
					   	'<div class="vex-custom-input-wrapper">',
					      	'<label for="atCaseLine" class="f7Label">'+ dict.doFerPrompt[languageVar] +'1</label>',
					      	'<input class="vexF7Input" id="atCaseLine" name="atCaseLine" type="text" value="' + currLine + '" />',	
							'</div>',
					  '</div>'
				].join(''),
				className: 'vex-theme-multiButtons',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
					$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
				],
				afterOpen: function () {
					lPauseKeys = true;
					shortcut.remove('esc');
					new AutoNumeric('#atCaseLine', { decimalPlaces: 0 });
				},
				afterClose: function () {
					lPauseKeys = false;
					shortcut.add('esc', function() {escKeyFunc();});
				},
				callback: function (data) {
					if (!data) {
						return;
					}
					let nLine = Number( data.atCaseLine );
					console.log( "atCaseLine callback nLine:", nLine, "typeof nLine:", typeof nLine );
					currLine = isNaN(nLine) ? currLine : nLine;
					paintCurrentLine();
					let an = AutoNumeric.getAutoNumericElement('#atCaseLine');
					if (an) {
						an.remove();
					}
					atCase();
				}
			});
	} else {
		atCase();
	}
}

function atCase() {
	if (dataSet.data.length < 1) { playBuzzer(); return; };
	var row = currLine - 1;
	var custnum = '';
	var rowObj;

	if (dataSet.data[row].barcode.length === 0) { return; }; // misc sale items

	if (Object.keys(customer.custData).length > 0) {
		custnum = customer.custData.custnum
	}
	keyLogger(121, 'shift');
	$.post('atCase?', {
		mode: 'AT',
		codenum: dataSet.data[row].codenum,
		custnum: custnum,
		qty: dataSet.data[row].qty,
		barc: dataSet.data[row].barcode,
		price: dataSet.data[row].price,
		uid: uid,
		register: drawer,
		promo: isKeyEmpty(dataSet.data[row], 'promo') ? false : true
	}, function (reply) {
		console.log("hasOwnProperty:", reply.hasOwnProperty('casePrice'));
		if (reply.hasOwnProperty('casePrice')) {
			var nDiscX = ((100 - Number(reply.disc)) / 100);
			dataSet.data[row].disc  = Number(reply.disc);
			dataSet.data[row].price = dataSet.data[row].pack * Number(reply.casePrice);
			dataSet.data[row].total = Number((nDiscX * (dataSet.data[row].qty * dataSet.data[row].price)).toFixed(2));
			localStorage.setItem('dataSet', JSON.stringify(dataSet));

			saleTableUpdateRow(row + 1);
			playBeep();
			updateTotalBox();
		} else if (reply.hasOwnProperty('msg')) {
			showPosError(reply.msg, null, 'alert');
		}
	}
	)
	focusBarc();
}

function F10CaseSale(nRow = currLine) {
	if (invalidTypes.includes( dataSet.data[nRow-1].type ) ) {
		playBuzzer();
		return;
	}

	let custnum = '';
	if (Object.keys(customer.custData).length > 0) {
		custnum = customer.custData.custnum
	}

	vex.dialog.confirm({
		unsafeMessage: [
			'<h3 style="margin: 10px 0px;">' + dict.f10Title[languageVar] + '</h3>',
			'<span style="font-size: 14px;">',
			dataSet.data[nRow-1].brand + '<br>',
			dataSet.data[nRow-1].descrip + '<br>',
			dataSet.data[nRow-1].size,
			'</span>',	
		].join(''),
	    input: [
		    '<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
				    '<label for="f10Qty" class="f7Label">' + dict.f10Prompt[languageVar] + ':</label>',
				    '<input class="vexF7Input" id="f10Qty" name="f10Qty" type="text" value="1" />',
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

			new AutoNumeric('#f10Qty', { decimalPlaces: 0 });
			$('.vex-content').draggable();
			$("#f10Qty").focus();
		},
		callback: function (data) {
			var row = nRow-1;
			if (!data) {
				resetBodyKeypress();
				return;
			} else {
				$.post( 'atCase?', {
					mode: 'F10',
					codenum: dataSet.data[row].codenum, 
					custnum: custnum, 
					barc: dataSet.data[row].barcode,
					price: dataSet.data[row].price,
					uid: uid,
					register: drawer,
					promo: isKeyEmpty(dataSet.data[row], 'promo') ? false : true
				}, 
				function(reply) {
					var rowObj;
					if (reply.hasOwnProperty("msg")) {
						vex.dialog.alert({
							unsafeMessage: reply.msg,
							className: 'vex-theme-wireframe',
							afterOpen: function () {
								lPauseKeys = true;
								playBuzzer();
							},
							afterClose: function () {
								lPauseKeys = false;
							}
						});				
				    } else {
						var nDiscX = ( ( 100 - Number(reply.disc) ) / 100 );
						dataSet.data[row].disc  = Number( reply.disc );
						dataSet.data[row].qty   = Number( data.f10Qty );
						dataSet.data[row].pack  = Number( reply.caseQty );
						dataSet.data[row].price = Number( reply.casePrice );
						dataSet.data[row].total = Number(( nDiscX * ( dataSet.data[row].qty * dataSet.data[row].price ) ).toFixed(2));
						localStorage.setItem( 'dataSet', JSON.stringify(dataSet) );

						saleTableUpdateRow(row+1);
								
						playBeep();
						updateTotalBox();
					}
				})
			}
			resetBodyKeypress();
		}
	})
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
				//$("#saleTableDiv").css({ "top": saleDivTop1, "height": "67%" }); // "18%", "height": "52%" } );
				saleTableDivSize( { "top": saleDivTop1, "height": "67%" } );
				$('.gFuncBar').css( 'top', gBarTop1 );

				$("#customerDiv").html('<span id="customerClose" onclick="closeCustomerDiv();"title="' + dict.removeCust[languageVar] + '">&times;</span>');
				lPauseKeys = false;
			}
		}
	})
}

function posContextMenu( row, cell, event ) {
	if ( $("#Modal_itemList").is(":visible") || $("#Modal_custList").is(":visible") || (dataSet.data.length < 1) ) return;

	currLine = row + 1;

	const origin = {
		left: event.pageX,
		top: event.pageY
	};
	
	switch (true) {
		case cell === 4:
		    $("#cmEdit").text(dict.editQty[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#saleTableBody tr:nth-child(' + (currLine) + ') td:nth-child(5)").trigger("click"); }, 25)' );
		    break;

		case cell === 5:
		    $("#cmEdit").text(dict.editDiscount[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#saleTableBody tr:nth-child(' + (currLine) + ') td:nth-child(6)").trigger("click"); }, 25)' );
		    break;

		case cell === 6:
		    $("#cmEdit").text(dict.editPrice[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#saleTableBody tr:nth-child(' + (currLine) + ') td:nth-child(7)").trigger("click"); }, 25)' );
 		    break;

		case cell === 7:
		    $("#cmEdit").text(dict.editTotal[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#saleTableBody tr:nth-child(' + (currLine) + ') td:nth-child(8)").trigger("click"); }, 25)' );
		    break;

		case cell === 8:
		    $("#cmEdit").text(dict.editTax[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#saleTableBody tr:nth-child(' + (currLine) + ') td:nth-child(9)").trigger("click"); }, 25)' );
		    break;

	    case cell === 9:
		    $("#cmEdit").text(dict.editDepo[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'setTimeout( function() { $("#saleTableBody tr:nth-child(' + (currLine) + ') td:nth-child(10)").trigger("click"); }, 25)' );
		    break;

		default:
		    $("#cmEdit").text(dict.editItem[languageVar]);
		    $("#cmEdit").attr( 'onclick', 'F6Edit();' )

	}

	$("#cmDisc").attr( 'onclick', 'F7Disc(' + currLine + ');' );
	$("#cmSKU").text("Barc: " + dataSet.data[currLine-1].barcode);

	var codeNum = dataSet.data[row].codenum;
	if (Number.isNaN(Number(codeNum)) || Number(codeNum)===0) {
		$("#cmPop").off("click");
		$("#cmPop").addClass( "liTurnedOff")
	} else {
		$("#cmPop").off("click");
		$("#cmPop").on("click", function() { toggleMenu("hide"); showPopItem(); } );
		$("#cmPop").removeClass( "liTurnedOff")
	}

   paintCurrentLine();
	setPosition(ctxMenu,origin);

	window.addEventListener("click", e => {
		if (ctxMenuVisible) toggleMenu("hide");
		$(window).off('click');
	});
}

const toggleMenu = command => {
	console.log( 'toggleMenu', ctxMenuVisible, command );
	$(".contextMenu").toggle( command==='show');
	//ctxMenu.style.display = command === "show" ? "block" : "none";
	ctxMenuVisible = !ctxMenuVisible;
};

const setPosition = (obj,{ top, left }) => {
	console.log( 'setPosition A:', top, left );
	top  = Math.min( top, $(window).height() - $(obj).height() );
	left = Math.min( left, ( $(window).width() - $(obj).width() ) );
	console.log( 'setPosition B:', top, left );
	obj.style.left = `${left}px`;
	obj.style.top = `${top}px`;
	toggleMenu("show");
};

function showPopItem() {
	secureCheck( "ZWSEX", "showPopItemDo" );
}

function showPopItemDo() {
	var codeNum = dataSet.data[currLine - 1].codenum;
	if (Number.isNaN(Number(codeNum)) || Number(codeNum)===0) return;  //misc sale items, etc

	var item = dataSet.data[currLine - 1].brand.trim() +
		(dataSet.data[currLine - 1].descrip.trim().length === 0 ? '' : ' ') +
		dataSet.data[currLine - 1].descrip.trim() +
		(dataSet.data[currLine - 1].size.trim().length === 0 ? '' : ' ') + dataSet.data[currLine - 1].size.trim();

	$.post("popItem?",
		{ codenum: dataSet.data[currLine - 1].codenum, uid: uid },
		function (reply) {
			$("#popItemTitle").text('Details: ' + item);
			if (reply.msg) {
				vex.dialog.alert({
					unsafeMessage: dict.errorMsg[languageVar] + '<br><br>' + reply.msg, // unsafeMessage option allows html in text
					className: 'vex-theme-wireframe' // Overwrites defaultOptions
				});
			} else {
				$.each(reply.cells, function (idx, val) {
					$("#" + val[0]).html(val[1]);
				});
				$("#popNotes").val(reply.notes);

				shortcutToggleFKeys('off');
				
				$(".popPopHide").hide();
				$(".popButtonDiv").hide();
    			
				$("#Modal_popItem_close").html('&times;');
    			$("#Modal_popItem_close").off("click").on("click", function() {closePopItem();});
    			$("#Modal_popItem_close").addClass('close');

				$("#popAvgCostLabel").text("Avg Cost:");

				$("#modalPopItem").show();

				let nWide = $("#popNotes").width();
				let nHigh = $("#popNotes").parent().parent().height() - 4;
				$("#popNotes").css({"max-width": nWide, "max-height": nHigh});
			}
		})
		.fail(function (xhr, status, error) {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' + dict.errorMsg[languageVar] + '<br><br>' + error + '<br>' + xhr.responseText, // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe' // Overwrites defaultOptions
			});
		});
}

function closePopItem() {
	shortcutToggleFKeys('on');
	$("#modalPopItem").hide();
	$("#modalPopItemContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
}

function shortcutUp() {
	keyLogger( 38 );
	if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func1").is(":visible") ) {
		navFocus-=2;
		if (navFocus<=0) { navFocus = 0 };
		$(navButtons[navFocus]).focus();

	} else if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func2").is(":visible") ) {
		navFocus-=3;
		if (navFocus<=0) { navFocus = 0 };
		$(navButtons[navFocus]).focus();

    } else if ($("#Modal_itemList").is(":visible")) {
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
		if (currLine<=1) { currLine = 1 } else { currLine-- };
		paintCurrentLine();
	}
}

function shortcutDown() {
	keyLogger( 40 );
	if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func1").is(":visible") ) {
		navFocus+=2;
		if (navFocus>navButtons.length-1) { navFocus = navButtons.length-1 };
		$(navButtons[navFocus]).focus();

	} else if ( $('#mySidenav').attr('viewMe') === 'true' && $("#func2").is(":visible") ) {
			navFocus+=3;
			if (navFocus>navButtons.length-1) { navFocus = navButtons.length-1 };
			$(navButtons[navFocus]).focus();

	} else if ($("#Modal_itemList").is(":visible")) {
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
		if (currLine>=dataSet.data.length) { currLine = dataSet.data.length } else { currLine++ };
		paintCurrentLine();
	}
}

function shortcutLeft() {
	keyLogger( 37 );
	if ( $('#mySidenav').attr('viewMe') === 'true' ) {
		if (navFocus<=0) { navFocus = navButtons.length-1 } else { navFocus-- };
		$(navButtons[navFocus]).focus();
	}
}

function shortcutRight() {
	keyLogger( 39 );
	if ( $('#mySidenav').attr('viewMe') === 'true' ) {
		if (navFocus>=navButtons.length) { navFocus = 0 } else { navFocus++ };
		$(navButtons[navFocus]).focus();
	}
}

function escKeyFunc() {
	console.log( 'escape' );
	if ($("#clickEdit")) saleTableCellClose();
	if ($('#Modal_custList').is(":visible")) closeCustList();
	if ($('#Modal_itemList').is(":visible") && !$('#modalPopItem').is(":visible")) closeItemList();
	if ($('#ModalTender').is(":visible")) closeTender(true);
	if ($('#modalPopItem').is(":visible") && $('#popItemTitle').text()!=='New Item') closePopItem();
	if ($('#mySidenav').attr('viewMe')==='true') closeNav();
	if (ctxMenuVisible) toggleMenu("hide");
	if ($('#ModalPendings').is(":visible")) closePendings();
	if ($("#reprintReceipt").is(":visible")) reprintReceiptCancel();
	if ($("#modalTipDialog").is(":visible")) closeModalTipDialog();
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
		shortcut.remove( 'F2' );
		shortcut.remove( 'F4' );
		shortcut.remove( 'F7' );
		shortcut.remove( 'F8' );
		shortcut.remove( 'F9' );
		shortcut.remove( 'Ctrl+F9' );
		shortcut.remove( 'F10' );
		shortcut.remove( 'Shift+F10' );
		shortcut.remove( 'ALT+F10' );
		shortcut.remove( "UP" );
		shortcut.remove( "DOWN" );
		if (pSet.customMiscSaleDo) {
			shortcut.remove( "ALT+"+pSet.customMiscSaleKey );
		}

		shortcut.remove( 'F1' );
		shortcut.remove( 'F3' );
		shortcut.remove( 'F5' );
		shortcut.remove( 'F6' );

		shortcut.add('F1', function () { keyLogger(112); doNothing(); });
		shortcut.add('F3', function () { keyLogger(114); $("#itemListBtn").trigger("click"); });
		shortcut.add('F5', function () { keyLogger(116); $("#deleteBtn").trigger("click"); });
		shortcut.add('F6', function () { keyLogger(117); $("#editBtn").trigger("click"); });

		shortcut.add("F2",function() { keyLogger( 113 ); $( "#logoutBtn" ).trigger( "click" ); } );
		shortcut.add("F4",function() { keyLogger( 115 ); $( "#voidBtn" ).trigger( "click" ); } );
		shortcut.add("F7",function() { keyLogger( 118 ); $( "#discBtn" ).trigger( "click" ); } );
		shortcut.add("F8",function() { keyLogger( 119 ); $( "#custListBtn" ).trigger( "click" ); } );
		shortcut.add("F9",function() { console.log("F9 pressed"); $( "#tenderBtn" ).trigger( "click" ); } );
		shortcut.add("Ctrl+F9", function() { secureCheck("ZWSDP", "showCashDrop"); } );
		shortcut.add("F10",function() { keyLogger( 121 ); $( "#caseBtn" ).trigger( "click" ); } );
		shortcut.add("Shift+F10", function() { atCaseLine(); });
		shortcut.add("ALT+F10", function() { toggleNav(); } );
		shortcut.add( "UP", function() { shortcutUp(); } );
		shortcut.add( "DOWN", function() { shortcutDown(); } );
		if (pSet.customMiscSaleDo) {
			shortcut.add("ALT+"+pSet.customMiscSaleKey, function() { miscSale('C'); } );
		}
	
	} else {
		shortcut.remove( 'F1' );
		shortcut.remove( 'F3' );
		shortcut.remove( 'F5' );
		shortcut.remove( 'F6' );

		shortcut.add('F1', function () { return; });
		shortcut.add('F3', function () { return; });
		shortcut.add('F5', function () { return; });
		shortcut.add('F6', function () { return; });
	
		shortcut.remove( 'F2' );
		shortcut.remove( 'F4' );
		shortcut.remove( 'F7' );
		shortcut.remove( 'F8' );
		shortcut.remove( 'F9' );
		shortcut.remove( 'Ctrl+F9' );
		shortcut.remove( 'F10' );
		shortcut.remove( 'Shift+F10' );
		shortcut.remove( 'ALT+F10' );
		shortcut.remove( "UP" );
		shortcut.remove( "DOWN" );
		shortcut.remove( "ALT+"+pSet.customMiscSaleKey );	
	
	}
}

function searchInputFocus() {
	if ($("#Modal_itemList").is(":visible")) {
		var lOpen = itemListTable.grid.jsGrid("option", "filtering");
		if (lOpen) {
			itemListTable.grid.jsGrid("option", "filtering", false);
			$("#itemClearSearch").hide();
			$("#itemSearch").show();
			$("#itemListAdd").show();
			itemListTable.grid.jsGrid("clearFilter");
		    itemListTable.grid.jsGrid("loadData");
		} else {
			itemListTable.grid.jsGrid("option", "filtering", true);
			$("#itemSearch").hide();
			$("#itemClearSearch").show();
			$("#itemListAdd").hide();
			setTimeout( function() { $("#itemListTableDiv .jsgrid-filter-row td:eq(0) input").focus(); }, 100 );
		}

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
		console.log( "currentPage:", itemListTable.currentPage );
		itemListTable.grid.jsGrid("openPage", itemListTable.currentPage );

	} else if ($("#Modal_custList").is(":visible")) {
		if ( custListTable.currentPage === custListTable.totalPages ) {
			return;
		}
		custListTable.currentPage ++;
		console.log( "currentPage:", custListTable.currentPage );
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

 function setLanguage( lang ) {
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
		$("#custListTableDiv").jsGrid({pagerFormat: '{first} {prev} {next} {last} &nbsp;&nbsp; '+dict.Records[languageVar]+': {itemCount}'});
	}

	if ( $("#itemListTableDiv .jsgrid-grid-body").length > 0 ) {
		$("#itemListTableDiv").jsGrid({pagerFormat: '{first} {prev} {next} {last}' });
	}

	f3Header();
	f8Header();
	setgBarTitles();
	setTotalLabels();

	paintCurrentLine();
}


function cloneObj(src) {
	console.log( "cloneObj src:", src );
	return Object.assign({}, src);
}

function setgBarTitles() {
	$(".trashFunc").attr("title", dict.Delete[languageVar]);
	$(".discFunc").attr("title", dict.Discount[languageVar]);
	$(".refundFunc").attr("title", dict.Refund[languageVar]);
	$(".editFunc").attr("title", dict.Edit[languageVar]);
	$(".infoFunc").attr("title", dict.Info[languageVar]);
}

function setTotalLabels() {
   $("#totSubLabel").text( dict.Subtotal[languageVar] );
   $("#totTaxLabel").text( dict.Taxes[languageVar] );
	$("#totDepLabel").text( dict.Deposit[languageVar] );
	$("#totRetLabel").text( dict.Returns[languageVar] );
	$(".subTotalRow").show();
	if (!(pSet.doTax1 || pSet.doTax2 || pSet.doTax3 || pSet.doFlatTax || pSet.doVolTax)) {
		$("#taxTotal").parent().hide();
	}
	totalDivResize(true);
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

function saleTableDivSize( obj ) {
	if (obj) {
		$("#saleTableDiv").css( obj );
	} else {
		$("#saleTableDiv").css({height: ""});  // reset height in case we overrode it
	}

	//--- check to make sure we are not too tall
	var nTop = $("#saleTableDiv").position().top
	var nHigh = $("#saleTableDiv").height() - $("#saleTableHdrRow").height();
	if (nTop + $("#saleTableDiv").height() > 0.95 * $(document).height() - 59) {
		var nHeight = 0.95 * $(document).height() - 59 - nTop;
		$("#saleTableDiv").css({ height: nHeight });
		nHigh = nHeight - $("#saleTableHdrRow").height();
	}

	//--- set the table body
	$("#saleTableBody").css({ height: nHigh });

	//--- check to see if scrollbar is in play
	if ($("#saleTableBody").overflownY()) {
		$("#saleTableHdr tr").css({"padding-right": "17px"});
	} else {
		$("#saleTableHdr tr").css({"padding-right": "0px"});
	}
}

function closeID() {
	$("#ModalID").hide();
	$(".legalText").text("No");
	$(".legalLight").css("content", "url('../images/lightRed_25.png')");
	$(".legalPara").hide();
	$("#idProcess").show();
	$("#idExpired").hide();
	$("#idNoDoB").hide();
	$(".idData").empty().hide();
}

function idScan(cStr) {
	// console.log( cStr );
	let dlData = decode2D(cStr);  // in ePos2DDL.js

	// test for empty obj = bad read
	if ($.isEmptyObject(dlData)) {
		closeID();
		vex.dialog.alert({
			unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' + dict.badDL[languageVar],
			className: 'vex-theme-wireframe',
			afterOpen: function () {
				pauseBodyKeypress();
			},
			afterClose: function () {
				resetBodyKeypress();
			}
		});
		return;
	}

	let dlState = dlData["issueState"];
	let dlNbr = dlData["documentNumber"].value;
	let dlDBB = dlData["dateOfBirth"].value;
	let dlDBA = dlData["dateOfExpiry"].value;
	console.log( "dlNbr:", dlNbr, "dlState:", dlState );

	$.post( "dlCustLookup?",
			{ drawer: drawer, dlState: dlState, dlNbr: dlNbr, dlDBB: dlDBB, dlDBA: dlDBA },
			function(reply) {
				if (reply.customer) {
					closeID();
					custListPick(reply.customer, "F8");
					playMagic();
					calcLegal(dlData["dateOfBirth"].value, true);
				} else {
					let DoBFound;
					Object.keys(dlData).forEach(key => {
						let item = dlData[key];
						if (key === "dateOfBirth") DoBFound = true;
						
						if (key === "dateOfExpiry") {
							checkExpiry( item.value );
						}
				
						if (key === "issueState") {
							dlData["documentNumber"].value += " " + item;
						} else {
							$("#" + item.element).html("<span class='idSpan'>" + item.prefix + "</span><span id='" + item.element + "Value'>" + item.value + "</span>");
							$("#" + item.element).show();
						}
					});
				
					$("#idProcess").hide();
				
					if (!DoBFound) {
						$("#idNoDoB").show();
					} else {
						calcLegal(dlData["dateOfBirth"].value)
						$(".legalPara").show();
					}
				}
			} );
}

const checkExpiry = dateString => {
	let parts = dateString.split("/");
	const a = moment([parts[2],parts[0]-1,parts[1]]);
	const b = moment(new Date());
	const diff = a.diff(b, 'years', true);
	//console.log( "Expire Difference:", diff );
	if (diff<0) {
		$("#idExpired").show();
	}
};

const calcLegal = (dateString, message) => {
	let parts = dateString.split("/");

	const bday = moment([parts[2], parts[0] - 1, parts[1]]);
	const legal = moment().startOf('date').subtract(pSet.legalAge, 'years');

	if (message) {
		if (bday < legal) {
			var chtml = '<span class="messageText">' + dict.ageOKAll[languageVar] + '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
		} else {
			var chtml = '<span class="messageText">' + dict.ageNotOK[languageVar] + pSet.legalLabel + '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
		}
		$(document).message({content: chtml, html: true, expire: 3000});
	} else {
		if (bday < legal) {
			$("#alcoholText").text(dict.Yes[languageVar]);
			$("#alcoholLight").css("content", "url('../images/lightGrn_25.png')");
		}
	}

	return;
}

function custAddDL() {
	let id = $("#idNbrValue").text();
	let bDay = $("#idDOBValue").text();
	
	showCustList( 'DL', id, bDay );
}

function custCreateDL() {
	let cust = {
		DOB: $("#idDOBValue").text(),
		lastName: $("#idLastValue").text(),
		firstName: $("#idFirstValue").text(),
		suffix: $("#idSuffixValue").text(),
		address: $("#idStreetValue").text(),
		address2: $("#idStreet2Value").text(),
		city: $("#idCityValue").text(),
		state: $("#idStateValue").text(),
		zip: $("#idZipValue").text(),
		licNbr: $("#idNbrValue").text(),
		vet: $("#idVetValue").text()
	}

	$.post("dlCreateCust?", cust, function(reply) 
	{
		if (reply.customer) {
			closeID();
			custListPick(reply.customer, "F8");
			playMagic();
			calcLegal(dlData["dateOfBirth"].value, true);
			return;
		} else {

		}
	})
    .fail(function( xhr, status, errorThrown ) {
		if ( xhr.responseText.includes('<p>') || xhr.responseText.includes('<br>') ) {
			var s= dict.scanError[languageVar] + "</br><br>" + xhr.responseText
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' + s,
				className: 'vex-theme-wireframe',
				afterOpen: function () {
					pauseBodyKeypress();
				},
				afterClose: function () {
					resetBodyKeypress();
				}
			})
		} else {
			var s= dict.scanError[languageVar] + " - " + xhr.responseText
			$(document).message({ content: s, html: true, expire: 8000 });
		}
	});
}

function doFerLine(cType) {
	if (dataSet.data.length === 0) {
		return;
	} else if (pSet.twoFerLinePrompt) {
			vex.dialog.open({
				input: [
					'<h3>TwoFer / ThreeFer</h3>',
					   '<div class="vex-custom-field-wrapper">',
					   	'<div class="vex-custom-input-wrapper">',
					      	'<label for="doFerLine" class="f7Label">'+ dict.doFerPrompt[languageVar] +'1</label>',
					      	'<input class="vexF7Input" id="doFerLine" name="doFerLine" type="text" value="' + currLine + '" />',	
							'</div>',
					  '</div>'
				].join(''),
				className: 'vex-theme-multiButtons',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
					$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
				],
				afterOpen: function () {
					lPauseKeys = true;
					shortcut.remove('esc');
					new AutoNumeric('#doFerLine', { decimalPlaces: 0 });
				},
				afterClose: function () {
					lPauseKeys = false;
					shortcut.add('esc', function() {escKeyFunc();});
				},
				callback: function (data) {
					if (!data) {
						return;
					}
					let nLine = Number( data.doFerLine );
					console.log( "doFerLine callback nLine:", nLine, "typeof nLine:", typeof nLine );
					currLine = isNaN(nLine) ? currLine : nLine;
					paintCurrentLine();
					let an = AutoNumeric.getAutoNumericElement('#doFerLine');
					if (an) {
						an.remove();
					}
					doFer(cType);
				}
			});
	} else {
		doFer(cType);
	}
}

function doFer(cType) {
	if (dataSet.data.length === 0) return;
	console.log( "doFer cType:", cType, "currLine:", currLine, "dataSet.data[idx]:", dataSet.data[currLine-1] );
	let prefix = 'TX';
	let msg = "2-fer applied to line ";
	let idx = currLine - 1;
	let barc = dataSet.data[idx].barcode;
	if (cType === 'TT') {
		prefix = 'TTX';
		msg = "3-fer applied to line ";
	}
	let cStr = prefix + barc;

	$.post("posDoFer?", { barcode: cStr }, function (reply) {
		var item = reply;
		var qty = 1;
		var lSound = false;

		if (reply.result === 'fail') {
			showPosError(reply.message, null, reply.type);
		} else if (item.brand.indexOf('not found') > -1) {
			var s = "<span class='messageText'>Barcode: " + item.barcode + " - " + item.brand + "</span><span class='messageClose' onclick='messageRemove();'>&times;</span>";
			$(document).message({ content: s, html: true, expire: 8000 });
		} else {
			if (dataSet.data[idx].pack !== Number(item.pack) && dataSet.data[idx].price !== Number(item.price)) lSound = true;
			dataSet.data[idx].qty = Number(item.qty);
			dataSet.data[idx].pack = Number(item.pack);
			dataSet.data[idx].price = Number(item.price);
			dataSet.data[idx].total = dataSet.data[idx].qty * dataSet.data[idx].price;
			if (typeof dataSet.data[idx].disc == 'number' && dataSet.data[idx].disc != 0) {
				var nDisc = 1 - dataSet.data[idx].disc/100;
				dataSet.data[idx].total = dataSet.data[idx].qty * Number(dataSet.data[idx].price) * nDisc;
			}
			saleTableUpdateRow(currLine);
			msg = "<span class='messageText'>" + msg + currLine + ".</span><span class='messageClose' onclick='messageRemove();'>&times;</span>";
			$(document).message({ content: msg, html: true, expire: 8000 });
			if (lSound) playMagic();
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function (xhr, status, errorThrown) {
		if (xhr.responseText.includes('<p>') || xhr.responseText.includes('<br>')) {
			var s = dict.scanError[languageVar] + "</br><br>" + xhr.responseText
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgError + '</svg><br>' + s,
				className: 'vex-theme-wireframe',
				afterOpen: function () {
					lPauseKeys = true;
					playBuzzer();
				},
				afterClose: function () {
					lPauseKeys = false;
				}
			})
		} else {
			var s = dict.scanError[languageVar] + " - " + xhr.responseText
			$(document).message({ content: s, html: true, expire: 8000 });
		}
	});
}

function makeExempt() {
	let taxArray = [pSet.doTax1, pSet.doTax2, pSet.doTax3, pSet.doFlatTax, pSet.doVolTax];
	let labels = [pSet.tax1Label, pSet.tax2Label, pSet.tax3Label, pSet.flatTaxLabel, pSet.volTaxLabel];
	let numTaxes = taxArray.filter(Boolean).length;
	let makeExempt = [false, false, false, false, false];

	if (numTaxes === 0) return;

	if (numTaxes === 1) {
	    vex.dialog.confirm({
			unsafeMessage: '<h3 style="margin: 10px 0px;">' + dict.exemptTitle[languageVar] + '</h3>' + 
			               '<p>' + dict.exemptAlert[languageVar] + '</p>',
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: 'NO' })
			],
			afterOpen: function () {
				pauseBodyKeypress();
			},
			callback: function (data) {
				let idx = taxArray.indexOf(true);
				if (!data) {
					makeExempt[idx] = false;
				} else {
					makeExempt[idx] = true;
				}

				taxExempt.ex1 = makeExempt[0];
				taxExempt.ex2 = makeExempt[1];
				taxExempt.ex3 = makeExempt[2];
				taxExempt.exFlat = makeExempt[3];
				taxExempt.exVol = makeExempt[4];
			
				localStorage.setItem('taxExempt', JSON.stringify(taxExempt));
			
				lPauseKeys = false;

				resetBodyKeypress();
				updateTotalBox('exempt');
			}
		});

	} else {
		let htmlArray = [
			'<div class="vex-custom-field-wrapper">',
				'<div class="vex-custom-input-wrapper">',
					'<p>' + dict.exemptPrompt[languageVar] + '</p>',
					'<fieldset id="exemptSelect" name="exemptSelect">'];
		let htmlCloseArray = [
			        '</fieldset>',
			    '</div>',
		    '</div>'
		];
		let idArray = ["tax1", "tax2", "tax3", "taxFlat", "taxVol"]
		let char = 65;

		$.each( taxArray, function(idx,val) {
			if (val) {
				htmlArray.push(
					'<input type="checkbox" class="exemptCheck" id="' + idArray[idx] + 
					'" name="' + idArray[idx] +
					'" checked /><label for="' + idArray[idx] + '">' + String.fromCharCode(char) + 
					' &hyphen; ' + labels[idx] + '</label><br>'
				);
				char++;
			}
		});

		Array.prototype.push.apply(htmlArray, htmlCloseArray);
		let htmlStr = htmlArray.join('');

	    vex.dialog.confirm({
			unsafeMessage: '<h3 style="margin: 10px 0px;">' + dict.exemptTitle[languageVar] + '</h3>',
			input: htmlStr,
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
			],
			afterOpen: function () {
				pauseBodyKeypress();
			
				$('body').on('keyup', function (e) {
					if (e.which===65) {
						$('#exemptSelect input:eq(0)').prop('checked', !$('#exemptSelect input:eq(0)').prop("checked"));
					} else if (e.which===66) {
						$('#exemptSelect input:eq(1)').prop('checked', !$('#exemptSelect input:eq(1)').prop("checked"));
					} else if (numTaxes > 2 && e.which===67) {
						$('#exemptSelect input:eq(2)').prop('checked', !$('#exemptSelect input:eq(2)').prop("checked"));
					} else if (numTaxes > 3 && e.which===68) {
						$('#exemptSelect input:eq(3)').prop('checked', !$('#exemptSelect input:eq(3)').prop("checked"));
					} else if (numTaxes > 4 && e.which===69) {
						$('#exemptSelect input:eq(4)').prop('checked', !$('#exemptSelect input:eq(4)').prop("checked"));
					};
				});
	
			},
			callback: function (data) {
				if (!data) {
					resetBodyKeypress();
					return;
				}
				if (data.tax1) taxExempt.ex1 = true;
				if (data.tax2) taxExempt.ex2 = true;
				if (data.tax3) taxExempt.ex3 = true;
				if (data.taxFlat) taxExempt.exFlat = true;
				if (data.taxVol) taxExempt.exVol = true;

				localStorage.setItem('taxExempt', JSON.stringify(taxExempt));
				resetBodyKeypress();
				updateTotalBox('exempt');
			}
		});
	}
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function doDeposit() {
	vex.dialog.confirm({
		unsafeMessage: '<h3 style="margin: 10px 0px;">' + dict.depositReturn[languageVar] + '</h3>',
	    input: [
			'<div class="vex-custom-field-wrapper">',
			    dict.mode[languageVar] + ':',
			    '<div class="vex-custom-input-wrapper">',
				    '<select id="depositSelect" name="depositSelect" size="2">',
				        '<option value="A" selected>A. ' + dict.depositCount[languageVar] + '</option>',
				        '<option value="B">B. ' + dict.depositDollars[languageVar] + '</option>',
				    '</select>',
			    '</div>',
			'</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="depositPrice" class="f7Label">' + dict.depAmt[languageVar] + '</label>',
				    '<input class="vexF7Input" id="depositPrice" name="depositPrice" type="text" value="1.00" />',
			        '<label for="depositCount" class="f7Label">' + dict.depNbr[languageVar] + '</label>',
				    '<input class="vexF7Input" id="depositCount" name="depositCount" type="text" value="1" />',
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

			var focusObj = $("#depositCount");
			$("#depositPrice").hide();
			$("label[for='depositPrice']").hide();

			$('body').on('keyup', function (e) {
				if (e.which===65 || e.which===38) {
					$('#depositSelect').val('A').change();
				} else if (e.which===66 || e.which===40) {
					$('#depositSelect').val('B').change();
				};
			});

			$('#depositSelect').on('change', '', function(e) {
				if ($("#depositSelect").val() === 'A') {
			        $("#depositPrice").hide();
			        $("label[for='depositPrice']").hide();
			        $("#depositCount").show();
					$("label[for='depositCount']").show();
					focusObj = $("#depositCount");
				    $("#depositCount").focus();
				} else {
			        $("#depositCount").hide();
			        $("label[for='depositCount']").hide();
			        $("#depositPrice").show();
					$("label[for='depositPrice']").show();
					focusObj = $("#depositPrice");
				    $("#depositPrice").focus();
				}
			});
			
			new AutoNumeric('#depositPrice', { decimalPlaces: 2 });
			new AutoNumeric('#depositCount', { decimalPlaces: 0 });
			
			$('.vex-content').attr('id','f6Box');
			$('.vex-content').draggable({
				stop: function( event, ui ) {focusObj.focus();}
			  });
			
			setTimeout( function() { focusObj.focus(); }, 0 );
	    },
		callback: function (data) {
			if (!data) {
				resetBodyKeypress();
				return;
			}
			var depoItem = {};
			if (data.depositSelect==='A') {
				depoItem.depo = Number( data.depositCount ) * pSet.depositAmt;
			} else {
				depoItem.depo = Number( data.depositPrice );
			}

			depoItem.codenum = "Returns";
			depoItem.brand   = "DEPOSIT";
			depoItem.descrip = "RETURN";
			depoItem.type    = "01";
			depoItem.size = "";
			depoItem.pack = 1;
			depoItem.barcode = "";
			depoItem.price = 0;
			depoItem.qty = 1;
			depoItem.tax = "N";

			resetBodyKeypress();
			saleItemAdd( depoItem, 1 );
		}
	})
}

function saleNote() {
	vex.dialog.confirm({
		unsafeMessage: '<h3 style="margin: 10px 0px;">' + dict.saleNote[languageVar] + '</h3>',
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

			if (localStorage.hasOwnProperty('saleNote')) {
				let note = localStorage.getItem("saleNote");
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

			console.log( "note:", data.note );
			localStorage.setItem("saleNote", data.note);
			resetBodyKeypress();
		}
	})
}

function doPayment() {
	if (!$("#customerDiv").is(":visible")) {
		vex.dialog.alert({
			unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' + "Please select a customer first.",
			className: 'vex-theme-wireframe',
			afterOpen: function () {
				lPauseKeys = true;
				playBuzzer();
			},
			afterClose: function () {
				lPauseKeys = false;
			}
		});
		return;
	}

	vex.dialog.confirm({
		unsafeMessage: '<h3 style="margin: 10px 0px;">' + dict.acctPayment[languageVar] + '</h3>',
	    input: [
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
				'<label for="payment" class="f7Label">' + dict.depAmt[languageVar] + '</label>',
				'<input id="payment" name="payment" type="text" value="0.00" />',
			'</div>'
	    ].join(''),
	    className: 'vex-theme-multiButtons',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
			$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
		],
	    afterOpen: function () {
			pauseBodyKeypress();

			$('.vex-content').attr('id','f6Box');
			$("#f6Box").css({"width": "500px"});
			$("#payment").css({"width": "100px", "margin-left": "20px"});
			$('.vex-content').draggable({
				stop: function( event, ui ) {$("#payment").focus();}
			});

			new AutoNumeric('#payment', { decimalPlaces: 2 });

			setTimeout( function() { $("#payment").focus(); }, 0 );
	    },
		callback: function (data) {
			if (!data) {
				resetBodyKeypress();
				return;
			}
			var payItem = {};

			payItem.price = Number( data.payment );
			payItem.codenum = "Payments";
			payItem.brand   = "Payments";
			payItem.descrip = "on Account";
			payItem.type    = "PA";
			payItem.size = "";
			payItem.pack = 1;
			payItem.barcode = "";
			payItem.qty = 1;
			payItem.tax = "N";
			payItem.depo = 0;

			resetBodyKeypress();
			saleItemAdd( payItem, 1 );

		}
	})

}

function doCoupon(button) {
	if (dataSet.data.length === 0) {
		return;
	}
	var item;
	var qty = 1;

	if (pSet.couponType) {
		var aList = [
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<select id="coupSelect" name="coupSelect" size="' + pSet.couponTypeArray.length + '">'
		];

		$.each(pSet.couponTypeArray, function (idx, coup) {
			var selected = (idx === 0) ? " selected" : "";
			var nbr = 65 + idx;
			aList.push('<option value="' + idx + '"' + selected + '>' + String.fromCharCode(nbr) + ' &hyphen; ' + coup + '</option>');
		})

		aList.push('</select>');
		aList.push('</div>');
		aList.push('</div>');

	}

	//----- special coupon entry, scan item and enter price
	if ((button === "N" && pSet.coupon_N) || (button === "F12" && pSet.coupon_F)) {
		var aHTML = [
			'<h3>' + dict.coupon[languageVar] + '</h3>',
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<label for="coupScan">' + dict.itemCode[languageVar] + ':</label>',
			'<input class="couponScan" id="coupScan" name="coupScan" type="text" value="" placeholder="' + dict.scanItem[languageVar] + '" />',
			'<span id="coupItemCode"></span>',
			'</div>',
			'</div>',
			'<div><span id="coupItem"></span><br><span id="coupRegPrice"></span></div>',
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<label for="coupAmt" style="display: none;">' + dict.salePrice[languageVar] + ':</label>',
			'<input class="vexF7Input" id="coupAmt" name="coupAmt" type="text" value="0.00" style="display: none;" />',
			'</div>',
			'</div>'
		];
		if (pSet.couponType) {
			var numCoups = pSet.couponTypeArray.length;
			aHTML.splice(1, 0, ...aList);
		}
		var cHTML = aHTML.join('');
		vex.dialog.open({
			input: cHTML,
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
			],
			afterOpen: function () {
				$("#coupScan").on("keydown",function search(e) {
					if (e.keyCode == 123) {
						e.preventDefault();
					} else if(e.keyCode == 13) {
						e.preventDefault();
						e.stopPropagation();

						let cStr = $("#coupScan").val().toUpperCase();
						$.post( "posGetItem?", { cBarcode: cStr }, function (data, status, xhr) {
							item = data;
												
							if (item.brand.indexOf('not found') > -1) {
								var s = "Barcode: " + item.barcode + "</br>" + item.brand;
								vex.dialog.alert({
									unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
											svgAlert + '</svg><br>' + s,
									className: 'vex-theme-wireframe',
									afterOpen: function () {
										lPauseKeys = true;
										playBuzzer();
									},
									afterClose: function () {
										lPauseKeys = false;
									}
								})
							} else {
								qty = Number( item.qty );
								let product = item.brand.trim() + ( item.descrip.trim().length === 0 ? '' : ' ' ) + item.descrip.trim() + ( item.size.trim().length === 0 ? '' : ' ' ) + item.size.trim()
								$("#coupItemCode").text("Item Code: " + cStr);
								$("label[for='coupScan']").hide();
								$("#coupScan").hide();
								$("#coupAmt").show();
								$("label[for='coupAmt']").show();
								$("#coupItem").text(product);
								$("#coupRegPrice").text(qty + " @ " + item.price);
								$("#coupAmt").focus();
							} 
						})

					}
				});
				pauseBodyKeypress();

				$(".vex-content").click( function(e) {
					focusObj.focus().select();
				})

				new AutoNumeric('#coupAmt', { decimalPlaces: 2 });
				$('.vex-content').draggable({
					stop: function( event, ui ) {focusObj.focus().select();}
				});

				if (pSet.couponType) {
					var focusObj = $("#coupScan");

					$("#coupAmt").on("focus", function () { focusObj = $(this); });
					$("#coupScan").on("focus", function () { focusObj = $(this); });

					$('body').on('keyup', function (e) {
						var oldVal = Number($('#coupSelect').val());
						if (e.which >= 65 && e.which <= 65 + numCoups) {
							$('#coupSelect').val((e.which - 65).toString()).change();
						} else if (e.which === 38 && oldVal > 0) {
							$('#coupSelect').val((oldVal - 1).toString()).change();
						} else if (e.which === 40 && oldVal < numCoups - 1) {
							$('#coupSelect').val((oldVal + 1).toString()).change();
						};
					});

					$('#coupSelect').on('change', '', function (e) {
						focusObj.focus().select();
					});
				}

				$("#coupScan").focus().select();
			},
			callback: function (data) {
				if (!data || !$("#coupAmt").is(":visible")) {
					resetBodyKeypress();
					return;
				} else {
					saleItemAdd( item, qty );

					var descrip = "MISCELLANEOUS";
					if (pSet.couponType) {
						let idx = Number(data.coupSelect);
						descrip = pSet.couponTypeArray[idx];
						
						console.log( pSet.couponTypeArray );
						console.log( "idx:",idx,"descrip:",descrip);
					}
					var coupObj = {
						"rowId": (dataSet.data.length + 1).toString() + '.',
						"brand": "COUPON",
						"descrip": descrip,
						"size": "",
						"item": "COUPON " + descrip,
						"pack": 1,
						"qty": qty,
						"disc": null,
						"price": -1 * (item.price - Number(data.coupAmt)),
						"promo": null,
						"total": -1 * qty * (item.price - Number(data.coupAmt)),
						"barcode": item.barcode,
						"codenum": "CPN",
						"type": "CP",
						"tax": "N",
						"depo": 0,
						"caseQty": 1,
						"pool": 0,
						"discBy": ''
					};
					dataSet.data.push(coupObj);
					localStorage.setItem('dataSet', JSON.stringify(dataSet));

					resetBodyKeypress();
					saleTableInsertRow(coupObj);

					currLine = dataSet.data.length;
					paintCurrentLine();

				}
			}
		});

	//----- standard coupon entry form
	} else {
		var aHTML = [
			'<h3>' + dict.coupon[languageVar] + '</h3>',
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<label for="coupAmt" class="couponLabel">' + dict.dollarOff[languageVar] + ':</label>',
			'<input class="vexF7Input" id="coupAmt" name="coupAmt" type="text" value="0.00" />',
			'</div>',
			'</div>',
			'<div class="vex-custom-field-wrapper">',
			'<div class="vex-custom-input-wrapper">',
			'<label for="coupQty" class="couponLabel">' + dict.f6Qty[languageVar] + ':</label>',
			'<input class="vexF7Input" id="coupQty" name="coupQty" type="text" value="1" />',
			'</div>',
			'</div>'
		];
		if (pSet.couponType) {
			var numCoups = pSet.couponTypeArray.length;
			aHTML.splice(1, 0, ...aList);
		}
		var cHTML = aHTML.join('');
		vex.dialog.open({
			input: cHTML,
			className: 'vex-theme-multiButtons',
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, { text: dict.ok[languageVar] }),
				$.extend({}, vex.dialog.buttons.NO, { text: dict.cancel[languageVar] })
			],
			afterOpen: function () {
				pauseBodyKeypress();

				new AutoNumeric('#coupAmt', { decimalPlaces: 2 });
				new AutoNumeric('#coupQty', { decimalPlaces: 0 });
				$('.vex-content').draggable({
					stop: function( event, ui ) {focusObj.focus().select();}
				  });
	
				if (pSet.couponType) {
					var focusObj = $("#coupAmt");
					$("#coupAmt").on("focus", function () { focusObj = $(this); });
					$("#coupQty").on("focus", function () { focusObj = $(this); });

					$('body').on('keyup', function (e) {
						var oldVal = Number($('#coupSelect').val());
						if (e.which >= 65 && e.which <= 65 + numCoups) {
							$('#coupSelect').val((e.which - 65).toString()).change();
						} else if (e.which === 38 && oldVal > 0) {
							$('#coupSelect').val((oldVal - 1).toString()).change();
						} else if (e.which === 40 && oldVal < numCoups - 1) {
							$('#coupSelect').val((oldVal + 1).toString()).change();
						};
					});

					$('#coupSelect').on('change', '', function (e) {
						focusObj.focus().select();
					});
				}
			},
			callback: function (data) {
				if (!data) {
					resetBodyKeypress();
					return;
				} else {
					var descrip = "MISCELLANEOUS";
					if (pSet.couponType) {
						let idx = Number(data.coupSelect);
						descrip = pSet.couponTypeArray[idx];
					}
					var coupObj = {
						"rowId": (dataSet.data.length + 1).toString() + '.',
						"brand": "COUPON",
						"descrip": descrip,
						"size": "",
						"item": "COUPON " + descrip,
						"pack": 1,
						"qty": Number(data.coupQty),
						"disc": null,
						"price": -1 * Number(data.coupAmt),
						"promo": null,
						"total": -1 * Number(data.coupQty) * Number(data.coupAmt),
						"barcode": "",
						"codenum": "CPN",
						"type": "CP",
						"tax": "N",
						"depo": 0,
						"caseQty": 1,
						"pool": 0,
						"discBy": ''
					};
					dataSet.data.push(coupObj);
					localStorage.setItem('dataSet', JSON.stringify(dataSet));

					resetBodyKeypress();
					saleTableInsertRow(coupObj);

					currLine = dataSet.data.length;
					paintCurrentLine();

				}
			}
		});
	}
}

function showReprintReceipt() {
	pauseBodyKeypress();
	$("#reprintNbrInput").val("");
	$("#reprintReceipt").show();
	$("#reprintLast").focus();

	$("#reprintList").prop("disabled", true);

	// set up keypresses for selection
	$("#reprintReceipt").off("keydown")
	$("#reprintReceipt").on("keydown", function(e) {
		if (e.which === 40) { // down arrow
			console.log("down arrow:", $("#reprintReceiptSelections").children(":focus").nextAll().not('label, br').first());
			$("#reprintReceiptSelections").children(":focus").nextAll().not('label, br').first().focus();
		} else if (e.which === 38) { // up arrow
			console.log("up arrow", $("#reprintReceiptSelections").children(":focus").prevAll().not('label, br').first());
			$("#reprintReceiptSelections").children(":focus").prevAll().not('label, br').first().focus();
		} else if (e.which === 13 && $("#reprintNbrInput").is(":focus")) { // enter on input
			$("#reprintNbr").trigger("click");
		} else if (e.which === 37 && $("#reprintNbrInput").is(":focus")) {
			$("#reprintNbr").focus();
		} else if (e.which === 39 && $("#reprintNbr").is(":focus")) {
			$("#reprintNbrInput").focus().select();
		} else if (e.key === "n" || e.key === "N") {
			$("#reprintNbr").focus();
		} else if (e.key === "t" || e.key === "T") {
			$("#reprintList").trigger("click");
		} else if (e.key === "g" || e.key === "G") {
			$("#reprintGift").trigger("click");
		} else if (e.key === "l" || e.key === "L") {
			$("#reprintLast").trigger("click");
		}
	});
}

function reprintReceiptCancel() {
	resetBodyKeypress();
	$("#reprintReceipt").hide();
}

/**
 * Handle reprinting of receipts
 * @param {string} request Type of receipt to reprint: 'last', 'nbr', 'list', 'gift' 
 * @return {void}
 **/
function reprintReceipt(request) {
	console.log("reprintReceipt:", request);
	switch(request) {
		case 'last':
			$.post("printLast?", {"drawer": drawer}, 
				function(reply) { 
					if (reply.result !== "success") {
						vex.dialog.alert({
							unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
									svgError + '</svg><br>' + reply.msg,
							className: 'vex-theme-wireframe',
							afterOpen: function () {
								lPauseKeys = true;
								playBuzzer();
							},
							afterClose: function () {
								lPauseKeys = false;
							}
						});
					}
				})
				.fail(function (xhr, status, errorThrown) {
					reprintReceiptCancel();
					var s = dict.error[languageVar] + " - " + xhr.responseText
					$(document).message({ content: s, html: true, expire: 8000 });
				})
				.always(function() {
					reprintReceiptCancel();
				});
			break;

		case 'nbr':
			if ($("#reprintNbrInput").val().trim() === "") {
				vex.dialog.alert({
					unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' +
							svgAlert + '</svg><br>' + dict.enterReceiptNbr[languageVar],
					className: 'vex-theme-wireframe',
					afterOpen: function () {
						lPauseKeys = true;
						playBuzzer();
					},
					afterClose: function () {
						lPauseKeys = false;
						$("#reprintNbrInput").focus().select();
					}
				});
				return;
			}
			$.post("printReceiptNbr?", {"drawer": drawer, "receiptNbr": $("#reprintNbrInput").val()}, 
				function(reply) { 
					if (reply.result !== "success") {
						vex.dialog.alert({
							unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
									svgError + '</svg><br>' + reply.msg,
							className: 'vex-theme-wireframe',
							afterOpen: function () {
								lPauseKeys = true;
								playBuzzer();
							},
							afterClose: function () {
								lPauseKeys = false;
							}
						});
					}
				})
				.fail(function (xhr, status, errorThrown) {
					reprintReceiptCancel();
					var s = dict.error[languageVar] + " - " + xhr.responseText
					$(document).message({ content: s, html: true, expire: 8000 });
				})
				.always(function() {
					reprintReceiptCancel();
				});
			break;

		case 'list':
			showReprintListFilter();
			break;

		case 'gift':
			$.post("printGift?", {"drawer": drawer}, 
				function(reply) { 
					if (reply.result !== "success") {
						vex.dialog.alert({
							unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
									svgError + '</svg><br>' + reply.msg,
							className: 'vex-theme-wireframe',
							afterOpen: function () {
								lPauseKeys = true;
								playBuzzer();
							},
							afterClose: function () {
								lPauseKeys = false;
							}
						});
					}
				})
				.fail(function (xhr, status, errorThrown) {
					reprintReceiptCancel();
					var s = dict.error[languageVar] + " - " + xhr.responseText
					$(document).message({ content: s, html: true, expire: 8000 });
				})
				.always(function() {
					reprintReceiptCancel();
				});
			break;
	}
}

function showReprintListFilter(fromCustPick) {
	const modal = document.getElementById('reprintListDialog');
	reprintReceiptCancel();
	pauseBodyKeypress();
	
	if (!fromCustPick) {
		// Set date inputs to yesterday's date by default
		let today = new Date();
		const date = today.setDate(today.getDate() - 1);
		const yesterday = new Date(date).toISOString().split('T')[0];
		$(".reprintListDateInput").val(yesterday);

		// Set max date to today's date
		today = new Date();
		$(".reprintListDateInput").attr("max", today.toISOString().split('T')[0]);

		$("#reprintListDrawer").val(drawer);

		if (customer.custData.custnum) {
			$("#reprintListCustomer").val(customer.custData.custnum);
			$("#reprintListCustomerDo").prop("checked", true).trigger("change");
		} else {
			$("#reprintListCustomer").val("");
		}

		$(".reprintListCheckboxes").prop("checked", false);
		$(".reprintListInputs").prop("disabled", true);
	}

	$("#reprintListDrawerDo").off("change");
	$("#reprintListDrawerDo").on("change", function() {
		if ($(this).prop("checked") === true) {
			$("#reprintListDrawer").prop("disabled", false);
		} else {
			$("#reprintListDrawer").prop("disabled", true);
		}
	});

	$("#reprintListDateStartDo").off("change");
	$("#reprintListDateStartDo").on("change", function() {
		if ($(this).prop("checked") === true) {
			$("#reprintListDateStart").prop("disabled", false);
		} else {
			$("#reprintListDateStart").prop("disabled", true);
		}
	});

	$("#reprintListDateEndDo").off("change");
	$("#reprintListDateEndDo").on("change", function() {
		if ($(this).prop("checked") === true) {
			$("#reprintListDateEnd").prop("disabled", false);
		} else {
			$("#reprintListDateEnd").prop("disabled", true);
		}
	});

	$("#reprintListCustomerDo").off("change");
	$("#reprintListCustomerDo").on("change", function() {
		if ($(this).prop("checked") === true) {
			$("#reprintListCustomerBttn").css("pointer-events", "auto");
			$("#reprintListCustomerBttn").css("color", "#1f6b93");
		} else {
			$("#reprintListCustomerBttn").css("pointer-events", "none");
			$("#reprintListCustomerBttn").css("color", "#a0a0a0");
		}
	});

	$("#reprintListCustomerBttn").off("click");
	$("#reprintListCustomerBttn").on("click", function() {
		closeReprintListDialog();
		showCustList("reprint");
	});

	if (!fromCustPick) {
		$(".reprintListCheckboxes").trigger("change");
	}

	modal.showModal();
}

function closeReprintListDialog() {
	const modal = document.getElementById('reprintListDialog');
	modal.close();
	resetBodyKeypress();
}

function doReprintFromList() {
	closeReprintListDialog();
	pauseBodyKeypress();
	$.spin('true');
	
	let filters = {};

	filters.last = 0;  // 0 = first set, further requests will pass inv nbr 
	                   // of last invoice in previous set for pagination
	// which filters to apply							 
	filters.doDrawer = $("#reprintListDrawerDo").prop("checked");
	filters.doStartDate = $("#reprintListDateStartDo").prop("checked");
	filters.doEndDate = $("#reprintListDateEndDo").prop("checked");
	filters.doCustomer = $("#reprintListCustomerDo").prop("checked");
	// filter values
	filters.drawer = $("#reprintListDrawer").val();
	filters.startDate = $("#reprintListDateStart").val();
	filters.endDate = $("#reprintListDateEnd").val();
	filters.customer = $("#reprintListCustomer").val();

	$.post("printReceiptList?", filters, function(reply) {
		if (reply.result !== "success") {
			vexAlert("Error: " + reply.msg);
		} else {
			// build table of invoices and let user select which one(s) to print
			showReprintListResults(reply);
		}
	})
	.fail(function (xhr, status, errorThrown) {
		var s = dict.errorMsg[languageVar] + " - " + xhr.responseText;
		vexAlert(s);
	})
	.always(function() {
		$.spin('false');
	});
}

function showReprintListResults(data) {
	const modal = document.getElementById('reprintListTableDialog');

	$("#reprintListTableBodyContent").empty();  // make sure table is clear before populating
	if (data.invoices.length === 0) {
		$("#reprintListTableBodyContent").append("<tr><td colspan='6'>No invoices found matching criteria</td></tr>");
	} else {
		data.invoices.forEach(function(inv) {
			let row = "<tr><td>" + inv.invoicenbr + "</td>" +
					  	 "<td>" + inv.date + "</td>" +
					  	 "<td>" + inv.time + "</td>" +
					  	 "<td>" + inv.drawer + "</td>" +
					  	 "<td>" + inv.amount + "</td>" +
					  	 "<td>" + inv.customer + "</td></tr>";
			$("#reprintListTableBodyContent").append(row);
		});
	}

	modal.showModal();
}

function closeReprintListTableDialog() {
	const modal = document.getElementById('reprintListTableDialog');
	modal.close();
	resetBodyKeypress();
}

function doExpense() {
	var lCancel = false;
	var over = $("#securityOverrideOK").attr("data-overUID");
console.log( "doExpense overUID='" + over + "'" );

	if (over==="" || over===undefined) {
		over = oldID;
console.log( "doExpense using oldID='" + over + "'" );
	} else {
		$("#securityOverrideOK").attr("data-overUID", "");
	}

	vex.dialog.open({
		input: [
			'<h3>' + dict.expensePayment[languageVar] + '</h3>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="vendSelect" class="expenseLabel">Vendor:</label>',
			        '<select id="vendSelect" name="vendSelect" size="1">',
					'<option value="MISC" selected>Miscellaneous</option>',
				    '</select>',
				'</div>',
			'</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="expenseAmount" class="expenseLabel">' + dict.depAmt[languageVar] + '</label>',
					'<input class="expenseInput" id="expenseAmount" name="expenseAmount" type="text" value="0.00" />',
					'<span id="expenseInputError" class="vexErrorMsg">Please enter amount.</span>',
			    '</div>',
		    '</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="expenseNote" class="expenseLabel">' + dict.Note[languageVar] + ':</label>',
				    '<input class="expenseInput" id="expenseNote" name="expenseNote" type="text" value="" maxlength="15" />',
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

			$(".vex-content").css({width: "700px"});

			var listitems = '';
			$.each(vendListData.data, function(idx, vend){
				listitems += '<option value="' + vend.vendnum + '">' + vend.company + '</option>';
			});
			$("#vendSelect").append(listitems);
			
			$("#vendSelect").off("change").on("change", function() {
				setTimeout( function() { $("#expenseAmount").focus().select(); }, 0 );
			});

			new AutoNumeric('#expenseAmount', { decimalPlaces: 2 });
			//$('.vex-content').draggable();

			setTimeout( function() {
				$("body").on("keyup", function(e) { if (e.which === 27) lCancel = true; } );
				$("button.vex-dialog-button-secondary").on("mouseup",function(){ console.log("cancel click"); lCancel = true; });
				$("#expenseAmount").focus().select();
			}, 100 );

		},
		beforeClose: function(data) {
			if (Number( $("#expenseAmount").val() ) !== 0 || lCancel) return true;
			$("#expenseInputError").show();
			playBuzzer();
			$("#expenseAmount").focus().select();
			return false;
		},
		afterClose: function () {
			resetBodyKeypress();
		},
		callback: function (data) {
			if (!data || lCancel) {
				return;
			} else if (Number( data.expenseAmount ) === 0) {
				vex.dialog.alert({
					unsafeMessage: dict.amountZero[languageVar],    // unsafeMessage option allows html in text
					className: 'vex-theme-wireframe',       // Overwrites defaultOptions
					afterOpen: function() {
						lPauseKeys = true; 
						playBuzzer();
						$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
					},
					afterClose: function() {lPauseKeys = false;}
				});
			} else {
				let vendnum = $("#vendSelect").val();
				console.log( "vendnum = '" + vendnum + "' data.vendSelect = '" + data.vendSelect + "'" );
				$.post("doExpense?", {
					amount: Number(data.expenseAmount), 
					user: over, 
					note: data.expenseNote, 
					station: drawer, 
					vendor: data.vendSelect
				},
				function(reply) {
					if (reply.result === "success") {
						let chtml = '<span class="messageText">' + dict.expenseSuccess[languageVar] + '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
						$(document).message({ content: chtml, html: true, expire: 5000 });
						playMagic();	
					} else if (reply.result) {
						vex.dialog.alert({
							unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
											svgError + '</svg><br>' + reply.result,        // unsafeMessage option allows html in text
							className: 'vex-theme-wireframe',   // Overwrites defaultOptions
							afterOpen: function() {
								lPauseKeys = true; 
								playBuzzer();
								$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
							},
							afterClose: function() {lPauseKeys = false;}
						});
					}
				});
			}
		}
	});
}

function showCashDrop() {
	console.log("showCashDrop pause keys", lPauseKeys);
	pauseBodyKeypress();

	$("#cashDropAmount").off('keypress');

	$("#cashDropAmount").on('keypress', function(e) {
		if (e.key === 'Enter') {
			$('#cashDropOK').click();
		}
		if ((e.key < '0' || e.key > '9') && e.key !== '.') {
			e.preventDefault(); // Prevents the character from being added to the input
		}
	});
	
	$("#cashDropAmount").val("");
	$("#cashDrop").show();
	$("#cashDropAmount").focus();
}

function cashDropCancel() {
	resetBodyKeypress();
	$("#cashDrop").hide();
	$("#cashDropError").text("");
}

function cashDrop() {
	let amt = $("#cashDropAmount").val();
	let overUID = $("#securityOverrideOK").attr("overUID");

	$("#securityOverrideOK").attr("data-overUID", ""); // erase override

	$.post("cashDrop?", {amount: amt, user: uid, override: overUID, drawer: drawer}, function(reply) {
		if (reply.result === 'success') {
			resetBodyKeypress();
			$("#cashDrop").hide();
		} else {
			$("#cashDropError").text(reply.msg);
			playBeep();
		}
	})
	.fail( function() {
		$("#cashDropError").text("Unexpected error encountered.");
	});
}

function doCashChk() {
	var lClose = false;

	vex.dialog.open({
		input: [
			'<h3>' + dict.cashChk[languageVar] + '</h3>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="cashChkAmount" class="expenseLabel">' + dict.depAmt[languageVar] + '</label>',
					'<input class="expenseInput" id="cashChkAmount" name="cashChkAmount" type="text" value="0.00" /><br>',
					'<span id="checkAmountError" class="vexErrorMsg">Please enter amount.</span>',
			        '<label for="cashChkNbr" class="expenseLabel">' + dict.cashChkNbr[languageVar] + ':</label>',
				    '<input class="expenseInput" id="cashChkNbr" name="cashChkNbr" type="text" value="" /><br>',
			        '<label for="cashChkFee" class="expenseLabel">' + dict.cashChkFee[languageVar] + ':</label>',
				    '<input class="expenseInput" id="cashChkFee" name="cashChkFee" type="text" value="" /><br>',
			        '<label for="cashBack" class="expenseLabel">' + dict.cashBack[languageVar] + ':</label>',
				    '<input class="expenseInput" id="cashBack" name="cashBack" type="text" value="0.00" disabled/>',
			    '</div>',
		    '</div>',
			'<div class="vex-custom-field-wrapper">',
			    '<div class="vex-custom-input-wrapper">',
			        '<label for="cashChkNote" class="expenseLabel">' + dict.Note[languageVar] + ':</label>',
				    '<input class="expenseInput" id="cashChkNote" name="cashChkNote" type="text" value="" maxlength="20" />',
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

			new AutoNumeric('#cashChkAmount', { decimalPlaces: 2 });
			new AutoNumeric('#cashChkNbr', {
				decimalPlaces: 0,
				digitGroupSeparator: ""
			});
			let feeInp = new AutoNumeric('#cashChkFee', { decimalPlaces: 2 });
			let cashInp = new AutoNumeric('#cashBack', { decimalPlaces: 2 });
			//$('.vex-content').draggable();

			setTimeout( function() {
				var feeVal = $("#cashChkFee").val();

				globalFocusElement = "#cashChkAmount";
				$("body").on("keyup", function(e) { 
					console.log("target id",e.target.id)
					if (e.which === 27) {
						lClose = true; 
					}
				});
				//$("button.vex-dialog-button-secondary").on("mouseup",function(){ console.log("cancel click"); lClose = true; });
				$(".vex-content button").on("mouseup",function(){ console.log("cancel click"); lClose = true; });
				$("#cashChkAmount").on("change", function(){
					let amt = Number($(this).val().replace(',', ''));
					let fees = cashChkFees( amt );
					let cash = amt - fees;
					console.log( "amt:", amt, "fees:", fees, "cash:", cash );
					feeInp.set( fees );
					cashInp.set( cash );
				});
				$(".vex-content").on("mouseup", function() {$(globalFocusElement).focus().select();} );
				$(".expenseInput").on("focus", function() {globalFocusElement='#' + $(this).attr("id")});
				$("#cashChkAmount").focus().select();
			}, 100 );

		},
		beforeClose: function(data) {
		    if (!lClose) {
				if (globalFocusElement === "#cashChkAmount") {
					$("#cashChkNbr").focus().select();
				} else if (globalFocusElement === "#cashChkNbr") {
					$("#cashChkFee").focus().select();
				} else if (globalFocusElement === "#cashChkFee") {
					$("#cashChkNote").focus().select();
				} else if (globalFocusElement === "#cashChkNote") {
					return true;
				}
			    return false;
			} else if (lClose) {
				return true;
			}

			$("#checkAmountError").show();
			playBuzzer();
			$("#cashChkAmount").focus().select();
			return false;
		},
		afterClose: function () {
			resetBodyKeypress();
			globalFocusElement = "";
		},
		callback: function (data) {
			console.log("data:",data);
			if (!data) {
				return;
			} else {
				let custnum = "";
				if (customer.custData.custnum) custnum = customer.custData.custnum;
				$.post("doCashCheck?", {
					amount: Number(data.cashChkAmount.replace(',', '')), 
					chkNbr: data.cashChkNbr? data.cashChkNbr : "",
					fees: Number(data.cashChkFee.replace(',','')),
					note: data.cashChkNote? data.cashChkNote : "",
					custnum: custnum, 
					user: uid, 
					station: drawer
				},
				function(reply) {
					if (reply.result === "success") {
						let chtml = '<span class="messageText">' + dict.cashChkSuccess[languageVar] + 
									'<span style="color: yellow;">$ ' + $("#cashBack").val() +
									'</span></span><span class="messageClose" onclick="messageRemove();">&times;</span>';
						$(document).message({ content: chtml, html: true, expire: 8000 });
						playMagic();	
					} else if (reply.result) {
						vex.dialog.alert({
							unsafeMessage: reply.result,        // unsafeMessage option allows html in text
							className: 'vex-theme-wireframe',   // Overwrites defaultOptions
							afterOpen: function() {
								lPauseKeys = true; 
								playBuzzer();
								$("button.vex-dialog-button-primary.vex-dialog-button.vex-first").focus();
							},
							afterClose: function() {lPauseKeys = false;}
						});
					}
				});
			}
		}
	});
}

function cashChkFees( amt ) {
	if (pSet.chkCashFeeType === "fixed") {
		console.log( "amt:", amt, "fee:", pSet.cashChkFlat + ( amt * ( pSet.cashChkPerc/100) ) );
		return pSet.cashChkFlat + ( amt * ( pSet.cashChkPerc/100) );
	} else {
		let arr = pSet.chkTableArray.filter( subArr => subArr[0] >= amt );
		console.log("arr:",arr);
		if (arr.length > 0) {
			arr.sort((el1, el2) => el1[0] - el2[0]);
			return arr[0][1] + ( amt * ( arr[0][2]/100) );
		} else {
			let last = pSet.chkTableArray.length-1;
			return pSet.chkTableArray[last][1] + ( amt * ( pSet.chkTableArray[last][2]/100) );
		}
	}
}

function titleCase(str) {
	return str.toLowerCase().split(' ').map(function(word) {
	  return word.replace(word[0], word[0].toUpperCase());
	}).join(' ');
}

function doPending() {
	if (dataSet.data.length === 0) {
		$.post( "getPendings?", {station: stationID}, function(reply) {
			if (reply.pendings) {
				showPendings(reply.pendings);
			} else if (reply.result && reply.msg) {
				vex.dialog.alert({
				    unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
									svgError + '</svg><br>' + reply.msg, // unsafeMessage option allows html in text
				    className: 'vex-theme-wireframe' // Overwrites defaultOptions
			    });
			}
		})
		.fail(function () {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
								svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe' // Overwrites defaultOptions
			});
		});
	} else {
		let custnum = "";
		if (customer.custData.custnum) {
			custnum = customer.custData.custnum;
			makePending( {custnum: custnum, nickName: ""} );
		} else {
			var lCancel = false;

			vex.dialog.open({
				input: [
					'<h3>' + dict.createPT[languageVar] + '</h3>',
					'<div class="vex-custom-field-wrapper">',
						'<div class="vex-custom-input-wrapper">',
							'<label for="PTnickname" class="f7Label">' + dict.nickname[languageVar] + ':</label>',
							'<input class="vexHoldInput" id="PTnickname" name="PTnickname" type="text" />',
							'<br><span id="nicknameError" class="vexNicknameErrorMsg">' + dict.nicknameErrMsg[languageVar] + '.</span>',
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
		
					$(".vex-content").css({width: "700px"});
		
					setTimeout( function() {
						$("body").on("keyup", function(e) { if (e.which === 27) lCancel = true; } );
						$("button.vex-dialog-button-secondary").on("mouseup",function(){ console.log("cancel click"); lCancel = true; });
						$("#PTnickname").focus().select();
					}, 10 );
		
				},
				beforeClose: function(data) {
					if ($("#PTnickname").val().trim() !== "" || lCancel) return true;
					$("#nicknameError").show();
					playBuzzer();
					$("#PTnickname").focus().select();
					return false;
				},
				afterClose: function () {
					resetBodyKeypress();
				},
				callback: function (data) {
					if (!data || lCancel) {
						return;
					} else {
						let nickname = $("#PTnickname").val();
						makePending( {custnum: "", nickName: nickname} );
					}
				}
			});
		}
	}
}

function makePending(dataIn) {
	var total = Number($("#total").text().replace(/,/g, ''));

	$.post("makePending?",
		{
			data: JSON.stringify(dataSet.data),
			tax: JSON.stringify(taxExempt),
			custnum: dataIn.custnum,
			nickname: dataIn.nickName,
			total: total,
			user: uid,
			station: stationID
		},
		function(reply) {
			if (reply.result && reply.result === 'success') {
				actOnClear();
				chtml = '<span class="messageText">' + dict.pendingSaved[languageVar] + '</span><span class="messageClose" onclick="messageRemove();">&times;</span>';
			  $(document).message({ content: chtml, html: true, expire: 8000 });
		    } else if (reply.result && reply.msg) {
			    vex.dialog.alert({
				    unsafeMessage: reply.msg, // unsafeMessage option allows html in text
				    className: 'vex-theme-wireframe' // Overwrites defaultOptions
			    });
			}
		}
	)
	.fail(function () {
		vex.dialog.alert({
			unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
							svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
			className: 'vex-theme-wireframe' // Overwrites defaultOptions
		});
	})
	.always(function () {
		focusBarc();
	});
}

function showPendings(data) {
	var db = {
		loadData: function(filter) {
			
			let cName = filter.Name.toUpperCase();
			if ($("#pendingsHoldButton").text() === "ALL" && cName.indexOf("HOLD:") === -1 && filter.Name.trim().length > 0) {
				cName = "HOLD: " + cName;
			}
			console.log( "cName:", cName);
			
		    return $.grep(this.items, function(item) {
				return (!filter.Nbr || item.Nbr.indexOf(filter.Nbr.toString()) > -1)
					&& (!filter.Name || item.Name.toUpperCase().indexOf(cName) > -1)  // item.Name.indexOf(cName > -1))
					&& (!filter.Company || item.Company.indexOf(filter.Company.toUpperCase()) > -1)
					&& (!filter.Date || item.Date.indexOf(filter.Date.toUpperCase()) > -1)
					&& (!filter.Total || item.Total.indexOf(filter.Total.toUpperCase()) > -1)
			});
		},
		items: data
	};

	var listFields = [
		{ name: "Nbr", type: "number", width: 50 },
		{ name: "Name", type: "text", width: 150, align: "left" },
		{ name: "Company", type: "text", width: 150, align: "left" },
		{ name: "Date", type: "text", width: 75 },
		{ name: "Total", type: "text", width: 100, align: "right" }
	];

	pauseBodyKeypress();
	$("#scanText").prop("disabled",true);
	$("#ModalPendings").show();

	$("#pendingsListTableDiv").jsGrid({
		width: "100%",
		height: "calc( 100% - 30px )",
	
		filtering: true,
		editing: false,
		sorting: true,
		paging: false,
	
		data: data,
		controller: db,
	
		fields: listFields,

		onDataLoaded: function(grid,data) {
			console.log("onDataLoaded");
			var filter = $("#pendingsListTableDiv").jsGrid("getFilter");

			for (let [key, value] of Object.entries(filter)) {
				if (value && value.length > 0) {
					var nPos = listFields.findIndex(function (element) { return element.name === key });
					$("#pendingsListTableDiv tbody td:nth-child(" + (nPos + 1) + ")").each(function () {
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

			$("#pendingsListTableDiv input").attr( 'type', 'search' );
			$("#pendingsListTableDiv input").on('search', function(){console.log("change"); if ($(this).val()==="") { $("#pendingsListTableDiv").jsGrid("loadData")}});

			lPauseKeys = true;
		},

		onRefreshed: function() {
			console.log("onRefreshed");
			var filter = $("#pendingsListTableDiv").jsGrid("getFilter");
			console.log( "filter:", filter );

			for (let [key, value] of Object.entries(filter)) {
				console.log("key:",key,"type:",typeof key);
				if (value && value.length > 0) {
					var nPos = listFields.findIndex(function (element) { return element.name === key });
					$("#pendingsListTableDiv tbody td:nth-child(" + (nPos + 1) + ")").each(function () {
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

			$("#pendingsListTableDiv input").attr( 'type', 'search' );

            lPauseKeys = true;
		},

		rowClick: function(args) {
			$.post( "loadPending?", {selected: args.item.Nbr},
			    function(reply) {
					if (reply.items) {
						$.each( reply.items, function(idx,line) {
							dataSet.data.push(line);
						});
						localStorage.setItem('dataSet', JSON.stringify(dataSet));
						if (reply.customer) {
							custListPick( reply.customer );
						}
						closePendings();
						saleTableLoadData();
						updateTotalBox();
				    } else if (reply.msg) {
						vex.dialog.alert({
							unsafeMessage: reply.msg, // unsafeMessage option allows html in text
							className: 'vex-theme-wireframe' // Overwrites defaultOptions
						});
					} else {
						vex.dialog.alert({
							unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
											svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
							className: 'vex-theme-wireframe' // Overwrites defaultOptions
						});
				    };
			})
			.fail(function () {
				vex.dialog.alert({
					unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
									svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
					className: 'vex-theme-wireframe' // Overwrites defaultOptions
				});
			});
		}
	});

	$("#pendingsHoldButton").on("click", function() {
		$("#pendingsListTableDiv input").val("");
		if ($("#pendingsHoldButton").text() === "Hold Only") {
			$("#pendingsHoldButton").text("ALL");
			$("#pendingsListTableDiv").jsGrid("search", {Nbr: "", Name: "HOLD:", Company: "", Date: "", Total: ""});
		} else {
			$("#pendingsHoldButton").text("Hold Only");
			$("#pendingsListTableDiv").jsGrid("search", {Nbr: "", Name: "", Company: "", Date: "", Total: ""});
		}
		setTimeout( function() { $("#pendingsListTableDiv .jsgrid-cell input:eq(1)").focus().select(); }, 10 )
	});

	setTimeout( function() { $("#pendingsListTableDiv .jsgrid-cell input:eq(0)").focus().select(); }, 10 )
}

function closePendings() {
	$("#scanText").prop("disabled",false);
	$("#pendingsHoldButton").off("click")
	$("#ModalPendings").hide();
	$("#pendingsListTableDiv").empty();
	resetBodyKeypress();
}

function showCustSeek() {
	lPauseKeys = true;
	$("#custSeekGoDiv").show();
	$("#custSeekMsg").hide();

	$('input[type=radio][name=custSeekForm]').change(function() {
		$("#custSeekGoDiv").show();
		$("#custSeekMsg").hide();
	});
	$("#custSeekStr").on('input', function() {
		$("#custSeekGoDiv").show();
		$("#custSeekMsg").hide();
	});
	
	$("#custSeek").show();
	$("#custSeekStr").focus();
}

function custSeekActions(e) {
	if (e.which === 13) {
		$("#custSeekGoDiv").hide();
		$.post("custWildSeek?", { string: $("#custSeekStr").val(), format: $("input[name='custSeekForm']:checked").val() }, function (reply) {
			console.log("custWildSeek replied:", reply.data);
			console.log("reply.data.length:", reply.data.length);
			custListData = reply;
			console.log("custListData.data.length:",custListData.data.length);
			if (custListData.data.length === 0) {
				$("#custSeekMsg").html("Sorry, not found.");
				$("#custSeekGoDiv").hide();
				$("#custSeekMsg").show();
			} else if (custListData.data.length === 1) {
				closeCustSeek();
				custListPick(custListData.data[0]);
			} else {
				closeCustSeek();
				custListTable = makeJSGridObject("customer");
			}
		});
	} else if (e.which===27) {
		closeCustSeek();
	}
}

function closeCustSeek() {
	lPauseKeys = false;
	$("#custSeek").hide();
	$("#custSeekMsg").html("").hide();
	$("#custSeekGoDiv").show();
	$("#custSeekStr").val("");
}

function showDrawerClose() {
	$.spin("true");

	$.post("getDrawerCloseData?", { drawer: drawer }, function (reply) {
		if (reply.result && reply.result === 'success') {
			let an;
			let arr = [];

			an = new AutoNumeric('#counted_bank', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_payouts', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_drops', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_cash', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_card', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_gift', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_tender5', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_tender6', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_tender7', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_tender8', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_checks', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_coupons', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_house', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_foreign', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);
			an = new AutoNumeric('#counted_round', { decimalPlaces: 2, digitGroupSeparator: "" });
			arr.push(an);


			// store AutoNumeric instances for later use
			$("#drawerCloseContainer").data('autoNumericList', arr);

			$('#expected_cash').val(reply.totalCash.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_cash');
			an.set(reply.totalCash.toFixed(2));
			$('#expected_card').val(reply.totalCard.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_card');
			an.set(reply.totalCard.toFixed(2));
			$('#expected_tender5').val(reply.total5.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_tender5');
			an.set(reply.total5.toFixed(2));
			$('#expected_tender6').val(reply.total6.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_tender6');
			an.set(reply.total6.toFixed(2));
			$('#expected_tender7').val(reply.total7.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_tender7');
			an.set(reply.total7.toFixed(2));
			$('#expected_tender8').val(reply.total8.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_tender8');
			an.set(reply.total8.toFixed(2));
			$('#expected_foreign').val(reply.totalForeign.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_foreign');
			an.set(reply.totalForeign.toFixed(2));
			$('#expected_gift').val(reply.totalGift.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_gift');
			an.set(reply.totalGift.toFixed(2));
			$('#expected_checks').val(reply.totalCheck.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_checks');
			an.set(reply.totalCheck.toFixed(2));
			$('#expected_coupons').val(reply.totalCoupon.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_coupons');
			an.set(reply.totalCoupon.toFixed(2));
			$('#expected_bank').val(reply.totalBank.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_bank');
			an.set(reply.totalBank.toFixed(2));
			$('#expected_payouts').val(reply.totalExp.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_payouts');
			an.set(reply.totalExp.toFixed(2));
			$('#expected_drops').val(reply.totalDrops.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_drops');
			an.set(reply.totalDrops.toFixed(2));
			$('#expected_house').val(reply.totalHouse.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_house');
			an.set(reply.totalHouse.toFixed(2));
			$('#expected_round').val(reply.totalRound.toFixed(2));
			an = AutoNumeric.getAutoNumericElement('#counted_round');
			an.set(reply.totalRound.toFixed(2));

			$('#expected_totalDep').text((reply.totalIn-reply.totalOut+reply.totalBank).toFixed(2));

			$('[id^="counted_"]').on('change', function () {
				console.log("changed:", this.id);
				drawerRecalc();
			});

			//  report sections to append on print
			$("#summarySales").text(reply.totalSales.toFixed(2));
			$("#summaryCoupons").text(reply.totalCoupon.toFixed(2));
			$("#summaryTax1").text(reply.tax1.toFixed(2));
			$("#summaryTax2").text(reply.tax2.toFixed(2));
			$("#summaryTax3").text(reply.tax3.toFixed(2));
			$("#summaryFlatTax").text(reply.flatTax.toFixed(2));
			$("#summaryVolTax").text(reply.volTax.toFixed(2));
			$("#summaryBottDeposits").text(reply.bottDeposit.toFixed(2));
			$("#summaryReturns").text((-1 *reply.bottReturns).toFixed(2));
			$("#summaryPayments").text(reply.totalPayment.toFixed(2));
			$("#summaryNetLotto").text(reply.lottoTotal.toFixed(2));
			$("#summaryTotalInCount").html("<strong>" + reply.totalIn.toFixed(2) + "</strong>");
			$("#summaryTotalOutCount").html("<strong>" + reply.totalOut.toFixed(2) + "</strong>");
			$("#summaryPayOuts").text(reply.totalExp.toFixed(2));
			$("#summaryHouseCharges").text(reply.totalHouse.toFixed(2));
			$("#summaryOverShortIn").text(reply.totalIn.toFixed(2));
			$("#summaryOverShortOut").text(reply.totalOut.toFixed(2));
			$("#summaryOpenBank").text(reply.totalBank.toFixed(2));
			$("#summaryExpectedDrawer").text((reply.totalIn-reply.totalOut+reply.totalBank).toFixed(2));
			$("#breakdownItems").text(reply.qtySold);
			$("#breakdownSales").text(reply.totalCusts);
			$("#breakdownAvgSale").text(reply.avgTicket.toFixed(2));
			$("#breakdownAvgPrice").text(reply.avgPrice.toFixed(2));
			$("#breakdownTips").text(reply.totalTips.toFixed(2));

			if (pSet.doTax1) {
				$("#summaryTax1Label").text(pSet.tax1Label);
				$("#summaryTax1Label").show();
				$("#summaryTax1").show();
			} else {
				$("#summaryTax1Label").hide();
				$("#summaryTax1").hide();
			}
			if (pSet.doTax2) {
				$("#summaryTax2Label").text(pSet.tax2Label);
				$("#summaryTax2Label").show();
				$("#summaryTax2").show();
			} else {
				$("#summaryTax2Label").hide();
				$("#summaryTax2").hide();
			}
			if (pSet.doTax3) {
				$("#summaryTax3Label").text(pSet.tax3Label);
				$("#summaryTax3Label").show();
				$("#summaryTax3").show();
			} else {
				$("#summaryTax3Label").hide();
				$("#summaryTax3").hide();
			}
			if (pSet.doFlatTax) {
				$("#summaryFlatTaxLabel").text(pSet.flatTaxLabel);
				$("#summaryFlatTaxLabel").show();
				$("#summaryFlatTax").show();
			} else {
				$("#summaryFlatTaxLabel").hide();
				$("#summaryFlatTax").hide();
			}
			if (pSet.doVolTax) {
				$("#summaryVolTaxLabel").text(pSet.volTaxLabel);
				$("#summaryVolTaxLabel").show();
				$("#summaryVolTax").show();
			} else {
				$("#summaryVolTaxLabel").hide();
				$("#summaryVolTax").hide();
			}
			if (pSet.tenderDoTips) {
				$("#breakdownTipsLabel").show();
				$("#breakdownTips").show();
			} else {
				$("#breakdownTipsLabel").hide();
				$("#breakdownTips").hide();
			}
			if (pSet.tenderType5.trim() === '') {
				$("#tender5Row").hide();
			} else {
				$("#tender5Label").text(titleCase(pSet.tenderType5));
			}
			if (pSet.tenderType6.trim() === '') {
				$("#tender6Row").hide();
			} else {
				$("#tender6Label").text(titleCase(pSet.tenderType6));
			}
			if (pSet.tenderType7.trim() === '') {
				$("#tender7Row").hide();
			} else {
				$("#tender7Label").text(titleCase(pSet.tenderType7));
			}
			if (pSet.tenderType8.trim() === '') {
				$("#tender8Row").hide();
			} else {
				$("#tender8Label").text(titleCase(pSet.tenderType8));
			}
			if (pSet.doLotto) {
				$("#summaryNetLottoLabel").show();
				$("#summaryNetLotto").show();
			} else {
				$("#summaryNetLottoLabel").hide();
				$("#summaryNetLotto").hide();
			}
			if (!pSet.tenderForeign) {
				$("#foreignRow").hide();
			}
			if (!pSet.pennyRound) {
				$("#pennyRound").hide();
			}

			$("#drawerCloseNbr").text(drawer);

			$("#drawerClose").data("grandTotal", reply.grandTotal.toFixed(2));

			$("#summaryDiv").hide();
			$("#breakdownDiv").hide();
			$(".closeDrawerOuts").hide();

			$.spin(false);

			pauseBodyKeypress();

			$("#drawerClose").show();

			const datetimeInput = document.getElementById('close_time');

			// Get current date and time
			const now = new Date();

			// Format the date and time for datetime-local (YYYY-MM-DDTHH:MM)
			const year = now.getFullYear();
			const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
			const day = now.getDate().toString().padStart(2, '0');
			const hours = now.getHours().toString().padStart(2, '0');
			const minutes = now.getMinutes().toString().padStart(2, '0');

			const formattedDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;

			datetimeInput.value = formattedDatetime;

			const clerkUID = document.getElementById('clerk_name');
			const name = getCookie('user') + ' ' + getCookie('userLast');
			clerkUID.value = name;

			// attach recalc handlers to counted/expected inputs
			const inputs = Array.from(document.querySelectorAll('input[type=number]'));
			inputs.forEach(i => i.addEventListener('input', drawerRecalc));

			$("#recalcBtn").off('click');
			document.getElementById('recalcBtn').addEventListener('click', drawerRecalc);

			$("#clearBtn").off('click');
			document.getElementById('clearBtn').addEventListener('click', function () {
				const form = document.getElementById('drawerCloseForm');
				form.reset();
				drawerClear();
				drawerRecalc();
			});

			$("#cancelBtn").off('click');
			document.getElementById('cancelBtn').addEventListener('click', function () {
				drawerClear();
				closeDrawerClose();
			});

			$("#saveBtn").off('click');
			$("#saveBtn").on('click', function (event) {
				// assemble payload and send
				postDrawerClose(event);
			});

			// initial values and recalc
			drawerRecalc();

			const focusEl = document.getElementById('counted_cash');
			focusEl.addEventListener('focus', () => {
				focusEl.select();
			});
			focusEl.focus();
		} else {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' +
					svgError + '</svg><br>' + reply.msg, // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe' // Overwrites defaultOptions
			});
		}
	})
		.fail(function () {
			$.spin("false");
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' +
					svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe' // Overwrites defaultOptions
			});
		})
		.always(function () {
			focusBarc();
		});
}

function drawerRecalc() {
	// Recalculate totals and variance
	const expectedIds = ['expected_bank', 'expected_payouts', 'expected_drops', 'expected_cash', 'expected_card', 'expected_gift', 'expected_tender5', 'expected_tender6', 'expected_tender7', 'expected_tender8', 'expected_checks', 'expected_coupons', 'expected_house', 'expected_foreign', 'expected_round'];
	const countedIds = ['counted_bank', 'counted_payouts', 'counted_drops', 'counted_cash', 'counted_card', 'counted_gift', 'counted_tender5', 'counted_tender6', 'counted_tender7', 'counted_tender8', 'counted_checks', 'counted_coupons', 'counted_house', 'counted_foreign', 'counted_round']
	const varianceIds = ['variance_bank', 'variance_payouts', 'variance_drops', 'variance_cash', 'variance_card', 'variance_gift', 'variance_tender5', 'variance_tender6', 'variance_tender7', 'variance_tender8', 'variance_checks', 'variance_coupons', 'variance_house', 'variance_foreign', 'variance_round']
	let expectedTotal = 0;
	let countedTotal = 0;

	expectedIds.forEach(id => { const el = document.getElementById(id); expectedTotal += drawerParseAmt(el); if (el) el.value = el.value === '' ? '' : fmt(drawerParseAmt(el)); });
	countedIds.forEach(id => { const an = AutoNumeric.getAutoNumericElement('#' + id);
							   countedTotal += an ? an.getNumber() : 0; });
	$.each( varianceIds, function(idx,id){
		const vEl = document.getElementById(id);
		const expectedEl = document.getElementById( expectedIds[idx] );
		const countedEl = document.getElementById( countedIds[idx] );
		const expectedAmt = drawerParseAmt( expectedEl );
		const an = AutoNumeric.getAutoNumericElement('#' + countedIds[idx]);
		const countedAmt = an ? an.getNumber() : 0;
		const varianceAmt = countedAmt - expectedAmt;

		let vText = fmt( varianceAmt );
		$("#" + id).text(vText);
		vEl.classList.remove('positive', 'negative');
		if (varianceAmt > 0.005) vEl.classList.add('positive');
		if (varianceAmt < -0.005) vEl.classList.add('negative');
	});

	document.getElementById('expected_total').value = fmt(expectedTotal);
	document.getElementById('counted_total').value = fmt(countedTotal);

	const variance = countedTotal - expectedTotal;

	let countedBank = countedTotal - drawerParseAmt( document.getElementById('counted_house') ) - drawerParseAmt( document.getElementById('counted_bank') );
	let depositVariance = countedBank - parseFloat( $("#expected_totalDep").text() );
	$("#counted_totalDep").text(fmt(countedBank));
	$("#variance_totalDep").text(fmt(depositVariance));
	$("#variance_totalDep").removeClass('positive', 'negative');
	if (depositVariance > 0.005) $("#variance_totalDep").addClass('positive');
	if (depositVariance < -0.005) $("#variance_totalDep").addClass('negative');

	$("#summaryCountedDrawer").text(fmt(countedBank));
	$("#summaryOverShortTotal").html("<strong>" + fmt(variance) + "</strong>");

	const vEl = document.getElementById('variance');
	$("#variance").text(fmt(variance));
	vEl.classList.remove('positive', 'negative');
	if (variance > 0.005) vEl.classList.add('positive');
	if (variance < -0.005) vEl.classList.add('negative');
}

function drawerParseAmt(el) {
	const v = (el && el.value !== undefined) ? el.value : 0;
	const n = parseFloat(String(v).replace(/[^0-9.-]+/g, ''));
	return isFinite(n) ? n : 0;
}

// Format number as fixed 2-decimal string
function fmt(n) { return(Math.round(n * 100) / 100).toFixed(2); }

function drawerClear() {
	const form = document.getElementById('drawerCloseForm');
	let arr = $("#drawerCloseContainer").data('autoNumericList');
	const countedIds = ['counted_bank', 'counted_payouts', 'counted_drops', 'counted_cash', 'counted_card', 'counted_gift', 'counted_tender5', 'counted_tender6', 'counted_tender7', 'counted_tender8', 'counted_checks', 'counted_coupons', 'counted_house', 'counted_foreign']
	form.reset();
	// set counted defaults to 0.00 for visibility
	countedIds.forEach(id => { const e = document.getElementById(id); if (e) e.value = '0.00'; });
	// clear expected values and remove AutoNumeric instances
	$(".expected").each( function(idx,el) {
		$(el).val('0.00');
	});
	$.each(arr, function(idx,an){
		an.remove();
	});
	$("#drawerCloseContainer").data('autoNumericList', []);
	drawerRecalc();
}

function closeDrawerClose() {
	resetBodyKeypress();
	$("#drawerClose").hide();
	$("#drawerCloseNbr").text("");
	$("#recalcBtn").off('click');
	$("#clearBtn").off('click');
	$("#cancelBtn").off('click');
	$("#saveBtn").off('click');
	$("#drawerClose").data('grandTotal', "");
	drawerClear();
	focusBarc();
}

function postDrawerClose(event) {
	event.stopPropagation();
	let print = (pSet.drwClosePrintFormat === '40');

	drawerRecalc();

	let obj = {
		drawer: drawer,
		name: getCookie('user') + ' ' + getCookie('userLast'),
		time: $("#close_time").val(),
		drops: [ $("#counted_drops").val(), $("#expected_drops").val(), $("#variance_drops").text() ],
		cash: [ $("#counted_cash").val(), $("#expected_cash").val(), $("#variance_cash").text() ],
		card: [ $("#counted_card").val(), $("#expected_card").val(), $("#variance_card").text() ],
		gift: [ $("#counted_gift").val(), $("#expected_gift").val(), $("#variance_gift").text() ],
		checks: [ $("#counted_checks").val(), $("#expected_checks").val(), $("#variance_checks").text() ],
		coupons: [ $("#counted_coupons").val(), $("#expected_coupons").val(), $("#variance_coupons").text() ],
		foreign: [ $("#counted_foreign").val(), $("#expected_foreign").val(), $("#variance_foreign").text() ],
		tender5: [ $("#counted_tender5").val(), $("#expected_tender5").val(), $("#variance_tender5").text() ],
		tender6: [ $("#counted_tender6").val(), $("#expected_tender6").val(), $("#variance_tender6").text() ],
		tender7: [ $("#counted_tender7").val(), $("#expected_tender7").val(), $("#variance_tender7").text() ],
		tender8: [ $("#counted_tender8").val(), $("#expected_tender8").val(), $("#variance_tender8").text() ],
		totalDeposit: [ $("#counted_totalDep").text(), $("#expected_totalDep").text(), $("#variance_totalDep").text() ],
		house: [ $("#counted_house").val(), $("#expected_house").val(), $("#variance_house").text() ],
		bank: [ $("#counted_bank").val(), $("#expected_bank").val(), $("#variance_bank").text() ],
		payouts: [ $("#counted_payouts").val(), $("#expected_payouts").val(), $("#variance_payouts").text() ],
		totalTotal: [ $("#counted_total").val(), $("#expected_total").val(), $("#variance").text() ],
		sales: $("#summarySales").text(),
		tax1: $("#summaryTax1").text(),
		tax2: $("#summaryTax2").text(),
		tax3: $("#summaryTax3").text(),
		flatTax: $("#summaryFlatTax").text(),
		volTax: $("#summaryVolTax").text(),
		bottDeposits: $("#summaryBottDeposits").text(),
		netLotto: $("#summaryNetLotto").text(),
		bottReturns: $("#summaryReturns").text(),
		payments: $("#summaryPayments").text(),
		netLotto: $("#summaryNetLotto").text(),
		totalIn: $("#summaryTotalInCount").text(),
		totalOut: $("#summaryTotalOutCount").text(),
		overShortTotal: $("#summaryOverShortTotal").text(),
		openBank: $("#summaryOpenBank").text(),
		expectedDrawer: $("#summaryExpectedDrawer").text(),
		breakdownItems: $("#breakdownItems").text(),
		breakdownSales: $("#breakdownSales").text(),
		breakdownAvgSale: $("#breakdownAvgSale").text(),	
		breakdownAvgPrice: $("#breakdownAvgPrice").text(),
		breakdownTips: $("#breakdownTips").text(),
		forExchRate: pSet.tenderForeignExchRate,
		grandTotal: $("#drawerClose").data("grandTotal")
	};
console.log( "grandTotal:", obj.grandTotal);

	$.post("posDrawerClose?", {print: print, data: JSON.stringify(obj)}, function (reply) {
		closeDrawerClose();
		if (reply.result && reply.result !== 'success') {
			vex.dialog.alert({
				unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' +
					svgError + '</svg><br>' + reply.msg, // unsafeMessage option allows html in text
				className: 'vex-theme-wireframe' // Overwrites defaultOptions
			});
		}
		if (!(pSet.drwClosePrintFormat === '40')) {
			$("#summaryDiv").show();
			$("#breakdownDiv").show();
    		window.print(); // Trigger the print dialog
		}
	})
	.fail(function () {
		vex.dialog.alert({
			unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' +
				svgError + '</svg><br>' + dict.errorMsg[languageVar], // unsafeMessage option allows html in text
			className: 'vex-theme-wireframe' // Overwrites defaultOptions
		});
	});
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

/**
  * Wrapper for vex.dialog.alert
  * @param {Text} txt Text to display in alert box
  * @param {Text} cEl Optional - element to focus after alert closes
  */
function vexAlert(txt, cEl) {
	vex.dialog.alert({
		unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' + txt,
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

function playNotify() {
	var audio = new Audio('/sounds/notify.wav');
	audio.play();
}

function defaultpSet() {
	return {
		qtyCheck: true
	};
}

function findReceipt( str ) {
	if (dataSet.data.length > 0) {
		vexAlert("Please clear the current sale first.", 'scanText');
		return;
	}

	$.spin('true');

	$.post('findReceipt?', { invoice: str }, function (reply) {
		if (reply.result !== 'success') {
			$.spin('false');
			vexAlert('Receipt not found.', 'scanText');
		} else {
			// Prompt user whether we found the right one
			$.spin('false');

			vex.dialog.confirm({
				unsafeMessage: '<h3><img id="invRecallIcon" src="./images/question.png" height="24" width="24"/> ' + 
					dict.invRecall[languageVar] + '</h3>' +
					'<div class="invRecallDetails">' +
					dict.foundInv[languageVar] + ':<br>' +
					dict.invNbr[languageVar] + ': ' + reply.invoice + '<br>' +
					dict.invSta[languageVar] + ': ' + reply.station + '<br>' +
					dict.invDate[languageVar] + ': ' + reply.date + '<br>' +
					'Total: $' + reply.total + '<br><br>' +
					dict.invRecallPrompt[languageVar] +
					'</div>',
				className: 'vex-theme-multiButtons',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, { text: dict.Yes[languageVar] }),
					$.extend({}, vex.dialog.buttons.NO, { text: dict.No[languageVar] })
				],
				afterOpen: function () {
					lPauseKeys = true;
					shortcut.remove('esc');
				},
				afterClose: function () {
					shortcut.add('esc', function () { escKeyFunc(); });
					lPauseKeys = false;
				},
				callback: function (value) {
					if (value) {
						dataSet.data = reply.items;
						localStorage.setItem('dataSet', JSON.stringify(dataSet));

						saleTableLoadData();
						updateTotalBox();

						currLine = 1;
						paintCurrentLine();
					}
				}
			});
		}
	})
	.fail( function() {
		$.spin('false');
		vexAlert('An error occurred while finding the receipt.', 'scanText');
	});
}

function showTimeClock() {
   const modal = document.getElementById("timeClockDialog");
   closeNav();
	$("#timeClockIconSvg").html(svgClock);
	lPauseKeys = true;
	pauseBodyKeypress();
    modal.showModal();

	$("#timeClockUser").val('');
	$("label.radioButton input").prop("checked", false);
	$("#timeClockOkBtn").prop("disabled", true);
	$("label.radioButton").addClass("radioButtonDisabled");

	$("#timeClockUser").on('change', function() {
		if ($(this).val().trim() !== '') {
			$("#timeClockOkBtn").prop("disabled", false);
			$("label.radioButton").removeClass("radioButtonDisabled");
		} else {
			$("#timeClockOkBtn").prop("disabled", true);
			$("label.radioButton").addClass("radioButtonDisabled");
		}
	});
}

function closeTimeClock() {
    const modal = document.getElementById("timeClockDialog");
    modal.close();
	lPauseKeys = false;
	resetBodyKeypress();
}

function submitTimeClock() {
	let inOut = $('input[name="timeClockInOut"]:checked').val();
	let userID = $('#timeClockUser').val().trim().toUpperCase();

	if (userID === '') {
		vexAlert('Please enter a User ID.', 'timeClockUser');
		return;
	}

	console.log('Time Clock In/Out:', inOut, ' User ID:', userID);

	$.post('submitTimeClock', { inOut: inOut, userID: userID }, function (reply) {
		if (reply.result === 'success') {
			closeTimeClock();
		} else {
			closeTimeClock();
			vexAlert('An error occurred while submitting the time clock.', 'timeClockDialog');
		}
	})
	.fail(function() {
		closeTimeClock();
		vexAlert('An error occurred while submitting the time clock.', 'timeClockDialog');
	});
}

function showGiftCard() {
	if (!pSet.giftCertDo) {
		doNothing(); // should not be here, but just in case
		return;
	}
	const modal = document.getElementById("giftCardDialog");
	closeNav();
	$("#giftCardIconSvg").html(svgGiftCard);

	$("#giftCardNbr").val('');
	$("#giftCardAmount").val('');
	$("#giftCardOkBtn").prop("disabled", true);
	$("#giftCardAdd").hide();

	let inp = $("#giftCardNbr");	if (inp.length > 0) {
		let an1 = new AutoNumeric(inp[0], { decimalPlaces: 0, emptyInputBehavior: 'null', maximumValue: '9999999', minimumValue: '0', digitGroupSeparator: '', roundingMethod: 'C', caretPositionOnFocus: null });
		an1.set("0");
	}

	let el = $("#giftCardAmount");	if (el.length > 0) {
		let an2 = new AutoNumeric(el[0], { decimalPlaces: 2, emptyInputBehavior: 'null', maximumValue: '9999999.99', minimumValue: '0', digitGroupSeparator: '', roundingMethod: 'C', caretPositionOnFocus: null });
		an2.set("0");
	}

	if (pSet.giftCertType !== 'print') {
		$(".giftCardInHouseOnly").hide();
		$("#giftCardNewOrAddDiv").show();
		$("#giftCardAmount").prop("disabled", false);

		$(".circle-btn").off('click');
		$(".circle-btn").on('click', function() {
			let an = AutoNumeric.getAutoNumericElement('#giftCardAmount');
			let currentVal = an ? an.getNumber() : 0;
			$(".circle-btn").removeClass("circle-btn-pressed");
			$(this).addClass("circle-btn-pressed");
			if ($(this).attr("id") !== "giftCardBalBtn") {
				$("#giftCardAmount").prop("disabled", false);
				$("#giftCardOkBtn").prop("disabled", currentVal <= 0);
				$("#giftCardAmount").focus();
			} else {
				$("#giftCardAmount").prop("disabled", true);
				$("#giftCardOkBtn").prop("disabled", false);
			}
		});

		$("#giftCardAmount").off('input');
		$("#giftCardAmount").on('input', function() {
			let an = AutoNumeric.getAutoNumericElement('#giftCardAmount');
			let currentVal = an ? an.getNumber() : 0;
			if (currentVal > 0) {
				$("#giftCardOkBtn").prop("disabled", false);
			} else {
				$("#giftCardOkBtn").prop("disabled", true);
			}
		});
		$("#giftCardAmount").off('keypress');
		$("#giftCardAmount").on('keypress', function(e) {
			if (e.which === 13 && !$("#giftCardOkBtn").prop("disabled")) { // Enter key
				saveGiftCard();
			}
		});
	} else {
		$(".giftCardInHouseOnly").show();
		$("#giftCardNewOrAddDiv").hide();

		$("#giftCardNbr").off('change');
		$("#giftCardNbr").on('change', function () {
			$.post('checkGiftCard', { giftCardNbr: $(this).val().trim() }, function (reply) {
				if (reply.result === 'success') {
					let an = AutoNumeric.getAutoNumericElement('#giftCardAmount');
					an.set(reply.amount);
					$("#giftCardPurchases").val(reply.purchases);
					$("#giftCardBalance").val(reply.balance);
					$("#giftCardAmount").prop("disabled", true);
					$("#giftCardAdd").show();
				}
			});

			if ($(this).val().trim() !== '') {
				$("#giftCardOkBtn").prop("disabled", false);
			} else {
				$("#giftCardOkBtn").prop("disabled", true);
			}
		});
	}

	modal.showModal();

	lPauseKeys = true;
	pauseBodyKeypress();
}

function closeGiftCard() {
	const modal = document.getElementById("giftCardDialog");
	let an1 = AutoNumeric.getAutoNumericElement('#giftCardNbr');
	let an2 = AutoNumeric.getAutoNumericElement('#giftCardAmount');
	if (an1) an1.remove();
	if (an2) an2.remove();

	modal.close();
	lPauseKeys = false;
	resetBodyKeypress();

	$(".circle-btn").removeClass("circle-btn-pressed");
	$("#giftCardNewBtn").addClass("circle-btn-pressed");
	$("#giftCardAmount").prop("disabled", false);
}

function saveGiftCard() {
	if (pSet.giftCertType !== 'print') {
		doPAXGiftCard();
		return;
	}

	let giftCardNbr = $('#giftCardNbr').val().trim();
	let giftCardAmount = parseFloat($('#giftCardAmount').val());

	if (giftCardNbr === '') {
		showPosError('Please enter a Gift Card Number.', 'giftCardNbr', 'alert');
		return;
	}

	$.post('saveGiftCard', { giftCardNbr: giftCardNbr, giftCardAmount: giftCardAmount }, function (reply) {
		if (reply.result === 'success') {
			let addObj = {
				"brand": "GIFT CARD",
				"descrip": "SALE",
				"size": "",
				"item": "GIFT CARD SALE",
				"pack": 1,
				"price": giftCardAmount,
				"promo": null,
				"total": giftCardAmount,
				"barcode": giftCardNbr,
				"codenum": "GIFTCERT",
				"type": "GC",
				"tax": "N",
				"depo": 0,
				"caseQty": 1,
				"pool": ""
			};

			saleItemAdd(addObj, 1);
			closeGiftCard();
		} else {
			closeGiftCard();
			showPosError('An error occurred while saving the gift card.', 'giftCardDialog', 'error');
		}
	})
	.fail(function() {
		closeGiftCard();
		showPosError('An error occurred while saving the gift card.', 'giftCardDialog', 'error');
	});
}

function doGiftCardAdd() {
	let modal = document.getElementById("giftCardAddAmountDialog");
	let an = new AutoNumeric('#giftCardAddAmount', { decimalPlaces: 2, emptyInputBehavior: 'null', maximumValue: '9999999.99', minimumValue: '0.00', digitGroupSeparator: '', roundingMethod: 'C', caretPositionOnFocus: null });
	an.set("0");
	
	$("#giftCardAddAmount").off('focus');
	$("#giftCardAddAmount").on('focus', function() {
		$(this).select();
	});

	$("#giftCardAddAmount").off('keypress');
	$("#giftCardAddAmount").on('keypress', function(e) {
		if (e.which === 13) { // Enter key
			submitGiftCardAddAmount();
		} else if (e.which === 27) { // Escape key
			closeGiftCardAddAmount();
		}
	});
	modal.showModal();
}

function submitGiftCardAddAmount() {
	let giftCardNbr = $('#giftCardNbr').val().trim().toUpperCase();
	let an = AutoNumeric.getAutoNumericElement('#giftCardAddAmount');
	let addAmount = an ? an.getNumber() : 0;

	if (addAmount <= 0) {
		showPosError('Please enter a valid amount to add.', 'giftCardAddAmount', 'alert');
		return;
	}
	$.post('addGiftCardAmount', { giftCardNbr: giftCardNbr, addAmount: addAmount }, function (reply) {
		if (reply.result === 'success') {
			$("#giftCardAmount").val(reply.amount);
			$("#giftCardBalance").val(reply.balance);
			// add to dataSet
			let addObj = {
				"brand": "GIFT CARD",
				"descrip": "ADD AMOUNT",
				"size": "",
				"item": "GIFT CARD ADD AMOUNT",
				"pack": 1,
				"price": addAmount,
				"promo": null,
				"total": addAmount,
				"barcode": giftCardNbr,
				"codenum": "GIFTCERT",
				"type": "GC",
				"tax": "N",
				"depo": 0,
				"caseQty": 1,
				"pool": ""
			};

			saleItemAdd(addObj, 1);
			closeGiftCardAddAmount();
		} else {
			closeGiftCardAddAmount();
			showPosError('An error occurred while adding to the gift card.', 'giftCardAddAmountDialog', 'error');
		}
	})
		.fail(function () {
			closeGiftCardAddAmount();
			showPosError('An error occurred while adding to the gift card.', 'giftCardAddAmountDialog', 'error');
		});

}

function closeGiftCardAddAmount() {
	const modal = document.getElementById("giftCardAddAmountDialog");
	let an = AutoNumeric.getAutoNumericElement('#giftCardAddAmount');
	if (an) an.remove();
	modal.close();
}

function doPAXGiftCard() {
	let amt = parseFloat($('#giftCardAmount').val());
	let typ = $(".circle-btn.circle-btn-pressed").text().trim();
	
	if (amt <= 0 && typ !== 'BAL') {
		showPosError('Please enter a valid gift card amount.', 'giftCardAmount', 'alert');
		return;
	}

	switch(typ) {
		case 'NEW':
			// create gift card sale item with amt, process on PAX after tendering
			let newObj = {
				"brand": "GIFT CARD",
				"descrip": "SALE",
				"size": "",
				"item": "GIFT CARD SALE",
				"pack": 1,
				"price": amt,
				"promo": null,
				"total": amt,
				"barcode": "",
				"codenum": "GIFTCERT",
				"type": "GC",
				"tax": "N",
				"depo": 0,
				"caseQty": 1,
				"pool": ""
			};

			saleItemAdd(newObj, 1);
			closeGiftCard();
			break;

		case 'ADD':
			// create gift card add amount item with amt, process on PAX after tendering
			let addObj = {
				"brand": "GIFT CARD",
				"descrip": "ADD AMOUNT",
				"size": "",
				"item": "GIFT CARD ADD AMOUNT",
				"pack": 1,
				"price": amt,
				"promo": null,
				"total": amt,
				"barcode": "",
				"codenum": "GIFTCERT",
				"type": "GC",
				"tax": "N",
				"depo": 0,
				"caseQty": 1,
				"pool": ""
			};

			saleItemAdd(addObj, 1);
			closeGiftCard();
			break;

		case 'BAL':
			// doPAX with 'INQUIRYGIFT' command, display balance in alert, do not add to sale
   		const modal = document.getElementById("cardProcessingDialog");
			let txt = "Please swipe the gift card to check the balance.<br>";

			$("#cardProcessingMsg").html(	'<div><span>' + txt + dict.processing[languageVar] + '</span><br>' +
				'<span class="processingGIF"><img src="./images/processing.gif" height="31" width="31"></span></div>' );
			$("#cardProcessingIcon").hide();
			$("#cardProcessingBtnDiv").hide();
   		modal.showModal();

			$.post("doCredit?",
				{ tranType: "INQUIRYGIFT", amount: 0, invoice: invNbr, drawer: drawer, totalTaxDue: 0 },
				function (reply) {
					if (reply.result == "success") {
						let resp = JSON.parse(reply.respJSON);

						console.log("giftBalance: INQUIRYGIFT response:", resp);

						if (resp.respCode !== '000000') {
							console.log("giftBalance: transaction unsuccessful", resp.hostMsg, resp.respMsg);

							$("#settingsErrorIconSvg").html(svgError);
							$("#cardProcessingMsg").html('<div><span>The transaction was NOT successful.<br>' + resp.hostMsg + '<br>' +
								resp.respMsg + '</span></div>');
							$("#cardProcessingIcon").show();
							$("#cardProcessingBtnDiv").show();
							playError();

							return;
						// all good
						} else {
							console.log("giftBalance: successful transaction, balance:", resp.balance);
							playOkay();
							modal.close();

							vexAlert('Gift Card Balance: $' + resp.balance.toFixed(2));
						}
					}
				})
				.fail(function () {
					$("#settingsErrorIconSvg").html(svgError);
					$("#cardProcessingMsg").html('<div><span>An error has occurred.<br>' + reply.message + '</span></div>');
					$("#cardProcessingIcon").show();
					$("#cardProcessingBtnDiv").show();
					playError();
				});
			break;
	}

	closeGiftCard();
}

function doTip() {
	if (!pSet.tenderDoTips) {
		return;
	}
	const modalTip = document.getElementById("modalTipDialog");
	lPauseKeys = true;
	pauseBodyKeypress();
	modalTip.showModal();

	let an = new AutoNumeric('#modalTipAmount', { decimalPlaces: 2, emptyInputBehavior: 'null', maximumValue: '9999999.99', minimumValue: '-999999.99', digitGroupSeparator: '', roundingMethod: 'C', caretPositionOnFocus: null });
	an.set("0");

	$("#modalTipWho").val(oldID);

	$("#modalTipAmount").off('focus');
	$("#modalTipAmount").on('focus', function() {
		$(this).select();
	});

	$("#modalTipAmount").focus();
	
}

function submitModalTip() {
	let an = AutoNumeric.getAutoNumericElement('#modalTipAmount');
	let tipAmount = an ? an.getNumber() : 0;
	let tipWho = $('#modalTipWho').val().trim().toUpperCase();
	
	if (tipAmount <= 0) {
		showPosError('Please enter a valid tip amount.', 'modalTipAmount', 'alert');
		return;
	}
	if (tipWho === '') {
		showPosError('Please enter a Clerk ID.', 'modalTipWho', 'alert');
		return;
	}
	console.log('Submitting Tip: Amount:', tipAmount, ' Who:', tipWho);

	// add tip to dataSet
	let tipObj = {
		"brand": "GRATUITY",
		"descrip": tipWho,
		"size": "",
		"item": "GRATUITY " + tipWho,
		"pack": 1,
		"price": tipAmount,
		"promo": null,
		"total": tipAmount,
		"barcode": "",
		"codenum": "ZQWTIP",
		"type": "$T",
		"tax": "N",
		"depo": 0,
		"caseQty": 1,
		"pool": "",
	};

	saleItemAdd(tipObj, 1);

	closeModalTipDialog();
}

function closeModalTipDialog() {
   const modal = document.getElementById("modalTipDialog");
	let an = AutoNumeric.getAutoNumericElement('#modalTipAmount');
	an.wipe();
   modal.close();
	lPauseKeys = false;
	resetBodyKeypress();
}

/**
 * Show settings error modal
 * @param {string} msg - message to show, can include html tags
 * @param {string} elID - element ID to focus on close (or null)
 * @param {string} type - type of message ("alert" or "error")
**/
function showPosError(msg, elID, type) {
   const modal = document.getElementById("posErrorDialog");
   
	$("#posErrorMsg").html(msg);
   
	if (type && type === "alert") {
      $("#posErrorTitle").text("Alert");
      $("#posErrorIconSvg").html(svgAlert);
   } else {
      $("#posErrorTitle").text("Error");
      $("#posErrorIconSvg").html(svgError);
   }
   
	modal.showModal();

	lPauseKeys = true;
	pauseBodyKeypress();

    // center message vertically
    let pH = $("#posErrorContent").height() - 88; // subtract header/button div
    let eh = $("#posErrorMsg").height();
	 console.log("posErrorMsg height:", eh, " posErrorContent height:", pH);
    let space = (pH - eh) / 2;
    $("#posErrorMsg").css("margin-top", space + "px");

    $("#posErrorOkBtn").off("click");
    $("#posErrorOkBtn").on("click", function () {
        closePosError();
        if (elID) {
            setTimeout(() => {
                $("#" + elID).focus();
            }, 100);
        }
    });

	 $("#posErrorDialog").off('keypress');
	 $("#posErrorDialog").on('keypress', function(e) {
		console.log("posErrorDialog keypress:", e.key, " code:", e.which);
		 if (e.which === 13) { // Enter key
			e.preventDefault();
			e.stopPropagation();
			 $("#posErrorOkBtn").click();
		 }
	});

	 setTimeout(() => {
		  $("#posErrorOkBtn").focus();
	 }, 50);
}

function closePosError() {
    const modal = document.getElementById("posErrorDialog");
    modal.close();
	lPauseKeys = false;
	resetBodyKeypress();
}

function showNotFoundDialog(item) {
	const modal = document.getElementById("notFoundDialog");
	$("#notFoundMsg").html("Item not found: " + item.barcode + "<br>Add to existing item?");
	lPauseKeys = true;
	pauseBodyKeypress();

	playBuzzer();

   $("#notFoundIconSvg").html(svgAlert);

	modal.showModal();

	// center message vertically
	let pH = $("#notFoundContent").height() - 88; // subtract header/button div
	let eh = $("#notFoundMsg").height();
	console.log("notFoundMsg height:", eh, " notFoundContent height:", pH);
	let space = (pH - eh) / 2;
	$("#notFoundMsg").css("margin-top", space + "px");

	$("#notFoundAddBtn").off("click");
	$("#notFoundAddBtn").on("click", function () {
		closeNotFoundDialog();
		// Add your logic for adding the item here
		$("#Modal_itemList").data("calledFrom", "notFound");
	});
}

function closeNotFoundDialog() {
    const modal = document.getElementById("notFoundDialog");
    modal.close();
	lPauseKeys = false;
	resetBodyKeypress();
}

function seconds() {
	let now = new Date();
	const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return Math.floor((now - midnight) / 1000);
}

function isKeyEmpty(object, key) {
  const value = object[key];
  // Returns true if value is null, undefined, or ""
  // It ensures 0 and false are treated as valid (not empty)
  return !value && value !== 0 && value !== false;
}

const isEmpty = (obj) => Object.keys(obj).length === 0;