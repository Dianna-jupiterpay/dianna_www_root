/*==========================================================================*\
|| ######################################################################## ||
|| # encorePOS 1.3.100.105                                                # ||
|| # ePosSet.js                                                           # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
\*==========================================================================*/

//----- default settings for ePos
function ePosSetUp() {
    var oSet = {
        "posEnabled": true,
        "posProfileName": "",
        "posProfileType": "specific", // "all",  // radio
        "profileDrawerNbrs": "",
        "storeName": "",
        "storeAddr": "",
        "storeCityStZip": "",
        "storePhone": "",
        "storeURL": "",
        "doLegalAge": true,
        "legalAge": 21,
        "legalLabel": "Alcohol",
        "doLotto": true,
        "depositAmt": 0.05,
        "coupon_F": true,
        "coupon_N": false,
        "couponType": true,
        "couponTypeArray": [],
        "doCashChk": false,
        "chkCashFeeType": "fixed",  // radio
        "cashChkFlat": 0,
        "cashChkPerc": 0,
        "chkTableArray": [[100, 1.00, 2.00], [500, 1.00, 3.00], [1000, 1.00, 5.00]],
        "doChecksOK": true,
        "qtyCheck": false,
        "pennyRound": false,
        "roundMethod": "down",  // "down", "up", "swedish"
        "noSaleLog": true,
        "noSaleReasons": ["Cash Drop", "Make Change", "New Till", "Change Shifts", "Other"],
        "depositVary": false,
        "trackDepOver": false,
        "trackDepOverAmt": 0,
        "depositLimitOver": false,
        "depositLimitOverAmt": 0,
        "defaultRedemptionNbrItems": true,
        "doDelivery": false,
        "deliveryTicketStyle": "40",  // radio
        "deliveryDoCOD": false,
        "f6AsDisc": true,   // price edit shown as discount
        "qDisc1": 0,     // quick disc key one item "Q"
        "qDisc2": 0,     // quick disc key one item "W"
        "qDiscAll1": 0,  // quick disc key ALL items "A"
        "qDiscAll2": 0,  // quick disc key ALL items "Z"
        "pCase_prom": true,
        "discOnPromo": true,
        "promoAsDisc": true,
        "smart2Fer": true,
        "twoFerAsDisc": true,
        "limit2Cost": true,
        "enforceMinPrice": true,
        "mixedTypeDisc": true,
        "priceLevelPromo": true,
        "defaultZeroPriceLevels": true,
        "discOkLvlB": true,
        "discOkLvlC": true,
        "discOkLvlD": true,
        "discOkLvlE": true,
        "discOkLvlF": true,
        "discOkLvlG": true,
        "discOkLvlH": true,
        "discOkLvlI": true,
        "discOkLvlJ": true,
        "makeF6Permanent": true,
        "askF6Permanent": true,
        "giftCertDo": false,
        "giftCertType": "print",  // radio
        "hwConfigType": "util",  // "local",  // radio
        "hwUtilAddr": "",
        "drwClosePrintFormat": "40",  // radio
        "cardProcDo": true,
        "cardWaitTime": 180,
        "cardNbrReceipts": 0,
        "hwPoleDisplayDo": false,
        "hwPDMessage1": "",
        "hwPDMessage2": "",
        "hwCashDrawerDo": true,
        "hwCDNoSaleDo": true,
        "hwCDCashOpenOnly": true,
        "negativeQOHWarning": false,
        "lockScreenNotFound": false,
        "groupItems": true,
        "twoFerLinePrompt": true,
        "cusTypeDo": false,
        "promptForUID": false,
        "qtyPromptCases": false,
        "companyInsteadOfName": true,
        "askForZipcode": false,
        "loginAsTimeClock": false,
        "f3QtyPrompt": true,  // prompt for qty when selling off F3 list
        "f3ShowQOH": false,
        "f3ShowPromo": false,
        "coupAsk4PriceOnN": true,
        "coupAsk4PriceonF12": true,
        "coupAsk4Type": true,
        "pickPackDoOnScan": false,
        "pickPackDoOnF3": false,
        "adjustQOHOnPT": false,
        // "noSaleReasonsBtn": button,
        "promptForIDCheck": true,
        "customMiscSaleDo": false,
        "customMiscSaleLabel": "CUSTOM",
        "customMiscSaleKey": "O",
        "customMiscSaleType": "",
        // "customMiscSaleType": select,
        "receiptStyle": "40E",
        "salesScreenLanguage": "en",  // radio
        "receiptShowTotalUnits": false,
        "receiptPrintGiftSlip": true,
        "receiptPrintHouseCharge": true,
        "receiptPrintHouseBalanceDue": true,
        "receiptPrintOption": "none",  // radio
        "receiptBannerText": "",
        "receiptSigLine": false,
        "lotterySaleFirst": true,
        "lotteryPayoutLimit": 0,
        "lotteryCommission": 0,
        "tenderMakeChange": true,
        "tenderDefaultType": "1",  // "cash"
        "tenderForceHouseCharge": false,
        "tenderAutoClear": true,
        "autoClearCount": 20,
        "tenderForeign": false,
        "tenderForeignLabel": "",
        "tenderForeignExchRate": 0,
        "tenderTypeEditDo": false,
        "tenderType5": "",
        "tenderType6": "",
        "tenderType7": "",
        "tenderType8": "",
        "tenderEnableCashDrop": true,
        "tenderCashDropNbrReceipt": 1,
        "tenderDoTips": false,
        "taxFormat": "percent",  // radio
        //--- tax settings
        "doTax1": true,
        "doTax2": false,
        "doTax3": false,
        "doFlatTax": false,
        "doVolTax": false,
        "tax1Label": "Sales Tax",
        "tax2Label": "Sales Tax2",
        "tax3Label": "Sales Tax3",
        "flatTaxLabel": "Flat Tax",
        "volTaxLabel": "Volume Tax",
        "volTaxUnit": "L",
        "nbrOfTaxes": 1,
        "taxRate1": 0,
        "taxRate1A": 0,
        "taxRate2": 0,
        "taxRate2A": 0,
        "taxRate3": 0,
        "taxRate3A": 0,
        "taxRateV": 0,
        "taxRateVA": 0,
        "miscTaxB1": "Y",
        "miscTaxM1": "Y",
        "miscTaxK1": "Y",
        "miscTaxV1": "Y",
        "miscTaxS1": "Y",
        "miscTaxC1": "Y",
        "miscTaxB2": "Y",
        "miscTaxM2": "Y",
        "miscTaxK2": "Y",
        "miscTaxV2": "Y",
        "miscTaxS2": "Y",
        "miscTaxC2": "Y",
        "miscTaxB3": "Y",
        "miscTaxM3": "Y",
        "miscTaxK3": "Y",
        "miscTaxV3": "Y",
        "miscTaxS3": "Y",
        "miscTaxC3": "Y",
        "taxFlatWith1": false,
        "taxFlatWith2": false,
        "taxFlatWith3": false,
        "taxTax1With2": false,
        "taxTax1With3": false,
        "taxTax2With3": false,
        "taxPreDiscount1": false,
        "taxPreDiscount2": false,
        "taxPreDiscount3": false,
        "taxNetCoupons1": false,
        "taxNetCoupons2": false,
        "taxNetCoupons3": false,
        "taxDeposits1": false,
        "taxDeposits2": false,
        "taxDeposits3": false,
        "taxNetFreqReward1": false,
        "taxNetFreqReward2": false,
        "taxNetFreqReward3": false,
        "doFrequent": false,
        "frequentName": "",
        "frequentPoint": 1,
        "frequentBasis": "Y",
        "frequentItemPromo": 1,
        "frequentItemF6": 1,
        "frequentItemF7": 1,
        "frequentItemPool": 1,
        "frequentItemMixed": 1,
        "frequentItemMisc": 1,
        "frequentLargeX": 1,
        "frequentLargeAmt": 50.00,
        "frequentDoW": "",
        "frequentDayX": 1,
        "frequentMode": "L",
        "frequentAdd": false,
        "frequentMultiChk": false,
        "doCustomField1": false,
        "customField1Name": "",
        "customField1Column": false,
        "doCustomField2": false,
        "customField2Name": "",
        "customField2Column": false,
        "doMinPrice": false,
        "doPriceLevels": true,
        "doHouseChg": true,
        "acceptChecks": true,
        "doDualPricing": false,
        "dualPricingPercent": 0
};

    return oSet;
}

