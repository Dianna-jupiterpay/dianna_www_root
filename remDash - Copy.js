/*==========================================================================*\
|| ######################################################################## ||
|| # encorePOS 1.1.600                                                    # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2018 posAdvisors, LLC       All Rights Reserved.     # ||
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
var dailyTable;
var dailyCashEditor;
var dailyNotesEditor;

// settings vars
var usersTable;
var userEditor;
var cSerNbr;
var cExpDate;
var cProcTime;
var userName;
var userLast;
var sLevel;
var doDash;
var nUpdate;
var nAutoLogout;
var cSerVer;
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
        if (xhr.status === 401) {
            swal({
                title: 'Error',
                text: xhr.responseText,
                type: 'error'
            },
                function () {
                    window.location.replace("remLogout?");
                });
        } else if (xhr.status !== 200) {
            swal({
                title: 'Oops!',
                text: 'Could not load data',
                type: 'error'
            },
                function () {
                    $(".fqmodal").hide();
                    $(".modal").hide();
                    $(".except-modal").hide();
                });
        }
    });

    // BEGIN daily summary editor
    dailyCashEditor = new $.fn.dataTable.Editor({
        ajax: "remDailyCashEditor?",
        table: "#dailyTable",
        idSrc: "DT_RowId",
        formOptions: {
            inline: {
                submit: 'allIfChanged'
            }
        },
        fields: [{ label: "Actual Cash:", name: "act_cash" }]
    });

    dailyNoteEditor = new $.fn.dataTable.Editor({
        ajax: "remDailyNoteEditor?",
        table: "#dailyTable",
        idSrc: "DT_RowId",
        fields: [{ type: "textarea", label: "Notes:", name: "notes" }]
    });
    // END daily summary editor

    // get settings from passed cookies
    uid = getCookie("uid");
    userName = getCookie("user");
    userLast = getCookie("userLast");
    sLevel = getCookie("sLevel");
    cSerNbr = getCookie("snbr");
    cExpDate = getCookie("doe");
    cSerVer = getCookie("cVer");

    var cUpdate = getCookie("updateTime");
    var cAutoLogout = getCookie("autoLogout");

    nUpdate = Math.max(3, Number(cUpdate));
    nAutoLogout = Math.max(15, Number(cAutoLogout));
    // end cookies

    if (uid === "" && sLevel === "") {
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

    //------ check if remote is set for the Hourly Report...
    var xCompare = VersionCompare.compare(cSerVer, '1.1.522');  // in version_compare.js
    if (xCompare < 0) {
        // if xCompare is -1 we are on an older version, so turn off option
        $('#hourlyLink').toggle(false);
    }

    //get alerts
    $.post("remAlertCheck?", "", function (data) {
        if (data.alerts.length > 0) {
            $("#userImage").attr("src", "images/alert.png");
            $("#welcome").css("color", "#ff0000");
            if (data.alerts.length > 1) {
                $("#welcome").text("You have alerts!");
            } else {
                $("#welcome").text(data[0]);
            };
            $("#userDropdown").append('<a href="#" style="color: #ff0000;" onclick="getAlerts()">View Alerts</a>');
            lAlertShown = true;
        };
    });

    // hide More buttons
    //$("#dailyLink").toggle(false);
    //$("#More_TD").toggle(false);
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
        ctx.drawImage(dollar, 55, 54, 64, 64);
    }

    var customers = document.createElement('img');
    customers.src = './images/customers.png';
    customers.onload = function () {
        var c = document.getElementById('Today');
        var ctx = c.getContext('2d');
        ctx.drawImage(customers, 55, 133, 64, 64);
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
    $("#dailyLink").click(function () {
        $("nav").css('z-index', -1);
        showDailyReport();
    });
    $("#hourlyLink").click(function () {
        showHourlyTable();
    });
    $("#More_TD").click(function () {
        $("nav").css('z-index', -1);
        $("#Modal_TD").show();
        updateTDSales('FALSE');
    });
    $("#More_Y2Y").click(function () {
        $("nav").css('z-index', -1);
        $("#Modal_Y2Y").show();
    });
    $("#More_Except").click(function () {
        $("nav").css('z-index', -1);
        showExceptTable();
    });
    $("#More_Dept").click(function () {
        $("nav").css('z-index', -1);
        showTypTable();
    });
    $("#More_Top").click(function () {
        $("nav").css('z-index', -1);
        showTopTable();
    });
    $("#More_Inv").click(function () {
        $("nav").css('z-index', -1);
        showInvTable();
    });

    // When the user clicks on <span> (x), close the modal
    $("#Modal_Hourly_Close").click(function () {
        HourlyTable.clear().destroy(false);
        $("#Modal_Hourly").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_TD_close").click(function () {
        $("#Modal_TD").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Y2Y_close").click(function () {
        $("#Modal_Y2Y").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Except_close").click(function () {
        exceptTable.clear().destroy(false);
        $("#Modal_Except").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Typ_close").click(function () {
        typTable.clear().destroy(false);
        $("#Modal_Typ").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Top_close").click(function () {
        topTable.clear().destroy(false);
        $("#Modal_Top").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Inv_close").click(function () {
        invTable.clear().destroy(false);
        $("#Modal_Inv").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_Users_close").click(function () {
        usersTable.clear().destroy(false);
        $("#Modal_Users").hide();
        $("nav").css('z-index', 999);
    });
    $("#Modal_custList_close").click(function () {
        closeCustListModal();
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
    $("#Modal_promoList_close").click(function () {
        closePromoListModal();
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        var clickObj = event.target.id;
        if (clickObj === "Modal_TD") {
            $("#Modal_TD").hide();
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
        } else if (!event.target.matches('#welcome') && !event.target.matches('.navUser img')) {
            $("#userDropdown").hide();
            $("nav").css('z-index', 999);
        };

        // stop and restart autoLogout timer
        lastActionTime = new Date().getTime();
        clearInterval(autoLogoutTimer);
        autoLogoutTimer = setTimeout(autoLogout, nAutoLogout * 60000);

    }

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

    // set intervals
    setTimeout(function () { updateTDSales("FALSE") }, nUpdate * 60000);
    //    setTimeout(updateEXLog, nUpdate*60000);

    document.addEventListener("visibilitychange", function () {
        var x = new Date().getTime();
        if (doDash && x > lastUpdateTime + (nUpdate * 60000)) {
            updateTDSales('FALSE');
        }
    });

};
/* END DASHLOADER */

