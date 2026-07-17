/*==========================================================================*\
|| ######################################################################## ||
|| # encorePOS 1.3.100.105                                                # ||
|| # posLib.js                                                            # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
\*==========================================================================*/

var cVersion = getVersionNumber();

function btnSecureCheck(event, btn) {
    event.stopPropagation();

    let cID = event.target.id;
    let twoFer = "T";
    let thrFer = "TT";

    if (isEmpty(cID)) {
        cID = btn.id;
    }

    console.log("In btnSecureCheck, element ID:", cID);

    switch (cID) {
        case "helpBtn":
            doNothing();

        case "logoutBtn":
            secureCheck("ZWSF2", "logOut");
            break;

        case "itemListBtn":
            secureCheck("", "showItemList");
            break;

        case "voidBtn":
            secureCheck("ZWSF4", "clearAll");
            break;

        case "deleteBtn":
            secureCheck("ZWSF5", "F5Delete");
            break;

        case "editBtn":
            secureCheck("ZWSF6", "F6Edit");
            break;

        case "discBtn":
            secureCheck("ZWSF7", "F7Disc");
            break;

        case "custListBtn":
            secureCheck("ZWSF8", "showCustList");
            break;

        case "tenderBtn":
            secureCheck("", "tenderSale");
            break;

        case "caseBtn":
            secureCheck("", "F10CaseSale");
            break;

        case "atCaseBtn":
            secureCheck("", "atCase");
            break;

        case "refundBtn":
            secureCheck("ZWSRF", "itemReturnDialog");
            break;

        case "qLine1":
            secureCheck("ZWSQD", "discQwikKey", 'Q');
            break;

        case "qLine2":
            secureCheck("ZWSQD", "discQwikKey", 'W');
            break;

        case "qAll1":
            secureCheck("ZWSQD", "discQwikKey", 'A');
            break;

        case "qAll2":
            secureCheck("ZWSQD", "discQwikKey", 'Z');
            break;

        case "miscBtn":
            secureCheck("ZWSM1", "miscSale");
            break;

        case "reprintBtn":
            secureCheck("ZWSR_", "showReprintReceipt");
            break;

        case "licenseBtn":
            secureCheck("", "doNothing");
            break;

        case "couponBtn":
            secureCheck("", "get_item", 'N');
            break;

        case "depositBtn":
            secureCheck("ZWSD_", "doDeposit");
            break;

        case "lottoBtn":
            secureCheck("", "doLotto");
            break;

        case "exemptBtn":
            secureCheck("ZWSTX", "makeExempt");
            break;

        case "cashChkBtn":
            secureCheck("ZWSCC", "doCashChk");
            break;

        case "paymentBtn":
            secureCheck("", "doPayment");
            break;

        case "pendingBtn":
            secureCheck("ZWSPT", "doPending");
            break;

        case "custHistBttn":
            secureCheck("", "doNothing");
            break;

        case "deliveryBtn":
            secureCheck("ZWSDE", "doNothing");
            break;

        case "giftCertBtn":
            secureCheck("", "showGiftCard");
            break;

        case "saleNoteBtn":
            secureCheck("", "saleNote");
            break;

        case "freqRebateBtn":
            secureCheck("ZWSFQ", "doNothing");
            break;

        case "freqCouponBtn":
            secureCheck("ZWSFC", "doNothing");
            break;

        case "barBtn":
            secureCheck("", "doNothing");
            break;

        case "expenseBtn":
            secureCheck("ZWSE_", "doExpense");
            break;

        case "timeClockBtn":
            secureCheck("", "doNothing");
            break;

        case "popBtn":
            secureCheck("ZWSEX", "showPopItemDo");
            break;

        case "closeDrawerBtn":
            secureCheck("", "showDrawerClose");
            break;

        case "twoFerBtn":
            doFerLine(twoFer);
            break;

        case "thrFerBtn":
            doFerLine(thrFer);
            break;

        case "openDrawerBtn":
            secureCheck("ZWSC_", "openCashDrawer");
        }
    }