//-- default system-level settings
function eSysSetUp() {
    var oSet = {
        "storeCity": "",
        "storeState": "",
        "storeZip": "",
        "shipAddr1": "",
        "shipAddr2": "",
        "shipCity": "",
        "shipState": "",
        "shipZip": "",
        "shipSameAsStore": true,
        "doWebOrders": false,
        "fakeusernameremembered": "",
        "fakepasswordremembered": "",
        "doCityHive": false,
        "webCityTender": "",
        "webCityExempt": false,
        "doNose": false,
        "webNoseTender": "",
        "webNoseExempt": false,
        "webTip": false,
        "webFee": false,
        "webPts": false,
        "webBag": false,
        "webConv": false,
        "webPrint": false,
        "webDrawerNbr": "",
        "webFeeSKU": "",
        "webBagSKU": "",
        "webConvSKU": "",
        "webEmail": "",
        "webPswd": "",
        "timeClockScope": "A",  // radio button: A=All, S=Selected employees
        "timeClockShowAll": true,
        "timeClockFormat": "D",  // radio button: D=Detailed, S=Summary
        "timeClockPeriod": "1",  // radio button: 1=One week, 2=Two weeks, H=Half month, M=Month
        "timeClockRound": "A",  // radio button: A=None, H=Hour, F=Half Hour, Q=Quarter Hour, T=Tenth Hour
        "timeClockRoundUp": true,
        "doItemEditLogs": true,
        "doDeptChanges": true,
        "doTypeChanges": true,
        "UPC_A_Sys": true,
        "UPC_E_Sys": true,
        "UPC_A_Chk": false,
        "UPC_E_Chk": false,
        "dataUpdate": 5,
        "autoLogout": 30,
        "processTime": "02:00 AM",
        "verboseToggle": false        
    };

    return oSet;
}


