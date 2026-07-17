/*==========================================================================*\
|| ######################################################################## ||
|| # encorePOS 1.2.200.865                                                # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 posAdvisors, LLC       All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.posAdvisors.com | http://www.posAdvisors.com/license.html # ||
|| ######################################################################## ||
\*==========================================================================*/

var cVersion = "1.1.600"
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

// utility vars
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

// report vars
var DOHtable;
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
var dailyTable;
var dailyCashEditor;
var dailyNotesEditor;

// settings vars
var usersTable;
var userEditor;
var uploadTable;
var uploadLicenseEditor;
var storesTable;
var storesEditor;
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

function dashLoader() {

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
                    window.location.replace("remlogout?");
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
        ajax: "adminUserEdit?",
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

    // edit Upload Licenses
    uploadLicenseEditor = new $.fn.dataTable.Editor( {
        ajax: 'uploadLicenseEdit?',
        table: '#uploadstable',
        fields: [ {
                label: 'Serial Nbr:',
                name:  'serial',
                attr: {
                    maxlength:"7"
                }
            }, {
                label: 'Store Name:',
                name:  'store_name',
                attr: {
                    maxlength:"25"
                }
            }, {
                label:  'Expiry (yyyy-mm-dd):',
                name:   'expiry',
                type:   'date',
                def:    function () { return new Date(); },
                dateFormat: $.datepicker.ISO_8601
            }
        ]
    } );

    uploadLicenseEditor.on("open", function() { $("img.ui-datepicker-trigger").hide(); });

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
      
// get settings from passed cookies
    uid = getCookie("uid");
    userName = getCookie("user");
    userLast = getCookie("userLast");
    cSerNbr = getCookie("snbr");

    var cAutoLogout = getCookie("autoLogout");

    nAutoLogout = Math.max(15, Number(cAutoLogout));

    console.log('uid: ' + typeof uid + ':"' + uid + '"');
    console.log(cSerNbr);
    console.log(userName);
    console.log(userLast);
    console.log(nAutoLogout);

    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("uid", uid);

    } else {
        console.log("No Storage");
    };
    // end cookies

    if (!cSerNbr || cSerNbr.toUpperCase() != '3872COBBLER' || uid === "" || sLevel === "") {
        window.location.replace("remLogin.html");
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

    $("#autoLogout").val(nAutoLogout).change();
    $.post("verInfo?", "", function (data) {
        $("#verInfoSpan").html(data.prodVer);
        $('#newVerNbr').val(data.betaVer);
        $('#betaSerials').empty();
        $.each(data.serials, function(index, value) {
            $('#betaSerials').append($('<option>').text(value).val(value));
        });
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        var clickObj = event.target.id;
        if (!event.target.matches('#welcome') && !event.target.matches('.navUser img')) {
            $("#userDropdown").hide();
            $("nav").css('z-index', 999);
        };

        // stop and restart autoLogout timer
        lastActionTime = new Date().getTime();
        clearInterval(autoLogoutTimer);
        autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);
    }

    // Start autoLogout timer
    autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);

};
/* END DASHLOADER */