function updateTDSales(cFirst) {
    var tab = $('#tab_dash');
    var lRun = true; // tab.is(':visible');
    var url = "remUpdateTodaysSales('','" + cFirst + "')";

    // Now run always. Was -- don't run if dash tab isn't visible 2017/08/29
    if (lRun) {
        $.post(url, "", function (data) {
            TDSalesDecode(data);
            EXLogDecode(data);
            if (cFirst === 'TRUE') {
                y2yPanelBuild(data);
                invPanelBuild(data);
            }
        })
            .fail(function (response) {
                swal({
                    title: 'Error',
                    text: response.responseText,
                    type: 'error'
                },
                    function () {
                        window.location.replace("remLogout?");
                    });
            });
    };
}

function updateEXLog() {
    var xmlhttp = new XMLHttpRequest();
    var tab = $('#tab_dash');
    var lRun = tab.is(':visible');
    var url = "remUpdateExceptions?";

    if (lRun) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.status == 401) {
                window.location.replace("remLogout?");
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
    var x = new Date().getTime();
    if (x > lastActionTime + (nAutoLogout * 60000)) {
        window.location.replace("remLogout('auto')?");
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

    lastUpdateTime = new Date().getTime();

    if (TDloadergone === 0) {
        tdWaitDols.kill();
        tdWaitCusts.kill();
        //document.getElementById("More_TD").style.visibility = "visible";
        //$("#dailyLink").toggle( true );
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
    tdctx.fillRect(140, 60, 252, 50);

    tdctx.fillStyle = "#000000";
    tdctx.textAlign = "left";
    tdctx.font = "300 30px Verdana";
    tdctx.fillText(numberWithCommas(tdSales), 140, 100);

    tdctx.fillStyle = "#FFFFFF";
    tdctx.fillRect(140, 138, 252, 50);

    tdctx.fillStyle = "#000000";
    tdctx.textAlign = "left";
    tdctx.font = "300 30px Verdana";
    tdctx.fillText(numberWithCommas(tdCusts), 140, 178);

    if (obj.dayAgoMonth) {
        tdctx.fillStyle = "#FFFFFF";
        tdctx.fillRect(40, 244, 332, 55);

        tdCalendar(tdctx, 64, 204, 50, 50, 10);

        tdctx.fillStyle = "#fff";
        tdctx.textAlign = "center";
        tdctx.font = "bold 12px arial";
        tdctx.fillText(obj.dayAgoMonth, 89, 218);

        tdctx.fillStyle = "#000";
        tdctx.textAlign = "center";
        tdctx.font = "400 30px arial";
        tdctx.fillText(obj.dayAgoDate, 89, 248);

        tdctx.fillStyle = "#808080";
        tdctx.textAlign = "left";
        tdctx.font = "400 24px Tahoma";
        tdctx.fillText(obj.dayAgoSales + ' / ' + obj.dayAgoCusts, 142, 241);

    } else if (obj.dayAgoDate) {
        tdctx.fillStyle = "#32adfc";
        tdctx.textAlign = "center";
        tdctx.font = "400 32px Tahoma";
        tdctx.fillText(obj.dayAgoDate, 87, 244);

        tdctx.fillStyle = "#808080";
        tdctx.textAlign = "left";
        tdctx.font = "400 32px Tahoma";
        tdctx.fillText(obj.dayAgoSales + ' / ' + obj.dayAgoCusts, 140, 244);
    }

    if (Object.keys(obj).length > 3) {
        var nLen = obj.tenders.length;

        $("#sales-dols").text(numberWithCommas(tdSales));
        $("#invoice-qty").text(numberWithCommas(tdCusts));
        $("#TD_hdr").text("Today's Sales as of " + tdD.toLocaleDateString() + "  " + tdD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        $("#tax-dols").text(numberWithCommas(obj.tax));
        $("#cpn-lbl").text('Coupons (' + numberWithCommas(obj.cpnQty) + ')');
        $("#cpn-dols").text(numberWithCommas(obj.cpnDols));
        $("#payment-lbl").text('Payments on Account (' + numberWithCommas(obj.poaQty) + ')');
        $("#payment-dols").text(numberWithCommas(obj.poaDols));
        $("#discount-dols").text(numberWithCommas(obj.disc));
        $("#cost-dols").text(numberWithCommas(obj.cost));
        $("#profit-dols").text(numberWithCommas((Number(obj.dollars) - Number(obj.cost)).toFixed(2)));

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
        tmctx.fillRect(15, 64, 375, 240);

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

        //$("#More_TD").toggle(true);

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
    exctx.fillRect(140, 240, 252, 35);

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

    $("#Modal_Except").spin("modal");

    exceptTable = $('#excepttable').DataTable({
        responsive: true,
        dom: 'Bfrtilp',
        buttons: [
            {
                extend: 'pdf',
                orientation: 'landscape',
            },
            {
                extend: 'print',
                orientation: 'landscape',
            },
        ],
        ajax: "remExceptTable()",
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
                var dD = new Date();
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
            tooltips: {
                bodyFontSize: 14,
                callbacks: {
                    label: function (tooltipItem, data) {
                        return obj.deptLbls[tooltipItem.index] + '  $' + formatMoney(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
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
                orientation: 'landscape',
                title: 'Product Type Sales ' + todayString(),
                header: true,
            },
            {
                extend: 'print',
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
                }
            }
        ],
        ajax: 'remTypesSoldTable?',
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
                orientation: 'landscape',
                title: 'Items Sold ' + todayString(),
                header: true,
            },
            {
                extend: 'print',
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
                }
            }
        ],
        ajax: 'remItemsSoldTable?',
        columns: [
            { "width": "20%" },
            { "width": "20%" },
            { "width": "10%" },
            { "width": "20%" },
            { "width": "15%" },
            { "width": "15%" }
        ],
        columnDefs: [
            { type: 'num-fmt', targets: [4, 5] },
            { className: 'numericCol', targets: [4, 5] }
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
    var url = "remY2YData?";

    // don't run if dash tab isn't visible
    if (lRun) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var y2yData = JSON.parse(xmlhttp.responseText);
                y2yPanelBuild(y2yData);
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

    /* Chart Data for Modal_Y2Y Window */
    var barData = {
        labels: obj.months,
        datasets: [
            {
                label: cYearAgo,
                backgroundColor: "#4586A9",
                borderColor: "#4586A9",
                data: obj.dataAgo
            },
            {
                label: cYearNow,
                backgroundColor: "#4148B6",
                borderColor: "#4148B6",
                data: obj.dataNow
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
                text: 'Year over Year',
                fontSize: 20,
                fontColor: "#000000"
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
    var url = "remInvPosition?";

    // don't run if dash tab isn't visible
    if (lRun) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var invData = JSON.parse(xmlhttp.responseText);
                invPanelBuild(invData);
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
    ctx.fillText("Value: $ " + numberWithCommas(oData.invDollars), 120, 110);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "300 22px Verdana";
    ctx.fillText("Days on Hand: " + numberWithCommas(oData.invDays), 120, 198);

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
                orientation: 'landscape',
                title: 'Inventory Value ' + todayString(),
                header: true,
            },
            {
                extend: 'print',
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
// BEGIN daily report
function showDailyReport(param) {

    $("#daily_hdr").toggle(false);
    $("#dailytablewrapper").toggle(false);

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

    dailyRetrieveSettings(param);

}

function getDailyPeriods(cSel) {
    $.post("remDailyGetPeriods?",
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
    $.post("remDailyGetSettings?", "", function (data) {
        $.each(data.aSet, function (idx, item) {
            if (data.aSet[idx][1] !== '?') {
                $(data.aSet[idx][0]).prop("checked", data.aSet[idx][1]);
            }
        });

        $("#dailyEmailAddy").val(data.cAddy);
        $("#dailyDivTitle").text(data.deptToggle);

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
        $("#Modal_Daily").toggle(true);
        $("#tab_rept").toggle(false);
    })
        .fail(function (jqXHR, textStatus, error) {
            console.log("dailyGetSettings error: " + error);
            swal('Oops!', 'Could not get settings from server!', 'error');
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

        $.post("remDailySaveSettings?", {
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

function closeDaily(param) {
    var wait = $('#daily_waitp');
    var isVisible = wait.is(':visible');

    $('#daily_select').toggle(true);

    $("#daily_box").find('*').prop("disabled", false);
    $("#daily_box2").find('*').prop("disabled", false);

    if (!isVisible) {
        dailyTable.clear().destroy(false);
        $("#daily_hdr").toggle(false);
        $("#dailyTableDiv").css("top", "");
        $("#dailytablewrapper").toggle(false);
        $("#dailyDivTitle").toggle(false);
        $('#dailyHdrRow th:nth-child(n+29)').remove();

        $('#daily_waitp').toggle(true);
    };

    $("#daily_submit").toggle(true);

    $("#daily_startDate").prop("disabled", false);
    $("#daily_endDate").prop("disabled", false);
    $("#daily_submit").prop("disabled", false);

    if (!param) {
        $("nav").css('z-index', 999);
        $("#Modal_Daily").toggle(false);
        $("#tab_rept").toggle(true);
    } else {
        showDailyReport(true);
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

function getDailyReport() {
    var ntimes = 0;

    $("#daily_waitp").html('<img src="images/spinner.gif" alt="Procesing..." style="width:128px;height:128px;" />');

    $('#daily_select').toggle(false);

    $.post("remDailyGetReport?",
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
            var tbl = $('#dailyTable');
            var nDept = data.aDept.length;
            var aNumCols = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
            var aDeptCols = [];
            var cDepTog = $("#dailyDivTitle").text();
            var lDeptVis = (cDepTog === 'HIDE');
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

            if (lDeptVis) {
                cDepTog = 'Hide Depts'
            } else {
                cDepTog = 'Show Depts'
            }

            var cDept;
            for (i = 0; i < nDept; i++) {
                $("#dailyHdrRow").append("<th>" + data.aDept[i] + "</th>");
                nCol = 28 + i;
                aNumCols.push(nCol);
                aDeptCols.push(nCol);
                cDept = 'Dept_' + parseInt(i + 1);
                colArray.push({ data: cDept });
            }
            $("#dailyHdrRow").append("<th>Notes</th>");
            $("#dailyHdrRow").append("<th>DT_RowId</th>");
            colArray.push({ data: "notes" });
            colArray.push({ data: "DT_RowId" });

            for (i = 0; i < colArray.length - 2; i++) {
                excelArray[i] = i + 1;
            }

            dailyTable = $('#dailyTable').DataTable({
                ordering: false,
                "scrollX": "200%",
                "scrollXInner": "110%",
                dom: 'Brt',
                lengthChange: false,
                pageLength: 42,
                buttons: [{
                    extend: 'excel',
                    filename: 'Daily Summary ' + dateWithDashes(d),
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
                    orientation: 'landscape',
                    exportOptions: {
                        columns: excelArray
                    },
                    title: 'Daily Summary ' + data.title,
                    customize: function (window) {
                        var nVcols;
                        var nColAdj = 0;
                        var visCol = dailyTable.columns().visible();
                        var nRows = dailyTable.rows().count();

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
                    }

                },
                {
                    text: 'Close',
                    action: function (e, dt, node, config) {
                        closeDaily(true);
                    }
                },
                {
                    extend: 'colvis',
                    text: 'Toggle Columns',
                    columns: aNumCols
                },
                {
                    text: cDepTog,
                    action: function (e, dt, node, config) {
                        var cText = this.text();
                        if (cText === 'Hide Depts') {
                            for (var i = 0; i < nDept; i++) {
                                dailyTable.column(28 + i).visible(false, true);
                            }
                            dailyTable.columns.adjust().draw(false);
                            this.text('Show Depts')
                        } else {
                            for (var i = 0; i < nDept; i++) {
                                dailyTable.column(28 + i).visible(true, true);
                            }
                            dailyTable.columns.adjust().draw(false);
                            this.text('Hide Depts')
                        }
                        $.post("remDailyDeptToggleSetting?", { cText: this.text() })
                    }
                }
                ],
                data: data.data,
                columns: colArray,
                columnDefs: [
                    { type: 'num-fmt', targets: aNumCols },
                    { className: 'numericCol', targets: aNumCols },
                    { className: 'iconCell', targets: [0] },
                    { visible: lDeptVis, targets: aDeptCols },
                    { targets: [28 + nDept, 29 + nDept], visible: false, searchable: false, orderable: false }
                ],
                order: [[29 + nDept, 'asc']],
                select: { style: 'single' },
                "rowCallback": function (row, data, index) {
                    if (data.date === '**WEEK**' || data.date === '**PERIOD**' || data.date === '**MONTH**') {
                        $('td', row).css({ "background-color": "MediumAquaMarine", "color": "black" });
                    } else {
                        $('td:eq(12)', row).css({
                            "background-color": "yellow",
                            "font-weight": "bolder"
                        });
                    }
                },
                "fnDrawCallback": function () {
                    var str = data.title
                    $("#dailyDivTitle").html("Daily Summary<br><span style='font-size: 14px;'>" +
                        str + "</span>")
                    $("#daily_waitp").toggle(false);
                    $("#daily_waitp").text("Data View");
                    $("#daily_hdr").toggle(true);
                    $("#dailytablewrapper").toggle(true);
                    $("#dailyDivTitle").toggle(true);
                    $("#dailyTable_wrapper .dt-buttons")
                        .contents()
                        .filter(function (index) {
                            return index === 2;
                        })
                        .css("color", "#FF0000");
                    $('td').each(function () {
                        if (($(this).index() == 4 || $(this).index() == 13) && parseFloat($(this).text().replace(/,/g, '')) < 0) {
                            $(this).css('color', 'red');
                        }
                    });
                }
            });

            // Activate an inline edit on click of actual cash cells
            dailyTable.on('click', 'tbody tr td', function (e, dt, type, indexes) {
                var myRow = this.parentNode;
                var cellText = $(this).parent().find(':nth-child(2)').text();
                var cell = $(this);
                if ($(this).index() == 12 && cellText != '**WEEK**' && cellText != '**PERIOD**' && cellText != '**MONTH**') {
                    cell.css('background-color', 'white');
                    dailyCashEditor.inline(this, { onBlur: 'submit' });
                    dailyCashEditor.on('preSubmit', function (e, data) {
                        data.rowData = dailyTable.row(myRow).data();
                    });
                    dailyCashEditor.on('postEdit', function () {
                        $.post("remDailyGetReport?",
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
                                dailyTable.clear().draw();
                                dailyTable.rows.add(newData.data); // Add new data
                                dailyTable.columns.adjust().draw();  // Redraw the DataTable                            
                            });
                    });
                    dailyCashEditor.on('preClose', function () {
                        cell.css('background-color', 'yellow');
                    });
                } else if ($(this).index() == 0 && cellText != '**WEEK**' && cellText != '**PERIOD**' && cellText != '**MONTH**') {
                    dailyNoteEditor.edit($(this).closest('tr'), { title: 'Notes for ' + cellText, buttons: 'Update' });
                    dailyNoteEditor.on('preSubmit', function (e, data) {
                        data.rowData = dailyTable.row(myRow).data();
                    });
                }
            });
        }
    )
        .fail(function (response) {
            swal({
                title: 'Error',
                text: response.responseText,
                type: 'error'
            });
            $("#daily_waitp").text("Data View");
            $('#daily_select').toggle(true);
        });
}
// END daily report

/*
 * BEGIN Hourly Report Stuff
 */
function setInitialHourly(obj) {
    obj._initValue = obj.value;
}

function showHourlyTable(cPeriod) {
    var x = document.getElementById("Modal_Hourly");
    var ntimes = 0;
    var dD = new Date();
    var json;

    $("#Modal_Hourly").spin("modal");

    if (!cPeriod) {
        cPeriod = 'today';
    }

    HourlyTable = $('#HourlyTable').DataTable({
        responsive: true,
        dom: 'Brt',
        pageLength: 25,
        buttons: [
            {
                extend: 'print',
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

                    $(window.document.body).find('table')
                        .addClass('compact')
                        .css({ "font-size": "inherit", "width": "80%", "margin": "auto" });

                    window.print();
                    window.close();
                }
            },
        ],
        ajax: "remTodayHourlySales('', '" + cPeriod + "')",
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
    var cTitleText = $('#hourlySelect option:selected').text();
    var cPeriod = $('#hourlySelect option:selected').val();

    HourlyTable.clear().destroy(false);

    showHourlyTable(cPeriod);
}
/*
 * END Hourly Report Stuff
 */

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
            updateTDSales('FALSE');
            //            updateEXLog();

        } else if (item.innerHTML === "Utilities") {
            $("#tab_dash").toggle(false);
            $("#tab_rept").toggle(false);
            $("#tab_util").toggle(true);

        }
    }
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function navUserDropdown() {
    var xEl = $(".navUser");
    var width = xEl.width();
    var xdd = document.getElementById("userDropdown");
    $("#userDropdown").width(60 + width);
    xdd.style.display = "block";
}

function navbarRespond(obj) {
    var x = document.getElementById("pAnavbar");
    if (x.className === "navbar") {
        x.className += " responsive";
    } else {
        x.className = "navbar";
    }
}

function getAlerts() {
    $.post("remGetAlerts?", "", function (obj) {
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
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
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