function setFunctionButtons() {
    if (!pSet.doLotto) $("#lottoBtn").hide();
    if (!pSet.doTax1 && !pSet.doTax2 && !pSet.doTax3 && !pSet.doFlatTax && !pSet.doVolTax) $("#exemptBtn").hide();
    if (!pSet.doCashChk) $("#cashChkBtn").hide();
}

function getTaxInfo() {
    //-- only 1 tax, set total tax row to that label
    if (!pSet.doTax2 && !pSet.doTax3 && !pSet.doFlatTax && !pSet.doVolTax) {
        $("#totTaxLabel").text(pSet.tax1Label);
        $(".totalExpander").hide();
        $("#totalTableDiv").css({ height: "122px" });
    } else {
        $("#tax1Label").text(pSet.tax1Label);
    }

    if (pSet.doTax2) {
        pSet.nbrOfTaxes++;
        $("#tax2Label").text(pSet.tax2Label);
    }
    if (pSet.doTax3) {
        pSet.nbrOfTaxes++;
        $("#tax3Label").text(pSet.tax3Label);
    }
    if (pSet.doFlatTax) {
        pSet.nbrOfTaxes++;
        $("#flatTaxLabel").text(pSet.flatTaxLabel);
    }
    if (pSet.doVolTax) {
        pSet.nbrOfTaxes++;
        $("#volTaxLabel").text(pSet.volTaxLabel);
    }
}

