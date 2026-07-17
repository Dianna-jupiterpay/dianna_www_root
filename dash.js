/*@preserve
|| ######################################################################## ||
|| # encorePOS 1.3.100.105                                                # ||
|| # dash.js                                                              # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
@endpreserve*/

var cVersion = getVersionNumber(); // "1.2.300.137";
var tdSales = 0;   // Today's sales $
var tdCusts = 0;   // Today's nbr of customers
var TDloadergone = 0;
var EXloadergone = 0;
var exEntries = 0;
var exRefunds = 0;
var tdWaitDols;
var tdWaitCusts;
var exWaitEntries;
var exWaitRefunds;
var HourlyTable;
var exceptTable;
var typTable;
var topTable;
var invTable;
var deptPieChart;
var y2yWait;
var invWait1;
var invWait2;
var aItemSales;
var aTypeSales;
var aTypeInv;
var counter = -1;
var lAlertShown = false;
var lCountOnly = false;
var activeTab;
var savedMenuActive = false;

// utility vars
var doWebOrders = false;
var fqTable;
var restoreTable;
var aCusTypes = [];
var aInvTypes = [];
var aSizes = [];
var aVends = [];
var aDeletedCNs = [];
var INVXtable;
var INV_restoreTable;
var aDupeBarc = [];
var itemRestoreEditor;
var cCusTypeLenSpan;
var lastCustTableUpdate = Date.now();
var custListDataTable;
var countFileEditor;
var countFileTable;
var countNotFoundTable;
var itemListDataTable;
var cItemListMode;
var aSelectedItemCodes = [];
var cSelectedBarcode;
var cSelectedItemInfo;
var PromoTable;
var PromoEditor;
var promoFileChange = false;
var itemEditTable;
var itemEditor;
var receiverEditTable;
var receiverEditor;
var aLastItemEditChanges;
var ieSpinner = 0;
var purchWindow;

// report vars
var hourlyModalDialog, hourlyForm;
var DOHtable;
var DOHOrderQtyDialog;
var DOHQtyForm;
var SBStable;
var NegQtyTable;
var CusGMtable;
var aCusGMCusts = [];
var aCusGMData = [];
var nCusGMCounter = 0;
var VendGMsummaryTable;
var VendGMtable;
var vendListDataTable;
var aVendGMVends = [];
var aVendGMData = [];
var nVendGMCounter = 0;
var Disctable;
var Couptable;
var excepTable;
var invLogTable;
var DailyTable;
var dailyModalDialog;
var dailyForm;
var dailySummTable;
var dailyCashEditor;
var dailyNotesEditor;
var dailyDeptToggle = 'SHOW';
var emplListDataTable;
var WebOrderTable;
var itemSalesTable;

// lists
var itemListData;
var itemListTable;
var custListData;
var custListTable;
var vendListData;
var emplListData;
var ctxMenuVisible = false;

// settings vars
var usersTable;
var userEditor;
var storesTable;
var storesEditor;
var SID;
var cSerNbr;
var cExpDate;
var cProcTime;
var userName;
var userLast;
var sLevel;
var doDash;
var nUpdate;
var nAutoLogout;
var autoLogoutTimer;
var doTooltips;
var lastActionTime = new Date().getTime();
var lastUpdateTime = new Date().getTime();
var pub_RemoteDo = false;
var orderSettingsDialog;
var priceLevelSettingsDialog;
var priceChangeSet = false;
var pSet;
var sysSet;
var cloneSet;

// svg vars
var svgCopy;
var svgExcel;
var svgPdf;
var svgPrint;
var svgColVis;
var svgClose;
var svgShow;
var svgHide;
var svgDelete;  
var svgEdit;    
var svgRefresh; 
var svgStop;    
var svgRepeat;  
var svgUndo;    
var svgDupe;    
var svgEx;
var svgEx2;
var svgCheck;   
var svgRemember;
var svgAlert;
var svgError;
var svgInfo;

//track whether valid close of split.html
var validClose = false;

function dashLoader() {
    SID = getCookie('_SID');

    console.log("On start, SID: '" + SID + "'");

    //Detect Browser or Tab Close Events
    $(window).on('beforeunload', function (e) {
        var localStorageTime = localStorage.getItem('storagetime')

        if (localStorageTime != null && localStorageTime != undefined) {
            var currentTime = new Date().getTime(),
                timeDifference = currentTime - localStorageTime;

            if (timeDifference < 25) {
                //Browser Closed
                localStorage.removeItem('storagetime')
            } else {
                //Browser Tab Closed
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
	$(document).on('keydown', function(e) {
		if (e.keyCode == 116) {
			validClose = true;
		}
	});

    $.fn.dataTable.Api.register('buttons.getAlignmentForCols()', function (dt, headers) {
        var alignmentForCols = [];
        for (var i = 0; i < dt.settings()[0].aoColumns.length; i++) {
            var column = dt.settings()[0].aoColumns[i];
            if (column.sType == 'num' || column.sType == 'num-fmt') {
                alignmentForCols.push('right')
            } else {
                alignmentForCols.push('left')
            };
        };
        return alignmentForCols;
    });

    // Prevent Datatables alert message from being displayed
    $.fn.dataTable.ext.errMode = 'none';

    $(document.body).on('xhr.dt', function (e, settings, json, xhr) {
        if (json === null && xhr.status === 401) {
            swal({
                title: 'Unauthorized Access.',
                text: 'You have been logged out.',
                type: 'error'
            },
                function () {
                    window.location.replace("logout?");
                });
            /*   } else if (xhr.status !== 200) {
                  swal( {
                          title: 'Oops!', 
                          text: 'Could not load data',
                          type: 'error'
                        },
                        function() {
                          $(".fqmodal").hide();
                          $(".modal").hide();
                          $(".except-modal").hide();
                        });
            */
        }
    });

    // edit for users 
    userEditor = new $.fn.dataTable.Editor({
        ajax: "userEdit?",
        table: "#userstable",
        fields: [{
            label: "User ID:",
            name: "uid"
        }, {
            label: "First name:",
            name: "fname"
        }, {
            label: "Last name:",
            name: "lname"
        }, {
            label: "View Dashboard?",
            name: "doDash",
            type: "select",
            options: [
                { label: 'yes', value: "yes" },
                { label: 'no', value: 'no' }
            ],
            def: 'no'
        }, {
            label: "Remote Access?",
            name: "doRemote",
            type: "select",
            options: [
                { label: 'yes', value: "yes" },
                { label: 'no', value: 'no' }
            ],
            def: 'no'
        }, {
            label: "Count: Sys QoH?",
            name: "lSysQoH",
            type: "select",
            options: [
                { label: 'yes', value: "yes" },
                { label: 'no', value: 'no' }
            ],
            def: 'no'
        }, {
            label: "Count: Last Cost?",
            name: "lCost",
            type: "select",
            options: [
                { label: 'yes', value: "yes" },
                { label: 'no', value: 'no' }
            ],
            def: 'no'
        }, {
            label: "Security Level:",
            name: "slevel",
            attr: {
                type: "number",
                min: "0",
                max: "99",
                value: "10"
            }
        }, {
            label: "New Password:",
            name: "pwd"
        }, {
            type: "hidden",
            name: "oldUID"
        }
        ]
    });
    // END user editor

    // edit for stores 
    storesEditor = new $.fn.dataTable.Editor({
        ajax: "storesEdit?",
        table: "#storesTable",
        fields: [{
            label: "Serial Nbr:",
            name: "serial"
        }, {
            label: "Store Name:",
            name: "name"
        }, {
            label: "Share Data?",
            name: "datashare",
            type: "select",
            options: [
                { label: 'yes', value: "yes" },
                { label: 'no', value: 'no' }
            ],
            def: 'no'
        }, {
            type: "hidden",
            name: "order"
        }
        ]
    });
    // END stores editor

    // edit for stations 
    stationsEditor = new $.fn.dataTable.Editor({
        ajax: "stationsEdit?",
        table: "#stationsTable",
        fields: [{
            type: "hidden",
            name: "station_id"
        }, {
            label: "Shared Folder:",
            name: "directory"
        }, {
            type: "hidden",
            name: "station_nbr"
        }, {
            type: "hidden",
            name: "DT_RowId"
        }
        ]
    });
    // END stations editor

    // BEGIN inv restore editor
    itemRestoreEditor = new $.fn.dataTable.Editor({
        ajax: "itemRestoreEditor?",
        table: "#INV_restoretable",
        fields: [{
            type: "hidden",
            name: "code_num"
        }, {
            label: "Barcode:",
            name: "barcode"
        }, {
            type: "hidden",
            name: "brand"
        }, {
            type: "hidden",
            name: "descrip"
        }, {
            type: "hidden",
            name: "size"
        }, {
            type: "hidden",
            name: "type"
        }, {
            type: "hidden",
            name: "vendor"
        }, {
            type: "hidden",
            name: "archDate"
        }]
    });
    //END inv restore editor    

    // BEGIN count file editor
    countFileEditor = new $.fn.dataTable.Editor({
        ajax: "countFileEditor?",
        table: "#CountFileTable",
        options: { focus: 'jq:DTE_Field_count' },
        fields: [{
            label: "Count Qty:",
            name: "count"
        }, {
            type: "hidden",
            name: "recno"
        }, {
            type: "hidden",
            name: "file"
        }, {
            type: "hidden",
            name: "brand"
        }, {
            type: "hidden",
            name: "descrip"
        }, {
            type: "hidden",
            name: "size"
        }, {
            type: "hidden",
            name: "qoh"
        }, {
            type: "hidden",
            name: "variValue"
        }]
    });
    // END count file editor

    // BEGIN promo editor
    PromoEditor = new $.fn.dataTable.Editor({
        ajax: "PromoEditor?",
        table: "#PromoTable",
        formOptions: {
            inline: {
                submit: 'allIfChanged'
            }
        },
        fields: [{ label: "Promo Price:", name: "p_price" },
        { name: "bin", type: "hidden" },
        { name: "barcode", type: "hidden" },
        { name: "brand", type: "hidden" },
        { name: "descrip", type: "hidden" },
        { name: "size", type: "hidden" },
        { name: "type", type: "hidden" },
        { name: "price", type: "hidden" },
        { name: "cost", type: "hidden" },
        { name: "qoh", type: "hidden" },
        { name: "GMdols", type: "hidden" },
        { name: "GMperc", type: "hidden" },
        { name: "price_i", type: "hidden" },
        { name: "price_j", type: "hidden" },
        { name: "code_num", type: "hidden" },
        { name: "file", type: "hidden" }
        ]
    });
    //END promo editor    

    // BEGIN daily summary editor
    dailyCashEditor = new $.fn.dataTable.Editor({
        ajax: "dailyCashEditor?",
        table: "#dailySummTable",
        idSrc: "DT_RowId",
        formOptions: {
            inline: {
                submit: 'allIfChanged'
            }
        },
        fields: [{ label: "Actual Cash:", name: "act_cash" }]
    });

    dailyNoteEditor = new $.fn.dataTable.Editor({
        ajax: "dailyNoteEditor?",
        table: "#dailySummTable",
        idSrc: "DT_RowId",
        fields: [{ type: "textarea", label: "Notes:", name: "notes" }]
    });
    // END daily summary editor

    // BEGIN receiver editor
    receiverEditor = new $.fn.dataTable.Editor({
        ajax: "receiverEditor?",
        table: "#Couptable",
        formOptions: {
            inline: {
                submit: 'allIfChanged'
            }
        },
        fields: [{
            type: "hidden",
            name: "DT_RowId"
        }, {
            label: "Date:",
            name: "date",
            type: "datetime",
            format: 'YYYY-MM-DD'
        }, {
            type: "hidden",
            name: "time"
        }, {
            type: "hidden",
            name: "clerk"
        }, {
            type: "hidden",
            name: "vendor"
        }, {
            type: "hidden",
            name: "po_num"
        }, {
            type: "hidden",
            name: "inv_num"
        }, {
            type: "hidden",
            name: "recv_num"
        }, {
            type: "hidden",
            name: "total"
        }]
    });
    // END receiver editor

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
                parent: 'body'
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
      
              $(opts.parent).append('<div id="spinner_modal" style="background-color: rgba(0, 0, 0, 0.3); width:100%; height:100%; position:fixed; top:0px; left:0px; z-index:' + (opts.zIndex - 1) + '"/>');
              spinElem = $("#spinner_modal")[0];
      
              data.spinner = new Spinner($.extend({
                color: $('body').css('color')
              }, opts)).spin(spinElem);
            }
      
          }
        });
    })(jQuery);
// END jquery spinner extension      
      
// get settings from passed cookies
    uid = getCookie("uid");
    userName = getCookie("user");
    userLast = getCookie("userLast");
    sLevel = getCookie("sLevel");
    doDash = (getCookie("doDash") === 'true');
    cSerNbr = getCookie("snbr");
    cExpDate = getCookie("doe");
    cSerVer = getCookie("cver");
    cProcTime = getCookie("procTime");
    doTooltips = (getCookie("tooltips") === 'true');

    var cUpdate = getCookie("updateTime");
    var cAutoLogout = getCookie("autoLogout");

    nUpdate = Math.max(3, Number(cUpdate));
    
    if (cSerNbr === "8501809") {        
        nAutoLogout = Number(cAutoLogout);

        console.log('uid: ' + typeof uid + ':"' + uid + '"');
        console.log(userName);
        console.log(userLast);
        console.log('sLevel: ' + typeof sLevel + ':"' + sLevel + '"');
        console.log(doDash && sLevel === "0");
        console.log(doDash);
        console.log(cSerNbr);
        console.log(cExpDate);
        console.log(cSerVer);
        console.log(cProcTime);
        console.log(nUpdate);
        console.log(nAutoLogout);
        console.log(doTooltips);
    } else {
        nAutoLogout = Math.max(15, Number(cAutoLogout));
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

    // set svg vars
    setSvgVars();

    if (!doDash) {
        //--- hide dash elements if user doesn't have access, and adjust menu spacing
        $("#tab_dash").toggle(false);
        $("#tabsDash").toggle(false);
        $("#dashBttn").hide();

        let left = parseInt( $("#listSubMenu").css("left") ) - 130;
        $("#listSubMenu").css("left", left);
        left = parseInt( $("#utilSubMenu").css("left") ) - 130;
        $("#utilSubMenu").css("left", left);
        left = parseInt( $("#reptSubMenu").css("left") ) - 58;
        $("#reptSubMenu").css("left", left);
    } else {
        $("#tab_dash").show();
        $("#tab_saved").hide()
    }

    // fade effects on menus
/*
    $("li.sub-menu-parent")
        .mouseenter(function (e) {
            if ($(e.fromElement).attr("class") === "menuBar" || $(e.fromElement).attr("class") === "encoreBody") {
                $(this).addClass('brightMenu');
                $(this).siblings().removeClass('brightMenu').addClass('fadedMenu');
            }
        })
        .mouseleave(function (e) {
            if ($(e.toElement).attr("class") === "menuBar" || $(e.toElement).attr("class") === "encoreBody") {
                $(this).addClass('brightMenu');
                $(this).siblings().removeClass('fadedMenu').addClass('brightMenu')
            }
        })
        .mousemove(function (e) {
            if (! $(this).hasClass('brightMenu') ) {
                $(this).addClass('brightMenu');
                $(this).siblings().removeClass('brightMenu').addClass('fadedMenu');
            }
        });

        $("a.sub-menu-box").mousemove(function (e) {
            if (! $(this).parent().hasClass('brightMenu') ) {
                $(this).parent().addClass('brightMenu');
                $(this).parent().siblings().removeClass('brightMenu').addClass('fadedMenu');
            }
            if ($(this).parent().siblings().eq(0).hasClass('brightMenu') ) {
                $(this).parent().siblings().removeClass('brightMenu').addClass('fadedMenu');
            }
        });

    $("#tab_rept").hideShow(function(e){
        if (!$(this).is(":visible")) {
            $(this).find("li.sub-menu-parent").removeClass('fadedMenu').addClass('brightMenu');
        }
    });
            
    $("#tab_util").hideShow(function(e){
        if (!$(this).is(":visible")) {
            $(this).find("li.sub-menu-parent").removeClass('fadedMenu').addClass('brightMenu')
        }
    });
*/

    //--- clear submenus when hover over another main menu tab
    /*
    $(".menuBttn").mouseenter(function() {
        $(".dropMenuLevel1, .choiceSubMenu").not(this).hide();
    });
    */

    $("#listBttn").hover(function() {
        showListsSubMenu();
    }, function() {
        closeListsSubMenu();
    });
    $("#utilBttn").hover(function() {
        showUtilSubMenu();
    }, function() {
        closeUtilSubMenu();
    });
    $("#reptBttn").hover(function() {
        showReptSubMenu();
    }, function() {
        closeReptSubMenu();
    });
/*
    if (!pub_freqBuyer) {
        $("#utilCustChoice").hide();
        $("#reptFQChoice").hide();
        let top = parseInt( $("#utilVendChoiceSubMenu").css("top") ) - 40;
        $("#utilVendChoiceSubMenu").css("top", top + "px");
        top = parseInt( $("#utilAdminChoiceSubMenu").css("top") ) - 40;
        $("#utilAdminChoiceSubMenu").css("top", top + "px");
    }
*/    
    // Saved Report Shortcuts sorting stuff
    $("#savedReportList").sortable({
        placeholder: "savedSortPlaceholder",
        over: function() {
           $('.savedSortPlaceholder').stop().animate({
               height: 40
           }, 400);
        },
        change: function() {
           $('.savedSortPlaceholder').stop().animate({
               height: 40
           }, 400);
        }
    });

    $("#savedReportList").sortable("disable");
    $("#savedReportList").on("mouseup",function() { clearSelection(); });

    if ( localStorage.getItem("invPerfSaved") !== null || localStorage.getItem("cusGMSaved") !== null || localStorage.getItem("vendGMSaved") !== null) {
        buildShortCutTab();
    }

    if (typeof userName == 'string' && userName !== "") {
        $("#welcome").append(", " + userName);
    };

    if (userName === "") {
        userName = "<blank>";
    };
    if (userLast === "") {
        userLast = "<blank>";
    };

    // set data on My Account page
    $("#acctSerialNbr").append(cSerNbr);
    $("#acctExpDate").append(makeExpDate());
    $("#acctSerVer").text(cSerVer);
    $("#acctJSVer").text(cVersion);
    $("#fNameText").text(userName);
    $("#lNameText").text(userLast);
    if (Number(sLevel) === 0) {
        $("#userListButton").show();
    } else {
        $("#userListButton").hide();
    }

    console.log("Before security check, SID: '" + SID + "'");
    // purchase
    $.post("ChkPoint?", { user: uid, session: SID, func: "DEB" }, function(reply) {
        if (reply.result === "success") {
            $('#utilPurchaseChoice').removeClass("hideMenuChoice");
        } else {
            $('#utilPurchaseChoice').addClass("hideMenuChoice");
        }
    });

    // price level utility
    $.post("ChkPoint?", { user: uid, session: SID, func: "DG" }, function(reply) {
        if (reply.result === "success") {
            $('#utilPurchaseChoice').removeClass("hideMenuChoice");
        } else {
            $('#utilPurchaseChoice').addClass("hideMenuChoice");
        }
    });

    // Start Toggle Says handler
    $(".UPC_Chk").on("change", function () {
        var lOn = $(this).is(':checked');
        var id = $(this).attr('id'); 
        var cTxt = $("label[for='" + id + "']").html();

        if (lOn) {
            cTxt = cTxt.replace('OFF', 'ON');
        } else {
            cTxt = cTxt.replace('ON', 'OFF');
        }
        $("label[for='" + id + "']").html(cTxt);
    });

    $("#barcScanSetInnerDiv").find(".slider").on("click", function() {
        $(this).prev("input").trigger("click");
    });

    $(".remoteChk").on("change", function () {
        var lOn = $(this).is(':checked');
        var cTxt = $("#" + $(this).attr('id') + "_Say").html();
        var aSet = [];
        if (lOn) {
            cTxt = cTxt.replace('OFF', 'ON');
        } else {
            cTxt = cTxt.replace('ON', 'OFF');
        }
        $("#" + $(this).attr('id') + "_Say").html(cTxt);

        $("#Modal_Account .remoteChk").each(function (index) {
            var aTmp = [];
            aTmp.push($(this).attr('id'));
            aTmp.push($(this).is(':checked'));
            aSet.push(aTmp);
        });

        if ($(this).attr('id') === 'remoteSet' && !$('#remoteSet').is(':checked')) {
            $('#multiStoreSet').prop("checked", false);
            $('#multiStoreSet').prop('disabled', true);
            $('#multiStoreSet_Say').html("Multi-Store <b>OFF</b>");
            $('#multiStoreSet_Say').prop('disabled', true);
            $('#multiEditButton').prop('disabled', true);
        } else if ($(this).attr('id') === 'remoteSet' && $('#remoteSet').is(':checked')) {
            $('#multiStoreSet').prop('disabled', false);
            $('#multiStoreSet_Say').prop('disabled', false);
            $('#multiEditButton').prop('disabled', false);
        } else if ($(this).attr('id') === 'stationSetting' && $('#stationSetting').is(':checked') ) {
            $('#stationEditButton').prop('disabled', false);
        } else if ($(this).attr('id') === 'stationSetting' && !$('#stationSetting').is(':checked') ) {
            $('#stationEditButton').prop('disabled', true);
        } else if ($(this).attr('id') === 'remoteDataSet' && !$('#remoteDataSet').is(':checked')) {
            $('#remoteDataSet_Say').html("Remote Data Sharing <b>OFF</b>");
            $('#remoteDataSet_Say').prop('disabled', true);
            $('#remoteDataEditButton').prop('disabled', true);
            $("#remoteDataSetting input[type='text']").prop('disabled', true);
            $("#doRemotePrices").prop('disabled', true);
            $("#remoteDataOptions input").prop('disabled', true);
        } else if ($(this).attr('id') === 'remoteDataSet' && $('#remoteDataSet').is(':checked')) {
            $('#remoteDataSet_Say').prop('disabled', false);
            $('#remoteDataEditButton').prop('disabled', false);
            $("#remoteDataSetting input[type='text']").prop('disabled', false);
            $("#doRemotePrices").prop('disabled', false);
            $("#remoteDataOptions input").prop('disabled', false);
        }
        $("#dailyConsolidate").toggle( doDash && sLevel === "0" && $("#multiStoreSet_Say").text() === 'Multi-Store ON'  &&  $('#multiStoreSet').prop('disabled') === false );

        $.post("remoteSaveSettings?", { remoteSet: JSON.stringify(aSet) });
    });
    // End toggle Says handler

    // State Report Settings Sortable Lists
    $( "#stateSetFieldsUsed, #stateSetFieldsUnused" ).sortable({
        connectWith: ".stateSetFields",
        update: function( event, ui ) {
          if (this === ui.item.parent()[0]) {
            var showStateX  = $( "#stateSetSortByField option:selected" ).text();
            $("#stateSetSortByField").empty();
            $('#stateSetFieldsUsed li').each( function(i) {
              let x = $(this).text().replace('drag_indicator','');
              let y = ( (x == showStateX) ? ' selected' : '' );
              let z = $(this).attr('data-field');
              $("#stateSetSortByField").append('<option value="' + z + '"' + y + '>' + x + '</option>');
            } );
          }
        }
    }).disableSelection();

    $( "#stateSetFieldsUsed li, #stateSetFieldsUnused li" ).hover(
        //function() { $(this).find(".stateSetDragSpan").css({"visibility": "visible"}); },
        function() { $(this).find(".stateSetDragSpan").css({"visibility": "hidden"}); },
    );

    // set remote settings
    $.post("remoteGetSettings?", "", function (data) {
        var cTxt;
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $("#" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
                cTxt = $("#" + data.aSet[idx][0] + "_Say").html();
                if (data.aSet[idx][1]) {
                    cTxt = cTxt.replace('OFF', 'ON');
                } else {
                    cTxt = cTxt.replace('ON', 'OFF');
                }
                $("#" + data.aSet[idx][0] + "_Say").html(cTxt);
            }
        });
        // toggle Consolidate button on Daily Summary Report
        $("#dailyConsolidate").toggle( doDash && sLevel === "0" && $("#multiStoreSet_Say").text() === 'Multi-Store ON'  &&  $('#multiStoreSet').prop('disabled') === false );
    });

    // set data on settings page
    $('input#frequentLargeAmt').blur(function(){
        var num = parseFloat($(this).val());
        var cleanNum = num.toFixed(2);
        $(this).val(cleanNum);
      });

    $("#processTime").val(cProcTime);
    $("#dataUpdate").val(nUpdate).change();
    $("#autoLogout").val(nAutoLogout).change();
    $.post("serverInfo?", "", function (data) {
        $("#serverInfoSpan").html(data.address);
    });
    $.post("upcGetSettings?", "", function (data) {
        var cTxt;
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $("#Modal_Settings #" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
                cTxt = $("#" + data.aSet[idx][0] + "_Say").text();
                if (data.aSet[idx][1]) {
                    cTxt = cTxt.replace('OFF', 'ON');
                } else {
                    cTxt = cTxt.replace('ON', 'OFF');
                }
                $("#" + data.aSet[idx][0] + "_Say").text(cTxt);
            }
        })
    });
/*
    // process time input setup
    $("#processTime").timeDropper({
        "setCurrentTime": false,
        "format": "  h:mm A",
        "primaryColor": "#45c0bd",
        "borderColor": "#45c0bd"
    });
*/
    // promo start time input setup
    var start = localStorage.getItem("promoHappyHourStart");
    if (start === "undefined") {
        start = ' 5:00 PM'
    };
    $( "#promoStartTime" ).val( start );

    $("#promoStartTime").timeDropper({
        "setCurrentTime": false,
        "format": "  h:mm A",
        "primaryColor": "#45c0bd",
        "borderColor": "#45c0bd",
        "autoswitch": true
    });

    // promo end time input setup
    var end = localStorage.getItem("promoHappyHourEnd");
    if (end === "undefined") {
        end = ' 6:00 PM'
    };
    $( "#promoEndTime" ).val( end );

    $("#promoEndTime").timeDropper({
        "setCurrentTime": false,
        "format": "  h:mm A",
        "primaryColor": "#45c0bd",
        "borderColor": "#45c0bd",
        "autoswitch": true
    });

    //promo days setup
    var days = localStorage.getItem("promoHappyHourDays");
    if (days && days !== "undefined") {
        $( "#promoDayDiv" ).find('input[type=checkbox]').each(function(index, item) {
            if ( days.indexOf(item.value) > -1 ) {
                $(item).prop('checked',true);
            }
        });
    }

	//------ set values in POS setting object
	$.post("pSettings?", {"drawer": null}, function (reply) {
		if (reply.result === 'success') {
			pSet = reply.settings;
		} else {
			pSet = ePosSetUp();
		}
	})
	.fail(function () {
		pSet = ePosSetUp();
	});

	//------ set values in POS setting object
	$.post("sysSettings?", function (reply) {
		if (reply.result === 'success') {
			sysSet = reply.settings;
		} else {
			sysSet = eSysSetUp();
		}
	})
	.fail(function () {
		sysSet = eSysSetUp();
	});

/*
    // IRI settings time
    $("#IRIschedAutoTime").val("02:00:00");

    $("#IRIschedAutoTime").timeDropper({
        "setCurrentTime": false,
        "format": "  h:mm A",
        "primaryColor": "#45c0bd",
        "borderColor": "#45c0bd"
    });
*/
    //get alerts
    $.post("alertCheck?", "", function (data) {
        if (data.alerts.length > 0) {
            $("#userImage").attr("src", "images/alert.png");
            $("#welcome").css("color", "#ff0000");
            if (data.alerts.length > 1) {
                $("#welcome").text("You have alerts!");
            } else {
                $("#welcome").text(data[0]);
            };
            $("#userDropdown").append('<a id="viewAlerts" href="#" style="color: #ff0000;" onclick="getAlerts()">View Alerts</a>');
            lAlertShown = true;
        };
    });

    navResize();

    // set intervals
    setTimeout(function () { updateTDSales("FALSE") }, nUpdate * 60000);
    //     setTimeout(updateEXLog, nUpdate*60000);

    // hide More buttons
    $("#More_TD").toggle(false);
    $("#More_Except").toggle(false);
    $("#More_Dept").toggle(false);
    $("#More_Top").toggle(false);
    $("#More_Y2Y").toggle(false);
    $("#More_Inv").toggle(false);

    /*  TODAY'S SALES */
    var c = document.getElementById("Today");
    var ctx = c.getContext("2d");

    ctx.fillStyle = "#43a3d7";
    ctx.textAlign = "center";
    ctx.font = "600 20px Verdana";
    ctx.fillText("Today's Sales", 197, 30);

    var dollar = document.createElement('img');
    dollar.src = './images/dollar.png';
    dollar.onload = function () {
        var c = document.getElementById('Today');
        var ctx = c.getContext('2d');
        ctx.drawImage(dollar, 35, 54, 64, 64);
    }

    var customers = document.createElement('img');
    customers.src = './images/customers.png';
    customers.onload = function () {
        var c = document.getElementById('Today');
        var ctx = c.getContext('2d');
        ctx.drawImage(customers, 35, 133, 64, 64);
    }

    /*  TOP MOVERS */
    var c = document.getElementById("TopMovers");
    var ctx = c.getContext("2d");

    ctx.fillStyle = "#43a3d7";
    ctx.textAlign = "center";
    ctx.font = "600 20px Verdana";
    ctx.fillText("Today's Top Movers", 197, 30);

    var crown = document.createElement('img');
    crown.src = './images/crown.png';
    crown.onload = function () {
        var c = document.getElementById('TopMovers');
        var ctx = c.getContext('2d');
        ctx.drawImage(crown, 10, 0, 64, 64);
    }

    /*  EXCEPTIONS */
    var c = document.getElementById("Exceptions");
    var ctx = c.getContext("2d");

    ctx.fillStyle = "#43a3d7";
    ctx.textAlign = "center";
    ctx.font = "600 20px Verdana";
    ctx.fillText("Exceptions", 197, 30);

    var warn = document.createElement('img');
    warn.src = './images/warning.png';
    warn.onload = function () {
        var c = document.getElementById('Exceptions');
        var ctx = c.getContext('2d');
        ctx.drawImage(warn, 35, 64, 64, 64);
    }

    var refund = document.createElement('img');
    refund.src = './images/refund.png';
    refund.onload = function () {
        var c = document.getElementById('Exceptions');
        var ctx = c.getContext('2d');
        ctx.drawImage(refund, 35, 153, 64, 64);
    }

    /* Inventory */
    var c = document.getElementById("Inventory");
    var ctx = c.getContext("2d");

    ctx.fillStyle = "#43a3d7";
    ctx.textAlign = "center";
    ctx.font = "600 20px Verdana";
    ctx.fillText("Inventory", 197, 30);

    var invPic = document.createElement('img');
    invPic.src = './images/inventory.png';
    invPic.onload = function () {
        var c = document.getElementById('Inventory');
        var ctx = c.getContext('2d');
        ctx.drawImage(invPic, 35, 64, 64, 64);
    }

    var turns = document.createElement('img');
    turns.src = './images/turnover.png';
    turns.onload = function () {
        var c = document.getElementById('Inventory');
        var ctx = c.getContext('2d');
        ctx.drawImage(turns, 35, 153, 64, 64);
    }

    //---- BEGIN MODAL WINDOWS --//

    /* Today's Sales More Modal */
    // now updated on the fly during polling

    /* Chart Data for Modal_Y2Y Window */
    // now done on the fly below
    c = document.getElementById("Year2Year");
    ctx = c.getContext("2d");

    ctx.fillStyle = "#43a3d7";
    ctx.textAlign = "center";
    ctx.font = "600 20px Verdana";
    ctx.fillText("Year to Year", 197, 30);

    /* Controlling the "More>" windows */
    //
    // When the user clicks the button, open the modal
    $("#hourlyLink").click(function () {
        $("nav").css('z-index', -1);
        $("#tab_dash").hide();
        showHourlyTable();
    });
    $("#More_TD").click(function () {
        $("nav").css('z-index', -1);
        $("#tab_dash").hide();
        $("#Modal_TD").show();
        updateTDSales('FALSE');
    });
    $("#More_Y2Y").click(function () {
        $("nav").css('z-index', -1);
        $("#tab_dash").hide();
        $("#Modal_Y2Y").show();
    });
    $("#More_Except").click(function () {
        $("nav").css('z-index', -1);
        $("#tab_dash").hide();
        showExceptTable();
    });
    $("#More_Dept").click(function () {
        $("nav").css('z-index', -1);
        $("#tab_dash").hide();
        showTypTable();
    });
    $("#More_Top").click(function () {
        $("nav").css('z-index', -1);
        $("#tab_dash").hide();
        showTopTable();
    });
    $("#More_Inv").click(function () {
        $("nav").css('z-index', -1);
        $("#tab_dash").hide();
        showInvTable();
    });

    // When the user clicks on <span> (x), close the modal
    $("#Modal_TD_close").click(function () {
        $("#Modal_TD").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide()
        $("nav").css('z-index', 999);
    });
    $("#Modal_Y2Y_close").click(function () {
        $("#Modal_Y2Y").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Hourly_Close").click(function () {
        if ($.fn.DataTable.isDataTable('#HourlyTable')) {
            HourlyTable.clear().destroy(false);
        }
        $("#Modal_Hourly").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Daily_Close").click(function () {
        if ($.fn.DataTable.isDataTable('#DailyTable')) {
            DailyTable.clear().destroy(false);
        }
        $("#Modal_Daily").hide();
        if (doDash) {
            $("#tab_dash").toggle(true);
        }
        $("nav").css('z-index', 999);
    });
    $("#Modal_Except_close").click(function () {
        if ($.fn.DataTable.isDataTable('#excepttable')) {
            exceptTable.clear().destroy(false);
        }
        $("#Modal_Except").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Typ_close").click(function () {
        if ($.fn.DataTable.isDataTable('#typtable')) {
            typTable.clear().destroy(false);
        }
        $("#Modal_Typ").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Top_close").click(function () {
        if ($.fn.DataTable.isDataTable('#toptable')) {
            topTable.clear().destroy(false);
        }
        $("#Modal_Top").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Inv_close").click(function () {
        if ($.fn.DataTable.isDataTable('#invtable')) {
            invTable.clear().destroy(false);
        }
        $("#Modal_Inv").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Users_close").click(function () {
        if ($.fn.DataTable.isDataTable('#userstable')) {
            usersTable.clear().destroy(false);
        }
        $("#Modal_Users").hide();
        $("#tab_dash").show();
        $("#tab_saved").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_itemList_close").click(function () {
        closeItemListModal();
    });
    $("#Modal_vendList_close").click(function () {
        closeVendListModal();
    });
    $("#modalInfoClose").click(function () {
        closeModalInfo();
    });
    $("#modalInvoiceClose").click(function () {
        closeModalInvoice();
    });
    $("#Modal_promoList_close").click(function () {
        closePromoListModal();
    });
    $("#itemEditClose").click(function () {
        closeItemEditTable();
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        var clickObj = event.target.id;
        if (clickObj === "Modal_TD") {
            $("#Modal_TD").hide();
            $("#tab_dash").show();
            $("#tab_saved").hide()
            $("nav").css('z-index', 999);
        } else if (clickObj === "Modal_Y2Y") {
            $("#Modal_Y2Y").hide();
            $("nav").css('z-index', 999);
        } else if (clickObj === "Modal_Except") {
            $("#Modal_Except").hide();
            $("nav").css('z-index', 999);
        } else if (clickObj === "Modal_Top") {
            $("#Modal_Top").hide();
            $("nav").css('z-index', 999);
        } else if (clickObj === "Modal_Typ") {
            $("#Modal_Typ").hide();
            $("nav").css('z-index', 999);
        } else if (clickObj === "Modal_Inv") {
            $("#Modal_Inv.style").hide();
            $("nav").css('z-index', 999);
        } else if (clickObj === "Modal_custList") {
            closeCustListModal();
            $("nav").css('z-index', 999);
        } else if (clickObj === "modalInfoClose") {
            closeModalInfo();
            $("nav").css('z-index', 999);
        } else if ($("#userDropdown").is(":visible") && !event.target.matches('#welcome') && !event.target.matches('.navUser img')) {
            $("#userDropdown").hide();
            $("nav").css('z-index', 999);
        } else if ($("#listSubMenu").is(":visible") && clickObj !== "listBttn" && !$("#"+clickObj).hasClass("dropMenuLevel1Choice")) {
            closeListsSubMenu();
        } else if ($("#utilSubMenu").is(":visible") && clickObj !== "utilBttn" && !$("#"+clickObj).hasClass("dropMenuLevel1Choice")) {
            closeUtilSubMenu();
        } else if ($("#reptSubMenu").is(":visible") && clickObj !== "reptBttn" && !$("#"+clickObj).hasClass("dropMenuLevel1Choice")) {
            closeReptSubMenu();
        } else if ($("#iconMenu").is(":visible") && clickObj !== "navMenuIcon") {
            $("#iconMenu").hide();
            $("nav").css('z-index', 999);
        };

        $(".selectDOHrange input[type='text']").focus(function () {
            if ($(this).val() === '< ANY >') {
                $(this).val('');
            }
        });

        this.window.addEventListener("orientationchange", function() {
            navResize();
        });

        // to add margin to last menu item
        $("#navUtil .sub-menu-parent:not(:last) .sub-menu li:last-child").addClass("lastItem");
        $("#navReports .sub-menu-parent:not(:last) .sub-menu li:last-child").addClass("lastItem");

        $('#reportEmpl').on('click', function (e) {
            $('html, body').animate({
                scrollTop: $("#reportEmpl").offset().top
            }, 'slow');
        });

        // stop and restart autoLogout timer
        lastActionTime = new Date().getTime();
        clearInterval(autoLogoutTimer);
        autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);
    }

    // range slider stuff
    var $element1 = $('input[type="range"]:eq(0)');
    var $handle1;

    $element1
        .rangeslider({
            polyfill: false,
            onInit: function () {
                $handle1 = $('.rangeslider__handle:eq(0)', this.$range);
                updateSliderHandle($handle1[0], this.value);
            }
        })
        .on('input', function () {
            updateSliderHandle($handle1[0], this.value);
        });

    var $element2 = $('input[type="range"]:eq(1)');
    var $handle2;

    $element2
        .rangeslider({
            polyfill: false,
            onInit: function () {
                $handle2 = $('.rangeslider__handle:eq(0)', this.$range);
                updateSliderHandle($handle2[0], this.value);
            }
        })
        .on('input', function () {
            updateSliderHandle($handle2[0], this.value);
        });

    $(".rangeslider__handle").on("mousedown", function(e) {
        e.preventDefault();
    });

    /* BEGIN: Upload License File event handler*/
    var licenseForm = document.forms.namedItem("licenseFileInfo");

    licenseForm.addEventListener('submit', function (ev) {
        var oOutput = document.getElementById("licenseFileOutput"),
            oData = new FormData(licenseForm);

        var oReq = new XMLHttpRequest();
        oReq.open("POST", "uploadCertificate?", true);
        oReq.onload = function (oEvent) {
            if (oReq.status == 200) {
                oOutput.innerHTML = oReq.responseText;
                if (oReq.responseText.slice(0, 9) === "Thank you") {
                    $("#acctExpDate").css("color", "#2889bd");
                    $("#acctExpDate").text("dashPOS License Expires: " + oReq.responseText.slice(-10));
                    $("#userImage").attr("src", "images/user_24.png");
                    $("#welcome").css("color", "#2889bd");
                    $("#welcome").text("Welcome, " + userName);
                    $('#licenseFileName').text('No file picked.');
                    $('#uploadLicenseFileButton').prop('disabled',true);
                };
            } else {
                oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
                $('#uploadLicenseFileButton').prop('disabled',true);
            }
        };

        oReq.send(oData);
        ev.preventDefault();
    },
        false);
    /* END: Upload License File event handler*/

    /* BEGIN: Upload Settings File event handler*/
/*
    var freqForm = document.forms.namedItem("frequentSettingsFileInfo");

    freqForm.addEventListener('submit', function (ev) {
        var oOutput = document.getElementById("frequentSettingsFileOutput"),
            oData = new FormData(freqForm);

        var oReq = new XMLHttpRequest();
        oReq.open("POST", "uploadCertificate('FREQUENT')", true);
        oReq.onload = function (oEvent) {
            if (oReq.status == 200) {
                oOutput.innerHTML = oReq.responseText;
                if (oReq.responseText.slice(0, 9) === "Thank you") {
                    $('#frequentSettingsFileName').text('No file picked.');
                    $('#uploadFrequentSettingsFileButton').prop('disabled', true);

                    $.post("frequentGetSettings?", "", function (data) {
                        $('#enableFrequent').prop('checked', data.frequent);
                        $('#frequentSubTotal').prop('checked', data.freqSubTotal === 'Y');
                        $('#frequentGrTotal').prop('checked', data.freqSubTotal === 'N');
                        $('#frequentItem').prop('checked', data.freqSubTotal === 'I');
                        $('#frequentPoint').val(data.freqPt);
                        $('#frequentDayX').val(data.freqDay);
                        $('#frequentSun').prop('checked', data.freqDoW.indexOf('1') > 0);
                        $('#frequentMon').prop('checked', data.freqDoW.indexOf('2') > 0);
                        $('#frequentTue').prop('checked', data.freqDoW.indexOf('3') > 0);
                        $('#frequentWed').prop('checked', data.freqDoW.indexOf('4') > 0);
                        $('#frequentThu').prop('checked', data.freqDoW.indexOf('5') > 0);
                        $('#frequentFri').prop('checked', data.freqDoW.indexOf('6') > 0);
                        $('#frequentSat').prop('checked', data.freqDoW.indexOf('7') > 0);
                        $('#frequentLargeX').val(data.freqLge);
                        $('#frequentLargeAmt').val(data.freqTot);
                        $('#frequentAdd').prop('checked', data.freqAdd);
                        $('#frequentLargeAmt').blur();  // trigger format
                    });
                };
            } else {
                oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
                $('#uploadFrequentSettingsFileButton').prop('disabled', true);
            }
        };

        oReq.send(oData);
        ev.preventDefault();
    },
        false);
*/
    /* END: Upload Settings File event handler*/

    /* Begin startup progress indicators */

    // start Today's Sales
    tdWaitDols = new CanvasLoader('TD-canvasloader-container', { id: 'TD_Dols_Loader' });
    tdWaitDols.setColor('#45C0BD'); // default is '#000000'
    tdWaitDols.setDensity(14); // default is 40
    tdWaitDols.setSpeed(1); // default is 2
    tdWaitDols.setFPS(12); // default is 24
    tdWaitDols.show(); // Hidden by default

    var loaderObj1 = document.getElementById("TD_Dols_Loader");
    loaderObj1.style.position = "relative";
    loaderObj1.style["top"] = "-202px";
    loaderObj1.style["left"] = "0px";

    tdWaitCusts = new CanvasLoader('TD-canvasloader-container', { id: 'TD_Custs_Loader' });
    tdWaitCusts.setColor('#45C0BD'); // default is '#000000'
    tdWaitCusts.setDensity(14); // default is 40
    tdWaitCusts.setSpeed(1); // default is 2
    tdWaitCusts.setFPS(12); // default is 24
    tdWaitCusts.show(); // Hidden by default

    var loaderObj2 = document.getElementById("TD_Custs_Loader");
    loaderObj2.style.position = "relative";
    loaderObj2.style["top"] = "-164px";
    loaderObj2.style["left"] = "0px";
    // end Today's Sales    

    // start Exception Log
    exWaitEntries = new CanvasLoader('EX-canvasloader-container', { id: 'EX_Entry_Loader' });
    exWaitEntries.setColor('#45C0BD'); // default is '#000000'
    exWaitEntries.setDensity(14); // default is 40
    exWaitEntries.setSpeed(1); // default is 2
    exWaitEntries.setFPS(12); // default is 24
    exWaitEntries.show(); // Hidden by default

    var loaderObj3 = document.getElementById("EX_Entry_Loader");
    loaderObj3.style.position = "relative";
    loaderObj3.style["top"] = "-192px";
    loaderObj3.style["left"] = "0px";

    exWaitRefunds = new CanvasLoader('EX-canvasloader-container', { id: 'EX_Refund_Loader' });
    exWaitRefunds.setColor('#45C0BD'); // default is '#000000'
    exWaitRefunds.setDensity(14); // default is 40
    exWaitRefunds.setSpeed(1); // default is 2
    exWaitRefunds.setFPS(12); // default is 24
    exWaitRefunds.show(); // Hidden by default

    var loaderObj4 = document.getElementById("EX_Refund_Loader");
    loaderObj4.style.position = "relative";
    loaderObj4.style["top"] = "-144px";
    loaderObj4.style["left"] = "0px";
    // end Exception Log

    y2yWait = new CanvasLoader('y2y-canvasloader-container', { id: 'y2y_Loader' });
    y2yWait.setColor('#45C0BD'); // default is '#000000'
    y2yWait.setDensity(14); // default is 40
    y2yWait.setSpeed(1); // default is 2
    y2yWait.setFPS(12); // default is 24
    y2yWait.show(); // Hidden by default

    var loaderObj5 = document.getElementById("y2y_Loader");
    loaderObj5.style.position = "relative";
    loaderObj5.style["top"] = "-168px";
    loaderObj5.style["left"] = "0px";

    invWait1 = new CanvasLoader('inv-canvasloader-container', { id: 'inv_Loader_1' });
    invWait1.setColor('#45C0BD'); // default is '#000000'
    invWait1.setDensity(14); // default is 40
    invWait1.setSpeed(1); // default is 2
    invWait1.setFPS(12); // default is 24
    invWait1.show(); // Hidden by default

    var loaderObj6 = document.getElementById("inv_Loader_1");
    loaderObj6.style.position = "relative";
    loaderObj6.style["top"] = "-192px";
    loaderObj6.style["left"] = "0px";

    invWait2 = new CanvasLoader('inv-canvasloader-container', { id: 'inv_Loader_2' });
    invWait2.setColor('#45C0BD'); // default is '#000000'
    invWait2.setDensity(14); // default is 40
    invWait2.setSpeed(1); // default is 2
    invWait2.setFPS(12); // default is 24
    invWait2.show(); // Hidden by default

    var loaderObj7 = document.getElementById("inv_Loader_2");
    loaderObj7.style.position = "relative";
    loaderObj7.style["top"] = "-144px";
    loaderObj7.style["left"] = "0px";
    /* END Progress Indicators */

    /* START Loading Dashboard Panels */
    //    y2yData();

    //    invPosition();

    updateTDSales('TRUE');

    //    updateEXLog();

    // Start autoLogout timer
    autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);

    // Show welcome msg on first time
    var firstTime = getCookie("firstTime");
    if (firstTime === 'yes') {
        swal("Welcome!", "Thanks for selecting posAdvisors. Enjoy!", "success");
    };
    deleteCookie("firstTime");

    document.addEventListener("visibilitychange", function () {
        var x = new Date().getTime();
        if (doDash && x > lastUpdateTime + (nUpdate * 60000)) {
            updateTDSales('FALSE');
        }
    });

    respondToVisibility = function (element, callback) {
        var vizOptions = {
            root: document.documentElement
        }

        var observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                callback(entry.intersectionRatio > 0);
            });
        }, vizOptions);

        observer.observe(element);
    }

    respondToVisibility(document.getElementById("tab_dash"), visible => {
        const feedbackEl = document.getElementById("visibilityFeedback");
        if (visible) {
            var x = new Date().getTime();
            if (doDash && x > lastUpdateTime + (nUpdate * 60000)) {
                updateTDSales('FALSE');
            }
        }
    });

    //----- define function to check if element is in overflow
	$.fn.overflownY=function(){
		var e=this[0];
		return e.scrollHeight>e.clientHeight;
	}

    /*  password visiblity stuff  */
    const visibilityToggle = document.querySelector('.visibility');
    const input = document.querySelector('#webPswd');
    var password = true;
    visibilityToggle.addEventListener('click', function () {
        if ($("#webPswd").prop("disabled")) return;
        if (password) {
            input.setAttribute('type', 'text');
            visibilityToggle.innerHTML = 'visibility_off';
        } else {
            input.setAttribute('type', 'password');
            visibilityToggle.innerHTML = 'visibility';
        }
        password = !password;
    });

    $.post('doingWebOrders?', function (ans) {
        if (ans.doing) {
            doWebOrders = true;
            getPendingOnlineOrders();
        }
    });

    $(".pin-code input").on('keyup', function () {
        var maxLength = parseInt($(this).attr("maxlength"), 10);
        var myLength = $(this).length;
    
        if (myLength >= maxLength) {
            var thisSeq = $(this).attr("data-seq");
            var next = $(this).next();
            var nextSeq = $(next).attr("data-seq");
            //while (next = $(next).next()) {
                if (typeof nextSeq == 'undefined') {
                    $.spin('true');

                    var pinIn = $("#pin1").val() + $("#pin2").val() + $("#pin3").val() + $("#pin4").val();

                    $.post("pinEntered", {pin: pinIn, proc: "remoteDataSet"}, 
                        function(reply) {
                            priceChangeSet = reply.lPriceChangeSet;
                            if ( reply.result ==='success' ) {
                                pinCodeClose();
                                $("#modalSetContent").html(reply.html);
                                $.each(reply.settings, function (idx,arr) {
                                    if (typeof arr[1] === "boolean") {
                                        $("#"+arr[0]).prop("checked", arr[1]);
                                    } else if ( arr[1].toUpperCase() !== 'NIL' ) {
                                        $("#"+arr[0]).val(arr[1]);
                                    }
                                });
                                
                                $("#modalSetBody .remoteChk").on("change", remoteDataSetChange);

                                $("#remoteDataShareHost").on("input", function(){
                                    let serial = $(this).val();
                                    if (serial.length === 7 && serial === cSerNbr) {
                                        setAsHost();
                                    } else if (serial.length === 7 && serial !== cSerNbr) {
                                        setAsClient();
                                    }
                                });

                                remoteDataSetChange();
                                doInventoryChange();
                                doCustomersChange();
                                $("#modalSet").show();
                            }  else {
                                $(".pin-code input").val("");
                                $("#pin1").focus();
                            }
                        }
                    )
                    .always( function() {
                        $.spin('false');
                    });
                    //break;
                } else {
                next.focus();
                }
                //break;
            //}
        }
    
        if (myLength === 0) {
            var next = $(this);
            while (next = $(next).prev()) {
                if (next == null) break;
                next.focus();
                break;
            }
        }
    });
    
    $(".pin-code input").on('keydown', function () {
        $(this).val("");
    });

    loadItemListData();

	loadCustListData();

    loadVendListData();

    loadEmplListData();
};
/* END DASHLOADER */

function launchPOS() {
    $.spin(true);

    localStorage.setItem('cameFrom', 'dash');

    // $.post('secureChk?', { proc: 'purchasing', uid: uid }, function (reply) {
    //    if (!reply.ok) {
    $.post("ChkPoint?", { user: uid, session: SID, func: 'DA' }, function (reply) {
        if (reply.result !== 'success') {
            $.spin(false);
            vex.dialog.alert({
                message: 'You do not have authorization to run this utility.'
            });
            return;
        } else {
            $.spin(false);
            window.location.href = 'pos.html';
        }
    })
    .always( function() {
        $.spin(false);
    });
}

function launchPurchasing() {
    $.spin(true);

    // $.post('secureChk?', { proc: 'purchasing', uid: uid }, function (reply) {
    //     if (!reply.ok) {
    $.post("ChkPoint?", { user: uid, session: SID, func: 'DEB' }, function (reply) {
        if (reply.result !== 'success') {
            $.spin(false);
            vex.dialog.alert({
                message: 'You do not have authorization to run this utility.'
            });
            return;
        } else {
            let poHigh = $(document.body).height();
            let poWide = $(document.body).width();

            $.spin(false);

            if (poHigh >= 630 && poWide >= 800) {//( poHigh >= 730 && poWide >= 800 ) {
                validClose = true;
                window.location.href = 'purchase.html';
            } else {
                playNotify();
                swal("Oops...", "This window is too small to run the purchasing module. " +
                    poHigh + ", " + poWide, "error");
            }
        }
    })
    .always( function() {
        $.spin(false);
    });
}

function launchOnlineOrdering() {
    //location.href = 'sales.html'
    if (sysSet.doWebOrders) {
        //window.open('sales.html', '_blank', 'toolbar=0,location=0,menubar=0');
        validClose = true;
        window.location.href = 'sales.html';
    } else {
        playBeep();
        $("<div id='webOrderMsg'><p>This option has not been configured.<br>Please visit Settings &gt; Online Orders Settings.</p></div>").dialog({
            modal: true,
            position: { my: "center", at: "center", of: $(".encoreBody") },
            close: function () { $("#tab_dash").show(); }
        });
    }
}

function getPendingOnlineOrders() {
    $.post('webOrdersPending?', function (obj) {
        if (typeof obj.numPending === 'number') {
            $("#webOrderMenuText").html('Import Online Orders&nbsp;&nbsp;&nbsp;( ' + obj.numPending + ' pending )');
        }
        setTimeout(function () { getPendingOnlineOrders() }, 120000);
    });
}

function navResize() {
    var w = window.innerWidth;
    $("#mainNav").css("max-width",w);
    $("#mainNav").css("min-width",w);
    $("#pAnavbar").css("max-width",w);
    $("#pAnavbar").css("min-width",w);
}

function updateTDSales(cFirst) {
    var xmlhttp = new XMLHttpRequest();
    var tab = $('#tab_dash');
    var lRun = tab.is(':visible');  // true;
    var url = "UpdateTodaysSales('','" + cFirst + "')";

    if (!lRun && cFirst !== 'TRUE') {
        return;
    } else if (Visibility.isHidden() && cFirst !== 'TRUE') {
        return;
    } else {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.status == 401) {
                window.location.replace("login.html");
            } else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var TdArr = JSON.parse(xmlhttp.responseText);
                TDSalesDecode(TdArr);
                EXLogDecode(TdArr);
                if (cFirst === 'TRUE') {
                    y2yPanelBuild(TdArr);
                    invPanelBuild(TdArr);
                }
            };
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.send();
    };
};

function updateEXLog() {
    var xmlhttp = new XMLHttpRequest();
    var tab = $('#tab_dash');
    var lRun = tab.is(':visible');
    var url = "UpdateExceptions?";

    if (lRun) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.status == 401) {
                window.location.replace("logout?");
            } else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var ExArr = JSON.parse(xmlhttp.responseText);
                EXLogDecode(ExArr);
            }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.send();
    };
};

function autoLogout() {
    let x = new Date().getTime();

    if (x > lastActionTime + (nAutoLogout * 60000)) {
        window.location.replace("logout('auto')?");
    } else {
        autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);
    };
};

function TDSalesDecode(obj) {
    var c = document.getElementById("Today");
    var tdctx = c.getContext("2d");

    tdSales = obj.dollars;
    tdCusts = obj.custs;
    tdDate = obj.date;
    var ntdD = Number(obj.date);
    var tdD = new Date(ntdD);
    var tndArr = obj.tenders;
    var nGP = 100*((Number(obj.dollars) - Number(obj.cost)) / Math.max(1, Number(obj.dollars)));
    var nAvg = tdSales / tdCusts;
    var cTxt;
    var nX;

    lastUpdateTime = new Date().getTime();

    if (TDloadergone === 0) {
        tdWaitDols.kill();
        tdWaitCusts.kill();
        document.getElementById("More_TD").style.visibility = "visible";
        TDloadergone++;
    }

    tdctx.fillStyle = "#FFFFFF";
    tdctx.fillRect(1, 35, 375, 15);

    if ((Date.now()) - ntdD > 900000) {
        tdctx.fillStyle = "#ff0000";
    } else {
        tdctx.fillStyle = "#000000";
    }
    tdctx.textAlign = "center";
    tdctx.font = "italic 10px Verdana";
    tdctx.fillText("As of " + tdD.toLocaleDateString() + "  " + tdD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 197, 47);

    tdctx.fillStyle = "#FFFFFF";
    tdctx.fillRect(120, 60, 272, 50);

    tdctx.fillStyle = "#000000";
    tdctx.textAlign = "left";
    tdctx.font = "300 24px Tahoma";
    cTxt = numberWithCommas(tdSales);
    tdctx.fillText( cTxt, 120, 100);
/*
    nX = tdctx.measureText( cTxt ).width + 15
    tdctx.fillStyle = "#45c0bd";
    tdctx.fillText( 'GP%: ' + nGP.toFixed(1), 120 + nX, 100);
*/
    cTxt = 'GP%: ' + nGP.toFixed(1);
    tdctx.fillStyle = "#45c0bd";
    tdctx.font = "300 20px Tahoma";
    nX = 392 - tdctx.measureText( cTxt ).width - 15
    tdctx.fillText( cTxt, nX, 100);

    tdctx.fillStyle = "#FFFFFF";
    tdctx.fillRect(120, 138, 272, 50);

    tdctx.fillStyle = "#000000";
    tdctx.textAlign = "left";
    tdctx.font = "300 24px Tahoma";
    cTxt = numberWithCommas(tdCusts);
    tdctx.fillText( cTxt, 120, 178);

    cTxt = 'Avg: $' + formatMoney( nAvg ); // nAvg.toFixed(2);
    tdctx.fillStyle = "#45c0bd";
    tdctx.font = "300 20px Tahoma";
    nX = 392 - tdctx.measureText( cTxt ).width - 15
    tdctx.fillText( cTxt, nX, 178);

    if (obj.dayAgoDate) {
        tdctx.fillStyle = "#FFFFFF";
        tdctx.fillRect(40, 244, 332, 55);

        tdCalendar(tdctx,42,204,50,50,10);

        tdctx.fillStyle = "#fff";
        tdctx.textAlign = "center";
        tdctx.font = "bold 12px arial";
        tdctx.fillText(obj.dayAgoMonth, 67, 218);

        tdctx.fillStyle = "#000";
        tdctx.textAlign = "center";
        tdctx.font = "400 30px arial";
        tdctx.fillText( obj.dayAgoDate, 67, 248);

        tdctx.fillStyle = "#808080";
        tdctx.textAlign = "left";
        tdctx.font = "400 24px Tahoma";
        tdctx.fillText(obj.dayAgoSales + ' / ' + obj.dayAgoCusts, 120, 241);
    }

    if (Object.keys(obj).length > 3) {
        var nLen = obj.tenders.length;

        $("#sales-dols").text(numberWithCommas(tdSales));
        $("#invoice-qty").text(numberWithCommas(tdCusts));
        $("#TD_hdr").text("Today's Sales as of " + tdD.toLocaleDateString() + "  " + tdD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        $("#tax-dols").text(numberWithCommas(obj.tax));
        if (obj.deposits) {
            $("#TD_deposits").show();
            $("#depo-retn").text(numberWithCommas(obj.deposits) + " - " + numberWithCommas(obj.returns.replace('-','')));
            $("#net-depo").text(numberWithCommas(obj.netDeposits));
        } else {
            //$("#TD_deposits").hide();
        }
        $("#cpn-lbl").text('Coupons (' + numberWithCommas(obj.cpnQty) + ')');
        $("#cpn-dols").text(numberWithCommas(obj.cpnDols));
        $("#lot-dols").text(numberWithCommas(obj.netLot));
        $("#payment-lbl").text('Payments on Account (' + numberWithCommas(obj.poaQty) + ')');
        $("#payment-dols").text(numberWithCommas(obj.poaDols));
        $("#discount-dols").text(numberWithCommas(obj.disc));
        $("#cost-dols").text(numberWithCommas(obj.cost));
        $("#profit-dols").text(numberWithCommas((Number(obj.dollars) - Number(obj.cost)).toFixed(2)));
        $("#profit-perc").text(nGP.toFixed(1)+'%');
        $('#invoice-avg').text('Avg: $' + formatMoney( nAvg ) ); // nAvg.toFixed(2));

        for (i = 0; i < nLen; i++) {
            $("#tender-" + (i + 1).toString() + '-lbl').text(obj.tenders[i][0]);
            $("#tender-" + (i + 1).toString() + '-qty').text(numberWithCommas(obj.tenders[i][1]));
            $("#tender-" + (i + 1).toString() + '-dols').text(numberWithCommas(obj.tenders[i][2]));
        };

        for (i = nLen + 1; i < 12; i++) {
            $("#tender-" + i.toString()).toggle(false);
        };

        var tmc = document.getElementById("TopMovers");
        var tmctx = tmc.getContext("2d");

        tmctx.fillStyle = "#FFFFFF";
        tmctx.fillRect(115, 64, 375, 240);

        if ((Date.now()) - ntdD > 900000) {
            tmctx.fillStyle = "#ff0000";
        } else {
            tmctx.fillStyle = "#000000";
        }
        tmctx.textAlign = "right";
        tmctx.font = "italic 10px Verdana";
        tmctx.fillText("As of " + tdD.toLocaleDateString() + "  " + tdD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 380, 255);

        tmctx.fillStyle = "#000000";
        tmctx.textAlign = "left";
        tmctx.font = "16px Verdana";

        $("#More_TD").toggle(true);

        if (obj.topFive.length > 0) {
            $("#More_Top").toggle(true);

            tmctx.fillText(obj.topFive[0], 15, 105);

            if (obj.topFive.length > 1) {
                tmctx.fillText(obj.topFive[1], 15, 135);
            } else {
                tmctx.fillText("2. --", 15, 135);
            };

            if (obj.topFive.length > 2) {
                tmctx.fillText(obj.topFive[2], 15, 165);
            } else {
                tmctx.fillText("3. --", 15, 165);
            };

            if (obj.topFive.length > 3) {
                tmctx.fillText(obj.topFive[3], 15, 195);
            } else {
                tmctx.fillText("4. --", 15, 195);
            };

            if (obj.topFive.length > 4) {
                tmctx.fillText(obj.topFive[4], 15, 225);
            } else {
                tmctx.fillText("5. --", 15, 225);
            };

        } else {
            tmctx.fillText("1. --", 15, 105);
        };

        //store data for other panels
        aItemSales = obj.itemSales;
        aTypeSales = obj.typeSales;

        drawPieChart(obj);

    };
}

function setInitialHourly(obj) {
    //obj._initValue = obj.value;
    obj.selectedIndex = -1;
}

function showHourlyTable(cPeriod) {
    var x = document.getElementById("Modal_Hourly");
    var ntimes = 0;
    var dD = new Date();
    var json;
    var customDates = '';

    $("#Modal_Hourly").spin("modal");

    if (!cPeriod) {
        $("#hourlySelect").val( "today" );
        cPeriod = 'today';
    } else if (cPeriod === 'custom') {
        customDates = [];
        customDates.push( $('input[name="hourlyStartDate"]').val() );
        customDates.push( $('input[name="hourlyEndDate"]').val() );
        customDates = JSON.stringify( customDates );
    }

    HourlyTable = $('#HourlyTable').DataTable({
        responsive: true,
        dom: 'Brt',
        pageLength: 25,
        buttons: [
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'portrait',
                title: function () {
                    var printTitle = $('#HourlyTitle').text();
                    return printTitle.substring(0, printTitle.indexOf('as of'));
                },
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>th:nth-child(n+1) { text-align: center; }</style>')
                        .append('<style>td:nth-child(n+1) { text-align: center; }</style>')
                        .append('<style>td:nth-child(n+2):nth-child(-n+5) { text-align: right; }</style>');

                    $(window.document.body)
                        .css({ "background-color": "white", "font-family": "verdana, sans-serif", "font-size": "12px" });

                    $(window.document.body).find('h1')
                        .css({ "text-align": "center", "font-size": "16px" });

                    $(window.document.body).find('div')
                        .css({ "min-height": "60px" });

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css({ "font-size": "inherit", "width": "80%", "margin": "auto" });

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
        ],
        ajax: "TodayHourlySales('','" + cPeriod + "','" + customDates + "')",
        columns: [
            { "width": "30%" },
            { "width": "17.5%" },
            { "width": "17.5%" },
            { "width": "17.5%" },
            { "width": "17.5%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [1, 2, 3, 4] },
            { className: 'titleCell', targets: [0] },
            { className: 'numericCol', targets: [1, 2, 3] },
            { className: 'boldNumericCol', targets: [4] }
        ],
        ordering: false,
        initComplete: function () {
            $("#Modal_Hourly").spin("modal");
        }
    });

    HourlyTable.on('preDraw', function () {
        json = HourlyTable.ajax.json();
        var nodes = HourlyTable.column(4).nodes();
        $(nodes[json.maxRow - 1]).css('font-size', '16px');
        $("#HourlyTitle").html(json.cTitle);
    });

    $("nav").css('z-index', -1);
    x.style.display = "block";
}

function reloadHourlyTable() {
    var cPeriod = $('#hourlySelect option:selected').val();

    if (cPeriod==='custom') {
        modalHourlyDateForm();
        return;
    }

    HourlyTable.clear().destroy(false);

    showHourlyTable(cPeriod);
}

function modalHourlyDateForm() {
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = (day)+"/"+(month)+"/"+now.getFullYear();

    document.querySelectorAll('input[name$="hourlyStartDate"]')[0].valueAsDate=now;
    document.querySelectorAll('input[name$="hourlyEndDate"]')[0].valueAsDate=now;

    hourlyModalDialog = $( "#hourlyModalDateDialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: [
          {
                id: "hourlySubmit",
                text: "Run Report",
                click: function() {
                    if (hourlyCheckEndDateVal()) {
                        $(this).dialog( "close" );
                        HourlyTable.clear().destroy(false);
                        showHourlyTable('custom');
                    }
                }
          },
          {
            id: "hourlyCancel",
            text: "Cancel",
            click: function() {
                $(this).dialog( "close" );
            }
        }],
        close: function() {
          console.log("closed");
        }
    });
   
    hourlyForm = hourlyModalDialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        if (hourlyCheckEndDateVal()) {
            hourlyModalDialog.dialog( "close" );
            HourlyTable.clear().destroy(false);
            showHourlyTable('custom');
        }
    });

    hourlyModalDialog.dialog( "open" );
}

function hourlySetEndDateVal() {
    var startDate = $('input[name="hourlyStartDate"]').val();
    startDate = startDate.split("-");
    var endDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);

    document.querySelectorAll('input[name$="hourlyEndDate"]')[0].valueAsDate=endDate;
}

function hourlyCheckEndDateVal() {
    var startDate = $('input[name="hourlyStartDate"]').val();
    startDate = startDate.split("-");
    startDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);

    var endDate = $('input[name="hourlyEndDate"]').val();
    endDate = endDate.split("-");
    endDate = new Date(endDate[0], endDate[1] - 1, endDate[2]);

    if (endDate < startDate) {
        swal({
            title: 'Date Error',
            text:  'The end date must be same as or greater than start date.',
            type:  'error'
            },
            function () {
                document.querySelectorAll('input[name$="hourlyEndDate"]')[0].valueAsDate = startDate;
                $("#hourlyEndDate").focus();
        });
        return false;
    } else {
        return true;
    };
}

function EXLogDecode(obj) {
    var cEx = document.getElementById("Exceptions");
    var exctx = cEx.getContext("2d");

    exEntries = obj.entries;
    exRefunds = obj.refunds;
    exDate = obj.date;
    var nexD = Number(obj.date);
    var exD = new Date(nexD);

    if (EXloadergone === 0) {
        exWaitEntries.kill();
        exWaitRefunds.kill();
        document.getElementById("More_Except").style.visibility = "visible";
        EXloadergone++;
    }

    exctx.fillStyle = "#FFFFFF";
    exctx.fillRect(120, 70, 252, 50);

    exctx.fillStyle = "#000000";
    exctx.textAlign = "left";
    exctx.font = "300 24px Verdana";
    exctx.fillText("Log Entries: " + numberWithCommas(exEntries), 120, 110);

    exctx.fillStyle = "#FFFFFF";
    exctx.fillRect(120, 158, 252, 50);

    exctx.fillStyle = "#000000";
    exctx.textAlign = "left";
    exctx.font = "300 24px Verdana";
    exctx.fillText("Returns: " + numberWithCommas(exRefunds), 120, 198);

    exctx.fillStyle = "#FFFFFF";
    exctx.fillRect(1, 35, 375, 15);

    if ((Date.now()) - nexD > 900000) {
        exctx.fillStyle = "#ff0000";
    } else {
        exctx.fillStyle = "#000000";
    }
    exctx.textAlign = "center";
    exctx.font = "italic 10px Verdana";
    exctx.fillText("As of " + exD.toLocaleDateString() + "  " + exD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 197, 47);

    $("#More_Except").toggle(true);

}

function showExceptTable() {
    var x = document.getElementById("Modal_Except");
    var ntimes = 0;
    var dD = new Date();

    $("#Modal_Except").spin("modal");

    exceptTable = $('#excepttable').DataTable({
        responsive: true,
        dom: 'Bfrtilp',
        buttons: [
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'portrait',
                title: "Exception Log as of " + dD.toLocaleDateString() + "  " + dD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'portrait',
                title: "Exception Log as of " + dD.toLocaleDateString() + "  " + dD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                customize: function (window) {
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
        ],
        ajax: "exceptTable?",
        columns: [
            { "width": "7%" },
            { "width": "7%" },
            { "width": "7%" },
            { "width": "7%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "5%" },
            { "width": "12%" },
            { "width": "15%" }
        ],
        order: [[3, 'asc']],
        "fnDrawCallback": function () {
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            } else {
                $("#except_hdr").text("Exception Log as of " + dD.toLocaleDateString() + "  " + dD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            };
            ntimes++;
        },
        initComplete: function () {
            $("#Modal_Except").spin("modal");
        }
    });

    $("nav").css('z-index', -1);
    x.style.display = "block";
}

/* Departments */
function drawPieChart(obj) {
    var c = document.getElementById("Departments");
    var ctx = c.getContext("2d");

    if (obj.deptData.length === 0) {
        ctx.fillStyle = "#43a3d7";
        ctx.textAlign = "center";
        ctx.font = "600 20px Verdana";
        ctx.fillText("Today's Dept Sales", 117, 30);
        return;
    } else {
        $("#More_Dept").toggle(true);
    };

    if (typeof deptPieChart !== 'undefined') {
        deptPieChart.destroy();
        $('#js-legend').replaceWith('<div id="js-legend" class="chart-legend"></div>');
    };

    var pieData = {
        labels: obj.deptLbls,
        datasets: [
            {
                data: obj.deptData,
                backgroundColor: obj.colors,
                hoverBackgroundColor: obj.colors
            }]
    };

    var Departments = document.getElementById("Departments").getContext("2d");

    deptPieChart = new Chart(Departments, {
        type: 'pie',
        data: pieData,
        animation: {
            animateScale: true
        },
        options: {
            legend: {
                display: false,
                labels: {
                    boxWidth: 10,
                    fontSize: 10,
                    padding: 2
                }
            },
            title: {
                display: true,
                text: "Today's Dept Sales            ",
                fontFamily: "Verdana",
                fontSize: 18,
                fontColor: "#43a3d7"
            },
			plugins: {
				datalabels: {
                    display: false
                }
            },
            tooltips: {
                bodyFontSize: 14,
                callbacks: {
                  label: function (tooltipItem, data) {
                    // return ' ' + obj.deptLbls[tooltipItem.index]+ '  $' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('en')
                    return ' ' + obj.deptLbls[tooltipItem.index]+ '  $' + formatMoney( data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] );
                  }
                }
            }
        }
    });
    /*
          Chart.pluginService.register({
            beforeDraw: function(chart) {
              var ctx = chart.chart.ctx;
              var dD = new Date();
    
              ctx.restore();
              ctx.fillStyle="#000000";
              ctx.textAlign="left"; 
              ctx.font="italic 10px Verdana";
              ctx.fillText("As of " + dD.toLocaleDateString() + "  " + dD.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),5,255);             
              ctx.save();
              }
          });
    */
    document.getElementById('js-legend').innerHTML = deptPieChart.generateLegend();

}

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
  
      const negativeSign = amount < 0 ? "-" : "";
  
      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;
  
      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e);
      return '';
    }
}

function showTypTable() {
    var x = document.getElementById("Modal_Typ");
    var ntimes = 0;

    $("#Modal_Typ").spin("modal");

    typTable = $('#typtable').DataTable({
        responsive: true,
        dom: 'Bfrtilp',
        buttons: [
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'landscape',
                title: 'Product Type Sales ' + todayString(),
                header: true,
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Product Type Sales ' + todayString(),
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(n+3):nth-child(-n+8) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        ajax: 'typesSoldTable?',
        columns: [
            { "width": "20%" },
            { "width": "25%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "7.5%" },
            { "width": "7.5%" },
            { "width": "10%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [2, 3, 4, 5, 6, 7] },
            { className: 'numericCol', targets: [2, 3, 4, 5, 6, 7] }
        ],
        order: [[2, 'desc']],
        "fnDrawCallback": function () {
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                var dD = new Date();
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                $("#typ_hdr").text("Product Type Sales " + dD.toLocaleDateString());
            };
            ntimes++;
        },
        initComplete: function () {
            $("#Modal_Typ").spin("modal");
        }
    });

    x.style.display = "block";
}

function showTopTable() {
    var x = document.getElementById("Modal_Top");
    var ntimes = 0;

    $("#Modal_Top").spin("modal");

    topTable = $('#toptable').DataTable({
        responsive: true,
        dom: 'Bfrtilp',
        buttons: [
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'landscape',
                title: 'Items Sold ' + todayString(),
                header: true,
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Items Sold ' + todayString(),
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(n+5):nth-child(-n+6) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        ajax: 'itemsSoldTable?',
        columns: [
            { "width": "20%" },
            { "width": "20%" },
            { "width": "10%" },
            { "width": "20%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [4, 5, 6] },
            { className: 'numericCol', targets: [4, 5, 6] }
        ],
        order: [[4, 'desc']],
        "fnDrawCallback": function () {
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                var dD = new Date();
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                $("#top_hdr").text("Items Sold as of " + dD.toLocaleDateString() + "  " + dD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            };
            ntimes++;
        },
        initComplete: function () {
            $("#Modal_Top").spin("modal");
        }
    });

    x.style.display = "block";
}

/* Year-to-Year */
function y2yData() {
    var xmlhttp = new XMLHttpRequest();
    var tab = $('#tab_dash');
    var lRun = tab.is(':visible');
    var url = "Y2YData()";

    // don't run if dash tab isn't visible
    if (lRun) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                try {
                    var y2yData = JSON.parse(xmlhttp.responseText);
                    y2yPanelBuild(y2yData);
                } catch(err) {
                    console.log( 'At y2yData(): ' + err.message );
                }
            }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.send();
    };
}

function y2yPanelBuild(obj) {
    var c = document.getElementById("Year2Year");
    var ctx = c.getContext("2d");
    var d = new Date();
    var cDelta = obj.delta;
    var nDelta = Number(cDelta);
    var cTxt;

    d.setDate(d.getDate() - 1);

    y2yWait.kill();
    $("#More_Y2Y").toggle(true);

    var arrow = document.createElement('img');
    if (nDelta === 0) {
        cTxt = 'equal';
        arrow.src = './images/equal.png';
    } else if (nDelta >= 0) {
        cTxt = 'up';
        arrow.src = './images/arrow_up.png';
    } else {
        cTxt = 'down';
        arrow.src = './images/arrow_dn.png';
    };
    arrow.onload = function () {
        var c = document.getElementById('Year2Year');
        var ctx = c.getContext('2d');
        ctx.drawImage(arrow, 55, 64, 64, 64);
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "600 40px Verdana";
    ctx.fillText(cDelta + '%', 140, 110);

    /* Y2Y Data */
    var nYearNow = new Date().getFullYear();
    var cYearNow = nYearNow.toString();
    var cYearAgo = (nYearNow - 1).toString();

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.font = "300 20px Verdana";
    ctx.fillText("Thru yesterday (" + d.toLocaleDateString() + ")", 197, 168);
    ctx.fillText("sales are " + cTxt + " compared to the", 197, 198);
    ctx.fillText("same period in " + cYearAgo + ".", 197, 228);

    $("#Y2YChartPrintBtn").html( svgPrint );

    /* Chart Data for Modal_Y2Y Window */
    var barData = {
        labels: obj.months,
        datasets: [
            {
                label: cYearAgo,
                backgroundColor: "#4586A9",
                borderColor: "#4586A9",
                data: obj.dataAgo,
                datalabels: {
                    display: false
                }
            },
            {
                label: cYearNow,
                backgroundColor: "#4148B6",
                borderColor: "#4148B6",
                data: obj.dataNow,
                datalabels : {
                    align	: 'end',
                    anchor : 'end',
                    display: function(context) {
                        var i = context.dataIndex;
                        var prev = obj.dataAgo[i];
                        var value = obj.dataNow[i];
                        return !( value === 0 || prev === 0 )
                    },
                    backgroundColor: function(context) {
                        var i = context.dataIndex;
                        var prev = obj.dataAgo[i];
                        var value = obj.dataNow[i];
                        var diff = prev !== undefined ? value - prev : 0;
                        var color = diff < 0 ? '#f15b7e' : '#45c0bd';
                        return color;
                    },
                    borderRadius: 4,
                    color: '#ffffff',
                    font: {
                        weight: '300'
                    },
                    formatter: function(value, context) {
                        var i = context.dataIndex;
                        var prev = obj.dataAgo[i];
                        var diff = prev !== undefined ? value - prev : 0;
                        var glyph = diff < 0 ? '\u25BC' : diff > 0 ? '\u25B2' : '\u25C6';
                        var perc = (diff/prev)*100;
                        return value === 0 ? '' : glyph + ' ' + numberWithCommas( perc.toFixed(1) ) + '%';
                    }
                }
            }
        ]
    }

    var m_Y2Y = document.getElementById("Modal_Y2Y_Canvas").getContext("2d");

    var m_Y2Y_Chart = new Chart(m_Y2Y, {
        type: 'bar',
        data: barData,
        options: {
            maintainAspectRatio: false,
            title: {
                display: true,
                text:  ['Year over Year', cYearAgo + ' - ' + cYearNow],
                fontSize: 20,
                fontColor: "#4148B6"
            },
            legend: {
                position: "bottom"
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Dollars (000)'
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                        color: 'rgb(0,0,0,0.4)'
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                        color: 'rgb(0,0,0,0.4)'
                    }
                }]
            }
        }
    });
}

/* Inventory panel */
function invPosition() {
    var xmlhttp = new XMLHttpRequest();
    var tab = $('#tab_dash');
    var lRun = tab.is(':visible');
    var url = "InvPosition()";

    // don't run if dash tab isn't visible
    if (lRun) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                try {
                    var invData = JSON.parse(xmlhttp.responseText);
                    invPanelBuild(invData);
                } catch(err) {
                    console.log( 'At invPosition(): ' + err.message );
                }
            }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.send();
    };
}

function invPanelBuild(oData) {
    var c = document.getElementById("Inventory");
    var ctx = c.getContext("2d");

    invWait1.kill();
    invWait2.kill();
    $("#More_Inv").toggle(true);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "300 22px Verdana";
    ctx.fillText("Value: $ " + numberWithCommas(oData.invDollars), 120, 105);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "300 22px Verdana";
    ctx.fillText("Days on Hand: ", 120, 183); // + numberWithCommas(oData.invDays), 120, 198);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "300 22px Verdana";
    ctx.fillText(numberWithCommas(oData.invDays), 120, 213);

    aTypeInv = oData.typeInv;
}

function showInvTable() {
    var x = document.getElementById("Modal_Inv");
    var ntimes = 0;

    invTable = $('#invtable').DataTable({
        responsive: true,
        dom: 'Bfrtilp',
        buttons: [
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'landscape',
                title: 'Inventory Value ' + todayString(),
                header: true,
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Inventory Value ' + todayString(),
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(n+3):nth-child(-n+6) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                    
                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        data: aTypeInv,
        columns: [
            { "width": "10%" },
            { "width": "40%" },
            { "width": "12.5%" },
            { "width": "12.5%" },
            { "width": "12.5%" },
            { "width": "12.5%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [2, 3, 4, 5] },
            { className: 'numericCol', targets: [2, 3, 4, 5] }
        ],
        order: [[2, 'desc']],
        "fnDrawCallback": function () {
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                var dD = new Date();
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                $("#inv_hdr").text("Inventory Value " + dD.toLocaleDateString());
            };
            ntimes++;
        }
    });

    x.style.display = "block";
}

// Begin Frequent Buyer Functions
function getCusTypes() {
    elog('aCusTypes.length 1:', aCusTypes.length);

    if (aCusTypes.length === 0) {
        $('#cusTypeLoading').html('&#9728; LOADING &#9728;');

        $.post("getCustypes()", "", function (data, status) {
            if (data.aCusts.length > 0) {
                let select = document.getElementById('custype');
                elog('select:', select);
                aCusTypes = data.aCusts;
                elog('aCusTypes.length 2:', aCusTypes.length);
                for (let i = 0; i < aCusTypes.length; i++) {
                    let opt = aCusTypes[i][0];
                    let el = document.createElement("option");
                    el.textContent = opt;
                    el.value = opt;
                    select.appendChild(el);
                };
            };
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
            swal("Oops...", "error: " + thrownError, "error");
            $(".fqmodal").hide();
        })
        .always(function () {
            $('#cusTypeLoading').html('&nbsp;');
        });
    }
}

function showCustype(cRadio) {
    let cE = "#" + cRadio;
    $(cE).prop('checked', true);
    
    getCusTypes("custype");

    $('#Modal_Custype').show();
}

function closeCustype() {
    var x = document.getElementById("Modal_Custype");
    var el = document.getElementById("custype");
    var clen = document.getElementById('ctyplen');
    var len, ctypes
    x.style.display = "none";
    ctypes = getCusTypesSelected();
    len = ctypes.length;
    if (len === 1) {
       clen.innerHTML = len.toString() + " type picked.";
    } else {
        clen.innerHTML = len.toString() + " types picked.";
    }
}

// Return an array of the selected customer types
function getCusTypesSelected() {
    var result = [];
    var ctypes = document.getElementById("custype");
    var options = ctypes.options;
    var opt;

    for (var i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];
        if (opt.selected) {
            result.push(i);
        }
    }
    return result;
}

function showFQarchive() {
    var thdr = document.getElementById("FQhdr");
    var arr = $("#Modal_FQ_Body input");

    thdr.visibility = false;
    for (i = 8; i < arr.length; i++) {
        arr[i].disabled = true;
    }

    $('#fq_action_cancel').toggle(false);
    $('#fq_action_submit').toggle(false);

    $("#custypebtn").prop('disabled', false);

    $('#fqSelectDate').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    $("#custype").val([]);  // clear previous selections
    $('#ctyplen').html("0 types picked.");

    $("nav").css('z-index', -1);
    $("#tab_util").toggle(false);
    $("#Modal_FQ").toggle(true);
}

function fqArchiveLaunch() {
    var lExists;
    $.post("fqArchiveExists()", function (data) {
        lExists = data[0];
        if (lExists) {
            showFQrestore()
        } else {
            swal('Sorry...', 'No customers have been archived yet.', 'info')
            return
        };
    });
}

function showFQrestore() {
    var x = document.getElementById("Modal_Restore");
    var intro = $("#restore_intro")
    var d = new Date();
    var ntimes = 0;

    restoreTable = $('#restoretable').DataTable({
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
                filename: 'Archived Frequent Buyers ' + todayString()
            },
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'landscape',
                title: 'Archived Frequent Buyers ' + todayString()
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                customize: function (window) {
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
            }
            },
        ],
        ajax: "ArchiveTable()",
        "columns": [
            { "width": "5%" },
            { "width": "7%" },
            { "width": "38%" },
            { "width": "15%" },
            { "width": "13%" },
            { "width": "12%" },
            { "width": "10%" }
        ],
        columnDefs: [
            { targets: 0, orderable: false, className: 'select-checkbox' },
            { targets: [7], title: 'Address' },
            { targets: [8], title: 'Address2' },
            { targets: [9], title: 'Zip' },
            { targets: [7, 8, 9], visible: false, searchable: false, orderable: false }
        ],
        select: {
            style: 'single',
            selector: 'td:first-child',
            blurable: true
        },
        order: [[2, 'asc']],
        "fnDrawCallback": function () {
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        }
    });

    $("nav").css('z-index', -1);
    $("#tab_util").toggle(false);
    $("#Modal_Restore").toggle(true);

    restoreTable.on('select', function (e, dt, type, indexes) {
        var rowData = restoreTable.rows(indexes).data().toArray();
        swal({
            title: "Restore Customer #" + rowData[0][1] + "?",
            text: '"' + rowData[0][2] + '" will be restored to the active customer file.',
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
        },
            function () {
                $.post("restoreCustomer('" + rowData[0][1] + "')", "", function () {
                    restoreTable.rows(indexes).remove().draw();
                    swal("Customer # " + rowData[0][1] + " restored.");
                })
                    .fail(function (xhr, ajaxOptions, thrownError) {
                        swal("error: " + thrownError);
                    });
            });
    });
}

function closeFqModal() {
    var thdr = document.getElementById("thdr");
    var arr = $("#Modal_FQ_Body input");

    for (i = 0; i < arr.length; i++) {
        arr[i].disabled = false;
    }
    $("#custypebtn").prop('disabled', false);

    fqTable.clear().destroy(false);

    $("#tablewrapper").toggle(false);
    $("#waitp").toggle(true);

    arr[13].value = "Cancel";

    $('#fq_select_cancel').toggle(true);
    $('#fq_select_submit').toggle(true);
    $('#fq_action_cancel').toggle(false);
    $('#fq_action_submit').toggle(false);

    $("nav").css('z-index', 999);
    $("#Modal_FQ").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
    }
}

function closeFqModal_1() {
    var arr = $("#Modal_FQ_Body input");

    for (i = 0; i < arr.length; i++) {
        arr[i].disabled = false;
    }
    $("#custypebtn").prop('disabled', false);

    $('#fq_select_cancel').toggle(true);
    $('#fq_select_submit').toggle(true);
    $('#fq_action_cancel').toggle(false);
    $('#fq_action_submit').toggle(false);

    $("nav").css('z-index', 999);
    $("#Modal_FQ").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
    }
}

function closeRestore() {
    restoreTable.clear().destroy(false);

    $("nav").css('z-index', 999);
    $("#Modal_Restore").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
    }
}

function switch2Action() {
    var arr = $("#selects :input");
    var table = $("#fqtable");
    var thdr = document.getElementById("thdr");
    var nPts;
    var cSelect;
    var cDate;
    var acTypNums = [];
    var acTypIdxs;
    var ccTypNums;
    var nIdx;
    var aCNs;
    var ntimes = 0;

    nPts = $("#fqSelectPts").val();
    cDate = $("#fqSelectDate").val();
    acTypIdxs = getCusTypesSelected();
    for (i = 0; i < acTypIdxs.length; i++) {
        nIdx = acTypIdxs[i];
        acTypNums.push(aCusTypes[nIdx][1]);
    };
    ccTypNums = JSON.stringify(acTypNums)
    cSelect = $('input[name=select]:checked').val();

    $("#selects :input").each(function (index) {
        $(this).prop('disabled', true);
    });

    $("#custypebtn").prop('disabled', true);

    $("#actions :input").each(function (index) {
        $(this).prop('disabled', false);
    });

    $('#fq_action_cancel').val("Cancel");

    $('#fq_select_cancel').toggle(false);
    $('#fq_select_submit').toggle(false);
    $('#fq_action_cancel').toggle(true);
    $('#fq_action_submit').toggle(true);

    $("#col1").text("");
    $("#col2").text("Nbr");
    $("#col3").text("Name");
    $("#col4").text("City, ST");
    $("#col5").text("Phone");
    $("#col6").text("Last Sale");
    $("#col7").text("Points");
    $("#col8").text("Address");
    $("#col9").text("Address2");
    $("#col10").text("Zip");

    $("#thdr").show();

    fqTable = $('#fqtable').DataTable({
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
                filename: 'Frequent Buyer Report ' + todayString()
            },
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'landscape',
                title: 'Frequent Buyer Report ' + todayString()
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                customize: function (window) {
                    window.document.body.style.fontFamily = "sans-serif";
                    window.document.body.style.fontSize = "smaller";
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                text: svgDelete,
                titleAttr: '  Remove ✓ Items  ',
                action: function () {
                    aCNs = $.map(fqTable.rows({ selected: true }).data(), function (item) {
                        return item[1]
                    });
                    if (aCNs.length < 1) {
                        swal("Nothing To Do", "No customers have been selected.", "error");
                        return;
                    };
                    swal({
                        title: "Are you sure?",
                        text: "Remove the " + aCNs.length + " selected customers from the set you are modifying?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#f695ab",
                        confirmButtonText: "Yes, proceed!",
                        closeOnConfirm: true
                    },
                        function (isConfirm) {
                            if (isConfirm) {
                                fqTable.rows({ selected: true }).remove().draw();
                                $("#fq_action_submit").focus();
                                return;
                            } else {
                                return;
                            }
                        }
                    );
                }
            }
        ],
        ajax: "FQTable('" + cSelect + "','" + cDate + "','" + nPts.toString() + "','" + ccTypNums + "')",
        "columns": [
            { "width": "5%" },
            { "width": "7%" },
            { "width": "38%" },
            { "width": "15%" },
            { "width": "13%" },
            { "width": "12%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" }
        ],
        columnDefs: [
            { targets: 0, orderable: false, className: 'select-checkbox' },
            { targets: [7], title: 'Address' },
            { targets: [8], title: 'Address2' },
            { targets: [9], title: 'Zip' },
            { targets: [7, 8, 9], visible: false, searchable: false, orderable: false }
        ],
        select: {
            style: 'os',
            selector: 'td:first-child'
        },
        order: [[2, 'asc']],
        "fnDrawCallback": function () {
            $("#waitp").hide();
            $("#tablewrapper").show();
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        }
    });
}

function proceedWithAction() {
    var arr = $("#actions :input");
    var table = $("#fqtable");
    var thdr = document.getElementById("thdr");
    var nPts;
    var nSub;
    var cSelect;
    var aCNs;
    var cCNs;
    var ntimes = 0;

    nPts = $("#fqNewBalance").val();
    nSub = $("#fqSubtract").val();
    cSelect = $('input[name=action]:checked').val();

    swal({
        title: "Are you sure?",
        text: "Proceed with the changes you have selected?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f695ab",
        confirmButtonText: "Yes, proceed!",
        closeOnConfirm: false,
        closeOnCancel: false,
        showLoaderOnConfirm: true
    },
        function (isConfirm) {
            if (isConfirm) {
                aCNs = $.map(fqTable.rows().data(), function (item) {
                    return item[1]
                });
                cCNs = JSON.stringify(aCNs);

                $.post("modifyPoints?", { cSelect: cSelect, cPts: nPts.toString(), cSub: nSub.toString(), xCNs: cCNs },
                    function (data, status) {
                        for (i = 0; i < arr.length; i++) {
                            arr[i].disabled = true;
                        };
                        $("#custypebtn").prop('disabled', true);

                        fqTable.clear().destroy(false);

                        $("#col1").text("Nbr");
                        $("#col2").text("Name");
                        $("#col3").text("City, ST");
                        $("#col4").text("Phone");
                        $("#col5").text("Last Sale");
                        $("#col6").text("Old Pts");
                        $("#col7").text("New Pts");
                        $("#col8").text("Address");
                        $("#col9").text("Address2");
                        $("#col10").text("Zip");

                        fqTable = $('#fqtable').DataTable({
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
                                    filename: 'Frequent Buyer Report ' + todayString()
                                },                    
                                {
                                    extend: 'pdf',
                                    text:   svgPdf,
                                    titleAttr: '  PDF File  ',
                                    orientation: 'landscape',
                                    title: 'Frequent Buyer Report ' + todayString()
                                },
                                {
                                    extend: 'print',
                                    text: svgPrint,
                                    titleAttr: '  Print  ',
                                    orientation: 'landscape',
                                    customize: function (window) {
                                        window.onafterprint = function(event) {  window.close(); };                        
                                        window.print();                       
                                    }
                                }
                            ],
                            data: data,
                            "columns": [
                                { "width": "7%" },
                                { "width": "33%" },
                                { "width": "15%" },
                                { "width": "13%" },
                                { "width": "12%" },
                                { "width": "10%" },
                                { "width": "10%" }
                            ],
                            select: false,
                            order: [[1, 'asc']],
                            columnDefs: [
                                { targets: [7, 8, 9], visible: false, searchable: false },
                                { targets: [7], title: 'Address' },
                                { targets: [8], title: 'Address2' },
                                { targets: [9], title: 'Zip' }
                            ],
                            "fnDrawCallback": function () {
                                $('.dataTables_length').css('padding-top', '0.755em');
                                $('.dataTables_length').css('padding-left', '0.755em');
                                if (ntimes < 1) {
                                    $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                                };
                                ntimes++;
                            }
                        });

                        swal("Processed!", "Your requested changes have been made.", "success");
                        $("#fq_action_cancel").val("All Done");
                        $("#fq_action_cancel").prop("disabled", false);
                        $("#fq_action_submit").toggle(false);
                    })
                    .fail(function (xhr, ajaxOptions, thrownError) {
                        swal("Oops...", "error: " + thrownError, "error");
                    });

            } else {
                swal("Cancelled", "No changes have been made.", "error");
                return;
            };
        }
    );
}
// End Frequent Buyer Functions

// Begin Inventory Archive
function invArchiveLaunch() {
    var lExists;
    $.post("invArchiveExists()", function (data) {
        lExists = data[0];
        if (lExists) {
            showINVrestore();
        } else {
            swal('Sorry...', 'Nothing archived.', 'info');
            return;
        };
    });
}

function showInvArchive() {
    $("#INVX_hdr").toggle(false);
    document.getElementById("INVX_date").disabled = true;

    $('#INVX_date').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    getVendors('INVX_vendor');
    getInvDepts('INVX_invtype');
    getSizes('INVX_size');
    setINVXdateSpan();

    $("nav").css('z-index', -1);
    $("#tab_util").toggle(false);
    $("#Modal_INVX").toggle(true);
}

function closeINVX() {
    var wait = $('#INVX_waitp');
    var isVisible = wait.is(':visible');

    if (!isVisible) {
        if ($.fn.DataTable.isDataTable('#INVXtable')) {
            INVXtable.clear().destroy(false);
        };
        $('#INVX_waitp').toggle(true);
        $("#INVX_hdr").toggle(false);
        $("#INVXtablewrapper").toggle(false);
    };

    $('.DOH_box1 > *').prop("disabled", false);
    $('.DOH_box2 > *').prop("disabled", false);

    $("#INVX_submit").prop("disabled", false);
    $("#INVX_submit").prop("value", "Submit");
    $("#INVX_submit").toggle(true);
    $("#INVX_cancel").prop("value", "Cancel");
    $("#INVX_submit").attr("onclick", "getINVXreport()");

    $("nav").css('z-index', 999);
    if (doDash) {
        $("#tab_dash").toggle(true);
    }
    $("#Modal_INVX").toggle(false);
}

function closeINV_Restore() {
    if ($.fn.DataTable.isDataTable('#INV_restoreTable')) {
        INV_restoreTable.clear().destroy(false);
    }
    $("nav").css('z-index', 999);
    $("#Modal_INV_Restore").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
    }

}

function toggleINVXDeptType() {
    var el = document.getElementById('INVX_depttype');
    var cSel = el.options[el.selectedIndex].value;
    $('#INVX_invtype')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="       ">&#60; ANY &#62;</option>');
    if (cSel === "dept") {
        getInvDepts('INVX_invtype');
    } else {
        getInvTypes('INVX_invtype');
    };
    $('#INVX_invtype').toggle(true);
}

function INVXcustomDate() {
    document.getElementById("INVXrange").disabled = true;
    document.getElementById("INVX_date").disabled = false;
    $('#INVX_date_span').toggle(false);
}

function INVXstandardDate() {
    $('#INVX_date').val('');
    document.getElementById("INVX_date").disabled = true;
    document.getElementById("INVXrange").disabled = false;
    $('#INVX_date_span').toggle(true);
}

function setINVXdateSpan() {
    var dateRange = $('input[name=INVX_dateRange]:checked').val();
    var arr = [];
    var cstart;
    var cend;

    arr.push('"' + dateRange + '"');
    arr.push('"' + $('#INVXrange').val() + '"');
    arr.push('"' + $('#INVX_date').val() + '"');

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            document.getElementById('INVX_date_span').innerHTML = 'Since: ' + cstart;
        };
    });
}

function getINVXreport() {
    var arr = [];
    var dateRange = $('input[name=INVX_dateRange]:checked').val();
    var table = $("#INVXtable");
    var thdr = document.getElementById("INVX_hdr");
    var cbran = $('#INVX_brand').val();
    var cdesc = $('#INVX_descrip').val();
    var v = document.getElementById("INVX_vendor");
    var cvend = v.options[v.selectedIndex].text;
    var cdort = $('#INVX_depttype').val();
    var t = document.getElementById("INVX_invtype");
    var cdept = t.options[t.selectedIndex].text;
    var s = document.getElementById("INVX_size");
    var csize = s.options[s.selectedIndex].text;
    var dateSpan = document.getElementById('INVX_date_span');
    var cstart;
    var ntimes = 0;
    var exportOptions = {
        columns: ':visible:not(.not-exported)',
        modifier: {
            selected: null
        }
    }

    $("#INVX_submit").prop("disabled", true);

    if (dateRange === '2' && $('#INVX_date').val() == '') {
        swal("Oops...", "Please enter the date for your Specific Date.", "error");
    };

    if (cbran === '') {
        cbran = '< ANY >'
    };

    if (cdesc === '') {
        cdesc = '< ANY >'
    };

    if (cvend === '&#60; ANY &#62;') {
        cvend = '< ANY >'
    };

    if (cdept === '&#60; ANY &#62;') {
        cdept = '< ANY >'
    };

    if (csize === '&#60; ANY &#62;') {
        csize = '< ANY >'
    };

    $.spin('true');

    cdort = cdort.capitalFirstLetter();

    arr.push('"' + $('#INVX_brand').val() + '"');
    arr.push('"' + $('#INVX_descrip').val() + '"');
    arr.push('"' + getVendorSelected('INVX_vendor') + '"');
    arr.push('"' + $('#INVX_depttype').val() + '"');
    arr.push('"' + getInvTypeSelected('INVX_invtype') + '"');
    arr.push('"' + $('#INVX_size').val() + '"');
    arr.push('"' + dateRange + '"');
    arr.push('"' + $('#INVXrange').val() + '"');
    arr.push('"' + $('#INVX_date').val() + '"');
    arr.push('"' + document.getElementById('INVX_zeroQty').checked + '"');

    if (arr[0] === '"< ANY >"') {
        arr[0] = '""'
    };

    if (arr[1] === '"< ANY >"') {
        arr[1] = '""'
    };

    $('.DOH_box1 > *').prop("disabled", true);
    $('.DOH_box2 > *').prop("disabled", true);

    $.post("getDateData(" + arr[6] + "," + arr[7] + "," + arr[8] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
        };
    });

    $("#INVX_col1").text("");
    $("#INVX_col2").text("Barcode");
    $("#INVX_col3").text("Brand");
    $("#INVX_col4").text("Description");
    $("#INVX_col5").text("Size");
    $("#INVX_col6").text("Type");
    $("#INVX_col7").text("QoH");
    $("#INVX_col8").text("Qty Sold");
    $("#INVX_col9").text("Last Sold");
    $("#INVX_col10").text("Last Recv");
    $("#INVX_col11").text("Code Nbr");

    $("#INVX_hdr").toggle(true);
    $("#INVX_submit").prop("value", "Archive");
    $("#INVX_submit").attr("onclick", "archiveItems()");

    INVXtable = $('#INVXtable').DataTable({
        responsive: true,
        dom: 'Bfrtilp',
        buttons: [
            {
                extend:    'copyHtml5',
                text:      svgCopy,
                titleAttr: '  Copy to Clipboard  ',
                exportOptions: exportOptions
            },
            { extend: 'excel',
              text: svgExcel,
              titleAttr: '  Excel File  ',
              filename: 'Inactive Items ' + todayString(),
              exportOptions: exportOptions
            },
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                exportOptions: exportOptions,
                message: '__MESSAGE__',
                orientation: 'landscape',
                title: 'Inactive Items ' + todayString(),
                header: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'Brand: ' + cbran + '\n' +
                                'Description: ' + cdesc + '\n' +
                                'Size: ' + csize + '\n' +
                                'Vendor: ' + cvend + '\n' +
                                cdort + ': ' + cdept + '\n' +
                                'No Activity Since: ' + cstart + '\n' +
                                'Report run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                exportOptions: exportOptions,
                orientation: 'landscape',
                title: 'Inactive Items ' + todayString(),
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(n+7):nth-child(-n+8) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'Brand: ' + cbran + '<br>' +
                        'Descrip: ' + cdesc + '<br>' +
                        'Size: ' + csize + '<br>' +
                        'Vendor: ' + cvend + '<br>' +
                        cdort + ': ' + cdept + '<br>' +
                        'No Activity Since: ' + cstart + '</p>');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                text: svgDelete,
                titleAttr: '  Do Not Archive ✓ Items  ',
                action: function () {
                    aCNs = $.map(INVXtable.rows({ selected: true }).data(), function (item) {
                        return item[1]
                    });
                    if (aCNs.length < 1) {
                        swal("Nothing To Do", "No items have been selected.", "error");
                        return;
                    };
                    swal({
                        title: "Are you sure?",
                        text: "Remove the " + aCNs.length + " selected items from the set you are archiving?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#f695ab",
                        confirmButtonText: "Yes, proceed!",
                        closeOnConfirm: true
                    },
                        function (isConfirm) {
                            if (isConfirm) {
                                INVXtable.rows({ selected: true }).remove().draw();
                                return;
                            } else {
                                return;
                            }
                        }
                    );
                }
            }
        ],

        ajax: "InactiveItems(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + "," + arr[4] + "," + arr[5] + "," + arr[6] + "," + arr[7] + "," + arr[8] + "," + arr[9] + ")",
        "columns": [
            { "width": "5%" },
            { "width": "7.5%" },
            { "width": "20%" },
            { "width": "20%" },
            { "width": "7.5%" },
            { "width": "15%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "7.5%" },
            { "width": "7.5%" },
            { "width": "0%" }
        ],

        columnDefs: [
            { "type": "num", "targets": [6, 7] },
            { targets: 0, orderable: false, className: 'select-checkbox' },
        ],

        select: {
            style: 'os',
            selector: 'td:first-child'
        },

        order: [[2, 'asc']],

        "fnDrawCallback": function () {
            $("#INVX_waitp").toggle(false);
            $("#INVXtablewrapper").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            } else if (ntimes === 1) {
                $("#INVX_submit").prop("disabled", false);
            };
            ntimes++;
        },
        initComplete: function () {
            $.spin('false');
        }
    });

}

function archiveItems() {
    var table = $("#INVXtable");
    var ntimes = 0;
    var aCNs;
    var cCNs;
    var oData;

    $("#INVX_submit").prop("disabled", true);

    swal({
        title: "Are you sure?",
        text: "Archive the items in the table?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f695ab",
        confirmButtonText: "Yes, proceed!",
        closeOnConfirm: false,
        closeOnCancel: false,
        showLoaderOnConfirm: true
    },
        function (isConfirm) {
            if (isConfirm) {
                aCNs = $.map(INVXtable.rows().data(), function (item) {
                    return item[10]
                });
                cCNs = JSON.stringify(aCNs);

                oData = { "aCodes": cCNs };

                $.post("archiveItems?", oData, function (data, status) {

                    INVXtable.clear().destroy(false);
                    $('#INVX_hdr').toggle(false);

                    swal("Processed!", data[0].toString() + " items have been archived.", "success");
                    $("#INVX_cancel").val("All Done");
                    $("#INVX_submit").prop("disabled", false);
                    $("#INVX_submit").toggle(false);
                })
                    .fail(function (xhr, ajaxOptions, thrownError) {
                        swal("Oops...", "error: " + thrownError, "error");
                    });
            } else {
                swal("Cancelled", "No items have been archived.", "error");
                $("#INVX_submit").prop("disabled", false);
                return;
            };
        }
    );
}

function showINVrestore() {
    var intro = $("#INV_restore_intro")
    var d = new Date();
    var ntimes = 0;
    var cNewBarc = "";

    $("#INV_restore_col1").text("");
    $("#INV_restore_col2").text("ItemCode");
    $("#INV_restore_col3").text("Barcode");
    $("#INV_restore_col4").text("Brand");
    $("#INV_restore_col5").text("Description");
    $("#INV_restore_col6").text("Size");
    $("#INV_restore_col7").text("Type");
    $("#INV_restore_col8").text("Vendor");
    $("#INV_restore_col9").text("Archived");

    INV_restoreTable = $('#INV_restoretable').DataTable({
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
                filename: 'Archived Inventory ' + todayString()
            },                    
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'landscape',
                title: 'Archived Inventory ' + todayString()
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                customize: function (window) {
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        ajax: "INV_ArchiveTable()",
        columns: [
            {   data: null,
                defaultContent: '',
                orderable: false,
                selectable: false,
                width: "2%"
            },
            {
                data: null,
                defaultContent: '',
                className: 'select-checkbox',
                orderable: false,
                width: "5%"
            },
            { data: "code_num", width: "10%" },
            { data: "barcode", width: "10%" },
            { data: "brand", width: "15%" },
            { data: "descrip", width: "13%" },
            { data: "size", width: "7%" },
            { data: "type", width: "15%" },
            { data: "vendor", width: "15%" },
            { data: "archDate", width: "8%" }
        ],
        columnDefs: [
            { targets: 1, orderable: false, className: 'select-checkbox' }
        ],
        select: {
            style: 'single',
            selector: 'td:nth-child(2)',
            blurable: true
        },
        order: [[4, 'asc']],
        "fnDrawCallback": function () {
            var api = this.api();
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            $('td').each(function () {
                if ($(this).index() == 3 && aDupeBarc.indexOf(api.cell(this).data()) > -1) {
                    $(this).css('color', 'red');
                } else if ($(this).index() == 3) {
                    $(this).css('color', '');
                }
            });
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        }
    });

    $("nav").css('z-index', -1);
    if (doDash) {
        $("#tab_dash").toggle(true);
    }
    $("#Modal_INV_Restore").toggle(true);

    // Activate the inline editor on click of a table cell
    //$('#INV_restoretable').on('click', 'tbody tr td', function (e) {
        
    INV_restoreTable.on('click', 'tr td', function (e) {
        if ($(this).index()===1) {
            return;
        } else if ( $(this).index() == 3 && ( $(this).css('color') === 'rgb(255, 0, 0)'  || ! $(this).val() ) ) {
            itemRestoreEditor.inline(this, {
                submit: 'all'
            });
        } else {
            $(this).blur();
        }
    });

    INV_restoreTable.on('select', function (e, dt, type, indexes) {
        var rowData = INV_restoreTable.rows(indexes).data()//.toArray();
        swal({
            title: "Restore:\n" + rowData[0].brand + '\n' + rowData[0].descrip + '\n' + rowData[0].size + " ?",
            text: 'The item will be restored to the active inventory file.',
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
        },
            function () {
                $.post("restoreItem('" + rowData[0].code_num + "', '" + rowData[0].barcode + "')", "", function (data, status, xhr) {
                    if (data.result === 'success') {
                        INV_restoreTable.rows(indexes).remove().draw();
                        swal("Item # " + rowData[0].code_num + " restored.");

                    } else if (data.result === 'duplicate') {
                        aDupeBarc.push(rowData[0].barcode);
                        INV_restoreTable.draw();
                        swal("Barcode exists!", "Please edit barcode field.", "error");

                    } else if (data.result === 'empty') {
                        swal("No barcode for this item!", "Please edit barcode field.", "error");

                    } else {
                        swal("Item not restored. Response: " + data.message);
                    }
                })
                    .fail(function (xhr, ajaxOptions, thrownError) {
                        swal("error: " + thrownError);
                    });
            });
    });
}

// End Inventory Archive

// BEGIN Promo utility
function showPromoList() {
    var dateRange = $('input[name=Promo_dateRange]:checked').val();
    var deltaS = localStorage.getItem("promoStartDelta");
    var deltaE = localStorage.getItem("promoEndDelta");

    $("#Promo_criteria").toggle(true);
    $("#Promo_lists").toggle(true);

    $("#Promo_hdr").toggle(false);
    $("#PromoTableWrapper").toggle(false);

    $("#promoStageTip").toggle(true);
    $("#Promo_StageIt").toggle(true);
    $("#promoSubmitTip").toggle(true);
    $("#Promo_submit").toggle(true);

    $("#Promo_newset").toggle(false);
    $("#Promo_dates").toggle(false);

    $("#promoSavePromo").prop("checked", false);
    $("#promoListName").val("");
    $("#promoSaveBttn").prop("disabled", true);

    $('#Promo_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true,
        min: new Date()
    });

    if (deltaS !== "undefined" && $('#Promo_startDate').val() === "") {
        var today = new Date();
        var dStart = new Date(today.getTime() + deltaS * 86400000);
        var dEnd = new Date(dStart.getTime() + deltaE * 86400000);
        var cStart = dateWithDashes(dStart);
        var cEnd = dateWithDashes(dEnd);

        $('#Promo_startDate').val(cStart);
        $('#Promo_endDate').val(cEnd);

    };

    // exclude: \ / : * ? " < > | .
    $('#promoListName').keypress(function (e) {
        if (e.which == 47 || e.which == 92 || e.which == 58 || e.which == 42 || e.which == 63 ||
            e.which == 34 || e.which == 60 || e.which == 62 || e.which == 124 || e.which == 46) {
            return false;
        } else if (e.which == 13) {
            promoSaveList();
        }
    });

    $("#Promo_criteria").find('*').prop("disabled", false);
    $("#Promo_dates").find('*').prop("disabled", true);

    getInvDepts('PromoInvType');
    getSizes('Promo_size');

    promoRetrieveSettings();

}

function promoRetrieveSettings() {
    $.post("promoGetSettings?", "", function (data) {
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $(data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
            }
        });

        if (data.staged) {
            $('#Promo_stagedList').prop("disabled", false);
        } else {
            $('#Promo_stagedList').prop("disabled", true);
        }

        if (!data.tooltips) {
            $('#promoSubmitTip').removeAttr('data-tip');
            $('#promoStageTip').removeAttr('data-tip-b');
        }

        if (data.aFiles.length > 0) {
            var select = document.getElementById("promoSavedList");
            $('#promoSavedList')
                .find('option')
                .remove()
                .end();

            for (var i = 0; i < data.aFiles.length; i++) {
                var el = document.createElement("option");
                el.textContent = data.aFiles[i][1];
                el.value = data.aFiles[i][0];
                select.appendChild(el);
            };

            var numOccurences = $.grep(data.aFiles, function (v, i) {
                return v[1].substring(0, 4) === 'WIP:';
            }).length;
            if (numOccurences === 1) {
                $('#promoAlertText').text("You have an unfinished list!")
                $('#promoAlertImg').css("visibility", "visible");
                $('#promoAlertText').css("visibility", "visible");
            } else if (numOccurences > 1) {
                $('#promoAlertText').text("You have unfinished lists!")
                $('#promoAlertImg').css("visibility", "visible");
                $('#promoAlertText').css("visibility", "visible");
            }

            $("#promoSavedList").prop("disabled", false);
            $("#Promo_useList").prop("disabled", false);
            $("#Promo_deleteList").prop("disabled", false);
        } else {
            $("#promoSavedList").prop("disabled", true);
            $("#Promo_useList").prop("disabled", true);
            $("#Promo_deleteList").prop("disabled", true);
            $('#promoAlertImg').css("visibility", "hidden");
            $('#promoAlertText').css("visibility", "hidden");
        };

        $("nav").css('z-index', -1);
        $("#Modal_Promo").toggle(true);
        $("#tab_util").toggle(false);

        $(document).keypress(function (e) {
            if (e.which == 27) {
                closePromo();
            }
        });

    });
}

function promoStagedList() {
    var ntimes = 0;

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            closePromoListModal();
        }
    });

    stagedTable = $('#promoListTable').DataTable({
        responsive: true,
        dom: 'Bfrtilp',
        lengthChange: true,
        lengthMenu: [10, 20, 30, 50, 100],
        pageLength: 30,
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
                filename: 'Promo Utility ' + todayString()
            },                    
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'landscape',
                title: 'Promo Utility',
                header: true,
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Promo Utility ' + todayString(),
                footer: true,
                customize: function (window) {
                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                text: svgStop,
                titleAttr: "  Stop Promo ",
                action: function () {
                    promoStopStaged();
                }
            }
        ],
        ajax: {
            url: "promoStagedList?",
            data: '',
            type: "POST"
        },
        columns: [
            { data: null, defaultContent: '', className: 'select-checkbox', orderable: false },
            { data: "file" },
            { data: "dStart" },
            { data: "dEnd" },
            { data: "happy" },
            { data: "startTime" },
            { data: "endTime" },
            { data: "days" },
            { data: "creator" },
            { data: "dCreated" }
        ],
        columnDefs: [
            { width: '40px', targets: [0] },
            { type: 'string', targets: [1, 4, 5, 6, 7, 8] }
        ],
        select: {
            style: 'os',
            selector: 'td:first-child',
            blurable: false
        },
        order: [[1, 'asc']],
        "fnDrawCallback": function () {
            $("#promoListTableWrapper").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        }
    });

    stagedTable.button(4).disable();

    stagedTable.on('click', 'tbody tr td', function (e, dt, type, indexes) {
        var prTable = $('#promoListTable').DataTable();
        if ($(this).index() == 0) {
            prTable.button(4).enable(
                prTable.rows({ selected: true }).indexes().length === 0 ?
                    true : false
            );
        }
    });

    $("#Modal_promoList").show();

}

function promoStopStaged() {
    var table = $("#promoListTable").DataTable();
    var nrows = table.rows('.selected').data().length;
    var cTitle;
    var cText;

    if (nrows > 1) {
        cTitle = "Stop them?";
        cText = "Stop the selected promotions?"
    } else {
        cTitle = "Stop?";
        cText = "Stop the selected promotion?"
    }

    swal({
        title: cTitle,
        text: cText,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, stop!",
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (isConfirm) {
            if (isConfirm) {
                var table = $("#promoListTable").DataTable();
                table.button(4).disable();
                var data = table.rows({ selected: true }).data();
                var nrows = data.length;
                var aData = [];
                for (i = 0; i < nrows; i++) {
                    aData.push([data[i].file]);
                };
                var json = JSON.stringify(aData);
                $.post("promoStagedDelete?", json, function () {
                    var table = $("#promoListTable").DataTable();
                    var rows = table
                        .rows('.selected')
                        .remove()
                        .draw();
                    swal("Stopped!", "The selected promos have been stopped\nand removed from the list.", "success");
                });
            }
        });
}

function closePromoListModal() {
    var table = $("#promoListTable").DataTable();

    table.clear().destroy(false);
    $("#Modal_promoList").hide();
}

function promoStageIt() {
    var table = $("#PromoTable").DataTable();
    var cFile = table.row(0).data().file;
    var cStart = $('#Promo_startDate').val();
    var cEnd = $('#Promo_endDate').val();
    var cHappy = $("#promoHappyHour").is(':checked');
    var cSTime = $( "#promoStartTime" ).val();
    var cETime = $( "#promoEndTime" ).val();
    var aDays = [];
    var cAllBarcs = $("#promoApplyToAll").is(':checked');
    var dStart = stringToDate(cStart, "mm-dd-yyyy", "-");
    var dToday = new Date();
    dToday.setHours(0, 0, 0, 0);

    if (!cFile.trim() || $('#PromoDivTitle').text() === 'Promo Utility') {
        swal('Missing Info!', 'You must first name and save this list.', 'error');
        return;
    } else if (!cHappy && dStart.valueOf() === dToday.valueOf()) {
        swal('Improper Date!', 'To stage a promo, the start date must be after today.\nUse "Create Promo" to launch a promo today.', 'error');
        return;
    }

    $('#promoDayDiv input:checked').each(function() {
        aDays.push($(this).attr('value'));
    });

    $.post('promoStageFile?',
        { cFile: cFile, dStart: cStart, dEnd: cEnd, cHappy: cHappy, cSTime: cSTime, cETime: cETime, aDays: JSON.stringify(aDays), cAllBarcs: cAllBarcs },
        function (data) {
            swal('Staged!', 'Your promo list is staged to begin on ' + cStart + '.', 'success');
            $('#Promo_StageIt').toggle(false);
            $('#Promo_submit').toggle(false);
            $('#Promo_newset').toggle(true);
            $('#Promo_close').val('Done');
            $('#PromoDivTitle').append('<span style="font-size: 14px;"><br>Staged for ' +
                $('#Promo_startDate').val() + ' thru ' + $('#Promo_endDate').val() + '</span>');
        })
        .fail(function (xHDR, status) {
            swal("Error!", "An error has been encountered and\nthe list was not staged...\n" + status, "error");
        });
}

function closePromo() {
    var wait = $('#Promo_waitp');
    var isVisible = wait.is(':visible');
    var cText = "Do you wish to save this \nlist in progress for later use?"
    var cSave = $("#promoListName").val();
    var cFile;

    if (!isVisible) {
        var table = $("#PromoTable").DataTable();
        if (table.data().any()) {
            if ($("#Promo_close").val() === 'Done') {
                cFile = table.row(0).data()[16];
                $.post("promoDeleteTempFile?", { cFile: cFile });
            } else {
                cFile = table.row(0).data().file;
            }

            if ($('#PromoDivTitle').text() === 'Promo Utility' && $("#Promo_close").val() !== 'Done') {
                swal({
                    title: "Save this list?",
                    text: cText,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, save it!",
                    cancelButtonText: "No, delete list!",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            swal("Saved!", "Your list has been saved.", "success");
                        } else {
                            $.post("promoDeleteTempFile?", { cFile: cFile });
                            swal("Deleted!", "Your list has been deleted.", "success");
                        }
                    });
            }
        }

        PromoTable.clear().destroy(false);
        $('#Promo_waitp').toggle(true);
        $("#Promo_hdr").toggle(false);
        $("#PromoDivTitle").text("Promo Utility");
        $("#PromoDivTitle").toggle(false);
        $("#PromoTableWrapper").toggle(false);
        $("#Promo_close").prop("value", "Cancel");

        $("nav").css('z-index', 999);
        $("#Modal_Promo").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
        }

    } else {
        $("nav").css('z-index', 999);
        $("#Modal_Promo").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
        }
    };

    $("#Promo_criteria").find('*').prop("disabled", false);
    $("#Promo_dates").find('*').prop("disabled", true);

    $('#PromoInvType')
        .find('option')
        .remove()
        .end()
        .append('<option value="">&#60; ANY &#62;</option>');

    $(document).keypress(function (e) {
        return true;
    });

}

function promoDeleteList() {
    var cFile = $('#promoSavedList option:selected').text();
    var cDBF = $('#promoSavedList option:selected').val();
    swal({
        title: "Delete this list?",
        text: "Do you wish to delete this list:\n" + cFile + " ?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, save it!",
        closeOnConfirm: false,
        closeOnCancel: false
    },
        function (isConfirm) {
            if (isConfirm) {
                $.post("promoDeleteTempFile?", { cFile: cDBF }, function () {
                    $('#promoSavedList')
                        .find('option:selected')
                        .remove();
                    if ($('#promoSavedList option').length === 0) {
                        $('#promoSavedList').append('<option value="">None Available</option>');
                        $('#promoAlertImg').css("visibility", "hidden");
                        $('#promoAlertText').css("visibility", "hidden");
                        $("#promoSavedList").prop("disabled", true);
                        $("#Promo_useList").prop("disabled", true);
                        $("#Promo_deleteList").prop("disabled", true);
                    }

                    var arr = $('#promoSavedList option');
                    var numOccurences = $.grep(arr, function (v, i) {
                        return v.text.substring(0, 4) === 'WIP:';
                    }).length;
                    if (numOccurences === 1) {
                        $('#promoAlertText').text("You have an unfinished list!")
                        $('#promoAlertImg').css("visibility", "visible");
                        $('#promoAlertText').css("visibility", "visible");
                    } else if (numOccurences > 1) {
                        $('#promoAlertText').text("You have unfinished lists!")
                        $('#promoAlertImg').css("visibility", "visible");
                        $('#promoAlertText').css("visibility", "visible");
                    } else {
                        $('#promoAlertImg').css("visibility", "hidden");
                        $('#promoAlertText').css("visibility", "hidden");
                    }
                    swal("Deleted!", "Your list has been deleted.", "success");
                });
            } else {
                swal("Saved!", "Your list has been saved.", "success");
            }
        });
}

function promoSaveList() {
    var cFile;
    var cSave = $("#promoListName").val().trim();
    var cBtn = $("#Promo_close").val();

    // do validation 
    if (cSave.length === 0) {
        swal("Error", "Please enter a name for your list.", "error");
        return;
    }

    $("#PromoTableWrapper").spin("modal");

    cFile = PromoTable.row(0).data().file;

    if (typeof cFile === 'undefined') {
        swal("Error", "Unable to determine temp file name.", "error");
        return;
    }

    $.post("promoSaveListFile?", { cFile: cFile, cSave: cSave }, function (data) {
        var table = $("#PromoTable").DataTable();

        if (cBtn != 'Done') {
            var nRows = PromoTable.rows('*').count();
            for (i = 0; i < nRows; i++) {
                PromoTable.row(i).data().file = "saved\\" + cSave;
            }
            PromoTable.draw();
        }

        $("#PromoTableWrapper").spin("modal");

        swal("Promo List Saved!", "Your list has been saved.", "success");

        $("#promoSavePromo").prop("disabled", true);
        $("#promoListName").prop("disabled", true);
        $("#promoSaveBttn").prop("disabled", true);
        $('#PromoDivTitle').html(cSave);

    })
        .fail(function (xHDR, status) {
            $("#PromoTableWrapper").spin("modal");

            if (xHDR.status === 403) {
                swal("Duplicate List Name!", "This list name is already in use.\nPlease enter another.", "error");
            } else {
                swal("Error!", "An error has been encountered and\nwas not saved...\nError code: " + xHDR.status, "error");
            }
        });
}

function resetPromoList() {
    var rows = PromoTable.rows('*').count();
    var cSaved = $('#promoSavedList option:selected').text();
    var cDBF = $('#promoSavedList option:selected').val();
    var cFile;

    if (rows > 0) {
        cFile = PromoTable.row(0).data().file;
        if (typeof cFile === 'undefined') {
            cFile = PromoTable.row(0).data()[16];
        }
        if (typeof cFile === 'undefined') {
            cFile = "";
        }
    } else {
        cFile = "";
    }

    if (cFile === cDBF && cSaved.substring(0, 5) === 'saved') {
        cFile = "";
    }

    // if saved already, cFile will be empty and server will disregard...
    if (cFile.substring(0, 5) !== 'saved') {
        $.post("promoDeleteTempFile?", { cFile: cFile });
    }

    PromoTable.clear().destroy(false);

    $('#Promo_waitp').toggle(true);
    $("#Promo_hdr").toggle(false);
    $("#PromoDivTitle").text("Promo Utility");
    $("#PromoDivTitle").toggle(false);
    $("#PromoTableWrapper").toggle(false);
    $("#Promo_close").prop("value", "Cancel");

    showPromoList();
}

function Promo_toggleDeptType() {
    var el = document.getElementById('PromoDeptType');
    var cSel = el.options[el.selectedIndex].value;
    $('#PromoInvType')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="       ">&#60; ANY &#62;</option>');
    if (cSel === "dept") {
        getInvDepts('PromoInvType');
    } else {
        getInvTypes('PromoInvType');
    };
    $('#PromoInvType').toggle(true);
}

function getPromoList(lParam) {
    var arr = [];
    var dateRange = $('input[name=Promo_dateRange]:checked').val();
    var table = $("#Promotable");
    var thdr = document.getElementById("Promo_hdr");
    var cnbr = '';
    var cBrand = '';
    var cDescrip = '';
    var cSize = '';
    var cDeptSelect = '';
    var cDept = '';
    var ntimes = 0;
    var aTogCols = [3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14];
    var aHidCols = [15, 16, 17];
    var aPageLen = [10, 20, 30, 50, 100];
    var lSaved = false;

    promoFileChange = false;   // global var

    $('#Promo_StageIt').toggle(false); // prop("disabled",true);
    $('#Promo_submit').toggle(false); // prop("disabled",true);
    $('#Promo_close').toggle(false); // prop("disabled",true);
    $('#promoSaveBttn').toggle(false); // prop("disabled",false);

    $("#Promo_criteria").toggle(false);
    $("#Promo_lists").toggle(false);
    $("#Promo_dates").toggle(true);

    $("label[for='Promo_startDate']").css("color", "");
    $("label[for='Promo_endDate']").css("color", "");
    $("#promoApplyToAllLabel").css("color", "");

    $('.selectPromorange').children().prop("disabled", true);

    cBrand = $('#Promo_brand').val();
    cDescrip = $('#Promo_descrip').val();
    cDeptSelect = $('#PromoDeptType').val();
    cDept = getInvTypeSelected('PromoInvType');
    cSize = $('#Promo_size').val();
    cBin = $('#promoBinFilter').is(':checked');
    cPrice = $('#promoPriceFilter').is(':checked');
    cFile = $('#promoSavedList option:selected').val();
    cGetFile = lParam;
    cTitle = 'Promo Utility';

    if (cGetFile && cFile.substring(0, 5) === 'saved') {
        $("#PromoDivTitle").html(cFile.substring(6, cFile.length - 4));
        cTitle += '_' + cFile.substring(6, cFile.length - 4);
        lSaved = true;
    }

    if (!lSaved) {
        $("#promoSavePromo").toggle(true);
        $("#promoListName").toggle(true);
        $("label[for='promoSavePromo']").toggle(true);
        $("label[for='promoListName']").toggle(true);
    }

    if (!cBin) {
        aTogCols.splice(9, 1);
        aHidCols.splice(0, 0, 12);
    };

    if (!cPrice) {
        var nStart = aTogCols.length - 2;
        aTogCols.splice(nStart, 2);
        if (aHidCols.length === 2) {
            nStart = 0;
        } else {
            nStart = 1;
        }
        aHidCols.splice(nStart, 0, 13, 14);
    }

    $("#Promo_criteria").find('*').prop("disabled", true);
    $("#Promo_dates").find('*').prop("disabled", false);
    $("#promoHappyHour").prop("checked", false);
    $("#promoHappyHourBttn").prop("disabled", true);
    $('#promoListName').prop("disabled", true);
    $('#promoSaveBttn').prop("disabled", true);

    $("#Promo_hdr").toggle(true);

    var nLen = localStorage.getItem("promoListLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $("#PromoTableWrapper").spin("modal");

    var exportOptions = {
        columns: ':visible:not(.not-exported)',
        modifier: {
            selected: null
        }
    }

    PromoTable = $('#PromoTable').DataTable({
        responsive: false,
        scrollX: true,
        dom: 'Bfrtilp',
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
        buttons: [
            {
                extend:    'copyHtml5',
                text:      svgCopy,
                titleAttr: '  Copy to Clipboard  ',
                exportOptions: exportOptions
            },
            {
                extend: 'excel',
                text: svgExcel,
                titleAttr: '  Excel File  ',
                filename: cTitle,
                exportOptions: exportOptions
            },
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                exportOptions: exportOptions,
                message: '__MESSAGE__',
                orientation: 'landscape',
                title: 'Promo Utility',
                header: true,
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                exportOptions: exportOptions,
                orientation: 'landscape',
                title: 'Promo Utility ' + todayString(),
                footer: true,
                customize: function (window) {
                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                extend: 'collection',
                text: svgDelete,
                titleAttr: '  Delete Item(s)  ',
                buttons: [
                    {
                        text: 'Delete Checked', action: function () {
                            $("#PromoTableWrapper").spin("modal");
                            setTimeout(promoDeleteChecked, 100);
                        }
                    },
                    {
                        text: 'Delete Unchecked', action: function () {
                            $("#PromoTableWrapper").spin("modal");
                            setTimeout(promoDeleteUnchecked, 100);
                        }
                    }
                ],
                fade: true,
                autoClose: true
            },
            {
                text: svgAdd,
                titleAttr: "  Add Item  ",
                action: function () {
                    cSelectedBarcode = "";
                    cSelectedItemInfo = "";
                    showItemList();
                    promoWaitForItemSelection();
                }
            },
            {
                extend: 'colvis',
                text: svgColVis,
                titleAttr: '  Toggle Columns  ',
                columns: aTogCols
            }
        ],
        ajax: {
            url: "PromoUtilList?",
            data: {
                cBrand: cBrand,
                cDescrip: cDescrip,
                cSize: cSize,
                cDeptSelect: cDeptSelect,
                cDept: cDept,
                cBin: cBin,
                cPrice: cPrice,
                cFile: cFile,
                cGetFile: cGetFile
            },
            type: "POST"
        },
        columns: [
            { data: null, defaultContent: '', className: 'select-checkbox', orderable: false },
            { data: "barcode" },
            { data: "brand" },
            { data: "descrip" },
            { data: "size" },
            { data: "type" },
            { data: "price" },
            { data: "cost" },
            { data: "qoh" },
            { data: "GMdols" },
            { data: "GMperc" },
            { data: "p_price" },
            { data: "bin" },
            { data: "price_i" },
            { data: "price_j" },
            { data: "notes" },
            { data: "code_num" },
            { data: "file" }
        ],
        columnDefs: [
            { width: '40px', targets: [0] },
            { type: 'num-fmt', targets: [6, 7, 8, 9, 10, 12, 13, 14] },
            { className: 'numericCol', targets: [6, 7, 8, 9, 10, 12, 13, 14] },
            { targets: aHidCols, visible: false, searchable: false, orderable: false },
            { targets: [11], className: "boldClickNumericCol" }
        ],
        keys: {
            columns: [11],
            editor: PromoEditor
        },
        select: {
            style: 'os',
            selector: 'td:first-child',
            blurable: false
        },
        order: [[2, 'asc']],
        "fnDrawCallback": function () {
            $("#Promo_waitp").toggle(false);
            $("#PromoTableWrapper").toggle(true);
            $("#PromoDivTitle").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
            $('td').each(function () {
                if (($(this).index() == 9 || $(this).index() == 10) && parseFloat($(this).text().replace(/,/g, '')) < 0) {
                    $(this).css('color', 'red');
                } else {
                    $(this).css('color', '');
                }
            });
        },
        initComplete: function () {
            if (PromoTable.rows('*').count() === 0) {
                $("#PromoTableWrapper").spin("modal");

                swal({
                    title: 'No Data!',
                    text: 'The search found no items.\nTry a new set or cancel?',
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#45c0bd",
                    confirmButtonText: "New Set",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            resetPromoList();
                            return;
                        } else {
                            closePromo();
                            return;
                        }
                    });
            } else {
                $('#Promo_StageIt').toggle(true); // prop("disabled",false);
                $('#Promo_submit').toggle(true); // prop("disabled",false);
                $('#Promo_close').toggle(true); // prop("disabled",false);
                if (!lSaved) {
                    $('#promoSaveBttn').toggle(true); // prop("disabled",false);
                    $('#promoSavePromo').prop('disabled',false);
                } else {
                    $('#promoSavePromo').prop('disabled',true);
                }

                $("#PromoTableWrapper").spin("modal");
            }
        }
    });

    PromoTable.button(4).disable();

    PromoTable.on('click', 'tbody tr td', function (e, dt, type, indexes) {
        var prTable = $('#PromoTable').DataTable();
        if ($(this).index() === 0) {
            $(this).closest('tr').toggleClass('selected');
            prTable.button(4).enable(
                prTable.rows('.selected').count() === 0 ? false : true
            );
        } else if ( $(this).index() === 11 ) {
            PromoEditor.inline(this, { onBlur: false });
        }
    })
    .on('key-blur', function (e, datatable, cell) {
        PromoEditor.close();
    })
    .on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("promoListLength", len);
        }
    });

    $('input[type="text"]', PromoEditor.node()).on('focus', function () {
        this.select();
    });
    
}

function promoWaitForItemSelection() {
    var xId

    if (cSelectedBarcode !== "") {
        clearTimeout(xId);
        if (cSelectedBarcode === 'nada') {
            return;
        };

        swal({
            title: 'Add Item to Promo?',
            text: 'Add the item:\n' + cSelectedItemInfo + '\nto the promotion?',
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#45c0bd",
            confirmButtonText: "Yes, add it!",
            closeOnConfirm: false
        },
            function () {
                $.post("promoAddItem?", { code: cSelectedBarcode, file: PromoTable.row(0).data().file },
                    function (data) {
                        PromoTable.rows.add(data.itemData); // Add new data
                        PromoTable.columns.adjust().draw();  // Redraw the DataTable                            
                        promoFileChange = true;   // global var
                        swal("Success", "The item was added.", "success")
                    })
                    .fail(function () {
                        swal("Error!", "An error was encountered.", "error");
                    });
            });
        return;
    }

    xId = setTimeout(promoWaitForItemSelection, 500);
}

function promoDeleteChecked() {
    var rows = PromoTable
        .rows('.selected')
        .remove()
        .draw();
    PromoTable.button(4).disable();
    var nrows = PromoTable.rows().data().length;
    var aData = [];
    for (i = 0; i < nrows; i++) {
        aData.push([PromoTable.row(i).data().DT_RowId,
        PromoTable.row(i).data().code_num,
        PromoTable.row(i).data().file]);
    };
    var json = JSON.stringify(aData);
    $.post("promoDelete?", json);
    promoFileChange = true;   // global var
    PromoTable.search("").draw()
    $("#PromoTableWrapper").spin("modal");
}

function promoDeleteUnchecked() {
    var rows = PromoTable
        .rows({ selected: false })
        .remove()
        .draw();
    PromoTable.rows('.selected').deselect();
    PromoTable.button(4).disable();
    var nrows = PromoTable.rows().data().length;
    var aData = [];
    for (i = 0; i < nrows; i++) {
        aData.push([PromoTable.row(i).data().DT_RowId,
        PromoTable.row(i).data().code_num,
        PromoTable.row(i).data().file]);
    };
    var json = JSON.stringify(aData);
    $.post("promoDelete?", json);
    promoFileChange = true;   // global var
    PromoTable.search("").draw()
    $("#PromoTableWrapper").spin("modal");
}

function postPromo() {
    var aData = [];
    var cData;
    var table = $("#PromoTable").DataTable();
    var cFile = table.row(0).data().file;
    var lSaved = false;
    var nonZero = table
        .column(10)
        .data()
        .filter(function (value, index) {
            return value > 0 ? true : false;
        });

    if (nonZero.count() === 0) {
        swal("Oops...", "None of your items has a promo price greater than zero!", "error");
        return;
    }

    if ($('#Promo_startDate').val() === '' || $('#Promo_endDate').val() === '') {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
        return;
    };

    if (!!(cFile) && cFile.substring(0, 5) === 'saved') {
        lSaved = true;
    }

    swal({
        title: "Create Promotion",
        text: "Proceed to create promotion?\nThis will set the promo price to start on " + $('#Promo_startDate').val() +
            "\n\nNOTE: Items with zero promo price will be removed from list.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f695ab",
        confirmButtonText: "Yes, proceed!",
        closeOnConfirm: true,
        closeOnCancel: true
    },
        function (isConfirm) {
            if (!isConfirm) {
                return;
            } else {
                var cStart = $('#Promo_startDate').val();
                var cEnd = $('#Promo_endDate').val();
                var today = new Date();
                var d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                var dStart = new Date(cStart);
                var dEnd = new Date(cEnd);
                var deltaS = Date.daysBetween(d, dStart);
                var deltaE = Date.daysBetween(dStart, dEnd);
                var cBin = $('#promoBinFilter').is(':checked');
                var cPrice = $('#promoPriceFilter').is(':checked');
                var lAllBarcs = $("#promoApplyToAll").is(':checked');
                var aTogCols = [3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14];
                var aHidCols = [15, 16, 17];

                $("#PromoTableWrapper").spin("modal");

                $("#promoStageTip").toggle(false);
                $("#Promo_StageIt").toggle(false);
                $("#promoSubmitTip").toggle(false);
                $("#Promo_submit").toggle(false);

                $("#Promo_startDate").prop("disabled", true);
                $("#Promo_endDate").prop("disabled", true);
                $("#promoApplyToAll").prop("disabled", true);
                $("label[for='Promo_startDate']").css("color", "gray");
                $("label[for='Promo_endDate']").css("color", "gray");
                $("#promoApplyToAllLabel").css("color", "gray");

                if (!lSaved) {
                    $("#promoSavePromo").toggle(true);
                    $("#promoListName").toggle(true);
                    $("#promoSaveBttn").toggle(true);
                    $("label[for='promoSavePromo']").toggle(true);
                    $("label[for='promoListName']").toggle(true);

                    $("#promoSavePromo").prop("disabled", false);
                    $("#promoListName").prop("disabled", true);
                    $("#promoSaveBttn").prop("disabled", true);
                }

                if (!cBin) {
                    aTogCols.splice(9, 1);
                    aHidCols.splice(0, 0, 12);
                };

                if (!cPrice) {
                    var nStart = aTogCols.length - 2;
                    aTogCols.splice(nStart, 2);
                    if (aHidCols.length === 2) {
                        nStart = 0;
                    } else {
                        nStart = 1;
                    }
                    aHidCols.splice(nStart, 0, 13, 14);
                }
                aHidCols.splice(0, 0, 0);

                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("promoStartDelta", deltaS);
                    localStorage.setItem("promoEndDelta", deltaE);
                };

                var tableRows = PromoTable.rows('*').data();
                $.each(tableRows, function (key, row) {
                    aData.push([row.barcode, row.code_num, row.p_price, row.file]);
                });

                cData = JSON.stringify(aData);

                $.post("PromoUtilSubmit?", { cStartDate: cStart, cEndDate: cEnd, aData: cData, lAllBarcs: lAllBarcs },
                    function (data, status) {
                        var ntimes = 0;
                        var nLen = localStorage.getItem("promoListLength");
                        if (!nLen) {
                            nLen = 20;
                        };

                        PromoTable.clear().destroy(false);

                        PromoTable = $('#PromoTable').DataTable({
                            responsive: false,
                            scrollX: true,
                            dom: 'Bfrtilp',
                            lengthChange: true,
                            lengthMenu: [10, 20, 30],
                            pageLength: nLen,
                            buttons: [
                                {
                                    extend:    'copyHtml5',
                                    text:      svgCopy,
                                    titleAttr: '  Copy to Clipboard  ',
                                    filename: 'Promo_' + cStart + '-' + cEnd
                                },
                                {
                                    extend: 'excel',
                                    text: svgExcel,
                                    titleAttr: '  Excel File  ',
                                    filename: 'Promo_' + cStart + '-' + cEnd
                                },
                                {
                                    extend: 'pdf',
                                    text:   svgPdf,
                                    titleAttr: '  PDF File  ',
                                    exportOptions: {
                                        columns: ':visible'
                                    },
                                    orientation: 'landscape',
                                    title: 'Promotion ' + cStart + ' to ' + cEnd,
                                    header: true,
                                },
                                {
                                    extend: 'print',
                                    text: svgPrint,
                                    titleAttr: '  Print  ',
                                    exportOptions: {
                                        columns: ':visible'
                                    },
                                    orientation: 'landscape',
                                    title: 'Promotion ' + cStart + ' to ' + cEnd,
                                    footer: true,
                                    customize: function (window) {
                                        $(window.document.body)
                                            .css('font-size', '12px')
                                            .css('font-family', 'verdana, sans-serif');

                                        $(window.document.body).find('table')
                                            .addClass('compact')
                                            .css('font-size', 'inherit');

                                        window.document.close();
                                        window.onafterprint = function(event) {  window.close(); };                        
                                        window.print();                       
                                    }
                                },
                                {
                                    extend: 'colvis',
                                    text: svgColVis,
                                    titleAttr: '  Toggle Columns  ',
                                    columns: aTogCols
                                }
                            ],
                            data: data.data,
                            columnDefs: [
                                { type: 'num-fmt', targets: [1, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
                                { className: 'numericCol', targets: [1, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
                                { targets: aHidCols, visible: false, searchable: false, orderable: false }
                            ],
                            select: {
                                style: 'os',
                                selector: 'td:first-child',
                                blurable: true
                            },
                            order: [[2, 'asc']],
                            "fnDrawCallback": function () {
                                $("#Promo_waitp").toggle(false);
                                $("#PromoTableWrapper").toggle(true);
                                $("#PromoDivTitle").toggle(true);
                                $("#PromoDivTitle").html('Promotion<br><span style="font-size: 14px;">' + cStart + ' to ' + cEnd + "</span>");

                                $('.dataTables_length').css('padding-top', '0.755em');
                                $('.dataTables_length').css('padding-left', '0.755em');

                                $("#Promo_close").prop("value", "Done");
                                $("#Promo_close").toggle(true);
                                $("#Promo_newset").toggle(true);

                                if (ntimes < 1) {
                                    $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                                };
                                ntimes++;
                            },
                            initComplete: function () {
                                $("#PromoTableWrapper").spin("modal");
                            }
                        });

                        $('#PromoTable').on('length.dt', function (e, settings, len) {
                            if (typeof (Storage) !== "undefined") {
                                localStorage.setItem("promoListLength", len);
                            }
                        });

                    });
            };
        });
}

function closeHappyHourSettings( lSave ) {
    //----- not saving so reset everything
    if (!lSave) {
        var start = localStorage.getItem("promoHappyHourStart");
        if (start === "undefined") {
            start = ' 5:00 PM'
        };

        var end = localStorage.getItem("promoHappyHourEnd");
        if (end === "undefined") {
            end = ' 6:00 PM'
        };

        $( "#promoStartTime" ).val( start );
        $( "#promoEndTime" ).val( end );

        var days = localStorage.getItem("promoHappyHourDays");
        if (days !== "undefined") {
            $( "#promoDayDiv" ).find('input[type=checkbox]').each(function(index, item) {
                if ( days.indexOf(item.value) > -1 ) {
                    $(item).prop('checked',true);
                }
            });
        } else {
            $( "#promoDayDiv" ).find('input[type=checkbox]').prop( "checked", false );
        }
            
        $("#promoHappyHour").prop("checked", false);
        $("#promoHappyHourBttn").prop("disabled", true);

    //----- saving, so we save/update local storage for next time
    } else if (typeof (Storage) !== "undefined") {
        var days = [];
        $( "#promoDayDiv" ).find('input[type=checkbox]:checked').each(function(index, item) {
            days.push( item.value );
        });
    
        localStorage.setItem("promoHappyHourDays", days);
        localStorage.setItem("promoHappyHourStart", $('#promoStartTime').val());
        localStorage.setItem("promoHappyHourEnd", $('#promoEndTime').val());
    }

    $('#Modal_promoHappyHour').toggle(false);
}

// END Promo Utility

// BEGIN Item Edit Utility
function showItemEdit() {
    $.post( 'isThereTax3?', '', function(data) {
        if ( data.lTax3 === 'NO' ) {
            $('#ieFieldTax3').toggle(false);
            $("label[for='ieFieldTax3']").toggle(false);
        }
    });
    $.post( 'areThereCustomFields?', '', function(data) {
        if ( data.user1 === 'NO' ) {
            $('#ieFieldUser1').toggle(false);
            $("label[for='ieFieldUser1']").toggle(false);
        } else {
            $('#ieFieldUser1').toggle(true);
            $("label[for='ieFieldUser1']").text(data.user1Text);
            $("label[for='ieFieldUser1']").toggle(true);
        }
        if ( data.user2 === 'NO' ) {
            $('#ieFieldUser2').toggle(false);
            $("label[for='ieFieldUser2']").toggle(false);
        } else {
            $('#ieFieldUser2').toggle(true);
            $("label[for='ieFieldUser2']").text(data.user2Text);
            $("label[for='ieFieldUser2']").toggle(true);
        }
    });
    $('#itemEditTableWrapper').toggle(false);
    $('#itemEdit_select').toggle(true);

    getVendors('itemEdit_vendor');
    getInvDepts('itemEdit_invtype');
    getSizes('itemEdit_size');

    $("nav").css('z-index', -1);
    $('#Modal_itemEdit').toggle(true);
    $("#tab_util").toggle(false);

}

function toggleItemEditDeptType() {
    var el = document.getElementById('itemEdit_depttype');
    var cSel = el.options[el.selectedIndex].value;
    $('#itemEdit_invtype')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="       ">&#60; ANY &#62;</option>');
    if (cSel === "dept") {
        getInvDepts('itemEdit_invtype');
    } else {
        getInvTypes('itemEdit_invtype');
    };
    $('#itemEdit_invtype').toggle(true);
}

function itemEditShowItemList(lNoClear) {
    showItemList('os', lNoClear);
    itemEditWaitForItemSelection('#itemEditListSelected');
}

function itemEditWaitForItemSelection(cEl) {
    var xId;
    var cTxt;

    if (!$('#Modal_itemList').is(':visible')) {
        clearTimeout(xId);
        if (aSelectedItemCodes.length > 0) {
            if (aSelectedItemCodes[0] === 'nada') {
                aSelectedItemCodes = [];
            }
            if (aSelectedItemCodes.length === 0) {
                $('#itemEditGetList').prop('checked', false);
                itemEditToggleSelects();
            } else if (cEl) {
                cTxt = aSelectedItemCodes.length.toString() + ' items selected &nbsp; <input type="button" value="Revise" class="pAbuttonGrn" onclick="itemEditShowItemList(true);"</input>'
                $(cEl).html(cTxt);
            }
        }
        return;
    }

    xId = setTimeout(itemEditWaitForItemSelection, 250, cEl);
}

function itemEditToggleSelects() {
    var lChk = $('#itemEditGetList').prop('checked');

    $('#itemEdit_select').find('.selectDOHrange').find('input,select').each(function () { $(this).prop('disabled', lChk) });

    if ($('#itemEditGetList').is(':checked')) {
        itemEditShowItemList();
    } else {
        $('#itemEditListSelected').text('');
        aSelectedItemCodes = [];
        if ($.fn.DataTable.isDataTable('#itemListTable')) {
            itemListDataTable.rows().deselect();
        }
    }
}

function getItemEditTable() {
    var aFields = [];
    $('#itemEditFieldSpan').find('input[type="checkbox"]').each(function () {
        if ($(this).is(':checked')) {
            aFields.push($(this).attr('id'));
        }
    })

    if (aFields.length === 0) {
        swal("No fields selected!", "Please select the fields you would like to edit", "error");
        return;
    }

    var aColumns = [{ data: "rowNbr" }, { data: "DT_RowId" }, { data: "code_num" }, { data: "item" }];
    var aColDefs = [1, 2, 3];
    $.each(aFields, function (idx, val) {
        aColumns.push({ data: aFields[idx] });
        aColDefs.push(idx + 4);
    });

    $('#itemEdit_select').toggle(false);

    $.spin('true');

    var cBrand = $('#itemEdit_brand').val();
    var cDescrip = $('#itemEdit_descrip').val();
    var cDeptSelect = $('#itemEdit_depttype').val();
    var cDept = getInvTypeSelected('itemEdit_invtype');
    var cSize = $('#itemEdit_size').val();
    var cVend = getVendorSelected('itemEdit_vendor')
    var lPS = $('#itemEditGetList').is(':checked');

    $.post("getItemEditTable?",
        {
            aItemCodes: JSON.stringify(aSelectedItemCodes),
            aFields: JSON.stringify(aFields),
            cBrand: cBrand,
            cDescrip: cDescrip,
            cDeptSelect: cDeptSelect,
            cDept: cDept,
            cSize: cSize,
            cVend: cVend,
            lPS: lPS
        },
        function (data, status) {
            var aPageLen = [10, 20, 30, 50, 100];
            var nLen = localStorage.getItem("itemEditListLength");
            if (!nLen) {
                nLen = 20;
            } else if ($.type(nLen) === 'string') {
                nLen = parseInt(nLen);
            };
            for (i = 0; i < aPageLen.length; i++) {
                if (aPageLen[i] >= nLen) {
                    nLen = aPageLen[i];
                    break;
                }
            };

            $.each(data.aTitles, function (idx, val) {
                $('#itemEditHdr tr').append('<th id="itemEdit_hdr' + (idx + 4).toString() + '">' + val + '</th>')
            });

            for (var i = 0; i < data.aColumns.length; i++) {
                if (data.aColumns[i].data === 'ieFieldPool') {
                    data.aColumns[i] = { data: 'ieFieldPool', render: function (x, type, row) { return data.aPools[getIndexOf2D(data.aPools, x)][1] } };
                }
                if (data.aColumns[i].data === 'ieFieldType') {
                    data.aColumns[i] = { data: 'ieFieldType', render: function (x, type, row) { return data.aTypes[getIndexOf2D(data.aTypes, x)][1] } };
                }
                if (data.aColumns[i].data === 'ieFieldVendor') {
                    data.aColumns[i] = { data: 'ieFieldVendor', render: function (x, type, row) { return data.aVendors[getIndexOf2D(data.aVendors, x)][1] } };
                }
                if (data.aColumns[i].data === 'ieFieldUser1') {
                    data.aColumns[i] = { data: 'ieFieldUser1', render: function (x, type, row) { return data.aUser1[getIndexOf2D(data.aUser1, x)][1] } };
                }
                if (data.aColumns[i].data === 'ieFieldUser2') {
                    data.aColumns[i] = { data: 'ieFieldUser2', render: function (x, type, row) { return data.aUser2[getIndexOf2D(data.aUser2, x)][1] } };
                }
                if (data.aColumns[i].data === 'ieFieldPrice') {
                    data.aColumns[i] = { data: 'ieFieldPrice', class: 'numericCol', render: $.fn.dataTable.render.number('', '.', 2) };
                }
                if (data.aColumns[i].data === 'ieFieldMinPrice') {
                    data.aColumns[i] = { data: 'ieFieldMinPrice', class: 'numericCol', render: $.fn.dataTable.render.number('', '.', 2) };
                }
                if (data.aColumns[i].data === 'ieFieldCasePrice') {
                    data.aColumns[i] = { data: 'ieFieldCasePrice', class: 'numericCol', render: $.fn.dataTable.render.number('', '.', 2) };
                }
                if (data.aColumns[i].data === 'ieFieldFlatTax') {
                    data.aColumns[i] = { data: 'ieFieldFlatTax', class: 'numericCol', render: $.fn.dataTable.render.number('', '.', 2) };
                }
                if (data.aColumns[i].data === 'ieFieldDepositAmt') {
                    data.aColumns[i] = { data: 'ieFieldDepositAmt', class: 'numericCol', render: $.fn.dataTable.render.number('', '.', 2) };
                }
                if (data.aColumns[i].data === 'ieFieldOrderLot') {
                    data.aColumns[i] = { data: 'ieFieldOrderLot', render: function (x, type, row) { return x === 'C' ? "Case" : "Unit"; } };
                }
            };

            render: $.fn.dataTable.render.number(',', '.', 2)

            itemEditor = new $.fn.dataTable.Editor({
                ajax: "itemEditor?",
                table: "#itemEditTable",
                formOptions: {
                    inline: {
                        submit: 'allIfChanged',
                        onblur: false
                    }
                },
                fields: [
                    { name: "DT_RowId", type: "hidden" },
                    { name: "code_num", type: "hidden" },
                    { name: "item", type: "hidden" }
                ]
            });

            itemEditTable = $('#itemEditTable').DataTable({
                data: data.aItems,
                columns: data.aColumns,
                columnDefs: [
                    { targets: [0, 1, 2], visible: false },
                    { targets: 3, width: "30%" },
                    { targets: aColDefs, orderable: false }
                ],
                lengthMenu: [10, 20, 30, 50, 100],
                pageLength: nLen,
                order: [0, 'asc'],
                select: { style: 'single' },
                dom: 'iBrtlp',
                buttons: [
                    {
                        text: svgRepeat,
                        titleAttr: '  Repeat Last  ',
                        action: function (e, dt, node, config) {
                            itemEditRepeatLast({
                                aItemCodes: JSON.stringify(aSelectedItemCodes),
                                aFields: JSON.stringify(aFields),
                                cBrand: cBrand,
                                cDescrip: cDescrip,
                                cDeptSelect: cDeptSelect,
                                cDept: cDept,
                                cSize: cSize,
                                cVend: cVend,
                                lPS: lPS
                            });
                        }
                    },
                    {
                        text: svgUndo,
                        titleAttr:'  Undo Last  ',
                        action: function (e, dt, node, config) {
                            itemEditUndoLast(aFields);
                        }
                    }
                ],
                keys: {
                    keys: [9, 13, 37, 38, 39, 40],
                    columns: ':not(:first-child)',
                    editor: itemEditor,
                    editAutoSelect: true,
                    editOnFocus: false
                },
                select: false,
                "fnDrawCallback": function () {
                    var cTxt = $('#itemEditTable_info').text();
                    cTxt = cTxt.substring(cTxt.indexOf(' of ') + 4);
                    $('#itemEditTable_info').text(cTxt);
                    $("#itemEditTableWrapper").toggle(true);
                }
            });

            itemEditTable.button(0).disable();
            itemEditTable.button(1).disable();

            itemEditTable
                .on('click', 'tbody tr td', function (e, dt, type, indexes) {
                    if ($(this).index() > 0) {
                        itemEditor.inline(this, { onBlur: false });
                    }
                })
                .on('key-blur', function (e, datatable, cell) {
                    itemEditor.close();
                })
                .on('length.dt', function (e, settings, len) {
                    if (typeof (Storage) !== "undefined") {
                        localStorage.setItem("itemEditListLength", len);
                    }
                })
                .on('key-focus', function (e, datatable, cell, originalEvent) {
                    focusedColIdx = cell.index().column;
                    focusedRowIdx = cell.index().row;
                    var cellDataField = itemEditTable.column(focusedColIdx).dataSrc();
                    if (cellDataField == "ieFieldPool" || cellDataField == "ieFieldType" || cellDataField == "ieFieldVendor") {
                        HandleDropdownFocus('itemEditTable', itemEditTable, cell, itemEditor);
                    } else if (cell.index().columnVisible > 0) {
                        $('#itemEditTable').off('keydown');
                        itemEditor.inline({ row: focusedRowIdx, column: focusedColIdx }, { onBlur: false });
                    };
                });

            $.each(data.aEditFields, function (idx, val) {
                itemEditor.add(data.aEditFields[idx])
            });

            $('input[type="text"]', itemEditor.node()).on('focus', function () {
                this.select();
            });

            itemEditor.on('submitSuccess', function (e, json, data, action) {
                aLastItemEditChanges = json.aChanges;
                itemEditTable.button(0).enable();
                itemEditTable.button(1).enable();
            });

            itemEditTable.cell("#row_1 td:eq(1)").focus();

        })
        .always(function () {
            $.spin('false');
        });
}

function itemEditRepeatLast(oSelection) {
    var lDisable = $('input:radio[name=ieRepeat]:checked').val() === 'all';

    var cellindex = $('#itemEditTable td.focus').index()
    var tr = $('#itemEditTable td.focus').closest("tr");
    var rowindex = tr.index() + 1;
    var rowId = tr.attr('id');
    rowId = parseInt(rowId.substring(4));
    var pageLen = itemEditTable.page.len();

    itemEditTable.button(1).disable();

    $('#ieRowText').css('border', '')
    $('#ieRowText').prop('disabled', lDisable);
    $('#Modal_repeatItemEdit').toggle(true);

    $('#ieCancelEditButton').off("click");
    $('#ieGoEditButton').off("click");

    $('#ieCancelEditButton').click(function () {
        $('#Modal_repeatItemEdit').toggle(false);
        itemEditTable.cell("#row_" + rowId + " td:eq(" + cellindex + ")").focus();
    });

    $('#ieGoEditButton').click(function () {
        if ($('input:radio[name=ieRepeat]:checked').val() === 'rows' && !$('#ieRowText').val()) {
            $('#ieRowText').css('border', '2px solid red')
            $('#ieRowText').focus()
            return;
        }

        $.spin('true');

        $.post('itemEditRepeatLast?',
            {
                oSelection: JSON.stringify(oSelection),
                aLast: JSON.stringify(aLastItemEditChanges),
                cRepeat: $('input:radio[name=ieRepeat]:checked').val(),
                nRows: $('#ieRowText').val(),
                nCurrRow: rowId,
                pageLen: pageLen
            },
            function (newData, status) {
                itemEditTable.clear().rows.add(newData.aItems).page(newData.nPage).draw();
                itemEditTable.cell("#row_" + rowId + " td:eq(" + cellindex + ")").focus();
                //                itemEditTable.button( 0 ).disable();
            }
        )
        .always( function () {
            $.spin('false');
            $('#Modal_repeatItemEdit').toggle(false);
        });
    });
}

function itemEditUndoLast(aFields) {
    var cellindex = $('#itemEditTable td.focus').index()
    var tr = $('#itemEditTable td.focus').closest("tr");
    var rowindex = tr.index() + 1;
    var rowId = tr.attr('id');
    rowId = parseInt(rowId.substring(4));

    swal({
        title: 'Undo Last Edit?',
        text: "Please click 'Yes' to undo the last edit.",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#45c0bd",
        confirmButtonText: "Yes,undo!",
        closeOnConfirm: true
    },
        function () {
            var spinner = $("#Modal_itemEdit").spin("modal");

            $.post('itemEditUndoLast?',
                {
                    aLast: JSON.stringify(aLastItemEditChanges),
                    aFields: JSON.stringify(aFields)
                },
                function (newData, status) {
                    itemEditTable.row(newData.nRow).data(newData.aItems).draw();
                    itemEditTable.button(0).disable();
                    itemEditTable.button(1).disable();
                    itemEditTable.cell("#row_" + rowId + " td:eq(" + cellindex + ")").focus();
                }
            )
                .always(function () {
                    spinner.stop();
                    $("#spin_modal_overlay").remove();
                });
        });
}

function closeItemEditTable() {
    if ($.fn.DataTable.isDataTable('#itemEditTable')) {
        itemEditTable.clear().destroy(false);
        itemEditor.destroy();

        $("#itemEditTableWrapper").toggle(false);
        $('#itemEdit_select').toggle(true);

        $("#customField1").hide();
        $("#customField2").hide();

        $('#itemEditHdr th:gt(3)').remove();
        return;

    } else {
        $('#itemEdit_vendor')
            .find('option')
            .remove()
            .end()
            .append('<option value="">&#60; ANY &#62;</option>');

        $('#itemEdit_invtype')
            .find('option')
            .remove()
            .end()
            .append('<option value="">&#60; ANY &#62;</option>');

        $('#itemEdit_size')
            .find('option')
            .remove()
            .end()
            .append('<option value="">&#60; ANY &#62;</option>');

        $('#itemEdit_brand').val('< ANY >');
        $('#itemEdit_descrip').val('< ANY >');
        $('#itemEditGetList').prop('checked', false);
        $('#itemEditListSelected').text('');
        $('#itemEdit_select').find('.selectDOHrange').find('input,select').each(function () { $(this).prop('disabled', false) });
        $('#itemEditFieldSpan').find('input[type="checkbox"]').each(function () {
            $(this).prop('checked', false);
        });

        if ($.fn.DataTable.isDataTable('#itemListTable')) {
            itemListDataTable.rows().deselect();
        }

        $("#Modal_itemEdit").hide();
        $("nav").css('z-index', 999);
        if (doDash) {
            $("#tab_dash").toggle(true);
        }
    }
}

// END Item Edit Utility

// Begin Report Functions
function showDOHreport(cEl) {
    if (!cEl) {
        cEl = 'DOH'
    }
    var hdr = cEl + "_hdr";
    var ftr = cEl + "_ftr";
    var start = cEl + "_startDate";
    var end = cEl + "_endDate";
    var modal = "#Modal_" + cEl;

    $.post("remoteGetSettings?",function(reply) {
        let idx = findIndex( reply.aSet, "multiStoreSet" );
        let j = idx[0];
//        if (!reply.aSet[j][1]) {
            $('label[for="DOH_multiStore"]').hide();
            $("#DOH_multiStore").hide();
            $('#DOH_multiStore').prop('checked', false);
/*
        } else {
            $('label[for="DOH_multiStore"]').show();
            $("#DOH_multiStore").show();
        }    
*/
    });

    $(hdr).toggle(false);
    $(ftr).toggle(false);
    document.getElementById("DOH_startDate").disabled = true;
    document.getElementById("DOH_endDate").disabled = true;

    $('#' + cEl + '_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    if (cEl==="DOH") {
        getVendors('DOH_vendor');
        getInvDepts('DOH_invtype');
        getSizes('DOH_size');
    }
    setDOHdateSpan(cEl);

    $("nav").css('z-index', -1);
    $(modal).toggle(true);
    $("#tab_rept").toggle(false);
    $("#tab_saved").toggle(false);
}

function closeDOH() {
    var modalDOH = document.getElementById("Modal_DOH");
    var wait = $('#DOH_waitp');
    var isVisible = wait.is(':visible');
    
    $("#DOH_products").find('*').prop("disabled", false);
    $("#DOH_dates").find('*').prop("disabled", false);

    $("#DOHDivTitle").toggle(false);
    $("#DOHDivTitle").text('Inventory Performance');

    if (DOHtable) {
        DOHtable.clear().destroy(false);
        DOHtable = null;

        $('#DOH_waitp').toggle(true);
        $("#DOH_hdr").toggle(false);
        $("#DOH_ftr").toggle(false);
        $("#DOHtablewrapper").toggle(false);
    };
    $("#DOH_submit").toggle(true);
    $("#DOH_newset").toggle(false);
    $("#DOH_cancel").prop("value", "Cancel");

    if ($.fn.DataTable.isDataTable('#itemListTable')) {
        itemListDataTable.rows().deselect();
    }

    $("nav").css('z-index', 999);
    modalDOH.style.display = "none";
    if (doDash) {
        $("#tab_dash").toggle(true);
    }
}

function resetDOHreport() {
    if (DOHtable) {
        DOHtable.clear().destroy(false);
        DOHtable = null;
    }

    $("#DOH_products").find('*').prop("disabled", false);
    $("#DOH_dates").find('*').prop("disabled", false);

    $("#DOHDivTitle").toggle(false);
    $("#DOHDivTitle").text('Inventory Performance');

    $('#DOH_waitp').toggle(true);
    $("#DOH_hdr").toggle(false);
    $("#DOH_ftr").toggle(false);
    $("#DOHtablewrapper").toggle(false);
    $("#DOH_submit").toggle(true);
    $("#DOH_newset").toggle(false);
    $("#DOH_cancel").prop("value", "Cancel");
}

function DOH_toggleDeptType() {
    var el = document.getElementById('DOH_depttype');
    var cSel = el.options[el.selectedIndex].value;
    $('#DOH_invtype')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="  ">&#60; ANY &#62;</option>');
    if (cSel === "dept") {
        getInvDepts('DOH_invtype');
    } else {
        getInvTypes('DOH_invtype');
    };
    $('#DOH_invtype').toggle(true);
}

function DOHcustomDate(cEl) {
    if (!cEl) {
        cEl = 'DOH'
    }
    var start = cEl + "_startDate";
    var end   = cEl + "_endDate";
    var range = cEl + "range";

    document.getElementById(range).disabled = true;
    document.getElementById(start).disabled = false;
    document.getElementById(end).disabled = false;
}

function DOHstandardDate(cEl) {
    if (!cEl) {
        cEl = 'DOH'
    }
    var start = cEl + "_startDate";
    var end   = cEl + "_endDate";
    var range = cEl + "range";

    $(start).val('');
    $(end).val('');
    document.getElementById(start).disabled = true;
    document.getElementById(end).disabled = true;
    document.getElementById(range).disabled = false;
}

function getCoupons(cEl) {
    $.post("getCoupons()", "", function (data, status) {
        if (data.length > 0) {
            var select = document.getElementById(cEl);
            var el = document.createElement("option");
            var opt = "ALL"
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
            for (var i = 0; i < data.length; i++) {
                opt = data[i];
                el = document.createElement("option");
                el.textContent = opt;
                el.value = opt;
                select.appendChild(el);
            };
        };
    })
        .fail(function (xhr, ajaxOptions, thrownError) {
            swal("Oops...", "error getting coupons: " + thrownError, "error");
            $(".fqmodal").hide();
        });
}

function getExcepActions(cEl) {
    var select = document.getElementById(cEl);
    var el = document.createElement("option");
    var opt = "ALL";
    var aOpts = [ 'Deleted', 'Discounted', 'Price Edited', 'Drawer Opened', 'Refund Given', 'Deposit Returned', 'Sale Voided', 'Sold Below Cost' ];
    var aVals = [ 'DELE', 'DISC', 'EDIT', 'OPEN', 'REF', 'RETN', 'VOID', '<COS' ];

    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
    for (var i = 0; i < aOpts.length; i++) {
        el = document.createElement("option");
        el.textContent = aOpts[i];
        el.value = aVals[i];
        select.appendChild(el);
    };
}

function getInvEditModule(cEl) {
    var select = document.getElementById(cEl);
    var el = document.createElement("option");
    var opt = "ALL";
    var aVals = ['ADD BARCOD',
        'BARC VIEW',
        'DEL BARC',
        'DELETED',
        'EDIT ITEM',
        'EPICADDITM',
        'EPCOUNT',
        'EPITEMARCH',
        'EPITEMEDIT',
        'EPITEMEDIR',
        'EPITEMEDIU',
        'EPITEMREST',
        'GOPOS ADD',
        'GOPOS EDIT',
        'GROUP EDIT',
        'ITEMCLONE',
        'NUITEMBARC',
        'SIZE EDIT',
        'TYPE EDIT',
        'VENDOR EDI'];
    var aOpts = ['Add Barcode',
        'Barcode View',
        'Delete Barcode',
        'Item Deleted',
        'Edit Item',
        'encorePOS Inv Count Add',
        'encorePOS Inv Count Qty Change',
        'encorePOS Item Archive',
        'encorePOS Item Edit',
        'encorePOS Item Edit Repeat',
        'encorePOS Item Edit Undo',
        'encorePOS Item Restore',
        'GoPOS Item Add',
        'GoPOS Item Edit',
        'Group Edit',
        'Item Clone',
        'New Item Barcode',
        'Size Edit',
        'Type Edit',
        'Vendor Edit'];

    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
    for (var i = 0; i < aOpts.length; i++) {
        el = document.createElement("option");
        el.textContent = aOpts[i];
        el.value = aVals[i];
        select.appendChild(el);
    };
}

function getInvDepts(cEl) {
    $.post("getInvDepts()", "", function (data, status) {
        if (data.length > 0) {
            var select = document.getElementById(cEl);
            aInvTypes = data;
            for (var i = 0; i < data.length; i++) {
                var opt = data[i];
                var el = document.createElement("option");
                el.textContent = opt[0];
                el.value = opt[1];
                select.appendChild(el);
            };
        };
    })
        .fail(function (xhr, ajaxOptions, thrownError) {
            swal("Oops...", "error getting depts: " + thrownError, "error");
            $(".fqmodal").hide();
        });
}

function getInvTypes(cEl) {
    $.post("getInvTypes()", "", function (data, status) {
        if (data.length > 0) {
            var select = document.getElementById(cEl);
            aInvTypes = data;
            for (var i = 0; i < data.length; i++) {
                var opt = data[i];
                var el = document.createElement("option");
                el.textContent = opt[0];
                el.value = opt[1];
                select.appendChild(el);
            };
        };
    })
        .fail(function (xhr, ajaxOptions, thrownError) {
            swal("Oops...", "error getting types: " + thrownError, "error");
        });
}

// Return selected inventory dept or type
function getInvTypeSelected(cEl) {
    var itypes = document.getElementById(cEl);
    var result = itypes.options[itypes.selectedIndex].value;
    return result;
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
        };
    })
        .fail(function (xhr, ajaxOptions, thrownError) {
            swal("Oops...", "error getting vendors: " + thrownError, "error");
        });
}

// Return selected vendor
function getVendorSelected(cEl) {
    var itypes = document.getElementById(cEl);
    var result = itypes.options[itypes.selectedIndex].value;
    return result;
}

function DOH_toggleSelects() {
    var lChk = $('#DOH_getItemList').prop('checked');

    $('#DOH_products').find('.selectDOHrange').find('input,select').each(function () { $(this).prop('disabled', lChk) });

    if ($('#DOH_getItemList').is(':checked')) {
        DOH_showItemList();
    } else {
        $('#DOH_itemListSelected').text('');
        aSelectedItemCodes = [];
        if ($.fn.DataTable.isDataTable('#itemListTable')) {
            itemListDataTable.rows().deselect();
        }
    }
}

function DOH_showItemList(lNoClear) {
    showItemList('os', lNoClear);
    DOH_waitForItemSelection('#DOH_itemListSelected');
}

function DOH_waitForItemSelection(cEl) {
    var xId;
    var cTxt;

    if (!$('#Modal_itemList').is(':visible')) {
        clearTimeout(xId);
        if (aSelectedItemCodes.length > 0) {
            if (aSelectedItemCodes[0] === 'nada') {
                aSelectedItemCodes = [];
            }
            if (aSelectedItemCodes.length === 0) {
                $('#DOH_getItemList').prop('checked', false);
                DOH_toggleSelects();
            } else if (cEl) {
                cTxt = aSelectedItemCodes.length.toString() + ' items selected &nbsp; <input type="button" value="Revise" class="pAbuttonGrn" onclick="DOH_showItemList(true);"</input>'
                $(cEl).html(cTxt);
            }
        }
        return;
    }

    xId = setTimeout(DOH_waitForItemSelection, 250, cEl);
}

function getSizes(cEl) {
    $.post("getSizes()", "", function (data, status) {
        if (data.length > 0) {
            var select = document.getElementById(cEl);
            aSizes = data;
            for (var i = 0; i < data.length; i++) {
                var opt = data[i];
                var el = document.createElement("option");
                el.textContent = opt;
                el.value = opt;
                select.appendChild(el);
            };
        };
    })
        .fail(function (xhr, ajaxOptions, thrownError) {
            swal("Oops...", "error getting sizes: " + thrownError, "error");
        });
}

function getDOHreport(aData, colVis) {
    var lSaved = false;
    var arr = [];
    var dateRange = $('input[name=DOH_dateRange]:checked').val();
    var table = $("#DOHtable");
    var thdr = document.getElementById("DOH_hdr");
    var cbran = $('#DOH_brand').val();
    var cdesc = $('#DOH_descrip').val();
    var v = document.getElementById("DOH_vendor");
    var cvend = v.options[v.selectedIndex].text;
    var cvendnum = v.options[v.selectedIndex].value;
    var cdort = $('#DOH_depttype').val();
    var t = document.getElementById("DOH_invtype");
    var cdept = t.options[t.selectedIndex].text;
    var cdeptnum = t.options[t.selectedIndex].value;
    var s = document.getElementById("DOH_size");
    var csize = s.options[s.selectedIndex].text;
    var dateSpan = document.getElementById('DOH_date_span');
    var doList = $('#DOH_getItemList').prop('checked');
    var noSales = $('#DOH_inclZeroItems').prop('checked');
    var multiStore = $('#DOH_multiStore').prop('checked');
    var cstart;
    var cend;
    var cnbr;
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("invPerfLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    let showOrderCol = (localStorage.getItem('DOHshowOrderColumn') || 'false') === 'true';
    elog('showOrderCol:',showOrderCol,'typeof:',typeof showOrderCol);

    $("#DOH_submit").toggle(false);
    $("#DOH_cancel").toggle(false);
    $("#DOH_newset").toggle(false);

    // aData comes from func getSavedDOHReport()
    if (aData) {
        lSaved = true;
        arr = aData;

        cbran = arr[0];
        if (cbran === '') {
            cbran = '< ANY >'
        };
        $('#DOH_brand').val(cbran);

        cdesc = arr[1];
        if (cdesc === '') {
            cdesc = '< ANY >'
        };
        $('#DOH_descrip').val(cdesc);

        cvend = arr[4];
        cvendnum = arr[14];
        $('#DOH_vendor').val(arr[14]);
        
        cdort = arr[3];
        $('#DOH_depttype').val(arr[3]);
        
        cdept = arr[4];
        cdeptnum = arr[15];
        $('#DOH_invtype').val(arr[15]);
        
        csize = arr[5];
        $('#DOH_size').val(arr[5]);
        
        dateRange = arr[6];
        $('input[name=DOH_dateRange][value="' + arr[6] + '"]').prop('checked', true);
        
        $('#DOHrange').val(arr[7]);
        
        $('#DOH_startDate').val(arr[8]);
        
        $('#DOH_endDate').val(arr[9]);

        setDOHdateSpan();

        if (arr.length > 12) {
            $("#DOH_getItemList").prop('checked',arr[11]);
            aSelectedItemCodes = arr[12].split(',');
            $("#DOH_inclZeroItems").prop('checked',arr[13]);
            doList = arr[11];
            noSales = arr[13];
        }

    } else {
        if (dateRange === '2' && ($('#DOH_startDate').val() === '' || $('#DOH_endDate').val() === '')) {
            swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
            return;
        };

        if (cbran === '') {
            cbran = '< ANY >'
        };

        if (cdesc === '') {
            cdesc = '< ANY >'
        };

        if (cvend === '&#60; ANY &#62;') {
            cvend = '< ANY >'
        };

        if (cdept === '&#60; ANY &#62;') {
            cdept = '< ANY >'
        };

        if (csize === '&#60; ANY &#62;') {
            csize = '< ANY >'
        };

        cdort = cdort.capitalFirstLetter();

        arr.push( $('#DOH_brand').val() );
        arr.push( $('#DOH_descrip').val() );
        arr.push( getVendorSelected('DOH_vendor') );
        arr.push( $('#DOH_depttype').val() );
        arr.push( getInvTypeSelected('DOH_invtype') );
        arr.push( $('#DOH_size').val() );
        arr.push( dateRange );
        arr.push( $('#DOHrange').val() );
        arr.push( $('#DOH_startDate').val() );
        arr.push( $('#DOH_endDate').val() );
        arr.push( '' );
        arr.push( doList );
        arr.push( aSelectedItemCodes );
        arr.push( noSales );
        arr.push( cvendnum );
        arr.push( cdeptnum );

        if (arr[0] === '< ANY >') {
            arr[0] = ''
        };

        if (arr[1] === '< ANY >') {
            arr[1] = ''
        };
    };

    $("#DOH_products").find('*').prop("disabled", true);
    $("#DOH_dates").find('*').prop("disabled", true);
    $("#DOHDivTitle").toggle(true);

    $.post('getDateData("' + arr[6] + '","' + arr[7] + '","' + arr[8] + '","' + arr[9] + '","' + arr[10] + '")', '', function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];

            $("#DOHDivTitle").append("<br><span style='font-size: 14px;'>" + cstart + ' - ' + cend + "</span>");
        };
    });

    $("#DOH_col0a").text("Add to Order");
    $("#DOH_col0").text("Item Nbr");
    $("#DOH_col1").text("Barcode");
    $("#DOH_col2").text("Brand");
    $("#DOH_col3").text("Description");
    $("#DOH_col4").text("Size");
    $("#DOH_col5").text("Dept");
    $("#DOH_col6").text("Type");
    $("#DOH_col7").text("Cost");
    $("#DOH_col8").text("$ Sold");
    $("#DOH_col9").text("GM%");
    $("#DOH_col10").text("Qty Sold");
    $("#DOH_col11").text("Qty on Hand");
    $("#DOH_col12").text("Days on Hand");
    $("#DOH_col13").text("Days to Sell");
    $("#DOH_col14").text("GMROI");
    $("#DOH_col15").text("Inv Cost");
    $("#DOH_col16").text("Qty Purchased");
    $("#DOH_col17").text("Qty on Order");
    $("#DOH_col18").text("Last Sold");
    $("#DOH_col19").text("Last Recv");

    $("#DOH_hdr").toggle(true);
    $("#DOH_ftr").toggle(true);
    $("#DOH_newset").toggle(true);
    $("#DOH_cancel").prop("value", "Done");

    DOHtable = $('#DOHtable').DataTable({
        // responsive: true,
        scrollX: true,
        colReorder: true,
        dom: 'Bfrtilp',
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                title: 'Days On Hand Report ' + todayString()
            },
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'landscape',
                title: 'Days On Hand Report ' + todayString(),
                exportOptions: {
                    columns: ':visible',
                    modifier: {
                        selected: null
                    }
                },
                header: true,
                footer: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'Brand: ' + cbran + '\n' +
                                'Description: ' + cdesc + '\n' +
                                'Size: ' + csize + '\n' +
                                'Vendor: ' + cvend + '\n' +
                                cdort + ': ' + cdept + '\n' +
                                'History Start: ' + cstart + '\n' +
                                'History End: ' + cend + '\n' +
                                'Nbr days: ' + cnbr + '\n' +
                                'Report run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Days On Hand Report ' + todayString(),
                exportOptions: {
                    //columns: ":visible"
                    columns: function (idx, data, node) {
                        let allVisibleArray = DOHtable.columns().visible().toArray();
                        if (idx === 1 || !allVisibleArray[idx] || node.classList.contains('select-checkbox')) {
                            return false;
                        }
                        return true;
                    },
                    modifier: {
                        selected: null
                    }
                },
                footer: true,
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(n+6):nth-child(-n+12) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'Brand: ' + cbran + '<br>' +
                        'Descrip: ' + cdesc + '<br>' +
                        'Size: ' + csize + '<br>' +
                        'Vendor: ' + cvend + '<br>' +
                        cdort + ': ' + cdept + '<br>' +
                        'History Start: ' + cstart + '<br>' +
                        'History End: ' + cend + '<br>' +
                        'Nbr of Days: ' + cnbr + '</p>');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                extend: 'colvis',
                text: svgColVis,
                titleAttr: ' Toggle Columns ',
                columns: [ 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 ]
            },
            {
                text: svgRemember,
                titleAttr: '  Save Settings  ',
                action: function (e, dt, node, config) {
                    var colArr = DOHtable.columns().visible().toArray();
                    var colSav = [];
                    $.each(colArr, function (idx, item) {
                        if (!item) {
                            colSav.push(idx);
                        }
                    });
                    saveDOHReport(arr, colSav);
                }
            },
            {
                text: svgCart,
                titleAttr: '  Create Order  ',
                action: function (e, dt, node, config) {
                    let DOHOrder = JSON.parse(localStorage.getItem('DOHOrder')) || [];
                    createOrderFromDOH(DOHOrder);
                }
            },            
            {
                text: svgClose,
                titleAttr: '  Close  ',
                action: function (e, dt, node, config) {
                    //--- if items are checked to order see what to do with them
                    let DOHOrder = JSON.parse(localStorage.getItem('DOHOrder')) || [];
                    if (DOHOrder.length !== 0) {
                        checkIfDoDOHOrder(DOHOrder);
                        return;
                    }

                    $("#DOH_select").toggle(true);
                    $("#DOH_waitp").toggle(true);
                    $("#DOHtablewrapper").toggle(false);
                    $("#DOHDivTitle").toggle(false);
                    $("#DOHDivTitle").text('Inventory Performance');
                    if (activeTab === 'saved') {
                        closeDOH();
                    }
                }
            }
        ],
        /*
        ajax: 'DOH_Report("' + arr[0] + '","' + arr[1] + '","' + arr[2] + '","' + arr[3] + '","' + arr[4] + '","' + arr[5] +
                         '","' + arr[6] + '","' + arr[7] + '","' + arr[8] + '","' + arr[9] + '","' + arr[10] + '")',
        cBrand, cDescrip, cVendnum, cDeptType, cDeptTypeNum, cSize, cDateType, cDateRange, cStartDate, cEndDate, cSaveDate )
        */
        ajax: {
            url: "DOH_Report?",
            data: {
                cBrand: cbran,
                cDescrip: cdesc,
                cVendnum: cvendnum,
                cDeptType: arr[3],
                cDeptTypeNum: cdeptnum,
                cSize: csize,
                cDateType: arr[6],
                cDateRange: arr[7],
                cStartDate: arr[8],
                cEndDate: arr[9],
                cSaveDate: arr[10],
                doList: doList,
                aItems: JSON.stringify(aSelectedItemCodes),
                noSales: noSales,
                multiStore: multiStore
            },
            type: "POST"
        },
        "language": {
            "loadingRecords": "Please wait - loading data..."
        },
        columns: [
            {
                data: null,
                defaultContent: '',
                orderable: false,
                width: "0%"
            },
            {
                data: "checked",
                defaultContent: '',
                className: 'orderCheck', // 'select-checkbox',
                orderable: false,
                width: "3%"
            },
            { data: "intnum", width: "7.5%" },
            { data: "barcode", width: "7.5%" },
            { data: "brand", width: "14%", "class": "DOH_Brand" },
            { data: "descrip", width: "14%", "class": "DOH_Descrip" },
            { data: "size", width: "5%" },
            { data: "dept", width: "10%" },
            { data: "type", width: "14%" },
            { data: "cost", width: "5%" },
            { data: "sales", width: "5%", "class": "DOH_SalesZoom" },
            { data: "grMarg", width: "5%" },
            { data: "qtySold", width: "5%", "class": "DOH_SalesZoom" },
            { data: "qoh", width: "5%" },
            { data: "doh", width: "5%" },
            { data: "dts", width: "5%" },
            { data: "gmroi", width: "5%" },
            { data: "invCost", width: "5%" },
            { data: "qtyIn", width: "5%", "class": "DOH_PurchZoom" },
            { data: "qoo", width: "5%" },
            { data: "lastSale", width: "7.5%" },
            { data: "lastRecv", width: "7.5%" },
            { data: "codenum", width: "0%" }
        ],
        select: {
            style: 'multi',
            selector: 'td.orderCheck', //'td:nth-child(2)',
            blurable: false
        },
        columnDefs: [
            { "type": "num-fmt", "targets": [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,20] },
            { targets: [0], visible: false, searchable: false, orderable: false },
            { targets: [1], visible: showOrderCol, searchable: false, orderable: false },
            { targets: [2, 3, 7, 8, 9, 10], visible: false, searchable: true, orderable: true },
            { className: 'numericCol', targets: [ 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
            { "targets": [22], "visible": false, "searchable": false }
        ],
        order: [[2, 'asc']],
        "footerCallback": function (tfoot, data, start, end, display) {
            var api = this.api();
            var cost = 0;
            var sales = 0;
            var inv = 0;

            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            $(api.column(9).footer()).html(
                api.column(9).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                }, 0)
            )
            cost = intVal($(api.column(8).footer()).text());

            $(api.column(10).footer()).html(
                api.column(10).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                }, 0)
            )
            sales = intVal($(api.column(9).footer()).text());

            $(api.column(12).footer()).html(
                api.column(12).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(0));
                }, 0)
            );

            $(api.column(13).footer()).html(
                api.column(13).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(0));
                }, 0)
            );

            $(api.column(17).footer()).html(
                api.column(17).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                }, 0)
            );
            inv = intVal($(api.column(17).footer()).text());

            $(api.column(11).footer()).html(
                (((intVal($(api.column(10).footer()).text()) - intVal($(api.column(9).footer()).text())) /
                    intVal($(api.column(10).footer()).text())) * 100).toFixed(1) + '%'
            );

            $(api.column(14).footer()).html(
                (intVal($(api.column(13).footer()).text()) /
                    (intVal($(api.column(12).footer()).text()) / cnbr)).toFixed(0)
            );

            $(api.column(15).footer()).html( 
                ((intVal($(api.column(14).footer()).text()))===0) ? '--' : (cnbr / intVal($(api.column(14).footer()).text())).toFixed(2) 
            );

            $(api.column(16).footer()).html( (inv===0) ? '--' : (((sales - cost) * (365 / cnbr)) / inv).toFixed(2));

            $(api.column(18).footer()).html(
                api.column(18).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(0));
                }, 0)
            );

            $(api.column(19).footer()).html(
                api.column(19).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(0));
                }, 0)
            );

        },
        "fnDrawCallback": function () {
            $("#DOH_select").toggle(false);
            $("#DOH_waitp").toggle(false);
            $("#DOHtablewrapper").toggle(true);
            $("#DOH_cancel").toggle(true);
            $("#DOH_newset").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;

            $('#DOHtable td.DOH_SalesZoom').unbind();
            $('#DOHtable td.DOH_SalesZoom').bind( 'click', function() { 
                var nRow = DOHtable.row( $(this).parent() ).index();
                var rowData = DOHtable.rows( nRow ).data().toArray();
                elog('data array:', JSON.stringify(rowData));
                showItemSalesInfo( rowData[0].codenum, cstart, cend );
            });
    
            $('#DOHtable td.DOH_PurchZoom').unbind();
            $('#DOHtable td.DOH_PurchZoom').bind( 'click', function() { 
                var nRow = DOHtable.row( $(this).parent() ).index();
                var rowData = DOHtable.rows( nRow ).data().toArray();
                showItemOrderInfo( rowData[0].codenum );
            });

            elog("Table has been drawn line 6534");
        },
        initComplete: function () {
            if ( ! $('#DOHtable').DataTable().data().any() || lSaved ) {
                $('#DOHtable').DataTable().button(5).disable();   // don't allow report save on empty table or if already saved!!
            }
            // set visible columns from saved settings. colVis sent in as parameter.
            if ( DOHtable.data().any() && colVis ) {
                var cols = DOHtable.columns().toArray()[0];
                var colShow = [];
                $.each(cols, function (idx, item) {
                    if( !colVis.includes(item) ) {
                        colShow.push(item);
                    }
                });
                DOHtable.columns(colVis).visible(false);
                DOHtable.columns(colShow).visible(true);                        
            }

            $('#DOHtable td.DOH_SalesZoom').unbind();
            $('#DOHtable td.DOH_SalesZoom').bind( 'click', function() { 
                var nRow = DOHtable.row( $(this).parent() ).index();
                var rowData = DOHtable.rows( nRow ).data().toArray();
                elog('data array:', JSON.stringify(rowData));
                showItemSalesInfo( rowData[0].codenum, cstart, cend );
            } );

            $('#DOHtable td.DOH_PurchZoom').unbind();
            $('#DOHtable td.DOH_PurchZoom').bind( 'click', function() { 
                var nRow = DOHtable.row( $(this).parent() ).index();
                var rowData = DOHtable.rows( nRow ).data().toArray();
                showItemOrderInfo( rowData[0].codenum );
            } );

            const info = DOHtable.page.info();
            if (info.pages === 1) {
                $('#DOHtable_paginate').hide();
            }

            let DOHOrder = JSON.parse(localStorage.getItem('DOHOrder')) || [];
            if ( DOHOrder.length === 0 ) {
                $('.dt-button[title="  Create Order  "]').hide();
            } else {
                let data = DOHtable.rows().data();
                $.each(data, function (idx, item) {
                    let index = DOHOrder.findIndex(x => x.codenum === item.codenum);
                    if (index > -1) {
                        DOHtable.rows([idx]).select();
                        DOHtable.cell({ row: idx, column: 1 }).data('&#10004;').draw();
                    }
                });
            }
        }
    });

    $('#DOHtable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("invPerfLength", len);
        }
    });

    DOHtable.on( 'column-reorder', function ( e, settings, details ) {
        var headerCell = $( DOHtable.column( details.to ).header() );
        headerCell.addClass( 'reordered' );
        setTimeout( function () {
            headerCell.removeClass( 'reordered' );
        }, 1250 );
    });

    DOHtable.on( 'column-visibility.dt', function ( e, settings, column, state ) {
        // elog('colvis, column:', column);
        if (column === 1 && !$('#DOH_waitp').is(':visible')) {
            elog('colvis state:',state);
            let lShow = state ? 'true' : 'false';
            localStorage.setItem('DOHshowOrderColumn', lShow);
        } else if (column === 1 && $('#DOH_waitp').is(':visible')) {
            elog('we blocked the change');
        }
        if ( state ) {
            $('#DOHtable td.DOH_SalesZoom').unbind();
            $('#DOHtable td.DOH_SalesZoom').bind( 'click', function() { 
                var nRow = DOHtable.row( $(this).parent() ).index();
                var rowData = DOHtable.rows( nRow ).data().toArray();
                elog('data array:', JSON.stringify(rowData));
                showItemSalesInfo( rowData[0].codenum, cstart, cend );
            });

            $('#DOHtable td.DOH_PurchZoom').unbind();
            $('#DOHtable td.DOH_PurchZoom').bind( 'click', function() { 
                var nRow = DOHtable.row( $(this).parent() ).index();
                var rowData = DOHtable.rows( nRow ).data().toArray();
                showItemOrderInfo( rowData[0].codenum );
            });
        }
    });

    DOHtable.on('user-select', function ( e, dt, type, cell, originalEvent) {
       // e.preventDefault();
        //e.stopPropagation();
        //elog('selected, type =', type);
        let sel1 = originalEvent.target.parentNode.classList.contains("selected");
        if (type === 'row' && sel1 === false) {
            let data = DOHtable.row(originalEvent.target.parentNode).data();
            let nRow = DOHtable.row(originalEvent.target.parentNode).index();

            DOHtable.cell({ row: nRow, column: 1 }).data('&#10004;').draw();

            // elog( "data:", JSON.stringify(data) );
            
            let code = data.codenum;
     
            //elog( 'codenum:', code, "data:", JSON.stringify(data) );

            getDOHOrderQty( nRow, data );

            return true;
        }
    });

    DOHtable.on('deselect', function (e, dt, type, indexes) {
        e.preventDefault();
        e.stopPropagation();
        if (type === 'row') {
            let nRow = indexes[0];
            let data = DOHtable.rows().data()[nRow];
            let code = data.codenum;

            DOHtable.cell({ row: nRow, column: 1 }).data('&#9744;').draw();

            //elog('deselected, codenum:', code);
            
            let DOHOrder = JSON.parse(localStorage.getItem('DOHOrder')) || [];
            let index = DOHOrder.findIndex(x => x.codenum === code);
            if (index > -1) {
                DOHOrder.splice(index, 1);
                localStorage.setItem('DOHOrder', JSON.stringify(DOHOrder));
            }
            if ( DOHOrder.length === 0 ) {
                $('.dt-button[title="  Create Order  "]').hide();
            }
        }
    });
}

function setDOHdateSpan(cEl) {
    if (!cEl) {
        cEl = 'DOH'
    }
    var start = "#" + cEl + "_startDate";
    var end   = "#" + cEl + "_endDate";
    var range = "#" + cEl + "range";
    var dates = cEl + "_dateRange";
    var dSpan = cEl + "_date_span";

    var dateRange = $('input[name=' + dates + ']:checked').val();
    var arr = [];
    var cstart;
    var cend;

    arr.push('"' + dateRange + '"');
    arr.push('"' + $(range).val() + '"');
    arr.push('"' + $(start).val() + '"');
    arr.push('"' + $(end).val() + '"');

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            document.getElementById(dSpan).innerHTML = cstart + ' -- ' + cend;
        };
    });
}

function saveDOHReport(arr, colArr) {
    vex.dialog.prompt({
        message: 'Please enter report description...',
        placeholder: 'Report Description',
        callback: function (value) {
            if (value) {
                var savedArray = localStorage.getItem("invPerfSaved");
                var newArray = [];
                if (savedArray) {
                    newArray = JSON.parse(savedArray)
                    var found = newArray.findIndex(function(entry) {
                        return entry.description === value;
                    });
                    if (found>-1) {
                        vex.dialog.alert({
                            message: 'A report with that description is already saved. Please try again.'
                        })
                        return;
                    }
                }
                var saveDate = new Date().toJSON().slice(0, 10)
                newArray.push( { "description": value, "data": arr, "dateSaved": saveDate, "colVis": colArr } );
                localStorage.setItem("invPerfSaved",JSON.stringify(newArray));
                buildShortCutTab(true);
            }
        }
    })    
}

function getSavedDOHReport() {
    var savedArray = localStorage.getItem("invPerfSaved");

    if (savedArray) {
        var array = JSON.parse( savedArray );
        var opt = '';
        var val;
        $.each(array, function (idx, item) {
            val = '["'
            $.each(array[idx].data, function (num,parm) {
                val += parm + '","';
            });
            val += array[idx].dateSaved + '"]'
            opt += "<option value='" + val + "'>" + array[idx].description + '</option>';
        });
        vex.dialog.open({
            message: 'Select saved report...',
            input: [
                '<div class="vex-custom-field-wrapper">',
                    '<div class="vex-custom-input-wrapper">',
                        '<select id="reportSelect" name="url" >' + opt + '</select>',
                    '</div>',
                '</div>'
            ].join(''),
            className: 'vex-theme-multiButtons',
            buttons: [
                vex.dialog.buttons.YES,
                vex.dialog.buttons.NO,
                $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-caution', text: 'Delete', click: function(e) {
                    var report = $("#reportSelect option:selected").text();
                    this.value = { 'description': 'delete', 'select': report };
                    this.close();
                }})
            ],
            callback: function (value) {
                if (!value) {
                    return;
                } else if (value.description === 'delete'){
                    return deleteSavedDOHReport(value.select);
                } else {
                    var nuData = JSON.parse( value.url );
                    if (nuData[6] === '2') {
                        vex.dialog.open({
                            message: 'Select start and end dates...',
                            input: [
                                '<div class="vex-custom-field-wrapper">',
                                    '<label for="startDate">Date</label>',
                                    '<div class="vex-custom-input-wrapper">',
                                        '<input name="startDate" type="date" value="' + convertDateStr( nuData[8] ) + '" />',
                                    '</div>',
                                '</div>',
                                '<div class="vex-custom-field-wrapper">',
                                    '<label for="endDate">Date</label>',
                                    '<div class="vex-custom-input-wrapper">',
                                        '<input name="endDate" type="date" value="' + convertDateStr( nuData[9] ) + '" />',
                                    '</div>',
                                '</div>'
                            ].join(''),
                            callback: function (data) {
                                if (!data) {
                                    return;
                                }
                                nuData[8] = convertDateStr( data.startDate );
                                nuData[9] = convertDateStr( data.endDate );
                                resetDOHreport();
                                getDOHreport( nuData );
                            }
                        })
                    } else {
                        resetDOHreport();
                        getDOHreport( nuData );
                    }
                }
            }
        })
    }
}

function deleteSavedDOHReport( cReport ) {
    vex.dialog.confirm({
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' +
                        'Are you sure you want to delete the report:<br><br><i>' + cReport + '</i> ?',
        className: 'vex-theme-multiButtons',
        callback: function (value) {
            if (value) {
                var savedArray = localStorage.getItem("invPerfSaved");
                if (savedArray) {
                    var array = JSON.parse( savedArray );
                    var found = array.findIndex(function(entry) {
                        return entry.description === cReport;
                    });
                    if (found>-1) {
                        array.splice(found,1);
                        if (array.length > 0) {
                            localStorage.setItem("invPerfSaved",JSON.stringify(array));
                        } else {
                            localStorage.removeItem("invPerfSaved");
                        }
                        buildShortCutTab();
                        vex.dialog.alert({
                            message: 'Your report has been deleted.'
                        })
                    } else {
                        vex.dialog.alert({
                            message: 'Unable to delete your report.'
                        })
                    }
                }
            }
        }
    })    
}

function getDOHOrderQty( row, data ) {
    let code = data.codenum;
    let brand = data.brand;
    let descrip = data.descrip;
    let size = data.size;

    //--- save row index for use by Cancel button
    $('#DOHOrderQtyDialog').attr( "data-row", row.toString());

    $("#DOHOrderBrand").text( brand );
    $("#DOHOrderBranDescrip").text( descrip );
    $("#DOHOrderSize").text( size );
    
    if (!AutoNumeric.isManagedByAutoNumeric('#DOHOrderCases')) {
        new AutoNumeric('#DOHOrderCases', { decimalPlaces: 0, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false,unformatOnSubmit: true });
        new AutoNumeric('#DOHOrderUnits', { decimalPlaces: 0, digitGroupSeparator: "", isCancellable: true, modifyValueOnUpDownArrow: false, unformatOnSubmit: true });
    }

    const caseInp = AutoNumeric.getAutoNumericElement('#DOHOrderCases');
    caseInp.set(0);
    const unitInp = AutoNumeric.getAutoNumericElement('#DOHOrderUnits');
    unitInp.set(0);

    if (!DOHOrderQtyDialog) {
        DOHOrderQtyDialog = $("#DOHOrderQtyDialog").dialog({
            autoOpen: false,
            height: 305,
            width: 350,
            position: { my: "left top", at: "left top", of: $('#DOHtablediv') },
            modal: true,
            buttons: [
                {
                    id: "DOHQtySubmit",
                    text: "Save Qty",
                    click: function (event) {
                        //event.preventDefault();
                        $(this).find("form").submit();
                    }
                },
                {
                    id: "DOHQtyCancel",
                    text: "Cancel",
                    click: function () {
                        let myRow = $('#DOHOrderQtyDialog').attr( "data-row" );
                        DOHtable.rows([parseInt(myRow)]).deselect();

                        let caseInp = AutoNumeric.getAutoNumericElement('#DOHOrderCases');
                        let unitInp = AutoNumeric.getAutoNumericElement('#DOHOrderUnits');
                        caseInp.remove();
                        unitInp.remove();
                    
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

        DOHOrderQtyDialog.find("form").keydown(function (e) {
            if (e.which === 27 ) {
                $('#DOHQtyCancel').click();
            }
        });

        DOHOrderQtyDialog.on('mousedown', function(e) {
            e.stopPropagation();
        });
    } else {
        DOHOrderQtyDialog.find("form").off("submit");
    }

    DOHQtyForm = DOHOrderQtyDialog.find("form").on("submit", function (event) {
        event.preventDefault();
    elog('submit, code:', code, 'row:', row);
        saveDOHOrder( code, row );
    });
    
    DOHOrderQtyDialog.dialog("open");
    setTimeout( function() { $('#DOHOrderCases').focus(); 10 });

}

function saveDOHOrder( code, row ) {
    let caseInp = AutoNumeric.getAutoNumericElement('#DOHOrderCases');
    let caseQty = caseInp.getNumber();	
    let unitInp = AutoNumeric.getAutoNumericElement('#DOHOrderUnits');
    let unitQty = unitInp.getNumber();

    elog( 'codenum:', code, 'cases:', caseQty, 'units:', unitQty);

    caseInp.remove();
    unitInp.remove();

    let DOHOrder = JSON.parse(localStorage.getItem('DOHOrder')) || [];
    let index = DOHOrder.findIndex(x => x.codenum === code);
    // first check if already in array, if so update values:
    if ( index > -1) {
        DOHOrder[index].cases = caseQty;
        DOHOrder[index].units = unitQty;
    // if not already there, add element:
    } else {
        DOHOrder.push( {codenum: code, cases: caseQty, units: unitQty} );
    }
    localStorage.setItem('DOHOrder',JSON.stringify(DOHOrder));

    if ( DOHOrder.length > 0 ) {
        $('.dt-button[title="  Create Order  "]').show();
    }
    DOHOrderQtyDialog.dialog("close");
    // DOHOrderQtyDialog.dialog("destroy");
    // DOHOrderQtyDialog = null;
}

function checkIfDoDOHOrder(DOHOrder) {
    let nItems = DOHOrder.length;
    let s = (nItems > 1) ? 's' : '';
    vex.dialog.confirm({
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' +
                        'You have ' + nItems + ' item' + s + ' marked for ordering.<br><br>' +
            'Create the order now or discard the list?',
        className: 'vex-theme-multiButtons',
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, { className: 'vex-dialog-button-primary', text: 'Order' }),
            $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-caution', text: 'Discard' })
        ],
        callback: function (value) {
            if (value) {
                createOrderFromDOH( DOHOrder, true );
            } else {
                localStorage.removeItem("DOHOrder");
                $("#DOH_select").toggle(true);
                $("#DOH_waitp").toggle(true);
                $("#DOHtablewrapper").toggle(false);
                $("#DOHDivTitle").toggle(false);
                $("#DOHDivTitle").text('Inventory Performance');
                if (activeTab === 'saved') {
                    closeDOH();
                }
            }
        }
    });
}

function createOrderFromDOH(DOHOrder, lFromVex) {
    $.spin('true');
    elog('lFromVex', lFromVex, JSON.stringify(DOHOrder));

    $.post('poPost?', {
        "vendnum": null,
        "items": JSON.stringify(DOHOrder),
        "num": null,
        "freight": 0,
        "total": 0,
        "notes": '',
        "receiver": null,
        "invNbr": null,
        "receiving": false,
        "rcvSave": false,
        "fromDOH": true
    },
        function (reply) {
            if (reply.result === 'success') {
                localStorage.removeItem("DOHOrder");

                if (lFromVex) {
                    $("#DOH_select").toggle(true);
                    $("#DOH_waitp").toggle(true);
                    $("#DOHtablewrapper").toggle(false);
                    $("#DOHDivTitle").toggle(false);
                    $("#DOHDivTitle").text('Inventory Performance');
                } else {
                    let ordRows = DOHtable.rows('.selected').indexes();
                    $.each( ordRows, function( idx, item ) {
                        DOHtable.cell({ row: item, column: 1 }).data('&#9744;');
                    });
                    DOHtable.rows(ordRows).deselect().draw();
                }

                $.spin('false');
                vexAlert(
                    'Your order has been prepared and<br>' +
                    'saved as Purchase Order Nbr: <b>' + reply.poNum + '</b><br>' +
                    'It can be further edited or expanded<br>' +
                    'in the Purchasing module.'
                );

                if (activeTab === 'saved') {
                    closeDOH();
                }
            } else {
                $.spin('false');
                vexAlert(reply.msg);
            }
        }
    )
    .fail(function () {
        $.spin('false');
        vexAlert('Unknown system error encountered.')
    });
}

function convertDateStr( cIn ) {
    if (cIn.indexOf('-')<3) {
        return cIn.substr(6,4) + '-' + cIn.substr(0,5);
    } else {
        return cIn.substr(5,5) + '-' + cIn.substr(0,4);
    }
}

// END DOHreport (Inventory Performance Report)

// Start Sales by Station
function closeSBS() {
    var modalSBS = document.getElementById("Modal_SBS");
    var wait = $('#SBS_waitp');
    var isVisible = wait.is(':visible');

    $("#SBS_products").find('*').prop("disabled", false);
    $("#SBS_dates").find('*').prop("disabled", false);

    $("#SBSDivTitle").toggle(false);
    $("#SBSDivTitle").text('Sales by Station');

    if (SBStable) {
        SBStable.clear().destroy(false);
        SBStable = null;

        $('#SBS_waitp').toggle(true);
        $("#SBS_hdr").empty().toggle(false);
        $("#SBS_ftr").empty().toggle(false);
        $("#SBStablewrapper").toggle(false);
    };
    $("#SBS_submit").toggle(true);
    $("#SBS_newset").toggle(false);
    $("#SBS_cancel").prop("value", "Cancel");

    $("nav").css('z-index', 999);
    modalSBS.style.display = "none";
    if (doDash) {
        $("#tab_dash").toggle(true);
    }
}

function resetSBSreport() {
    if (SBStable) {
        SBStable.clear().destroy(false);
        SBStable = null;
    }

    $("#SBS_products").find('*').prop("disabled", false);
    $("#SBS_dates").find('*').prop("disabled", false);

    $("#SBSDivTitle").toggle(false);
    $("#SBSDivTitle").text('Sales by Station');

    $('#SBS_waitp').toggle(true);
    $("#SBS_hdr").empty().toggle(false);
    $("#SBS_ftr").empty().toggle(false);
    $("#SBStablewrapper").toggle(false);
    $("#SBS_submit").toggle(true);
    $("#SBS_newset").toggle(false);
    $("#SBS_cancel").prop("value", "Cancel");
}

function getSBSreport(aData) {
    var lSaved = false;
    var arr = [];
    var dateRange = $('input[name=SBS_dateRange]:checked').val();
    var table = $("#SBStable");
    var thdr = document.getElementById("SBS_hdr");
    var reportType = $("input[name='SBStype']:checked"). val();
    var dateSpan = document.getElementById('SBS_date_span');
    var cstart;
    var cend;
    var cnbr;
    var ntimes = 0;

    $.spin('true');    
    
    $("#SBS_submit").toggle(false);
    $("#SBS_cancel").toggle(false);
    $("#SBS_newset").toggle(false);

    if (aData) {
        lSaved = true;
        arr = aData;

        reportType = arr[0];
        if (!reportType || reportType === '') {
            reportType = 'O'
        };
        $('input[name=SBStype][value=' + reportType + ']').prop('checked',true);

        $('input[name=SBS_dateRange][value="' + arr[1] + '"]').prop('checked', true);
        
        $('#SBSrange').val(arr[2]);
        
        $('#SBS_startDate').val(arr[3]);
        
        $('#SBS_endDate').val(arr[4]);

        setDOHdateSpan('sbs');

    } else {
        if (dateRange === '2' && ($('#SBS_startDate').val() === '' || $('#SBS_endDate').val() === '')) {
            swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
            return;
        };

        arr.push( reportType );
        arr.push( dateRange );
        arr.push( $('#SBSrange').val() );
        arr.push( $('#SBS_startDate').val() );
        arr.push( $('#SBS_endDate').val() );
    };

    $("#SBS_products").find('*').prop("disabled", true);
    $("#SBS_dates").find('*').prop("disabled", true);
    $("#SBSDivTitle").toggle(true);

    $.post('getDateData("' + arr[1] + '","' + arr[2] + '","' + arr[3] + '","' + arr[4] + '","")', '', function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];

            if (cstart === cend) {
                $("#SBSDivTitle").append("<br><span style='font-size: 14px;'>" + cstart + "</span>");
            } else {
                $("#SBSDivTitle").append("<br><span style='font-size: 14px;'>" + cstart + ' - ' + cend + "</span>");
            }
        };
    });

    $.post( 'getSBSReport?', {
            reportType: arr[0],
            cDateType: arr[1],
            cDateRange: arr[2],
            cStartDate: arr[3],
            cEndDate: arr[4]
        },
        function(json) {
            var dORt = ((reportType==='D') ? "Department" : ( (reportType==='T') ? "Product Type" : "Customer Type" ) );
            var nLen;

            if (json.error) {
                swal('Error', json.error, 'error');
                $("#SBS_select").toggle(true);
                $("#SBS_waitp").toggle(true);
                $("#SBStablewrapper").toggle(false);
                $("#SBSDivTitle").toggle(false);
                $("#SBSDivTitle").text('Sales by Station');
                if (activeTab==='saved') {
                    closeSBS();
                }
                return;
            }
            //----- build header and footer
            if (reportType==='O'){
                $("#SBS_hdr").html( "<tr><th>Station</th><th>Sales ($)</th></tr>" );
                nLen = json.data.length
                $("#SBStablediv").css({"width": "800px"});
            } else {
                var cHdr = "<tr><th>" + dORt + "</th>";
                json.stations.forEach( function(val,idx,a) { 
                    cHdr += '<th>Sta. ' + val + '</th>';
                } );
                cHdr += '<th>Total</th></tr>';

                $("#SBS_hdr").html( cHdr );
                nLen = json.data.length
            }
            $("#SBS_hdr").toggle(true);
            $("#SBS_newset").toggle(true);
            $("#SBS_cancel").prop("value", "Done");
        
            SBStable = $('#SBStable').DataTable({
                responsive: false,
                ordering: false,
                scrollX: true,
                dom: 'Brt',
                pageLength: nLen,
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
                        title: 'Sales by Station Report ' + todayString()
                    },
                    {
                        extend: 'pdf',
                        text:   svgPdf,
                        titleAttr: '  PDF File  ',
                        message: '__MESSAGE__',
                        orientation: 'landscape',
                        title: 'Sales by Station Report ' + todayString(),
                        exportOptions: {
                            columns: ':visible'
                        },
                        header: true,
                        customize: function (doc) {
                            doc.content.forEach(function (content) {
                                if (content.style == 'message') {
                                    content.text = 'Sales by Station Report ' + cstart + ' - ' + cend;
                                }
                            })
                        }
                    },
                    {
                        extend: 'print',
                        text: svgPrint,
                        titleAttr: '  Print  ',
                        orientation: 'landscape',
                        title: 'Sales by Station Report <br>' + cstart + ' - ' + cend,
                        customize: function (window) {
                            $(window.document.body)
                                .css({'font-size': '12px', 'font-family': 'verdana, sans-serif', 'background-color': 'white'});
        
                            $(window.document.body).find('h1')
                                .css({'font-size': '16px', 'text-align': 'center'});

                            $(window.document.body).find('table')
                                .addClass('compact')
                                .css({'font-size': '12px', 'border': '2px solid', 'width': '600px'});
        
                            $(window.document.body).find('table tr th:first-child')
                                .css({'text-align': 'left'});
        
                            $(window.document.body).find('table tr th:not(:first-child)')
                                .css({'text-align': 'right'});
        
                            $(window.document.body).find('table tr td:first-child')
                                .css({'text-align': 'left'});
        
                            $(window.document.body).find('table tr td:not(:first-child)')
                                .css({'text-align': 'right'});
        
                            window.document.close();
                            window.onafterprint = function(event) {  window.close(); };                        
                            window.print();                       
                        }
                    },
                    {
                        text: svgRemember,
                        titleAttr: '  Save Settings  ',
                        action: function (e, dt, node, config) {
                            saveSBSReport(arr);
                        }
                    },
                    {
                        text: svgClose,
                        titleAttr: '  Close  ',
                        action: function (e, dt, node, config) {
                            $("#SBS_select").toggle(true);
                            $("#SBS_waitp").toggle(true);
                            $("#SBStablewrapper").toggle(false);
                            $("#SBSDivTitle").toggle(false);
                            $("#SBSDivTitle").text('Sales by Station');
                            $("#SBStablediv").css({"width": ""});
                            if (activeTab==='saved') {
                                closeSBS();
                            }
                        }
                    }
                ],
                data: json.data,
                "language": {
                    "loadingRecords": "Please wait - loading data..."
                },
                "fnDrawCallback": function () {
                    $("#SBS_select").toggle(false);
                    $("#SBS_waitp").toggle(false);
                    $("#SBStablewrapper").toggle(true);
                    $("#SBS_cancel").toggle(true);
                    $("#SBS_newset").toggle(true);
                    $('.dataTables_length').css('padding-top', '0.755em');
                    $('.dataTables_length').css('padding-left', '0.755em');
                    if (ntimes < 1) {
                        $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                    };
                    ntimes++;
                },
                initComplete: function () {
                    if ( ! $('#SBStable').DataTable().data().any() || lSaved ) {
                        $('#SBStable').DataTable().button(4).disable();   // don't allow report save on empty table or if already saved!!
                    }
                    $.spin('false');    
                }
            });
    });
}

function saveSBSReport(arr, colArr) {
    vex.dialog.prompt({
        message: 'Please enter report description...',
        placeholder: 'Report Description',
        callback: function (value) {
            if (value) {
                var savedArray = localStorage.getItem("SBSSaved");
                var newArray = [];
                if (savedArray) {
                    newArray = JSON.parse(savedArray)
                    var found = newArray.findIndex(function(entry) {
                        return entry.description === value;
                    });
                    if (found>-1) {
                        vex.dialog.alert({
                            message: 'A report with that description is already saved. Please try again.'
                        })
                        return;
                    }
                }
                var saveDate = new Date().toJSON().slice(0, 10)
                newArray.push( { "description": value, "data": arr, "dateSaved": saveDate, "colVis": colArr } );
                localStorage.setItem("SBSSaved",JSON.stringify(newArray));
                buildShortCutTab(true);
            }
        }
    })    
}

function getSavedSBSReport() {
    var savedArray = localStorage.getItem("SBSSaved");

    if (savedArray) {
        var array = JSON.parse( savedArray );
        var opt = '';
        var val;
        $.each(array, function (idx, item) {
            val = '["'
            $.each(array[idx].data, function (num,parm) {
                val += parm + '","';
            });
            val += array[idx].dateSaved + '"]'
            opt += "<option value='" + val + "'>" + array[idx].description + '</option>';
        });
        vex.dialog.open({
            message: 'Select saved report...',
            input: [
                '<div class="vex-custom-field-wrapper">',
                    '<div class="vex-custom-input-wrapper">',
                        '<select id="reportSelect" name="url" >' + opt + '</select>',
                    '</div>',
                '</div>'
            ].join(''),
            className: 'vex-theme-multiButtons',
            buttons: [
                vex.dialog.buttons.YES,
                vex.dialog.buttons.NO,
                $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-caution', text: 'Delete', click: function(e) {
                    var report = $("#reportSelect option:selected").text();
                    this.value = { 'description': 'delete', 'select': report };
                    this.close();
                }})
            ],
            callback: function (value) {
                if (!value) {
                    return;
                } else if (value.description === 'delete'){
                    return deleteSavedSBSReport(value.select);
                } else {
                    var nuData = JSON.parse( value.url );
                    if (nuData[1] === '2') {
                        vex.dialog.open({
                            message: 'Select start and end dates...',
                            input: [
                                '<div class="vex-custom-field-wrapper">',
                                    '<label for="startDate">Date</label>',
                                    '<div class="vex-custom-input-wrapper">',
                                        '<input name="startDate" type="date" value="' + convertDateStr( nuData[3] ) + '" />',
                                    '</div>',
                                '</div>',
                                '<div class="vex-custom-field-wrapper">',
                                    '<label for="endDate">Date</label>',
                                    '<div class="vex-custom-input-wrapper">',
                                        '<input name="endDate" type="date" value="' + convertDateStr( nuData[4] ) + '" />',
                                    '</div>',
                                '</div>'
                            ].join(''),
                            callback: function (data) {
                                if (!data) {
                                    return;
                                }
                                nuData[3] = convertDateStr( data.startDate );
                                nuData[4] = convertDateStr( data.endDate );
                                resetSBSreport();
                                getSBSreport( nuData );
                            }
                        })
                    } else {
                        resetSBSreport();
                        getSBSreport( nuData );
                    }
                }
            }
        })
    }
}

function deleteSavedSBSReport( cReport ) {
    vex.dialog.confirm({
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' +
                        'Are you sure you want to delete the report:<br><br><i>' + cReport + '</i> ?',
        className: 'vex-theme-multiButtons',
        callback: function (value) {
            if (value) {
                var savedArray = localStorage.getItem("SBSSaved");
                if (savedArray) {
                    var array = JSON.parse( savedArray );
                    var found = array.findIndex(function(entry) {
                        return entry.description === cReport;
                    });
                    if (found>-1) {
                        array.splice(found,1);
                        if (array.length > 0) {
                            localStorage.setItem("SBSSaved",JSON.stringify(array));
                        } else {
                            localStorage.removeItem("SBSSaved");
                        }
                        buildShortCutTab();
                        vex.dialog.alert({
                            message: 'Your report has been deleted.'
                        })
                    } else {
                        vex.dialog.alert({
                            message: 'Unable to delete your report.'
                        })
                    }
                }
            }
        }
    })    
}
// END Sales by Station

function showTaxExReport() {
    var dateRange = $('input[name=TaxEx_dateRange]:checked').val();

    $("#TaxEx_hdr").toggle(false);
    $("#TaxExtablewrapper").toggle(false);

    if (dateRange === '1') {
        TaxExStandardDate();
    } else {
        TaxExCustomDate();
    };

    $('#TaxEx_box .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    $("nav").css('z-index', -1);
    $("#tab_rept").toggle(false);
    $("#Modal_TaxEx").toggle(true);
}

function closeTaxEx() {
    var modalTaxEx = document.getElementById("Modal_TaxEx");
    var wait = $('#TaxEx_waitp');
    var isVisible = wait.is(':visible');

    $("#TaxEx_box").find('*').prop("disabled", false);
    $("#TaxEx_box2").find('*').prop("disabled", false);

    if (!isVisible) {
        TaxExtable.clear().destroy(false);
        $('#TaxEx_waitp').toggle(true);
        $("#TaxEx_hdr").toggle(false);
        $("#TaxExtablewrapper").toggle(false);
    };

    $("#TaxEx_submit").toggle(true);
    $("#TaxEx_cancel").prop("value", "Cancel");
    $("#TaxEx_cancel").css("margin-right", "10px");

    $("#TaxEx_date_last").prop("disabled", false);
    $("#TaxEx_date_custom").prop("disabled", false);
    $("#TaxExRange").prop("disabled", false);
    $("#TaxEx_startDate").prop("disabled", false);
    $("#TaxEx_endDate").prop("disabled", false);

    $("nav").css('z-index', 999);
    modalTaxEx.style.display = "none";
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function TaxExCustomDate() {
    document.getElementById("TaxExRange").disabled = true;
    document.getElementById("TaxEx_startDate").disabled = false;
    document.getElementById("TaxEx_endDate").disabled = false;
}

function TaxExStandardDate() {
    $('#TaxEx_startDate').val('');
    $('#TaxEx_endDate').val('');
    document.getElementById("TaxEx_startDate").disabled = true;
    document.getElementById("TaxEx_endDate").disabled = true;
    document.getElementById("TaxExRange").disabled = false;
}

function getTaxExReport() {
    var arr = [];
    var dateRange = $('input[name=TaxEx_dateRange]:checked').val();
    var table = $("#TaxExtable");
    var thdr = document.getElementById("TaxEx_hdr");
    var cstart = '';
    var cend = '';
    var cnbr = '';
    var cTaxType = '';
    var cTaxText = '';
    var ntimes = 0;

    $("#TaxEx_submit").toggle(false);
    $("#TaxEx_cancel").toggle(false);

    $('.selectTaxExrange').children().prop("disabled", true);

    if (dateRange === '2' && ($('#TaxEx_startDate').val() === '' || $('#TaxEx_endDate').val() === '')) {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
    };

    arr.push('"' + dateRange + '"');
    arr.push('"' + $('#TaxExRange').val() + '"');
    arr.push('"' + $('#TaxEx_startDate').val() + '"');
    arr.push('"' + $('#TaxEx_endDate').val() + '"');

    if (arr[0] === '"< ANY >"') {
        arr[0] = '""'
    };

    if (arr[1] === '"< ANY >"') {
        arr[1] = '""'
    };

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];
        };
    });

    cTaxType = $('#TaxExTaxType').val()
    cTaxText = $("#TaxExTaxType option:selected").text()

    $("#TaxEx_box").find('*').prop("disabled", true);
    $("#TaxEx_box2").find('*').prop("disabled", true);

    $("#TaxEx_col1").text("Invoice");
    $("#TaxEx_col2").text("Date");
    $("#TaxEx_col3").text("Total $");
    $("#TaxEx_col4").text("Company");
    $("#TaxEx_col5").text("Name");
    $("#TaxEx_col6").text("Address");
    $("#TaxEx_col7").text("City");
    $("#TaxEx_col8").text("ST");
    $("#TaxEx_col9").text("Zip");

    $("#TaxEx_hdr").toggle(true);

    TaxExtable = $('#TaxExtable').DataTable({
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
                title: 'Tax-Exempt Report ' + todayString()
            },    
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'landscape',
                title: 'Tax-Exempt Report',
                header: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'History Start: ' + cstart + '\n' +
                                'History End: ' + cend + '\n' +
                                'Tax Type: ' + cTaxText + '\n' +
                                'Report run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Tax-Exempt Report ' + todayString(),
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(3n) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'History Start: ' + cstart + '<br>' +
                        'History End: ' + cend + '<br>' +
                        'Tax Type: ' + cTaxText);

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        ajax: "TaxEx_Report(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ",'" + cTaxType + "')",
        "columns": [
            { "width": "7%" },
            { "width": "7%" },
            { "width": "9%" },
            { "width": "20%" },
            { "width": "16%" },
            { "width": "16%" },
            { "width": "15%" },
            { "width": "5%" },
            { "width": "5%" },
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [2] },
            { className: 'numericCol', targets: [2] }
        ],
        order: [[0, 'asc']],
        "fnDrawCallback": function () {
            $("#TaxEx_waitp").toggle(false);
            $("#TaxExtablewrapper").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        }
    });

    $("#TaxEx_cancel").prop("value", "Done");
    $("#TaxEx_cancel").css("margin-right", "20px");
    $("#TaxEx_cancel").toggle(true);
}

function showCusGMReport() {
    var dateRange = $('input[name=CusGM_dateRange]:checked').val();

    $("#CusGM_hdr").toggle(false);
    $("#CusGMtablewrapper").toggle(false);

    $("#CusGMTopSort").on('change', function () { $("#CusGMTop").prop('checked', true) });
    $("#CusGMdept").on('change', function () { $("#CusGMdeptSelect").prop('checked', true) });

    if (dateRange === '1') {
        CusGMstandardDate();
        setCusGMdateSpan();
    } else {
        CusGMcustomDate();
    };

    getCusTypes("cusGMtyplen");

    getInvDepts('CusGMdept');

    $('#CusGM_DateBox .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    $("nav").css('z-index', -1);
    $("#Modal_CusGM").toggle(true);
    $("#tab_rept").toggle(false);
    $("#tab_saved").toggle(false);
}

function CusGMcustomDate() {
    document.getElementById("CusGMrange").disabled = true;
    document.getElementById("CusGM_startDate").disabled = false;
    document.getElementById("CusGM_endDate").disabled = false;
}

function CusGMstandardDate() {
    $('#CusGM_startDate').val('');
    $('#CusGM_endDate').val('');
    document.getElementById("CusGM_startDate").disabled = true;
    document.getElementById("CusGM_endDate").disabled = true;
    document.getElementById("CusGMrange").disabled = false;
}

function CusGMtoggleDeptType() {
    var el = document.getElementById('CusGMdepttype');
    var cSel = el.options[el.selectedIndex].value;
    $('#CusGMdept')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="       ">&#60; ANY &#62;</option>');
    if (cSel === "dept") {
        getInvDepts('CusGMdept');
    } else {
        getInvTypes('CusGMdept');
    };
    $('#CusGMdept').toggle(true);
}

function closeCusGM() {
    var modalCusGM = document.getElementById("Modal_CusGM");
    var wait = $('#CusGM_waitp');
    var isVisible = wait.is(':visible');

    if (!isVisible) {
        CusGMtable.clear().destroy(false);
        $('#CusGM_waitp').toggle(true);
        $("#CusGM_hdr").toggle(false);
        $("#CusGMtablewrapper").toggle(false);
    };

    if (typeof custListDataTable !== 'undefined') {
        custListDataTable.rows({ selected: true }).deselect();
    };
    $("#cusGMcusPickLen").text('0 customers picked.');

    $("#CusGM_submit").toggle(true);
    $("#CusGM_cancel").prop("value", "Cancel");
    $("#CusGM_cancel").css("margin-right", "10px");
    $("#CusGM_newset").toggle(false);

    $("#CusGM_Box1").find('*').prop('disabled', false);
    $("#CusGM_DateBox").find('*').prop('disabled', false);

    $("#CusGM_date_last").prop("disabled", false);
    $("#CusGM_date_custom").prop("disabled", false);
    $("#CusGMrange").prop("disabled", false);
    $("#CusGM_startDate").prop("disabled", false);
    $("#CusGM_endDate").prop("disabled", false);

    $("#CusGMDivTitle").text('Customer Profitability');
    aCusGMCusts = [];
    aCusGMData = [];
    nCusGMCounter = 0;

    $("nav").css('z-index', 999);
    modalCusGM.style.display = "none";
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
    
}

function showCustList(el) {
    var modal = document.getElementById("Modal_custList");

    $("#custListTableWrapper").hide();

    $("#Modal_custList_close").click(function () {
        closeCustListModal(el);
    });

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            closeCustListModal(el);
        }
    });

    $("#Modal_custList").css("z-index", 99999);
    $("#Modal_custList").show();

    if (typeof custListDataTable === 'undefined') {
        setTimeout(buildCustListTable, 500);
    } else if (Date.now() - lastCustTableUpdate > 120000) {
        custListDataTable.destroy(false);
        setTimeout(buildCustListTable, 500);
    } else {
        $("#custListTableWrapper").show();
    };
}

function buildCustListTable() {
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("custListLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $("#custListTableWrapper").show();

    lastCustTableUpdate = Date.now();

    custListDataTable = $('#custListTable').DataTable({
        dom: 'ifrtlp',
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
        ajax: "getCustList?",
        columnDefs: [
            { type: 'num', targets: 0 },
            { className: 'numericCol', targets: 0 },
            { className: 'dt-left', targets: 1 }
        ],
        select: {
            style: 'multi'
        },
        "deferRender": true,
        order: [[1, 'asc']],
    });

    $('#custListTable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("custListLength", len);
        }
    });
}

function closeCustListModal(el) {
    var rows = custListDataTable.rows({ selected: true }).count();
    var cSelect = rows.toString() + " customers picked.";
    if (rows === 1) {
        cSelect = cSelect.replace("customers", "customer");
    }

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            return;
        }
    });

    $("#"+el).text(cSelect);
    $("#Modal_custList").css("z-index", -1);
    $("#Modal_custList").hide();
}

function setCusGMdateSpan() {
    var dateRange = $('input[name=CusGM_dateRange]:checked').val();
    var arr = [];
    var cstart;
    var cend;

    arr.push('"' + dateRange + '"');
    arr.push('"' + $('#CusGMrange').val() + '"');
    arr.push('"' + $('#CusGM_startDate').val() + '"');
    arr.push('"' + $('#CusGM_endDate').val() + '"');

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            document.getElementById('CusGM_date_span').innerHTML = cstart + ' -- ' + cend;
        };
    });
}

function resetCusGMreport(lFromTable) {
    if ($.fn.dataTable.isDataTable("#CusGMtable")) {
        CusGMtable.clear().destroy(false);
    }
    $('#CusGM_waitp').toggle(true);
    $("#CusGM_hdr").toggle(false);
    $("#CusGM_ftr").toggle(false);
    $("#CusGMtablewrapper").toggle(false);
    $("#CusGMDivTitle").toggle(false);

    $("#CusGM_submit").toggle(true);
    $("#CusGM_newset").toggle(false);
    //    $("#CusGM_cancel").prop("value", "Cancel");

    $("#CusGM_Box1").find('*').prop('disabled', false);
    $("#CusGM_DateBox").find('*').prop('disabled', false);

    if (typeof custListDataTable !== 'undefined') {
        custListDataTable.rows({ selected: true }).deselect();
    };
    $("#cusGMcusPickLen").text('0 customers picked.');
    $("#CusGMDivTitle").text('Customer Profitability');

    aCusGMCusts = [];
    aCusGMData = [];
    nCusGMCounter = 0;

}

function CusGM_NextCust(nChg) {
    switch (nChg) {
        case 1:
            if (nCusGMCounter < aCusGMCusts.length - 1) {
                nCusGMCounter++
                $('#CusGM_BrowseButtons').html("&nbsp;" + (nCusGMCounter + 1).toString() + " of " + aCusGMCusts.length.toString() + "&nbsp");
                $("#CusGM_hdr0").text(aCusGMCusts[nCusGMCounter]);
                CusGMtable.clear().draw();
                CusGMtable.rows.add(aCusGMData[nCusGMCounter]); // Add new data
                CusGMtable.columns.adjust().draw();             // Redraw the DataTable                            
            }
            break;

        case -1:
            if (nCusGMCounter > 0) {
                nCusGMCounter--
                $('#CusGM_BrowseButtons').html("&nbsp;" + (nCusGMCounter + 1).toString() + " of " + aCusGMCusts.length.toString() + "&nbsp");
                $("#CusGM_hdr0").text(aCusGMCusts[nCusGMCounter]);
                CusGMtable.clear().draw();
                CusGMtable.rows.add(aCusGMData[nCusGMCounter]); // Add new data
                CusGMtable.columns.adjust().draw();             // Redraw the DataTable                            
            }
            break;
    }
}

function getCusGMreport( aData ) {
    var cCusSelect = $('input[name=CusGMselect]:checked').val();
    var cDeptSelect = $('input[name=CusGMdeptSelect]:checked').val();
    var cDateSelect = $('input[name=CusGM_dateRange]:checked').val();
    var aCNs = [];
    var aCusTypNums = [];
    var cSalesper = $('#CusGMSalesper').val();
    var cTopNbr = $('#CusGMTopNbr').val();
    var cTopSort = $('#CusGMTopSort').val();
    var cdort = $('#CusGMdepttype').val();
    var cDept = "";
    var cDateRange = $('#CusGMrange').val();
    var cStartDate = $('#CusGM_startDate').val();
    var cEndDate = $('#CusGM_endDate').val();
    var ntimes = 0;
    var nOrd = 4;
    var aChartData = [];
    var cstart = '';
    var cend = '';
    var cSubTitle = '';
    var lSaved = false;

    $("#CusGM_Box1").find('*').prop('disabled', true);
    $("#CusGM_DateBox").find('*').prop('disabled', true);

    if (!aData) {
        switch (cCusSelect) {

            case "1":
                if (typeof custListDataTable === 'undefined' ||
                    custListDataTable.rows({ selected: true }).count() === 0) {
                    swal('Error', "Please select the customer(s) to report on.", 'error');
                    return;

                } else {
                    var selectedRows = custListDataTable.rows({ selected: true }).data();
                    $.each(selectedRows, function (key, row) {
                        aCNs.push(row[0]);
                        aCusGMCusts.push(row[1]);
                    });

                };
                break;
            /*
                               case "2":
                                   var acTypIdxs = getCusTypesSelected();
                                   var ccTypNums;
                                   var nIdx;
            
                                   if ( acTypIdxs.length < 1 ) {
                                        swal( 'Error', "Please select the customer type(s) to report on.", 'error');
                                        return;
                                        
                                   } else {
                                       for (i=0; i < acTypIdxs.length; i++) {
                                           nIdx = acTypIdxs[i];
                                           aCusTypNums.push( aCusTypes[nIdx][1]);
                                       };
                                   }
                                   break;   */
        }
    }

    if (cDeptSelect) {
        cDept = getInvTypeSelected('CusGMdept');
    }

    if (aData) {
        lSaved      = true;  // flag to disable remember button since it's already saved
        cCusSelect  = aData[0];
        aCNs        = aData[1];
        aCusTypNums = aData[2];
        cSalesper   = aData[3];
        cTopNbr     = aData[4];
        cTopSort    = aData[5];
        cDeptSelect = aData[6];
        cdort       = aData[7];
        cDept       = aData[8];
        cDateSelect = aData[9];
        cDateRange  = aData[10];
        cStartDate  = aData[11];
        cEndDate    = aData[12];
        aCusGMCusts = aData[13];
    }

    if (cCusSelect === '3' && cTopSort === '1') {
        nOrd = 1;
    };

    $("#CusGM_select").toggle(false);
    $("#CusGMDivTitle").toggle(true);
    
    $("#CusGM_waitp").html('<img src="images/spinner.gif" alt="Procesing..." style="width:128px;height:128px;" />');
    $("#CusGM_submit").toggle(false);
    $("#CusGM_cancel").toggle(false);

    $.post("getDateData('" + cDateSelect + "','" + cDateRange + "','" + cStartDate + "','" + cEndDate + "')", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            if (cCusSelect === '3') {
                cSubTitle = 'Top ' + cTopNbr + ': ' + cstart + ' - ' + cend;
            } else {
                cSubTitle = cstart + ' - ' + cend;
            }
        };
    });

    $.post("CusGM_Report?",
        {
            cCusSelect: cCusSelect,
            aCNs: JSON.stringify(aCNs),
            aCusTypes: JSON.stringify(aCusTypNums),
            cSalesper: cSalesper,
            cTopNbr: cTopNbr,
            cTopSort: cTopSort,
            cDeptSelect: cDeptSelect,
            cDorT: cdort,
            cDept: cDept,
            cDateSelect: cDateSelect,
            cDateRange: cDateRange,
            cStartDate: cStartDate,
            cEndDate: cEndDate
        },
        function (data, status) {
            var aPageLen = [10, 20, 30, 50, 100];
            var nLen = localStorage.getItem("CusGMReportLength");
            if (!nLen) {
                nLen = 20;
            } else if ($.type(nLen) === 'string') {
                nLen = parseInt(nLen);
            };
        
            if (cCusSelect === '1' && cDeptSelect === '1') {
                $("#CusGM_hdr0").text(aCusGMCusts[0]);
                aChartData = data[0];
                aCusGMData = data;
                nCusGMCounter = 0;
                if (aCusGMCusts.length > 1) {
                    $("#CusGMDivTitle").append("<br><input type='button' id='CusGM_prev' class='pAbuttonGrn' value='< Prev' onclick='CusGM_NextCust(-1)' />" +
                        "<span id='CusGM_BrowseButtons'>&nbsp;1 of " + aCusGMCusts.length.toString() + "&nbsp;</span>" +
                        "<input type='button' id='CusGM_next' class='pAbuttonGrn' value='Next >' onclick='CusGM_NextCust(1)' />");

                }
            } else {
                $("#CusGM_hdr0").text('Customer');
                aChartData = data;
                if (cCusSelect === '1') {
                    cSubTitle = cdort + ':' + $("#CusGMdept option:selected").text();
                };
                $("#CusGMDivTitle").append("<br><span style='font-size: 14px;'>" + cSubTitle + "</span>");
            };

            CusGMtable = $('#CusGMtable').DataTable({
                lengthChange: true,
                lengthMenu: aPageLen,
                pageLength: nLen,
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
                        title: 'Customer Profitability ' + todayString()
                    },            
                    {
                        extend: 'pdf',
                        text:   svgPdf,
                        titleAttr: '  PDF File  ',
                        orientation: 'portrait',
                        title: 'Customer Profitability',
                        header: true,
                        footer: true,
                        exportOptions: {
                            columns: [0,1,2,3,4,5]
                        },
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
                        title: 'Customer Profitability',
                        footer: true,
                        exportOptions: {
                            columns: [0,1,2,3,4,5]
                        },
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
                    },
                    {
                        text: svgRemember,
                        titleAttr: '  Save Settings  ',
                        action: function (e, dt, node, config) {
                            var arr = [
                                cCusSelect,
                                aCNs,
                                aCusTypNums,
                                cSalesper,
                                cTopNbr,
                                cTopSort,
                                cDeptSelect,
                                cdort,
                                cDept,
                                cDateSelect,
                                cDateRange,
                                cStartDate,
                                cEndDate,
                                aCusGMCusts
                            ]
                            saveCusGMReport(arr);
                        }
                    },
                    {
                        text: svgClose,
                        titleAttr: '  Close  ',
                        action: function (e, dt, node, config) {
                            if (activeTab==='saved') {
                                closeCusGM();
                            } else {
                                $('#CusGM_select').toggle( true );
                                resetCusGMreport( true );
                            }
                        }
                    }    
                ],
                data: aChartData,
                select: false,
                columnDefs: [
                    { type: 'num-fmt', targets: [1, 2, 3, 4, 5] },
                    { className: 'numericCol', targets: [1, 2, 3, 4, 5] },
                    { targets: [6,7,8,9,10,11], visible: false, searchable: false, orderable: false }
                ],
                order: [[nOrd, 'desc']],
                "footerCallback": function (tfoot, data, start, end, display) {
                    var api = this.api();
                    var sales = 0;
                    var margin = 0;

                    // Remove the formatting to get integer data for summation
                    var intVal = function (i) {
                        return typeof i === 'string' ?
                            i.replace(/[\$,]/g, '') * 1 :
                            typeof i === 'number' ?
                                i : 0;
                    };

                    $(api.column(1).footer()).html(
                        api.column(1).data().reduce(function (a, b) {
                            return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                        }, 0)
                    );
                    $(api.column(2).footer()).html(
                        api.column(2).data().reduce(function (a, b) {
                            return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                        }, 0)
                    );
                    $(api.column(3).footer()).html(
                        api.column(3).data().reduce(function (a, b) {
                            return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                        }, 0)
                    );
                    $(api.column(4).footer()).html(
                        api.column(4).data().reduce(function (a, b) {
                            return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                        }, 0)
                    );

                    sales = intVal($(api.column(3).footer()).text());
                    margin = intVal($(api.column(4).footer()).text());

                    $(api.column(5).footer()).html(
                        ((margin / sales) * 100).toFixed(1) + ' %'
                    );
                },
                "fnDrawCallback": function () {
                    $('#CusGM_select').toggle(false);
                    $("#CusGM_waitp").toggle(false);
                    $("#CusGM_waitp").html('Data View');;
                    $("#CusGMtablewrapper").toggle(true);
                    $("#CusGM_hdr").toggle(true);
                    $("#CusGM_ftr").toggle(true);
                    $("#CusGMDivTitle").toggle(true);
                    $("#CusGM_cancel").prop('value', 'Done');
                    $("#CusGM_cancel").toggle(true);
                    $("#CusGM_newset").toggle(true);
                    $('.dataTables_length').css('padding-top', '0.755em');
                    $('.dataTables_length').css('padding-left', '0.755em');
                    if (ntimes < 1) {
                        $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                    };
                    ntimes++;
                },
                initComplete: function () {
                    if ( ! $('#CusGMtable').DataTable().data().any() || lSaved ) {
                        $('#CusGMtable').DataTable().button(4).disable();   // don't allow report save on empty table or if already saved!!
                    }
                }
        
            });
        });

        $('#CusGMtable').on('length.dt', function (e, settings, len) {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("CusGMReportLength", len);
            }
        });    
}

function saveCusGMReport(arr) {
    vex.dialog.prompt({
        message: 'Please enter report description...',
        placeholder: 'Report Description',
        callback: function (value) {
            if (value) {
                var savedArray = localStorage.getItem("cusGMSaved");
                var newArray = [];
                if (savedArray) {
                    newArray = JSON.parse(savedArray)
                    var found = newArray.findIndex(function(entry) {
                        return entry.description === value;
                    });
                    if (found>-1) {
                        vex.dialog.alert({
                            message: 'A report with that description is already saved. Please try again.'
                        })
                        return;
                    }
                }
                var saveDate = new Date().toJSON().slice(0, 10)
                newArray.push( { "description": value, "data": arr, "dateSaved": saveDate } );
                localStorage.setItem("cusGMSaved",JSON.stringify(newArray));
                buildShortCutTab(true);
            }
        }
    })    
}

// BEGIN FREQ BUYER LOG ////////////
function showFreqLog() {
    var dateRange = $('input[name=freqLog_dateRange]:checked').val();

    $.post("frequentGetSettings( 'true' )", "", function (data) {
        pub_RemoteDo = data.remoteDo;
        if (!pub_RemoteDo) {
            $('#freqLogStoresDiv').toggle(false);
        } else {
            $('#freqLogStoresDiv').toggle(true);
        };

        if (data.stores.length > 0) {
            $('#freqLogStore').children().remove();
            for (var i = 0; i < data.stores.length; i++) {
                var opt = data.stores[i];
                var val = opt.slice(-7);
                $('#freqLogStore').append('<option value='+val+'>'+opt+'</option>');
            };
            $('#freqLogStore').change( function(data){$('#freqLogStoreSelector').prop('checked',true); $('#freqLogStoresAll').prop('checked',false);});
        };
    });

    if (dateRange === '1') {
        FreqLogStandardDate();
    } else {
        FreqLogCustomDate();
    };

    $("#freqLog_hdr").toggle(false);
    $("#freqLogtablewrapper").toggle(false);

    $('#freqLog_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    $("nav").css('z-index', -1);
    $("#Modal_FreqLog").toggle(true);
    $("#tab_rept").toggle(false);
}

function FreqLogCustomDate() {
    $("#freqLogRange").prop('disabled',true);
    $("#freqLog_startDate").prop('disabled',false);
    $("#freqLog_endDate").prop('disabled',false);
}

function FreqLogStandardDate() {
    $('#freqLog_startDate').val('');
    $('#freqLog_endDate').val('');
    $("#freqLog_startDate").prop('disabled',true);
    $("#freqLog_endDate").prop('disabled',true);
    $("#freqLogRange").prop('disabled',false);
}

function closeFreqLog() {
    var modalfreqLog = document.getElementById("Modal_FreqLog");
    var wait = $('#freqLog_waitp');
    var isVisible = wait.is(':visible');

    if (!isVisible) {
        freqLogtable.clear().destroy(false);
        $('#freqLog_waitp').toggle(true);
        $("#freqLog_hdr").toggle(false);
        $("#freqLogtablewrapper").toggle(false);
    };

    if (typeof custListDataTable !== 'undefined') {
        custListDataTable.rows({ selected: true }).deselect();
    };
    $("#freqLogcusPickLen").text('0 customers picked.');

    $("#freqLog_submit").toggle(true);
    $("#freqLog_cancel").prop("value", "Cancel");
    $("#freqLog_cancel").css("margin-right", "10px");
    $("#freqLog_newset").toggle(false);

    $("#freqLog_Box1").find('*').prop('disabled', false);
    $("#freqLog_DateBox").find('*').prop('disabled', false);

    $("#freqLog_date_last").prop("disabled", false);
    $("#freqLog_date_custom").prop("disabled", false);
    $("#freqLogrange").prop("disabled", false);
    $("#freqLog_startDate").prop("disabled", false);
    $("#freqLog_endDate").prop("disabled", false);

    $("#freqLogDivTitle").text('Frequent Buyer Points Log');

    $("nav").css('z-index', 999);
    modalfreqLog.style.display = "none";
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function resetFreqLog() {
    $('#freqLogClose').toggle(false);
    $('#freqLog_select').toggle( true );
    
    freqLogtable.destroy(false);
    $('#freqLog_waitp').toggle(true);
    $("#freqLog_hdr").toggle(false);
    $("#freqLog_ftr").toggle(false);
    $("#freqLogtablewrapper").toggle(false);
    $("#freqLogDivTitle").toggle(false);

    $("#freqLog_submit").toggle(true);
    $("#freqLog_newset").toggle(false);

    $("#freqLog_Box1").find('*').prop('disabled', false);
    $("#freqLog_DateBox").find('*').prop('disabled', false);

    if (typeof custListDataTable !== 'undefined') {
        custListDataTable.rows({ selected: true }).deselect();
    };
    $("#freqLogcusPickLen").text('0 customers picked.');
    $("#freqLogDivTitle").text('Customer Profitability');

    afreqLogCusts = [];
    afreqLogData = [];
    nfreqLogCounter = 0;
}

function getFreqLog() {
    var dateRange = $('input[name=freqLog_dateRange]:checked').val();
    var cCusSelect = $('input[name=freqLogselect]:checked').val();
    var cDateSelect = $('input[name=freqLog_dateRange]:checked').val();
    var cStoreSelect = $('input[name=freqLogStoreSelect]:checked').val();
    var cStore = $('#freqLogStore').val();
    var aCNs = [];
    var aCusts = [];
    var cDateRange = $('#freqLogRange').val();
    var cStartDate = $('#freqLog_startDate').val();
    var cEndDate = $('#freqLog_endDate').val();
    var cstart = '';
    var cend = '';
    var cSubTitle = '';
    var nLenCN = 0;
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("freqLogLength");
    var aCols
    var nHdrs
    var aNumCols = [0,1,2,8,9,10,11];

    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };

    switch (cCusSelect) {
        case "2":
            if (typeof custListDataTable === 'undefined' ||
                custListDataTable.rows({ selected: true }).count() === 0) {
                swal('Error', "Please select the customer(s) to report on.", 'error');
                return;
            } else {
                var selectedRows = custListDataTable.rows({ selected: true }).data();
                $.each(selectedRows, function (key, row) {
                    aCNs.push(row[0]);
                    aCusts.push(row[1]);
                });
                nLenCN = aCNs.length
            };
        break;
    }

    $('#freqLogClose').toggle(true);
    $('#freqLog_select').toggle( false );    
    $("#freqLog_waitp").html('<img src="images/spinner.gif" alt="Procesing..." style="width:128px;height:128px;" />');

    $.post("getDateData('" + cDateSelect + "','" + cDateRange + "','" + cStartDate + "','" + cEndDate + "')", "", function (data, status) {
        if (cCusSelect==='2') {
            $.each(aCNs, function(idx,val) {
                cSubTitle += aCNs[idx] + ': ' + aCusts[idx] + ((idx<nLenCN-1) ? ' || ':'<br>')
            })
        }
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cSubTitle += cstart + ' - ' + cend;
        };
        $("#freqLogDivTitle").append("<br><span style='font-size: 14px;'>" + cSubTitle + "</span>");
    });

    nHdrs = $('#freqLog_hdr tr').children().toArray().length;

    if (pub_RemoteDo) {
        aCols = [
            { "data": "transid" },
            { "data": "invoice" },
            { "data": "store" },
            { "data": "custnum", "class": "popCust" },
            { "data": "date" },
            { "data": "time" },
            { "data": "clerk" },
            { "data": "station" },
            { "data": "type" },
            { "data": "total" },
            { "data": "points" },
            { "data": "redeem" },
            { "data": "postpts" }
        ]
        if (nHdrs===12) {
            $("<th id='freqLog_col1a'>Store</th>").insertAfter($('#freqLog_col1'));
        }
        aNumCols = [0,1,3,9,10,11,12];
    } else {
        aCols = [
            { "data": "transid" },
            { "data": "invoice" },
            { "data": "custnum", "class": "popCust" },
            { "data": "date" },
            { "data": "time" },
            { "data": "clerk" },
            { "data": "station" },
            { "data": "type" },
            { "data": "total" },
            { "data": "points" },
            { "data": "redeem" },
            { "data": "postpts" }
        ]
        if (nHdrs===13) {
            $('#freqLog_col1a').remove();
        }
    }

    freqLogtable = $('#freqLogtable').DataTable({
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                title: 'Frequent Buyer Points Log ' + cSubTitle.replace('<br>', ' ')
            },
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                orientation: 'landscape',
                title: 'Frequent Buyer Points Log',
                header: true,
                footer: true,
                message: '__MESSAGE__',
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = cSubTitle.replace('<br>', ' ');
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Frequent Buyer Points Log',
                footer: true,
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
            },
            {
                text: svgClose,
                titleAttr: '  Close  ',
                action: function (e, dt, node, config) {
                    resetFreqLog();
                }
            }
        ],
        ajax: {
            url: "getFreqLog?",
            data: {
                cCusSelect: cCusSelect,
                aCNs: JSON.stringify(aCNs),
                cStoreSelect: cStoreSelect,
                cStore: cStore,
                cDateSelect: cDateSelect,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate,
                lMulti: pub_RemoteDo
            },
            type: "POST"
        },
        columns: aCols,
        select: false,
        columnDefs: [
            { type: 'num-fmt', targets: [7, 8, 9, 10] },
            { className: 'numericCol', targets: aNumCols }
        ],
        order: [(pub_RemoteDo) ? 4:3, 'asc'],
        "fnDrawCallback": function () {
            $('#freqLog_select').toggle(false);
            $("#freqLog_waitp").toggle(false);
            $("#freqLog_waitp").html('Data View');;
            $("#freqLogtablewrapper").toggle(true);
            $("#freqLog_hdr").toggle(true);
            $("#freqLog_ftr").toggle(true);
            $("#freqLogDivTitle").toggle(true);
            $("#freqLog_cancel").prop('value', 'Done');
            $("#freqLog_cancel").toggle(true);
            $("#freqLog_newset").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        }
    });

    $('#freqLogtable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("freqLogLength", len);
        }
    });    

    $('#freqLogtable').on('click', 'tr td', function (e) {
        if ( ( pub_RemoteDo && $(this).index() == 3 ) || (!pub_RemoteDo && $(this).index() == 2 ) ) {
            popCustomer($(this).html());
            e.stopPropagation();
        };
    });

}

function popCustomer(cCustNum) {
    $.spin('true');    
    $.post("getPopCustData?", {cCustNum: cCustNum}, function (data, status) {
        var cStr = 'Customer Nbr: ' + cCustNum.trimStart() + '<br><hr>'
        if (data.name === 'NOTFOUND') {
            cStr += ' Customer Not Found.'           
        } else if (data.name === 'NOFILE') {
            cStr += ' Customer File Not Available!'           
        } else {
           cStr += (data.company.length>0) ? data.name + '<br>' : '<b>' + data.name + '</b><br>';
           cStr += (data.company.length>0) ? '<b>' + data.company + '</b><br>' : '';
           cStr += (data.address.length>0) ? data.address + '<br>' : '';
           cStr += (data.cityStZip.length>0) ? data.cityStZip + '<br>' : '';
           cStr += (data.phone.length>0) ? data.phone + '<br>' : '';
           cStr += 'Purchases: $' + data.dollars + '<br>' + 'Points: ' + data.points;
        }
        vex.dialog.alert({
            unsafeMessage: cStr,             // unsafeMessage option allows html in text
            className: 'vex-theme-wireframe', // Overwrites defaultOptions
            afterOpen: function () {
                $.spin('false');    
            }
        });
    });
}
// END FREQ BUYER LOG ////////////

function showDiscReport() {
    var dateRange = $('input[name=Disc_dateRange]:checked').val();

    $("#Disc_hdr").toggle(false);
    $("#Disctablewrapper").toggle(false);

    if (dateRange === '1') {
        DiscStandardDate();
    } else {
        DiscCustomDate();
    };

    $('#Disc_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    getInvDepts('DiscInvType');
    getSizes('Disc_size');

    $("nav").css('z-index', -1);
    $("#Modal_Disc").toggle(true);
    $("#tab_rept").toggle(false);
}

function closeDisc() {
    var wait = $('#Disc_waitp');
    var isVisible = wait.is(':visible');

    $("#Disc_box").find('*').prop("disabled", false);
    $("#Disc_box2").find('*').prop("disabled", false);

    if (!isVisible) {
        Disctable.clear().destroy(false);
        $('#Disc_waitp').toggle(true);
        $("#Disc_hdr").toggle(false);
        $("#DiscDivTitle").toggle(false);
        $("#Disctablewrapper").toggle(false);
    };

    $("#DiscInfo").text("");

    $("#Disc_submit").toggle(true);
    $("#Disc_newset").toggle(false);
    $("#Disc_cancel").prop("value", "Cancel");

    $("#Disc_date_last").prop("disabled", false);
    $("#Disc_date_custom").prop("disabled", false);
    $("#DiscRange").prop("disabled", false);
    $("#Disc_startDate").prop("disabled", false);
    $("#Disc_endDate").prop("disabled", false);

    $("nav").css('z-index', 999);
    $("#Modal_Disc").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function resetDiscReport() {
    Disctable.clear().destroy(false);

    $("#Disc_box").find('*').prop("disabled", false);
    $("#Disc_box2").find('*').prop("disabled", false);

    $("#DiscInfo").text("");

    $('#Disc_waitp').toggle(true);
    $("#Disc_hdr").toggle(false);
    $("#DiscDivTitle").toggle(false);
    $("#Disctablewrapper").toggle(false);
    $("#Disc_submit").toggle(true);
    $("#Disc_newset").toggle(false);
}

function DiscCustomDate() {
    document.getElementById("DiscRange").disabled = true;
    document.getElementById("Disc_startDate").disabled = false;
    document.getElementById("Disc_endDate").disabled = false;
}

function Disc_toggleDeptType() {
    var el = document.getElementById('DiscDeptType');
    var cSel = el.options[el.selectedIndex].value;
    $('#DiscInvType')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="       ">&#60; ANY &#62;</option>');
    if (cSel === "dept") {
        getInvDepts('DiscInvType');
    } else {
        getInvTypes('DiscInvType');
    };
    $('#DiscInvType').toggle(true);
}

function DiscStandardDate() {
    $('#Disc_startDate').val('');
    $('#Disc_endDate').val('');
    document.getElementById("Disc_startDate").disabled = true;
    document.getElementById("Disc_endDate").disabled = true;
    document.getElementById("DiscRange").disabled = false;
}

function getDiscReport() {
    var arr = [];
    var dateRange = $('input[name=Disc_dateRange]:checked').val();
    var table = $("#Disctable");
    var thdr = document.getElementById("Disc_hdr");
    var cstart = '';
    var cend = '';
    var cnbr = '';
    var cBrand = '';
    var cDescrip = '';
    var cSize = '';
    var cVendor = '';
    var cDeptSelect = '';
    var cDept = '';
    var cDateRange = '';
    var cStartDate = '';
    var cEndDate = '';
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("discReportLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $("#Disc_submit").toggle(false);
    $("#Disc_cancel").toggle(false);
    $("#Disc_select").toggle( false );

    $('.selectDiscrange').children().prop("disabled", true);

    if (dateRange === '2' && ($('#Disc_startDate').val() === '' || $('#Disc_endDate').val() === '')) {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
        return;
    };

    cDateRange = $('#DiscRange').val();
    cStartDate = $('#Disc_startDate').val();
    cEndDate = $('#Disc_endDate').val();

    arr.push('"' + dateRange + '"');
    arr.push('"' + cDateRange + '"');
    arr.push('"' + cStartDate + '"');
    arr.push('"' + cEndDate + '"');

    if (arr[0] === '"< ANY >"') {
        arr[0] = '""'
    };

    if (arr[1] === '"< ANY >"') {
        arr[1] = '""'
    };

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];
        };
    });

    cBrand = $('#Disc_brand').val();
    cDescrip = $('#Disc_descrip').val();
    cDeptSelect = $('#DiscDeptType').val();
    cDept = getInvTypeSelected('DiscInvType');
    cSize = $('#Disc_size').val();

    $("#Disc_box").find('*').prop("disabled", true);
    $("#Disc_box2").find('*').prop("disabled", true);

    $("#Disc_col1").text("Barcode");
    $("#Disc_col2").text("Brand");
    $("#Disc_col3").text("Descrip");
    $("#Disc_col4").text("Size");
    $("#Disc_col5").text("Type");
    $("#Disc_col6").text("Price");
    $("#Disc_col7").text("Qty");
    $("#Disc_col8").text("Disc $");
    $("#Disc_col9").text("Disc %");
    $("#Disc_col10").text("Invoice");
    $("#Disc_col11").text("Clerk");
    $("#Disc_col12").text("Date");
    $("#Disc_col13").text("Time");
    $("#Disc_col14").text("Ext Price");
    $("#Disc_col15").text("Ext Cost");

    $("#Disc_hdr").toggle(true);

    Disctable = $('#Disctable').DataTable({
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                filename: 'Discount Report ' + todayString()
            },
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'landscape',
                title: 'Discount Report',
                header: true,
                footer: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'History Start: ' + cstart + '\n' +
                                'History End: ' + cend + '\n' +
                                'Report run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Discount Report ' + todayString(),
                footer: true,
                customize: function (window) {
                    $(window.document.head)
                       .append('<style>td:nth-child(3n) { text-align: right; }</style>')
                       .append('<style>td:nth-child(14) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'History Start: ' + cstart + '<br>' +
                        'History End: ' + cend + '<br>');

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                text: svgClose,
                titleAttr: '  Close  ',
                action: function (e, dt, node, config) {
                    $("#Disc_select").toggle( true );
                    resetDiscReport();
                }
            }

        ],
        ajax: {
            url: "Disc_Report?",
            data: {
                cDateSelect: dateRange,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate,
                cBrand: cBrand,
                cDescrip: cDescrip,
                cSize: cSize,
                cVendor: cVendor,
                cDeptSelect: cDeptSelect,
                cDept: cDept
            },
            type: "POST"
        },
        select: { style: 'single' },
        "columns": [
            { "width": "7%" },
            { "width": "16%" },
            { "width": "12%" },
            { "width": "5%" },
            { "width": "16%" },
            { "width": "6%" },
            { "width": "6%" },
            { "width": "6%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "0%" },
            { "width": "0%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [5, 6, 7, 8, 13, 14] },
            { className: 'numericCol', targets: [5, 6, 7, 8, 13, 14] },
            { targets: [13, 14], visible: false, searchable: false, orderable: false }
        ],
        order: [[9, 'asc']],
        "footerCallback": function (tfoot, data, start, end, display) {
            var api = this.api();
            var sales = 0;
            var disc = 0;
            var cost = 0;

            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            $(api.column(13).footer()).html('$ ' +
                api.column(13).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                }, 0)
            )
            sales = intVal($(api.column(13).footer()).text());

            $(api.column(14).footer()).html('$ ' +
                api.column(14).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                }, 0)
            )
            cost = intVal($(api.column(14).footer()).text());

            $(api.column(7).footer()).html(
                api.column(7).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(0));
                }, 0)
            )
            disc = intVal($(api.column(7).footer()).text());

            $("#DiscInfo").html(
                '<span class="DiscLabel">Sales (List):</span><span class="DiscNumbers">$ ' + numberWithCommas(sales.toFixed(2)) + '</span><br>' +
                '<span class="DiscLabel">Discounts:</span><span class="DiscNumbers">$ ' + numberWithCommas(disc.toFixed(2)) + '</span>&nbsp;&nbsp;' +
                ((disc / Math.max(sales, 0.001)) * 100).toFixed(1) + '% <br>' +
                '<span class="DiscLabel">Sales (Net):</span><span class="DiscNumbers">$ ' + numberWithCommas((sales - disc).toFixed(2)) + '</span><br>' +
                '<span class="DiscLabel">Net Gr Margin:</span><span class="DiscNumbers">$ ' + numberWithCommas((sales - disc - cost).toFixed(2)) + '</span>&nbsp;&nbsp;' +
                (((sales - disc - cost) / Math.max((sales - disc), 0.001)) * 100).toFixed(1) + '% <br>'
            );
        },
        "fnDrawCallback": function () {
            $("#Disc_waitp").toggle(false);
            $("#Disctablewrapper").toggle(true);
            $("#DiscDivTitle").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        }
    });

    $('#Disctable').off('length.dt');
    $('#Disctable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("discReportLength", len);
        }
    });

    Disctable.on('click', 'tbody tr td', function (e, dt, type, indexes) {
        var myRow = this.parentNode;
        if ($(this).index() == 9) {
            var rowData = Disctable.row(myRow).data();
            showInvoice(rowData[9]);
            Disctable.rows({ selected: true }).deselect();
        }
    });

/*
    Disctable.on('select', function (e, dt, type, indexes) {
        var rowData = Disctable.rows(indexes).data().toArray();
        showInvoice(rowData);
        Disctable.rows({ selected: true }).deselect();
    });
*/
    $("#Disc_cancel").prop("value", "Done");
    $("#Disc_cancel").toggle(true);
    $("#Disc_newset").toggle(true);
}

function showInvoice(invoiceNbr) {
    $.spin('true');
    $.post( "showInvoice", { invoice: invoiceNbr }, function(xResp) {
        if (xResp.error) {
            $.spin('false');
            swal("Oops...", text, "error");
            return;
        } else {
            $("#modalInvoiceTitle").text( "Invoice Nbr. " + invoiceNbr);
            $("#invoiceText1").text(xResp.text1);
            $("#invoiceText2").text(xResp.text2);
            $("#invoicePrint").html(svgPrint);

            $(document).keydown(function (e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    closeModalInvoice();
                }
            });

            $("#modalInvoice").css("z-index", 99999);
            $("#modalInvoice").toggle(true);

        }
        $.spin('false');
    });
}

function showReceiver(recvNbr) {
    $.spin('true');
    $.post( "showReceiver", { receiver: recvNbr }, function(xResp) {
        if (xResp.error) {
            $.spin('false');
            swal("Oops...", text, "error");
            return;
        } else {
            $("#modalInvoiceTitle").text( "Receiver Nbr. " + recvNbr);
            $("#invoiceText1").text(xResp.text1);
            $("#invoiceText2").text(xResp.text2);
            $("#invoicePrint").html(svgPrint);

            $(document).keydown(function (e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    closeModalInvoice();
                }
            });

            $("#modalInvoice").css("z-index", 99999);
            $("#modalInvoice").toggle(true);

        }
        $.spin('false');
    });
}

function invoicePrint() {
    var title = $("#modalInvoiceTitle").text(); 
    var text1 = $("#invoiceText1").text();
    var text2 = $("#invoiceText2").text();

    text1 = text1.replace(/[\n]/g,'');
    text1 = text1.replace(/[\r]/g,'<br>');
    text1 = text1.replace(/ /g, "&nbsp;");
    
    text2 = text2.replace(/[\n]/g,'');
    text2 = text2.replace(/[\r]/g,'<br>');
    text2 = text2.replace(/ /g, "&nbsp;");

    var a = window.open('', title); 
    a.document.write('<html><head>');
    a.document.write('<style>.invText {font-family: "Consolas", Courier, monospace; font-size: 24px; margin-top: 60px; margin-left: 10px;}</style>');
    a.document.write('<style>.invText hr {width: 90%; margin-left: 0px; height: 2px; color: black; background-color: black;}</style>');
    a.document.write('</head><body><div class="invText">');
    a.document.write( title + '<br><br>' );
    a.document.write(text1); 
    a.document.write('<hr id="invoiceRule">'); 
    a.document.write(text2); 
    a.document.write('</div></body></html>'); 
    a.document.close(); 

    a.onafterprint = function(event) {  a.close(); };
    a.print();
}

function closeModalInvoice() {
    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            return;
        }
    });

    $("#modalInvoiceContent").scrollTop(0);
    $("#modalInvoice").css("z-index", -1);
    $("#modalInvoice").toggle(false);
    $("#invoiceText").text('');
    $("#modalInvoiceTitle").text('');
    $("#invoicePrint").html('');

}

////////////////
function showCoupReport(lFromWithin) {
    if (!lFromWithin) {
        $("#Coup_date_last").prop("checked", true);
        $("#Coup_date_custom").prop("checked", false);
        $("#CoupRange").val('week');
        CoupStandardDate();
    } else {
        var dateRange = $('input[name=Coup_dateRange]:checked').val();

        if (dateRange === '1') {
            CoupStandardDate();
        } else {
            CoupCustomDate();
        };
    }

    $('#coupHeaderTitle').text('Coupon Report');

    $('#coupClose').off('click');
    $('#Coup_cancel').off('click');
    $('#Coup_submit').off('click');

    $('#coupClose').on('click', function(event) { event.stopPropagation(); closeCoup(true); } );
    $('#Coup_cancel').on('click',function(event) { event.stopPropagation(); closeCoup(false); } );
    $('#Coup_submit').on('click',function(event) { event.stopPropagation(); getCoupReport(); } );    

    $('#Coup_select').toggle(true);
    $('#coupClose').toggle(false);
    
    $("#Coup_hdr").toggle(false);
    $("#Couptablewrapper").toggle(false);

    $("label[for='CoupName']").text('Coupon Type:');

    $('#Coup_startDate').val('');
    $('#Coup_endDate').val('');

    $('#Coup_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    if (!lFromWithin) {
        $('#CoupName')
            .find('option')
            .remove();
        
        getCoupons('CoupName');
    }

    $("nav").css('z-index', -1);
    $("#Modal_Coup").toggle(true);
    $("#tab_rept").toggle(false);
}

function closeCoup(lFromWithin) {
    var wait = $('#Coup_waitp');
    var isVisible = wait.is(':visible');

    $("#Coup_box").find('*').prop("disabled", false);
    $("#Coup_box2").find('*').prop("disabled", false);

    if (!isVisible) {
        Couptable.clear().destroy(false);
        $('#Coup_waitp').toggle(true);
        $("#Coup_hdr").toggle(false);
        $("#Coup_ftr").toggle(false);
        $("#CoupDivTitle").toggle(false);
        $("#Couptablewrapper").toggle(false);
    };

    $("#CoupInfo").text("");

    $("#Coup_submit").toggle(true);
    $("#Coup_cancel").css("margin-right", "10px");

    $("#Coup_date_last").prop("disabled", false);
    $("#Coup_date_custom").prop("disabled", false);
    $("#CoupRange").prop("disabled", false);
    $("#Coup_startDate").prop("disabled", false);
    $("#Coup_endDate").prop("disabled", false);

    if (lFromWithin) {
        showCoupReport(true);
    } else {
        $("#Coup_cancel").prop("value", "Cancel");
        $("nav").css('z-index', 999);
        $("#Modal_Coup").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    }
}

function CoupCustomDate() {
    document.getElementById("CoupRange").disabled = true;
    document.getElementById("Coup_startDate").disabled = false;
    document.getElementById("Coup_endDate").disabled = false;
}

function CoupStandardDate() {
    $('#Coup_startDate').val('');
    $('#Coup_endDate').val('');
    document.getElementById("Coup_startDate").disabled = true;
    document.getElementById("Coup_endDate").disabled = true;
    document.getElementById("CoupRange").disabled = false;
}

function getCoupReport() {
    var arr = [];
    var dateRange = $('input[name=Coup_dateRange]:checked').val();
    var table = $("#Couptable");
    var thdr = document.getElementById("Coup_hdr");
    var cstart = '';
    var cend = '';
    var cnbr = '';
    var cCoupon;
    var cDateRange = '';
    var cStartDate = '';
    var cEndDate = '';
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("coupReportLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    if (dateRange === '2' && ($('#Coup_startDate').val() === '' || $('#Coup_endDate').val() === '')) {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
        return;
    };

    $.spin('true');

    $('#Coup_select').toggle(false);
    $('#coupClose').toggle(true);
    
    $("#Coup_submit").toggle(false);
    $("#Coup_cancel").toggle(false);
    
    $('.selectCouprange').children().prop("disabled", true);
    
    cDateRange = $('#CoupRange').val();
    cStartDate = $('#Coup_startDate').val();
    cEndDate = $('#Coup_endDate').val();
    cCoupon = $('#CoupName').val();

    arr.push('"' + dateRange + '"');
    arr.push('"' + cDateRange + '"');
    arr.push('"' + cStartDate + '"');
    arr.push('"' + cEndDate + '"');

    if (arr[0] === '"< ANY >"') {
        arr[0] = '""'
    };

    if (arr[1] === '"< ANY >"') {
        arr[1] = '""'
    };

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];
        };
    });

    $("#Coup_box").find('*').prop("disabled", true);
    $("#Coup_box2").find('*').prop("disabled", true);

    $("#Coup_hdr").toggle(true);
    $("#Coup_ftr").toggle(true);

    Couptable = $('#Couptable').DataTable({
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                title: 'Coupon Report ' + todayString()
            },            
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'portrait',
                title: 'Coupon Report',
                header: true,
                customize: function (doc) {
                    var cInfo = $("#CoupInfo").text();
                    cInfo = cInfo.replace('Sales:', 'Sales:  ');
                    cInfo = cInfo.replace('Coupons:', '\nCoupons:  ');
                    cInfo = cInfo.replace('Net Gr Margin:', '\nNet GM:  ');
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'History Start: ' + cstart + '\n' +
                                'History End: ' + cend + '\n' +
                                'Report Run: ' + todayString() + '\n' +
                                cInfo
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Coupon Report ' + todayString(),
                footer: true,
                customize: function (window) {
                    var cInfo = $("#CoupInfo").text();
                    cInfo = cInfo.replace('Sales:', 'Sales:  ');
                    cInfo = cInfo.replace('Coupons:', '<br>Coupons:  ');
                    cInfo = cInfo.replace('Net Gr Margin:', '<br>Net GM:  ');

                    $(window.document.head)
                        .append('<style>td:nth-child(3n) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'History Start: ' + cstart + '<br>' +
                        'History End: ' + cend + '<br>' + cInfo);

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                text: svgClose,
                titleAttr: '  Close  ',
                action: function (e, dt, node, config) {
                    $("#Coup_select").toggle( true );
                    closeCoup(true);
                }
            }
        ],
        ajax: {
            url: "Coup_Report?",
            data: {
                cDateSelect: dateRange,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate,
                cCoupon: cCoupon
            },
            type: "POST"
        },
        "columns": [
            { "width": "15%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "15%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" },
            { "width": "10%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [5, 6, 7, 8] },
            { className: 'numericCol', targets: [5, 6, 7, 8] }
        ],
        order: [[0, 'asc']],
        "footerCallback": function (tfoot, data, start, end, display) {
            var api = this.api();
            var sales = 0;
            var coup = 0;
            var GM = 0;

            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            $(api.column(6).footer()).html('$ ' +
                api.column(6).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                }, 0)
            )
            sales = intVal($(api.column(6).footer()).text());

            $(api.column(7).footer()).html('$ ' +
                api.column(7).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                }, 0)
            )
            GM = intVal($(api.column(7).footer()).text());

            $(api.column(5).footer()).html(
                api.column(5).data().reduce(function (a, b) {
                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(0));
                }, 0)
            )
            coup = intVal($(api.column(5).footer()).text());

            $("#CoupInfo").html(
                '<span class="DiscLabel">Sales:</span><span class="DiscNumbers">$ ' + numberWithCommas(sales.toFixed(2)) + '</span><br>' +
                '<span class="DiscLabel">Coupons:</span><span class="DiscNumbers">$ ' + numberWithCommas(coup.toFixed(2)) + '</span><br>' +
                '<span class="DiscLabel">Net Gr Margin:</span><span class="DiscNumbers">$ ' + numberWithCommas(GM.toFixed(2)) + '</span>&nbsp;&nbsp;' +
                ((GM / Math.max(sales, 0.001)) * 100).toFixed(1) + '% <br>'
            );
        },
        "fnDrawCallback": function () {
            $("#Coup_waitp").toggle(false);
            $("#Couptablewrapper").toggle(true);
            $('#CoupDivTitle').text('Coupon Report');
            $("#CoupDivTitle").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        },
        initComplete: function () {
            $.spin('false');
        }
    });

    $('#Couptable').off('length.dt');
    $('#Couptable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("coupReportLength", len);
        }
    });

    Couptable.on('click', 'tbody tr td', function (e, dt, type, indexes) {
        var myRow = this.parentNode;
        if ($(this).index() == 0) {
            var rowData = Couptable.row(myRow).data();
            showInvoice(rowData[0]);
            Couptable.rows({ selected: true }).deselect();
        }
    });

    $("#Coup_cancel").prop("value", "Done");
    $("#Coup_cancel").css("margin-right", "20px");
    $("#Coup_cancel").toggle(true);
}
////// End Coupon Report \\\\\\

////// Begin Exception Report \\\\\\
function showExcepReport(lFromWithin) {
    if (!lFromWithin) {
        $("#Coup_date_last").prop("checked", true);
        $("#Coup_date_custom").prop("checked", false);
        $("#CoupRange").val('week');
        CoupStandardDate();
    } else {
        var dateRange = $('input[name=Coup_dateRange]:checked').val();

        if (dateRange === '1') {
            CoupStandardDate();
        } else {
            CoupCustomDate();
        };
    }

    $('#Coup_select').toggle(true);
    $('#coupClose').toggle(false);

    $("#Coup_hdr").toggle(false);
    $("#CoupDivTitle").toggle(false);
    $("#Couptablewrapper").toggle(false);

    $('#Coup_startDate').val('');
    $('#Coup_endDate').val('');

    $('#Coup_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    $('#coupHeaderTitle').text('Exception Report');
    $("label[for='CoupName']").text('Exception Type:');
    $('#Coup_hdr').html('<tr><th id="Coup_col1">Date</th><th id="Coup_col2">Time</th><th id="Coup_col3">Clerk</th><th id="Coup_col4">Station</th><th id="Coup_col5">Action</th><th id="Coup_col6">Before</th><th id="Coup_col7">After</th><th id="Coup_col8">Barcode</th><th id="Coup_col9">Item</th></tr>');
    $('#Coup_ftr').remove();

    $('#coupClose').off('click');
    $('#Coup_cancel').off('click');
    $('#Coup_submit').off('click');
    
    $('#coupClose').on('click', function(event) { event.stopPropagation(); closeExcep(true); } );
    $('#Coup_cancel').on('click',function(event) { event.stopPropagation(); closeExcep(false); } );
    $('#Coup_submit').on('click',function(event) { event.stopPropagation(); getExcepReport(); } );    

    if (!lFromWithin) {
        $('#CoupName')
            .find('option')
            .remove();
        
        getExcepActions('CoupName');
    }

    $("nav").css('z-index', -1);
    $("#Modal_Coup").toggle(true);
    $("#tab_rept").toggle(false);
}

function closeExcep(lFromWithin) {
    var wait = $('#Coup_waitp');
    var isVisible = wait.is(':visible');

    $("#Coup_box").find('*').prop("disabled", false);
    $("#Coup_box2").find('*').prop("disabled", false);

    if ($.fn.dataTable.isDataTable("#Couptable")) {
        excepTable.clear().destroy(false);
        $('#Coup_waitp').toggle(true);
        $("#Coup_hdr").toggle(false);
        $("#Coup_ftr").toggle(false);
        $("#CoupDivTitle").toggle(false);
        $("#Couptablewrapper").toggle(false);
    };

    $("#CoupInfo").text("");

    $("#Coup_submit").toggle(true);
    $("#Coup_cancel").css("margin-right", "10px");

    $("#Coup_date_last").prop("disabled", false);
    $("#Coup_date_custom").prop("disabled", false);
    $("#CoupRange").prop("disabled", false);
    $("#Coup_startDate").prop("disabled", false);
    $("#Coup_endDate").prop("disabled", false);

    if (lFromWithin) {
        showExcepReport(true);
    } else {
        // restore coupon report items...
        $('#Coup_hdr').html('<tr><th id="Coup_col1">Invoice</th><th id="Coup_col2">Clerk</th><th id="Coup_col3">Date</th><th id="Coup_col4">Time</th><th id="Coup_col5">Coupon Type</th><th id="Coup_col6">Coupon $</th><th id="Coup_col7">Sale Total</th><th id="Coup_col8">GM $</th><th id="Coup_col9">GM %</th></tr>');
        $("#Couptable").append('<tfoot id="Coup_ftr" style="display: none;"><tr><td id="Coup_ftr1">Totals:</td><td id="Coup_ftr2"></td><td id="Coup_ftr3"></td><td id="Coup_ftr4"></td><td id="Coup_ftr5"></td><td id="Coup_ftr6"></td><td id="Coup_ftr7"></td><td id="Coup_ftr8"></td><td id="Coup_ftr9"></td></tr></tfoot>');
        $('#CoupDivTitle').css('height','70px');

        $('#coupClose').off('click');
        $('#Coup_cancel').off('click');
        $('#Coup_submit').off('click');    
        $("#Coup_cancel").prop("value", "Cancel");
            
        $("nav").css('z-index', 999);
        $("#Modal_Coup").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    }
}

function getExcepReport() {
    var arr = [];
    var dateRange = $('input[name=Coup_dateRange]:checked').val();
    var table = $("#Couptable");
    var thdr = document.getElementById("Coup_hdr");
    var cstart = '';
    var cend = '';
    var cnbr = '';
    var cCoupon;
    var cDateRange = '';
    var cStartDate = '';
    var cEndDate = '';
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("excepReportLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $('.selectCouprange').children().prop("disabled", true);

    if (dateRange === '2' && ($('#Coup_startDate').val() === '' || $('#Coup_endDate').val() === '')) {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
        return;
    };

    $.spin('true');

    $('#Coup_select').toggle(false);
    $('#coupClose').toggle(true);
    
    $("#Coup_submit").toggle(false);
    $("#Coup_cancel").toggle(false);
    
    cDateRange = $('#CoupRange').val();
    cStartDate = $('#Coup_startDate').val();
    cEndDate = $('#Coup_endDate').val();
    cCoupon = $('#CoupName').val();

    arr.push('"' + dateRange + '"');
    arr.push('"' + cDateRange + '"');
    arr.push('"' + cStartDate + '"');
    arr.push('"' + cEndDate + '"');

    if (arr[0] === '"< ANY >"') {
        arr[0] = '""'
    };

    if (arr[1] === '"< ANY >"') {
        arr[1] = '""'
    };

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];
        };
    });

    $("#Coup_box").find('*').prop("disabled", true);
    $("#Coup_box2").find('*').prop("disabled", true);

    $("#Coup_hdr").toggle(true);
    $("#Coup_ftr").toggle(true);

    excepTable = $('#Couptable').DataTable({
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                title: 'Exception Report ' + todayString()
            },            
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'portrait',
                title: 'Exception Report',
                header: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'History Start: ' + cstart + '\n' +
                                'History End: ' + cend + '\n' +
                                'Report Run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Exception Report ' + todayString(),
                footer: true,
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(3n) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'History Start: ' + cstart + '<br>' +
                        'History End: ' + cend );

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
            {
                text: svgClose,
                titleAttr: '  Close  ',
                action: function (e, dt, node, config) {
                    $("#Coup_select").toggle( true );
                    closeExcep(true);
                }
            }
        ],
        ajax: {
            url: "getExcepReport?",
            data: {
                cDateSelect: dateRange,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate,
                cCoupon: cCoupon
            },
            type: "POST"
        },
        "columns": [
            { "data": "date",    "width": "10%" },
            { "data": "time",    "width": "10%" },
            { "data": "clerk",   "width": "10%" },
            { "data": "station", "width": "10%" },
            { "data": "action",  "width": "15%" },
            { "data": "before",  "width": "10%" },
            { "data": "after",   "width": "10%" },
            { "data": "barcode", "width": "10%" },
            { "data": "item",    "width": "15%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [5, 6] },
            { className: 'numericCol', targets: [5, 6] }
        ],
        order: [[0, 'asc'],[1, 'asc']],
        "fnDrawCallback": function () {
            $("#Coup_waitp").toggle(false);
            $("#Couptablewrapper").toggle(true);
            $('#CoupDivTitle').css('height','30px');
            $('#CoupDivTitle').text('Exception Report');
            $("#CoupDivTitle").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        },
        initComplete: function () {
            $.spin('false');
        }
    });

    $('#Couptable').off('length.dt');
    $('#Couptable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("excepReportLength", len);
        }
    });

    $("#Coup_cancel").prop("value", "Done");
    $("#Coup_cancel").css("margin-right", "20px");
    $("#Coup_cancel").toggle(true);
}
////// End Exception Report \\\\\\

////// Begin Time Clock Report \\\\\\
function showTimeClockReport(lFromWithin) {

    if (!lFromWithin) {
        $.post("getTimeClockSettings?", "", function (data) {
            $('[name="clockScope"]').removeAttr('checked');
            $("input[name=clockScope][value=" + data.tcScope + "]").prop('checked', true);
    
            $('#clockShowAll').prop('checked', data.tcShowAll);
    
            $('[name="clockFormat"]').removeAttr('checked');
            $("input[name=clockFormat][value=" + data.tcFormat + "]").prop('checked', true);
    
            timeClockAll();
        });
    
        $.post("timeClockDateSet?", "", function (data) {
            var cStart = data.start.split('-');
            var dStart = new Date(cStart[0], cStart[1] - 1, cStart[2]);
            var cEnd = data.end.split('-');
            var dEnd = new Date(cEnd[0], cEnd[1] - 1, cEnd[2]);

            document.getElementById("clockStartDate").valueAsDate = dStart;
            document.getElementById("clockEndDate").valueAsDate = dEnd;
        });
    }

    $('#Clock_select').toggle(true);
    $('#clockClose').toggle(false);

    $("#Clock_hdr").toggle(false);
    $("#ClockDivTitle").toggle(false);
    $("#Clocktablewrapper").toggle(false);

    $('#clockHeaderTitle').text('Time Clock Report');

    $('#clockClose').off('click');
    $('#Clock_cancel').off('click');
    $('#Clock_submit').off('click');
    
    $('#clockClose').on('click', function(event) { event.stopPropagation(); closeTimeClock(true); } );
    $('#Clock_cancel').on('click',function(event) { event.stopPropagation(); closeTimeClock(false); } );
    $('#Clock_submit').on('click',function(event) { event.stopPropagation(); getTimeClockReport(); } );    

    timeClockAll();

    $("nav").css('z-index', -1);
    $("#Modal_Clock").toggle(true);
    $("#tab_rept").toggle(false);
}

function closeTimeClock(lFromWithin) {
    var wait = $('#Clock_waitp');
    var isVisible = wait.is(':visible');

    $("#Clock_box").find('*').prop("disabled", false);
    $("#Clock_box2").find('*').prop("disabled", false);

    // clear pick list selections
    if (emplListDataTable) {
        emplListDataTable.rows().deselect();
    }
    $("#employeePickLen").text("0 Selected");

    if ($.fn.dataTable.isDataTable("#Clocktable")) {
        TimeClockTable.clear().destroy(false);
        $('#Clock_waitp').toggle(true);
        $("#Clock_hdr").toggle(false);
        $("#Clock_ftr").toggle(false);
        $("#ClockDivTitle").toggle(false);
        $("#Clocktablewrapper").toggle(false);
    };

    $("#clockSelect").toggle(true);

    $("#ClockInfo").text("");

    $("#Clock_submit").toggle(true);
    $("#Clock_cancel").toggle(true);

    $("#Clock_date_last").prop("disabled", false);
    $("#Clock_date_custom").prop("disabled", false);
    $("#ClockRange").prop("disabled", false);
    $("#Clock_startDate").prop("disabled", false);
    $("#Clock_endDate").prop("disabled", false);

    if (lFromWithin) {
        showTimeClockReport(true);
    } else {
        // restore clock report items...
        $('#ClockDivTitle').css('height','70px');

        $('#clockClose').off('click');
        $('#Clock_cancel').off('click');
        $('#Clock_submit').off('click');    
            
        $("nav").css('z-index', 999);
        $("#Modal_Clock").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    }
}

function timeClockAll() {
    if ($("#clockScopeAll").is(":checked")) {
        $("#clockShowAll").prop('disabled', false);
        $("#employeeListBtn").prop('disabled', true);
        $("#employeePickLen").css("color", "lightgray");
    } else {
        $("#clockShowAll").prop('disabled', true);
        $("#employeeListBtn").prop('disabled', false);
        $("#employeePickLen").css("color", "");
    }
}

// toggle in settings
function timeClockSetAll() {
    if ($("#timeClockScopeAll").is(":checked")) {
        $("#timeClockShowAll").prop('disabled', false);
    } else {
        $("#timeClockShowAll").prop('disabled', true);
    }
}

function timeClockPeriodToggle() {
    var lDisable = !( $("#timeClockWeek").is(":checked") || $("#timeClockTwoWeeks").is(":checked") );
    var color = "";

    if (lDisable) {
        color = "#ccc"
    };

    $("#timeClockDayOfWeek").prop("disabled", lDisable);
    $("label[for='timeClockDayOfWeek']").css("color", color);
}

function timeClockRoundToggle() {
    var lDisable = $("#timeClockRoundNo").is(":checked");
    var color = "";

    if (lDisable) {
        color = "#ccc"
    };

    $("#timeClockRoundUp").prop("disabled", lDisable);
    $("label[for='timeClockRoundUp']").css("color", color);
}

function getTimeClockReport() {
    var arr = [];
    var table = $("#Clocktable");
    var thdr = document.getElementById("Clock_hdr");
    var cstart = '';
    var cend = '';
    var cnbr = '';
    var cClockon;
    var cDateRange = '';
    var cStartDate = '';
    var cEndDate = '';
    var scope = $("input[name='clockScope']:checked"). val();
    var format = $("input[name='clockFormat']:checked"). val();
    var showAll = $("#clockShowAll").is(":checked");
    var empArray = [];
    var aCols;
    var numCol;
    var lOrder;
    var aOrd;
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("timeClockReportLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    if (scope === 'S' && typeof emplListDataTable === 'undefined' ||
    scope === 'S' && emplListDataTable.rows({ selected: true }).count() === 0) {
        swal('Error', "Please select the employee(s) to report on.", 'error');
        return;

    } else if (scope === 'S') {
        var selectedRows = emplListDataTable.rows({ selected: true }).data();
        $.each(selectedRows, function (key, row) {
            empArray.push(row.id);
        });
    };

    if ( $('#clockStartDate').val() === '' || $('#clockEndDate').val() === '' ) {
        swal("Oops...", "Please enter Start and End dates for your report.", "error");
        return;
    };

    $.spin('true');

    $('.selectClockrange').children().prop("disabled", true);

    $('#Clock_select').toggle(false);
    $('#clockClose').toggle(true);
    
    $("#Clock_submit").toggle(false);
    $("#Clock_cancel").toggle(false);

    $("#Clock_hdr").empty();
    if (format === 'D') {
        $("#Clock_hdr").html("<tr><th>ID Nbr</th><th>Name</th><th>In</th><th>Out</th><th>Hours</th></tr>")
        aCols = [
            { "data": "id",    "width": "10%" },
            { "data": "name",  "width": "30%" },
            { "data": "in",    "width": "25%" },
            { "data": "out",   "width": "25%" },
            { "data": "hours", "width": "10%" }
        ];
        numCol = 4;
        lOrder = false;
        aOrd = [];
    } else {
        $("#Clock_hdr").html("<tr><th>ID Nbr</th><th>Name</th><th>Total Hours</th></tr>")
        aCols = [
            { "data": "id",    "width": "10%" },
            { "data": "name",  "width": "60%" },
            { "data": "hours", "width": "30%" }
        ];
        numCol = 2;
        lOrder = true;
        aOrd = [[1,'asc']];
    }
    
    cStartDate = $('#clockStartDate').val();
    cEndDate   = $('#clockEndDate').val();
    cstart     = cStartDate.substring(5,7) + '/' + cStartDate.substring(8) + '/' + cStartDate.substring(0,4)
    cend       = cEndDate.substring(5,7) + '/' + cEndDate.substring(8) + '/' + cEndDate.substring(0,4)

    $("#Clock_box").find('*').prop("disabled", true);
    $("#Clock_box2").find('*').prop("disabled", true);

    $("#Clock_hdr").toggle(true);
    $("#Clock_ftr").toggle(true);

    TimeClockTable = $('#Clocktable').DataTable({
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                title: 'Time Clock Report ' + todayString()
            },            
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'portrait',
                title: 'Time Clock Report',
                header: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 
                                'Report Start: ' + cstart + '\n' +
                                'Report End: ' + cend + '\n' +
                                'Report Run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Time Clock Report ' + todayString(),
                footer: true,
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(3n) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">' +
                        'Report Start: ' + cstart + '<br>' +
                        'Report End: ' + cend );

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        ajax: {
            url: "timeClockReport?",
            data: {
                begin:    cStartDate,
                end:      cEndDate,
                scope:    scope,
                format:   format,
                showAll:  !showAll,
                empArray: JSON.stringify( empArray )
            },
            type: "POST"
        },
        columns: aCols,
        columnDefs: [
            { type: 'num-fmt', targets: [numCol] },
            { className: 'numericCol', targets: [numCol] }
        ],
        ordering: lOrder,
        order: aOrd,
        "fnDrawCallback": function () {
            $("#Clock_waitp").toggle(false);
            $("#Clocktablewrapper").toggle(true);
            $('#ClockDivTitle').css('height','30px');
            $('#ClockDivTitle').html('Time Clock Report<br><span style="font-size: 12px;">' + cstart + ' -- ' + cend + "</span>");
            $("#ClockDivTitle").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
            $('td').each(function () {
                if ( $(this).index() == 2 && $(this).text().includes("Total") ) {
                    $(this).parent().children().css('font-weight', 'bold');
                }
            });
        },
        initComplete: function () {
            $.spin('false');
        }
    });

    $('#Clocktable').off('length.dt');
    $('#Clocktable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("timeClockReportLength", len);
        }
    });

    $("#clockSelect").toggle(false);
}

function showEmplList() {
    var modal = document.getElementById("Modal_emplList");

    $("#emplListTableWrapper").hide();

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            closeEmplListModal();
        }
    });

    $("#Modal_emplList").css("z-index", 99999);
    $("#Modal_emplList").show();

    if (typeof emplListDataTable === 'undefined') {
        setTimeout(buildEmplListTable, 500);
    } else {
        $("#emplListTableWrapper").show();
    };
}

function buildEmplListTable() {
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("emplListLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $("#emplListTableWrapper").show();

    emplListDataTable = $('#emplListTable').DataTable({
        dom: 'ifrtlp',
        ajax: "getEmployeeList?",
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
        columns: [
            { "data": "id",    "width": "10%" },
            { "data": "name",  "width": "30%" },
            { "data": "phone",    "width": "30%" },
            { "data": "email",   "width": "30%" }
        ],
        columnDefs: [
            { type: 'num', targets: 0 },
            { className: 'numericCol', targets: 0 }
        ],
        select: {
            style: 'multi'
        },
        "deferRender": true,
        order: [[1, 'asc']],
    });

    $('#emplListTable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("emplListLength", len);
        }
    });
}

function closeEmplListModal() {
    var rows = emplListDataTable.rows({ selected: true }).count();
    var cSelect = rows.toString() + " Selected";

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            return;
        }
    });

    $("#employeePickLen").text(cSelect);
    $("#Modal_emplList").css("z-index", -1);
    $("#Modal_emplList").hide();
}
////// End Time Clock Report \\\\\\

////// Begin Item Edit Report \\\\\\
function showItemEditLog(lFromWithin) {
    if (!lFromWithin) {
        $("#Coup_date_last").prop("checked", true);
        $("#Coup_date_custom").prop("checked", false);
        $("#CoupRange").val('week');
        CoupStandardDate();
    } else {
        var dateRange = $('input[name=Coup_dateRange]:checked').val();

        if (dateRange === '1') {
            CoupStandardDate();
        } else {
            CoupCustomDate();
        };
    }

    $('#Coup_select').toggle(true);
    $('#coupClose').toggle(false);

    $("#Coup_hdr").toggle(false);
    $("#CoupDivTitle").toggle(false);
    $("#Couptablewrapper").toggle(false);

    $('#Coup_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    $('#coupHeaderTitle').text('Item Edit Log');
    $("label[for='CoupName']").text('Item Edit Module:');
    $('#Coup_hdr').html('<tr><th id="Coup_col1">Date</th><th id="Coup_col2">Time</th><th id="Coup_col3">User</th><th id="Coup_col4">Station</th><th id="Coup_col5">Module</th><th id="Coup_col5a">Field</th><th id="Coup_col6">Before</th><th id="Coup_col7">After</th><th id="Coup_col8">Barcode</th><th id="Coup_col9">Item</th></tr>');
    $('#Coup_ftr').remove();

    $('#coupClose').off('click');
    $('#Coup_cancel').off('click');
    $('#Coup_submit').off('click');
    
    $('#coupClose').on('click', function(event) { event.stopPropagation(); closeItemEditLog(true); } );
    $('#Coup_cancel').on('click',function(event) { event.stopPropagation(); closeItemEditLog(false); } );
    $('#Coup_submit').on('click',function(event) { event.stopPropagation(); getItemEditLog(); } );    

    if (!lFromWithin) {
        $('#CoupName')
            .find('option')
            .remove();
        
        getInvEditModule('CoupName');
    }

    $("nav").css('z-index', -1);
    $("#Modal_Coup").toggle(true);
    $("#tab_rept").toggle(false);
}

function closeItemEditLog(lFromWithin) {
    var wait = $('#Coup_waitp');
    var isVisible = wait.is(':visible');

    $("#Coup_box").find('*').prop("disabled", false);
    $("#Coup_box2").find('*').prop("disabled", false);

    if ($.fn.dataTable.isDataTable("#Couptable")) {
        invLogTable.clear().destroy(false);
        $('#Coup_waitp').toggle(true);
        $("#Coup_hdr").toggle(false);
        $("#Coup_ftr").toggle(false);
        $("#CoupDivTitle").toggle(false);
        $("#Couptablewrapper").toggle(false);
    };

    $("#CoupInfo").text("");

    $("#Coup_submit").toggle(true);
    $("#Coup_cancel").prop("value", "Cancel");
    $("#Coup_cancel").css("margin-right", "10px");

    $("#Coup_date_last").prop("disabled", false);
    $("#Coup_date_custom").prop("disabled", false);
    $("#CoupRange").prop("disabled", false);
    $("#Coup_startDate").prop("disabled", false);
    $("#Coup_endDate").prop("disabled", false);

    if (lFromWithin) {
        showItemEditLog(true);
    } else {
        // restore coupon report items...
        $('#Coup_hdr').html('<tr><th id="Coup_col1">Invoice</th><th id="Coup_col2">Clerk</th><th id="Coup_col3">Date</th><th id="Coup_col4">Time</th><th id="Coup_col5">Coupon Type</th><th id="Coup_col6">Coupon $</th><th id="Coup_col7">Sale Total</th><th id="Coup_col8">GM $</th><th id="Coup_col9">GM %</th></tr>');
        $("#Couptable").append('<tfoot id="Coup_ftr" style="display: none;"><tr><td id="Coup_ftr1">Totals:</td><td id="Coup_ftr2"></td><td id="Coup_ftr3"></td><td id="Coup_ftr4"></td><td id="Coup_ftr5"></td><td id="Coup_ftr6"></td><td id="Coup_ftr7"></td><td id="Coup_ftr8"></td><td id="Coup_ftr9"></td></tr></tfoot>');
        $('#CoupDivTitle').css('height','70px');

        $('#coupClose').off('click');
        $('#Coup_cancel').off('click');
        $('#Coup_submit').off('click');    
            
        $('#coupClose').on('click', closeCoup(true));
        $('#Coup_cancel').on('click', closeCoup(false));
        $('#Coup_submit').on('click', getCoupReport);

        $("nav").css('z-index', 999);
        $("#Modal_Coup").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    }
}

function getItemEditLog() {
    var arr = [];
    var dateRange = $('input[name=Coup_dateRange]:checked').val();
    var table = $("#Couptable");
    var thdr = document.getElementById("Coup_hdr");
    var cstart = '';
    var cend = '';
    var cnbr = '';
    var cCoupon;
    var cDateRange = '';
    var cStartDate = '';
    var cEndDate = '';
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("invLogLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $('.selectCouprange').children().prop("disabled", true);

    if (dateRange === '2' && ($('#Coup_startDate').val() === '' || $('#Coup_endDate').val() === '')) {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
        return;
    };

    $.spin('true');

    $('#Coup_select').toggle(false);
    $('#coupClose').toggle(true);
    
    $("#Coup_submit").toggle(false);
    $("#Coup_cancel").toggle(false);
    
    cDateRange = $('#CoupRange').val();
    cStartDate = $('#Coup_startDate').val();
    cEndDate = $('#Coup_endDate').val();
    cCoupon = $('#CoupName').val();

    arr.push('"' + dateRange + '"');
    arr.push('"' + cDateRange + '"');
    arr.push('"' + cStartDate + '"');
    arr.push('"' + cEndDate + '"');

    if (arr[0] === '"< ANY >"') {
        arr[0] = '""'
    };

    if (arr[1] === '"< ANY >"') {
        arr[1] = '""'
    };

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];
        };
    });

    $("#Coup_box").find('*').prop("disabled", true);
    $("#Coup_box2").find('*').prop("disabled", true);

    $("#Coup_hdr").toggle(true);
    $("#Coup_ftr").toggle(true);

    invLogTable = $('#Couptable').DataTable({
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                title: 'Item Edit Log ' + todayString()
            },            
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'portrait',
                title: 'Item Edit Log',
                header: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'History Start: ' + cstart + '\n' +
                                'History End: ' + cend + '\n' +
                                'Report Run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Item Edit Log ' + todayString(),
                footer: true,
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(3n) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'History Start: ' + cstart + '<br>' +
                        'History End: ' + cend );

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        ajax: {
            url: "getItemEditLog?",
            data: {
                cDateSelect: dateRange,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate,
                cCoupon: cCoupon
            },
            type: "POST"
        },
        "columns": [
            { "data": "date",    "width": "8%" },
            { "data": "time",    "width": "7%" },
            { "data": "clerk",   "width": "10%" },
            { "data": "station", "width": "10%" },
            { "data": "module",  "width": "10%" },
            { "data": "field",   "width": "10%" },
            { "data": "before",  "width": "10%" },
            { "data": "after",   "width": "10%" },
            { "data": "barcode", "width": "10%" },
            { "data": "item",    "width": "15%" }
        ],
        order: [[0, 'asc'],[1, 'asc']],
        "fnDrawCallback": function () {
            $("#Coup_waitp").toggle(false);
            $("#Couptablewrapper").toggle(true);
            $('#CoupDivTitle').css('height','30px');
            $('#CoupDivTitle').text('Item Edit Log');
            $("#CoupDivTitle").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        },
        initComplete: function () {
            $.spin('false');
        }
    });

    $('#Couptable').off('length.dt');
    $('#Couptable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("invLogLength", len);
        }
    });

    $("#Coup_cancel").prop("value", "Done");
    $("#Coup_cancel").css("margin-right", "20px");
    $("#Coup_cancel").toggle(true);
}
////// End Item Edit Report \\\\\\

////// Begin Edit Receiver Utility \\\\\\
function showReceiverEdit(lFromWithin) {
    if (!lFromWithin) {
        $("#Coup_date_last").prop("checked", true);
        $("#Coup_date_custom").prop("checked", false);
        $("#CoupRange").val('week');
        CoupStandardDate();
    } else {
        var dateRange = $('input[name=Coup_dateRange]:checked').val();

        if (dateRange === '1') {
            CoupStandardDate();
        } else {
            CoupCustomDate();
        };
    }
    
    $('#Coup_criteria').toggle(false);
    $('#Coup_dates').css('float','none');
    $('#Coup_dates').css('margin-left','auto');
    $('#Coup_dates').css('margin-right','auto');

    $('#Coup_select').toggle(true);
    $('#coupClose').toggle(false);

    $("#Coup_hdr").toggle(false);
    $("#CoupDivTitle").toggle(false);
    $("#Couptablewrapper").toggle(false);

    $('#Coup_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    $('#coupHeaderTitle').text('Receiver Edit Utility');
    $('#Coup_hdr').html('<tr><th id="Coup_col6">Receiver #</th><th id="Coup_col1">Date</th><th id="Coup_col2">Time</th><th id="Coup_col3">User</th><th id="Coup_col4">Vendor</th><th id="Coup_col5">Purchase Order #</th><th id="Coup_col7">Vendor Invoice #</th><th id="Coup_col8">Total</th><th id="Coup_col9">Row_Id</th></tr>');
    $('#Coup_ftr').remove();

    $('#coupClose').off('click');
    $('#Coup_cancel').off('click');
    $('#Coup_submit').off('click');
    
    $('#coupClose').on('click', function(event) { event.stopPropagation(); closeReceiverEdit(true); } );
    $('#Coup_cancel').on('click',function(event) { event.stopPropagation(); closeReceiverEdit(false); } );
    $('#Coup_submit').on('click',function(event) { event.stopPropagation(); getReceiverEdit(); } );    

    $("nav").css('z-index', -1);
    $("#Modal_Coup").toggle(true);
    $("#tab_util").toggle(false);
}

function closeReceiverEdit(lFromWithin) {
    var wait = $('#Coup_waitp');
    var isVisible = wait.is(':visible');

    $("#Coup_box").find('*').prop("disabled", false);
    $("#Coup_box2").find('*').prop("disabled", false);

    if ($.fn.dataTable.isDataTable("#Couptable")) {
        receiverEditTable.clear().destroy(false);
        $('.editor-datetime').remove();
        $('#Coup_waitp').toggle(true);
        $("#Coup_hdr").toggle(false);
        $("#Coup_ftr").toggle(false);
        $("#CoupDivTitle").toggle(false);
        $("#Couptablewrapper").toggle(false);
    };

    $("#CoupInfo").text("");

    $("#Coup_submit").toggle(true);
    $("#Coup_cancel").prop("value", "Cancel");
    $("#Coup_cancel").css("margin-right", "10px");

    $("#Coup_date_last").prop("disabled", false);
    $("#Coup_date_custom").prop("disabled", false);
    $("#CoupRange").prop("disabled", false);
    $("#Coup_startDate").prop("disabled", false);
    $("#Coup_endDate").prop("disabled", false);

    if (lFromWithin) {
        showReceiverEdit(true);
    } else {
        // restore coupon report items...
        $('#Couptable').off('click');
        $('#Coup_criteria').toggle(true);
        $('#Coup_dates').css('float','left');
        $('#Coup_dates').css('margin-left','');
        $('#Coup_dates').css('margin-right','');
        $('#Coup_hdr').html('<tr><th id="Coup_col1">Invoice</th><th id="Coup_col2">Clerk</th><th id="Coup_col3">Date</th><th id="Coup_col4">Time</th><th id="Coup_col5">Coupon Type</th><th id="Coup_col6">Coupon $</th><th id="Coup_col7">Sale Total</th><th id="Coup_col8">GM $</th><th id="Coup_col9">GM %</th></tr>');
        $("#Couptable").append('<tfoot id="Coup_ftr" style="display: none;"><tr><td id="Coup_ftr1">Totals:</td><td id="Coup_ftr2"></td><td id="Coup_ftr3"></td><td id="Coup_ftr4"></td><td id="Coup_ftr5"></td><td id="Coup_ftr6"></td><td id="Coup_ftr7"></td><td id="Coup_ftr8"></td><td id="Coup_ftr9"></td></tr></tfoot>');
        $('#CoupDivTitle').css('height','70px');

        $('#coupClose').off('click');
        $('#Coup_cancel').off('click');
        $('#Coup_submit').off('click');    
            
        $("nav").css('z-index', 999);
        $("#Modal_Coup").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    }
}

function getReceiverEdit() {
    var arr = [];
    var dateRange = $('input[name=Coup_dateRange]:checked').val();
    var table = $("#Couptable");
    var thdr = document.getElementById("Coup_hdr");
    var cstart = '';
    var cend = '';
    var cnbr = '';
    var cCoupon;
    var cDateRange = '';
    var cStartDate = '';
    var cEndDate = '';
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("recvEditLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $('.selectCouprange').children().prop("disabled", true);

    if (dateRange === '2' && ($('#Coup_startDate').val() === '' || $('#Coup_endDate').val() === '')) {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
        return;
    };

    $.spin('true');

    $('#Coup_select').toggle(false);
    $('#coupClose').toggle(true);
    
    $("#Coup_submit").toggle(false);
    $("#Coup_cancel").toggle(false);
    
    cDateRange = $('#CoupRange').val();
    cStartDate = $('#Coup_startDate').val();
    cEndDate = $('#Coup_endDate').val();
    cCoupon = $('#CoupName').val();

    arr.push('"' + dateRange + '"');
    arr.push('"' + cDateRange + '"');
    arr.push('"' + cStartDate + '"');
    arr.push('"' + cEndDate + '"');

    if (arr[0] === '"< ANY >"') {
        arr[0] = '""'
    };

    if (arr[1] === '"< ANY >"') {
        arr[1] = '""'
    };

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cnbr = data[0][2];
        };
    });

    $("#Coup_box").find('*').prop("disabled", true);
    $("#Coup_box2").find('*').prop("disabled", true);

    $("#Coup_hdr").toggle(true);
    $("#Coup_ftr").toggle(true);

    receiverEditTable = $('#Couptable').DataTable({
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
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
                title: 'Receiver Edit Utility ' + todayString()
            },            
            {
                extend: 'pdf',
                text:   svgPdf,
                titleAttr: '  PDF File  ',
                message: '__MESSAGE__',
                orientation: 'portrait',
                title: 'Receiver Edit Utility',
                header: true,
                customize: function (doc) {
                    doc.content.forEach(function (content) {
                        if (content.style == 'message') {
                            content.text = 'Selections:\n' +
                                'History Start: ' + cstart + '\n' +
                                'History End: ' + cend + '\n' +
                                'Report Run: ' + todayString()
                        }
                    })
                }
            },
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'landscape',
                title: 'Receiver Edit Utility ' + todayString(),
                footer: true,
                customize: function (window) {
                    $(window.document.head)
                        .append('<style>td:nth-child(3n) { text-align: right; }</style>');

                    $(window.document.body)
                        .css('font-size', '12px')
                        .css('font-family', 'verdana, sans-serif');

                    $(window.document.body).find('div')
                        .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                        'History Start: ' + cstart + '<br>' +
                        'History End: ' + cend );

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');

                    window.document.close();
                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            }
        ],
        ajax: {
            url: "getReceiverEdit?",
            data: {
                cDateSelect: dateRange,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate,
                cCoupon: cCoupon
            },
            type: "POST"
        },
        "columns": [
            { "data": "recv_num", "width": "10%" },
            { "data": "date",     "width": "10%", "class": "mscEditCell" },
            { "data": "time",     "width": "10%" },
            { "data": "clerk",    "width": "10%" },
            { "data": "vendor",   "width": "30%" },
            { "data": "po_num",   "width": "10%" },
            { "data": "inv_num",  "width": "12%" },
            { "data": "total",    "width": "8%" },
            { "data": "DT_RowId" }
        ],
        columnDefs: [
            { targets: [8], visible: false },
            { type: 'num-fmt', targets: [7] },
            { className: 'numericCol', targets: [7] }
        ],
        select: {
            style: 'single',
            selector: 'td:first-child',
            blurable: true
        },
        order: [[0, 'asc']],
        "fnDrawCallback": function () {
            $("#Coup_waitp").toggle(false);
            $("#Couptablewrapper").toggle(true);
            $('#CoupDivTitle').css('height','30px');
            $('#CoupDivTitle').text('Receiver Edit Utility');
            $("#CoupDivTitle").toggle(true);
            $('.dataTables_length').css('padding-top', '0.755em');
            $('.dataTables_length').css('padding-left', '0.755em');
            if (ntimes < 1) {
                $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
            };
            ntimes++;
        },
        initComplete: function () {
            $.spin('false');
        }
    });

    // Activate an inline edit on click of a table cell
    $('#Couptable').off('click');
    $('#Couptable').on( 'click', 'tbody td:nth-child(2)', function (e) {
        receiverEditor.inline( this );
    } );

    receiverEditor.on( 'initSubmit', function (e, action) {
        $.spin('true');
      } );    
    
      receiverEditor.on( 'submitComplete', function (e, action) {
        $.spin('false');
      } );    
    
    
    $('#Couptable').off('length.dt');
    $('#Couptable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("recvEditLength", len);
        }
    });

    $("#Coup_cancel").prop("value", "Done");
    $("#Coup_cancel").css("margin-right", "20px");
    $("#Coup_cancel").toggle(true);
}
////// End Edit Receiver Utility \\\\\\

////// Begin Daily Summary \\\\\\
function showDailySummReport(param) {

    $("#dailySumm_hdr").toggle(false);
    $("#dailySummtablewrapper").toggle(false);

    $('#daily_dates .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });

    var $input = $('#daily_startDate').pickadate();
    var picker = $input.pickadate('picker');
    var d = new Date();
    d.setDate(d.getDate() - 1);
    picker.set('select', d, { format: 'mm-dd-yyyy' });

    $("#dailyConsolidate").toggle( doDash && sLevel === "0" && $("#multiStoreSet_Say").text() === 'Multi-Store ON'  &&  $('#multiStoreSet').prop('disabled') === false );

    dailyRetrieveSettings(param);

}

function getDailyPeriods(cSel) {
    $.post("dailyGetPeriods?",
        { select: cSel },
        function (data) {
            if (data.periods.length > 0) {
                $('#dailyAdHocPeriod').empty();
                var oSelect = document.getElementById("dailyAdHocPeriod");
                for (var i = 0; i < data.periods.length; i++) {
                    var el = document.createElement("option");
                    el.textContent = data.periods[i][1];
                    el.value = data.periods[i][0];
                    oSelect.appendChild(el);
                };
            };
        })
}

function dailyRetrieveSettings(param) {
    $.post("dailyGetSettings?", "", function (data) {
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $(data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
            }
        });

        $("#dailyEmailAddy").val(data.cAddy);
        
        if (data.deptToggle) {
            dailyDeptToggle = data.deptToggle;
        }

        if (data.periods.length > 0 && $('#dailyAdHocPeriod option').size() === 0) {
            var select = document.getElementById("dailyAdHocPeriod");
            for (var i = 0; i < data.periods.length; i++) {
                var el = document.createElement("option");
                el.textContent = data.periods[i][1];
                el.value = data.periods[i][0];
                select.appendChild(el);
            };
        };

        if (!param) {
            $("#dailyAdHocPeriod").val('0').change();
        }

        dailyAutoToggle();

        if ($("input:radio[name='dailyAdHoc']:checked").val() !== "2") {
            $("#dailyAdHocPeriod").prop("disabled", true);
        };

        //************* remove when final *****************//
        $("#dailyAuto").prop("disabled", true);          //
        $("#dailyAdHocCustom").prop("disabled", true);   //
        $("#daily_startDate").prop("disabled", true);    //
        $("#daily_endDate").prop("disabled", true);      //
        $("#dailyAdHocCustom").toggle(false);              //
        $("label[for='dailyAdHocCustom']").toggle(false);  //
        $("#daily_startDate").toggle(false);               //
        $("label[for='daily_startDate']").toggle(false);   //
        $("#daily_endDate").toggle(false);                 //
        $("label[for='daily_endDate']").toggle(false);     //
        //*************************************************//

        $("nav").css('z-index', -1);
        $("#Modal_DailySumm").toggle(true);
        $("#tab_rept").toggle(false);
    });
}

function toggleDailyAdHocSelect() {
    $("#dailyAdHocPeriod").prop("disabled", $("input:radio[name='dailyAdHoc']:checked").val() !== "2");
}

function saveDaily() {
    var inpObj = document.getElementById("dailyEmailAddy");
    var value = $.trim($("#dailyEmailAddy").val());
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;

    if ($("#dailyEmail").is(":checked") && (!testEmail.test(value) || value.length === 0)) {
        swal({
            title: 'Error',
            text: 'Please enter a valid email address.',
            type: 'error'
        },
            function () {
                $("#dailyEmailAddy").css("border-color", "red");
                $("#dailyEmailAddy").focus();
            });
    } else {
        $("#dailyEmailAddy").css("border-color", "");

        if (!$("#dailyEmail").is(":checked")) {
            $("#dailyEmailAddy").val("");
        };

        $.post("dailySaveSettings?", {
            dailyAuto: $("#dailyAuto").is(":checked"),
            dailySave: $("#dailySave").is(":checked"),
            dailyEmail: $("#dailyEmail").is(":checked"),
            dailyMonthly: $("#dailyMonth").is(":checked"),
            daily12Per: $("#daily12Per").is(":checked"),
            daily13Per: $("#daily13Per").is(":checked"),
            dailyEmailAddy: $("#dailyEmailAddy").val()
        },
            function (data) {
                swal("Success", "Your setting have been saved.", "success");
            }
        );
    };
}

function closeDailySumm(param) {
    var wait = $('#daily_waitp');

    $('#dailySumm_select').toggle(true);

    $("#daily_box").find('*').prop("disabled", false);
    $("#daily_box2").find('*').prop("disabled", false);

    $("#dailySumm_hdr").toggle(false);
    $("#dailySummTableDiv").css("top", "");
    $("#dailySummtablewrapper").toggle(false);

    $('#dailySummDivTitle').css( {"display": "block", "width": "100%", "text-align": "center"} );
    $("#dailySummDivTitle").html("Daily Summary");
    $("#dailySummDivTitle").toggle(false);

    $('#consolidatedInfo').remove();

    $('#dailySumm_waitp').toggle(true);

    //if ($.fn.DataTable.isDataTable('#dailySummTable')) {
    if (param) {
        dailySummTable.clear()
        dailySummTable.destroy(false);
        dailySummTable = null;
        $('#dailySummHdrRow th:nth-child(n+33)').remove();
    };

    $("#daily_submit").toggle(true);

    $("#daily_startDate").prop("disabled", false);
    $("#daily_endDate").prop("disabled", false);
    $("#daily_submit").prop("disabled", false);

    if (!param) {
        $("nav").css('z-index', 999);
        $("#Modal_DailySumm").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    } else {
        //                    $('#dailyHdrRow th:nth-child(n+29)').remove();
        showDailySummReport(true);
    };
}

function dailyAutoToggle() {
    if ($("#dailyAuto").is(":checked")) {
        $("#dailySave").prop("disabled", false);
        $("label[for='dailySave']").css("color", "black");
        $("#dailyEmail").prop("disabled", false);
        $("label[for='dailyEmail']").css("color", "black");
        dailyEmailToggle();
    } else {
        $("#dailySave").prop("disabled", true);
        $("label[for='dailySave']").css("color", "lightgray");
        $("#dailyEmail").prop("disabled", true);
        $("label[for='dailyEmail']").css("color", "lightgray");
        $("#dailyEmailAddy").prop("disabled", true);
    };
}

function dailyEmailToggle() {
    if ($("#dailyEmail").is(":checked")) {
        $("#dailyEmailAddy").prop("disabled", false);
    } else {
        $("#dailyEmailAddy").css("border-color", "");
        $("#dailyEmailAddy").prop("disabled", true);
    };
}

function getDailySummReport() {
    var ntimes = 0;

    $("#dailySumm_waitp").html('<img src="images/spinner.gif" alt="Procesing..." style="width:128px;height:128px;" />');

    $('#dailySumm_select').toggle(false);

    $.post("dailyGetReport?",
        {
            dailyMonthly: $("#dailyMonth").is(":checked"),
            daily12Per: $("#daily12Per").is(":checked"),
            daily13Per: $("#daily13Per").is(":checked"),
            dailyAdHoc: $("input:radio[name='dailyAdHoc']:checked").val(),
            dailyAdHocPeriod: $("#dailyAdHocPeriod").val(),
            startDate: $("#daily_startDate").val(),
            endDate: $("#daily_endDate").val()
        },
        function (data, status) {
            var d = new Date();
            var tbl = $('#dailySummTable');
            var nDept = data.aDept.length;
            var aNumCols = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
            var aDeptCols = [];
            var cDepTog;
            var nCol;
            var excelArray = [];
            var colArray = [
                { data: "icon" },
                { data: "date" },
                { data: "yrago" },
                { data: "sales" },
                { data: "salesdiff" },
                { data: "coupon" },
                { data: "tax" },
                { data: "exempt" },
                { data: "untaxed" },
                { data: "gcsold" },
                { data: "payments" },
                { data: "housechg" },
                { data: "cash" },
                { data: "checks" },
                { data: "act_cash" },
                { data: "cashdiff" },
                { data: "mc_visa" },
                { data: "amex" },
                { data: "discover" },
                { data: "giftcert" },
                { data: "numitems" },
                { data: "yragoitems" },
                { data: "itemsdiff" },
                { data: "numinv" },
                { data: "yragoinv" },
                { data: "invdiff" },
                { data: "avgsale" },
                { data: "avgitem" },
                { data: "cost" },
                { data: "grprofit" },
                { data: "markup" },
                { data: "margin" }
            ];

            if (dailyDeptToggle === 'SHOW') {
                cDepTog = svgHide;
            } else {
                cDepTog = svgShow;
            }

            var cDept;
            var cPerc;
            var colCount = $("#dailySummHdrRow").children().length;

            for (i = 0; i < nDept; i++) {
                if (colCount === 32 ) {
                    $("#dailySummHdrRow").append("<th>" + data.aDept[i] + "</th>");
                    $("#dailySummHdrRow").append("<th>%</th>");
                }
                nCol = 32 + i;
                aDeptCols.push(nCol);
                cDept = 'Dept_' + parseInt(i + 1);
                cPerc = 'DPerc_' + parseInt(i + 1);
                colArray.push({ data: cDept, class: 'numericCol' });
                colArray.push({ data: cPerc, class: 'numericCol' });
            }
            if (colCount === 32 ) {                
                $("#dailySummHdrRow").append("<th>Notes</th>");
                $("#dailySummHdrRow").append("<th>DT_RowId</th>");
            }
            colArray.push({ data: "notes" });
            colArray.push({ data: "DT_RowId" });

            for (i = 0; i < colArray.length - 2; i++) {
                excelArray[i] = i + 1;
            }

            dailySummTable = $('#dailySummTable').DataTable({
                ordering: false,
                "scrollX": "200%",
                "scrollXInner": "110%",
                dom: 'Brt',
                lengthChange: false,
                pageLength: 42,
                buttons: [{
                    extend: 'excel',
                    text: svgExcel,
                    titleAttr: '  Excel File  ',
                    filename: 'Daily Summary ' + todayString(),
                    exportOptions: {
                        columns: excelArray,
                        format: {
                            body: function (data, row, column, node) {
                                data = $('<p>' + data + '</p>').text();
                                return $.isNumeric(data.replace(',', '')) ? data.replace(',', '') : data;
                            }
                        }
                    },
                    customize: function (xlsx) {
                        var sheet = xlsx.xl.worksheets['sheet1.xml'];
                        $('row:nth-child(8n+1) c', sheet).each(function () {
                            $(this).attr('s', '15');
                        });
                        $('row:last-child c', sheet).each(function () {
                            $(this).attr('s', '15');
                        });
                        $('row:first-child c', sheet).each(function () {
                            $(this).attr('s', '7');
                        });
                    }
                },
                {
                    extend: 'print',
                    text: svgPrint,
                    titleAttr: '  Print  ',
                    orientation: 'landscape',
                    exportOptions: {
                        columns: excelArray
                    },
                    title: 'Daily Summary ' + data.title,
                    customize: function (window) {
                        var nVcols;
                        var nColAdj = 0;
                        var visCol = dailySummTable.columns().visible();
                        var nRows = dailySummTable.rows().count();

                        // remove icon and DT_RowId columns (already out of excelArray)
                        visCol.pop();
                        visCol.splice(0, 1);
                        visCol[visCol.length - 1] = true;

                        var nDel = 0;
                        for (i = 0; i < visCol.length; i++) {
                            if (!visCol[i]) {
                                $(window.document.body).find('table').find('th').eq(i - nDel).remove();
                                nDel++
                            }
                        }

                        for (i2 = 1; i2 <= nRows; i2++) {
                            nDel = 0;
                            for (i = 0; i < visCol.length; i++) {
                                if (!visCol[i]) {
                                    $(window.document.body).find('table').find('tr').eq(i2).find('td').eq(i - nDel).remove();
                                    nDel++
                                }
                            }
                        }

                        var str;
                        $(window.document.body).find('table').find('th').each(function () {
                            str = $(this).text();
                            $(this).html(str.replace(' ', '<br>'));
                        });

                        nVcols = $(window.document.body).find('table th').length;

                        $(window.document.head).append('<style>table th {word-wrap:break-word;}</style>');
                        $(window.document.head).append('<style>table td {word-wrap:break-word;}</style>');
                        $(window.document.head).append('<style>@media print {table {page-break-after: always;}</style>');
                        $(window.document.head).append('<style type="text/css" media="print">@page { size: landscape; }</style>');
                        $(window.document.body).css("background-color", "white");
                        $(window.document.body).find('h1').css({ "font-size": "125%", "font-family": "sans-serif, arial", "text-align": "center" });
                        $(window.document.body).find('table').css({ "font-family": "sans-serif, arial" });
                        $(window.document.body).find('table th').css({ "background-color": "#faf6d1" });
                        $(window.document.body).find('table td').css({ "padding": "2px 4px" });
                        $(window.document.body).find('table td:not(:first-child)').css("text-align", "right");
                        $(window.document.body).find('table td:last-child').css("text-align", "left");
                        $(window.document.body).find('table td').each(function () {
                            if (($(this).index() == 3 || $(this).index() == 12) && parseFloat($(this).text().replace(/,/g, '')) < 0) {
                                $(this).css('color', 'red');
                            } else if ($(this).index() == 11) {
                                $(this).css({
                                    "background-color": "yellow"
                                });
                            }
                        });
                        $(window.document.body).find('tr:contains("**") td').each(function (index) {
                            $(this).css('background-color', 'AquaMarine');
                        });
                        if (nVcols > 15) {
                            $(window.document.body).clone('table').appendTo(window.document.body);
                        }
                        if (nVcols > 45) {
                            nColAdj = nVcols - 45;
                            var npixs = nColAdj * 90
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('table').eq(4).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                            $(window.document.body).find('h1').eq(2).append("<span style='float: right; font-size: 12px;'>Page 3");
                            $(window.document.body).find('h1').eq(3).append("<span style='float: right; font-size: 12px;'>Page 4");
                            $(window.document.body).find('h1').eq(4).append("<span style='float: right; font-size: 12px;'>Page 5");
                        } else if (nVcols > 35) {
                            nColAdj = nVcols - 35;
                            var npixs = nColAdj * 90
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('table').eq(3).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                            $(window.document.body).find('h1').eq(2).append("<span style='float: right; font-size: 12px;'>Page 3");
                            $(window.document.body).find('h1').eq(3).append("<span style='float: right; font-size: 12px;'>Page 4");
                        } else if (nVcols > 25) {
                            nColAdj = nVcols - 25;
                            var npixs = nColAdj * 90
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('table').eq(2).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                            $(window.document.body).find('h1').eq(2).append("<span style='float: right; font-size: 12px;'>Page 3");
                        } else if (nVcols > 15) {
                            var npixs = (nVcols - 15) * 90
                            $(window.document.body).find('table').eq(1).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                        }
                        for (i = 1; i < (nVcols - 14); i++) {
                            $(window.document.body).find('table').eq(0).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                        }
                        if (nVcols > 15) {
                            for (i = 1; i < 15; i++) {
                                $(window.document.body).find('table').eq(1).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }
                        if (nVcols > 25) {
                            for (i = 1; i <= nVcols - 25; i++) { //nColAdj; i++ ) {
                                $(window.document.body).find('table').eq(1).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                            }
                            for (i = 1; i < 25; i++) { //(nVcols-nColAdj); i++ ) {
                                $(window.document.body).find('table').eq(2).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }
                        if (nVcols > 35) {
                            for (i = 1; i <= nVcols - 35; i++) {
                                $(window.document.body).find('table').eq(2).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                            }
                            for (i = 1; i < 35; i++) { //(nVcols-nColAdj); i++ ) {
                                $(window.document.body).find('table').eq(3).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }
                        if (nVcols > 45) {
                            for (i = 1; i <= nVcols - 45; i++) {
                                $(window.document.body).find('table').eq(3).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                            }
                            for (i = 1; i < 45; i++) { //(nVcols-nColAdj); i++ ) {
                                $(window.document.body).find('table').eq(4).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }

                        window.document.close();
                        window.onafterprint = function(event) {  window.close(); };                        
                        window.print();                       
                    }
                },
                {
                    extend: 'colvis',
                    text: svgColVis,
                    titleAttr: '  Toggle Columns  ',
                    columns: aNumCols
                },
                {
                    text: (dailyDeptToggle === 'SHOW' ? svgHide : svgShow),
                    titleAttr: (dailyDeptToggle === 'SHOW' ? '  Hide Depts  ' : '  Show Depts  '),
                    action: function (e, dt, node, config) {
                        var cText = this.text();
                        $.spin('true');
                        if (dailyDeptToggle === 'SHOW') {
                            for (var i = 0; i < 2*nDept; i++) {
                                dailySummTable.column(32 + i).visible(false, true);
                            }
                            dailySummTable.columns.adjust().draw(false);
                            this.text(svgShow);
                            $('#svgHideShow').parent().parent().attr('title','  Show Depts  ');
                            dailyDeptToggle = 'HIDE';
                        } else {
                            for (var i = 0; i < 2*nDept; i++) {
                                dailySummTable.column(32 + i).visible(true, true);
                            }
                            dailySummTable.columns.adjust().draw(false);
                            this.text(svgHide);
                            $('#svgHideShow').parent().parent().attr('title','  Hide Depts  ');
                            dailyDeptToggle = 'SHOW';
                        }
                        $.spin('false');
                        $.post("dailyDeptToggleSetting?", { cText: dailyDeptToggle });
                    }
                },
                {
                    text: svgClose,
                    titleAttr: '  Close  ',
                    action: function (e, dt, node, config) {
                        closeDailySumm(true);
                    }
                }
                ],
                data: data.data,
                columns: colArray,
                columnDefs: [
                    { type: 'num-fmt', targets: aNumCols },
                    { className: 'numericCol', targets: aNumCols },
                    { className: 'iconCell', targets: [0] }, // { visible: (dailyDeptToggle === 'SHOW'), targets: aDeptCols },
                    { targets: [32 + 2*nDept, 33 + 2*nDept], visible: false, searchable: false, orderable: false }
                ],
                order: [[33 + 2*nDept, 'asc']],
                select: { style: 'single' },
                "rowCallback": function (row, data, index) {
                    if (data.date === '**WEEK**' || data.date === '**PERIOD**' || data.date === '**MONTH**') {
                        $('td', row).css({ "background-color": "MediumAquaMarine", "color": "black" });
                    } else {
                        $('td:eq(14)', row).css({
                            "background-color": "yellow",
                            "font-weight": "bolder"
                        });
                    }
                },
                "fnDrawCallback": function () {
                    var str = data.title
                    $("#dailySummDivTitle").html("Daily Summary<br><span style='font-size: 14px;'>" +
                        str + "</span>")
                    $("#dailySumm_waitp").toggle(false);
                    $("#dailySumm_waitp").text("Data View");
                    $("#dailySumm_hdr").toggle(true);
                    $("#dailySummtablewrapper").toggle(true);
                    $("#dailySummDivTitle").toggle(true);
                    /*
                    $("#dailyTable_wrapper .dt-buttons")
                        .contents()
                        .filter(function (index) {
                            return index === 2;
                        })
                        .css("color", "#FF0000");
                    */
                    $('td').each(function () {
                        if ($(this).index() > 1 && parseFloat($(this).text().replace(/,/g, '')) < 0) {
                            $(this).css('color', 'red');
                        }
                    });
                },
                initComplete: function () {
                    if (dailyDeptToggle==='HIDE') {
                        for (var i = 0; i < 2*nDept; i++) {
                            $("#dailySummTable").DataTable().column(32 + i).visible(false, true);
                        }
                        $("#dailySummTable").DataTable().columns.adjust().draw(false);
                    }
                }  
            });

            // Activate an inline edit on click of actual cash cells
            dailySummTable.off( "click"); // in case consolidated was up...
            dailySummTable.off( "dblclick"); // in case consolidated was up...
            dailySummTable.on('click', 'tbody tr td', function (e, dt, type, indexes) {
                var myRow = this.parentNode;
                var cellText = $(this).parent().find(':nth-child(2)').text();
                var cell = $(this);
                if ($(this).index() == 14 && cellText != '**WEEK**' && cellText != '**PERIOD**' && cellText != '**MONTH**') {
                    cell.css('background-color', 'white');
                    dailyCashEditor.inline(this, { onBlur: 'submit' });
                    dailyCashEditor.on('preSubmit', function (e, data) {
                        data.rowData = dailySummTable.row(myRow).data();
                    });
                    dailyCashEditor.on('postEdit', function () {
                        $.post("dailyGetReport?",
                            {
                                dailyMonthly: $("#dailyMonth").is(":checked"),
                                daily12Per: $("#daily12Per").is(":checked"),
                                daily13Per: $("#daily13Per").is(":checked"),
                                dailyAdHoc: $("input:radio[name='dailyAdHoc']:checked").val(),
                                dailyAdHocPeriod: $("#dailyAdHocPeriod").val(),
                                startDate: $("#daily_startDate").val(),
                                endDate: $("#daily_endDate").val()
                            },
                            function (newData, status) {
                                dailySummTable.clear().draw();
                                dailySummTable.rows.add(newData.data); // Add new data
                                dailySummTable.columns.adjust().draw();  // Redraw the DataTable                            
                            });
                    });
                    dailyCashEditor.on('preClose', function () {
                        cell.css('background-color', 'yellow');
                    });
                } else if ($(this).index() == 0 && cellText != '**WEEK**' && cellText != '**PERIOD**' && cellText != '**MONTH**') {
                    dailyNoteEditor.edit($(this).closest('tr'), { title: 'Notes for ' + cellText, buttons: 'Update' });
                    dailyNoteEditor.on('preSubmit', function (e, data) {
                        data.rowData = dailySummTable.row(myRow).data();
                    });
                }
            });
        }
    )
    .fail(function (xhr, ajaxOptions, thrownError) {
        swal("Oops...", "error: " + thrownError, "error");
        $("#dailySumm_waitp").text("Data View");
        $('#dailySumm_select').toggle(true);
    });
}

function consolidateDailyReports() {
    var ntimes = 0;

    $.spin('true');
    $('#dailySumm_select').toggle(false);

    $.post("consolidateDailyReports?",
        {
            dailyMonthly: $("#dailyMonth").is(":checked"),
            daily12Per: $("#daily12Per").is(":checked"),
            daily13Per: $("#daily13Per").is(":checked"),
            dailyAdHoc: $("input:radio[name='dailyAdHoc']:checked").val(),
            dailyAdHocPeriod: $("#dailyAdHocPeriod").val(),
            startDate: $("#daily_startDate").val(),
            endDate: $("#daily_endDate").val()
        },
        function (data, status) {
            var d = new Date();
            var tbl = $('#dailySummTable');
            var nDept = data.aDept.length;
            var aNumCols = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
            var aDeptCols = [];
            var cDepTog;
            var nCol;
            var excelArray = [];
            var colArray = [
                { data: "icon" },
                { data: "date" },
                { data: "yrago", className: 'zoomCell' },
                { data: "sales", className: 'zoomCell' },
                { data: "salesdiff" },
                { data: "coupon", className: 'zoomCell' },
                { data: "tax", className: 'zoomCell' },
                { data: "exempt", className: 'zoomCell' },
                { data: "untaxed", className: 'zoomCell' },
                { data: "gcsold", className: 'zoomCell' },
                { data: "payments", className: 'zoomCell' },
                { data: "housechg", className: 'zoomCell' },
                { data: "cash", className: 'zoomCell' },
                { data: "checks", className: 'zoomCell' },
                { data: "act_cash", className: 'zoomCell' },
                { data: "cashdiff" },
                { data: "mc_visa", className: 'zoomCell' },
                { data: "amex", className: 'zoomCell' },
                { data: "discover", className: 'zoomCell' },
                { data: "giftcert", className: 'zoomCell' },
                { data: "numitems", className: 'zoomCell' },
                { data: "yragoitems", className: 'zoomCell' },
                { data: "itemsdiff" },
                { data: "numinv", className: 'zoomCell' },
                { data: "yragoinv", className: 'zoomCell' },
                { data: "invdiff" },
                { data: "avgsale" },
                { data: "avgitem" },
                { data: "cost", className: 'zoomCell' },
                { data: "grprofit" },
                { data: "markup" },
                { data: "margin" }
            ];

            if (dailyDeptToggle === 'SHOW') {
                cDepTog = svgHide;
            } else {
                cDepTog = svgShow;
            }

            var cDept;
            var cPerc;
            var colCount = $("#dailySummHdrRow").children().length;

            for (i = 0; i < nDept; i++) {
                if (colCount === 32) {
                    $("#dailySummHdrRow").append("<th>" + data.aDept[i] + "</th>");
                    $("#dailySummHdrRow").append("<th>%</th>");
                }
                nCol = 32 + i;
                aDeptCols.push(nCol);
                cDept = 'Dept_' + parseInt(i + 1);
                cPerc = 'DPerc_' + parseInt(i + 1);
                colArray.push({ data: cDept, className: ' numericCol zoomCell' });
                colArray.push({ data: cPerc, className: ' numericCol' });
            }
            if (colCount === 32) {
                $("#dailySummHdrRow").append("<th>Notes</th>");
                $("#dailySummHdrRow").append("<th>DT_RowId</th>");
            }
            colArray.push({ data: "notes" });
            colArray.push({ data: "DT_RowId" });

            for (i = 0; i < colArray.length - 2; i++) {
                excelArray[i] = i + 1;
            }

            dailySummTable = $('#dailySummTable').DataTable({
                ordering: false,
                "scrollX": "200%",
                "scrollXInner": "110%",
                dom: 'Brt',
                lengthChange: false,
                pageLength: 42,
                buttons: [{
                    extend: 'excel',
                    text: svgExcel,
                    titleAttr: '  Excel File  ',
                    filename: 'Consolidated Daily Summary ' + todayString(),
                    exportOptions: {
                        columns: excelArray,
                        format: {
                            body: function (data, row, column, node) {
                                data = $('<p>' + data + '</p>').text();
                                return $.isNumeric(data.replace(',', '')) ? data.replace(',', '') : data;
                            }
                        }
                    },
                    customize: function (xlsx) {
                        var sheet = xlsx.xl.worksheets['sheet1.xml'];
                        $('row:nth-child(8n+1) c', sheet).each(function () {
                            $(this).attr('s', '15');
                        });
                        $('row:last-child c', sheet).each(function () {
                            $(this).attr('s', '15');
                        });
                        $('row:first-child c', sheet).each(function () {
                            $(this).attr('s', '7');
                        });
                    }
                },
                {
                    extend: 'print',
                    text: svgPrint,
                    titleAttr: '  Print  ',
                    orientation: 'landscape',
                    exportOptions: {
                        columns: excelArray
                    },
                    title: 'Consolidated Daily Summary ' + data.title,
                    customize: function (window) {
                        var nVcols;
                        var nColAdj = 0;
                        var visCol = dailySummTable.columns().visible();
                        var nRows = dailySummTable.rows().count();

                        // remove icon and DT_RowId columns (already out of excelArray)
                        visCol.pop();
                        visCol.splice(0, 1);
                        visCol[visCol.length - 1] = true;

                        var nDel = 0;
                        for (i = 0; i < visCol.length; i++) {
                            if (!visCol[i]) {
                                $(window.document.body).find('table').find('th').eq(i - nDel).remove();
                                nDel++
                            }
                        }

                        for (i2 = 1; i2 <= nRows; i2++) {
                            nDel = 0;
                            for (i = 0; i < visCol.length; i++) {
                                if (!visCol[i]) {
                                    $(window.document.body).find('table').find('tr').eq(i2).find('td').eq(i - nDel).remove();
                                    nDel++
                                }
                            }
                        }

                        var str;
                        $(window.document.body).find('table').find('th').each(function () {
                            str = $(this).text();
                            $(this).html(str.replace(' ', '<br>'));
                        });

                        nVcols = $(window.document.body).find('table th').length;

                        $(window.document.head).append('<style>table th {word-wrap:break-word;}</style>');
                        $(window.document.head).append('<style>table td {word-wrap:break-word;}</style>');
                        $(window.document.head).append('<style>@media print {table {page-break-after: always;}</style>');
                        $(window.document.body).css("background-color", "white");
                        $(window.document.body).find('h1').css({ "font-size": "125%", "font-family": "sans-serif, arial", "text-align": "center" });
                        $(window.document.body).find('table').css({ "font-family": "sans-serif, arial" });
                        $(window.document.body).find('table th').css({ "background-color": "#faf6d1" });
                        $(window.document.body).find('table td').css({ "padding": "2px 4px" });
                        $(window.document.body).find('table td:not(:first-child)').css("text-align", "right");
                        $(window.document.body).find('table td:last-child').css("text-align", "left");
                        $(window.document.body).find('table td').each(function () {
                            if (($(this).index() == 3 || $(this).index() == 12) && parseFloat($(this).text().replace(/,/g, '')) < 0) {
                                $(this).css('color', 'red');
                            } else if ($(this).index() == 11) {
                                $(this).css({
                                    "background-color": "yellow"
                                });
                            }
                        });
                        $(window.document.body).find('tr:contains("**") td').each(function (index) {
                            $(this).css('background-color', 'AquaMarine');
                        });
                        if (nVcols > 15) {
                            $(window.document.body).clone('table').appendTo(window.document.body);
                        }
                        if (nVcols > 45) {
                            nColAdj = nVcols - 45;
                            var npixs = nColAdj * 90
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('table').eq(4).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                            $(window.document.body).find('h1').eq(2).append("<span style='float: right; font-size: 12px;'>Page 3");
                            $(window.document.body).find('h1').eq(3).append("<span style='float: right; font-size: 12px;'>Page 4");
                            $(window.document.body).find('h1').eq(4).append("<span style='float: right; font-size: 12px;'>Page 5");
                        } else if (nVcols > 35) {
                            nColAdj = nVcols - 35;
                            var npixs = nColAdj * 90
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('table').eq(3).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                            $(window.document.body).find('h1').eq(2).append("<span style='float: right; font-size: 12px;'>Page 3");
                            $(window.document.body).find('h1').eq(3).append("<span style='float: right; font-size: 12px;'>Page 4");
                        } else if (nVcols > 25) {
                            nColAdj = nVcols - 25;
                            var npixs = nColAdj * 90
                            $(window.document.body).find('body').eq(0).clone().appendTo(window.document.body);
                            $(window.document.body).find('table').eq(2).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                            $(window.document.body).find('h1').eq(2).append("<span style='float: right; font-size: 12px;'>Page 3");
                        } else if (nVcols > 15) {
                            var npixs = (nVcols - 15) * 90
                            $(window.document.body).find('table').eq(1).css({ "max-width": npixs, "float": "left" });
                            $(window.document.body).find('h1').eq(0).append("<span style='float: right; font-size: 12px;'>Page 1");
                            $(window.document.body).find('h1').eq(1).append("<span style='float: right; font-size: 12px;'>Page 2");
                        }
                        for (i = 1; i < (nVcols - 14); i++) {
                            $(window.document.body).find('table').eq(0).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                        }
                        if (nVcols > 15) {
                            for (i = 1; i < 15; i++) {
                                $(window.document.body).find('table').eq(1).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }
                        if (nVcols > 25) {
                            for (i = 1; i <= nVcols - 25; i++) { //nColAdj; i++ ) {
                                $(window.document.body).find('table').eq(1).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                            }
                            for (i = 1; i < 25; i++) { //(nVcols-nColAdj); i++ ) {
                                $(window.document.body).find('table').eq(2).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }
                        if (nVcols > 35) {
                            for (i = 1; i <= nVcols - 35; i++) {
                                $(window.document.body).find('table').eq(2).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                            }
                            for (i = 1; i < 35; i++) { //(nVcols-nColAdj); i++ ) {
                                $(window.document.body).find('table').eq(3).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }
                        if (nVcols > 45) {
                            for (i = 1; i <= nVcols - 45; i++) {
                                $(window.document.body).find('table').eq(3).find('tr').find('td:eq(-1),th:eq(-1)').remove();
                            }
                            for (i = 1; i < 45; i++) { //(nVcols-nColAdj); i++ ) {
                                $(window.document.body).find('table').eq(4).find('tr').find('td:eq(1),th:eq(1)').remove();
                            }
                        }

                        window.document.close();
                        window.onafterprint = function(event) {  window.close(); };                        
                        window.print();                       
                    }
                },
                {
                    extend: 'colvis',
                    text: svgColVis,
                    titleAttr: '  Toggle Columns  ',
                    columns: aNumCols
                },
                {
                    text: (dailyDeptToggle === 'SHOW' ? svgHide : svgShow),
                    titleAttr: (dailyDeptToggle === 'SHOW' ? '  Hide Depts  ' : '  Show Depts  '),
                    action: function (e, dt, node, config) {
                        var cText = this.text();
                        if (dailyDeptToggle === 'SHOW') {
                            for (var i = 0; i < 2*nDept; i++) {
                                dailySummTable.column(32 + i).visible(false, true);
                            }
                            dailySummTable.columns.adjust().draw(false);
                            this.text(svgShow);
                            $('#svgHideShow').parent().parent().attr('title', '  Show Depts  ');
                            dailyDeptToggle = 'HIDE';
                        } else {
                            for (var i = 0; i < 2*nDept; i++) {
                                dailySummTable.column(32 + i).visible(true, true);
                            }
                            dailySummTable.columns.adjust().draw(false);
                            this.text(svgHide);
                            $('#svgHideShow').parent().parent().attr('title', '  Hide Depts  ');
                            dailyDeptToggle = 'SHOW';
                        }
                        $.post("dailyDeptToggleSetting?", { cText: dailyDeptToggle });
                    }
                },
                {
                    text: svgClose,
                    titleAttr: '  Close  ',
                    action: function (e, dt, node, config) {
                        closeDailySumm(true);
                    }
                }
                ],
                data: data.data,
                columns: colArray,
                columnDefs: [
                    { type: 'num-fmt', targets: aNumCols },
                    { className: 'numericCol', targets: aNumCols },
                    //{ className: 'iconCell', targets: [0] }, // { visible: (dailyDeptToggle === 'SHOW'), targets: aDeptCols },
                    { targets: [32 + 2*nDept, 33 + 2*nDept], visible: false, searchable: false, orderable: false }
                ],
                order: [[33 + 2*nDept, 'asc']],
                select: { style: 'single' },
                "rowCallback": function (row, data, index) {
                    if (data.date === '**WEEK**' || data.date === '**PERIOD**' || data.date === '**MONTH**') {
                        $('td', row).css({ "background-color": "MediumAquaMarine", "color": "black" });
                    }
                },
                "fnDrawCallback": function () {
                    $("#dailySumm_waitp").toggle(false);
                    $("#dailySumm_waitp").text("Data View");
                    $("#dailySumm_hdr").toggle(true);
                    $("#dailySummtablewrapper").toggle(true);
                    $("#dailySummDivTitle").toggle(true);
                },
                initComplete: function () {
                    var str = data.title
                    var str = "";

                    $("#dailySummDivTitle").html("Daily Summary<br><span style='font-size: 14px;'>" + str + "</span>");
                    $.each(data.storeInfo, function (index, item) {
                        str += '<span style="cursor: context-menu;" title="' + item[1] + '">' + (((item[1] === 'OK') ? svgCheck : svgEx) + '&nbsp;' + item[0] + ' -- ' + item[1] + '</span>');
                        if (index < data.storeInfo.length) {
                            str += '<br>';
                        }
                    });

                    $('#dailySummDivTitle').css({ "display": "inline-block", "width": "50%", "text-align": "left" });
                    $("#dailySummDivTitle").html("Consolidated Daily Summary<br><span style='font-size: 14px;'>" + data.title + "</span>");

                    $('#dailySummDivTitle').after('<div class="TableDivTitles" id="consolidatedInfo">Store Polling:<br>' + 
                                                '<div class="TableDivTitles" id="consolidatedStoreList"></div>' + 
                                              '</div>');
                    $('#consolidatedStoreList').html(str);
                    $("[id='svgCheck']").css({ "position": "relative", "top": "4px", "width": "20", "height": "20" });
                    $("[id='svgEx']").css({ "position": "relative", "top": "4px", "width": "20", "height": "20" });

                    $('td').each(function () {
                        var cellText = $(this).parent().find(':nth-child(2)').text();
                        var cell = $(this);
                        if ($(this).index() > 1 && parseFloat($(this).text().replace(/,/g, '')) < 0) {
                            $(this).css('color', 'red');
                        } else if ($(this).index()===0 && $(this).text().length>1){
                            $(this).attr("class","iconCell");
                        }
                        if (cellText === '**WEEK**' || cellText === '**PERIOD**' || cellText === '**MONTH**') {
                            $(this).attr('class','numericCol');
                        }
                    });

                    if (dailyDeptToggle === 'HIDE') {
                        for (var i = 0; i < 2*nDept; i++) {
                            $("#dailySummTable").DataTable().column(32 + i).visible(false, true);
                        }
                        $("#dailySummTable").DataTable().columns.adjust().draw(false);
                    }

                    $.spin('false');
                }
            });

            // Pop up notes
            dailySummTable.off( 'dblclick' );  // clear callback from regular report...
            dailySummTable.off( 'click' );  // clear callback from regular report...
            dailySummTable.on('dblclick', 'tbody tr td', function (e, dt, type, indexes) {
                var myRow = this.parentNode;
                var d = dailySummTable.row( myRow ).data();
                var cellText = $(this).parent().find(':nth-child(2)').text();
                var dayNote = d.notes;
                var cell = $(this);
                var str = '<u><b>Notes for ' + cellText + '</b></u><br><br><span style="font-size: 12px;">' + dayNote + '</span>'
                if ($(this).index() == 0 && cellText != '**WEEK**' && cellText != '**PERIOD**' && cellText != '**MONTH**' && !(!dayNote || dayNote.length < 2)) {  // 
                    vex.dialog.alert({
                        unsafeMessage: str,               // unsafeMessage option allows html in text
                        className: 'vex-theme-noteVex'  // Overwrites defaultOptions                        
                    });
                    clearSelection();
                    dailySummTable.row(myRow).select();
                } else if ($(this).attr('class').includes('zoomCell')) {
                    $.post('consolidatedDataZoom?', 
                        { row: dailySummTable.row(myRow).index(), col: $(this).index(), xpf: data.memFile  },
                        function( data, status ) {
                            var zoomStr = "";
                            var zoomHdr = $('#dailyHdrRow').find(':nth-child('+(cell.index()+1)+')').text();
                            $.each(data.zoomData, function (index, item) {
                                zoomStr += item + '<br>'
                            });
                            vex.dialog.alert({
                                unsafeMessage: '<u><b>'+zoomHdr+'</b></u><br>'+zoomStr,               // unsafeMessage option allows html in text
                                className: 'vex-theme-wireframe'  // Overwrites defaultOptions                        
                            });
                            clearSelection();
                            dailySummTable.row(myRow).select();
                        }
                    ); 
                }
            });
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
            swal("Oops...", "error: " + thrownError, "error");
            $("#dailySumm_waitp").text("Data View");
            $('#dailySumm_select').toggle(true);
        });
}

///////////////

//////// BEGIN DAILY REPORT !!NOT!! SUMMARY \\\\\\\\\\
function showDailyTable(cPeriod) {
    var x = document.getElementById("Modal_Daily");
    var json;
    var customDate = '';
    var customDate2 = '';

    $.spin('true');

    if (!cPeriod) {
        $("#dailySelect").val( "yesterday" );
        cPeriod = 'yesterday';
    } else if (cPeriod === 'custom') {
        customDate = $('input[name="dailyDate"]').val();
        customDate2 = $('input[name="dailyDate2"]').val();
    }

    DailyTable = $('#DailyTable').DataTable({
        responsive: true,
        dom: 'Brt',
        pageLength: 99,
        buttons: [
            {
                extend: 'print',
                text: svgPrint,
                titleAttr: '  Print  ',
                orientation: 'portrait',
                title: function () {
                    var printTitle = $('#DailyTitle').text();
                    return printTitle;
                },
                customize: function (window) {
                    var now = new Date();
                    $(window.document.head)
                        .append('<style>td:nth-child(1) { text-align:left; width: 150px; }</style>')
                        .append('<style>td:nth-child(2) { width: 150px; }</style>')
                        .append('<style>td:nth-child(3) { text-align:left; width: 100px; }</style>')
                        .append('<style>table.dailyCardDetail {margin-left: 0}</style>')
                        .append('<style>table.dailyCardDetail td:nth-child(1) {width: 300px !important}</style>')
                        .append('<style type="text/css" media="print">@page { size: portrait; }</style>');

                    $(window.document.body)
                        .css({ "background-color": "white", "font-family": "verdana, sans-serif", "font-size": "12px" });

                    $(window.document.body).find('h1')
                        .css({ "text-align": "center", "font-size": "18px" });

                    $(window.document.body).find('thead').remove();

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css({ "font-size": "14px", 
                               "width": "90%",
                               "margin": "auto",
                               "border": "2px solid",
                               "border": "1px solid black" })
                        .find('tbody tr').each( function() {
                            var cText = $(this).find(':nth-child(2)').text();
                            if ( cText === 'Net Bottle Deposits' || cText === 'Gross Profit' || cText === 'Total' || cText === 'Total In' || cText === 'Total Bank' ) {
                                $(this).find(':nth-child(3)').css( {"text-decoration": "overline", "text-decoration-style": "double" } );
                            }
                        });

                    $(window.document.body).find('div:eq(1)')
                        .css({ "text-align": "right", 
                               "padding-top": "10px", 
                               "font-size": "12px", 
                               "position": "absolute", 
                               "bottom": "50px", 
                               "right": "75px" })
                        .text('Printed: ' + now.toLocaleDateString() + " at " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                    $(window.document.body).find('td:first-child').remove();

                    $(window.document.body).find('td').css({"padding": "2px", "background-color": "#ffffff"});

                    if ($('.ccRow').hasClass('shown')) {
                        var json  = DailyTable.ajax.json();
                        var cHTML = '<tr><td colspan="3">' + json.cards + '</td></tr>';
                        $(cHTML).insertAfter($(window.document.body).find('td:contains(Credit Cards)').parent());
                    }

                    $(window.document.body).find('.hilite-cell').removeClass('hilite-cell');
                    $(window.document.body).find('.material-icons').remove();

                    window.onafterprint = function(event) {  window.close(); };                        
                    window.print();                       
                }
            },
        ],
        ajax: "DailyReport('','" + cPeriod + "','" + customDate + "','" + customDate2 + "')",
        columns: [
            { classsName: "blank" },
            { "width": "200px" },
            { "width": "200px" },
            { "width": "100px" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [2] },
            { className: 'titleCell', targets: [1] },
            { className: 'numericCol', targets: [2] },
            { className: 'boldNumericCol', targets: [3] }
        ],
        ordering: false,
        initComplete: function () {
            $('#DailyTable tbody tr').each( function() {
                var cText = $(this).find(':nth-child(2)').text();
                var cAmt  = $(this).find(':nth-child(3)').text();
                var tr    = $(this).closest('tr');
                if (cText === 'Untaxed Items' && cAmt !== '0.00') {
                    $(this).find('td:eq(1)').append('&nbsp;<span class="material-icons" style="font-size: 14px;">open_in_new</span>')
                    $(this).find('td:eq(1)').addClass('hilite-cell');
                    $(this).find('td:eq(1)').on('click', function() { showDailyDetailTable( 'dailyUntaxed?'); });
                }
                if (cText === 'Tax Exempt Sales' && cAmt !== '0.00') {
                    $(this).find('td:eq(1)').append('&nbsp;<span class="material-icons" style="font-size: 14px;">open_in_new</span>')
                    $(this).find('td:eq(1)').addClass('hilite-cell');
                    $(this).find('td:eq(1)').on('click', function() { showDailyDetailTable( 'dailyExempt?'); });
                }
                if (cText === 'Gift Certificates Used' && cAmt !== '0.00') {
                    $(this).find('td:eq(1)').append('&nbsp;<span class="material-icons" style="font-size: 14px;">open_in_new</span>')
                    $(this).find('td:eq(1)').addClass('hilite-cell');
                    $(this).find('td:eq(1)').on('click', function() { showDailyDetailTable( 'dailyGiftCert?'); });
                }
                //Points Redeemed
                if (cText.includes( 'Points Redeemed' ) && cAmt !== '0.00') {
                    $(this).find('td:eq(1)').append('&nbsp;<span class="material-icons" style="font-size: 14px;">open_in_new</span>')
                    $(this).find('td:eq(1)').addClass('hilite-cell');
                    $(this).find('td:eq(1)').on('click', function() { showDailyDetailTable( 'dailyPoints?'); });
                }
                if (cText === 'Credit Cards'  && cAmt !== '0.00') {
                    $(this).find('td:eq(1)').append('&nbsp;<span id="ccCell" class="material-icons" style="font-size: 14px;">arrow_drop_down</span>')
                    $(this).find('td:eq(1)').addClass('hilite-cell');
                    $(this).find('td:eq(1)').on('click', function() { showCardDetail($(this)); });
                    tr.addClass('ccRow');
                }
                if ( cText === 'Net Bottle Deposits' || cText === 'Gross Profit' || cText === 'Total' || cText === 'Total In' || cText === 'Total Bank' ) {
                    $(this).find(':nth-child(3)').css( {"text-decoration": "overline", "text-decoration-style": "double" } );
                }
            });
            $.spin('false');
        }
    });

    DailyTable.on('preDraw', function () {
        var json = DailyTable.ajax.json();
        if (json) {
           $("#DailyTitle").html(json.cTitle);
           if (json.data.length===0) {
              $(".dt-buttons").hide();
            } else {
              $(".dt-buttons").show();
            }
        }
    });

    $("nav").css('z-index', -1);
    x.style.display = "block";
}

function dailyDateChange() {
    const customDate = $('input[name="dailyDate"]').val();
    $('input[name="dailyDate2"]').val(customDate);
}

function showCardDetail( cell ) {
    var tr = cell.closest('tr');
    var row = DailyTable.row(tr);
    var json = DailyTable.ajax.json();
    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
        $('#ccCell').text( 'arrow_drop_down' );
    }
    else {
        // Open this row
        if (!row.child()) {
            row.child(json.cards).show();
            tr.addClass('shown');
        } else {
            row.child.show();
            tr.addClass('shown');
        }
        $('#ccCell').text( 'arrow_drop_up' );
        $('table.dailyCardDetail tbody tr td:first-child').off('click');
        $('table.dailyCardDetail tbody tr td:first-child').on( 'click', function(){
            var amt = $(this).next().text();
            if (amt === '0.00') {
                return;
            }
            var card = $(this).text();
            showDailyDetailTable( 'dailyCardDetail?', card );
        });
    }
}

function reloadDailyTable() {
    var cPeriod = $('#dailySelect option:selected').val();

    if (cPeriod==='custom') {
        modalDailyDateForm();
        return;
    }

    DailyTable.clear().destroy(false);

    showDailyTable(cPeriod);
}

function modalDailyDateForm() {
    var now = new Date();
    now.setDate(now.getDate() - 1);
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = (day) + "/" + (month) + "/" + now.getFullYear();

    document.querySelectorAll('input[name$="dailyDate"]')[0].valueAsDate = now;
    document.querySelectorAll('input[name$="dailyDate2"]')[0].valueAsDate = now;

    if (!dailyModalDialog) {
        dailyModalDialog = $("#dailyModalDateDialog").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: [
                {
                    id: "dailySubmit",
                    text: "Run Report",
                    click: function (event) {
                        event.preventDefault();
                        $(this).find("form").submit();
                        /*
                        $(this).dialog( "close" );
                        DailyTable.clear().destroy(false);
                        showDailyTable('custom');
                        */
                    }
                },
                {
                    id: "dailyCancel",
                    text: "Cancel",
                    click: function () {
                        $(this).dialog("close");
                    }
                }]
        });

        dailyForm = dailyModalDialog.find("form").on("submit", function (event) {
            event.preventDefault();
            dailyModalDialog.dialog("close");
            DailyTable.clear().destroy(false);
            showDailyTable('custom');
        });
    }

    dailyModalDialog.dialog("open");
}

function showDailyDetailTable(cUrl, cCard) {
    //var cDom = ((cCard) ? 'Bfrtlp' : 'Brtp');
    var cDom = 'Bfrtlp';
    var aPageLen = [10, 25, 50, 100];
    var nLen = localStorage.getItem("cardDetailLength");
    if (!nLen) {
        nLen = 25;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };
    
    $.spin('true');
    if (cCard) {
        cCard = cCard.replace( 'open_in_new', '' ).trim();
    }
    $.post(cUrl, { date: $('#DailyTitle').text(), card: cCard }, function (reply) {
        $('#modalInfoTitle').text(reply.title);
        $('#modalInfoBody').html(reply.body);
        if (reply.body.includes('Unable')) {
            $.spin('false');
            return;
        }
        dailyDetailTable = $('#dailyDetailTable').DataTable({
            paging: true,
            lengthChange: true,
            lengthMenu: aPageLen,
            pageLength: nLen,
            responsive: true,
            dom: cDom,
            buttons: [
                {
                    extend: 'excel',
                    text: svgExcel,
                    titleAttr: '  Excel File  ',
                    title: reply.title
                },
                {
                    extend: 'print',
                    text: svgPrint,
                    titleAttr: '  Print  ',
                    orientation: 'portrait',
                    title: function () {
                        var printTitle = reply.title;
                        return printTitle;
                    },
                    customize: function (window) {
                        var now = new Date();
                        $(window.document.body)
                            .css({ "background-color": "white", "font-family": "verdana, sans-serif", "font-size": "12px" });

                        $(window.document.body).find('h1')
                            .css({ "text-align": "center", "font-size": "16px" });

                        $(window.document.body).find('table')
                            .addClass('compact')
                            .css({ "font-size": "inherit", "width": "80%", "margin": "auto", "border": "2px solid" });

                        $(window.document.body).find('div:eq(1)')
                            .css({ "text-align": "center", "padding-top": "10px", "font-size": "10px" })
                            .text('Printed: ' + now.toLocaleDateString() + " at " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                        // window.document.close();
                        window.onafterprint = function (event) { window.close(); };
                        window.print();
                    }
                },
            ],
            data: reply.items,
            columns: [
                { data: "item" },
                { data: "qty" },
                { data: "price" },
                { data: "invoice", class: "hilite-cell" },
                { data: "time" },
                { data: "station" }
            ],
            columnDefs: [
                { type: 'num-fmt', targets: [2] },
                { className: 'numericCol', targets: [2] }
            ],
            ordering: false,
            initComplete: function () {
                $("#modalInfo").css("z-index", 99999);
                $("#modalInfo").toggle(true);

                $('#dailyDetailTable tbody').off('click', 'td.hilite-cell');

                // Add event listener for invoice details
                $('#dailyDetailTable tbody').on('click', 'td.hilite-cell', function () {
                    var d = $(this).text();
                    showInvoice(d);
                });

                setTimeout(function () {
                    marg = $("#dailyDetailTable").css("margin-left");
                    $('#dailyDetailTable_wrapper div.dt-buttons').css("margin-left", marg);
                    $('#dailyDetailTable_filter').css({"margin-right": marg, "margin-top": "20px"});
                    $('#dailyDetailTable_length').css({"margin-left": marg, "margin-top": "12px"});
                    $('#dailyDetailTable_paginate').css("margin-right", marg);
                    $('#dailyDetailTable thead tr th:nth-child(4)').removeClass('hilite-cell');
                    if ($("#modalInfoContent").overflownY()) {
                        $("#modalInfoCloseBar").css("width", "89%");
                    }
                }, 20);

                $.spin('false');
            }
        });

        $('#dailyDetailTable').on('length.dt', function (e, settings, len) {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("cardDetailLength", len);
            }
        });
    })
    .fail( function(){
        $.spin('false');
    })
}
//////// END DAILY REPORT !!NOT!! SUMMARY \\\\\\\\\\\\\\\\\\

/////// BEGIN WEB ORDER REPORT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function showWebOrderTable() {
    $("#WebOrderTableWrapper").toggle(false);
    $("#refreshWebOrderReport").hide();

    $("#webOrderSelect").prop("disabled", false);
    $("#WebOrderCompany input").prop("disabled", false);

    $.post( 'getOnlineOrderSettings?', function(data) {
        if (data.doDrizly && data.doCityHive) {
            $("#WebOrderCompanyBar").attr('showme', 'yes');
            $("#WebOrderCompanyBar").show();
        } else {
            $("#WebOrderCompanyBar").attr('showme', 'no');
            $("#WebOrderCompanyBar").hide();
        }
    });

    $("nav").css('z-index', -1);
    $("#Modal_WebOrder").toggle(true);
    $("#tab_rept").toggle(false);
    
}

function closeWebOrderTable() {
    if ($.fn.DataTable.isDataTable('#WebOrderTable')) {
        WebOrderTable.clear().destroy(false);
        WebOrderTable = null;
    };

    $("#webOrderSelect").val("none");
    $("#WebOrderCompanyBar").attr('showme', 'no');

    $("nav").css('z-index', 999);
    $("#Modal_WebOrder").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function getWebOrderTable(cPeriod) {
    var cStartDate;
    var cEndDate;
    var doDrizly = $("#reportDoDrizly").is(':checked');
    var doCity   = $("#reportDoCity").is(':checked');

    if (cPeriod && cPeriod === 'none') {
        $("#WebOrderTableWrapper").toggle(false);
        return;
    }

    $.spin('true');

    if ($("#WebOrderCompanyBar").attr('showme') === 'yes') {
        $("#WebOrderCompany input").prop("disabled", true);
    }
    $("#refreshWebOrderReport").show();
    $("#webOrderSelect").prop("disabled", true);

    if ($.fn.DataTable.isDataTable('#WebOrderTable')) {
        WebOrderTable.clear().destroy(false);
    };

    if (!cPeriod) {
        $("#webOrderSelect").val("yesterday");
        cPeriod = 'yesterday';
    } else if (cPeriod === 'custom') {
        cStartDate = $('input[name="webOrderStartDate"]').val();
        cEndDate = $('input[name="webOrderEndDate"]').val();
    }

    $.post('webOrderSummary', { cPeriod: cPeriod, cStartDate: cStartDate, cEndDate: cEndDate, doDrizly: doDrizly, doCity: doCity },
        function (reply) {
            if (reply.error) {
                swal({
                    title: 'Error',
                    text: reply.error,
                    type: 'error'
                }
                );
                return;
            }

            WebOrderTable = $('#WebOrderTable').DataTable({
                responsive: true,
                dom: 'Brtp',
                /*"scrollY": "785px",
                "scrollCollapse": true,
                "paging": false, */
                pageLength: 24,
                "lengthChange": true,
                buttons: [
                    {
                        extend: 'print',
                        text: svgPrint,
                        titleAttr: '  Print  ',
                        orientation: 'portrait',
                        title: reply.title,
                        customize: function (window) {
                            $(window.document.body)
                                .css({ "background-color": "white", "font-family": "verdana, sans-serif", "font-size": "12px" });

                            $(window.document.body).find('h1')
                                .css({ "text-align": "center", "font-size": "16px" });

                            $(window.document.body).find('div').first().css({ "min-height": "60px"});

                            $(window.document.body).find('table')
                                .addClass('compact')
                                .css({ "font-size": "inherit", "width": "80%", "margin": "auto" });

                                $(window.document.body).find('table tr').each(function () {
                                    if ($(this).find('td').eq(1).text() == 'Total') {
                                        $(this).css({ 'font-weight': 'bold' });
                                        $(this).find('td').css({ 'border-top': '1px solid black'});
                                    }
                                    $(this).find(':first-child').remove();
                                });
                            
                            //window.document.close();
                            window.onafterprint = function (event) { window.close(); };
                            window.print();
                        }
                    },
                ],
                data: reply.data,
                columns: [
                    {
                        "className": 'details-control',
                        "orderable": false,
                        "data": null,
                        "defaultContent": '',
                        "width": '50px'
                    },
                    { data: "date", className: 'dt-left', width: '25%' },
                    { data: "numInv", className: 'dt-center', width: '25%' },
                    { data: "total", className: 'dt-right', width: '25%' },
                    { data: "percent", className: 'dt-right', width: '25%' }
                ],
                columnDefs: [
                    { type: 'num-fmt', targets: [1,2] },
                    { className: 'titleCell', targets: [0] },
                    { className: 'numericCol', targets: [1,2] }
                ],
                ordering: false,
                initComplete: function () {
                    var rowCount = $('#WebOrderTable tbody tr').length;
                    if (rowCount > 1) {
                        $('#WebOrderTable tbody tr:last td:eq(0)').removeClass('details-control');
                    }
                    $('#WebOrderTable tbody tr').each( function() {
                        var str = $(this).find(':nth-child(2)').text();
                        var nInvs = $(this).find(':nth-child(3)').text();
                        if (str === 'Total') {
                            $(this).find('td').css({'font-weight': 'bold', 'border-top': '2px solid #000'});
                        }
                        if (nInvs === '0') {
                            $(this).find('td:eq(0)').removeClass('details-control');
                        }
                    });
                    $("<div class='webOrderReportTitle'>" + reply.title + "</div>").insertAfter("#WebOrderTable_wrapper .dt-buttons");
                    $("#WebOrderTableWrapper").toggle(true);

                    $.spin('false');
                }
            });
            
            var nH = $(document.body).height() - 256;
            nH = Math.trunc( nH/32 );
            WebOrderTable.page.len( nH ).draw();

    // Add event listener for opening and closing details
            $('#WebOrderTable tbody').off('click', 'td.details-control')
            $('#WebOrderTable tbody').on('click', 'td.details-control', function () {
                var tr = $(this).closest('tr');
                var row = WebOrderTable.row(tr);
                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    if (!row.child()) {
                        showWebOrderDayDetail(tr, row, doDrizly, doCity);
                    } else {
                        row.child.show();
                        tr.addClass('shown');
                    }
                }
            });
            WebOrderTable.on( 'draw', function() {
                $('#WebOrderTable tbody tr').each( function() {
                    var str = $(this).find(':nth-child(2)').text();
                    var nInvs = $(this).find(':nth-child(3)').text();
                    if (str === 'Total') {
                        $(this).find('td').css({'font-weight': 'bold', 'border-top': '2px solid #000'});
                    }
                    if (nInvs === '0') {
                        $(this).find('td:eq(0)').removeClass('details-control');
                    }
                });
            });
            setTimeout(function() { $('#WebOrderTable').focus();}, 10 );
        });
}

function showWebOrderDayDetail(tr, row, doDrizly, doCity) {
    var d = row.data();
    $.spin('true');

    $.post("webOrderDayDetail", { date: d.date, doDrizly: doDrizly, doCity: doCity }, function (data) {
        row.child(data.text).show();
        tr.addClass('shown');

        $('.webOrderDetail tbody').off('click', 'td.invoiceNbr');
        $('.webOrderDetail tbody').off('click', 'td.webOrdNbr');

        // Add event listener for invoice details
        $('.webOrderDetail tbody').on('click', 'td.invoiceNbr', function () {
            var d = $(this).text();
            showInvoice(d);
        });
        // Add event listener for order details
        $('.webOrderDetail tbody').on('click', 'td.webOrdNbr', function () {
            var d = $(this).text();
            var i = $(this).parent().find("td:eq(0)").text();
            showWebOrder(d,i);
        });
        $.spin('false');
    });
}

function showWebOrder(orderNbr, invNbr) {
    //var invoiceNbr = data[9];
    $.spin('true');
    $.post( "showWebOrder", { order: orderNbr, invoice: invNbr }, function(text) {
        if (text.includes("!!ERROR!!")) {
            $.spin('false');
            swal("Oops...", text, "error");
            return;
        } else if (text.includes("<html")) {
            $("#webOrderPrint").html(svgPrint);
            $("#modalWebOrderBody").html("<iframe id='webOrderHTML'></iframe>");
            $("#webOrderHTML").attr('srcdoc', text);

            $(document).keydown(function (e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    closeModalWebOrder();
                }
            });

            $("#modalWebOrder").css("z-index", 99999);
            $("#modalWebOrder").toggle(true);

        } else {
            $("#modalInvoiceTitle").text( "Order Nbr. " + orderNbr);
            $("#invoiceText").text(text);
            $("#invoicePrint").html(svgPrint);

            $(document).keydown(function (e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    closeModalInvoice();
                }
            });

            $("#modalInvoice").css("z-index", 99999);
            $("#modalInvoice").toggle(true);
        }
        $.spin('false');
    });
}

function closeModalWebOrder() {
    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            return;
        }
    });

    $("#modalWebOrderContent").scrollTop(0);
    $("#modalWebOrder").css("z-index", -1);
    $("#modalWebOrder").toggle(false);
    $("#modalWebOrderBody").html('');
}

function webOrderPrint() {
    var text  = $("#webOrderHTML").attr('srcdoc');

    var a = window.open('', 'WebOrder'); 
    a.document.write(text); 
    a.document.close(); 
    a.print();

    a.onafterprint = function(event) {  a.close(); };
}


function refreshWebOrderReport() {
    $("#refreshWebOrderReport").hide();
    $("#webOrderSelect").val("none");
    $("#webOrderSelect").prop("disabled", false);
    if ($("#WebOrderCompanyBar").attr('showme') === 'yes') {
        $("#WebOrderCompany input").prop("disabled", false);
    }
}

function reloadWebOrderTable() {
    var cPeriod = $('#webOrderSelect option:selected').val();

    if (cPeriod==='custom') {
        modalWebOrderDateForm();
        return;
    }

    if ($.fn.DataTable.isDataTable('#WebOrderTable')) {
        WebOrderTable.clear().destroy(false);
    };

    getWebOrderTable(cPeriod);
}

function modalWebOrderDateForm() {
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = (day)+"/"+(month)+"/"+now.getFullYear();

    document.querySelectorAll('input[name$="webOrderStartDate"]')[0].valueAsDate=now;
    document.querySelectorAll('input[name$="webOrderEndDate"]')[0].valueAsDate=now;

    webOrderModalDialog = $( "#webOrderModalDateDialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: [
          {
                id: "webOrderSubmit",
                text: "Run Report",
                click: function() {
                    if (webOrderCheckEndDateVal()) {
                        $(this).dialog( "close" );
                        getWebOrderTable('custom');
                    }
                }
          },
          {
            id: "webOrderCancel",
            text: "Cancel",
            click: function() {
                $(this).dialog( "close" );
            }
        }],
        close: function() {
          console.log("closed");
        }
    });
   
    webOrderForm = webOrderModalDialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        if (webOrderCheckEndDateVal()) {
            webOrderModalDialog.dialog( "close" );
            getWebOrderTable('custom');
        }
    });

    webOrderModalDialog.dialog( "open" );
}

function webOrderSetEndDateVal() {
    var startDate = $('input[name="webOrderStartDate"]').val();
    startDate = startDate.split("-");
    var endDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);

    document.querySelectorAll('input[name$="webOrderEndDate"]')[0].valueAsDate=endDate;
}

function webOrderCheckEndDateVal() {
    var startDate = $('input[name="webOrderStartDate"]').val();
    startDate = startDate.split("-");
    startDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);

    var endDate = $('input[name="webOrderEndDate"]').val();
    endDate = endDate.split("-");
    endDate = new Date(endDate[0], endDate[1] - 1, endDate[2]);

    if (endDate < startDate) {
        swal({
            title: 'Date Error',
            text:  'The end date must be same as or greater than start date.',
            type:  'error'
            },
            function () {
                document.querySelectorAll('input[name$="webOrderEndDate"]')[0].valueAsDate = startDate;
                $("#webOrderEndDate").focus();
        });
        return false;
    } else {
        return true;
    };
}
/////// END WEB ORDER REPORT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\

////// BEGIN STATE REPORT
function showStateReport() {
    var dateRange = $('input[name=State_dateRange]:checked').val();

    $("#State_hdr").toggle(false);
    $("#Statetablewrapper").toggle(false);

    if (dateRange === '1') {
        StateStandardDate();
    } else {
        StateCustomDate();
    };
    $( '#State_box .js_datepicker' ).datepicker();

    const current = new Date();
    current.setMonth(current.getMonth()-1);
    const currentYear = new Date().getFullYear(); // 2020
    const previousYear =  currentYear-1;
    const today = new Date();
    const sunday1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const monday = new Date(sunday1.getFullYear(), sunday1.getMonth(), sunday1.getDate() - sunday1.getDay()-6);
    const sunday2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()-7);
    const sat = new Date(sunday2.getFullYear(), sunday2.getMonth(), sunday2.getDate() + 6);

    $('#stateMonth').text('Month ('+current.toLocaleString('default', { month: 'long' })+' '+current.getFullYear()+')');
    $('#stateMonday').text('Week Mon-Sun ('+dateWithSlashes(monday,true)+' - '+dateWithSlashes(sunday1,true)+')');
    $('#stateSunday').text('Week Sun-Sat ('+dateWithSlashes(sunday2,true)+' - '+dateWithSlashes(sat,true)+')');
    $('#stateYear').text('Year ('+previousYear+')');

    $.post("showStateReport", function(data){
        const nTypes = $('#stateSetCusTypePicks option').length;
        if (nTypes === 1 && data.aCusts.length > 0) {
            $.each(data.aCusts, function (i, item) {
                $('#stateSetCusTypePicks').append($('<option>', { 
                    text : item[0],
                    value: item[1]
                }));
            });            
        }

        const ctyp = $('#stateSetCusTypePicks option[value="' + data.custype + '"]').text();
        $('#stateCusTypeSpan').text(ctyp);

        $('#stateSetCusTypePicks').val( data.custype );

        $('#stateSortBySpan').text( data.reptSort );
        
        $('#stateFieldsSpan').text( data.fields );

        $('#stateSetFieldsUsed').empty();
        $('#stateSetFieldsUnused').empty();

        $('#stateSetFieldsUsed').append( data.reptHTML );
        $('#stateSetFieldsUnused').append( data.unusedHTML );
        // set SortBy <select>
        $("#stateSetSortByField").empty();
        $('#stateSetFieldsUsed li').each( function(i) {
          let x = $(this).text().replace('drag_indicator','');
          let y = ( (x === data.reptSort) ? ' selected' : '' );
          let z = $(this).attr('data-field');
          $("#stateSetSortByField").append('<option value="' + z + '"' + y + '>' + x + '</option>');
        } );

        $( "#stateSetFieldsUnused li" ).removeClass("ui-state-highlight ui-sortable-handle").addClass("ui-state-default ui-sortable-handle");
    });

    $('#State_box').show();
    $('#State_box2').show();

    $("nav").css('z-index', -1);
    $("#tab_rept").toggle(false);
    $("#Modal_State").toggle(true);
}

function closeStateReport(skip) {
    var modalState = document.getElementById("Modal_State");
    var wait = $('#State_waitp');
    var isVisible = wait.is(':visible');

    $("#State_box").find('*').prop("disabled", false);
    $("#State_box2").find('*').prop("disabled", false);

    if (!isVisible) {
        Statetable.clear().destroy(false);
        $('#State_waitp').toggle(true);
        $("#State_hdr").toggle(false);
        $("#Statetablewrapper").toggle(false);
    };

    $("#State_submit").prop("value", "Submit");
    $("#State_submit").attr("onclick", "getStateReport()");
    $("#State_cancel").prop("value", "Cancel");
    $("#State_cancel").css("margin-right", "10px");

    $("#State_date_last").prop("disabled", false);
    $("#State_date_custom").prop("disabled", false);
    $("#StateRange").prop("disabled", false);
    $("#State_startDate").prop("disabled", false);
    $("#State_endDate").prop("disabled", false);

    $('#State_box').show();
    $('#State_box2').show();

    if (!skip) {
        $("nav").css('z-index', 999);
        modalState.style.display = "none";
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    }
}

function StateCustomDate() {
    document.getElementById("StateRange").disabled = true;
    document.getElementById("State_startDate").disabled = false;
    document.getElementById("State_endDate").disabled = false;
}

function StateStandardDate() {
    $('#State_startDate').val('');
    $('#State_endDate').val('');
    document.getElementById("State_startDate").disabled = true;
    document.getElementById("State_endDate").disabled = true;
    document.getElementById("StateRange").disabled = false;
}

function getStateReport() {
    var dateRange = $('input[name=State_dateRange]:checked').val();
    var ntimes = 0;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("stateReportLength");
    const stateData = {};
    const reptFields = [];
    const reptData = [];
    const cusType = $('#stateSetCusTypePicks').find(":selected").val();
    const sortBy = $('#stateSetSortByField').find(":selected").val();
    const datePick = $('#StateRange').find(":selected").val();
    let cHdr = '';
    
    $("#State_submit").toggle(false);
    $("#State_cancel").toggle(false);

    if (!nLen) {
        nLen = 20;        
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $('#stateSetFieldsUsed li .stateSetItemSpan').each( function(i) { 
        reptFields.push( $(this).text() );
        cHdr += '<th>' + $(this).text() + '</th>'
    } );

    $('#stateSetFieldsUsed li').each( function(i) { 
        reptData.push( $(this).attr("data-field") );
    } );

    $('.selectStaterange').children().prop("disabled", true);

    if (dateRange === '2' && ($('#State_startDate').val() === '' || $('#State_endDate').val() === '')) {
        swal("Oops...", "Please enter Start and End dates for your Custom Timeframe.", "error");
    };

    stateData.cusType = cusType;
    stateData.sortBy = sortBy;
    stateData.fields = JSON.stringify(reptFields);
    stateData.dataLinks = JSON.stringify(reptData);
    stateData.dateRange = dateRange;
    stateData.datePick = datePick;
    stateData.startDate = $('#State_startDate').val();
    stateData.endDate = $('#State_endDate').val();

    $("#State_box").find('*').prop("disabled", true);
    $("#State_box2").find('*').prop("disabled", true);

    $("#State_hdr").toggle(true);

    $.spin('true');

    $.post( "getStateReport?", stateData, function(xResp) { 
        if (xResp.dataArray && xResp.dataArray.length > 0) {
            $('#State_hdr tr').html( cHdr );

            Statetable = $('#Statetable').DataTable({
                responsive: true,
                dom: 'Bfrtilp',
                order: [],
                lengthChange: true,
                lengthMenu: aPageLen,
                pageLength: nLen,
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
                        title: 'Wholesale Report ' + todayString()
                    },    
                    {
                        extend: 'pdf',
                        text:   svgPdf,
                        titleAttr: '  PDF File  ',
                        message: '__MESSAGE__',
                        orientation: 'landscape',
                        title: 'Wholesale Report',
                        header: true,
                        customize: function (doc) {
                            doc.content.forEach(function (content) {
                                if (content.style == 'message') {
                                    content.text = 
                                        'Start Date: ' + xResp.startDate + '\n' +
                                        'End Date: ' + xResp.endDate + '\n' +
                                        'Report run: ' + todayString()
                                }
                            })
                        }
                    },
                    {
                        extend: 'print',
                        text: svgPrint,
                        titleAttr: '  Print  ',
                        orientation: 'landscape',
                        title: 'Wholesale Report ' + todayString(),
                        customize: function (window) {
                            $(window.document.head)
                                .append('<style>td:nth-child(3n) { text-align: right; }</style>');
        
                            $(window.document.body)
                                .css('font-size', '12px')
                                .css('font-family', 'verdana, sans-serif');
        
                            $(window.document.body).find('div')
                                .html('<p><span style="font-Size: 12px; font-weight: bold;">Selections: </span><br>' +
                                'Start Date: ' + xResp.startDate + '<br>' +
                                'End Start: ' + xResp.endDate);
        
                            $(window.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit');
        
                            window.document.close();
                            window.onafterprint = function(event) {  window.close(); };                        
                            window.print();                       
                        }
                    }
                ],
                data: xResp.dataArray,
                "fnDrawCallback": function () {
                    $("#State_waitp").toggle(false);
                    $("#Statetablewrapper").toggle(true);
                    $('.dataTables_length').css('padding-top', '0.755em');
                    $('.dataTables_length').css('padding-left', '0.755em');
                    if (ntimes < 1) {
                        $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                    };
                    ntimes++;
                }
            });

            $('#Statetable').on('length.dt', function (e, settings, len) {
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("stateReportLength", len);
                }
            });

            $('#State_box').hide();
            $('#State_box2').hide();
        
        } else if (xResp.dataArray && xResp.dataArray.length == 0) {
            swal("Oops...", "No matching data found.", "error");
        } else {
            swal("Oops...", "Unknown error occurred.", "error");
        }
        
        $("#State_submit").prop("value", "New Set");
        $("#State_submit").attr("onclick", "closeStateReport(true)");
        $("#State_cancel").prop("value", "Close");
        $("#State_submit").toggle(true);
        $("#State_cancel").toggle(true);
        $.spin('false');
    } );
}

function showStateSettings() {
    $("#Modal_stateSet").fadeIn("slow");
}

function closeStateSettings() {
    $("#Modal_stateSet").fadeOut("slow");
}

function saveStateSettings() {
    const cusType = $('#stateSetCusTypePicks').find(":selected").val();
    const sortBy = $('#stateSetSortByField').find(":selected").text();
    const reptFields = [];
    const reptData = [];

    $('#stateSetFieldsUsed li .stateSetItemSpan').each( function(i) { 
        reptFields.push( $(this).text() );
    } );

    $('#stateSetFieldsUsed li').each( function(i) { 
        reptData.push( $(this).attr("data-field") );
    } );
    
    $.post( 'saveStateReport?',
            { cusTypes: cusType, 
              reptFields: JSON.stringify( reptFields ), 
              sortBy: sortBy
            },
            function( data ) { 
                var ctyp = $('#stateSetCusTypePicks option[value="' + data.custype + '"]').text();
                $('#stateCusTypeSpan').text(ctyp);
        
                $('#stateSortBySpan').text( data.reptSort );
                
                $('#stateFieldsSpan').text( data.fields );
        
                state_msg( data );
            } );
}

async function state_msg( data ) {
    if ('result' in data && new String(data.result).valueOf() == new String('success').valueOf()) {
        $('#state_msg').text('Your settings have been saved.');
    } else {
        $('#state_msg').text('An error occurred saving your settings.');
    }
    await sleep(3000);
    $('#state_msg').text('');
}
////// END STATE REPORT

//////////////////////
function showNegQtyReport() {
    $("#NegQtyHdr").toggle(false);
    $("#NegQtyTableWrapper").toggle(false);

    $("#NegQtyInvType").on('change', function () { $("#NegQtyDeptSelect").prop('checked', true) });

    getInvDepts('NegQtyInvType');

    $("nav").css('z-index', -1);
    $("#Modal_NegQty").toggle(true);
    $("#tab_rept").toggle(false);
}

function closeNegQtyReport() {
    var wait = $('#NegQty_waitp');
    var isVisible = wait.is(':visible');

    if (!isVisible) {

        NegQtyTable.clear().destroy(false);
        $('#NegQty_waitp').toggle(true);
        $("#NegQtyHdr").toggle(false);
        $("#NegQtyTableWrapper").toggle(false);
    };

    $("#NegQty_submit").toggle(true);
    $("#NegQty_newset").toggle(false);
    $("#NegQty_cancel").prop("value", "Cancel");

    $("#NegQtyDeptAll").prop('disabled', false);
    $("#NegQtyDeptSelect").prop('disabled', false);
    $("#NegQtyDeptType").prop('disabled', false);
    $("#NegQtyInvType").prop('disabled', false);

    $("nav").css('z-index', 999);
    $("#Modal_NegQty").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function resetNegQtyReport() {
    NegQtyTable.clear().destroy(false);
    $('#NegQty_waitp').toggle(true);
    $("#NegQtyHdr").toggle(false);
    $("#NegQtyTableWrapper").toggle(false);

    $("#NegQtyDeptAll").prop('disabled', false);
    $("#NegQtyDeptSelect").prop('disabled', false);
    $("#NegQtyDeptType").prop('disabled', false);
    $("#NegQtyInvType").prop('disabled', false);

    $("#NegQty_submit").toggle(true);
    $("#NegQty_newset").toggle(false);
    $("#NegQty_cancel").prop("value", "Cancel");
}

function toggleNegQtyDeptType() {
    var el = document.getElementById('NegQtyDeptType');
    var cSel = el.options[el.selectedIndex].value;

    $("#NegQtyDeptSelect").prop('checked', true);

    $('#NegQtyInvType')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="       ">&#60; ANY &#62;</option>');

    if (cSel === "dept") {
        getInvDepts('NegQtyInvType');
    } else {
        getInvTypes('NegQtyInvType');
    };

    $('#NegQtyInvType').toggle(true);
}

function getNegQtyReport() {
    var cDeptSelect = $('input[name=NegQtyDeptSelect]:checked').val();
    var cdort = $('#NegQtyDeptType').val();
    var t = document.getElementById("NegQtyInvType");
    var cdept = t.options[t.selectedIndex].text;
    var ntimes = 0;

    if (cdept === '&#60; ANY &#62;') {
        cdept = '< ANY >'
    };

    if (cDeptSelect === '2' && cdept === "< ANY >") {
        swal('Error', "Please select the dept/type to report on.", 'error');
        return;
    } else {
        cdept = getInvTypeSelected('NegQtyInvType');
    }

    //Barcode, brand, description, size, cost, price, QOH, type/dept, last_sold
    $("#NegQty_submit").toggle(false);
    $("#NegQty_waitp").toggle(false);
    $("#NegQtyDivTitle").toggle(true);
    $("#NegQtyHdr").toggle(true);
    $("#NegQtyTableWrapper").toggle(true);

    $("#NegQtyDeptAll").prop('disabled', true);
    $("#NegQtyDeptSelect").prop('disabled', true);
    $("#NegQtyDeptType").prop('disabled', true);
    $("#NegQtyInvType").prop('disabled', true);

    $("#NegQty_newset").toggle(true);
    $("#NegQty_cancel").prop("value", "Done");

    $.post("negQtyReport?",
        {
            cDeptSelect: cDeptSelect,
            cDort: cdort,
            cDept: cdept
        },
        function (data, status) {

            NegQtyTable = $('#NegQtyTable').DataTable({
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
                        title: 'Negative Qty Items ' + todayString()
                    },                    
                    {
                        extend: 'pdf',
                        text:   svgPdf,
                        titleAttr: '  PDF File  ',
                        orientation: 'landscape',
                        title: 'Negative Qty Items ' + todayString(),
                        header: true
                    },
                    {
                        extend: 'print',
                        text: svgPrint,
                        titleAttr: '  Print  ',
                        orientation: 'landscape',
                        title: 'Negative Qty Items ' + todayString(),
                        customize: function (window) {
                            $(window.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit');

                            window.document.close();
                            window.onafterprint = function(event) {  window.close(); };                        
                            window.print();                       
                        }
                    }
                ],
                data: data,
                "columns": [
                    { "width": "10%" },
                    { "width": "15%" },
                    { "width": "15%" },
                    { "width": "10%" },
                    { "width": "10%" },
                    { "width": "10%" },
                    { "width": "10%" },
                    { "width": "10%" },
                    { "width": "10%" }
                ],
                select: false,
                columnDefs: [
                    { type: 'num-fmt', targets: [4, 5, 6] },
                    { className: 'numericCol', targets: [4, 5, 6] }
                ],
                order: [[6, 'asc']],
                "fnDrawCallback": function () {
                    $('.dataTables_length').css('padding-top', '0.755em');
                    $('.dataTables_length').css('padding-left', '0.755em');
                    if (ntimes < 1) {
                        $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                    };
                    ntimes++;
                }
            });
        });
}

function showVendGMReport() {
    var dateRange = $('input[name=VendGM_dateRange]:checked').val();
    $("#VendGM_hdr").toggle(false);
    $("#VendGMtablewrapper").toggle(false);
    $("#VendGMsummaryWrapper").toggle(false);

    $("#VendGMtype").on('change', function () { $("#VendGMtypeSelect").prop('checked', true) });

    if (dateRange === '1') {
        VendGMstandardDate();
        setVendGMdateSpan();
    } else {
        VendGMcustomDate();
    };

    if ($('#VendGMdeptType').val() === 'dept') {
        getInvDepts('VendGMtype');
    } else {
        getInvTypes('VendGMtype');
    };

    $('#VendGM_DateBox .js_datepicker').pickadate({
        format: 'mm-dd-yyyy',
        labelMonthNext: 'Go to the next month',
        labelMonthPrev: 'Go to the previous month',
        labelMonthSelect: 'Pick a month from the dropdown',
        labelYearSelect: 'Pick a year from the dropdown',
        selectMonths: true,
        selectYears: true
    });
    $("nav").css('z-index', -1);
    $("#Modal_VendGM").toggle(true);
    $("#tab_rept").toggle(false);
}

function vendGmAllSelected() {
    $('#VendGMvendListBtn').prop('disabled', true);
    if (vendListDataTable) {
        vendListDataTable.rows().deselect();
    }
    $("#VendGMvendPickLen").text("0 vendors picked.");
}

function VendGMtoggleDeptType() {
    var el = document.getElementById('VendGMdeptType');
    var cSel = el.options[el.selectedIndex].value;
    $('#VendGMtype')
        .toggle(false)
        .find('option')
        .remove()
        .end()
        .append('<option value="       ">&#60; ANY &#62;</option>');
    if (cSel === "dept") {
        getInvDepts('VendGMtype');
    } else {
        getInvTypes('VendGMtype');
    };
    $('#VendGMtype').toggle(true);
}

function VendGMcustomDate() {
    document.getElementById("VendGMrange").disabled = true;
    document.getElementById("VendGM_startDate").disabled = false;
    document.getElementById("VendGM_endDate").disabled = false;
}

function VendGMstandardDate() {
    $('#VendGM_startDate').val('');
    $('#VendGM_endDate').val('');
    document.getElementById("VendGM_startDate").disabled = true;
    document.getElementById("VendGM_endDate").disabled = true;
    document.getElementById("VendGMrange").disabled = false;
}

function closeVendGM() {
    $('#VendGM_waitp').toggle(true);
    $("#VendGM_hdr").toggle(false);
    $("#VendGMDivTitle").toggle(false);
    $("#VendGMtablewrapper").toggle(false);
    $("#VendGMsummaryWrapper").toggle(false);
    if (VendGMtable) {
        VendGMtable.clear().destroy(false);
        VendGMtable = null;
    }
    if (VendGMsummaryTable) {
        VendGMsummaryTable.clear().destroy(false);
        VendGMsummaryTable = null;
    }

    $("#VendGM_submit").toggle(true);
    $("#VendGM_cancel").prop("value", "Cancel");
    $("#VendGM_cancel").css("margin-right", "10px");
    $("#VendGM_newset").toggle(false);

    $("#VendGM_Box1").find('*').prop('disabled', false);
    $("#VendGM_DateBox").find('*').prop('disabled', false);

    $("#VendGM_date_last").prop("disabled", false);
    $("#VendGM_date_vendom").prop("disabled", false);
    $("#VendGMrange").prop("disabled", false);
    $("#VendGM_startDate").prop("disabled", false);
    $("#VendGM_endDate").prop("disabled", false);

    $("#VendGMDivTitle").text('Vendor Profitability');
    $("#VendGMInfo").text("");

    aVendGMVends = [];
    aVendGMData = [];
    nVendGMCounter = 0;

    $("nav").css('z-index', 999);
    $("#Modal_VendGM").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function showVendList() {
    var modal = document.getElementById("Modal_vendList");

    $("#vendListTableWrapper").hide();

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            closeVendListModal();
        }
    });

    $("#Modal_vendList").css("z-index", 99999);
    $("#Modal_vendList").show();

    if (typeof vendListDataTable === 'undefined') {
        setTimeout(buildVendListTable, 500);
    } else {
        $("#vendListTableWrapper").show();
    };
}

function buildVendListTable() {
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("vendListLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };
    for (i = 0; i < aPageLen.length; i++) {
        if (aPageLen[i] >= nLen) {
            nLen = aPageLen[i];
            break;
        }
    };

    $("#vendListTableWrapper").show();

    vendListDataTable = $('#vendListTable').DataTable({
        dom: 'ifrtlp',
        ajax: "getVendorList?",
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
        columnDefs: [
            { type: 'num', targets: 0 },
            { className: 'numericCol', targets: 0 }
        ],
        select: {
            style: 'multi'
        },
        "deferRender": true,
        order: [[1, 'asc']],
    });

    $('#vendListTable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("vendListLength", len);
        }
    });
}

function closeVendListModal() {
    var rows = vendListDataTable.rows({ selected: true }).count();
    var cSelect = rows.toString() + " vendors picked.";
    if (rows === 1) {
        cSelect = cSelect.replace("vendors", "vendor");
    }

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            return;
        }
    });

    $("#VendGMvendPickLen").text(cSelect);
    $("#Modal_vendList").css("z-index", -1);
    $("#Modal_vendList").hide();
}

function setVendGMdateSpan() {
    var dateRange = $('input[name=VendGM_dateRange]:checked').val();
    var arr = [];
    var cstart;
    var cend;

    arr.push('"' + dateRange + '"');
    arr.push('"' + $('#VendGMrange').val() + '"');
    arr.push('"' + $('#VendGM_startDate').val() + '"');
    arr.push('"' + $('#VendGM_endDate').val() + '"');

    $.post("getDateData(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] + ")", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            document.getElementById('VendGM_date_span').innerHTML = cstart + ' -- ' + cend;
        };
    });
}

function resetVendGMreport() {
    if (VendGMtable) {
        VendGMtable.clear().destroy(false);
        VendGMtable = null;
    }
    if (VendGMsummaryTable) {
        VendGMsummaryTable.clear().destroy(false);
        VendGMsummaryTable = null;
    }
    $("#VendGM_select").toggle(true);
    $('#VendGM_waitp').toggle(true);
    $("#VendGMDivTitle").toggle(false);
    $("#VendGMtablewrapper").toggle(false);
    $("#VendGMsummaryWrapper").toggle(false);

    $("#VendGM_submit").toggle(true);
    $("#VendGM_newset").toggle(false);
    $("#VendGM_cancel").prop("value", "Cancel");

    $("#VendGM_Box1").find('*').prop('disabled', false);
    $("#VendGM_DateBox").find('*').prop('disabled', false);

    if (typeof vendListDataTable !== 'undefined') {
        vendListDataTable.rows({ selected: true }).deselect();
    };
    $("#VendGMvendPickLen").text('0 vendors picked.');
    $("#VendGMDivTitle").text('Vendor Profitability');
    $("#VendGMInfo").text("");

    aVendGMVends = [];
    aVendGMData = [];
    nVendGMCounter = 0;

}

function VendGM_NextCust(nChg) {
    switch (nChg) {
        case 1:
            if (nVendGMCounter < aVendGMVends.length - 1) {
                nVendGMCounter++
                $('#VendGM_BrowseButtons').html("&nbsp;" + (nVendGMCounter + 1).toString() + " of " + aVendGMVends.length.toString() + "&nbsp");
                $("#vendSubTitle").text("Vendor: " + aVendGMVends[nVendGMCounter]);
                VendGMtable.clear().draw();
                VendGMtable.rows.add(aVendGMData[nVendGMCounter]); // Add new data
                VendGMtable.columns.adjust().draw();             // Redraw the DataTable                            
            }
            break;

        case -1:
            if (nVendGMCounter > 0) {
                nVendGMCounter--
                $('#VendGM_BrowseButtons').html("&nbsp;" + (nVendGMCounter + 1).toString() + " of " + aVendGMVends.length.toString() + "&nbsp");
                $("#vendSubTitle").text("Vendor: " + aVendGMVends[nVendGMCounter]);
                VendGMtable.clear().draw();
                VendGMtable.rows.add(aVendGMData[nVendGMCounter]); // Add new data
                VendGMtable.columns.adjust().draw();               // Redraw the DataTable                            
            }
            break;
    }
}

function getVendGMreport(param, aSavedData, colVis) {
    var cTypeSelect = $('input[name=VendGMtypeSelect]:checked').val();
    var cDateSelect = $('input[name=VendGM_dateRange]:checked').val();
    var csord = $('input[name=VendGMreportType]:checked').val();
    var aVNs = [];
    var cdort = $('#VendGMdeptType').val();
    var cType = $("#VendGMtype").val();
    var cDateRange = $('#VendGMrange').val();
    var cStartDate = $('#VendGM_startDate').val();
    var cEndDate = $('#VendGM_endDate').val();
    var ntimes = 0;
    var nOrd = 0;
    var aChartData = [];
    var cstart = '';
    var cend = '';
    var cSubTitle = '';
    var lNoSave = false;
    var lSaved = false;
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("vendGMReportLength");
    if (!nLen) {
        nLen = 20;
    } else if ($.type(nLen) === 'string') {
        nLen = parseInt(nLen);
    };

    if (aSavedData || activeTab === 'saved' ) {
        lSaved = true;

    } else {
        if (csord === '2' && typeof vendListDataTable === 'undefined' ||
            csord === '2' && vendListDataTable.rows({ selected: true }).count() === 0) {
            swal('Error', "Please select the vendor(s) to report on.", 'error');
            return;

        } else if (csord === '2') {
            var selectedRows = vendListDataTable.rows({ selected: true }).data();
            $.each(selectedRows, function (key, row) {
                aVNs.push(row[0]);
                aVendGMVends.push(row[1]);
            });
        };
    }

    $.spin('true');

    $("#VendGM_select").toggle(false);

    $("#VendGM_Box1").find('*').prop('disabled', true);
    $("#VendGM_DateBox").find('*').prop('disabled', true);
    $("#VendGM_submit").toggle(false);
    $("#VendGM_cancel").toggle(false);

    if (aSavedData) {
        csord = aSavedData[0];
        aVNs = aSavedData[1];
        cTypeSelect = aSavedData[2];
        cdort = aSavedData[3];
        cType = aSavedData[4];
        cDateSelect = aSavedData[5];
        cDateRange = aSavedData[6];
        cStartDate = aSavedData[7];
        cEndDate = aSavedData[8];
        aVendGMVends = aSavedData[9];
        if (param) {
            csord = '2';
            aVNs = JSON.stringify(param[0]);
            aVendGMVends[0] = param[1];
            lNoSave = true;
        }
    } else {
        if (param) {
            csord = '2';
            aVNs = JSON.stringify(param[0]);
            aVendGMVends[0] = param[1];
            lNoSave = true;
        } else {
            aVNs = JSON.stringify(aVNs);
        }
    }

    $.post("getDateData('" + cDateSelect + "','" + cDateRange + "','" + cStartDate + "','" + cEndDate + "')", "", function (data, status) {
        if (data.length > 0) {
            cstart = data[0][0];
            cend = data[0][1];
            cSubTitle = 'Dates: ' + cstart + ' - ' + cend;
            $("#VendGMDivTitle").html("Vendor Profitability" +
                                      "<br><span style='font-size: 14px;'>" + cSubTitle + "</span>");
        };
    });

    if (csord === '1') {
        $.post("VendGM_Report?",
            {
                csord: csord,
                aVNs: aVNs,
                cTypeSelect: cTypeSelect,
                cdort: cdort,
                cType: cType,
                cDateSelect: cDateSelect,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate
            },
            function (data, status) {

                VendGMsummaryTable = $('#VendGMsummaryTable').DataTable({
                    responsive: false,
                    scrollX: true,
                    dom: 'Bfrtilp',
                    lengthChange: true,
                    lengthMenu: aPageLen,
                    pageLength: nLen,
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
                            title: 'Vendor Profitability ' + todayString()
                        },                        
                        {
                            extend: 'pdf',
                            text:   svgPdf,
                            titleAttr: '  PDF File  ',
                            orientation: 'landscape',
                            title: 'Vendor Profitability' + todayString(),
                            exportOptions: {
                                columns: ':visible'
                            },
                            header: true
                        },
                        {
                            extend: 'print',
                            text: svgPrint,
                            titleAttr: '  Print  ',
                            orientation: 'landscape',
                            title: 'Vendor Profitability',
                            exportOptions: {
                                columns: ':visible'
                            },
                            customize: function (window) {
                                window.document.close();
                                window.onafterprint = function(event) {  window.close(); };                        
                                window.print();                       
                            }
                        },
                        {
                            text: svgRemember,
                            titleAttr: '  Save Settings  ',
                            action: function (e, dt, node, config) {
                                var arr = [
                                    csord,
                                    aVNs,
                                    cTypeSelect,
                                    cdort,
                                    cType,
                                    cDateSelect,
                                    cDateRange,
                                    cStartDate,
                                    cEndDate,
                                    aVendGMVends
                                ];
                                var colArr = $('#VendGMsummaryTable').DataTable().columns().visible().toArray();
                                var colSav = [];
                                $.each(colArr, function (idx, item) {
                                    if (!item) {
                                        colSav.push(idx);
                                    }
                                });
            
                                saveVendGMReport(arr, colSav);
                            }
                        },
                        {
                            text: svgClose,
                            titleAttr: '  Close  ',
                            action: function (e, dt, node, config) {
                                if (activeTab === 'saved') {
                                    resetVendGMreport();
                                    closeVendGM();

                                } else {
                                    $('#CusGM_select').toggle(true);
                                    resetCusGMreport(true);
                                    $("#VendGMtablewrapper").toggle(false);
                                    $("#VendGMsummaryWrapper").toggle(false);
                                    if (VendGMtable) {
                                        VendGMtable.clear().destroy(false);
                                        VendGMtable = null;
                                    }
                                    if (VendGMsummaryTable) {
                                        VendGMsummaryTable.clear().destroy(false);
                                        VendGMsummaryTable = null;
                                    }
                                    $("#VendGM_select").toggle(true);
                                    $("#VendGM_waitp").toggle(true);
                                    $("#VendGMInfo").toggle(false);
                                    $("#VendGMDivTitle").toggle(false);
                                }
                            }
                        }
                    ],
                    data: data.data,
                    select: { style: 'single' },
                    columns: [
                        { data: "vendor" },
                        { data: "sales" },
                        { data: "cost" },
                        { data: "grprofit" },
                        { data: "grmargin" },
                        { data: "vendum" }
                    ],
                    columnDefs: [
                        { type: 'num-fmt', targets: [1, 2, 3, 4] },
                        { className: 'numericCol', targets: [1, 2, 3, 4] },
                        { targets: [5], visible: false, searchable: false, orderable: false }
                    ],
                    order: [[0, 'asc']],
                    "fnDrawCallback": function () {
                        var api = this.api();
                        $("#VendGM_select").toggle(false);
                        $("#VendGM_waitp").toggle(false);
                        $("#VendGM_waitp").html('Data View');;
                        $("#VendGMsummaryWrapper").toggle(true);
                        $("#VendGM_cancel").prop('value', 'Done');
                        $("#VendGM_cancel").toggle(true);
                        $("#VendGM_newset").toggle(true);
                        $("#VendGMDivTitle").toggle(true);

                        $('.dataTables_length').css('padding-top', '0.755em');
                        $('.dataTables_length').css('padding-left', '0.755em');
                        $('td').each(function () {
                            if ($(this).index() == 3 && parseInt(api.cell(this).data()) < 0) {
                                $(this).css('color', 'red');
                            } else if ($(this).index() == 3 && parseInt(api.cell(this).data()) > 0) {
                                $(this).css('color', 'darkgreen');
                            }
                        });
                        var cShow = $('.dataTables_length > label').text();
                        if (cShow.indexOf('--') < 0) {
                            $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                        };
                    },
                    initComplete: function () {
                        $.spin('false');
                        if (!$('#VendGMsummaryTable').DataTable().data().any() || lNoSave || lSaved) {
                            $('#VendGMsummaryTable').DataTable().button(4).disable();   // don't allow report save on empty table or if already saved!!
                        }
                    }
                });

                VendGMsummaryTable.on('select', function (e, dt, type, indexes) {
                    var rowData = VendGMsummaryTable.rows(indexes).data().toArray();
                    var arr = [
                        csord,
                        aVNs,
                        cTypeSelect,
                        cdort,
                        cType,
                        cDateSelect,
                        cDateRange,
                        cStartDate,
                        cEndDate,
                        aVendGMVends
                    ];
                    VendGMDetail(rowData[0],arr);
                    VendGMsummaryTable.rows({ selected: true }).deselect();
                });

                VendGMsummaryTable.on('length.dt', function (e, settings, len) {
                    if (typeof (Storage) !== "undefined") {
                        localStorage.setItem("vendGMReportLength", len);
                    }
                });                    
            });  // end of summary POST

        // do detailed report: csord = '2'
    } else {
        $.post("VendGM_Report?",
            {
                csord: csord,
                aVNs: aVNs,
                cTypeSelect: cTypeSelect,
                cdort: cdort,
                cType: cType,
                cDateSelect: cDateSelect,
                cDateRange: cDateRange,
                cStartDate: cStartDate,
                cEndDate: cEndDate
            },
            function (data, status) {

                aChartData = data[0];
                aVendGMData = data;
                nVendGMCounter = 0;

                if (aChartData.length === 0) {
                    swal('No Data Found', 'No data matching your criteria was found!', 'info');
                }
                if (cTypeSelect === '2') {
                    cSubTitle = $('#VendGMdeptType option:selected').text() + ' ' +
                        $("#VendGMtype option:selected").text() +
                        "<br>" + cSubTitle;
                };
                if (aVendGMVends.length > 1) {
                    $("#VendGMDivTitle").html("Vendor Profitability" +
                        "<br><span style='font-size: 16px;'>" + cSubTitle + "</span>" +
                        "<br><span id='vendSubTitle' style='font-size: 16px;'>Vendor: " + aVendGMVends[0] + "</span>" +
                        "<br><input type='button' id='VendGM_prev' class='pAbuttonGrn' value='< Prev' onclick='VendGM_NextCust(-1)' />" +
                        "<span id='VendGM_BrowseButtons'>&nbsp;1 of " + aVendGMVends.length.toString() + "&nbsp;</span>" +
                        "<input type='button' id='VendGM_next' class='pAbuttonGrn' value='Next >' onclick='VendGM_NextCust(1)' />");

                } else {
                    $("#VendGMDivTitle").html("Vendor Profitability" +
                        "<br><span style='font-size: 16px;'>" + cSubTitle + "</span>" +
                        "<br><span id='vendSubTitle' style='font-size: 16px;'>Vendor: " + aVendGMVends[0] + "</span>");
                }

                VendGMtable = $('#VendGMtable').DataTable({
                    responsive: false,
                    //scrollX: true,
                    dom: 'Bfrtilp',
                    lengthChange: true,
                    lengthMenu: aPageLen,
                    pageLength: nLen,
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
                            title: 'Vendor Profitability ' + todayString()
                        },                        
                        {
                            extend: 'pdf',
                            text:   svgPdf,
                            titleAttr: '  PDF File  ',
                            orientation: 'landscape',
                            title: 'Vendor Profitability' + todayString(),
                            exportOptions: {
                                columns: ':visible'
                            },
                            header: true,
                            footer: true,
                            message: '__MESSAGE__',
                            customize: function (doc) {
                                var cInfo = $("#VendGMInfo").text();
                                cInfo = cInfo.replace('Sales:', 'Sales:  ');
                                cInfo = cInfo.replace('Cost:', '\nCost:  ');
                                cInfo = cInfo.replace('GM:', '\nGM:  ');
                                doc.content.forEach(function (content) {
                                    if (content.style == 'message') {
                                        content.text = cSubTitle + '\n' + 'Vendor: ' + aVendGMVends[0] + '\n' + cInfo;
                                    }
                                })
                            }
                        },
                        {
                            extend: 'print',
                            text: svgPrint,
                            titleAttr: '  Print  ',
                            orientation: 'landscape',
                            title: 'Vendor Profitability',
                            footer: true,
                            exportOptions: {
                                columns: ':visible'
                            },
                            customize: function (window) {
                                var cInfo = $("#VendGMInfo").text();
                                cInfo = cInfo.replace('Sales:', 'Sales:  ');
                                cInfo = cInfo.replace('Cost:', '<br>Cost:  ');
                                cInfo = cInfo.replace('GM:', '<br>GM:  ');

                                $(window.document.head)
                                    .append('<style>th:nth-child(n+1):nth-child(-n+4) { text-align: left; }</style>')
                                    .append('<style>td:nth-child(n+5):nth-child(-n+10) { text-align: right; }</style>');
                                $(window.document.body).find('h1')
                                    .css('text-align', 'center')
                                    .css('font-family', 'Tahoma, sans-serif')
                                    .css('font-size', '18px')
                                    .append('<br><span style="font-size: 14px;">' + cSubTitle + '<br>Vendor: ' + aVendGMVends[0] + '</span>');
                                $(window.document.body).find('div')
                                    .html('<p><span style="font-family: Tahoma; font-Size: 12px;">' + cInfo + '</span>');
                                $(window.document.body).find('table')
                                    .css('font-size', '12px')
                                    .css('font-family', 'Tahoma, sans-serif');

                                window.document.close();
                                window.onafterprint = function(event) {  window.close(); };                        
                                window.print();                       
                            }
                        },
                        {
                            text: svgRemember,
                            titleAttr: '  Save Settings  ',
                            action: function (e, dt, node, config) {
                                var arr = [
                                    csord,
                                    aVNs,
                                    cTypeSelect,
                                    cdort,
                                    cType,
                                    cDateSelect,
                                    cDateRange,
                                    cStartDate,
                                    cEndDate,
                                    aVendGMVends
                                ];
                                var colArr = $('#VendGMsummaryTable').DataTable().columns().visible().toArray();
                                var colSav = [];
                                $.each(colArr, function (idx, item) {
                                    if (!item) {
                                        colSav.push(idx);
                                    }
                                });
            
                                saveVendGMReport(arr, colSav);
                            }
                        },
                        {
                            text: svgClose,
                            titleAttr: '  Close  ',
                            action: function (e, dt, node, config) {
                                if (!param && activeTab==='saved') {
                                    resetVendGMreport();
                                    closeVendGM();

                                } else if (!param) {
                                    $("#VendGMtablewrapper").toggle(false);
                                    $("#VendGMsummaryWrapper").toggle(false);
                                    if (VendGMtable) {
                                        VendGMtable.clear().destroy(false);
                                        VendGMtable = null;
                                    }
                                    if (!param && VendGMsummaryTable) {
                                        VendGMsummaryTable.clear().destroy(false);
                                        VendGMsummaryTable = null;
                                    }
                                    $("#VendGM_select").toggle(true);
                                    $("#VendGM_waitp").toggle(true);
                                    $("#VendGMInfo").toggle(false);
                                    $("#VendGMDivTitle").toggle(false);

                                    closeVendGMdetail();

                                } else {
                                    closeVendGMdetail();
                                }
                            }
                        }
                    ],
                    data: aChartData,
                    select: { style: 'single' },
                    columns: [
                        { "width": "13%" },
                        { "width": "13%" },
                        { "width": "6%" },
                        { "width": "12%" },
                        { "width": "8%" },
                        { "width": "8%" },
                        { "width": "8%" },
                        { "width": "8%" },
                        { "width": "8%" },
                        { "width": "8%" },
                        { "width": "8%" },
                        { "width": "0%" },
                        { "width": "0%" },
                        { "width": "0%" },
                        { "width": "0%" },
                        { "width": "0%" },
                        { "width": "0%" },
                        { "width": "0%" }
                    ],
                    columnDefs: [
                        { type: 'num-fmt', targets: [4, 5, 6, 7, 8, 9, 13, 16,17] },
                        { className: 'numericCol', targets: [4, 5, 6, 7, 8, 9, 13, 16, 17] },
                        { targets: [11, 12, 14, 15], visible: false, searchable: false, orderable: false }
                    ],
                    order: [[nOrd, 'asc']],
                    "footerCallback": function (tfoot, data, start, end, display) {
                        var api = this.api();
                        var sales = 0;
                        var cost = 0;

                        // Remove the formatting to get integer data for summation
                        var intVal = function (i) {
                            return typeof i === 'string' ?
                                i.replace(/[\$,]/g, '') * 1 :
                                typeof i === 'number' ?
                                    i : 0;
                        };

                        $(api.column(14).footer()).html('$ ' +
                            api.column(14).data().reduce(function (a, b) {
                                return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                            }, 0)
                        )
                        sales = intVal($(api.column(14).footer()).text());

                        $(api.column(15).footer()).html(
                            api.column(15).data().reduce(function (a, b) {
                                return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                            }, 0)
                        )
                        cost = intVal($(api.column(15).footer()).text());

                        $("#VendGMInfo").html(
                            '<span class="VendGMLabel">Sales:</span>$ ' + numberWithCommas(sales.toFixed(2)) + '<br>' +
                            '<span class="VendGMLabel">Cost:</span>$ ' + numberWithCommas(cost.toFixed(2)) + '<br>' +
                            '<span class="VendGMLabel">GM:</span>$ ' + numberWithCommas((sales - cost).toFixed(2)) + '&nbsp;&nbsp;' +
                            (((sales - cost) / Math.max(sales, 0.001)) * 100).toFixed(1) + '%'
                        );
                    },
                    "fnDrawCallback": function () {
                        var api = this.api();
                        $("#VendGM_select").toggle(false);
                        $("#VendGM_waitp").toggle(false);
                        $("#VendGM_waitp").html('Data View');;
                        $("#VendGMtablewrapper").toggle(true);
                        $("#VendGM_hdr").toggle(true);
                        $("#VendGMDivTitle").toggle(true);
                        if (!param) {
                            $("#VendGM_cancel").prop('value', 'Done');
                            $("#VendGM_cancel").toggle(true);
                            $("#VendGM_newset").toggle(true);
                        }
                        $('.dataTables_length').css('padding-top', '0.755em');
                        $('.dataTables_length').css('padding-left', '0.755em');

                        if (!param) {
                            $("#VendGMtablewrapper .dt-buttons")
                                .contents()
                                .filter(function (index) {
                                    return index === 4;
                                })
                                .toggle(false);
                        } else {
                            $("#VendGMtablewrapper .dt-buttons")
                                .contents()
                                .filter(function (index) {
                                    return index === 4;
                                })
                                .css('color', 'red');
                        }

                        $('td').each(function () {
                            if ($(this).index() == 4 && parseInt(api.cell(this).data()) < 0) {
                                $(this).css('color', 'red');
                            } else if ($(this).index() == 4) {
                                $(this).css('color', 'darkgreen');
                            }
                        });
                        var cShow = $('.dataTables_length > label').text();
                        if (cShow.indexOf('--') < 0) {
                            $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                        };
                    },
                    initComplete: function () {
                        $.spin('false');
                        if ( ! $('#VendGMtable').DataTable().data().any() || lNoSave || lSaved ) {
                            $('#VendGMtable').DataTable().button(4).disable();   // don't allow report save on empty table or if already saved!!
                        }
                        // set visible columns from saved settings. colVis sent in as parameter.
                        if ($('#VendGMtable').DataTable().data().any() && colVis) {
                            var cols = $('#VendGMtable').DataTable().columns().toArray()[0];
                            var colShow = [];
                            $.each(cols, function (idx, item) {
                                if (!colVis.includes(item)) {
                                    colShow.push(item);
                                }
                            });
                            $('#VendGMtable').DataTable().columns(colVis).visible(false);
                            $('#VendGMtable').DataTable().columns(colShow).visible(true);
                        }

                    }
                });

                VendGMtable.on('select', function (e, dt, type, indexes) {
                    var rowData = VendGMtable.rows(indexes).data().toArray();
                    showItemOrderInfo(rowData[0][11]);
                    VendGMtable.rows({ selected: true }).deselect();
                });

                $('#VendGMtable').on('length.dt', function (e, settings, len) {
                    if (typeof (Storage) !== "undefined") {
                        localStorage.setItem("vendGMReportLength", len);
                    }
                });                    
            });  // end of detailed POST
    } //end of if csord = 1 or 2 --> summary or detail
}

function saveVendGMReport(arr, colArr) {
    vex.dialog.prompt({
        message: 'Please enter report description...',
        placeholder: 'Report Description',
        callback: function (value) {
            if (value) {
                var savedArray = localStorage.getItem("vendGMSaved");
                var newArray = [];
                if (savedArray) {
                    newArray = JSON.parse(savedArray)
                    var found = newArray.findIndex(function(entry) {
                        return entry.description === value;
                    });
                    if (found>-1) {
                        vex.dialog.alert({
                            message: 'A report with that description is already saved. Please try again.'
                        })
                        return;
                    }
                }
                var saveDate = new Date().toJSON().slice(0, 10)
                newArray.push( { "description": value, "data": arr, "dateSaved": saveDate, "colVis": colArr } );
                localStorage.setItem("vendGMSaved",JSON.stringify(newArray));
                buildShortCutTab(true);
            }
        }
    })    
}

function showItemOrderInfo(data) {
    var cSubTitle = "";
    var ndraws = 0;

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

    elog('showItemSales, codenum:', codenum, 'cStart:', cStart, 'cEnd:', cEnd );

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
    $.spin('true');

    var $div = $('div[id="modalInfo"]');
    // Clone it and assign the new ID
    var $klon = $div.clone().prop('id', 'modalItemSalesChart');
    // Finally insert $klon after the previous
    $div.after($klon);

    $("#modalItemSalesChart #modalInfoContent").prop('id', 'modalItemSalesChartContent');
    $("#modalItemSalesChart #modalInfoCloseBar").prop('id', 'modalItemSalesChartCloseBar');
    $("#modalItemSalesChart #modalInfoClose").prop('id', 'modalItemSalesChartClose');
    $("#modalItemSalesChart #modalInfoTitle").prop('id', 'modalItemSalesChartTitle');
    $("#modalItemSalesChart #modalInfoBody").prop('id', 'modalItemSalesChartBody');

    $("#modalItemSalesChartTitle").text("18 Month Sales History");
    $('#modalItemSalesChartBody').html('');

    $('#modalItemSalesChartClose').click(closeItemSalesChart);

    var nHeight = $('#modalInfoBody').height();
    var nWidth = $('#modalInfoBody').width();

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

function VendGMDetail(vendorData,aData) {
    /*
        if ( vendorData.sales === '0.00' && vendorData.cost === '0.00' ) {
            swal( 'Nothing to See Here', 'No data exists for this vendor in your selected timeframe!', 'info' );
            return
        }
    */
    var aVend = new Array();
    aVend[0] = vendorData.vendnum;
    aVend[1] = vendorData.vendor;

    $('#VendGM_cancel').toggle(false);
    $('#VendGM_newset').toggle(false);
    $('#VendGMsummaryWrapper').toggle(false);

    $("#VendGM_Box1").find('*').prop('disabled', false);
    $("#VendGM_DateBox").find('*').prop('disabled', false);

    getVendGMreport(aVend,aData);
}

function closeVendGMdetail() {
    $("#VendGMtablewrapper").toggle(false);
    $("#VendGM_hdr").toggle(false);

    if (VendGMtable) {
        VendGMtable.clear().destroy(false);
        VendGMtable = null;
    }

    $("#VendGMsummaryWrapper").toggle(true);
    $("#VendGM_cancel").toggle(true);
    $("#VendGM_newset").toggle(true);

    $("#VendGMDivTitle").html("Vendor Profitability" +
        "<br><span style='font-size: 16px;'>");
    $("#VendGMInfo").text("");

    aVendGMVends = [];
    aVendGMData = [];
    nVendGMCounter = 0;
}

function showCountFileReport() {
    resetCountFileReport(true);

    getCountFileNames('CountFileInput');

    $("nav").css('z-index', -1);
    $("#tab_util").toggle(false);
    $("#Modal_GenericReport").toggle(true);
}

function closeCountFileReport() {
    var lVisible =  ( $.fn.DataTable.isDataTable('#CountFileTable') || $.fn.DataTable.isDataTable('#countNotFoundTable') );

    resetCountFileReport(false);

    if (!lVisible) {
        $("nav").css('z-index', 999);
        $("#Modal_GenericReport").toggle(false);
        if (doDash) {
            $("#tab_dash").toggle(true);
            $("#tab_saved").hide();
        }
    } else {
        getCountFileNames('CountFileInput');
    }
}

function resetCountFileReport(lOpening) {
    var wait = $("#CountFileWaitp");
    var isVisible = wait.is(':visible');

    if (!isVisible) {
        if (!lOpening) {
            if ($("#CountFileTableDiv").is(":visible")) {
                countFileTable.clear().destroy(false);
            } else {
                countNotFoundTable.clear().destroy(false);
                $("#countNotFoundTableDiv").toggle(false);
                $("#CountFileTableDiv").toggle(true);
            }
        }
        $('#CountFileWaitp').toggle(true);
        $("#CountFileHdr").toggle(false);
        $("#CountFileTableWrapper").toggle(false);
    };

    $("#CountFileDivTitle").toggle(false);

    $('#CountFileInput').prop('disabled', false);
    $('#CountFileInput').empty();

    $("#CountFileButtonPara").css("text-align", "right");
    $('#CountFile_cancel').val("Done");
    $('#CountFile_cancel').prop('disabled', false);
    $('#CountFile_submit').prop('disabled', false);
    $('#combineCountFilesButton').prop('disabled', false);
    $('#combineCountFilesButton').toggle(true);
    $('#CountFile_submit').toggle(true);
    $('#CountFile_delete').toggle(false);
    $('#CountFile_post').toggle(false);
    $("#createPOButton").toggle(false);

}

function getCountFileNames(cel, lFromPost) {
    if (lFromPost === undefined) {
        lFromPost = false;
    }
    $.post("getCountFileNames?", "",
        function (data, status) {
            var select = document.getElementById(cel);

            if (data.length === 0) {
                if (lFromPost) {
                    swal("No more count files found!");
                } else {
                    swal("No count files found!");
                }

                $("#combineCountFilesButton").prop('disabled', true);
                $("#CountFile_submit").prop('disabled', true);
                return;
            }

            for (var i = 0; i < data.length; i++) {
                var opt = data[i];
                var el = document.createElement("option");
                el.textContent = opt[0];
                el.value = opt[1];
                select.appendChild(el);
            };

            $('#combineCountFilesButton').prop( 'disabled', data.length <= 1 );
            $("nav").css('z-index', -1);
            $("#Modal_GenericReport").toggle(true);
            $("#tab_util").toggle(false);
        });
}

function pickCounts2Combine() {
    $('#combineCountsProceed').prop('disabled',true);
    $('#pickCountFiles').children().remove();

    $("#CountFileInput option").each(function()
    {
        $('#pickCountFiles').append('<option value="' + $(this).val() + '">' +  $(this).text() + '</option>');
    });

    $( "#pickCountFiles" ).change( function() {
        if ( $( "#pickCountFiles option:selected" ).length > 1 ) {
            $('#combineCountsProceed').prop('disabled',false);
        } else {
            $('#combineCountsProceed').prop('disabled',true);
        }
    })
    
    $('#modalCombineCounts').toggle(true);
}

function closeCombineCounts( lProceed ) {
    var aFiles = [];

    $('#modalCombineCounts').toggle(false);

    if (lProceed) {
        $( "#pickCountFiles option:selected" ).each( function() {
            aFiles.push( $(this).val() );
        });

        $.post( "combineCountFiles?", { aFiles: JSON.stringify(aFiles) },
        function(data) {
            vex.dialog.alert({
                unsafeMessage: 'Your combined files are being loaded for review.', // unsafeMessage option allows html in text
                className: 'vex-theme-wireframe' // Overwrites defaultOptions
            });
            getCountFileReport( false, data.cFile, data.cUser );
        })
        .fail(function (xhr, status, error) {
            vex.dialog.alert({
                unsafeMessage: 'An error has occurred.<br>' + '<br>' + error + '<br>' + xhr.responseText, // unsafeMessage option allows html in text
                className: 'vex-theme-wireframe' // Overwrites defaultOptions
            });
            //swal("Error", status + "\n" + error);
        });
    }
}

function getCountFileReport(lFromNotFound, cFile, cUser) {
    if (!cFile) {
        cFile = $("#CountFileInput option:selected").val();
        cUser = $("#CountFileInput option:selected").text();
    }

    if (lFromNotFound === undefined) {
        lFromNotFound = false;
    } else if (lFromNotFound) {
        $("#countNotFoundTableWrapper").toggle(false);
        $("#countNotFoundDivTitle").toggle(false);
        $("#countNotFoundHdr").toggle(false);
    }

    $("#CountFile_submit").prop('disabled', true);
    $("#CountFileInput").prop('disabled', true);

    $.post("countCheckForNotFounds?", { countFile: cFile },
        function (data, status) {

            var nCount = parseInt(data.count);

            if (nCount !== 0) {
                swal(data.count + " Unassigned Barcodes!", "Please review these unassigned barcodes\nbefore proceeding to count file.", "info");
                countViewNotFoundRecords(cFile, cUser);
            } else {
                $("#countNotFoundTableDiv").toggle(false);
                $("#CountFileTableDiv").toggle(true);

                $.post("reviewCountFile?", { countFile: cFile, combine: false },
                    function (tableData, status) {
                        var exportOptions = {
                            columns: ':visible:not(.not-exported)',
                            modifier: {
                                selected: null
                            }
                        }

                        countFileTable = $('#CountFileTable').DataTable({
                            responsive: false,
                            scrollX: true,
                            header: true,
                            footer: true,
                            dom: 'Bfrtilp',
                            buttons: [
                                {
                                    extend:    'copyHtml5',
                                    text:      svgCopy,
                                    titleAttr: '  Copy to Clipboard  ',
                                    exportOptions: exportOptions
                                },
                                {
                                    extend: 'excel',
                                    text: svgExcel,
                                    titleAttr: '  Excel File  ',
                                    exportOptions: exportOptions,
                                    title: 'Inventory Count ' + cUser
                                },
                                {
                                    extend: 'pdfHtml5',
                                    text:   svgPdf,
                                    titleAttr: '  PDF File  ',
                                    exportOptions: exportOptions,
                                    orientation: 'landscape',
                                    title: 'Inventory Count ' + cUser,
                                    header: true,
                                    footer: true
                                },
                                {
                                    extend: 'print',
                                    text: svgPrint,
                                    titleAttr: '  Print  ',
                                    exportOptions: exportOptions,
                                    orientation: 'landscape',
                                    title: 'Inventory Count ' + cUser,
                                    header: true,
                                    footer: true,
                                    customize: function (window) {
                                        $(window.document.head)
                                            .append('<style>td:nth-child(n+6):nth-child(-n+11) { text-align: right; }</style>');
                                        $(window.document.body).find('h1')
                                            .css('text-align', 'center')
                                            .css('font-family', 'Tahoma, sans-serif')
                                            .css('font-size', '16px');
                                        $(window.document.body).find('table')
                                            .css('font-size', '12px')
                                            .css('font-family', 'Tahoma, sans-serif');
                                        $(window.document.body).find('tfoot')
                                            .append('<style>th:nth-child(n+10):nth-child(-n+11) { text-align: right; }</style>');

                                        window.document.close();
                                        window.onafterprint = function(event) {  window.close(); };                        
                                        window.print();                       
                                    }
                                },
                                { extend: "edit", 
                                  text: svgEdit,
                                  titleAttr: '  Edit  ',
                                  editor: countFileEditor
                                },
                                { extend: "remove",
                                  text: svgDelete,
                                  titleAttr: '  Delete Row  ',
                                  editor: countFileEditor
                                }
                            ],
                            data: tableData.data,
                            select: {
                                style: 'single'
                            },
                            /*
                            columns: [
                                { data: "date", width: "7%" },
                                { data: "time", width: "5%" },
                                { data: "barcode", width: "10%" },
                                { data: "brand", width: "13%" },
                                { data: "descrip", width: "14%" },
                                { data: "size", width: "5%" },
                                { data: "pack", width: "5%" },
                                { data: "count", width: "6%" },
                                { data: "units", width: "6%" },
                                { data: "total", width: "7%" },
                                { data: "qoh", width: "7%" },
                                { data: "variance", width: "7%" },
                                { data: "variValue", width: "8%" }
                            ],
                            */
                           columns: [
                            { data: "date" },
                            { data: "time" },
                            { data: "barcode" },
                            { data: "brand" },
                            { data: "descrip" },
                            { data: "size" },
                            { data: "pack" },
                            { data: "count" },
                            { data: "units" },
                            { data: "total" },
                            { data: "qoh" },
                            { data: "variance" },
                            { data: "variValue" }
                        ],
                        columnDefs: [
                                { type: 'num', targets: [6, 7, 8, 9, 10, 11, 12] },
                                { className: 'numericCol', targets: [6, 7, 8, 9, 10, 11, 12] }
                            ],
                            ordering: false,
                            "footerCallback": function (tfoot, data, start, end, display) {
                                var api = this.api();

                                // Remove the formatting to get integer data for summation
                                var intVal = function (i) {
                                    return typeof i === 'string' ?
                                        i === '&#9660;' ? 0 : i.replace(/[\$,]/g, '') * 1 :
                                        typeof i === 'number' ? i : 0;
                                };

                                $(api.column(11).footer()).html(
                                    api.column(11).data().reduce(function (a, b) {
                                        return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(0));
                                    }, 0)
                                )

                                $(api.column(12).footer()).html(api.column(12).data().reduce(function (a, b) {
                                    return numberWithCommas(parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2));
                                }, 0)
                                )
                            },
                            "fnDrawCallback": function () {
                                $("#CountFileWaitp").toggle(false);
                                $("#CountFileTableWrapper").toggle(true);
                                $("#CountFileDivTitle").toggle(true);
                                $("#CountFileHdr").toggle(true);
                                $('.dataTables_length').css('padding-top', '0.755em');
                                $('.dataTables_length').css('padding-left', '0.755em');

                                $("#CountFileButtonPara").css("text-align", "left");
                                $("#combineCountFilesButton").toggle(false);
                                $("#CountFile_submit").toggle(false);
                                $("#CountFile_cancel").val("Close");
                                $("#CountFile_delete").toggle(true);
                                $("#CountFile_post").toggle(true);
                                $("#createPOButton").toggle(true);

                                var cShow = $('.dataTables_length > label').text();
                                if (cShow.indexOf('--') < 0) {
                                    $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                                };
                            },
                            initComplete: function () {
                                $("#createPOButton").attr( 'file', cFile );
                            }
                        });
                        $('input', countFileEditor.field('count').node()).on('focus', function () {
                            this.select();
                        });
                    });
            }
        });
}

function countViewNotFoundRecords(cFile, cUser) {
    $("#CountFileTableDiv").toggle(false);
    $("#countNotFoundTableDiv").toggle(true);

    $.post("countNotFoundTable?", { countFile: cFile },
        function (tableData, status) {
            countNotFoundTable = $('#countNotFoundTable').DataTable({
                responsive: true,
                header: true,
                dom: 'Bfrtilp',
                buttons: [
                    {
                        extend: 'print',
                        text: svgPrint,
                        titleAttr: '  Print  ',
                        orientation: 'portrait',
                        title: 'Inventory Count ' + cUser,
                        customize: function (window) {
                            $(window.document.head)
                                .append('<style>td:nth-child(7) { text-align: right; }</style>');
                            $(window.document.body).find('h1')
                                .css('text-align', 'center')
                                .css('font-family', 'Tahoma, sans-serif')
                                .css('font-size', '16px');
                            $(window.document.body).find('table')
                                .css('font-size', '12px')
                                .css('font-family', 'Tahoma, sans-serif');

                            window.document.close();
                            window.onafterprint = function(event) {  window.close(); };                        
                            window.print();                       
                        }
                    },
                    {
                        text: svgDupe,
                        titleAttr: '  Add to Existing Item  ',
                        action: function (e, dt, node, config) {
                            countAddToExisting(dt);
                        }
                    },
                    {
                        text: svgAdd,
                        titleAttr: '  Create New Item  ',
                        action: function (e, dt, node, config) {
                            countCreateNewItem(dt);
                        }
                    },
                    {
                        text: svgDelete,
                        titleAttr: '  Delete Row  ',
                        action: function (e, dt, node, config) {
                            countDeleteRow(dt);
                        }
                    }
                ],
                data: tableData.data,
                select: {
                    style: 'single'
                },
                columns: [
                    { data: "date", width: "10%" },
                    { data: "time", width: "10%" },
                    { data: "barcode", width: "10%" },
                    { data: "brand", width: "15%" },
                    { data: "descrip", width: "15%" },
                    { data: "size", width: "10%" },
                    { data: "count", width: "10%" },
                    { data: "before", width: "10%" },
                    { data: "after", width: "10%" }
                ],
                columnDefs: [
                    { type: 'num', targets: [6] },
                    { className: 'numericCol', targets: [6] }
                ],
                ordering: false,
                "fnDrawCallback": function () {
                    $("#countNotFoundWaitp").toggle(false);
                    $("#countNotFoundTableWrapper").toggle(true);
                    $("#countNotFoundDivTitle").toggle(true);
                    $("#countNotFoundHdr").toggle(true);
                    $('.dataTables_length').css('padding-top', '0.755em');
                    $('.dataTables_length').css('padding-left', '0.755em');

                    $("#combineCountFilesButton").toggle(false);
                    $("#CountFile_submit").toggle(false);
                    $("#CountFile_post").toggle(false);
                    $("#createPOButton").toggle(false);
                    $("#CountFile_delete").toggle(false);
                    $("#CountFileButtonPara").css("text-align", "center");
                    $("#CountFile_cancel").val("Close");

                    $('#countNotFoundTable tr td:nth-child(8)').click(function (e) {
                        var cCode = $(this).text();
                        $.post("countItemInfo?", { codenum: cCode, file: cFile }, function (data) {
                            swal("Item Before:\n" + data.item, "", 'info');
                        });
                    });
                    $('#countNotFoundTable tr td:nth-child(9)').click(function (e) {
                        var cCode = $(this).text();
                        $.post("countItemInfo?", { codenum: cCode, file: cFile }, function (data) {
                            swal("Item After:\n" + data.item, "", 'info');
                        });
                    });

                    var cShow = $('.dataTables_length > label').text();
                    if (cShow.indexOf('--') < 0) {
                        $('.dataTables_length > label').prepend('--&nbsp;&nbsp;');
                    };

                    var table = $('#countNotFoundTable').DataTable();
                    if (!table.data().any()) {
                        getCountFileReport(true);
                    }
                }
            })
        })
        .fail(function (xhr, status, error) {
            swal("Error", status + "\n" + error);
        });
}

function countAddToExisting(dt) {
    var countData = dt.rows({ selected: true }).data();
    if (countData.length === 0) {
        swal("Please select item.", "Select an item to proceed with this option.", "info");
        return;
    }
    var cBarcode = countData[0].barcode;
    var cCountFile = countData[0].file;
    var cRecNo = countData[0].recno;

    cSelectedBarcode = "";
    cSelectedItemInfo = "";
    showItemList();

    countWaitForItemSelection(countData);
}

function countWaitForItemSelection(countData) {
    var xId

    if (cSelectedBarcode !== "") {
        clearTimeout(xId);
        if (cSelectedBarcode === 'nada') {
            return;
        };

        swal({
            title: 'Add Barcode?',
            text: 'Add the barcode ' + countData[0].barcode + " to:\n" + cSelectedItemInfo + "?",
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#45c0bd",
            confirmButtonText: "Yes, add it!",
            closeOnConfirm: false
        },
            function () {
                $.post("countAddBarcode?", { barcode: cSelectedBarcode, recno: countData[0].recno, file: countData[0].file },
                    function () {
                        $.post("countNotFoundTable?", { countFile: countData[0].file },
                            function (tableData, status) {
                                countNotFoundTable.clear().draw();
                                countNotFoundTable.rows.add(tableData.data); // Add new data
                                countNotFoundTable.columns.adjust().draw();  // Redraw the DataTable                            
                                swal("Success", "The barcode was added.", "success")
                            })
                            .fail(function () {
                                swal("Error!", "An error was encountered.", "error");
                            });
                    })
                    .fail(function () {
                        swal("Error!", "An error was encountered.", "error");
                    });
            });
        return;
    }

    xId = setTimeout(countWaitForItemSelection, 500, countData);
}

function countDeleteRow(dt) {
    var data = dt.rows({ selected: true }).data();
    if (data.length === 0) {
        swal("Please select item.", "Select an item to proceed with this option.", "info");
        return;
    }
    swal({
        title: 'Delete Record?',
        text: 'Delete the count record for: \n ' + data[0].barcode + ": " + data[0].brand + ' ' + data[0].descrip + ' ' + data[0].size,
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    },
        function () {
            $.post("countDeleteRow?", { recno: data[0].recno, countFile: data[0].file }, function () {
                $.post("countNotFoundTable?", { countFile: data[0].file },
                    function (tableData, status) {
                        dt.clear().draw();
                        dt.rows.add(tableData.data); // Add new data
                        dt.columns.adjust().draw();  // Redraw the DataTable                            
                        swal("Success", "The record was deleted.", "success")
                    })
                    .fail(function () {
                        swal("Error!", "An error was encountered.", "error");
                    });
            })
                .fail(function () {
                    swal("Error!", "An error was encountered.", "error");
                });
        });
}

function countCreateNewItem(dt) {
    var data = dt.rows({ selected: true }).data();
    if (data.length === 0) {
        swal("Please select item.", "Select an item to proceed with this option.", "info");
        return;
    }
    swal({
        title: 'New Item',
        text: 'We will create a new item for: \n ' + data[0].barcode + ": " + data[0].brand + ' ' + data[0].descrip + ' ' + data[0].size,
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#45c0bd",
        confirmButtonText: "Yes, create it!",
        closeOnConfirm: false
    },
        function () {
            $.post("countMakeNewItem?", { recno: data[0].recno, countFile: data[0].file }, function () {
                $.post("countNotFoundTable?", { countFile: data[0].file },
                    function (tableData, status) {
                        dt.clear().draw();
                        dt.rows.add(tableData.data); // Add new data
                        dt.columns.adjust().draw();  // Redraw the DataTable                            
                        swal("Success!", "The new item has been created.", "success")
                    })
                    .fail(function () {
                        swal("Error!", "An error was encountered.", "error");
                    });
            })
                .fail(function () {
                    swal("Error!", "An error was encountered.", "error");
                });
        });
}

function postCountFile() {
    swal({
        title: "Add or Replace?",
        text: "Please indicate if you want to add to QOH or replace QOH.",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#43a3d7",
        confirmButtonText: "Add to QOH",
        cancelButtonText: "Replace QOH",
        closeOnConfirm: false,
        closeOnCancel: false
    },
        function (isConfirm) {
            var cFile = $("#CountFileInput option:selected").val();

            if (isConfirm) {
                $.post("postCountFile?", { countFile: cFile, mode: 'add' },
                    function (data, status) {
                        if (data.result === 'success') {
                            resetCountFileReport();
                            getCountFileNames('CountFileInput', true);
                            swal("Counts Added", "The file counts were successfully added to QoH.", "success");
                        } else {
                            swal("Problem Encountered!", "The file was not processed successfully.", "error");
                        };
                    }
                );
            } else {
                $.post("postCountFile?", { countFile: cFile, mode: 'replace' },
                    function (data, status) {
                        if (data.result === 'success') {
                            resetCountFileReport();
                            getCountFileNames('CountFileInput', true);
                            swal("Counts Replaced", "The file counts successfully replaced QoH.", "success");
                        } else {
                            swal("Problem Encountered!", "The file was not processed successfully.", "error");
                        };
                    }
                );
            }
        });
}

function deleteCountFile() {
    var cUser = $("#CountFileInput option:selected").text();
    swal({
        title: "Delete Count File?",
        text: "Confirm deletion of count file " + cUser,
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#bc1038",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (isConfirm) {
            var cFile = $("#CountFileInput option:selected").val();

            if (isConfirm) {
                $.post("deleteCountFile?", { countFile: cFile },
                    function (data, status) {
                        if (data.result === 'success') {
                            resetCountFileReport();
                            getCountFileNames('CountFileInput');
                            swal("File Deleted", "The file was successfully deleted.", "success");
                        } else {
                            swal("Problem Encountered!", "The file was not deleted.", "error");
                        };
                    }
                );
            }
        })
}

function createPOFromCount() {
    var cUser = $("#CountFileInput option:selected").text();
    var cFile = $("#createPOButton").attr( 'file' );

    swal({
        title: "Create Purchase Order?",
        text: "Confirm creation of PO using the count file: " + cUser,
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#2e8584",
        confirmButtonText: "Create!",
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.post("createPO?", { file: cFile },
                    function (data, status) {
                        $.spin('true');
                        if (data.result === 'success') {
                            $.spin('false');
                            $("#createPOButton").attr( 'file', '' );
                            resetCountFileReport();
                            getCountFileNames('CountFileInput');
                            swal("P.O. File Created", "The P.O. file has been placed in your LiquorPOS system.", "success");
                        } else {
                            $.spin('false');
                            swal("Problem Encountered!", data.result, "error");
                        };
                    }
                );
            }
        })
}

function showItemList(cMode, lNoClear) {
    var modal = document.getElementById("Modal_itemList");

    if (!cMode) {
        cMode = 'single';
    }

    cItemListMode = cMode;

    $("#itemListTableWrapper").hide();

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            closeItemListModal();
        }
    });

    $("#Modal_itemList").show();

    if (typeof itemListDataTable === 'undefined') {
        buildItemListTable(cMode);
    } else {
        if (!lNoClear) {
            itemListDataTable.rows().deselect();
        }
        itemListDataTable.select.style(cMode);
        $("#itemListTableWrapper").show();
    };
}

function buildItemListTable(cMode) {
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("itemListLength");
    if (!nLen) {
        nLen = 20;
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
        dom: 'iBfrtlp',
        ajax: "getItemList?",
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
        columns: [
            { data: "barcode" },
            { data: "brand" },
            { data: "descrip" },
            { data: "size" },
            { data: "type" },
            { data: "price" },
            { data: "code_num" }
        ],
        columnDefs: [
            { targets: [6], visible: false },
            { type: 'num', targets: 5 },
            { className: 'numericCol', targets: 5 }
        ],
        select: {
            style: cMode
        },
        buttons: [
            {
                text: svgDelete,
                titleAttr: "  Clear Selection  ",
                action: function () {
                    itemListDataTable.rows('.selected').deselect();
                    itemListDataTable.button(0).disable();
                }
            }
        ],
        "deferRender": true,
        order: [[1, 'asc']],
        initComplete: function () {
            var cTxt = $('#itemListTable_info').text();
            cTxt = cTxt.substring(cTxt.indexOf(' of ') + 4);
            cTxt = cTxt.replace('entries', 'records');
            $('#itemListTable_info').text(cTxt);
            $("#itemListTableWrapper").spin("modal");
        }
    });

    itemListDataTable.button(0).disable();

    itemListDataTable.on('deselect', function (e, dt, type, indexes) {
        itemListDataTable.button(0).enable(
            itemListDataTable.rows({ selected: true }).indexes().length === 0 ?
                false : true
        );
    });

    itemListDataTable.on('select', function (e, dt, type, indexes) {
        itemListDataTable.button(0).enable();
    });

    itemListDataTable.on('search.dt', function () {
        var cTxt = $('#itemListTable_info').text();
        cTxt = cTxt.substring(cTxt.indexOf(' of ') + 4);
        cTxt = cTxt.replace('entries', 'records');
        $('#itemListTable_info').text(cTxt);
    });

    $('#itemListTable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("itemListLength", len);
        }
    });
}


function closeItemListModal() {
    var rows = itemListDataTable.rows({ selected: true }).data();

    if (cItemListMode === 'single' && rows.length === 1) {
        cSelectedBarcode = rows[0].barcode;
        cSelectedItemInfo = rows[0].brand + " " + rows[0].descrip + " " + rows[0].size
    } else if (rows.length > 0) {
        aSelectedItemCodes = [];
        for (i = 0; i < rows.length; i++) {
            aSelectedItemCodes.push(rows[i].code_num);
        }
    } else if (cItemListMode === 'single') {
        cSelectedBarcode = "nada";
    } else {
        aSelectedItemCodes = ['nada'];
    }

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            return;
        }
    });

    $("#Modal_itemList").hide();
}

function invSnapShot() {
    swal({
        title: "Create archive of current inventory?",
        text: "This will save the current quantities and costs\n of all items for later reporting.",
        type: "info",
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
    },
        function () {
            $.post("archiveInvPosition?", "", function () {
                swal("Data successfully archived.");
            })
                .fail(function (xhr, ajaxOptions, thrownError) {
                    swal("error: " + thrownError);
                });
        });
}

function showLIFOReport() {
    resetLIFOReport();

    getArchiveFiles();

    $("nav").css('z-index', -1);
    $("#tab_rept").toggle(false);
    $("#Modal_LIFOReport").toggle(true);
}

function resetLIFOReport() {
    if ($.fn.DataTable.isDataTable('#LIFOTable')) {
        LIFOTable.clear().destroy(false);
    };

    $('#LIFOWaitp').toggle(true);
    $("#LIFOHdr").toggle(false);
    $("#LIFOTableWrapper").toggle(false);
    $("#LIFODivTitle").toggle(false);

    $('#LIFOStart').prop('disabled', false);
    $('#LIFOStart').empty();

    $('#LIFOEnd').prop('disabled', false);
    $('#LIFOEnd').empty();

    $("#LIFOButtonPara").css("text-align", "right");
    $('#LIFO_cancel').prop('disabled', false);
    $('#LIFO_submit').prop('disabled', false);
    $('#LIFO_cancel').toggle(true);
    $('#LIFO_submit').toggle(true);

    $('#LIFOSelect').toggle(true);
}

function getArchiveFiles() {
    $.post("getArchiveFiles?", "",
        function (data, status) {
            if (data.fileCount === 0) {
                swal("Warning!", "No archive files found!", "error");

                $("#LIFO_submit").prop('disabled', true);
                return;
            }

            for (var i = 0; i < data.files.length; i++) {
                $("#LIFOStart").append('<option value="' + data.files[i][0] + '" data-date="' + data.files[i][2] + '">' + data.files[i][1] + '</option>');
                $("#LIFOEnd").append('<option value="' + data.files[i][0] + '" data-date="' + data.files[i][2] + '">' + data.files[i][1] + '</option>');
            };
        });
}

function checkLIFOEnd(cEl) {
    var cStart = $("#LIFOStart option:selected").attr('data-date');
    var cEnd = $("#LIFOEnd option:selected").attr('data-date');

    if (parseInt(cEnd) >= parseInt(cStart)) {
        return;
    } else if (cEl === 'start') {
        var idx = $("#LIFOStart option:selected").index();
        $('#LIFOEnd option:eq(' + idx + ')').prop('selected', true);
    } else {
        var idx = $("#LIFOStart option:selected").index();
        $('#LIFOEnd option:eq(' + idx + ')').prop('selected', true);
        swal('Pick a more recent date!', 'The end period must be more recent than the start.', 'info');
    }
}

function closeLIFOReport() {
    if ($.fn.DataTable.isDataTable('#LIFOTable')) {
        LIFOTable.clear().destroy(false);
    };

    $("nav").css('z-index', 999);
    $("#Modal_LIFOReport").toggle(false);
    if (doDash) {
        $("#tab_dash").toggle(true);
        $("#tab_saved").hide();
    }
}

function getLIFOReport() {
    $('#LIFO_submit').prop('disabled', true);
    $('#LIFO_cancel').prop('disabled', true);
    $('#LIFOStart').prop('disabled', true);
    $('#LIFOEnd').prop('disabled', true);

    $('#LIFO_submit').toggle(false);
    $('#LIFO_cancel').toggle(false);

    $("#LIFOWaitp").html('<img src="images/spinner.gif" alt="Procesing..." style="width:128px;height:128px;" />');

    $.post("LIFO_Report?",
        {
            LIFOStart: $("#LIFOStart").val(),
            LIFOEnd: $("#LIFOEnd").val()
        },
        function (data, status) {
            var d = new Date();
            var tbl = $('#LIFOTable');
            var colArray = [
                { data: "rowType" },
                { data: "brand" },
                { data: "descrip" },
                { data: "size" },
                { data: "qty" },
                { data: "cost" },
                { data: "extCost" },
                { data: "histCost" },
                { data: "histExt" }
            ];

            var aPageLen = [10, 20, 30, 50, 100];
            var nLen = localStorage.getItem("LIFOTableLength");
            if (!nLen) {
                nLen = 20;
            } else if ($.type(nLen) === 'string') {
                nLen = parseInt(nLen);
            };
            for (i = 0; i < aPageLen.length; i++) {
                if (aPageLen[i] >= nLen) {
                    nLen = aPageLen[i];
                    break;
                }
            };

            LIFOTable = $('#LIFOTable').DataTable({
                ordering: false,
                responsive: true,
                dom: 'Bfrtlp',
                lengthChange: true,
                lengthMenu: [10, 20, 30, 50, 100],
                pageLength: nLen,
                buttons: [
                    {
                        extend: 'excel',
                        text: svgExcel,
                        titleAttr: '  Excel File  ',
                        filename: 'Inv Valuation ' + data.title,
                        exportOptions: {
                            columns: [1, 2, 3, 4, 5, 6, 7, 8]
                        }
                    },
                    {
                        extend: 'print',
                        text: svgPrint,
                        titleAttr: '  Print  ',
                        orientation: 'portrait',
                        title: 'Inventory Valuation ' + data.title,
                        customize: function (window) {
                            $(window.document.head).append('<style>table th {word-wrap:break-word;}</style>');
                            $(window.document.head).append('<style>table td {word-wrap:break-word;}</style>');
                            $(window.document.head).append('<style>@media print {table {page-break-after: always;}</style>');
                            $(window.document.body).css("background-color", "white");
                            $(window.document.body).find('table').attr('id', 'printLIFO');
                            $(window.document.body).find('h1').css({ "font-size": "100%", "font-family": "sans-serif, arial", "text-align": "center" });
                            $(window.document.body).find('table').css({ "font-family": "sans-serif, arial", "font-size": "10px" });
                            $(window.document.body).find('table th').css({ "background-color": "#faf6d1" });
                            $(window.document.body).find('table th:nth-child(-n+3)').css("text-align", "left");
                            $(window.document.body).find('table td:nth-child(n+5)').css("text-align", "right");

                            $(window.document.body).find('table tr').each(function () {
                                if ($(this).find('td').eq(0).text() == 'title') {
                                    $(this).css({ 'font-size': '175%', 'font-style': 'italic', 'font-weight': 'bold', 'color': 'red' });
                                } else if ($(this).find('td').eq(0).text() == 'sum') {
                                    $('td', this).each(function () {
                                        if ($(this).index() == 6 || $(this).index() == 8) {
                                            $(this).css({ 'font-weight': 'bold', 'border': 'solid 1px black' });
                                        } else {
                                            $(this).css('font-weight', 'bold');
                                        }
                                    });
                                }
                                $(this).find(':first-child').remove();
                            });

                            window.document.close();
                            window.onafterprint = function(event) {  window.close(); };                        
                            window.print();                       
                        }
                    }],
                data: data.data,
                columns: colArray,
                columnDefs: [
                    { type: 'num-fmt', targets: [4, 5, 6, 7, 8] },
                    { className: 'numericCol', targets: [4, 5, 6, 7, 8] },
                    { targets: [0], visible: false }
                ],
                select: false,
                "rowCallback": function (row, data, index) {
                    if (data.rowType === 'title') {
                        $('td', row).css({ "font-size": "24px", "font-style": "italic", "font-weight": "bold", "color": "red" });
                    } else if (data.rowType === 'sum') {
                        $('td', row).each(function () {
                            if ($(this).index() == 5 || $(this).index() == 7) {
                                $(this).css({ 'font-weight': 'bold', 'border': 'solid 2px black' });
                            } else {
                                $(this).css('font-weight', 'bold');
                            }
                        });
                    }
                },
                "fnDrawCallback": function () {
                    $('#LIFO_6').text(data.cEOYHdr + ' Cost');
                    $('#LIFO_7').text(data.cEOYHdr + ' Ext');
                    $('#LIFO_8').text(data.cBOYHdr + ' Cost');
                    $('#LIFO_9').text(data.cBOYHdr + ' Ext');

                    $('#LIFOSelect').toggle(false);
                    $("#LIFODivTitle").html("Inventory Valuation<br><span style='font-size: 14px;'>" +
                        data.title + "</span>")
                    $("#LIFOWaitp").text("Data View");
                    $("#LIFOWaitp").toggle(false);
                    $("#LIFOHdr").toggle(true);
                    $("#LIFOTableWrapper").toggle(true);
                    $("#LIFODivTitle").toggle(true);
                    /*
                    $("#LIFOTableWrapper .dt-buttons")
                    .contents()
                    .filter(function(index) {
                        return index === 1;
                    })
                    .toggle(false);
                    */
                }
            });

            $('#LIFOTable').on('length.dt', function (e, settings, len) {
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("LIFOTableLength", len);
                }
            });

        });
}

// End Report Functions

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function navUserDropdown() {
    //var width = $(".navUser").width();
    //$("#userDropdown").css("width", 60 + width);
    $("#userDropdown").show();
}
/*
            window.onclick = function(event) {
                if (!event.target.matches('.navUser') && !event.target.matches('.navUser img') ) {
                  var x=document.getElementById("userDropdown");
                  x.style.display = "none";           
                };
            }
*/
function myAccount() {
    $.post("remoteGetSettings?", "", function (data) {
        let cH2 = $("#remoteDataShareH2 span").html();

        if (data.update) {
            $('#updateButton').toggle(data.update);
        } else {
            $('#updateButton').toggle(false);
        }
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $("#" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
                let cTxt = $("#" + data.aSet[idx][0] + "_Say").html();
                if (data.aSet[idx][1]) {
                    cTxt = cTxt.replace('OFF', 'ON');
                } else {
                    cTxt = cTxt.replace('ON', 'OFF');
                }
                $("#" + data.aSet[idx][0] + "_Say").html(cTxt);
            }
        });

        if (data.remoteData) {
            cH2 = cH2.replace('OFF', 'ON');
            $("#remoteDataShareH2 span").html( cH2 );
        }

        $('#multiStoreEditSay').text(data.cStores + ' Set-Up');

        if (!$('#remoteSet').is(':checked')) {
            $('#multiStoreSet').prop('disabled', true);
            $('#multiStoreSet_Say').prop('disabled', true);
            $('#multiEditButton').prop('disabled', true);
        };

        $('#stationEditButton').prop('disabled', !$('#stationSetting').is(':checked') );

        $("#remoteSettings").toggle(doDash && sLevel === "0");
        $("#remoteDataShareH2").toggle(sLevel === "0");
        
        $("#dailyConsolidate").toggle( doDash && sLevel === "0" && $("#multiStoreSet_Say").text() === 'Multi-Store ON'  &&  $('#multiStoreSet').prop('disabled') === false );

        $("#userDropdown").hide();
        $("nav").toggle(false);
        $("#tab_dash").hide();
        $("#Modal_Account").show();
    });
};

function closeAccount() {
    $("#OldPswd").val("");
    $("#NewPswd1").val("");
    $("#NewPswd2").val("");

    $("#file").val("");
    $("#fileOutput").text("");

    $("#Modal_Account").hide();
    $("nav").toggle(true);
    $("#tab_dash").show();

    cancelNameEdit();
};

function makeExpDate() {
    var dT = new Date();
    var dD = new Date(cExpDate.slice(0, 4) + '-' +
        cExpDate.slice(4, 6) + '-' +
        cExpDate.slice(-2) + 'T23:55:00');
    if (dD - dT < 518400000) {
        $("#acctExpDate").css('color', 'red');
    };

    var aM = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var xD = aM[parseInt(cExpDate.slice(4, 6)) - 1] + ' ' +
        cExpDate.slice(6) + ', ' +
        cExpDate.slice(0, 4);
    return xD;
};

function editName() {
    var cFirst = userName;
    var cLast = userLast;
    if (userName === "<blank>") {
        cFirst = "";
    };
    if (userLast === "<blank>") {
        cLast = "";
    };

    $("#fNameText").hide();
    $("#lNameText").hide();
    $("#nameEditButton").hide();
    $("#fNameInp").val(cFirst);
    $("#lNameInp").val(cLast);
    $("#fNameInp").show();
    $("#lNameInp").show();
    $("#nameSubmitButton").show();
    $("#nameCancelButton").show();
    $("#fNameInp").focus();
};

function cancelNameEdit() {
    $("#fNameInp").val("");
    $("#lNameInp").val("");
    $("#fNameInp").hide();
    $("#lNameInp").hide();
    $("#nameSubmitButton").hide();
    $("#nameCancelButton").hide();
    $("#fNameText").show();
    $("#lNameText").show();
    $("#nameEditButton").show();
};

function submitName() {
    userName = $("#fNameInp").val();
    userLast = $("#lNameInp").val();

    $.post("nameEdit?", { first: userName, last: userLast })
        .fail(function () {
            swal('Oops!', 'Could not save data', 'error');
        })
        .always(function () {
            $("#welcome").text("Welcome, " + userName);
            $("#fNameText").text(userName);
            $("#lNameText").text(userLast);
            setCookie("user", userName);
            setCookie("userLast", userLast);
            cancelNameEdit();
        });
};

function changePSWD() {
    var cOld = $("#OldPswd").val();
    var cNew1 = $("#NewPswd1").val();
    var cNew2 = $("#NewPswd2").val();

    // blank out in case we are here a second (or more) time....
    $("#pwOldText").html("&nbsp;");
    $("#pwNewText1").html("&nbsp;");
    $("#pwNewText2").html("&nbsp;");

    $.post("changePassword?", { cOld: cOld, cNew1: cNew1, cNew2: cNew2 }, function (obj) {
        if (obj.result == "success") {
            $("#pwNewText2").css("color", "green");
            $("#pwNewText2").text("Password successfully changed.")
            $("#OldPswd").val("");
            $("#NewPswd1").val("");
            $("#NewPswd2").val("");
        } else {
            if (obj.hasOwnProperty("oldText")) {
                $("#pwOldText").text(obj.oldText);
            }
            if (obj.hasOwnProperty("newText1")) {
                $("#pwNewText1").text(obj.newText1);
            }
            if (obj.hasOwnProperty("newText2")) {
                $("#pwNewText2").text(obj.newText2);
            }
        }
    });
};

function loadSettingsFromFile() {
    var file = '##ONLY##';
    var aL = $("input[name='settingFile']").length;

    $.spin('true');

    if (aL > 1) {
        file = $("input[name='settingFile']:checked"). val();
    }

    $.post("loadSettingsFromFile?", 
        { cFile: file },
        function(json) {
            if (json.error) {
                $.spin('false');
                swal('Error', json.error, 'error');
            } else {
                $("#customField1").prop('checked', json.customField1);
                $("#customField2").prop('checked', json.customField2);
                $("#customField1Label").append(json.customField1Label);
                $("#customField2Label").append(json.customField2Label);

                $('#frequentSubTotal').prop('checked', json.freqSubTotal === 'Y');
                $('#frequentGrTotal').prop('checked', json.freqSubTotal === 'N');
                $('#frequentItem').prop('checked', json.freqSubTotal === 'I');
                $('#frequentPoint').val(json.freqPt);
                $('#frequentDayX').val(json.freqDay);
                $('#frequentSun').prop('checked',json.freqDoW.includes('1'));
                $('#frequentMon').prop('checked',json.freqDoW.includes('2'));
                $('#frequentTue').prop('checked',json.freqDoW.includes('3'));
                $('#frequentWed').prop('checked',json.freqDoW.includes('4'));
                $('#frequentThu').prop('checked',json.freqDoW.includes('5'));
                $('#frequentFri').prop('checked',json.freqDoW.includes('6'));
                $('#frequentSat').prop('checked',json.freqDoW.includes('7'));
                $('#frequentLargeX').val(json.freqLge);
                $('#frequentLargeAmt').val(json.freqTot);
                $('#frequentAdd').prop('checked', json.freqAdd);
                $('#frequentLargeAmt').blur();  // trigger format

                $("#lastLoadDate").empty();
                $("#lastLoadDate").html('<b>Settings last loaded on ' + json.lastLoad + '</b><br><br>');
        
                swal('Success', "Your settings have been loaded", 'success');
                $.spin('false');
            }
    });
}

function refreshSettingsFiles(lSpin) {
    if (lSpin) {
        $.spin('true');    
    }

    $.post( "getSettingsFiles?", "", function(json) {
        var cFileText;
        $("#settingsFoundText").empty();
        $("#lastLoadDate").empty();

        switch(json.settingsFiles.length) {
            case 0:
              cFileText = 'no template files.  Go to LiquorPOS&rarr;Customize and select "Save as template".  Then return here and click "Refresh".'
              $("#settingsUpload").hide();
              break;
            case 1:
              cFileText = 'the template file named: ' + json.settingsFiles[0] + '. Click "Upload" if this the correct file ' + 
                          'or go to LiquorPOS&rarr;Customize and select "Save as template" to create a new file.  Then return here and click "Refresh".'
              $("#settingsUpload").show();
              break;
            default:
                cFileText = json.settingsFiles.length + ' template files.  Select the correct file and click ""Upload" or go to LiquorPOS&rarr;Customize and ' +
                            'select "Save as template" to create a new file.  Then return here and click "Refresh".<br><br>' +
                            '<fieldset id="selectSettingFile" name="selectSettingFile"><legend>&nbsp;Settings Files&nbsp;</legend>' +
                            '<p class="cssRadios" id="settingFilesPara">'
                
                            json.settingsFiles.forEach( function(item, index) {
                                var cF = item.substr(3, item.indexOf('</b>')-3);
                                cFileText += '<label for="setFile'+index+'"'
                                if (index+1 < json.settingsFiles.length) { cFileText += ' style="margin: 3px 0 10px 0;"'};
                                cFileText += '><input type="radio" name="settingFile" value="' + cF + '" id="setFile'+index+'"'
                                if (index===0) { cFileText += ' checked'};
                                cFileText += '>' + '<span class="rdo"></span><span style="left-margin: 8px;">' + item + '</span></label><br>'
                            });

                            cFileText += '</p></fieldset>'
              $("#settingsUpload").show();
          }

          $("#settingsFoundText").html(cFileText);

          if (json.lastLoad) {
              $("#lastLoadDate").html('<b>Settings last loaded on ' + json.lastLoad + '</b><br><br>');
          }

          if (lSpin) {
             $.spin('false');    
          }
    });
}

function settings() {
    refreshSettingsFiles();

    $.post( "doingWebOrders?", function(reply) {
        $("#doWebOrders").prop('checked', reply.doing);
        if (reply.doing) {
            $("#editWebOrderSettings").show();
        } else {
            $("#editWebOrderSettings").hide();
        }
    });

    $.post("upcGetSettings?", "", function (data) {
        var cTxt;
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $("#" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
                cTxt = $("#" + data.aSet[idx][0] + "_Say").text();
                if (data.aSet[idx][1]) {
                    cTxt = cTxt.replace('OFF', 'ON');
                } else {
                    cTxt = cTxt.replace('ON', 'OFF');
                }
                $("#" + data.aSet[idx][0] + "_Say").text(cTxt);
            }
        });
    });

    $.post("frequentGetSettings?", "", function (data) {
        pub_RemoteDo = data.remoteDo;
        $('#doFrequent').prop('checked', data.frequent);
        $('#frequentSubTotal').prop('checked', data.freqSubTotal === 'Y');
        $('#frequentGrTotal').prop('checked', data.freqSubTotal === 'N');
        $('#frequentItem').prop('checked', data.freqSubTotal === 'I');
        $('#frequentPoint').val(data.freqPt);
        $('#frequentDayX').val(data.freqDay);
        $('#frequentSun').prop('checked',data.freqDoW.includes('1'));
        $('#frequentMon').prop('checked',data.freqDoW.includes('2'));
        $('#frequentTue').prop('checked',data.freqDoW.includes('3'));
        $('#frequentWed').prop('checked',data.freqDoW.includes('4'));
        $('#frequentThu').prop('checked',data.freqDoW.includes('5'));
        $('#frequentFri').prop('checked',data.freqDoW.includes('6'));
        $('#frequentSat').prop('checked',data.freqDoW.includes('7'));
        $('#frequentLargeX').val(data.freqLge);
        $('#frequentLargeAmt').val(data.freqTot);
        $('#frequentAdd').prop('checked', data.freqAdd);
        $('#frequentMultiChk').prop( 'checked', data.freqMulti );
        $('#frequentPhone').prop('checked', data.freqPhone === true);
        $('#frequentCard').prop('checked', data.freqPhone !== true);
        $('#frequentLargeAmt').blur();  // trigger format
    });

    $.post("getTimeClockSettings?", "", function (data) {
        $('[name="timeClockScope"]').removeAttr('checked');
        $("input[name=timeClockScope][value=" + data.tcScope + "]").prop('checked', true);

        $('#timeClockShowAll').prop('checked', data.tcShowAll);

        $('[name="timeClockFormat"]').removeAttr('checked');
        $("input[name=timeClockFormat][value=" + data.tcFormat + "]").prop('checked', true);

        $('[name="timeClockPeriod"]').removeAttr('checked');
        $("input[name=timeClockPeriod][value=" + data.tcPeriod + "]").prop('checked', true);

        $('#timeClockDayOfWeek').val(data.tcDoW);

        $('[name="timeClockRounding"]').removeAttr('checked');
        $("input[name=timeClockRounding][value=" + data.tcRound + "]").prop('checked', true);

        $('#timeClockRoundUp').prop('checked', data.tcRoundUp);

        timeClockPeriodToggle();
        timeClockRoundToggle();
    });

    $.post("loadInventorySettings", "", function(data) {
        $("#customField1").prop('checked', data.customField1);
        $("#customField2").prop('checked', data.customField2);
    });

    $("#userDropdown").hide();
    $("#Modal_Settings").toggle(true);
    $(".encoreBody").css("overflow", "hidden");
    $("nav").toggle(false);

    $.post( "getShortcuts?", {"cUID": uid}, function(data) {
        if ( savedMenuActive || (!data.invPerfSaved && !data.cusGMSaved && !data.vendGMSaved) ) {
            $("#shortcutRestore").hide();
        } else if (Object.keys(data).length > 0) {
            $("#shortcutRestore").show();
            $("#shortcutRestoreButton").attr("data",JSON.stringify(data));
        }
    } );
};

function closeSettings() {
    $('input[type="range"]:eq(0)').val(nUpdate).change();
    $('input[type="range"]:eq(1)').val(nAutoLogout).change();

    $("#Modal_Settings_Body").scrollTop(0);
    $(".encoreBody").css("overflow", "auto");
    $("#Modal_Settings").hide();
    settingsToggle(null,"*");
    $("nav").toggle(true);
};

function saveSettings() {
    var aUPCset = [];
    var oFrequent;
    var oTimeClock;
    var cDays = '';
    var freqSubTotal = 'Y';
    var customField1 = $('#customField1').prop('checked');
    var customField2 = $('#customField2').prop('checked');

    if ($('#frequentGrTotal').prop('checked')) {
        freqSubTotal = 'N';
    } else if ($('#frequentItem').prop('checked')) {
        freqSubTotal = 'I';
    }

    $('#frequentDays').find('.dayChecks').each( function(idx){
        if ($(this).prop('checked')) { cDays += (idx+1).toString()};
    });

    oFrequent = {
        freqBuyer:    $('#doFrequent').prop('checked'),
        freqSubTotal: freqSubTotal,
        freqPt:       $('#frequentPoint').val(),
        freqDayX:     $('#frequentDayX').val(),
        freqDoW:      cDays,
        freqLargeX:   $('#frequentLargeX').val(),
        freqLargeAmt: $('#frequentLargeAmt').val(),
        freqAdd:      $('#frequentAdd').prop('checked'),
        freqMulti:    $('#frequentMultiChk').prop('checked'),
        freqPhone:    $('#frequentPhone').prop('checked')
    };
    $.post('saveFrequentSettings?', oFrequent)

    oTimeClock = {
        tcScope:   $('input[name=timeClockScope]:checked').val(),
        tcShowAll: $('#timeClockShowAll').is(':checked'),
        tcFormat:  $('input[name=timeClockFormat]:checked').val(),
        tcPeriod:  $('input[name=timeClockPeriod]:checked').val(),
        tcDoW:     $('#timeClockDayOfWeek').val(),
        tcRound:   $('input[name=timeClockRounding]:checked').val(),
        tcRoundUp: $('#timeClockRoundUp').is(':checked')
    };
    $.post('saveTimeClockSettings?', oTimeClock)


    nUpdate = $('input[type="range"]:eq(0)').val();
    nAutoLogout = $('input[type="range"]:eq(1)').val();
    cProcTime = $("#processTime").val().trim();

    setCookie("procTime", cProcTime);
    setCookie("updateTime", nUpdate.toString());
    setCookie("autoLogout", nAutoLogout.toString());

    $("#Modal_Settings .UPC_Chk").each(function (index) {
        var aTmp = [];
        aTmp.push($(this).attr('id'));
        aTmp.push($(this).is(':checked'));
        aUPCset.push(aTmp);
    });

    $.post("saveSettings?", 
        { update: nUpdate, 
          logout: nAutoLogout, 
          procTime: cProcTime, 
          upcSet: JSON.stringify(aUPCset), 
          customField1: customField1, 
          customField2: customField2
        })
        .fail(function () {
            swal('Oops!', 'Could not save data', 'error');
        })
        .always(function () {
            lastActionTime = new Date().getTime();

            // stop and restart autoLogout timer
            clearInterval(autoLogoutTimer);
            autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);

            $("#Modal_Settings_Body").scrollTop(0);
            $("#Modal_Settings").hide();
            settingsToggle(null,"*");
            $("nav").toggle(true);
    });

    //----- make sure online ordering is turned off if not selected
    if ( !$("#doWebOrders").prop('checked') ) {
        doWebOrders = false;
        $.post("turnOffOnlineOrdering?");
    } 
};

function fileMaintenance() {
    $("#fileMaintenancePrompt").show();
    $.post("fileMaintenance?", "")
        .always(function () {
            $("#fileMaintenancePrompt").hide();
            swal('Complete', 'The process has completed.', 'success');
        });
};

function suggestUPCSettings(cId) {
    $("#barcSetPrompt").show();
    $.post("upcSuggestions?", "")
        .done(function (data, status) {
            $("#barcSetPrompt").hide();
            if (data.result === 'success') {
                swal({
                    title: "Complete!",
                    text: 'Result: ' + data.msg,
                    type: "success",
                    showCancelButton: true,
                    confirmButtonColor: "#7591db",
                    confirmButtonText: "Yes, change my settings!",
                    closeOnConfirm: false
                },
                    function () {
                        $.each(data.aSet, function (idx, item) {
                            if (data.aSet[idx][1] !== '?') {
                                $("#" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
                            }
                        })
                        swal("Remember to 'Save' the changes!", "", "info");
                    });
            } else {
                swal('Failed', 'The system could not determine your settings.', 'error');
            }
        })
        .fail(function () {
            $("#barcSetPrompt").hide();
            swal('Error', 'An error was encountered.', 'error');
        });
};

function frequentSettingsToggle() {
    var lDisable = !$('#doFrequent')[0].checked;
    var color = (lDisable ? "#ccc" : "");

    $("#frequentName").prop("disabled", lDisable);
    $("#frequentNameDiv").children().css("color", color);
    $(".frequentGridDiv fieldset").find("input").prop("disabled", lDisable);
    $(".frequentGridDiv fieldset").find("input").css("border-color", color);
    //$(".frequentGridDiv fieldset").find("button").prop("disabled", lDisable);
    $(".frequentGridDiv fieldset").children().css("color", color);
    $("#frequentAdd").prop("disabled", lDisable);
    $("label[for='frequentAdd']").css("color", color);
    
    frequentIDToggle();
    $("input[name='frequentBasis']").trigger("change");

}

function frequentIDToggle() {
    //--- now check if whole page is disabled
    var lDisable = !($("#doFrequent").is(":checked"));
    var color = (lDisable ? "#ccc" : "");

    $('#frequentMultiChk').prop('disabled', lDisable);
    $('#frequentPhone').prop('disabled', lDisable);
    $('#frequentCard').prop('disabled', lDisable);
    $('label[for="frequentPhone"]').css("color", color);
    $('label[for="frequentCard"]').css("color", color);
    $("#frequentIDPrompt").css("color", color);

    //---- now check local setting
    lDisable = !($("#frequentMultiChk").is(":checked") && $("#doFrequent").is(":checked"));
    color = (lDisable ? "#ccc" : "");

    $('#frequentPhone').prop('disabled', lDisable);
    $('#frequentCard').prop('disabled', lDisable);
    $('label[for="frequentPhone"]').css("color", color);
    $('label[for="frequentCard"]').css("color", color);
    $("#frequentIDPrompt").css("color", color);
}

function frequentSettingsFileButtonChanged() {
    var str = $('#frequentSettingsFileInput').val();
    var res = str.split('\\').pop().split('/').pop();
    $('#frequentSettingsFileName').text('File: ' + res);        
}

function modalWebOrderSettingsForm(fromEdit,chkBox) {
    if (chkBox && !$(chkBox).is(':checked')) {
        return;
    }

    $.post('getOnlineOrderSettings?', function (reply) {
        $("#doDrizly").prop('checked', reply.doDrizly);
        $("#webDrizlyTender").prop('disabled', !reply.doDrizly);
        $("#webDrizlyTender").val(reply.drizlyTender);
        $("#DrizlyExempt").prop('disabled', !reply.doDrizly);
        $("#DrizlyExempt").prop('checked', reply.DrizlyExempt);
        if (reply.doDrizly) {
            $("label[for='webDrizlyTender']").css({color: ''});
            $("#DrizlyExemptLabel").css({color: ''});
        } else {
            $("label[for='webDrizlyTender']").css({color: 'gray'});
            $("#DrizlyExemptLabel").css({color: 'gray'});
        }

        $("#doCityHive").prop('checked', reply.doCityHive);
        $("#webCityTender").prop('disabled', !reply.doCityHive);
        $("#webCityTender").val(reply.cityTender);
        $("#CityExempt").prop('disabled', !reply.doCityHive);
        $("#CityExempt").prop('checked', reply.CityExempt);
        if (reply.doCityHive) {
            $("label[for='webCityTender']").css({color: ''});
            $("#CityExemptLabel").css({color: ''});
        } else {
            $("#webCityTender").prop('disabled', true);
            $("label[for='webCityTender']").css({color: 'gray'});
            $("#CityExemptLabel").css({color: 'gray'});
        }

        $("#doNose").prop('checked', reply.doNose);
        $("#webNoseTender").prop('disabled', !reply.doNose);
        $("#webNoseTender").val(reply.noseTender);
        $("#NoseExempt").prop('disabled', !reply.doNose);
        $("#NoseExempt").prop('checked', reply.NoseExempt);
        if (reply.doNose) {
            $("label[for='webNoseTender']").css({color: ''});
            $("#NoseExemptLabel").css({color: ''});
        } else {
            $("#webNoseTender").prop('disabled', true);
            $("label[for='webNoseTender']").css({color: 'gray'});
            $("#NoseExemptLabel").css({color: 'gray'});
        }

        $("#webDrawerNbr").val(reply.drawer);
        $("#webTenderType").val(reply.tender);
        $("#webPrint").prop('checked', reply.doPrint);

        $("#webFee").prop('checked', reply.doFee);
        if (reply.doFee) {
            $("#webFeeSKU").val(reply.barcode);
            $("label[for='webFeeSKU']").css({color: ''});
        } else {
            $("label[for='webFeeSKU']").css({color: 'gray'});
        }
        $("#webFeeSKU").prop('disabled', !reply.doFee);

        $("#webBag").prop('checked', reply.doBag);
        if (reply.doBag) {
            $("#webBagSKU").val(reply.bagBarcode);
            $("label[for='webBagSKU']").css({color: ''});
        } else {
            $("label[for='webBagSKU']").css({color: 'gray'});
        }
        $("#webBagSKU").prop('disabled', !reply.doBag);        

        $("#webConv").prop('checked', reply.doConv);
        if (reply.doConv) {
            $("#webConvSKU").val(reply.convBarcode);
            $("label[for='webConvSKU']").css({color: ''});
        } else {
            $("label[for='webConvSKU']").css({color: 'gray'});
        }
        $("#webConvSKU").prop('disabled', !reply.doConv);        

        $("#webTip").prop('checked', reply.doTip);
        $("#webPts").prop('checked', reply.doPts);
        $("#webEmail").val(reply.email);
        
        orderSettingsDialog = $("#webOrderSettingsDialog").dialog({
            autoOpen: false,
            height: 725,
            width: 580,
            modal: true,
            buttons: [
                {
                    id: "orderSettingsSubmit",
                    text: "Save",
                    click: function () {
                        var pswd = $("#webPswd").val();
                        $("#invalidOrderEmail").hide();
                        $("#emptyOrderPswd").hide();
                        $(".checkaVendor").hide();
                        if (!$("#doDrizly").is(':checked') && !$("#doCityHive").is(':checked')) {
                            $(".checkaVendor").css({display: 'block'});
                            setTimeout( function() {$("#doDrizly").focus();}, 10);
                            return;
                        }
                        if (!IsEmail($("#webEmail").val())) {
                            $("#invalidOrderEmail").show();
                            setTimeout( function() {$("#webEmail").focus();}, 10);
                            return;
                        } else if (!fromEdit && pswd.trim() === '') {
                            $("#emptyOrderPswd").show();
                            setTimeout( function() {$("#webPswd").focus();}, 10);
                            return;
                        }
                        saveOnlineOrderSettings();
                        $(this).dialog("close");
                    }
                },
                {
                    id: "orderSettingsCancel",
                    text: "Cancel",
                    click: function () {
                        $(this).dialog("close");
                    }
                }],
            close: function () {
                $("#invalidOrderEmail").hide();
                $("#emptyOrderPswd").hide();
                $(".checkaVendor").hide();
            }
        });

        orderSettingsForm = orderSettingsDialog.find("form").on("submit", function (event) {
            event.preventDefault();
            var pswd = $("#webPswd").val();
            $("#invalidOrderEmail").hide();
            $("#emptyOrderPswd").hide();
            $(".checkaVendor").hide();
            if (!$("#doDrizly").is(':checked') && !$("#doCityHive").is(':checked')) {
                $(".checkaVendor").css({display: 'block'});
                setTimeout( function() {$("#doDrizly").focus();}, 10);
                return;
            }
            if (!IsEmail($("#webEmail").val())) {
                $("#invalidOrderEmail").show();
                setTimeout( function() {$("#webEmail").focus();}, 10);
                return;
            } else if (!fromEdit && pswd.trim() === '') {
                $("#emptyOrderPswd").show();
                setTimeout( function() {$("#webPswd").focus();}, 10);
                return;
            }
            saveOnlineOrderSettings();
            orderSettingsDialog.dialog("close");
        });

        orderSettingsDialog.dialog("open");
        $(orderSettingsDialog).css({ "z-index": "100000 !important" });

        var color = $("#webPswd").css("background-color");
        $(".pswdInputContainer").css({ "background-color": color });

        $("#webPrint").focusin( function() {$("#webPrintCbx").css({"outline": "-webkit-focus-ring-color auto 1px"});}); // "3px solid #43a3d7b8", "outline-radius": "2px"});});
        $("#webPrint").focusout( function() {$("#webPrintCbx").css({"outline": ""});});

    });
}

function saveOnlineOrderSettings() {
    var setObj = 
    { 
        doDrizly: false,
        doCityHive: $("#doCityHive").prop('checked'),
        doNose: $("#doNose").prop('checked'),
        drawer: $("#webDrawerNbr").val(),
        drizlyTender: 0,
        cityTender: $("#webCityTender").val(),
        noseTender: $("#webNoseTender").val(),
        DrizlyExempt: false,
        CityExempt: $("#CityExempt").prop('checked'),
        NoseExempt: $("#NoseExempt").prop('checked'),
        doPrint: $("#webPrint").prop('checked'),
        doFee: $("#webFee").prop('checked'),
        doBag: $("#webBag").prop('checked'),
        doTip: $("#webTip").prop('checked'),
        doPts: $("#webPts").prop('checked'),
        doConv: $("#webConv").prop('checked'),
        feeBarc: $("#webFeeSKU").val(),
        bagBarc: $("#webBagSKU").val(),
        convBarc: $("#webConvSKU").val(),
        user: $("#webEmail").val(),
        pswd: $("#webPswd").val()
    }

    doWebOrders = true;

    $.post('saveOnlineOrderSettings', setObj, function(reply) {console.log(reply.result);} );

    getPendingOnlineOrders();
}

function showPriceLevelSettingsForm() {
    $.spin(true);

    // $.post('secureChk?', { proc: 'prLevel', uid: uid }, function (reply) {
    //     if (!reply.ok) {
    $.post("ChkPoint?", { user: uid, session: SID, func: 'DG' }, function (reply) {
        if (reply.result !== 'success') {
            $.spin(false);
            vex.dialog.alert({
                message: 'You do not have authorization to run this utility.'
            });
            return;
        } else {
            priceLevelSettingsDialog = $("#prLevelSettingsDialog").dialog({
                autoOpen: false,
                resizable: false,
                height: 660,
                width: 800,
                minHeight: 660,
                minWidth: 800,
                modal: true,
                buttons: [
                    {
                        id: "priceLevelSettingsSubmit",
                        text: "Save",
                        click: function () {
                            savePrLevelSettings();
                            //priceLevelSettingsDialog.dialog("close");
                            $("#prLevelRunButton").prop('disabled', false);
                        }
                    },
                    {
                        id: "priceLevelSettingsCancel",
                        text: "Close",
                        click: function () {
                            $(this).dialog("close");
                        }
                    }],
                close: function () {
                    $("#prLevelRunButton").remove();
                }
            });

            priceLevelSettingsForm = priceLevelSettingsDialog.find("form").on("submit", function (event) {
                event.preventDefault();
                savePrLevelSettings();
                //priceLevelSettingsDialog.dialog("close");
                $("#prLevelRunButton").prop('disabled', false);
            });

            priceLevelSettingsDialog.dialog("open");
            $(priceLevelSettingsDialog).css({ "z-index": "100000 !important" });

            let buttons = '<button id="prLevelRunButton" onclick="prLevelRunNow()" disabled>Run Now</button>';
            $(".ui-dialog-buttonpane").prepend(buttons);

            loadPrLevelSettings();
            $.spin(false);
        }
    })
    .always( function() {
        $.spin(false);
    });

}

function savePrLevelSettings() {
    let setObj = {};
    $('#prLevelSettingsDialog input[type=checkbox]').each( function() {
        let cKey = $(this).attr('data-id');
        let val  = $(this).is(':checked');
        setObj[cKey] = val;
    });
    $('#prLevelSettingsDialog select').each( function() {
        let cKey = $(this).attr('data-id');
        let val  = $(this).val();
        setObj[cKey] = val;
    });
    $('#prLevelSettingsDialog input[type=text]').each( function() {
        let cKey = $(this).attr('data-id');
        let val  = $(this).val();
        setObj[cKey] = val;
    });

    $.post('savePriceUtilSettings', setObj);

}

function prLevelToggle(chkBox, para) {
    let checked = $(chkBox).is(':checked');
    let myColor = ((checked) ? '' : 'gray');

    //- 1st set everything disabled
    $(para).css({color: 'gray'});
    $(para).find(".prLevelX").css({color: 'gray'});
    $(para).find(".prLevelLabelC").css({color: 'gray'});
    $(para).find("input").prop('disabled', true);
    $(para).find("select").prop('disabled', true);

    //- now select just the elements to be enabled when checked
    $(para).find("input[type=checkbox]").prop('disabled', !checked);
    $(para).find("input").eq(0).prop('disabled', !checked);
    $(para).find("select").eq(0).prop('disabled', !checked);
    $(para).find(".prLevelX").eq(0).css({color: myColor});
    $(para).find(".prLevelLabelU").css({color: myColor});
    $(para).find(".prLevelFormula").css({color: myColor});
    $(para).find(".prLevelLabelC").css({color: myColor});
    $(para).find("input[type=checkbox]").change();

}

function prLevelToggleRound(chkBox, upInput, nearest) {
    let char = $(chkBox).prop('id').charAt(5);
    char = (char==='M' ? 'Min' : char);
    let checked = $(chkBox).is(':checked') && $('#doPrice'+char).is(':checked');
    let myColor = ((checked) ? '' : 'gray');

    if ($(chkBox).prop('id').slice(-1) === 'C') {
        checked = checked && $('#doCase'+char).is(':checked');
    }

    $(upInput).prop('disabled', !checked);
    $(nearest).prop('disabled', !checked);
    $(upInput).parent().css( {color: myColor} );
}

function prLevelToggleCase(chkBox,caseSpan) {
    let char = caseSpan.slice(-1);
    char = (char==='n' ? 'Min' : char);
    let checked = $(chkBox).is(':checked') && $('#doPrice'+char).is(':checked');
    let myColor = ((checked) ? '' : 'gray');
    $(caseSpan).find('input').prop('disabled', !checked);
    $(caseSpan).find('select').prop('disabled', !checked);
    $(caseSpan).css( {color: myColor} );
    $(caseSpan).find('span').css( {color: myColor} );
    
    $('#round'+char+'C').change();
}

function loadPrLevelSettings() {
    $.post('getPriceUtilSettings?', function (json) {
        let aKeys = Object.keys(json);
        let aVals = Object.values(json);

        $.each(aKeys, function (idx, item) {
            if (item === 'prLevelSetUp') {
                $("#prLevelRunButton").prop('disabled', aVals[idx]);
                console.log("Button is disabled:", aVals[idx]);
            } else {
                let ele = document.querySelector('[data-id="' + item + '"]');
                let prefix = item.substring(0, 2);
                if (prefix === 'do') {
                    $(ele).prop('checked', aVals[idx]);
                    $(ele).change();
                } else {
                    $(ele).val(aVals[idx]);
                }
            }
        });
        $("#prLevelSettingsForm input").on("change",function() {
            $("#priceLevelSettingsSubmit").prop("disabled", false);
        });
    
        $("#prLevelSettingsForm select").on("change",function() {
            $("#priceLevelSettingsSubmit").prop("disabled", false);
        });
    
        $("#priceLevelSettingsSubmit").prop("disabled", true);
        
    });
}

function prLevelRunNow() {
    vex.dialog.confirm({
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' +
                        'Run price level utility now with these settings?<br><br>' +
                        '<b>NOTE: </b>Prices will be changed on all items!',
        className: 'vex-theme-multiButtons',
        callback: function (value) {
            if (value) {
                $.spin(true);
                $.post("runPriceUtil?", function (reply) {
                    $.spin(false);
                    if (reply.result === 'fail') {
                        vex.dialog.alert({
                            unsafeMessage: 'Error: ' + reply.msg + '<br>Prices have not been changed.'
                        });
                    } else {
                        vex.dialog.alert({
                            message: 'The price utility has successfully completed.'
                        });
                    }
                })
                .always(function () {
                    $.spin(false);
                });
            }
        }
    });
}

function toggleInputAndLabel( chkBox, input, input2, span ) {
    var checked = $(chkBox).is(':checked');
    var myColor = ((checked) ? '' : 'gray');
    $(input).prop('disabled', !checked); 
    if (input.charAt(0) === '.' || input.charAt(0) === '#') {
        input = input.substring(1);
    }
    $("label[for='" + input + "']").css( {color: myColor} );
    if( input2) {
        $(input2).prop('disabled', !checked); 
        if (input2.charAt(0) === '.' || input2.charAt(0) === '#') {
            input2 = input2.substring(1);
        }
        $("label[for='" + input2 + "']").css( {color: myColor} );    
    }
    if( span) {
        $(span).css( {color: myColor} );    
    }
}

function IRIsettings() {
    var curr = new Date;
    var lastSatDay = curr.getDate() - curr.getDay() - 1;
    var lastSatDate = new Date(curr.setDate(lastSatDay));
    var oPicker;

    $.post("getIRIsettings?", "", function (data) {
        $("#enableIRI").prop("checked", data.pub_IRI_lDo);

        if (data.pub_IRI_Store.trim()) {
            $("#IRIstoreNbr").val(data.pub_IRI_Store);
        }

        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $("#Modal_IRISettings #" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
            }
        });

        oPicker = $('#IRIselectDate').pickadate({
            format: 'mm-dd-yyyy',
            labelMonthNext: 'Go to the next month',
            labelMonthPrev: 'Go to the previous month',
            labelMonthSelect: 'Pick a month from the dropdown',
            labelYearSelect: 'Pick a year from the dropdown',
            selectMonths: true,
            selectYears: true,
            disable: [1, 2, 3, 4, 5, 6],
            closeOnSelect: true
        });

        var picker_end_date = oPicker.pickadate('picker');
        picker_end_date.set('select', lastSatDate);

        $("#IRIschedAutoDay").val(parseInt(data.pub_IRI_Day));

//        $("#IRIschedAutoTime").val(data.pub_IRI_Time);

        IRISchedNowToggle();
        IRIsettingsToggle();

        $("#userDropdown").hide();
        $("#Modal_IRISettings").show();
        $("nav").toggle(false);
        $("#tab_dash").hide();

    });

};

function closeIRISettings() {
    $("#Modal_IRISettings").hide();
    $('#IRIschedNowChk').attr('checked', false);
    IRISchedNowToggle();
    $("nav").toggle(true);
    $("#tab_dash").show();
};

function IRIsettingsToggle() {
    var lDisable = !$('#enableIRI')[0].checked;
    var color = "";

    if (lDisable) {
        color = "#ccc"
    };

    $(".IRIsetToggleDiv").find('*').prop("disabled", lDisable);
    $(".IRIsetToggleDiv").find('*').css("color", color);

    if (!lDisable) {
        IRISchedNowToggle();
        $(".IRIsetToggleDiv").find('.iriSettingDiv').css("display", "block");
    } else {
        $(".IRIsetToggleDiv").find('.iriSettingDiv').css("display", "none");
    }

}

function IRISchedNowToggle() {
    var lDisable = !$('#IRIschedNowChk')[0].checked;
    var color = "";

    if (lDisable) {
        color = "#ccc"
    };

    $(".IRIschedNowDiv").find('*').prop("disabled", lDisable);
    $(".IRIschedNowDiv").find('*').css("color", color);

}

function saveIRISettings() {
    var aUPCset = [];
    var pub_IRI_lDo = $('#enableIRI')[0].checked;
    var pub_IRI_Store = $("#IRIstoreNbr").val();
    var pub_IRI_lAuto = true;
    var pub_IRI_Time = ''; //$("#IRIschedAutoTime").val().trim();
    var pub_IRI_Day = $("#IRIschedAutoDay").val();
    var nStore = parseInt(pub_IRI_Store);

    if (isNaN(nStore) || nStore < 1) {
        $("#IRIstoreNbr").focus();
        $("#IRIstoreNbr").css("background-color", "#FFE4E1");
        swal("Oops...", "Please input assigned store number.", "error");
        return;
    }

    $("#Modal_IRISettings .UPC_Chk").each(function (index) {
        var aTmp = [];
        aTmp.push($(this).attr('id'));
        aTmp.push($(this).is(':checked'));
        aUPCset.push(aTmp);
    });

    $.post("saveIRISettings?",
        {
            pub_IRI_lDo: pub_IRI_lDo,
            pub_IRI_Store: pub_IRI_Store,
            pub_IRI_lAuto: pub_IRI_lAuto,
            pub_IRI_Time: pub_IRI_Time,
            pub_IRI_Day: pub_IRI_Day,
            upcSet: JSON.stringify(aUPCset)
        })
        .fail(function () {
            swal('Oops!', 'Could not save data', 'error');
        })
        .always(function () {
            $("#Modal_IRISettings").hide();
            $('#IRIschedNowChk').attr('checked', false);
            IRISchedNowToggle();
            $("nav").toggle(true);
        });
};

function runIRInow() {
    var cDate = $('#IRIselectDate').val();
    var cStore = $('#IRIstoreNbr').val();

    $('#Modal_IRISettings').spin('modal');

    $.post("runIRInow?",
        {
            cDate: cDate,
            cStore: cStore
        },
        function (obj) {
            if (obj.result === 'success') {
                swal('Success!', 'Your data has been sent!', 'success');
            } else {
                swal('Oops!', 'We encountered a problem posting your data!\n' + obj.result, 'error');
            }
            $('#Modal_IRISettings').spin('modal');
            $('#IRIschedNowChk').prop('checked', false);
            $(".IRIschedNowDiv").find('*').prop("disabled", true);
        })
        .fail(function (jqXHR, textStatus, error) {
            swal('Oops!', 'We encountered a problem posting your data!', 'error');
            $('#Modal_IRISettings').spin('modal');
        });
}

function getAlerts() {
    $.post("getAlerts?", "", function (obj) {
        var ctxt = obj.alertText;

        $(document.body).append(ctxt);
        $("#Modal_Alerts").show();
    })
        .fail(function (jqXHR, textStatus, error) {
            console.log("Post error: " + error);
        });
};

function clearAlerts() {
    $.post("clearAlerts?")

    $("#viewAlerts").remove();

    $("#userImage").attr("src", "images/user_24.png");
    $("#welcome").css("color", "#43a3d7");
    $(".navUser").css("color", "#43a3d7");
    lAlertShown = false;

    closeAlerts();
}

function closeAlerts() {
    $("#Modal_Alerts").hide();
    $("#Modal_Alerts").remove();
};

function showUsersTable() {
    var x = document.getElementById("Modal_Users");

    $("Modal_Account").hide();

    usersTable = $('#userstable').DataTable({
        dom: 'Brtip',
        ajax: "usersTable?",
        columns: [
            { data: "uid" },
            { data: "fname" },
            { data: "lname" },
            { data: "doDash" },
            { data: "doRemote" },
            { data: "lSysQoH" },
            { data: "lCost" },
            { data: "slevel" }
        ],
        select: {
            style: 'single'
        },
        order: false,
        buttons: [
            { extend: "create", editor: userEditor },
            { extend: "edit", editor: userEditor, disable: 'uid' },
            {
                extend: "remove",
                editor: userEditor,
                formMessage: function (e, dt) {
                    var rows = dt.rows(e.modifier()).data().pluck('uid');
                    return 'Are you sure you want to delete the user: ' + rows[0] + '?';
                }
            }
        ]
    });

    x.style.display = "block";
}

function userClose() {
    usersTable.clear().destroy(false);
    $("#Modal_Users").hide();
}

function showStoresTable() {
    var x = document.getElementById("Modal_Stores");

    $("Modal_Account").toggle(false);

    storesTable = $('#storesTable').DataTable({
        dom: 'Brtip',
        ajax: "storesTable?",
        columns: [
            { data: "order", className: 'reorder', width: '50px' },
            { data: "serial" },
            { data: "name" },
            { data: "datashare" }
        ],
        columnDefs: [
            { orderable: false, targets: [1, 2, 3] }
        ],
        rowReorder: {
            dataSrc: 'order',
            editor: storesEditor
        },
        select: true,
        buttons: [
            { extend: "create", editor: storesEditor },
            { extend: "edit", editor: storesEditor },
            {
                extend: "remove",
                editor: storesEditor,
                formMessage: function (e, dt) {
                    var num = dt.rows().count();
                    var rows = dt.rows(e.modifier()).data().pluck('serial');
                    return 'Are you sure you want to delete store nbr: ' + rows[0] + '?';
                }
            }
        ]
    });

    storesEditor
        .on('postCreate postRemove', function () {
            // After create or edit, a number of other rows might have been effected -
            // so we need to reload the table, keeping the paging in the current position
            setTimeout(function () { storesTable.ajax.reload(null, false) }, 200);
            //storesTable.ajax.reload( null, false );
        })
        .on('initEdit', function (e, node, data) {
            // Disable for edit (re-ordering is performed by click and drag)
            if (data !== undefined && data.serial === cSerNbr) {
                storesEditor.field('serial').disable();
                storesEditor.field('serial').message('Host serial nbr can not be edited.');
            } else if (data !== undefined && data.order !== cSerNbr) {
                storesEditor.field('serial').enable();
            }
        });

    x.style.display = "block";
}

function storesClose() {
    $.post("remoteGetSettings?", "", function (data) {
        var cTxt;
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $("#" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
                cTxt = $("#" + data.aSet[idx][0] + "_Say").text();
                if (data.aSet[idx][1]) {
                    cTxt = cTxt.replace('OFF', 'ON');
                } else {
                    cTxt = cTxt.replace('ON', 'OFF');
                }
                $("#" + data.aSet[idx][0] + "_Say").text(cTxt);
            }
        });

        $('#multiStoreEditSay').text(data.cStores + ' Set-Up');

        if (!$('#remoteSet').is(':checked')) {
            $('#multiStoreSet').prop('disabled', true);
            $('#multiStoreSet_Say').prop('disabled', true);
            $('#multiEditButton').prop('disabled', true);
        }

        if (parseInt(data.nStores) > 2 && $('#remoteSet').is(':checked') && !$('#multiStoreSet').is(':checked')) {
            swal({
                title: "Turn on Multi-Store Remote?",
                text: "The option is currently turned off.",
                type: "info",
                showCancelButton: true,
                closeOnConfirm: true
            },
                function () {
                    $('#multiStoreSet').prop('checked', true);
                    $('#multiStoreSet_Say').html($('#multiStoreSet_Say').html().replace('OFF', 'ON'));
                    $("#dailyConsolidate").toggle( doDash && sLevel === "0" && $("#multiStoreSet_Say").text() === 'Multi-Store ON'  &&  $('#multiStoreSet').prop('disabled') === false );
                });
        }
    });

    storesTable.clear().destroy(false);
    $("#Modal_Stores").toggle(false);
    $("Modal_Account").toggle(true);
}
///////
function showStationsTable() {

    stationsTable = $('#stationsTable').DataTable({
        dom: 'Brtlip',
        lengthChange: true,
        lengthMenu: [10, 20, 30],
        pageLength: 20,
        ajax: "stationsTable?",
        columns: [
            {
                data: null,
                defaultContent: '',
                className: 'select-checkbox',
                orderable: false,
                width: "5%"
            },
            { data: "station_id" },
            { data: "station_nbr" },
            { data: "directory" }
        ],
        select: {
            style: 'single',
            selector: 'td:first-child',
            blurable: true
        },
        order: [[1, 'asc']],
        buttons: [
            {   extend: "edit", 
                editor: stationsEditor
            },
            {   extend: "remove",
                editor: stationsEditor,
                formMessage: function (e, dt) {
                    var num = dt.rows().count();
                    var rows = dt.rows(e.modifier()).data().pluck('station_id');
                    return 'Are you sure you want to delete station: ' + rows[0] + '?';
                }
            },
            {
                text: svgRefresh,
                titleAttr: '  Refresh  ',
                action: function () {
                    $.spin('true');
                    stationsTable.ajax.url( 'stationsRefresh?' ).load();
                    $.spin('false');
                }
            }
            
        ]
    });

    $("Modal_Account").toggle(false);
    $("#Modal_Stations").toggle(true);
}

function stationsClose() {
/*    
    $.post("remoteGetSettings?", "", function (data) {
        var cTxt;
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $("#" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
                cTxt = $("#" + data.aSet[idx][0] + "_Say").text();
                if (data.aSet[idx][1]) {
                    cTxt = cTxt.replace('OFF', 'ON');
                } else {
                    cTxt = cTxt.replace('ON', 'OFF');
                }
                $("#" + data.aSet[idx][0] + "_Say").text(cTxt);
            }
        });

        $('#multiStoreEditSay').text(data.cstations + ' Set-Up');

        if (!$('#remoteSet').is(':checked')) {
            $('#multistationset').prop('disabled', true);
            $('#multistationset_Say').prop('disabled', true);
            $('#multiEditButton').prop('disabled', true);
        }

        if (parseInt(data.nstations) > 2 && $('#remoteSet').is(':checked') && !$('#multistationset').is(':checked')) {
            swal({
                title: "Turn on Multi-Store Remote?",
                text: "The option is currently turned off.",
                type: "info",
                showCancelButton: true,
                closeOnConfirm: true
            },
                function () {
                    $('#multistationset').prop('checked', true);
                    $('#multistationset_Say').text($('#multistationset_Say').text().replace('OFF', 'ON'));
                });
        }
    });
*/
    stationsTable.clear().destroy(false);
    $("#Modal_Stations").toggle(false);
    $("Modal_Account").toggle(true);
}

function newFeatures() {
    var cStr = '<div id="newFeaturesLink">For full details visit: ' + 
                 '<a href="https://posadvisors.com/resources/" target="_blank">https://posadvisors.com/resources/</a>' + 
                 '<br>' + 
                '</div>' + 
                '<pre id="newFeatures"></pre>';

    $("#modalInfoBody").html(cStr);
    $("#modalInfoTitle").text("encorePOS Release Notes");

    $.post( "getNewFeatures?", '', function(reply) {
        cStr = unescape( reply );
        $("#newFeatures").text(cStr);
        $("#modalInfo").css("z-index", 99999);
        $("#modalInfo").toggle(true);

        $(document).keydown(function (e) {
            // ESCAPE key pressed
            if (e.keyCode == 27) {
                closeModalInfo();
            }
        });
    });
}

//////
function numberWithCommas(x) {
    //return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

function todayString() {
    var d = new Date();

    var month = d.getMonth() + 1;
    var day = d.getDate();

    var dstring = d.getFullYear() + '/' +
        (('' + month).length < 2 ? '0' : '') + month + '/' +
        (('' + day).length < 2 ? '0' : '') + day;

    return dstring;
};

function SwitchTabs(item) {
    return; // now defunct
    var className = item.getAttribute("class");
    var oldSelection = document.getElementsByClassName("navcurrent")[0];
    if (className == "navother navTabs") {
        item.className = "navcurrent navTabs";
        oldSelection.className = "navother navTabs";
        if (item.innerHTML === "Reports") {
            $("#tab_dash").toggle(false);
            $("#tab_list").toggle(false);
            $("#tab_util").toggle(false);
            $("#tab_saved").toggle(false);
            if (doDash) {
                $("#tab_dash").toggle(true);
            }
            $("#Modal_Hourly_Close").off('click');
            $("#Modal_Hourly_Close").click(function () {
                HourlyTable.clear().destroy(false);
                $("#Modal_Hourly").hide();
                if (doDash) {
                    $("#tab_dash").toggle(true);
                }
                $("nav").css('z-index', 999);
            });

        } else if (item.innerHTML === "Dashboard") {
            $("#tab_list").toggle(false);
            $("#tab_util").toggle(false);
            $("#tab_rept").toggle(false);
            $("#tab_saved").toggle(false);
            $("#tab_dash").toggle(true);
            activeTab = 'dash';
            $("#Modal_Hourly_Close").off('click');
            $("#Modal_Hourly_Close").click(function () {
                HourlyTable.clear().destroy(false);
                $("#Modal_Hourly").hide();
                $("#tab_dash").show();
                $("#tab_saved").hide();
                $("nav").css('z-index', 999);
            });
            updateTDSales("FALSE");
            //            updateEXLog();

        } else if (item.innerHTML === "Utilities") {
            $("#tab_dash").toggle(false);
            $("#tab_list").toggle(false);
            $("#tab_rept").toggle(false);
            $("#tab_saved").toggle(false);
            $("#tab_util").toggle(true);
            activeTab = 'util';

        } else if (item.innerHTML === "Shortcuts") {
            $("#tab_dash").toggle(false);
            $("#tab_list").toggle(false);
            $("#tab_rept").toggle(false);
            $("#tab_util").toggle(false);
            $("#tab_saved").toggle(true);
            activeTab = 'saved';

        } else if (item.innerHTML === "Lists") {
            $("#tab_dash").toggle(false);
            $("#tab_rept").toggle(false);
            $("#tab_util").toggle(false);
            $("#tab_saved").toggle(false);
            $("#tab_list").toggle(true);
            activeTab = 'list';

        }
    }
}

function navbarRespond(obj) {
    var x = document.getElementById("pAnavbar");
    if (x.className === "navbar") {
        x.className += " responsive";
    } else {
        x.className = "navbar";
    }
}

function showIconMenu() {
    $(".iconMenuDropdown").show();
}

function showDash() {
    $(".iconMenuDropdown").hide();
    $("#tab_dash").toggle(true);
    $("#tab_list").toggle(false);
    $("#tab_rept").toggle(false);
    $("#tab_saved").toggle(false);
    $("#tab_util").toggle(false);
//    $(".navUserDropdown").toggle(false);
}

function showLists() {
    $(".iconMenuDropdown").hide();
    $("#tab_dash").toggle(false);
    $("#tab_list").toggle(true);
    $("#tab_rept").toggle(false);
    $("#tab_saved").toggle(false);
    $("#tab_util").toggle(false);
//    $(".navUserDropdown").toggle(false);
}
function showUtils() {
    $(".iconMenuDropdown").hide();
    $("#tab_dash").toggle(false);
    $("#tab_list").toggle(false);
    $("#tab_rept").toggle(false);
    $("#tab_saved").toggle(false);
    $("#tab_util").toggle(true);
//    $(".navUserDropdown").toggle(false);
}

function showRepts() {
    $(".iconMenuDropdown").hide();
    $("#tab_dash").toggle(false);
    $("#tab_list").toggle(false);
    $("#tab_rept").toggle(true);
    $("#tab_saved").toggle(false);
    $("#tab_util").toggle(false);
//    $(".navUserDropdown").toggle(false);
}

function buildShortCutTab(lAfterAddDelete) {
    var memArray = {};

    $("#savedReportList").empty();

    var savArr = localStorage.getItem("invPerfSaved");
    if ( savArr !== null) {
        memArray.invPerfSaved = savArr;

        $("#savedTab").show();
        savedMenuActive = true;
        savArr = JSON.parse( savArr );
        var val;
        $.each(savArr, function (idx, item) {
            var descr = savArr[idx].description.replace(/'/g, '');
            val = "'inv', ['"
            $.each(savArr[idx].data, function (num,parm) {
                val += parm + "','";
            });
            val += savArr[idx].dateSaved + "'], ";
            val += JSON.stringify( savArr[idx].colVis );
            $("#savedReportList").append(
                '<div id="inv' + idx.toString() + '" class="savedReportShortcut" style="background-color: #fde8ed;" onclick="launchSavedReport(' + val + ')">' + 
                   '<img src="images/menu_DOH.png" height="28" width="31">' +
                   '<b>Inventory Performance:&nbsp;</b>' + savArr[idx].description + 
                   '<span class="savedReportDelete" style="float: right;" title="Delete Shortcut">' + 
                   '<svg width="24" height="24" class="savedReportEx" onclick="deleteShortCut(event, ' + "'" + descr + "', 'inv" + idx.toString() + "'" + ');"' + svgEx2 + '</span></div>' )
        });
    }

    savArr = localStorage.getItem("cusGMSaved");
    if ( savArr !== null) {
        memArray.cusGMSaved = savArr;

        $("#savedTab").show();
        savedMenuActive = true;
        savArr = JSON.parse( savArr );
        var val;
        $.each(savArr, function (idx, item) {
            var descr = item.description.replace(/'/g, '');
            val = "'cus', ['"
            $.each(savArr[idx].data, function (num,parm) {
                val += parm + "','";
            });
            val += savArr[idx].dateSaved + "']"
            $("#savedReportList").append(
                '<div id="cus' + idx.toString() + '" class="savedReportShortcut" onclick="launchSavedReport(' + val + ')">' + 
                   '<img src="images/CusGM.png" height="28" width="31">' +
                   '<b>Customer Profitability:&nbsp;</b>' + savArr[idx].description + 
                   '<span class="savedReportDelete" style="float: right;" title="Delete Shortcut">' + 
                   '<svg width="24" height="24" class="savedReportEx" onclick="deleteShortCut(event, ' + "'" + descr + "', 'cus" + idx.toString() + "'" + ');"' + svgEx2 + '</span></div>' )
        });
    }

    savArr = localStorage.getItem("vendGMSaved");
    if ( savArr !== null) {
        memArray.vendGMSaved = savArr;

        $("#savedTab").show();
        savedMenuActive = true;
        savArr = JSON.parse( savArr );
        var val;
        $.each(savArr, function (idx, item) {
            var descr = savArr[idx].description.replace(/'/g, '');
            val = "'ven', ['"
            $.each(savArr[idx].data, function (num,parm) {
                val += parm + "','";
            });
            val += savArr[idx].dateSaved + "'], ";
            val += JSON.stringify( savArr[idx].colVis );
            $("#savedReportList").append(
                '<div id="ven' + idx.toString() + '" class="savedReportShortcut" style="background-color: #fde8ed;" onclick="launchSavedReport(' + val + ')">' + 
                   '<img src="images/vendor_GM.png" height="28" width="31">' +
                   '<b>Vendor Profitability:&nbsp;</b>' + savArr[idx].description + 
                   '<span class="savedReportDelete" style="float: right;" title="Delete Shortcut">' + 
                   '<svg width="24" height="24" class="savedReportEx" onclick="deleteShortCut(event, ' + "'" + descr + "', 'ven" + idx.toString() + "'" + ');"' + svgEx2 + '</span></div>' )
        });
    }

    var savArr = localStorage.getItem("SBSSaved");
    if ( savArr !== null) {
        memArray.invPerfSaved = savArr;

        $("#savedTab").show();
        savedMenuActive = true;
        savArr = JSON.parse( savArr );
        var val;
        $.each(savArr, function (idx, item) {
            var descr = savArr[idx].description.replace(/'/g, '');
            val = "'sbs', ['"
            $.each(savArr[idx].data, function (num,parm) {
                val += parm + "','";
            });
            val += savArr[idx].dateSaved + "']";
            $("#savedReportList").append(
                '<div id="sbs' + idx.toString() + '" class="savedReportShortcut" onclick="launchSavedReport(' + val + ')">' + 
                   '<img src="images/menu_SBS.png" height="28" width="31">' +
                   '<b>Sales by Station:&nbsp;</b>' + savArr[idx].description + 
                   '<span class="savedReportDelete" style="float: right;" title="Delete Shortcut">' + 
                   '<svg width="24" height="24" class="savedReportEx" onclick="deleteShortCut(event, ' + "'" + descr + "', 'sbs" + idx.toString() + "'" + ');"' + svgEx2 + '</span></div>' )
        });
    }

    if ($("#savedReportList").children().length === 0) {
        $("#savedTab").hide();
        savedMenuActive = false;
        localStorage.removeItem('savedSort');

    } else if (lAfterAddDelete) {
        var sortedIDs = $( "#savedReportList" ).sortable( "toArray" );
        localStorage.setItem("savedSort",JSON.stringify(sortedIDs));

    } else {
        var sortOrder = localStorage.getItem("savedSort");
        if ( sortOrder !== null) {
            sortOrder = JSON.parse( sortOrder );
            sortDivsByID($("#savedReportList"), "div", sortOrder);
        }
    }

    if (Object.keys(memArray).length > 0) {
        saveShortCuts(memArray);
    } else {
        $("#savedTab").hide();
        savedMenuActive = false;
        return;
    }

    if ($("#savedReportList").children().length === 1) {
        $("#savedSortButton").hide();
    } else {
        $("#savedSortButton").show();
    }
 
}

function saveShortCuts( memArray ) {
    if (!memArray) {
        memArray = {};

        var savArr = localStorage.getItem("invPerfSaved");
        if ( savArr !== null) {
            memArray.invPerfSaved = savArr;
        }
    
        savArr = localStorage.getItem("cusGMSaved");
        if ( savArr !== null) {
            memArray.cusGMSaved = savArr;
        }    
        
        savArr = localStorage.getItem("vendGMSaved");
        if ( savArr !== null) {
            memArray.vendGMSaved = savArr;
        }    

        savArr = localStorage.getItem("SBSSaved");
        if ( savArr !== null) {
            memArray.SBSSaved = savArr;
        }    
    }

    if ( !memArray.invPerfSaved && !memArray.cusGMSaved && !memArray.vendGMSaved && !memArray.SBSSaved ) {
        localStorage.removeItem( "savedSort" );
        $("#savedTab").hide();
        savedMenuActive = false;
        return;
    }

    var sortOrder = localStorage.getItem("savedSort");
    if ( sortOrder !== null) {
        memArray.savedSort = sortOrder;
    }
    $.post( "saveShortcuts?", {"cUID": uid, "memArray": JSON.stringify(memArray)} );

}

function deleteShortCut(event, cReport, cID) {
    var cTxt = $("#savedSortButton").html();

    // don't launch if sorting is active
    if (cTxt.indexOf("ON") > -1) {
        swal("Hang On!", "Please turn off sorting to delete your report.", "info");
        event.stopPropagation();
        return;
    }

    vex.dialog.confirm({
        unsafeMessage: '<svg id="settingsErrorIconSvg" width="32pt" height="32pt" versio="1.1" viewBox="0 0 100 100">' + 
						svgAlert + '</svg><br>' +
                        'Are you sure you want to delete the report:<br><br><i>' + cReport + '</i> ?',
        className: 'vex-theme-multiButtons',
        callback: function (value) {
            if (value) {
                var cItem;
                switch (cID.substring(0, 3)) {
                    case 'inv':
                        cItem = "invPerfSaved"
                        break;
                    case 'cus':
                        cItem = "cusGMSaved"
                        break;
                    case 'ven':
                        cItem = "venGMSaved"
                        break;
                    case 'sbs':
                        cItem = "SBSSaved"
                }
                var savedArray = localStorage.getItem(cItem);
                if (savedArray) {
                    var array = JSON.parse(savedArray);
                    var found = array.findIndex(function (entry) {
                        return entry.description.replace(/'/g, '') === cReport;
                    });
                    if (found > -1) {
                        array.splice(found, 1);
                        if (array.length > 0) {
                            localStorage.setItem(cItem, JSON.stringify(array));
                        } else {
                            localStorage.removeItem(cItem);
                        }
                        buildShortCutTab(true);
                        vex.dialog.alert({
                            message: 'Your report has been deleted.'
                        });
                    } else {
                        vex.dialog.alert({
                            message: 'Unable to delete your report.'
                        });
                    }
                }
            }
        }
    });

    event.stopPropagation();
}

function restoreShortcuts() {
    var shortCuts = JSON.parse( $("#shortcutRestoreButton").attr("data") );
    if (shortCuts.invPerfSaved) {
        localStorage.setItem( 'invPerfSaved', shortCuts.invPerfSaved );
    }
    if (shortCuts.cusGMSaved) {
        localStorage.setItem( 'cusGMSaved', shortCuts.cusGMSaved );
    }
    if (shortCuts.vendGMSaved) {
        localStorage.setItem( 'vendGMSaved', shortCuts.vendGMSaved );
    }
    if (shortCuts.SBSSaved) {
        localStorage.setItem( 'SBSSaved', shortCuts.SBSSaved );
    }
    if (shortCuts.savedSort) {
        localStorage.setItem( 'savedSort', shortCuts.savedSort );
    }
    buildShortCutTab();
}

function launchSavedReport(cType, aData, colVis) {
    var cTxt = $("#savedSortButton").html();
    var aDates;

    // don't launch if sorting is active
    if (cTxt.indexOf("ON") > -1) {
        swal("Whoa there!", "Please turn off sorting to launch your report.", "info");
        return;
    }

    switch (cType) {
        case 'inv':
            if (aData[6] === '2') {
                datePromptSavedLaunch( 'inv', aData, colVis );
            } else {
                showDOHreport();
                getDOHreport(aData, colVis);
            }
        break;

        case 'cus':
            if (aData[9] === '2') {
                datePromptSavedLaunch( 'cus', aData, colVis );
            } else {
                showCusGMReport();
                getCusGMreport(aData);
            }
        break;

        case 'ven':
            if (aData[5] === '2') {
                datePromptSavedLaunch( 'ven', aData, colVis );
            } else {
                showVendGMReport();
                getVendGMreport(null, aData, colVis);
            }
        break;

        case 'sbs':
            if (aData[1] === '2') {
                datePromptSavedLaunch( 'sbs', aData );
            } else {
                showDOHreport('SBS');
                getSBSreport(aData);
            }
    }
}

function datePromptSavedLaunch( cType, aData, colVis ) {
    var dStart;
    var dEnd;

    switch (cType) {
        case 'inv':
            dStart = aData[8];
            dEnd = aData[9];
            break;
    
            case 'cus':
            dStart = aData[11];
            dEnd = aData[12];
            break;
    
            case 'ven':
            dStart = aData[7];
            dEnd = aData[8];
            break;
    
            case 'sbs':
            dStart = aData[3];
            dEnd = aData[4];
    }

    vex.dialog.open({
        message: 'Select start and end dates...',
        input: [
            '<div class="vex-custom-field-wrapper">',
                '<label for="startDate">Date</label>',
                '<div class="vex-custom-input-wrapper">',
                    '<input name="startDate" type="date" value="' + convertDateStr(dStart) + '" />',
                '</div>',
            '</div>',
            '<div class="vex-custom-field-wrapper">',
                '<label for="endDate">Date</label>',
                '<div class="vex-custom-input-wrapper">',
                    '<input name="endDate" type="date" value="' + convertDateStr(dEnd) + '" />',
                '</div>',
            '</div>'
        ].join(''),
        callback: function (data) {
            if (!data) {
                return;
            }

            switch (cType) {
                case 'inv':
                    aData[8] = ( convertDateStr( data.startDate ) );
                    aData[9] = ( convertDateStr( data.endDate ) );
                    showDOHreport();
                    getDOHreport(aData, colVis);
                break;

                case 'cus':
                    aData[11] = ( convertDateStr( data.startDate ) );
                    aData[12] = ( convertDateStr( data.endDate ) );
                    showCusGMReport();
                    getCusGMreport(aData);
                break;

                case 'ven':
                    aData[7] = ( convertDateStr( data.startDate ) );
                    aData[8] = ( convertDateStr( data.endDate ) );
                    showVendGMReport();
                    getVendGMreport(null, aData, colVis);
                break;

                case 'sbs':
                    aData[3] = ( convertDateStr( data.startDate ) );
                    aData[4] = ( convertDateStr( data.endDate ) );
                    showDOHreport('SBS');
                    getSBSreport(aData);
    
            }
        }
    });
}

function savedSortToggle() {
    var cTxt = $("#savedSortButton").html();

    if (cTxt.indexOf("ON")>-1) {
        $("#savedReportList").sortable( "disable");
        $("#savedSortButton").html( "<div><img src='/images/noun_sort.png' height='20' width='13'/>&nbsp;Sort OFF</div>" );
        $("#savedSortButton").css( "color", "#2e8584");
        $(".savedReportShortcut").css("cursor", "pointer");
        $("#savedReportList").find(".savedReportDelete").toggle(true);

        var sortedIDs = $( "#savedReportList" ).sortable( "toArray" );
        localStorage.setItem("savedSort",JSON.stringify(sortedIDs));

        saveShortCuts();

    } else {
        $("#savedReportList").sortable( "enable");
        $("#savedSortButton").html( "<div><img src='/images/noun_sort_red.png' height='20' width='13'/>&nbsp;Sort ON</div>" );
        $("#savedSortButton").css( "color", "red");
        $(".savedReportShortcut").css("cursor", "move");
        $("#savedReportList").find(".savedReportDelete").toggle(false);
    }
}

function sortDivsByID(parent, childSelector, sortOrder) {
    var items = parent.children(childSelector).sort(function (a, b) {
        var vA = sortOrder.indexOf(a.id);
        var vB = sortOrder.indexOf(b.id);
        return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
    });
    parent.append(items);
}

function m_Y2Y_Chart_resize() {
    //alert( document.getElementById("Modal_Y2Y_Body").width.toString() + ":" + document.getElementById("Modal_Y2Y_Body").height.toString() );
    alert(document.getElementById("Modal_Y2Y_Canvas").width.toString() + ":" + document.getElementById("Modal_Y2Y_Canvas").height.toString());
}

// for range sliders on Settings page 
function updateSliderHandle(el, val) {
    el.textContent = val + " min";
}

String.prototype.capitalFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
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

function setEndDateVal(cEl1, cEl2) {
    var $input = $('#' + cEl2).pickadate();
    var picker = $input.pickadate('picker');
    var cDate = $("#" + cEl1).val();
    var cEnd = $("#" + cEl2).val();
    var dDate = new Date(cDate);

    if (!cEnd.trim()) {
        picker.set('select', cDate, { format: 'mm-dd-yyyy' });
    } else {
        var dEnd = new Date(cEnd);
        if (dEnd < dDate) {
            picker.set('select', cDate, { format: 'mm-dd-yyyy' });
        };
    };
}

function checkEndDateVal(cEl1, cEl2) {
    var cStart = $("#" + cEl1).val();
    var cEnd = $("#" + cEl2).val();

    if (cStart.trim() && cEnd.trim()) {
        var dStart = new Date(cStart);
        var dEnd = new Date(cEnd);
        if (dEnd < dStart) {
            swal("Date Error", "The end date must be same as or greater than start date.", "error");
            var $input = $('#' + cEl2).pickadate();
            var picker = $input.pickadate('picker');
            picker.set('select', cStart, { format: 'mm-dd-yyyy' });
        };
    };
}

function jqSetEndDateVal( cEl1, cEl2 ) {
    var startDate = $( "#" + cEl1 ).datepicker( "getDate" );
    $( "#" + cEl2 ).datepicker( "setDate", startDate );
}

function jqCheckEndDateVal(cEl1, cEl2) {
    var startDate = $( "#" + cEl1 ).datepicker( "getDate" );
    var endDate   = $( "#" + cEl2 ).datepicker( "getDate" );

    if (endDate < startDate) {
        swal("Date Error", "The end date must be same as or greater than start date.", "error");
        $( "#" + cEl2 ).datepicker( "setDate", startDate );
    };
}

Date.daysBetween = function (date1, date2) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return Math.round(difference_ms / one_day);
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

function notAvailable() {
    swal("Sorry, not available :(", "The function you have selected is coming soon!", "info");
    $("#tab_dash").show();
}

function stringToDate(_date, _format, _delimiter) {
    /*
    stringToDate("17/9/2014","dd/MM/yyyy","/");
    stringToDate("9/17/2014","mm/dd/yyyy","/");
    stringToDate("9-17-2014","mm-dd-yyyy","-");
    */
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
}

function getIndexOf2D(a, x) {
    var nIdx = 0;
    for (var i = 0; i < a.length; i++) {
        if (a[i][0] === x) {
            return i;
        }
    }
    return nIdx;
}

function HandleDropdownFocus(htmlTableName, datatable, cell, editor) {
    datatable.off('key');
    var origValue = cell.data();
    var keysEnabled = true;

    $('td.focus select').show();
 
    editor.inline({ row: cell.index().row, column: cell.index().column }, { // activate inline edit immediately
        onEsc: 'none',
        onReturn: function (editor) {
            //MoveFocusOnReturn(datatable, cell);
        }
    });
    if (editor.inError()) {
        editor.close(); // close and re-open
        editor.inline({ row: cell.index().row, column: cell.index().column }, {
            onBlur:        'close',
            onComplete:    'close',
            onEsc:         'close',
            onFieldError:  'focus',
            onReturn:      'submit',
            submit:        'changed'
        });
    }
    $('#' + htmlTableName).keydown(function (event) {
        if (event.altKey && (event.keyCode == 38 || event.keyCode == 40)) { // 38 = up arrow; 40 = down arrow
            if (keysEnabled == true) {
                keysEnabled = false;
                datatable.keys.disable();
            } else if (keysEnabled == false) {
                keysEnabled = true;
                datatable.keys.enable();
            }
        }
        if (event.keyCode == 32) {  // 32 = space bar
            if (keysEnabled == true) {
                keysEnabled = false;
                datatable.keys.disable();
            }
        }
        if (event.keyCode == 13) {  // 13 = Enter key
            if (!keysEnabled) {
                event.stopPropagation();    // prevents auto-Submit; so now, pressing Enter just makes the selection
                $('td.focus select').blur();
                editor.submit();
                keysEnabled = true;
                datatable.keys.enable();
                $('td.focus select').focus();
            }
        }
        if (event.keyCode == 27) {  // 27 = Esc key
            $('td.focus select').blur();
            $('td.focus select').val(origValue);
            keysEnabled = true;
            datatable.keys.enable();
            $('td.focus select').focus();
        }
        if (event.keyCode == 9) {   // 9 = Tab key
            if (!keysEnabled) {
                event.preventDefault();
                event.stopPropagation();
                keysEnabled = true;
                datatable.keys.enable();
                //MoveFocusOnReturn(datatable, cell);
            }
        }
    });
    datatable.one('key-blur', function (e, datatable, cell) {
        editor
            .blur()
            .submit();
    });
}

function getRini() {
    $.post('getRini?', function (data) {
        window.location.href="about:blank";
        window.document.write(data);
        $('#myLink')[0].click();
    });    
}

function licenseFileButtonChanged() {
    var nsize = $("#licenseFileInput")[0].files[0].size;
    if (nsize < 256 || nsize > 257) {
        $("#licenseFileInput").val("");
        swal("Bad File", "The selected file is not the correct size.", "error");
    } else {
        var str = $('#licenseFileInput').val();
        var res = str.split('\\').pop().split('/').pop();
        $('#licenseFileName').text('File: ' + res);        
    };
}

function settingsToggle(theSpan, theDiv) {
    if (theDiv === "*") {                       // close all
        $(".genericSettingDiv").toggle(false);
        $(".setH2 > .settingsToggle").each(
            function(idx,ele) {
                let oldTxt = $(this).text();
                let newTxt = oldTxt.replace('▼','►');
                $(this).text(newTxt);
            });
        $("#serverInfoHead").toggle(true);
        $("#serverInfo").toggle(true);
    } else if (theDiv === 'remoteDataShare') {
        $("#modalPINCode").show();
        setTimeout( function() { $(".pin-code input")[0].focus(), 20 } );
    } else {
        var cTxt = $(theSpan).text();
        //$("#serverInfoHead").toggle(false);
        //$("#serverInfo").toggle(false);
        if (Array.from(cTxt)[0] === '►') {
            $('#' + theDiv).toggle(true);
            $(theSpan).text(cTxt.replace('►','▼'));
        } else {
            $('#' + theDiv).toggle(false);
            $(theSpan).text(cTxt.replace('▼','►'));
//            $(theSpan).text('►');
        }
        if (theDiv === 'frequentSettingsDiv') {
            $('#frequentMultiSet').toggle(pub_RemoteDo);
        }
    }
}

function settingsTitleToggle(theSpan, theDiv) {
    var toggle = $(theSpan).parent().find(".settingsToggle")
    var cTxt = $(toggle).text();
    if (cTxt === '►') {
        $('#' + theDiv).toggle(true);
        $(toggle).text('▼');
    } else {
        $('#' + theDiv).toggle(false);
        $(toggle).text('►');
    }
    if (theDiv === 'frequentSettingsDiv') {
        $('#frequentMultiSet').toggle(pub_RemoteDo);
    }
}

function playBeep() {
	var audio = new Audio('/sounds/beep.mp3');
	audio.play();
}

function playNotify() {
	var audio = new Audio('/sounds/notify.wav');
	audio.play();
}

function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(!regex.test(email)) {
       return false;
    }else{
       return true;
    }
}

function updateDo() {
    swal({
        title: "Run EncorePOS\u2122 Update Now?",
        text: "This update requires a restart of the EncorePOS application " + 
               "running on your Server and will log you and other users out of the EncorePOS Dashboard.\n\n" +
               "Please use the icon on the desktop to restart the Application before you attempt to login to the EncorePOS Dashboard.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f695ab",
        confirmButtonText: "Yes, update!",
        closeOnConfirm: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.post('updateDo?');
                if(typeof(purchWindow) != 'undefined'){
                    purchWindow.close();
                    purchWindow = null;
                }
                window.location.replace("logout?");
                return;
            } else {
                return;
            }
        }
    );
}

function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}

function hostOut() {
    $.post('HostOut?');
    return;
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
    svgCart    = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="30" height="30" viewBox="0 0 256 256" xml:space="preserve"><defs></defs><g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" ><path d="M 73.713 65.44 H 27.689 c -3.566 0 -6.377 -2.578 -6.686 -6.13 c -0.21 -2.426 0.807 -4.605 2.592 -5.939 L 16.381 21.07 c -0.199 -0.889 0.017 -1.819 0.586 -2.53 s 1.431 -1.124 2.341 -1.124 H 87 c 0.972 0 1.884 0.471 2.446 1.263 c 0.563 0.792 0.706 1.808 0.386 2.725 l -7.798 22.344 c -1.091 3.13 -3.798 5.429 -7.063 5.999 l -47.389 8.281 c -0.011 0.001 -0.021 0.003 -0.032 0.005 c -0.228 0.04 -0.623 0.126 -0.568 0.759 c 0.056 0.648 0.48 0.648 0.708 0.648 h 46.024 c 1.657 0 3 1.343 3 3 S 75.37 65.44 73.713 65.44 z M 23.053 23.416 l 6.301 28.211 l 44.583 -7.79 c 1.124 -0.197 2.057 -0.988 2.432 -2.065 l 6.406 -18.356 H 23.053 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(46,133,132); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" /><circle cx="28.25" cy="75.8" r="6.5" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(46,133,132); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/><circle cx="68.28999999999999" cy="75.8" r="6.5" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(46,133,132); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/><path d="M 19.306 23.417 c -1.374 0 -2.613 -0.95 -2.925 -2.347 l -1.375 -6.155 c -0.554 -2.48 -2.716 -4.212 -5.258 -4.212 H 3 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 6.749 c 5.372 0 9.942 3.662 11.113 8.904 l 1.375 6.155 c 0.361 1.617 -0.657 3.221 -2.274 3.582 C 19.742 23.393 19.522 23.417 19.306 23.417 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(46,133,132); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" /></g></svg>'
    svgAlert   = '<path d="m84.371 95.309h-68.75c-5.582-0.003906-10.742-2.9844-13.527-7.8203-2.7891-4.8398-2.7852-10.793 0.007812-15.629l34.34-59.371c2.793-4.8242 7.9492-7.793 13.523-7.793 5.5781 0 10.73 2.9688 13.523 7.793l34.398 59.371h0.003906c1.8477 3.1797 2.5117 6.9102 1.8789 10.531-0.63672 3.6211-2.5273 6.9062-5.3438 9.2695-2.8164 2.3633-6.3789 3.6562-10.055 3.6484zm-34.371-82.809c-2.7891 0.011719-5.3594 1.5-6.7617 3.9102l-34.379 59.371c-1.3984 2.4141-1.3984 5.3945-0.003906 7.8125s3.9727 3.9062 6.7656 3.9062h68.75c2.7891 0 5.3672-1.4883 6.7617-3.9062 1.3945-2.418 1.3945-5.3984-0.003906-7.8125l-34.398-59.371c-1.3945-2.4023-3.9531-3.8867-6.7305-3.9102z" fill="#ff814a"/>' +
                 '<path d="m50 61.691c-2.1602 0-3.9102-1.7539-3.9102-3.9102v-19.891c-0.054688-1.0703 0.33203-2.1172 1.0703-2.8906 0.73828-0.77734 1.7617-1.2188 2.8359-1.2188 1.0703 0 2.0938 0.44141 2.832 1.2188 0.73828 0.77344 1.125 1.8203 1.0703 2.8906v19.918c-0.007813 2.1484-1.7539 3.8828-3.8984 3.8828z" fill="#ff814a"/>' +
                 '<path d="m53.91 71.488c0 5.2148-7.8203 5.2148-7.8203 0 0-5.2109 7.8203-5.2109 7.8203 0z" fill="#ff814a"/>'
    svgError   = '<path d="m83.941 16.059c-18.695-18.797-49.086-18.879-67.883-0.18359s-18.879 49.086-0.18359 67.883l0.18359 0.18359c18.695 18.797 49.086 18.879 67.883 0.18359s18.879-49.086 0.18359-67.883zm-33.941 75.941c-23.195 0-42-18.805-42-42s18.805-42 42-42 42 18.805 42 42c-0.027344 23.184-18.816 41.973-42 42zm23.336-65.336c-2.9297-2.9258-7.6758-2.9258-10.605 0l-12.73 12.73-12.727-12.73c-2.9297-2.9297-7.6797-2.9297-10.605 0-2.9297 2.9297-2.9297 7.6797 0 10.605l12.727 12.73-12.73 12.727c-2.9297 2.9297-2.9297 7.6797 0 10.605 2.9297 2.9297 7.6797 2.9297 10.605 0l12.73-12.727 12.727 12.727c2.9297 2.9297 7.6797 2.9297 10.605 0 2.9297-2.9297 2.9297-7.6797 0-10.605l-12.727-12.727 12.727-12.727c2.9258-2.9336 2.9258-7.6758 0.003907-10.609z" fill="#ff001b"/>'
    svgInfo    = '<path d="m50 7.668c-11.227 0-21.996 4.457-29.934 12.398-7.9414 7.9375-12.398 18.707-12.402 29.934 0 11.227 4.4609 21.996 12.402 29.934 7.9375 7.9414 18.707 12.398 29.934 12.398s21.996-4.457 29.934-12.398c7.9375-7.9375 12.398-18.707 12.398-29.934-0.011719-11.223-4.4766-21.984-12.41-29.922-7.9375-7.9336-18.699-12.398-29.922-12.41zm0 76.668v-0.003907c-9.1055 0-17.84-3.6172-24.277-10.055s-10.055-15.172-10.059-24.277c0-9.1055 3.6172-17.84 10.059-24.277 6.4375-6.4375 15.172-10.055 24.277-10.055s17.84 3.6172 24.277 10.055 10.055 15.172 10.055 24.277c-0.007812 9.1016-3.6289 17.828-10.066 24.266s-15.164 10.059-24.266 10.066z" fill="#007335"/><path d="m50 39.582c-2.2109 0-4 1.793-4 4v26.668c0 2.2109 1.7891 4 4 4s4-1.7891 4-4v-26.668c0-2.207-1.7891-4-4-4z" fill="#007335"/><path d="m54.082 28.625c0 5.4453-8.1641 5.4453-8.1641 0s8.1641-5.4453 8.1641 0z" fill="#007335"/>'
    svgOkay    = '<path d="m41.668 70.832c-1.1055 0-2.1641-0.4375-2.9453-1.2188l-16.668-16.668c-1.6289-1.6289-1.625-4.2656 0-5.8945 1.6289-1.625 4.2695-1.625 5.8945 0.003907l13.719 13.715 30.383-30.383c1.6289-1.6289 4.2656-1.6289 5.8945 0 1.6289 1.6289 1.6289 4.2695 0 5.8984l-33.332 33.332c-0.78125 0.78125-1.8438 1.2188-2.9453 1.2148z" fill="#007335"/><path d="m50 100c-13.262 0-25.98-5.2695-35.355-14.645s-14.645-22.094-14.645-35.355 5.2695-25.98 14.645-35.355 22.094-14.645 35.355-14.645 25.98 5.2695 35.355 14.645 14.645 22.094 14.645 35.355c-0.015625 13.258-5.2852 25.965-14.66 35.34s-22.082 14.645-35.34 14.66zm0-91.668c-11.051 0-21.648 4.3906-29.461 12.207-7.8164 7.8125-12.207 18.41-12.207 29.461s4.3906 21.648 12.207 29.461c7.8125 7.8164 18.41 12.207 29.461 12.207s21.648-4.3906 29.461-12.207c7.8164-7.8125 12.207-18.41 12.207-29.461-0.011719-11.047-4.4062-21.637-12.219-29.449s-18.402-12.207-29.449-12.219z" fill="#007335"/>';
    svgUpload  = ' <path d="m15 24.82v45.449c0 3 2.4297 5.4414 5.4102 5.4414h18.539v12.391c0 1.0508 0.85156 1.8984 1.8906 1.8984h18.32c1.0391 0 1.8906-0.85156 1.8906-1.8984v-12.391h18.539c2.9805 0 5.4102-2.4414 5.4102-5.4414v-45.449c0-0.03125-0.011719-0.070312-0.011719-0.10156 0-0.050781-0.011719-0.10938-0.019531-0.16016-0.011719-0.089844-0.03125-0.19141-0.058594-0.26953-0.011718-0.03125-0.011718-0.058593-0.019531-0.089843l-2.0117-5.8203c-0.26172-0.76953-0.98047-1.2812-1.7891-1.2812l-20.398 0.003906-2-5.8086c-0.26953-0.78125-0.98047-1.293-1.793-1.293h-40.008c-1.0391 0-1.8906 0.85156-1.8906 1.8984v7.0781 0.011719 0.011719zm44.16 34.52c-1.0391 0-1.8906 0.85156-1.8906 1.8984v24.941h-14.539v-24.93c0-1.0508-0.85156-1.8984-1.8906-1.8984h-7.9492l17.109-22.273 17.109 22.262zm-40.379-45.531h36.77l1.1289 3.2695h-37.898zm0 7.0898h60.969l0.69141 2.0195-61.66 0.003906zm0 5.832h62.43v43.551c0 0.89844-0.73047 1.6289-1.6211 1.6289h-18.539v-8.75h9.9219c0.71875 0 1.3789-0.41016 1.6992-1.0703 0.32031-0.64844 0.23828-1.4297-0.19922-2.0117l-20.973-27.27c-0.71875-0.92969-2.2695-0.92969-2.9883 0l-20.98 27.27c-0.44141 0.57031-0.51953 1.3516-0.19922 2.0117 0.32031 0.64844 0.98047 1.0703 1.6992 1.0703h9.9219v8.75h-18.543c-0.89844 0-1.6211-0.73047-1.6211-1.6289v-43.551z" fill="#007335"/>';
}

Visibility = (function() {

    var hidden,
        visibilitychange,
        state;
  
    // Set the property and event names
    if (typeof document.hidden !== "undefined") {
      hidden = "hidden";
      visibilitychange = "visibilitychange";
      state = "visibilityState";
    } else if (typeof document.mozHidden !== "undefined") {
      hidden = "mozHidden";
      visibilitychange = "mozvisibilitychange";
      state = "mozVisibilityState";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilitychange = "msvisibilitychange";
      state = "msVisibilityState";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilitychange = "webkitvisibilitychange";
      state = "webkitVisibilityState";
    }
  
    /**
     * Determine whether or not window is hidden.
     *
     * This will return false if the browser does
     *    not support visibility. That means it will return
     *    that the window is visible.
     */
    function isHidden() {
      return document[hidden] || false;
    }
  
    return {
      isHidden: isHidden,
      state: state,
      hidden: hidden, // string name of the "hidden" property
      visibilitychange: visibilitychange // string name of the "visibilitychange" event
    };
  
  })();
  
function printCanvas(el) {
    var win = window.open();
    var height = $("#"+el).height();
    var width = $("#"+el).width();
    var canvasImg = document.getElementById(el).toDataURL("image/png");
    var html = "<div style='max-width: " + width + "px; max-height: " + height + "px; margin-top: 50px; margin-left: 50px;'><img src='" + canvasImg + "'/></div>"
    var chartCSS = '<style type="text/css" media="print">@page { size: landscape; }</style>'

    $(win.document.head).html(chartCSS);
    $(win.document.body).html(html);

    sleep(250).then(() => {
        win.print();
        win.close();
    })
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/*
function uploadLicenseFile() {
var form = document.forms.namedItem("licenseFileInfo");
var oOutput = document.getElementById("licenseFileOutput")
var oData = new FormData(form);

    var oReq = new XMLHttpRequest();
    oReq.open("POST", "uploadCertificate?", true);
    oReq.onload = function (oEvent) {
        if (oReq.status == 200) {
            oOutput.innerHTML = oReq.responseText;
            if (oReq.responseText.slice(0, 9) === "Thank you") {
                $("#acctExpDate").css("color", "#2889bd");
                $("#acctExpDate").text("dashPOS License Expires: " + oReq.responseText.slice(-10));
                $("#userImage").attr("src", "images/user_24.png");
                $("#welcome").css("color", "#2889bd");
                $("#welcome").text("Welcome, " + userName);
                $('#licenseFileName').text('No file picked.');
                $('#uploadLicenseFileButton').prop('disabled',true);
            };
        } else {
            oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
            $('#uploadLicenseFileButton').prop('disabled',true);
        }
    };

    oReq.send(oData);
}
*/


/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  
  }

/**
  * Draws a calendar icon using the current state of the canvas.
  * If you omit the last three params, it will draw a rectangle
  * outline with a 5 pixel border radius
  * @param {CanvasRenderingContext2D} ctx
  * @param {Number} x The top left x coordinate
  * @param {Number} y The top left y coordinate
  * @param {Number} width The width of the rectangle
  * @param {Number} height The height of the rectangle
  * @param {Number} [radius = 5] The corner radius; It can also be an object 
  *                 to specify different radii for corners
  * @param {Number} [radius.tl = 0] Top left
  * @param {Number} [radius.tr = 0] Top right
  * @param {Number} [radius.br = 0] Bottom right
  * @param {Number} [radius.bl = 0] Bottom left
  */
 function tdCalendar(ctx, x, y, width, height, radius) {
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }

    ctx.fillStyle = "#7591db";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.fill();
    //ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 18);
    ctx.lineTo(x + width - 1, y + 18);
    ctx.lineTo(x + width - 1, y + height - radius.br);
    ctx.quadraticCurveTo(x + width - 1, y + height - 1, x + width - 1 - radius.br, y + height - 1);
    ctx.lineTo(x + 1 + radius.bl, y + height - 1);
    ctx.quadraticCurveTo(x + 1, y + height - 1, x + 1, y + height - 1 - radius.bl);
    ctx.lineTo(x + 1, y + 18);
    ctx.closePath();
    ctx.fill();
    //ctx.stroke();
}

function atClosing() {
    if(typeof(purchWindow) != 'undefined'){
        purchWindow.close();
        purchWindow = null;
    }
}
function elog() {
	let text = '';
	for (let i = 0; i < arguments.length; i++) {
		if (i>0) { text += ' ' };
		text += arguments[i];
	}
	console.log(text);
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

/**
  * JavaScript Program to return indices of a given
  * string from the multidimensional array
  * @param {Array} stringArr Array to search
  * @param {Text} keyString  String to find
  */
function findIndex(stringArr,keyString)
{
 
    // Initialising result array to -1
    // in case keyString is not found
    let result = [ -1, -1 ];
 
    // Iteration over all the elements
    // of the 2-D array
 
    // Rows
    for (let i = 0; i < stringArr.length; i++) {
 
        // Columns
        for (let j = 0; j < stringArr[i].length; j++) {
 
            // If keyString is found
            if (stringArr[i][j] == keyString) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
 
    // If keyString is not found
    // then -1 is returned
    return result;
}

function pinCodeClose() {
    $(".pin-code input").val("");
    $("#modalPINCode").hide();
}

function closeRemoteStoreSettings() {
    $("#modalSetBody").html("");
    $("#modalSet").hide();
}

function saveRemoteStoreSettings() {
    let set = [];
    $.spin('true');

    $("#modalSetBody input").each( function() {
        let typ = $(this).attr("type");
        let val = $(this).val();
        let prop = $(this).attr("id");

        if (typ === "checkbox") {
            val = ( $(this).is(":checked") ? 'TRUE' : 'FALSE' );
        }
        
        if (typ !== "button") {
            set.push( [prop, val] );
        }
    });

    $.post( 'saveRemoteDataShareSettings?', {settings:JSON.stringify(set)}, function(reply) {
        console.log( reply.result);
    })
    .always( function() {
        if ( $("#remoteDataSet").is(":checked") ) {
            let cH2 = $("#remoteDataShareH2 span").html();
            cH2 = cH2.replace( "OFF", "ON" );
            $("#remoteDataShareH2 span").html( cH2 );
        } else {
            let cH2 = $("#remoteDataShareH2 span").html();
            cH2 = cH2.replace( "ON", "OFF" );
            $("#remoteDataShareH2 span").html( cH2 );
        }
        closeRemoteStoreSettings();
        $.spin('false');
    });
}

function remoteDataSetChange() {
    var lOn = $("#remoteDataSet").is(':checked');
    var cTxt = $("#remoteDataSet_Say").html();
    var aSet = [];
    let serial = $("#remoteDataShareHost").val();

    if (lOn) {
        cTxt = cTxt.replace('OFF', 'ON');
    } else {
        cTxt = cTxt.replace('ON', 'OFF');
    }

    $("#remoteDataSet_Say").html(cTxt);

    if (!$('#remoteDataSet').is(':checked')) {
        $('#remoteDataSet_Say').html("Remote Data Sharing <b>OFF</b>");
        $('#remoteDataSet_Say').prop('disabled', true);
        $('#remoteDataEditButton').prop('disabled', true);
        $("#remoteDataSetting input[type='text']").prop('disabled', true);
        $("#doRemotePrices").prop('disabled', true);
        $("#remoteDataOptions input").prop('disabled', true);
    } else if ($('#remoteDataSet').is(':checked')) {
        $('#remoteDataSet_Say').prop('disabled', false);
        $('#remoteDataEditButton').prop('disabled', false);
        $("#remoteDataSetting input[type='text']").prop('disabled', false);
        $("#doRemotePrices").prop("disabled", !priceChangeSet);
        if (serial.length === 7 && serial === cSerNbr) {
            setAsHost();
        }
    }

    if (priceChangeSet) {
        $("#priceChangeNotSet").hide();
    } else {
        $("#priceChangeNotSet").show();
    }
}

function setAsHost() {
    $("#doRemotePrices").prop('disabled', !priceChangeSet);
    $("#remoteDataOptions input").prop('disabled', false);
}

function setAsClient() {
    $("#doRemotePrices").prop("checked",false);
    $("#remoteDataOptions input[type='checkbox'").prop("checked",false);
    $("#doRemotePrices").prop('disabled', true);
    $("#remoteDataOptions input").prop('disabled', true);
}

function doInventoryChange() {
    if ($("#doInventory").is(":checked")) {
        $("#doInventorySubset input").prop("disabled", false);
    } else {
        $("#doInventorySubset input").prop("checked", false);
        $("#doInventorySubset input").prop("disabled", true);
    }
}

function doCustomersChange() {
    if ($("#doCustomers").is(":checked")) {
        $("#doCustomersSubset input").prop("disabled", false);
    } else {
        $("#doCustomersSubset input").prop("checked", false);
        $("#doCustomersSubset input").prop("disabled", true);
    }
}

function hostOut() {
    $.post('hostOut?', function(json){
        $.post('hostUpload?', json);
    });
}

function systemSettings() {
    const modal = document.getElementById("systemSettings");

    //-- load settings from pSet and sysSet
    loadSystemSettings();

    $("#systemSettingsTabs").tabs({
        active: 0
    });

    $("input[name='frequentBasis']").off("change");
    $("input[name='frequentBasis']").on("change", function() {
        let selectedValue = $("input[name='frequentBasis']:checked").val();
        console.log("frequentBasis change, selectedValue =", selectedValue);

        if (selectedValue === "I") {
            $("#frequentItemFactors").find("legend, label").css("color", "");
            $("#frequentItemFactors").find("input").css("color", "");
            $("#frequentItemFactors").find("input").css("border-color", "");
            $("#frequentItemFactors").find("input").prop("disabled", false);
        } else {
            $("#frequentItemFactors").find("legend, label").css("color", "#ccc");
            $("#frequentItemFactors").find("input").css("color", "#ccc");
            $("#frequentItemFactors").find("input").css("border-color", "#ccc");
            $("#frequentItemFactors").find("input").prop("disabled", true);
        }
    });

    $("input[name='frequentMode']").off("change");
    $("input[name='frequentMode']").on("change", function() {
        let selectedValue = $("input[name='frequentMode']:checked").val();
        console.log("frequentMode change, selectedValue =", selectedValue);

        if (selectedValue === "S") {
            $("#frequentSteppedBtn").prop("disabled", false);
        } else {
            $("#frequentSteppedBtn").prop("disabled", true);
        }
    });

    $("#doFrequent").trigger("change");
    $("#doWebOrders").trigger("change");
    $("#doCustomField1").trigger("change");
    $("#doCustomField2").trigger("change");
    $(".UPC_Chk").trigger("change");
    $("input[name='frequentBasis']").trigger("change");
    $("input[name='frequentMode']").trigger("change");

    $("#systemSettingsSaveBtn").off("click");
    $("#systemSettingsSaveBtn").on("click", function(e) {
        e.stopPropagation();
        console.log("Save button clicked in system settings modal");
        saveSystemSettings();
    });

    fillStateSelect("storeState");
    fillStateSelect("shipState");

    //---- apply intltel phone input
    const el = document.querySelector('#storePhone');
    window.intlTelInput(el, {
        initialCountry: "us",
        separateDialCode: true,
        utilsScript: "js/utils.js",
        countrySearch: false,
        separateDialCode: false,
        allowPhonewords: false,
        strictMode: true,
        placeholder: "(555) 555-0123"
    });
    
    $("#shipSameAsStore").trigger("change");

    modal.showModal();
    modal.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            event.preventDefault();
        }
    });

    if ( !($('#remoteSet').is(':checked') && $('#multiStoreSet').is(":checked")) ) {
        $("#frequentMultiFieldset").hide();
    } else {
        $("#frequentMultiFieldset").show();
    }
}

function loadSystemSettings() {
    $("#frequentSettingsImportDiv input[type='text']").each( function(idx,el) {
        let id = $(this).attr("id");
        let val = pSet[id] || sysSet[id] || 0;
        val = val.toFixed(2);
        console.log( "Initializing AutoNumeric for", id, "with value", val );
        let nn = new AutoNumeric(el, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '999.99', minimumValue: '0', digitGroupSeparator: '' });
        $(el).data("autonumeric",nn);
        nn.set(val);
    });

    $("#systemSettingsBody").find("input").each( function() {
        let typ = $(this).attr("type");
        let id = $(this).attr("id");

        if (!Object.hasOwn(pSet, id) && !Object.hasOwn(sysSet, id)) {
            return true; // continue to next iteration
        }

        if ($(this).data("autonumeric") !== undefined) {
            return true; // continue to next iteration
        }

        let val = pSet[id] || sysSet[id] || "";
        if (typ === "checkbox") {
            $(this).prop("checked", val);
            $(this).trigger("change");
        } else if (typ === "radio") {
            if ($(this).val() === val) {
                $(this).prop("checked", true);
            } else {
                $(this).prop("checked", false);
            }
            $(this).trigger("change");
        } else {
            $(this).val(val);
        }
    });

    $("#systemSettingsBody").find("select").each( function() {
        let id = $(this).attr("id");
        let val = pSet[id] || sysSet[id] || "";
        $(this).val(val);
        $(this).trigger("change");
    });
}

function toggleShipAddress(el) {
    if (!$(el).is(":checked")) {
        $("#companyShipAddressFieldset .companyLabel").css("color", "");
        $("#companyShipAddressFieldset input[type='text']").prop("disabled", false);
        $("#shipState").prop("disabled", false);
    } else {
        $("#companyShipAddressFieldset .companyLabel").css("color", "gray");
        $("#companyShipAddressFieldset input[type='text']").prop("disabled", true);
        $("#shipState").prop("disabled", true);
    }
}

function showFreqPtsTable() {
    const modal = document.getElementById("freqPtsTableDialog");

    $.post( 'getFreqPtsTableData?', function(data) {
    let arr = data.arr;
    aResize( arr, 10, [0,0] );
console.log("arr after resize:", arr);

    $("#freqPtsTable tbody tr").each(function (index) {
        let autoNumericIntOptions = { emptyInputBehavior: 'focus', 
                                   digitGroupSeparator: '', 
                                   roundingMethod: 'C',
                                   decimalPlaces: 0,
                                   maximumValue: '9999999',
                                   minimumValue: '0' };

        let autoNumericDecOptions = { emptyInputBehavior: 'focus', 
                                      digitGroupSeparator: '', 
                                      roundingMethod: 'C',
                                      decimalPlaces: 1,
                                      maximumValue: '100.0',
                                      minimumValue: '0' };

        let $obj1 = $("#freqPtsTable tbody tr td:nth-child(1) input").eq(index);
        let inp1 = $obj1[0];
        let an1 = new AutoNumeric(inp1, autoNumericIntOptions);

        let $obj2 = $("#freqPtsTable tbody tr td:nth-child(2) input").eq(index);
        let inp2 = $obj2[0];
        let an2 = new AutoNumeric(inp2, autoNumericDecOptions);

        an1.set(arr[index][0]);
        an2.set(arr[index][1]);
    });

    modal.showModal();

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        showSettingsError("Error loading frequent points table data: " + textStatus, null, null, "error");
    });
}

function closeFreqPtsTable() {
    const modal = document.getElementById("freqPtsTableDialog");
    modal.close();
}

function saveFreqPtsTable() {
    let arr =[];

    $("#freqPtsTable tbody tr").each(function (index) {
        let $obj1 = $(this).find("td:nth-child(1) input");
        let inp1 = $obj1[0];
        let an1 = AutoNumeric.getAutoNumericElement(inp1);
        let val1 = an1.getNumber();
        an1.remove();

        let $obj2 = $(this).find("td:nth-child(2) input");
        let inp2 = $obj2[0];
        let an2 = AutoNumeric.getAutoNumericElement(inp2);
        let val2 = an2.getNumber();
        an2.remove();

        if (val1 > 0 && val2 > 0) { 
            arr.push( [val1, val2] );
        }
    });

    $.post( 'saveFreqPtsTableData?', {arr: JSON.stringify(arr)}, function(reply) {
        if (reply.result === "success") {
            console.log("Frequent points table data saved successfully on server.");
            closeFreqPtsTable();
        } else {
            showSettingsError((reply.msg || "Unknown error occurred while saving frequent points table data."), null, null, "error");
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        showSettingsError("Error saving frequent points table data: " + textStatus, null, null, "error");
    });
}

function saveSystemSettings() {
    console.log("Saving system settings...");

    $("#systemSettingsBody").find("input").each( function() {
        let typ = $(this).attr("type");
        let id = $(this).attr("id");

        if ($(this).data("autonumeric") !== undefined) {
            let nn = $(this).data("autonumeric");
            let val = nn.getNumber();
            if (Object.hasOwn(pSet, id)) {
                pSet[id] = val;
                console.log( "Saving", id, "of type", typ, "with value", val, "to pSet" );
            } else if (Object.hasOwn(sysSet, id)) {
                sysSet[id] = val;
                console.log( "Saving", id, "of type", typ, "with value", val, "to sysSet" );
            }
        } else if (typ === "checkbox") {
            let val = $(this).is(":checked") ? true : false ;
            if (Object.hasOwn(pSet, id)) {
                pSet[id] = val;
                console.log( "Saving", id, "of type", typ, "with value", val, "to pSet" );
            } else if (Object.hasOwn(sysSet, id)) {
                sysSet[id] = val;
                console.log( "Saving", id, "of type", typ, "with value", val, "to sysSet" );
            }
        } else if (typ === "radio") {
            if ($(this).is(":checked")) {
                let name = $(this).attr("name");
                let val = $(this).val();
                if (Object.hasOwn(pSet, name)) {
                    pSet[name] = val;
                    console.log( "Saving", name, "of type", typ, "with value", val, "to pSet" );
                } else if (Object.hasOwn(sysSet, name)) {
                    sysSet[name] = val;
                    console.log( "Saving", name, "of type", typ, "with value", val, "to sysSet" );
                }
            }
        } else {
            let val = $(this).val();
            if (typeof val === "string") {
                val = val.trim();
            }
            if (Object.hasOwn(pSet, id)) {
                pSet[id] = val;
                console.log( "Saving", id, "of type", typ, "with value", val, "to pSet" );
            } else if (Object.hasOwn(sysSet, id)) {
                sysSet[id] = val;
                console.log( "Saving", id, "of type", typ, "with value", val, "to sysSet" );
            }
        }
    });

    $("#systemSettingsBody").find("select").each( function() {
        let typ = $(this).attr("type");
        let id = $(this).attr("id");
        let val = $(this).val();
        if (Object.hasOwn(pSet, id)) {
            pSet[id] = val;
            console.log( "Saving", id, "of type", typ, "with value", val, "to pSet" );
        } else if (Object.hasOwn(sysSet, id)) {
            sysSet[id] = val;
            console.log( "Saving", id, "of type", typ, "with value", val, "to sysSet" );
        }
    });

    // send pSet and sysSet to server to save persistently
    $.post('saveSystemSettings?', {pSet: JSON.stringify(pSet), sysSet: JSON.stringify(sysSet)}, function(reply) {
        if (reply.result === "success") {
            console.log("System settings saved successfully on server.");
            // TODO: consider adding a success message or toast notification here
            systemSettingsSaveSuccess();
        } else {
            showSettingsError((reply.msg || "Unknown error occurred while saving settings."), null, null, "error");
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        showSettingsError("Error saving settings: " + textStatus, null, null, "error");
    });
}

function systemSettingsSaveSuccess() {
    const modal = document.getElementById("upcSuggestDialog");

    $("#upcSuggestTitle").html("Success!");
    $("#upcSuggestIconSvg").html(svgUpload);
    $("#upcSuggestMsgBody").html("System settings saved successfully.");
    $("#upcSuggestCancelBtn").hide();
    $("#upcSuggestOkBtn").off("click");
    $("#upcSuggestOkBtn").on("click", function() {
        closeUpcSuggest();
    });

    modal.showModal();
}

function closeSystemSettings() {
    const modal = document.getElementById("systemSettings");
    const anEls = ["frequentPoint", "frequentDayX", "frequentLargeX", "frequentLargeAmt", 
                   "frequentItemPromo", "frequentItemF6", "frequentItemF7", "frequentItemPool", 
                   "frequentItemMixed", "frequentItemMisc"];

    anEls.forEach( function(id) {
        let an = AutoNumeric.getAutoNumericElement('#'+id);
        if (an) {
            an.remove();
        }
    });

    $("#tab_dash").show();
    modal.close();
}

function toggleWebOrderSettings(inp) {
    var lDisable = !$('#doWebOrders')[0].checked;
    var color = (lDisable ? "#ccc" : "");
    var color2 = (lDisable ? "light-dark(rgba(239, 239, 239, 0.3)" : "" )

    $("#webOrderSettingsDialog").find("input").prop("disabled", lDisable);
    $("#webOrderSettingsDialog").find("label").css("color", color);
    $("#webOrderSettingsDialog").find("span").css("color", color);
    $("#webOrderSettingsDialog").find("p").css("color", color);
    $(".pswdInputContainer").css("color", color);
    $(".pswdInputContainer").css("background-color", color2);
    $("#webPswd").prop("disabled", lDisable);
    $(".iPswd").css("color", color);
  
}

function toggleCustomField(fieldNumber) {
    if (fieldNumber === 1) {
        var isChecked = $("#doCustomField1").is(":checked");
        $("#customField1Name").prop("disabled", !isChecked);
        $("#customField1Column").prop("disabled", !isChecked);
        $("label[for='customField1Name'], label[for='customField1Column']").css("color", isChecked ? "" : "#ccc");
    } else if (fieldNumber === 2) {
        var isChecked = $("#doCustomField2").is(":checked");
        $("#customField2Name").prop("disabled", !isChecked);
        $("#customField2Column").prop("disabled", !isChecked);
        $("label[for='customField2Name'], label[for='customField2Column']").css("color", isChecked ? "" : "#ccc");
    }
}

function showUpcSuggest() {
    const modal = document.getElementById("upcSuggestDialog");

    $.spin('true');
    $.post("upcSuggestions?", "")
        .done(function (data, status) {
            $.spin('false');
            if (data.result === "success") {
                $("#upcSuggestMsgBody").html(data.msg);
                $("#upcSuggestIconSvg").html(svgOkay);
                $("#upcSuggestTitle").html("Complete!");
                $("#upcSuggestCancelBtn").show();
                $("#upcSuggestOkBtn").text("Yes, change");
                $("#upcSuggestOkBtn").css("margin-left", "");
                modal.showModal();

                $("#upcSuggestOkBtn").off("click");
                $("#upcSuggestOkBtn").on("click", function () {
                    // change UPC_Chk values
                    $.each(data.aSet, function (idx, item) {
                        if (data.aSet[idx][1] !== '?') {
                            $("#" + data.aSet[idx][0]).prop("checked", data.aSet[idx][1] === 'true');
                        }
                    });
                    // show reminder to save system settings after making changes
                    $("#upcSuggestMsgBody").html("");
                    $("#upcSuggestMsgHdr").html("Remember to Save<br>the changes!");
                    $("#upcSuggestCancelBtn").hide();
                    $("#upcSuggestIconSvg").html(svgUpload);
                    $("#upcSuggestTitle").html("Success!");
                    $("#upcSuggestOkBtn").text("Done");
                    $("#upcSuggestOkBtn").css("margin-left", "75px");
                    $("#upcSuggestOkBtn").off("click");
                    $("#upcSuggestOkBtn").on("click", function () {
                        closeUpcSuggest();
                    });
                });
            } else {
                $("#upcSuggestMsgBody").html(data.msg);
                $("#upcSuggestIconSvg").html(svgError);
                $("#upcSuggestTitle").html("Error");
                modal.showModal();
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $.spin('false');
            $("#upcSuggestMsgBody").html("Error retrieving UPC suggestions: " + textStatus);
            $("#upcSuggestIconSvg").html(svgError);
            $("#upcSuggestTitle").html("Error");
            modal.showModal();
        });
}

function closeUpcSuggest() {
    const modal = document.getElementById("upcSuggestDialog");
    modal.close();
}

function secureSettings() {
    const modal = document.getElementById("secureSettings");

    $.spin('true');
    $.post('getSecureSettings?', function(reply) {
        if (reply.result === "success") {
            $.each(reply.settings, function(idx, arr) {
                // Process each setting
                let opt = arr[0];
                let value = arr[1];
                let id = "secure" + opt;
                let element = document.getElementById(id);
                if (element) {
                    element.value = value.toFixed(0);
                }
            });
        }
    })
    .always(function() {
        $.spin('false');
    });

    modal.showModal();
    modal.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            event.preventDefault();
        }
    });

    $("#secureSettingsTabs").tabs({
        active: 0,
    });

    setTimeout(function() {
        $("#secureDashTable :input:first").focus().select();
    }, 100);

    $("li[aria-controls='secureDash']").on("click", function() {
        $("#secureDashTable :input:first").focus().select();
    });
    $("li[aria-controls='secureList']").on("click", function() {
        $("#secureListTable :input:first").focus().select();
    });
    $("li[aria-controls='secureUtility']").on("click", function() {
        $("#secureUtilityTable :input:first").focus().select();
    });
    $("li[aria-controls='secureReport']").on("click", function() {
        $("#secureReportTable :input:first").focus().select();
    });
    $("li[aria-controls='securePOS']").on("click", function() {
        $("#securePOSTable :input:first").focus().select();
    });

    $('#secureSettingsBody').find('input').on("focus", function() {
        $(this).select();
    });
    $('#secureDashTable input').keypress(function(e) {
        let inputs = $("#secureDashTable :input").get(); // Get all input elements in the form

        if (e.keyCode == 13) {
            e.preventDefault();
            var which = inputs.indexOf(this);
            if (e.shiftKey) {
                if (which - 1 >= 0) {
                    $(inputs[which - 1]).focus().select(); // Focus the previous element in the collected list
                } else {
                    $(inputs[inputs.length - 1]).focus().select(); // Focus the last element or loop back to the first field
                }
            } else {
                if (which + 1 < inputs.length) {
                    $(inputs[which + 1]).focus().select(); // Focus the next element in the collected list
                } else {
                    $(inputs[0]).focus().select(); // Focus the first element or loop back to the first field
                }
            }
        }
    });
    $('#secureListTable input').keypress(function(e) {
        let inputs = $("#secureListTable :input").get(); // Get all input elements in the form

        if (e.keyCode == 13) {
            e.preventDefault();
            var which = inputs.indexOf(this);
            if (e.shiftKey) {
                if (which - 1 >= 0) {
                    $(inputs[which - 1]).focus().select(); // Focus the previous element in the collected list
                } else {
                    $(inputs[inputs.length - 1]).focus().select(); // Focus the last element or loop back to the first field
                }
            } else {
                if (which + 1 < inputs.length) {
                    $(inputs[which + 1]).focus().select(); // Focus the next element in the collected list
                } else {
                    $(inputs[0]).focus().select(); // Focus the first element or loop back to the first field
                }
            }
        }
    });
    $('#secureUtilityTable input').keypress(function(e) {
        let inputs = $("#secureUtilityTable :input").get(); // Get all input elements in the form

        if (e.keyCode == 13) {
            e.preventDefault();
            var which = inputs.indexOf(this);
            if (e.shiftKey) {
                if (which - 1 >= 0) {
                    $(inputs[which - 1]).focus().select(); // Focus the previous element in the collected list
                } else {
                    $(inputs[inputs.length - 1]).focus().select(); // Focus the last element or loop back to the first field
                }
            } else {
                if (which + 1 < inputs.length) {
                    $(inputs[which + 1]).focus().select(); // Focus the next element in the collected list
                } else {
                    $(inputs[0]).focus().select(); // Focus the first element or loop back to the first field
                }
            }
        }
    });
    $('#secureReportTable input').keypress(function(e) {
        let inputs = $("#secureReportTable :input").get(); // Get all input elements in the form

        if (e.keyCode == 13) {
            e.preventDefault();
            var which = inputs.indexOf(this);
            if (e.shiftKey) {
                if (which - 1 >= 0) {
                    $(inputs[which - 1]).focus().select(); // Focus the previous element in the collected list
                } else {
                    $(inputs[inputs.length - 1]).focus().select(); // Focus the last element or loop back to the first field
                }
            } else {
                if (which + 1 < inputs.length) {
                    $(inputs[which + 1]).focus().select(); // Focus the next element in the collected list
                } else {
                    $(inputs[0]).focus().select(); // Focus the first element or loop back to the first field
                }
            }
        }
    });
    $('#securePOS input').keypress(function(e) {
        let inputs = $("#securePOSTable :input").get(); // Get all input elements in the form

        if (e.keyCode == 13) {
            e.preventDefault();
            var which = inputs.indexOf(this);
            if (e.shiftKey) {
                if (which - 1 >= 0) {
                    $(inputs[which - 1]).focus().select(); // Focus the previous element in the collected list
                } else {
                    $(inputs[inputs.length - 1]).focus().select(); // Focus the last element or loop back to the first field
                }
            } else {
                if (which + 1 < inputs.length) {
                    $(inputs[which + 1]).focus().select(); // Focus the next element in the collected list
                } else {
                    $(inputs[0]).focus().select(); // Focus the first element or loop back to the first field
                }
            }
        }
    });
}

function closeSecureSettings() {
    const modal = document.getElementById("secureSettings");
    $("#tab_dash").show();
    modal.close();
}

function saveSecuritySettings() {
    let settings = [];
    let inputs = $("#secureSettingsTabs :input").get();
    $.each(inputs, function(index, input) {
        let arr = [];
        let id = $(input).attr("id");
        id = id.replace("secure", "");
        settings.push(
            [ id, $(input).val() ]
        );
    });
    
    $.post("saveSecuritySettings?", {settings: JSON.stringify(settings)}, function(reply) {
        if (reply.result === "success") {
            closeSecureSettings();
        } else {
            console.log("Failed to save security settings:", reply.msg);
            swal("Error", "Failed to save security settings.", "error");
        }
    });
}

//---- NOT used in current production. To be added in future releases.
function showPOSProfileList() {
    let profileID;
    let profileName;
    let noNew = false;
    let drwArr = [];
    let nameArr = [];

    $.post("getPosProfiles?", function (reply) {
        if (reply.profiles.length===0) {
            posSettings(true); // no profiles exist, go straight to settings
            return;
        }

        $.each(reply.profiles, function (idx, arr) {
            let tr = idx === 0 ? "tr class='profileListTableSelected'" : "tr";

            nameArr.push( arr[idx,1].trim().toUpperCase() );

            if (arr[idx,2].trim().toUpperCase() === "ALL") {
                noNew = true;
            } else {
                //---- get the drawer nbrs already assigned to a profile
                let arr2 = JSON.parse( arr[idx,3] );
                drwArr.push( ...arr2 );
            }

            $('#profileListTableBody').append('<' + tr + '><td class="profileListTableHiddenColumn">' + arr[idx,0] + '</td>' +
                '<td>' + arr[idx,1] + '</td><td>' + arr[idx,2] + '</td></tr>');
        });

        //---- store drawer & name arrays to check against when adding new profiles
        $("#posSettings").data("drawerArray", drwArr);
        $("#posSettings").data("existingProfiles", nameArr);

        //---- disable new/clone if all drawers are assigned
        if (noNew) {
            $("#profileListAddBtn").hide();
            $("#profileListCloneBtn").hide();
        } else {
            $("#profileListAddBtn").show();
            $("#profileListCloneBtn").show();
        }

        $('#profileListTable').off('click');

        $('#profileListTable').on('click', function (event) {
            const clickedRow = event.target.closest('tr');

            // Ensure a row was actually clicked and it's not the table header
            if (clickedRow && clickedRow.parentNode.tagName === 'TBODY') {
                $("#profileListTable tr").removeClass('profileListTableSelected');

                // Add the 'selected' class to the newly clicked row
                $(clickedRow).addClass('profileListTableSelected');

                profileID = $(clickedRow).find('td:first-child').text();
                profileName = $(clickedRow).find('td:nth-child(2)').text();
                console.log('Selected row data (first cell):', profileID, profileName,"type:", typeof(profileID));
            }
        });

        $("#profileListAddBtn").off('click');
        $("#profileListEditBtn").off('click');
        $("#profileListDeleteBtn").off('click');

        $("#profileListAddBtn").on('click', function(e) {
            e.stopPropagation();
            closeProfileList(false);
            posSettings(true);
        });
        $("#profileListEditBtn").on('click', function(e) {
            e.stopPropagation();
            $.post("getProfileSettings?", {profileId: profileID}, function(reply) {
                if (reply.result === "success") {
                    posSettings(false, profileName, profileID, reply.set);
                } else {
                    swal("Error", "Failed to retrieve profile settings.", "error");
                }
            });
        });
        $("#profileListDeleteBtn").on('click', function(e) {
            e.stopPropagation();
            console.log("Delete clicked");
            posProfileDelete();
            closeProfileList(true);
        });

        $("#modalProfileListBody").css("width", "600px")
        $(".encoreBody").css("overflow", "hidden");
        $("#modalProfileList").show();
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        swal({
            title: "Oops...", 
            text: "An error occurred while fetching profiles: " + thrownError, 
            type: "error" },
            function() {
                closeProfileList(false);
                posSettings(true); // proceed to new profile settings
        });
    });
}

function closeProfileList(doCss) {
    if (doCss) {
        $(".encoreBody").css("overflow", "auto");
    }
    $("#modalProfileList").hide();
    $("#profileListTableBody").empty();
}

function posSettings(isNew, profileName, profileId, settings) {
    const modal = document.getElementById("posSettings");

    if (isNew) {
        cloneSet = structuredClone( pSet );  // cloneSet is a global variable
    } else {
        let setObj = JSON.parse(settings);
        cloneSet = setObj;
    }

    $("#closePOSSettings").off("click");
    $("#posSettingsCancelBtn").off("click");
    $("#posSettingsSaveBtn").off("click");

    $("#closePOSSettings").on("click", () => { closePOSSettings(); } );
    $("#posSettingsCancelBtn").on("click", () => { closePOSSettings(); } );
    $("#posSettingsSaveBtn").on("click", () => { savePOSSettings(); } );    

    $("#posSettingsSelect").on("change", function () {
        let cat = $(this).val();
        let html = $("#posSettings_" + cat).html();

        //---- first, save settings on old form
        savePOSSettingsToCloneSet();

        $("#posSettingsForm").html(html);

        //----- Now, set values on the new form
        $("#posSettingsForm").find("input, select, textarea, button").each(function () {
            let id = $(this).attr("id");
            let tag = $(this).prop("tagName").toLowerCase();
            let type = $(this).attr("type");
            let name = $(this).attr("name");
            let valu = $(this).attr("value");

            if (id in cloneSet || name in cloneSet) {
                if (tag === "input") {
                    if (type === "checkbox" && $("#"+id).hasClass("setting3State")) {
                        switch (cloneSet[id]) {
                            case 'N':
                                $(this).prop("checked", false);
                                $(this).prop("indeterminate", false);
                                $(this).attr("data-state", '0');
                                $("label[for='" + id + "']").text("No");
                                break;

                            case 'Y':
                                $(this).prop("checked", true);
                                $(this).prop("indeterminate", false);
                                $(this).attr("data-state", '1');
                                $("label[for='" + id + "']").text("Yes");
                                break;

                            case '1':
                                $(this).prop("checked", false);
                                $(this).prop("indeterminate", true);
                                $(this).attr("data-state", '2');
                                $("label[for='" + id + "']").text("Alt");
                                break;
                        }
                    } else if (type === "checkbox") {
                        $(this).prop("checked", cloneSet[id]);
                    } else if ($("#" +id).is("[class*=posSetAn]")) {
                        // create the autonumeric object
                        let autoNumericOptions = { emptyInputBehavior: 'zero', 
                                                   digitGroupSeparator: '', 
                                                   roundingMethod: 'C' }
                        if ($(this).hasClass("posSetAnInt2")) {
                            autoNumericOptions.decimalPlaces = 0;
                            autoNumericOptions.maximumValue = '99';
                            autoNumericOptions.minimumValue = '-99';
                        } else if ($(this).hasClass("posSetAnInt3")) {
                            autoNumericOptions.decimalPlaces = 0;
                            autoNumericOptions.maximumValue = '999';
                            autoNumericOptions.minimumValue = '-999';
                        } else if ($(this).hasClass("posSetAnDeci4_2")) {
                            autoNumericOptions.decimalPlaces = 2;
                            autoNumericOptions.maximumValue = '99.99';
                            autoNumericOptions.minimumValue = '0';
                        } else if ($(this).hasClass("posSetAnDeci5_2")) {
                            autoNumericOptions.decimalPlaces = 2;
                            autoNumericOptions.maximumValue = '999.99';
                            autoNumericOptions.minimumValue = '-999.99';
                        } else if ($(this).hasClass("posSetAnDeci5_3")) {
                            autoNumericOptions.decimalPlaces = 3;
                            autoNumericOptions.maximumValue = '99.999';
                            autoNumericOptions.minimumValue = '-99.999';
                        } else if ($(this).hasClass("posSetAnDeci6_2")) {
                            autoNumericOptions.decimalPlaces = 2;
                            autoNumericOptions.maximumValue = '9999.99';
                            autoNumericOptions.minimumValue = '-9999.99';
                        } else if ($(this).hasClass("posSetAnDeci6_3")) {
                            autoNumericOptions.decimalPlaces = 3;
                            autoNumericOptions.maximumValue = '999.999';
                            autoNumericOptions.minimumValue = '-999.999';
                        } else if ($(this).hasClass("posSetAnDeci7_2")) {
                            autoNumericOptions.decimalPlaces = 2;
                            autoNumericOptions.maximumValue = '99999.99';
                            autoNumericOptions.minimumValue = '-99999.99';
                        } else if ($(this).hasClass("posSetAnDeci7_5")) {
                            autoNumericOptions.decimalPlaces = 5;
                            autoNumericOptions.maximumValue = '99.99999';
                            autoNumericOptions.minimumValue = '-99.99999';
                        } else if ($(this).hasClass("posSetAnDeci8_4")) {
                            autoNumericOptions.decimalPlaces = 4;
                            autoNumericOptions.maximumValue = '9999.9999';
                            autoNumericOptions.minimumValue = '-9999.9999';
                        } else if ($(this).hasClass("posSetAnDeci9_3")) {
                            autoNumericOptions.decimalPlaces = 3;
                            autoNumericOptions.maximumValue = '999999.999';
                            autoNumericOptions.minimumValue = '-999999.999';
                        }
                        let el = document.getElementById(id);
                        let an =new AutoNumeric(el, autoNumericOptions);
                        an.set(cloneSet[id]);
                    } else if (type === "radio") {
                        $('input[name="' + name + '"][value="' + cloneSet[name] + '"]').prop("checked", true);
                    } else {
                        $(this).val(cloneSet[id]);
                    }
                } else if (tag === "select") {
                    $(this).val(cloneSet[id]);
                } else if (tag === "textarea") {
                    if (id === "receiptBannerText") {
                        $(this).val(cloneSet[id].join('\n'));
                    } else {
                        $(this).val(cloneSet[id]);
                    }
                }
            } else {
                let txt;
                
                if (tag === "input") {
                    if (type === "checkbox") {
                        txt = '"' + id + '"' + ": true,";
                    } else if (type === "radio") {
                        txt = '"' + name + '"' + ": '"+ valu + "',";
                    } else if (type === "text") {
                        if ( $("#" +id).is("[class*=posSetAn]")) {
                            txt = '"' + id + '"' + ": 0,";
                        } else {
                            txt = '"' + id + '"' + ": '',";
                        }
                    }
                } else if (tag === "select") {
                    txt = "// " + '"' + id + '"' + ": select,";
                } else if (tag === "textarea") {
                    txt = '"' + id + '"' + ": '',";
                } else if (tag === "button") {
                    txt = "// " + '"' + id + '"' + ": button,";
                }
                console.log(txt);
            }
        });

        switch (cat) {
            case "1":
                //----- if other profiles exist, disable "All Drawers" option
                let otherProfiles = $("#posSettings").data("existingProfiles");
                if (otherProfiles !== undefined && otherProfiles.length > 0) {
                    $("#posProfileAll").prop("disabled", true);
                    $("label[for='posProfileAll']").css("color", "darkgray");
                }

                $('input[name="posProfileType"]').on("change", function () {
                    if ($("#posProfileNbrs").prop("checked") === true) {
                        $("#profileDrawerNbrs").prop("disabled", false);
                        $("#profileDrawerNbrs").css("border-color", "#086b6b");
                        $("label[for='profileDrawerNbrs']").css("color", "#086b6b");
                    } else {
                        $("#profileDrawerNbrs").prop("disabled", true);
                        $("#profileDrawerNbrs").css("border-color", "darkgray");
                        $("label[for='profileDrawerNbrs']").css("color", "darkgray");
                    }
                });
                $("#profileDrawerNbrs").on("keydown", function (e) {
                    if (e.key==='ArrowLeft' || e.key==='ArrowRight' ||/\d+|,+|[/b]+|-+|<+|>/i.test(e.key)) {
                        console.log("character accepted: " + e.key)
                    } else {
                        e.preventDefault();
                        console.log("illegal character detected: " + e.key)
                        return false;
                    }

                });
                // TODO: restore this trigger when profiles are supported
                //$('input[name="posProfileType"]').trigger("change");
                setTimeout(function() { 
                        if (isNew) {
                            $("#posProfileName").focus();
                        } else {
                            $("#posProfileName").prop("disabled", true);
                            $("#profileLoadFieldset legend").css("color", "darkgray");
                            $("#profileLoadFieldset label").css("color", "darkgray");
                            $("#profileLoadFieldset button").prop("disabled", true);
                        }
                    }, 25);
                break;

            case "2":
                $("#doCashChk").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#chkCashFeeFieldset input[type='radio']").prop("disabled", false);
                        $("#chkCashFeeFieldset legend").css("color", "#086b6b");
                        $("label[for='chkCashFixedFee']").css("color", "#086b6b");
                        $("label[for='chkCashTable']").css("color", "#086b6b");
                        if ($("#chkCashFixedFee").is(":checked")) {
                            $("#chkCashTableBtn").prop("disabled", true);
                            $("#checkCashFixedFeeDiv input").prop("disabled", false);
                            $("#checkCashFixedFeeDiv label").css("color", "#086b6b");
                            $("#checkCashFixedFeeDiv span").css("color", "#086b6b");
                        } else {
                            $("#chkCashTableBtn").prop("disabled", false);
                            $("#checkCashFixedFeeDiv input").prop("disabled", true);
                            $("#checkCashFixedFeeDiv label").css("color", "darkgray");
                            $("#checkCashFixedFeeDiv span").css("color", "darkgray");
                        }
                    } else {
                        $("#chkCashFeeFieldset input").prop("disabled", true);
                        $("#chkCashTableBtn").prop("disabled", true);
                        $("#chkCashFeeFieldset legend").css("color", "darkgray");
                        $("#chkCashFeeFieldset label").css("color", "darkgray");
                        $("#chkCashFeeFieldset span").css("color", "darkgray");
                    }
                });
                $("input[name='chkCashFeeType']").on("change", function () {
                    if ($("#chkCashFixedFee").is(":checked")) {
                        $("#chkCashTableBtn").prop("disabled", true);
                        $("#checkCashFixedFeeDiv input").prop("disabled", false);
                        $("#checkCashFixedFeeDiv label").css("color", "#086b6b");
                        $("#checkCashFixedFeeDiv span").css("color", "#086b6b");
                    } else {
                        $("#chkCashTableBtn").prop("disabled", false);
                        $("#checkCashFixedFeeDiv input").prop("disabled", true);
                        $("#checkCashFixedFeeDiv label").css("color", "darkgray");
                        $("#checkCashFixedFeeDiv span").css("color", "darkgray");
                    }
                });

                $("#doCashChk").trigger("change");
                if ($("#doCashChk").is(":checked")) {
                    $("input[name='chkCashFeeType']").trigger("change");
                }
                break;

            case "3":
                $("#trackDepOver").on("change", function() {
                    if ($(this).is(":checked")) { 
                        $("#trackDepOverAmt").prop("disabled", false);
                        $("#trackDepOverHint").css("color","#086b6b");
                    } else {
                        $("#trackDepOverAmt").prop("disabled", true);
                        $("#trackDepOverHint").css("color","darkgray");
                    }
                });
                $("#depositLimitOver").on("change", function() {
                    if ($(this).is(":checked")) { 
                        $("#depositLimitOverAmt").prop("disabled", false);
                    } else {
                        $("#depositLimitOverAmt").prop("disabled", true);
                    }
                });
                $("#trackDepOver").trigger("change");
                $("#depositLimitOver").trigger("change");
                break;

            case "4":
                $("#doDelivery").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#posDeliverySet input").not(this).prop("disabled", false);
                        $("#posDeliverySet legend").css("color", "#086b6b");
                        $("#posDeliverySet label").not("label[for='doDelivery']").css("color", "#086b6b");
                    } else {
                        $("#posDeliverySet input").not(this).prop("disabled", true);
                        $("#posDeliverySet legend").css("color", "darkgray");
                        $("#posDeliverySet label").not("label[for='doDelivery']").css("color", "darkgray");
                    }
                });
                $("#doDelivery").trigger("change");
                break;

            // discounts/promo
            case "5":
                $("#posDiscTabs").tabs({
                    active: 0,
                });
                $("#smart2Fer").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#2FerAsDisc").prop("disabled", false);
                        $("label[for='2FerAsDisc']").css("color", "#086b6b");
                    } else {
                        $("#2FerAsDisc").prop("disabled", true);
                        $("label[for='2FerAsDisc']").css("color", "darkgray");
                    }
                });
                $("#doDualPricing").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#dualPricingPercent").prop("disabled", false);
                        $("#dualPricingPercent").css("border-color", "#086b6b");
                        $("label[for='dualPricingPercent']").css("color", "#086b6b");
                        setTimeout(function() {
                            $("#dualPricingPercent").focus();
                        }, 25);
                    } else {
                        $("#dualPricingPercent").prop("disabled", true);
                        $("#dualPricingPercent").css("border-color", "darkgray");
                        $("label[for='dualPricingPercent']").css("color", "darkgray");
                    }
                });

                $("#smart2Fer").trigger("change");
                $("#doDualPricing").trigger("change");
                break;

            case "7":
                $("#giftCertDo").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#posGiftCertSet fieldset input").not(this).prop("disabled", false);
                        $("#posGiftCertSet fieldset select").not(this).prop("disabled", false);
                        $("#posGiftCertSet fieldset legend").css("color", "#086b6b");
                        $("#posGiftCertSet fieldset label").not("label[for='giftCertDo']").css("color", "#086b6b");
                        $("input[name='giftCertType']").trigger("change");
                    } else {
                        $("#posGiftCertSet fieldset input").not(this).prop("disabled", true);
                        $("#posGiftCertSet fieldset select").not(this).prop("disabled", true);
                        $("#posGiftCertSet fieldset legend").css("color", "darkgray");
                        $("#posGiftCertSet fieldset label").not("label[for='giftCertDo']").css("color", "darkgray");
                    }
                });
                $("input[name='giftCertType']").on("change", function () {
                    if ($("#giftCertOnline").is(":checked")) {
                        $("#giftCertProcessor").prop("disabled", false);
                        $("#giftCertOnlineFieldset legend").css("color", "#086b6b");
                        $("label[for='giftCertProcessor']").css("color", "#086b6b");
                    } else {
                        $("#giftCertProcessor").prop("disabled", true);
                        $("#giftCertOnlineFieldset legend").css("color", "darkgray");
                        $("label[for='giftCertProcessor']").css("color", "darkgray");
                    }
                });

                
                $("#giftCertDo").trigger("change");
                if ($("#giftCertDo").is(":checked")) {
                    $("input[name='giftCertType']").trigger("change");
                }
                break;

            case "8":
                $("#posHardwareSet").tabs({
                    active: 0,
                });
                $("input[name='hwConfigType']").on("change", function () {
                    console.log("hwConfigType change detected, value:", $("input[name='hwConfigType']:checked").val());
                    if ($("input[name='hwConfigType']:checked").val() === "util") {
                        $("#hwConfigUtilFieldset input").prop("disabled", false);
                        $("#hwConfigUtilFieldset select").prop("disabled", false);
                        $("#hwConfigUtilFieldset legend").css("color", "#086b6b");
                        $("#hwConfigUtilFieldset label").css("color", "#086b6b");
                        $("#hwConfigLocalFieldset input").prop("disabled", true);
                        $("#hwConfigLocalFieldset select").prop("disabled", true);
                        $("#hwConfigLocalFieldset legend").css("color", "darkgray");
                        $("#hwConfigLocalFieldset label").css("color", "darkgray");
                    } else {
                        $("#hwConfigUtilFieldset input").prop("disabled", true);
                        $("#hwConfigUtilFieldset select").prop("disabled", true);
                        $("#hwConfigUtilFieldset legend").css("color", "darkgray");
                        $("#hwConfigUtilFieldset label").css("color", "darkgray");
                        $("#hwConfigLocalFieldset input").prop("disabled", false);
                        $("#hwConfigLocalFieldset select").prop("disabled", false);
                        $("#hwConfigLocalFieldset legend").css("color", "#086b6b");
                        $("#hwConfigLocalFieldset label").css("color", "#086b6b");
                    }
                });
                $("#cardProcDo").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#hwCardProc input").not(this).prop("disabled", false);
                        $("#hwCardProc legend").css("color", "#086b6b");
                        $("#hwCardProc label").not("label[for='cardProcDo']").css("color", "#086b6b");
                    } else {
                        $("#hwCardProc input").not(this).prop("disabled", true);
                        $("#hwCardProc legend").css("color", "darkgray");
                        $("#hwCardProc label").not("label[for='cardProcDo']").css("color", "darkgray");
                    }
                });
                $("#hwPoleDisplayDo").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#hwCustDisplay input").not(this).prop("disabled", false);
                        $("#hwCustDisplay legend").css("color", "#086b6b");
                        $("#hwCustDisplay label").not("label[for='hwPoleDisplayDo']").css("color", "#086b6b");
                    } else {
                        $("#hwCustDisplay input").not(this).prop("disabled", true);
                        $("#hwCustDisplay legend").css("color", "darkgray");
                        $("#hwCustDisplay label").not("label[for='hwPoleDisplayDo']").css("color", "darkgray");
                    }
                });
                $("#hwCashDrawerDo").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#hwCashDrawer input").not(this).prop("disabled", false);
                        $("#hwCashDrawer legend").css("color", "#086b6b");
                        $("#hwCashDrawer label").not("label[for='hwCashDrawerDo']").css("color", "#086b6b");
                    } else {
                        $("#hwCashDrawer input").not(this).prop("disabled", true);
                        $("#hwCashDrawer legend").css("color", "darkgray");
                        $("#hwCashDrawer label").not("label[for='hwCashDrawerDo']").css("color", "darkgray");
                    }
                });

                $("input[name='hwConfigType']").trigger("change");
                $("#hwCashDrawerDo").trigger("change");
                $("#hwPoleDisplayDo").trigger("change");
                $("#cardProcDo").trigger("change");
                break;

            // Information
            case "9":
                $("#posInfoTabs").tabs({
                    active: 0,
                });

                $.post("getInvTypes?", function (aTypes) {
                    $.each(aTypes, function (idx, arr) {
                        $('#customMiscSaleType').append('<option value="' + arr[1] + '">' + arr[0] + '</option>');
                    });
                    if (cloneSet['customMiscSaleDo']) {
                        let valu = cloneSet['customMiscSaleType'];
                        let txt;
                        $("#customMiscSaleType").val(valu);
                    }
                });

                $("#doLegalAge").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#legalAge").prop("disabled", false);
                        $("#legalAge").css("border-color", "#086b6b");
                        $("label[for='legalAge']").css("color", "#086b6b");
                    } else {
                        $("#legalAge").prop("disabled", true);
                        $("#legalAge").css("border-color", "darkgray");
                        $("label[for='legalAge']").css("color", "darkgray");
                    }
                });
                $("#coupAsk4Type").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#editCoupTypesBtn").prop("disabled", false);
                    } else {
                        $("#editCoupTypesBtn").prop("disabled", true);
                    }
                });
                $("#noSaleLog").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#noSaleReasonsBtn").prop("disabled", false);
                    } else {
                        $("#noSaleReasonsBtn").prop("disabled", true);
                    }
                });
                $("#customMiscSaleDo").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#customMiscSaleKeyDiv input").prop("disabled", false);
                        $("#customMiscSaleKeyDiv select").prop("disabled", false);
                        $("#customMiscSaleKeyDiv label").css("color", "#086b6b");
                    } else {
                        $("#customMiscSaleKeyDiv input").prop("disabled", true);
                        $("#customMiscSaleKeyDiv select").prop("disabled", true);
                        $("#customMiscSaleKeyDiv label").css("color", "darkgray");
                    }
                });
                $("#customMiscSaleDo").trigger("change");
                $("#noSaleLog").trigger("change");
                $("#coupAsk4Type").trigger("change");
                $("#doLegalAge").trigger("change");
                $("#infoIconSvg").html(svgInfo);
                $("#posSettingsForm").tooltip({
                    close: function (event, ui) {
                        $(".ui-helper-hidden-accessible").remove();
                    } 
                });
                break;

            // invoices/receipts
            case "10":
                $("#posInvoiceTabs").tabs({
                    active: 0,
                });
                break;

            case "11":
                $("#doLotto").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#posLotteryOptions input").prop("disabled", false);
                        $("#posLotterySet legend").css("color", "#086b6b");
                        $("#posLotteryOptions label").css("color", "#086b6b");
                    } else {
                        $("#posLotteryOptions input").prop("disabled", true);
                        $("#posLotterySet legend").css("color", "darkgray");
                        $("#posLotteryOptions label").css("color", "darkgray");
                    }
                });
                $("#doLotto").trigger("change");
                break;

            case "12":
                $("#tenderAutoClear").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#autoClearCount").prop("disabled", false);
                        $("#autoClearCount").css("border-color", "#086b6b");
                        $("label[for='autoClearCount']").css("color", "#086b6b");
                    } else {
                        $("#autoClearCount").prop("disabled", true);
                        $("#autoClearCount").css("border-color", "darkgray");
                        $("label[for='autoClearCount']").css("color", "darkgray");
                    }
                });
                $("#pennyRound").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#roundMethod").prop("disabled", false);
                        $("#roundMethod").css("border-color", "#086b6b");
                        $("label[for='roundMethod']").css("color", "#086b6b");
                    } else {
                        $("#roundMethod").prop("disabled", true);
                        $("#roundMethod").css("border-color", "darkgray");
                        $("label[for='roundMethod']").css("color", "darkgray");
                    }
                });
                $("#tenderForeign").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#tenderForeignLabel").prop("disabled", false);
                        $("#tenderForeignExchRate").prop("disabled", false);
                        $("#tenderForeignLabel").css("border-color", "#086b6b");
                        $("#tenderForeignExchRate").css("border-color", "#086b6b");
                        $("label[for='tenderForeignLabel']").css("color", "#086b6b");
                        $("label[for='tenderForeignExchRate']").css("color", "#086b6b");
                    } else {
                        $("#tenderForeignLabel").prop("disabled", true);
                        $("#tenderForeignExchRate").prop("disabled", true);
                        $("#tenderForeignLabel").css("border-color", "darkgray");
                        $("#tenderForeignExchRate").css("border-color", "darkgray");
                        $("label[for='tenderForeignLabel']").css("color", "darkgray");
                        $("label[for='tenderForeignExchRate']").css("color", "darkgray");
                    }
                });
                $("#tenderTypeEditDo").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#tenderType5").prop("disabled", false);
                        $("#tenderType6").prop("disabled", false);
                        $("#tenderType7").prop("disabled", false);
                        $("#tenderType8").prop("disabled", false);
                        $("#tenderType5").css("border-color", "#086b6b");
                        $("#tenderType6").css("border-color", "#086b6b");
                        $("#tenderType7").css("border-color", "#086b6b");
                        $("#tenderType8").css("border-color", "#086b6b");
                        $("label[for='tenderType5']").css("color", "#086b6b");
                        $("label[for='tenderType6']").css("color", "#086b6b");
                        $("label[for='tenderType7']").css("color", "#086b6b");
                        $("label[for='tenderType8']").css("color", "#086b6b");
                    } else {
                        $("#tenderType5").prop("disabled", true);
                        $("#tenderType6").prop("disabled", true);
                        $("#tenderType7").prop("disabled", true);
                        $("#tenderType8").prop("disabled", true);
                        $("#tenderType5").css("border-color", "darkgray");
                        $("#tenderType6").css("border-color", "darkgray");
                        $("#tenderType7").css("border-color", "darkgray");
                        $("#tenderType8").css("border-color", "darkgray");
                        $("label[for='tenderType5']").css("color", "darkgray");
                        $("label[for='tenderType6']").css("color", "darkgray");
                        $("label[for='tenderType7']").css("color", "darkgray");
                        $("label[for='tenderType8']").css("color", "darkgray");
                    }
                });
                $("#tenderEnableCashDrop").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#tenderCashDropNbrReceipt").prop("disabled", false);
                        $("#tenderCashDropNbrReceipt").css("border-color", "#086b6b");
                        $("label[for='tenderCashDropNbrReceipt']").css("color", "#086b6b");
                    } else {
                        $("#tenderCashDropNbrReceipt").prop("disabled", true);
                        $("#tenderCashDropNbrReceipt").css("border-color", "darkgray");
                        $("label[for='tenderCashDropNbrReceipt']").css("color", "darkgray");
                    }
                });
                $("#tenderAutoClear").trigger("change");
                $("#pennyRound").trigger("change");
                $("#tenderForeign").trigger("change");
                $("#tenderTypeEditDo").trigger("change");
                $("#tenderEnableCashDrop").trigger("change");
                break;

            case "13":
                $("#posTaxTabs").tabs({
                    active: 0,
                });

                if (cloneSet["customMiscSaleDo"] === true) {
                    let cLabel = cloneSet["customMiscSaleLabel"].trim();
                    if (cLabel === "") {
                        cLabel = "Custom";
                    }
                    let cKey = cloneSet["customMiscSaleKey"].trim();
                    if (cKey === "") {
                        cKey = "O";
                    }
                    let html = '<div>' + cLabel + ' (ALT-' + cKey + ')</div><div>' +
                        '<input id="miscTaxC1" type="checkbox" class="posSettingChk noMarginChk tax1Input setting3State" />' +
                        '<label for="miscTaxC1" class="tax1Label">No</label>' +
                        '</div>' +
                        '<div>' +
                        '<input id="miscTaxC2" type="checkbox" class="posSettingChk noMarginChk tax2Input setting3State" />' +
                        '<label for="miscTaxC2" class="tax2Label">No</label>' +
                        '</div>' +
                        '<div>' +
                        '<input id="miscTaxC3" type="checkbox" class="posSettingChk noMarginChk tax3Input setting3State" />' +
                        '<label for="miscTaxC3" class="tax3Label">No</label>' +
                        '</div>';

                        $("#taxMiscGrid").append(html);
                    // set states
                    let state;
                    state = 0;
                    if (cloneSet["miscTaxC1"] === 'Y') {
                        state = 1;
                    } else if (cloneSet["miscTaxC1"] === '1') {
                        state = 2;
                    }
                    $("#miscTaxC1").attr("data-state", state);
                    $("#miscTaxC1").prop("checked", state > 0);
                    $("#miscTaxC1").prop("indeterminate", state === 2);
                    $("label[for='miscTaxC1']").text( state === 0 ? "No" : ( state === 1 ? "Yes" : "Alt") ); 

                    state = 0;
                    if (cloneSet["miscTaxC2"] === 'Y') {
                        state = 1;
                    } else if (cloneSet["miscTaxC2"] === '1') {
                        state = 2;
                    }
                    $("#miscTaxC2").attr("data-state", state);
                    $("#miscTaxC2").prop("checked", state > 0);
                    $("#miscTaxC2").prop("indeterminate", state === 2);
                    $("label[for='miscTaxC2']").text( state === 0 ? "No" : ( state === 1 ? "Yes" : "Alt") );

                    state = 0;
                    if (cloneSet["miscTaxC3"] === 'Y') {
                        state = 1;
                    } else if (cloneSet["miscTaxC3"] === '1') {
                        state = 2;
                    }
                    $("#miscTaxC3").attr("data-state", state);
                    $("#miscTaxC3").prop("checked", state > 0);
                    $("#miscTaxC3").prop("indeterminate", state === 2);
                    $("label[for='miscTaxC3']").text( state === 0 ? "No" : ( state === 1 ? "Yes" : "Alt") );
                }

                $("#doTax1").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#tax1Label").prop("disabled", false);
                        $("#tax1Label").css("border-color", "#086b6b");
                        $("label[for='tax1Label']").css("color", "#086b6b");
                        $(".tax1Input").prop("disabled", false);
                        $(".tax1Label").css("color", "#086b6b");
                        $("#posTaxTabs").tabs("option", "disabled", []);
                    } else {
                        $("#tax1Label").prop("disabled", true);
                        $("#tax1Label").css("border-color", "darkgray");
                        $("label[for='tax1Label']").css("color", "darkgray");
                        $(".tax1Input").prop("disabled", true);
                        $(".tax1Label").css("color", "darkgray");
                        if (!($("#doTax2").is(":checked")) && !($("#doTax3").is(":checked")) &&
                            !($("#doFlatTax").is(":checked")) && !($("#doVolTax").is(":checked"))) {
                                $("#posTaxTabs").tabs("option", "disabled", [1,2,3]);
                            }
                    }
                });
                $("#doTax2").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#tax2Label").prop("disabled", false);
                        $("#tax2Label").css("border-color", "#086b6b");
                        $("label[for='tax2Label']").css("color", "#086b6b");
                        $(".tax2Input").prop("disabled", false);
                        $(".tax2Label").css("color", "#086b6b");
                    } else {
                        $("#tax2Label").prop("disabled", true);
                        $("#tax2Label").css("border-color", "darkgray");
                        $("label[for='tax2Label']").css("color", "darkgray");
                        $(".tax2Input").prop("disabled", true);
                        $(".tax2Label").css("color", "darkgray");
                    }
                });
                $("#doTax3").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#tax3Label").prop("disabled", false);
                        $("#tax3Label").css("border-color", "#086b6b");
                        $("label[for='tax3Label']").css("color", "#086b6b");
                        $(".tax3Input").prop("disabled", false);
                        $(".tax3Label").css("color", "#086b6b");
                    } else {
                        $("#tax3Label").prop("disabled", true);
                        $("#tax3Label").css("border-color", "darkgray");
                        $("label[for='tax3Label']").css("color", "darkgray");
                        $(".tax3Input").prop("disabled", true);
                        $(".tax3Label").css("color", "darkgray");
                    }
                });
                $("#doFlatTax").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#flatTaxLabel").prop("disabled", false);
                        $("#flatTaxLabel").css("border-color", "#086b6b");
                        $("label[for='flatTaxLabel']").css("color", "#086b6b");
                    } else {
                        $("#flatTaxLabel").prop("disabled", true);
                        $("#flatTaxLabel").css("border-color", "darkgray");
                        $("label[for='flatTaxLabel']").css("color", "darkgray");
                    }
                });
                $("#doVolTax").on("change", function () {
                    if ($(this).is(":checked")) {
                        $("#volTaxLabel").prop("disabled", false);
                        $("#volTaxLabel").css("border-color", "#086b6b");
                        $("label[for='volTaxLabel']").css("color", "#086b6b");
                        $(".volTaxInput").prop("disabled", false);
                        $("#volTaxUnit").prop("disabled", false);
                        $(".volTaxLabel").css("color", "#086b6b");
                    } else {
                        $("#volTaxLabel").prop("disabled", true);
                        $("#volTaxLabel").css("border-color", "darkgray");
                        $("label[for='volTaxLabel']").css("color", "darkgray");
                        $(".volTaxInput").prop("disabled", true);
                        $("#volTaxUnit").prop("disabled", true);
                        $(".volTaxLabel").css("color", "darkgray");
                    }
                });
                $("#taxesArePercentage").prop("checked", true);
                $("input[name='taxFormat']").on("change", function () {
                    let format = $("input[name='taxFormat']:checked").val();

                    if ($("#taxesAreTable").is(":checked")) {
                        $(".taxFormatBtn").prop("disabled", false);
                        $("#taxEditTablesFieldset").css("color", "#086b6b");
                        $("#taxRateFieldset legend").css("color", "darkgray");
                        $("#taxRateFieldset div").css("color", "darkgray");
                        $("#taxRateFieldset input").prop("disabled", true);
                    } else if ($("#taxesArePercentage").is(":checked")) {
                        $(".taxFormatBtn").prop("disabled", true);
                        $("#taxEditTablesFieldset").css("color", "darkgray");
                        $("#taxRateFieldset legend").css("color", "#086b6b");
                        $("#taxRateFieldset div").css("color", "#086b6b");
                        $("#taxRateFieldset input").prop("disabled", false);
                        // trigger to disable unsed taxes
                        setTimeout( () => {
                            $("#doTax2").trigger("change");
                            $("#doTax3").trigger("change");
                            $("#doVolTax").trigger("change");
                            }, 25 );
                    } else {
                        $(".taxFormatBtn").prop("disabled", true);
                        $("#taxEditTablesFieldset").css("color", "darkgray");
                        $("#taxRateFieldset legend").css("color", "darkgray");
                        $("#taxRateFieldset div").css("color", "darkgray");
                        $("#taxRateFieldset input").prop("disabled", true);
                    }
                });
                $(".setting3State").on('click', function () {
                    let id = $(this).prop("id");
                    let state = parseInt($(this).attr("data-state"));

                    state = (state + 1) % 3; // Cycle through the three states
                    $(this).attr("data-state", state);

                    switch (state) {
                        case 0: // Unchecked
                            $(this).prop("checked", false);
                            $(this).prop("indeterminate", false);
                            $("label[for='" + id + "']").text("No");
                            break;
                        case 1: // Checked
                            $(this).prop("checked", true);
                            $(this).prop("indeterminate", false);
                            $("label[for='" + id + "']").text("Yes");
                            break;
                        case 2: // Indeterminate
                            $(this).prop("checked", false); // Indeterminate state is visually distinct, but the `checked` property should be false
                            $(this).prop("indeterminate", true);
                            $("label[for='" + id + "']").text("Alt");
                            break;
                    }

                });
                $(".settingYNChk").on('click', function () {
                    let id = $(this).prop("id");

                    if ($(this).prop("checked")) {
                        $("label[for='" + id + "']").text("Yes");
                    } else {
                        $("label[for='" + id + "']").text("No");
                    }
                });

                $("input[name='taxFormat']").trigger("change");  // must do first so we don't untoggle unused taxes
                $("#doTax2").trigger("change");
                $("#doTax3").trigger("change");
                $("#doFlatTax").trigger("change");
                $("#doVolTax").trigger("change");
                break;
        }
    });

    $("#posSettingsSelect").val("1");
    $("#posSettingsSelect").trigger("change");

    modal.showModal();

console.log("showPOSSettings,, drawerArray:", $("#posSettings").data("drawerArray"));

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });

    $("#posSettingsSelect").focus();

    setTimeout(() => {
        $(".encoreBody").css("overflow", "hidden");
    }, 50);
}

function savePOSSettingsToCloneSet() {
// called when forms change so that we remember changes until final save or cancel
    $("#posSettingsForm").find("input, select, textarea").each(function () {
        let id = $(this).attr("id");
        let tag = $(this).prop("tagName").toLowerCase();
        let type = $(this).attr("type");
        let name = $(this).attr("name");

        if (id in cloneSet || name in cloneSet) {
            if (tag === "input") {
                if (type === "checkbox" && $("#" + id).hasClass("setting3State")) {
                    let state = $(this).attr("data-state");
                    switch (state) {
                        case '0':
                            cloneSet[id] = 'N';
                            break;

                        case '1':
                            cloneSet[id] = 'Y';
                            break;

                        case '2':
                            cloneSet[id] = '1';
                            break;
                    }
                } else if (type === "checkbox") {
                    cloneSet[id] = $(this).is(":checked");
                } else if ($("#" + id).is("[class*=posSetAn]")) {
                    // get value of the autonumeric object
                    let el = document.getElementById(id);
                    let anObj = AutoNumeric.getAutoNumericElement(el);
                    cloneSet[id] = anObj.getNumber();
                } else if (type === "radio") {
                    if ($(this).is(":checked")) {
                        cloneSet[name] = $(this).val();
                    }
                } else {
                    cloneSet[id] = $(this).val();
                }
            } else if (tag === "select") {
                cloneSet[id] = $(this).val();
            } else if (tag === "textarea") {
                cloneSet[id] = $(this).val();
            }
        }
    });
}

/**
 * Show settings error modal
 * @param {string} msg - message to show, can include html tags
 * @param {string} cat - settings category to reselect on close (or null)
 * @param {string} elID - element ID to focus on close (or null)
 * @param {string} type - type of message ("alert" or "error")
**/
function showSettingsError(msg, cat, elID, type) {
    const modal = document.getElementById("settingsErrorDialog");
    $("#settingsErrorMsg").html(msg);
        if (type) {
            if (type === "alert") {
                $("#settingsErrorTitle").text("Alert");
                $("#settingsErrorIconSvg").html(svgAlert);
            } else {
                $("#settingsErrorTitle").text("Error");
                $("#settingsErrorIconSvg").html(svgError);
            }
        }
    modal.showModal();

    // center message vertically
    let pH = $("#settingsErrorContent").height() - 108; // subtract header/button div
    let eh = $("#settingsErrorMsg").height();
    let space = (pH - eh) / 2;
    $("#settingsErrorMsg").css("margin-top", space + "px");

    $("#settingsErrorOkBtn").off("click");
    $("#settingsErrorOkBtn").on("click", function () {
        closeSettingsError();
        if (cat) {
            $("#posSettingsSelect").val(cat);
            $("#posSettingsSelect").trigger("change");
        }
        if (elID) {
            setTimeout(() => {
                $("#" + elID).focus();
            }, 100);
        }
    });
}

function closeSettingsError() {
    const modal = document.getElementById("settingsErrorDialog");
    modal.close();
}

function savePOSSettings() {
// user has clicked "Save" button
    // first save current form settings
    savePOSSettingsToCloneSet();

/* TODO: restore validations when multiple profiles are supported
    // need to check that profileName and either ALL or drawer nbrs have been entered
    if (cloneSet.posProfileName.trim() === "") {
        showSettingsError("<b>Profile Name cannot be blank.</b><br><i>Please enter a Profile Name.</i>", 
                          "1", "posProfileName", "alert");
        return

    }

    if (cloneSet.posProfileType !== "all" && cloneSet.profileDrawerNbrs.trim() === "") {
        showSettingsError("<b>When 'Applies To:' is not 'All',<br>Drawer Numbers cannot be blank.</b><br>" +
                          "<i>Please enter Drawer Numbers.</i>", 
                          "1", "profileDrawerNbrs", "alert");
        return;
    }

    // check for duplicate profile names
    let nameArray = $("#posSettings").data("existingProfiles") || [];
    if ( nameArray.includes(cloneSet.posProfileName.trim().toUpperCase()) ) {
        showSettingsError("<b>Profile Name already exists.</b><br><i>Please enter a unique Profile Name.</i>", 
                          "1", "posProfileName", "alert");
        return;
    }
*/
    // convert drawer nbr range to array
    let drawerNbrs = [];
/*
    if (cloneSet.posProfileType === "specific") {
        drawerNbrs = parseRangeString(cloneSet.profileDrawerNbrs);

        //----- check to see if any drawers are already assigned to another profile
        let assignedDrawers = $("#posSettings").data("drawerArray") || [];
        if (assignedDrawers.length > 0) {
            let conflictDrawers = [];
            $.each(drawerNbrs, function (index, drawerNbr) {
                if (assignedDrawers.includes(drawerNbr)) {
                    conflictDrawers.push(drawerNbr);
                }
            });
            if (conflictDrawers.length > 0) {
                showSettingsError( "The following drawer number(s) are<br>already assigned to another profile:<br>" +
                                    conflictDrawers.join(", ") +
                                    "<br><i>Please change the drawer number(s) and try again.</i>",
                                    "1", "profileDrawerNbrs", "alert" );
                return;
            }
        }
    }
*/
    // parse receiptBannerText
    console.log("savePOSSettings, receiptBannerText before parse:", cloneSet.receiptBannerText);
    if (cloneSet.receiptBannerText && typeof cloneSet.receiptBannerText === "string") {
        let lines = cloneSet.receiptBannerText.split("\n");
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].trim();
            if (lines[i].length > 0) {
                lines[i] = lines[i].substring(0, 40); // max 40
            }
        }
        cloneSet.receiptBannerText = lines;
        console.log("savePOSSettings, receiptBannerText after parse:", cloneSet.receiptBannerText);
    }

    // now send settings object to server to save
    $.post("savePOSSettingsProfile?", { posSettings: JSON.stringify(cloneSet), drawerNbrs: JSON.stringify(drawerNbrs) }, function (response) {
        if (response.result !== "success") {
            showSettingsError( "Failed to save POS settings:<br>" + response.msg, "1", null, "error" );
        } else {
            // copy cloneSet to pSet
            pSet = null;
            pSet = cloneSet;
        }
    })
    .fail( () => {
        showSettingsError( "Failed to save POS settings due<br>to a network or server error.", "1", null, "error" );
    })
    .always( () => {
        closePOSSettings();
    });
}

function closePOSSettings() {
    const modal = document.getElementById("posSettings");
    
    cloneSet = null;

    pSet.posProfileName = "";
    pSet.profileDrawerNbrs = "";

    $("#posSettings").data("drawerArray", []);
    $("#posSettings").data("existingProfiles", []);

    $("#posSettingsSelect").off("change");
    $(".encoreBody").css("overflow", "auto");
    $("#posSettingsForm").empty();
    modal.close();
    if (doDash) {
        $("#tab_dash").show();
    }
}

function showXpfLoadTable() {
    $.post("getSettingsFiles", function (reply) {
        const modal = document.getElementById("xpfLoadTableDialog");

        $("#xpfLoadTable tbody").empty();

        $.each(reply.settingsFiles, function (index, file) {
            const arr = file.split(/,\s*/);
            arr[0] = arr[0].replace("<b>", "");
            arr[0] = arr[0].replace("</b>", "");
            arr[1] = arr[1].replace("created: ", "");
            $("#xpfLoadTable tbody").append("<tr><td>" + arr[0] + "</td><td>" + arr[1]  + "</td></tr>");
        });

        modal.showModal();
        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
            }
        });
        $("#xpfLoadTable tbody tr").off("click");
        $("#xpfLoadTable tbody tr").on("click", function () {
            $(this).addClass("xpfFileSelected");
            $(this).children().addClass("xpfFileSelected");
            $("#xpfLoadTable tbody tr").not(this).removeClass("xpfFileSelected");
            $("#xpfLoadTable tbody tr").not(this).children().removeClass("xpfFileSelected");
        });
    });
}

function closeXpfLoadTable() {
    const modal = document.getElementById("xpfLoadTableDialog");
    modal.close();
}

function uploadXpfFile() {
    if ( !$("#xpfLoadTable tbody tr").hasClass("xpfFileSelected") ) {
        showSettingsError("<b>No file selected.</b><br><i>Please select a file to load.</i>", 
                          null, null, "alert");
        return;
    }
    
    const file = $("#xpfLoadTable tbody tr").filter(".xpfFileSelected").children("td:first").text();
    
    const modal = document.getElementById("mySpinner");
    modal.showModal();

    $.post("loadXPF?", {xpfFile: file}, function (response) {
        if (response.result === "success") {
            // Handle successful response
            modal.close();
            closeXpfLoadTable();
            let obj = response.settings;
            console.log("uploadXpfFile, loaded settings:", obj);
            pSet = obj;
            let obj2 = JSON.parse(JSON.stringify(obj));
            console.log("uploadXpfFile, cloned settings:", obj2);
        } else {
            modal.close();
            // Handle error response
        }
    })
    .fail( () => {
        modal.close();
    } );
}

function showCouponTypeTable() {
    const modal = document.getElementById("couponTypeTableDialog");
    
    $("#couponTypeTable tbody tr td:nth-child(2) input").val('');

    $.each(pSet.couponTypeArray, function (index, value) {
        $("#couponTypeTable tbody tr td:nth-child(2) input").eq(index).val(value);
    });

    modal.showModal();
    
    $("#couponTypeTable tbody tr:first-child td:first-child").focus();

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });
}

function saveCouponTypeTable() {
    cloneSet.couponTypeArray = [];

    $(".couponTypeTableInput").each(function () {
        let txt = $(this).val().trim();
        if (txt !== "") {
            cloneSet.couponTypeArray.push(txt);
        }
    });

    closeCouponTypeTable();
}

function closeCouponTypeTable() {
    const modal = document.getElementById("couponTypeTableDialog");
    modal.close();
}

function showChkCashTable() {
    const modal = document.getElementById("chkCashTableDialog");

    $("#chkCashTable tbody tr").each(function (index) {
        let arr = cloneSet.chkTableArray[index] || ["", "", ""];
        let autoNumericOptions = { emptyInputBehavior: 'focus', 
                                   digitGroupSeparator: '', 
                                   roundingMethod: 'C',
                                   decimalPlaces: 2,
                                   maximumValue: '999999.99',
                                   minimumValue: '-999999.99' };

        let $obj1 = $("#chkCashTable tbody tr td:nth-child(1) input").eq(index);
        let inp1 = $obj1[0];
        let an1 = new AutoNumeric(inp1, autoNumericOptions);

        autoNumericOptions.maximumValue = '99999.99';
        autoNumericOptions.minimumValue = '-99999.99';
        let $obj2 = $("#chkCashTable tbody tr td:nth-child(2) input").eq(index);
        let inp2 = $obj2[0];
        let an2 = new AutoNumeric(inp2, autoNumericOptions);

        autoNumericOptions.decimalPlaces = 3;
        autoNumericOptions.maximumValue = '99.999';
        autoNumericOptions.minimumValue = '-99.999';
        let $obj3 = $("#chkCashTable tbody tr td:nth-child(3) input").eq(index);
        let inp3 = $obj3[0];
        let an3 = new AutoNumeric(inp3, autoNumericOptions);
      
        an1.set(arr[0]);
        an2.set(arr[1]);
        an3.set(arr[2]);
    });

    modal.showModal();

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });
}

function saveChkCashTable() {
    cloneSet.chkTableArray = [];
    $("#chkCashTable tbody tr").each(function () {
        let $obj1 = $(this).find("td:nth-child(1) input");
        let inp1 = $obj1[0];
        let an1 = AutoNumeric.getAutoNumericElement(inp1);
        let amount = an1.getNumber();

        let $obj2 = $(this).find("td:nth-child(2) input");
        let inp2 = $obj2[0];
        let an2 = AutoNumeric.getAutoNumericElement(inp2);
        let flatFee = an2.getNumber();

        let $obj3 = $(this).find("td:nth-child(3) input");
        let inp3 = $obj3[0];
        let an3 = AutoNumeric.getAutoNumericElement(inp3);
        let percent = an3.getNumber();

        if (amount !== 0 && (flatFee !== 0 || percent !== 0)) {
            cloneSet.chkTableArray.push([amount, flatFee, percent]);
        }

        an1.remove();
        an2.remove();
        an3.remove();
    });

    closeChkCashTable(true);
}

function closeChkCashTable(fromSave = false) {
    if (!fromSave) {
        // remove autonumeric instances
        $("#chkCashTable tbody tr").each(function () {
            let $obj1 = $(this).find("td:nth-child(1) input");
            let inp1 = $obj1[0];
            let an1 = AutoNumeric.getAutoNumericElement(inp1);
            an1.remove();
            let $obj2 = $(this).find("td:nth-child(2) input");
            let inp2 = $obj2[0];
            let an2 = AutoNumeric.getAutoNumericElement(inp2);
            an2.remove();
            let $obj3 = $(this).find("td:nth-child(3) input");
            let inp3 = $obj3[0];
            let an3 = AutoNumeric.getAutoNumericElement(inp3);
            an3.remove();
        });
    }

    const modal = document.getElementById("chkCashTableDialog");
    modal.close();
}

function showNoSaleTable() {
    const modal = document.getElementById("noSaleTableDialog");
    
    $("#noSaleTable tbody tr td:nth-child(2) input").val('');

    $.each(pSet.noSaleReasons, function (index, value) {
        $("#noSaleTable tbody tr td:nth-child(2) input").eq(index).val(value);
    });

    modal.showModal();
    
    $("#noSaleTable tbody tr:first-child td:first-child").focus();

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });
}

function saveNoSaleTable() {
    cloneSet.noSaleReasons = [];
    $(".noSaleTableInput").each(function () {
        let txt = $(this).val().trim();
        if (txt !== "") {
            cloneSet.noSaleReasons.push(txt);
        }
    });
    closeNoSaleTable();
}

function closeNoSaleTable() {
    const modal = document.getElementById("noSaleTableDialog");
    modal.close();
}

function toggleARSettings(chkBox) {
    return; // for now AR settings are view only, so do nothing on click. Future: may want to allow enabling/disabling AR features from here
}

/**
 * Parses a string containing individual numbers and number ranges
 * separated by commas and dashes (e.g., "1,2-5,7,10-12")
 * into a single sorted array of integers.
 * @param {string} rangeStr The input string.
 * @returns {number[]} A sorted array of numbers.
 */
function parseRangeString(rangeStr) {
  const result = [];
console.log("parseRangeString, input:", rangeStr);

  // 1. Remove optional spaces and split the string by commas
  const parts = rangeStr.replace(/\s/g, '').split(',');

  for (const part of parts) {
    // Skip empty parts that might result from extra commas
    if (!part) continue;

    // 2. Check if the part contains a hyphen to indicate a range
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      // Validate the numbers and generate the range
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
      }
    } else {
      // 3. If no hyphen, it's a single number
      const num = parseInt(part, 10);
      if (!isNaN(num)) {
        result.push(num);
      }
    }
  }
  // 4. Sort the final array of numbers
  // Note: The intermediate numbers may not be in order depending on the input string order
  return result.sort((a, b) => a - b);
}

function showListsSubMenu() {
    $("#listSubMenu").stop(true, true).fadeIn(200);
}
function closeListsSubMenu() {
    $("#listSubMenu").stop(true, true).fadeOut(200);
}
function showUtilSubMenu() {
    $("#utilSubMenu").stop(true, true).fadeIn(200);
}
function closeUtilSubMenu() {
    $("#utilSubMenu").stop(true, true).fadeOut(200);
}
function showReptSubMenu() {
    $("#reptSubMenu").stop(true, true).fadeIn(200);
}
function closeReptSubMenu() {
    $("#reptSubMenu").stop(true, true).fadeOut(200);
}
function showSaved() {
    $("#tab_dash").hide();
    $("#tab_saved").show();
}

/**
 * Resizes an array to a new size, filling new elements with a default value if the array is expanded, or truncating if the array is reduced.
 * @param {array} arr The array to resize.
 * @param {number} newSize The new size of the array.
 * @param {*} defaultValue The default value to fill new elements with if the array is expanded.
 * @returns {array} The resized array.
 */
function aResize(arr, newSize, defaultValue = undefined) {
    while (arr.length < newSize) {
        arr.push(defaultValue);
    }
    arr.length = newSize; // Truncates if newSize is smaller
    return arr;
}

//----- temporary test, change for production
function sysSettings() {
    $.post("trySymbols", function(reply) {
        // Handle the reply here
        console.log("len:", reply.len, "aVars:", reply.vars);
    });
}

async function tryComPorts() {
	if ("serial" in navigator) {
		const ports = await navigator.serial.getPorts();
		console.log("ports:", ports);
	} else {
		console.log("No serial port support");
	}
}

async function tryUSBPorts() {
    if ("usb" in navigator) {
        navigator.usb.getDevices().then((devices) => {
            console.log(`Total devices: ${devices.length}`);
            devices.forEach((device) => {
                console.log(
                    `Product name: ${device.productName}, serial number ${device.serialNumber}`,
                );
            });
        });
    } else {
        console.log("No USB port support");
    }
}