function autoLogout() {
    var x = new Date().getTime();
    if (x > lastActionTime + (nAutoLogout * 60000)) {
        window.location.replace("remLogout('auto')?");
    } else {
        autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);
    };
};

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function navUserDropdown() {
    var xEl = $(".navUser");
    var width = xEl.width();
    var xdd = document.getElementById("userDropdown");
    $("#userDropdown").width(60 + width);
    xdd.style.display = "block";
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
        var cTxt;
/*
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                console.log( data.aSet[idx][0], data.aSet[idx][1] )
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
        };

        $('#stationEditButton').prop('disabled', !$('#stationSetting').is(':checked') );

        $("#remoteSettings").toggle(doDash && sLevel === "0");
*/

        $("#userDropdown").hide();
        $("nav").toggle(false);
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

function softControl() {

    $.post("verInfo?", "", function (data) {
        $("#verInfoSpan").html(data.prodVer);
        $('#newVerNbr').val(data.betaVer);
        $('#betaSerials').empty();
        $.each(data.serials, function(index, value) {
            $('#betaSerials').append($('<option>').text(value).val(value));
        });
    });

    toggleSoftControl();

    $("#userDropdown").hide();
    $("#Modal_Settings").toggle(true);
    $("nav").toggle(false);
};

function toggleSoftControl() {
    var scope = $('input[name="releaseScope"]:radio:checked').val();

    if (!$('#newVerNbr').val().trim()) {
        $('input[name="releaseScope"]').attr("disabled", "disabled");
        $('#betaSerials').attr("disabled", "disabled");
        $('.imgSerials').hide();
        $('#addSerial').off('click');
        $('#deleteSerial').off('click');
        $("label[for='releaseAll']").css("color", "lightgray");
        $("label[for='releaseLtd']").css("color", "lightgray");
    } else {
        $('input[name="releaseScope"]').removeAttr("disabled");
        $("label[for='releaseAll']").css("color", "");
        $("label[for='releaseLtd']").css("color", "");
        if (scope==='2') {
            $('#betaSerials').removeAttr("disabled");
            $('#addSerial').on('click', addSerial);
            $('#deleteSerial').on('click', deleteSerial);
            $('.imgSerials').show();
        } else {
            $('#betaSerials').attr("disabled", "disabled");
            $('.imgSerials').hide();
        }
    }
}

function closeSoftControl() {
    $('input[type="range"]:eq(0)').val(nUpdate).change();
    $('input[type="range"]:eq(1)').val(nAutoLogout).change();

    $('#newVerNbr').css({ border: '' });

    $("#Modal_Settings_Body").scrollTop(0);
    $("#Modal_Settings").hide();
    $("nav").toggle(true);
};

function saveSoftControl() {
    var aSerials = $.map($('#betaSerials option'), function(e) { return $(e).text().trim(); });
    var newVer = $('#newVerNbr').val().trim();
    var scope = $('input[name="releaseScope"]:radio:checked').val();

    if (!newVer) {
        // is empty or whitespace
        swal( 'Oops!', 'Please enter a release number.', 'error');
        $('#newVerNbr').css({ border: '1px solid red' });
        $('#newVerNbr').focus();
        return;
    } else {
        $('#newVerNbr').css({ border: '' });
        if (scope==='2' && aSerials.length===0) {
            swal( 'Oops!', 'Please add at least 1 serial nbr.', 'error');
            $('#betaSerials').css({ border: '1px solid red' });
            return;
        } else {
            $('#betaSerials').css({ border: '' });
        }
    }

    $.post("saveSoftControl?", { newVer: newVer, cScope: scope, aSerials: JSON.stringify(aSerials) })
        .success(function (data) {
            if (data.result === 'success') {
                swal({
                    title: "Success!",
                    text: "Your changes have been saved.",
                    showCancelButton: false,
                    closeOnConfirm: false,
                },
                function(){
                    swal.close();
                    $("#Modal_Settings_Body").scrollTop(0);
                    $("#Modal_Settings").hide();
                    $("nav").toggle(true);
                });
            } else {
                swal('Oops!', data.msg, 'error');
            }
        })
        .fail(function () {
            swal('Oops!', 'Could not save data', 'error');
        });
};

function addSerial() {
    swal({
        title: "Add Serial Nbr",
        text: "Enter the new serial for release:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "POS Serial Nbr"
      },
      function(inputValue){
        if (inputValue === false) return false;
        
        if (inputValue === "") {
          swal.showInputError("You need to enter a value!");
          return false
        }
        
        swal.close();
        $('#betaSerials').append($('<option>', {value: inputValue, text: inputValue}));
      });
};

function deleteSerial() {
    var cSerial = $('#betaSerials').val();
    if ( cSerial ) {
        $("#betaSerials option[value='" + cSerial + "']").remove();
    };
};

function fileMaintenance() {
    $("#fileMaintenancePrompt").show();
    $.post("fileMaintenance?", "")
        .always(function () {
            $("#fileMaintenancePrompt").hide();
            swal('Complete', 'The process has completed.', 'success');
        });
};

function getAlerts() {
    $.post("getAlerts?", "", function (obj) {
        var ctxt = obj.alertText;

        $(document.body).append(ctxt);
        $("#Modal_Alerts").show();
    })
        .fail(function (jqXHR, textStatus, error) {
            console.log("Post error: " + error);
            //swal( 'Oops!', 'Could not get alerts from server!', 'error' );
        });
};

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

function uploadClose() {
    uploadTable.clear().destroy(false);
    $("#Modal_Uploads").hide();
    // $("#userDropdown").show();
    $("nav").toggle(true);
}

function showUploadTable() {
    var aPageLen = [10, 20, 30, 50, 100];
    var nLen = localStorage.getItem("uploadLength");
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

    uploadTable = $('#uploadstable').DataTable({
        dom: 'Bfrtlip',
        lengthChange: true,
        lengthMenu: aPageLen,
        pageLength: nLen,
        ajax: 'uploadLicenses?',
        columns: [
            { data: 'serial' },
            { data: 'store_name' },
            { data: 'expiry', render: $.fn.dataTable.render.moment( 'M/D/YYYY' ) }
        ],
        select: {
            style: 'single'
        },
        buttons: [
            { extend: 'create', editor: uploadLicenseEditor },
            { extend: 'edit', editor: uploadLicenseEditor },
            {
                extend: "remove",
                editor: uploadLicenseEditor,
                formMessage: function (e, dt) {
                    var rows = dt.rows(e.modifier()).data().pluck('serial');
                    return 'Are you sure you want to delete the store: ' + rows[0] + '?';
                }
            }
        ]
    });

    $('#uploadstable').off('length.dt');
    $('#uploadstable').on('length.dt', function (e, settings, len) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("uploadLength", len);
        }
    });

    $("#userDropdown").hide();
    $("nav").toggle(false);
    $("#Modal_Uploads").show();
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
            { data: "name" }
        ],
        columnDefs: [
            { orderable: false, targets: [1, 2] }
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
            if (data !== undefined && data.order === '1') {
                storesEditor.field('serial').disable();
                storesEditor.field('serial').message('Host serial nbr can not be edited.');
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
                    $('#multiStoreSet_Say').text($('#multiStoreSet_Say').text().replace('OFF', 'ON'));
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
                text: 'Refresh',
                action: function () {
                    $.spin(true);
                    stationsTable.ajax.url( 'stationsRefresh?' ).load();
                    $.spin(false);
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
//////
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    var className = item.getAttribute("class");
    var oldSelection = document.getElementsByClassName("navcurrent")[0];
    if (className == "navother") {
        item.className = "navcurrent";
        oldSelection.className = "navother";
        if (item.innerHTML === "Reports") {
            $("#tab_dash").toggle(false);
            $("#tab_util").toggle(false);
            $("#tab_rept").toggle(true);

        } else if (item.innerHTML === "Dashboard") {
            $("#tab_util").toggle(false);
            $("#tab_rept").toggle(false);
            $("#tab_dash").toggle(true);
            updateTDSales("FALSE");
            //            updateEXLog();

        } else if (item.innerHTML === "Utilities") {
            $("#tab_dash").toggle(false);
            $("#tab_rept").toggle(false);
            $("#tab_util").toggle(true);

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
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();

    return (curr_month + "-" + curr_date + "-" + curr_year);
}

function notAvailable() {
    swal("Sorry, not available :(", "The function you have selected is coming soon!", "info");
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

function settingsToggle( theSpan, theDiv ) {
    var cTxt = $(theSpan).text();
    if (cTxt==='►') {
        $('#'+theDiv).toggle(true);
        $(theSpan).text('▼');
    } else {
        $('#'+theDiv).toggle(false);
        $(theSpan).text('►');
    }
}