function secureCheck(cFunc, callback, param) {
    let uid = getCookie('uid');
    let SID = getCookie('_SID');

    if (cFunc==="ZWSEX") {
        console.log( "cmPop Click" );
    }

    if (cFunc === "") {
        if (callback!=="") {
            eval( callback + "(" + param + ")" );
        }
        return true;
    }

    console.log('uid: ' + uid + ', SID: ' + SID + ', func: ' + cFunc);

    $.post("ChkPoint?", { user: uid, session: SID, func: cFunc }, function (reply) {
        if (reply.result === 'success') {
            console.log( "result = success, callback: '"+callback+"'");
            console.log("callback!=='' is", callback!=="");
            if (callback!=="") {
                eval( callback + "('" + param + "')" );
            }
            return true;
        } else {
            //---- stash path for potential override
            $("#securityOverrideOK").attr("data-func", cFunc);
            $("#securityOverrideOK").attr("data-call", callback);
            $("#securityOverrideOK").attr("data-param", param);

            $("#securityFail").show();
            playBeep();
            return false;
        }
    })
        .fail(function () {
            $(document).message({content: "Unable to verify security!", html: true, expire: 3000});
            playBeep();
            return false;
        });
}

function securityOverrideShow() {
    $("#overrideUser").val("");
    $("#overridePswd").val("");
    $("#securityOverrideOK").attr("data-overUID", "");

    pauseBodyKeypress();

    document.getElementById('overridePswd').addEventListener('keypress', function (e) {
        let len = $(this).val().length;
//        console.log( "len = ", len );
        if (e.key === 'Enter' && len > 0) {
            $('#securityOverrideOK').click();
        }
    });

    $('#securityFail').hide();
    $('#securityOverride').show();
    $('#overrideUser').focus();
}

function securityOverride() {
    let cFunc = $("#securityOverrideOK").attr("data-func");
    let cUser = $("#overrideUser").val();
    let cPswd = $("#overridePswd").val();
    let callback = $("#securityOverrideOK").attr("data-call");
    let param = $("#securityOverrideOK").attr("data-param");

    $.post("securityOverride?", { user: cUser, pswd: cPswd, func: cFunc }, function (reply) {
        if (reply.result === 'success') {
            $("#securityOverrideOK").attr("data-func", "");
            $("#securityOverrideOK").attr("data-call", "");
            $("#securityOverrideOK").attr("data-param", "");
            $("#securityOverrideOK").attr("data-overUID", cUser);
            $("#overrideUser").val("");
            $("#overridePswd").val("");

            resetBodyKeypress();
            $('#securityOverride').hide();
            eval(callback + "('" + param + "')");
        } else {
            $("#overrideMsg").text(reply.msg);
        }
    });
}

function securityOverrideCancel() {
    $("#securityOverrideOK").attr("data-func", "");
    $("#securityOverrideOK").attr("data-call", "");
    $("#securityOverrideOK").attr("data-param", "");
    $("#securityOverrideOK").attr("data-overUID", "");
    $("#overrideUser").val("");
    $("#overridePswd").val("");
    $("#overrideMsg").text("&nbsp;");

    resetBodyKeypress();

    $('#securityOverride').hide();
    focusBarc();
}

function itemListAdd() {
    $("#popItemTitle").text('New Item');

    $(".popDataCell").each(function (idx, el) {
        let id = $(el).prop('id');
        let inp = id + "Inp";

        if (id === 'popNotes') {
            $(el).prop("readonly", false);
        } else if (id === 'popType') {
            fillPopType();
        } else if (id === 'popUser1') {
            fillPopUserFields();
        } else if (id === 'popUser2') {
            null;
        } else if (id === 'popSize') {
            fillPopSize();
        } else if (id === 'popClass') {
            fillPopClass();
        } else if (id === 'popVendor') {
            fillPopVendor();
        } else if (id === 'popPool') {
            fillPopPool();
        } else if (id === 'popBarcode') {
            $(el).html('<input type="text" id="popBarcodeInp" maxlength="14">');
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
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '999999', minimumValue: '0', digitGroupSeparator: '' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnInt4').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '9999', minimumValue: '0', digitGroupSeparator: '' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnInt2').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '99', minimumValue: '0' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnInt8').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '99999999', minimumValue: '0', digitGroupSeparator: '' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnDeci2_10').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '9999999.99', minimumValue: '0', digitGroupSeparator: '' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnDeci2_6').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '999.99', minimumValue: '0' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnDeci3_7').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 3, emptyInputBehavior: 'zero', maximumValue: '999.999', minimumValue: '0' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnDeci4_8').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 4, emptyInputBehavior: 'zero', maximumValue: '999.9999', minimumValue: '0' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });
    $('.popAnDeci4_12').each(function (idx, an) {
        let nn = new AutoNumeric(an, { decimalPlaces: 4, emptyInputBehavior: 'zero', maximumValue: '9999999.9999', minimumValue: '0', digitGroupSeparator: '' });
        $(an).data("autonumeric",nn);
        nn.set("0");
    });

    $(".popPriceQty").each(function (idx, el) {
        let nn;
        if ($(el).prop("id") === 'popCasePrQty') {
            nn = new AutoNumeric(el, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '999999', minimumValue: '0', digitGroupSeparator: '' });
        } else {
            nn = new AutoNumeric(el, { decimalPlaces: 0, emptyInputBehavior: 'zero', maximumValue: '99', minimumValue: '0' })
        }
        $(el).data("autonumeric",nn);
        nn.set("0");
    });

    $(".popPriceAmt").each(function (idx, el) {
        let nn;
        if ($(el).prop("id") === 'popPriceAmt') {
            nn = new AutoNumeric(el, { decimalPlaces: 4, emptyInputBehavior: 'zero', maximumValue: '9999999.9999', minimumValue: '0', digitGroupSeparator: '' });
        } else {
            nn = new AutoNumeric(el, { decimalPlaces: 2, emptyInputBehavior: 'zero', maximumValue: '9999999.99', minimumValue: '0', digitGroupSeparator: '' });
        }
        $(el).data("autonumeric",nn);
        nn.set("0");
    });

    pauseBodyKeypress();
    shortcutToggleFKeys('off');

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

    $("#popCaseQInp").on("change", function() {
        let nn = $(this).data('autonumeric');
        let val = nn.getNumber();
        let nc = $("#popCasePrQty").data('autonumeric');
        nc.set( val );
    });

    $(".popDataCell input").on("keyup", function() {
        let upper = $(this).val();
        $(this).val( upper.toUpperCase() );
    });

    $("#popAvgCostInp").on("change", function() {
        let nn = $(this).data('autonumeric');
        let val = nn.getNumber();
        let nc = $("#popCaseQInp").data('autonumeric');
        let casQ = nc.getNumber();
        let casP = val * casQ;

        $("#popLastCostInp").data('autonumeric').set(val);
        $("#popCaseCostInp").data('autonumeric').set(casP);
        $("#popLastCaseInp").data('autonumeric').set(casP);
    });

    $("#popPriceAmt").on("change", function() {
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        let pr   = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let qty  = $("#popPriceQty").data('autonumeric').getNumber();
        let marg, mkup;
        
        marg = ((pr - (qty*cost))/pr) * 100;
        $("#popUnitMargInp").data('autonumeric').set(marg);
        marg = ((pr - (qty*last))/pr) * 100;
        $("#popLastMargInp").data('autonumeric').set(marg);
        mkup = ((pr - (qty*cost)) / (qty*cost)) * 100;
        $("#popUnitMkUpInp").data('autonumeric').set(mkup);
        mkup = ((pr - (qty*last)) / (qty*last)) * 100;
        $("#popLastMkUpInp").data('autonumeric').set(mkup);
    });

    $("#popCasePrAmt").on("change", function() {
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        let pr   = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let casQ = $("#popCaseQInp").data('autonumeric').getNumber();
        let marg, mkup;
        
        marg = ((pr - (casQ*cost))/pr) * 100;
        $("#popCaseMargInp").data('autonumeric').set(marg);
        marg = ((pr - (casQ*last))/pr) * 100;
        $("#popLastCaseMargInp").data('autonumeric').set(marg);
        mkup = ((pr - (casQ*cost)) / (casQ*cost)) * 100;
        $("#popCaseMkUpInp").data('autonumeric').set(mkup);
        mkup = ((pr - (casQ*last)) / (casQ*last)) * 100;
        $("#popCaseMkUpInp").data('autonumeric').set(mkup);
    });

    $(".popMarginInp").on("change", function() {
        // pr   = qty * ( cost / ( 1 - ( marg / 100 ) ) )
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        let id   = $(this).prop("id");
        let marg = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let qty  = $("#popPriceQty").data('autonumeric').getNumber();
        let casQ = $("#popCaseQInp").data('autonumeric').getNumber();
        let pr, mkup;

        if (id.includes("LastCase")) {
            pr = casQ * ( last / ( 1 - ( marg/100 ) ) );
            $("#popCasePrAmt").data('autonumeric').set(pr);
            marg = ((pr - (casQ*cost))/pr) * 100;
            $("#popCaseMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (casQ*last)) / (casQ*last)) * 100;
            $("#popLastCaseMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (casQ*cost)) / (casQ*cost)) * 100;
            $("#popCaseMkUpInp").data('autonumeric').set(mkup);

        } else if (id.includes("Case")) {
            pr = casQ * ( cost / ( 1 - ( marg/100 ) ) );
            $("#popCasePrAmt").data('autonumeric').set(pr);
            marg = ((pr - (casQ*last))/pr) * 100;
            $("#popLastCaseMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (casQ*cost)) / (casQ*cost)) * 100;
            $("#popCaseMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (casQ*last)) / (casQ*last)) * 100;
            $("#popLastCaseMkUpInp").data('autonumeric').set(mkup);

        } else if (id.includes("Last")) {
            pr = qty * ( last / ( 1 - ( marg/100 ) ) );
            $("#popPriceAmt").data('autonumeric').set(pr);
            marg = ((pr - (qty*cost))/pr) * 100;
            $("#popUnitMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (qty*last)) / (qty*last)) * 100;
            $("#popLastMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (qty*cost)) / (qty*cost)) * 100;
            $("#popUnitMkUpInp").data('autonumeric').set(mkup);

        } else {
            pr = qty * ( cost / ( 1 - ( marg/100 ) ) );
            $("#popPriceAmt").data('autonumeric').set(pr);
            marg = ((pr - (qty*last))/pr) * 100;
            $("#popLastMargInp").data('autonumeric').set(marg);
            mkup = ((pr - (qty*cost)) / (qty*cost)) * 100;
            $("#popUnitMkUpInp").data('autonumeric').set(mkup);
            mkup = ((pr - (qty*last)) / (qty*last)) * 100;
            $("#popLastMkUpInp").data('autonumeric').set(mkup);
        }
    });

    $(".popMarkUpInp").on("change", function() {
        // pr = qty * cost * ( 1 + ( mkup / 100 ) )
        // mkup = (( pr - ( qty * cost )) / ( qty * cost )) * 100
        // marg = (( pr - ( qty * cost )) / pr ) * 100
        let id   = $(this).prop("id");
        let mkup = $(this).data('autonumeric').getNumber();
        let cost = $("#popAvgCostInp").data('autonumeric').getNumber();
        let last = $("#popLastCostInp").data('autonumeric').getNumber();
        let qty  = $("#popPriceQty").data('autonumeric').getNumber();
        let casQ = $("#popCaseQInp").data('autonumeric').getNumber();
        let pr, marg;

        if (id.includes("LastCase")) {
            pr = casQ * last * ( 1 + ( mkup/100 ) );
            $("#popCasePrAmt").data('autonumeric').set(pr);
            mkup = ((pr - (casQ*cost)) / (casQ*cost)) * 100;
            $("#popCaseMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (casQ*last))/pr) * 100;
            $("#popLastCaseMargInp").data('autonumeric').set(marg);
            marg = ((pr - (casQ*cost))/pr) * 100;
            $("#popCaseMargInp").data('autonumeric').set(marg);

        } else if (id.includes("Case")) {
            pr = casQ * cost * ( 1 + ( mkup/100 ) );
            $("#popCasePrAmt").data('autonumeric').set(pr);
            mkup = ((pr - (casQ*last)) / (casQ*last)) * 100;
            $("#popLastCaseMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (casQ*cost))/pr) * 100;
            $("#popCaseMargInp").data('autonumeric').set(marg);
            marg = ((pr - (casQ*last))/pr) * 100;
            $("#popLastCaseMargInp").data('autonumeric').set(marg);

        } else if (id.includes("Last")) {
            pr = qty * last * ( 1 + ( mkup/100 ) );
            $("#popPriceAmt").data('autonumeric').set(pr);
            mkup = ((pr - (qty*cost)) / (qty*cost)) * 100;
            $("#popUnitMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (qty*last))/pr) * 100;
            $("#popLastMargInp").data('autonumeric').set(marg);
            marg = ((pr - (qty*cost))/pr) * 100;
            $("#popUnitMargInp").data('autonumeric').set(marg);

        } else {
            pr = qty * cost * ( 1 + ( mkup/100 ) );
            $("#popPriceAmt").data('autonumeric').set(pr);
            mkup = ((pr - (qty*last)) / (qty*last)) * 100;
            $("#popLastMkUpInp").data('autonumeric').set(mkup);
            marg = ((pr - (qty*cost))/pr) * 100;
            $("#popUnitMargInp").data('autonumeric').set(marg);
            marg = ((pr - (qty*last))/pr) * 100;
            $("#popLastMargInp").data('autonumeric').set(marg);
        }
    });

    $(".popDataCell input").prop("autocomplete", "off");

    let nn = $("#popPriceQty").data("autonumeric");
    nn.set(1);

    $(".popDateLabel").hide();
    $(".popDataDate").hide();
    $(".popPopHide").show();
    $(".popButtonDiv").show();

    $("#Modal_popItem_close").html('&nbsp;');
    $("#Modal_popItem_close").on("click", null);
    $("#Modal_popItem_close").removeClass('close');

    $("#popAvgCostLabel").text("Unit Cost:");

    $("#popNotes").prop("readonly", false);

    $("#modalPopItem").show();

    $('#popBarcodeInp').focus();
}

function fillPopSize() {
    $("#popSize").html("<select id='popSizeSelect'></select>");
    $("#popSizeSelect").append('<option value="">&nbsp;</option>');
    
    $.post( "getSizes?", function(reply) {
        $.each(reply, function(idx,val) {
            $("#popSizeSelect").append('<option value="' + val + '">' + val + '</option>');
        });
    });
}

function fillPopClass() {
    $("#popClass").html("<select id='popClassSelect'></select>");
    
    $("#popClassSelect").append('<option value="S">STD</option>');
    $("#popClassSelect").append('<option value="K">KIT</option>');
    $("#popClassSelect").append('<option value="V">SVC</option>');
    $("#popClassSelect").append('<option value="W">WGT</option>');
}

function fillPopType() {
    $("#popType").html("<select id='popTypeSelect'></select>");
    
    $.post( "getInvTypes?", function(reply) {
        $.each(reply, function(idx,aTyp) {
            $("#popTypeSelect").append('<option value="' + aTyp[1] + '">' + aTyp[0] + '</option>');
        });
    });
}

function fillPopVendor() {
    $("#popVendor").html("<select id='popVendorSelect'></select>");
    $("#popVendorSelect").append('<option value="0">&nbsp;</option>');

    $.each(vendListData.data, function (idx, aVend) {
        $("#popVendorSelect").append('<option value="' + aVend.vendnum + '">' + aVend.company + '</option>');
    });

}

function fillPopPool() {
    $("#popPool").html("<select id='popPoolSelect'></select>")
    $("#popPoolSelect").append('<option value="0">&nbsp;</option>');

    $.post( "getDiscPools?", function(aPools) {
        $.each(aPools, function(idx,aRay) {
            $("#popPoolSelect").append('<option value="' + aRay[0] + '">' + aRay[1] + '</option>');
        });
    });
}

function fillPopUserFields() {
    $("#popUser1").html("<select id='popUser1Select'></select>");
    $("#popUser2").html("<select id='popUser2Select'></select>");
    $("#popUser1Select").append('<option value="0">&nbsp;</option>');
    $("#popUser2Select").append('<option value="0">&nbsp;</option>');

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

function popSaveItem() {
    let aData = [];
    let bran = $.trim($("#popBrandInp").val());

    if (bran === "") {
        vexAlert("Brand field can not be empty.", "popBrandInp");
        return;
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

    $.post("itemAdd?", { "from": "F3", "user": uid, "data": JSON.stringify(aData) }, function (reply) {
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

        //---- reload data and set search mode to highlight the new item
        itemListTable.grid.jsGrid("loadData");
        itemListTable.grid.jsGrid("sort", {field: "brand", order: "asc"});
        itemListTable.grid.jsGrid("search", {barcode: newObj.barcode, brand: newObj.brand, descrip: newObj.descrip});
        searchInputFocus();
        setTimeout(function () {
            $("#itemListTableDiv .jsgrid-filter-row").show();

            $("#itemListTableDiv .jsgrid-filter-row td:eq(0) input").val(newObj.barcode);
            $("#itemListTableDiv .jsgrid-filter-row td:eq(1) input").val(newObj.brand);
            $("#itemListTableDiv .jsgrid-filter-row td:eq(2) input").val(newObj.descrip);

            setTimeout(function () { $("#itemListTableDiv .jsgrid-filter-row td:eq(3) input").focus(); }, 100);
        }, 100);

        closePopItem();

        /*
        setTimeout(function () {
            let gridOptions = itemListTable.grid.data("JSGrid"); // Access the internal jsGrid instance
            let pageSize = gridOptions.pageSize; // Get the currently set page size
            let allItems = gridOptions.data; // Get all data items loaded into the grid (client-side)

            console.log("Length:", allItems.length);
            console.log("first item:", allItems[0]);
            console.log("last item:", allItems[allItems.length - 1]);
            console.log("newObj.code_num:", newObj.code_num);

            // Find the index of the item
            let itemIndex = -1;
            for (var i = 0; i < allItems.length; i++) {
                // Replace 'id' with your item's unique identifier field name
                if ($.trim(allItems[i].code_num) === $.trim(newObj.code_num)) {
                    itemIndex = i;
                    break;
                }
            }

            console.log("itemIndex: ", itemIndex);

            if (itemIndex !== -1) {
                // Calculate the target page index (jsGrid uses 1-based indexing for page numbers)
                // Use Math.floor for 0-based index calculation, then add 1 for the 1-based page number
                var targetPage = Math.floor(itemIndex / pageSize) + 1;

                console.log("itemIndex:",itemIndex, "pageSize:", pageSize, "targetPage:", targetPage);

                // 4. Go to the specific page
                itemListTable.grid.jsGrid("openPage", targetPage);

                // 5. Optional: Highlight the item once the page has loaded/rendered
                // This part might need to be triggered after the grid finishes rendering the new page
                // One approach is to use a slight delay or hook into a page change event if available
                
                setTimeout(function () {
                    // Recalculate index on the *current* page
                    var indexOnPage = itemIndex % pageSize;
                    // Select the row in the DOM (assuming default row structure)
                    var $row = itemListTable.grid.find(".jsgrid-table").find("tr.jsgrid-row, tr.jsgrid-alt-row").eq(indexOnPage);

                    // Add a highlight class (define this class in your CSS)
                    $row.children().addClass("highlighted");

                    // Ensure the item is visible within the grid's viewport if it has internal scrolling
                    if ($row.length) {
                        $row[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); // Use native JS for smooth scroll to the element
                    }
                }, 100); // Small delay to allow grid to render
                
            }
        }, 500 );
        */
    });
}

function popCust() {
    let isNew = true;
    let index = 0;
    let obj = null;
    let custnum = 0;    

    $.spin('true');

    $.post("popCust?",
        { custnum: custnum, uid: uid, isNew:'Y' },
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

                $("#popCustTitle").html('Add New Customer');

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

                addEditPopCust(null);
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

function addEditPopCust() {
    let vals = [];
    let selects = [];
    let notNew = false;

    $.spin('true');


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
            $(el).prop("readonly", false);
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

    $("#popCustNotes").prop("readonly", false);

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

    $("#modalPopCust").show();

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

            const sorting = custListTable.grid.jsGrid("getSorting");
            custListTable.grid.jsGrid("loadData");
            custListTable.grid.jsGrid("sort", sorting);
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
            const sorting = custListTable.grid.jsGrid("getSorting");

            //---- reload data and sort, then page to new customer
            custListTable.grid.jsGrid("loadData");
            custListTable.grid.jsGrid("sort", sorting);
            custListTable.grid.jsGrid("openPage", pageNumber);

        });
    }
    closePopCust();
}

function closePopCust() {
	$("#modalPopCust").hide();
	$("#modalPopCustContent").css( { top: 0, left: 0 } ); // reset in case it was dragged
    $("#modalPopCust").data("custnum", "");
    $("#popCustNotes").val("");
    $("#popCustDeliveryNotes").val("");
    $(".popTaxPriceDeptRow").remove();
    $(".popCustDataCell").css("border", "1px solid #097764");
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
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
