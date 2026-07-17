var appVersion = '<b>1.2.3</b> (build 1.2.3.5)';
var ipaddr = '';
var cUID;
var item;
var nRecNbr  = -1;
var nTotRecs =  0;
var lMoving = false;
var lEditing;
var setCloseVisible = false;
var customAlert = new CustomAlert();

function countInit() {
	document.addEventListener("resume", onResume, false);
	document.addEventListener("backbutton", bogusFunc, false);

	window.screen.orientation.lock('portrait')

	$("#results").swipe( {
		swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
		  if (direction === 'left') {
			  rightBrowse();
		  } else if (direction === 'right') {
			  leftBrowse();
		  }
		}
	});

	$("#manCode").keydown(function(e) {
		console.log('key pressed:',e.keycode);
        if (e.keyCode == 13) {
            document.activeElement.blur();
            $("input").blur();
			sendCode();
        } else {  //if ( ! $("#submit").is(":disabled") ) {
            $("#submit").prop( "disabled", false );
        }
    });

	$("#getQty").keydown(function(e) {
        if (e.keyCode == 13) {
            document.activeElement.blur();
            $("input").blur();
			postCount();
        } else { // if ( ! $("#submit").is(":disabled") ) {
            $("#submit").prop( "disabled", false );
		}
	});
	
    try{
        ipaddr = window.localStorage.getItem('ipaddr') || "";
    } catch (err) {
        ipaddr = "";
    }
	
    try{
        cUID = window.localStorage.getItem('userID') || "";
    } catch (err) {
        cUID = "";
    }

	setTimeout(function() {
		navigator.splashscreen.hide();
	}, 2000);

	startUpRoutine();
	
}

/*--------------------------------------------------------------------------------------------------------*/
function startUpRoutine() {
	var s = getComputedStyle(document.documentElement).getPropertyValue("--sab");
/*
	console.log( "sab = " + s );

	console.log( "scanBtns bottom = " + $(".scanBtns").css("bottom") );

	console.log( "ipaddr: '" + ipaddr + "', cUID: '" + cUID + "'" );
*/
	$('#appVersion').html(appVersion);

	$("html, body").scrollTop(Number.MAX_SAFE_INTEGER);

	if ( cUID !== "" ) {
		$("#userNameSpan").text( cUID );
	}

	if ( ipaddr !== "" ) {
		$("#getIPaddr").val(ipaddr);
		var cIp = ipaddr;

		$.ajax({
            url: cIp + "/checkForServer?",
            timeout: 2000
        } )
        .done(function() {
		    $("#ipFeedback").attr('src','./img/check24.png')

		    if ( cUID !== "" ) {
			    $("#userNameSpan").text( cUID );
			    $("#loginDiv").toggle(false);
	            moveBrowse(-1);

		    } else {
			    $("#userNameLabel").text( "You are not logged in." );
	            $("#userNameSpan").text( "" );
	            $("#loginoutButton").text("Login");
	            $("#loginoutButton").attr("onclick","doLogin()");

			    doLogin();
		    }

	    } )
	    .fail( function(xhr, status, error) {
			$("#ipFeedback").attr('src','./img/x24.png')
			alert( "Unable to connect to server." );

		    $("#userNameLabel").text( "You are not logged in." );
            $("#userNameSpan").text( "" );
	        $("#loginoutButton").text("Login");
	        $("#loginoutButton").attr("onclick","doLogin()");
		    $("#loginoutButton").prop( "disabled", true );
		
		    goToSettings();

	    } )

	} else {
		$("#userNameLabel").text( "You are not logged in." );
	    $("#userNameSpan").text( "" );
	    $("#loginoutButton").text("Login");
	    $("#loginoutButton").attr("onclick","doLogin()");
		$("#loginoutButton").prop( "disabled", true );
		
		goToSettings();
		
	}
}

/*--------------------------------------------------------------------------------------------------------*/
function onResume() {

	if ( ipaddr !== "" ) {
	    $("#getIPaddr").val(ipaddr);
		var cIp = ipaddr;

		$.ajax({
            url: cIp + "/checkForServer?",
            timeout: 2000
        } )
        .done(function() {
		    $("#ipFeedback").attr('src','./img/check24.png');
	    } )
	    .fail(function() {
		    $("#ipFeedback").attr('src','./img/x24.png');
			alert( "Unable to connect to server!" );

			$("#userNameLabel").text( "You are not logged in." );
	        $("#userNameSpan").text( "" );
	        $("#loginoutButton").text("Login");
	        $("#loginoutButton").attr("onclick","doLogin()");
		    $("#loginoutButton").prop( "disabled", true );
		
		    goToSettings();

	    } )

	} else {
		$("#userNameLabel").text( "You are not logged in." );
	    $("#userNameSpan").text( "" );
	    $("#loginoutButton").text("Login");
	    $("#loginoutButton").attr("onclick","doLogin()");
		$("#loginoutButton").prop( "disabled", true );
		
		goToSettings();
		
	}
}

/*--------------------------------------------------------------------------------------------------------*/
function startScan() {
	var cIp = ipaddr;

	$("#browsePara").toggle(false);
	$(".scanBtns").toggle(false);
	$("#results").toggle(false);

	cordova.plugins.barcodeScanner.scan(
		function (result) {
			if (result.cancelled===0 || result.cancelled===false) {
				$(".scanBtns").toggle(false);

				$.post( cIp + "/get_item('"+result.text+"','"+result.format+"','"+cUID+"')", "",
				     function (data, status, xhr) {
					 var s = "";
					 item = data;
			         itemLoad();
				})
                .fail(function( xhr, status, errorThrown ) {
                    var s= "Sorry, there was a problem!</br>" +
                    "Error: " + errorThrown + "</br>" +
                    "Status: " + status + "</br>";

					 $("#results").html(s);
                     $("#results").toggle(true);
                })
			} else {
            	$("#browsePara").toggle(true);
				$(".scanBtns").toggle(true);
				$("#results").toggle(true);
			}
		}, 
		function (error) {
			alert("Scanning failed: " + error);
		},
        {
          preferFrontCamera : false, // iOS and Android
          showFlipCameraButton : true, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          prompt : "Place a barcode inside the scan area", // Android
          resultDisplayDuration: 10, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS
        }		
	);
}

/*--------------------------------------------------------------------------------------------------------*/
function typeCode() {
	$("#results").html("");
	$("#manCode").val("");

	$(".scanBtns").toggle(false);
	$("#manCodePara").toggle(true);

	$("#browsePara").toggle(false);

    $("#submit").prop( "disabled", true );

    $("#submit").toggle(true);
    $("#cancel").toggle(true);

	setTimeout( function() { 
		$("#manCode").focus();
	}, 50 );
}

/*--------------------------------------------------------------------------------------------------------*/
function sendCode() {
	var cCode = $("#manCode").val();

	if ( checkConnection() !== "WiFi connection" ) {
		alert("No WiFi connection!");
		return;
	}

    $("#manCodePara").toggle(false);
	$("#submit").toggle(false);
	$("#cancel").toggle(false);

	var cIp = ipaddr;
/*
	var cTest = cIp.toUpperCase();
	if ( cTest.includes('DASH.') && ! cTest.includes('HTTP') ) {
		cIp = "https://" + cIp;
	} else if ( cTest.includes('DASH.') && cTest.includes('HTTP:') ) {
		cTest = cTest.replace("HTTP:", "HTTPS:");
		cIp = cTest.toLowerCase();
	} else if ( ! cTest.includes('HTTP') ) {
		cIp = "http://" + cIp;
	};
*/
	$.post( cIp + "/get_item('"+cCode+"','TYPED','"+cUID+"')", "",
		function (data, status, xhr) {
			var s = "";
			item = data;
			itemLoad();
		})
        .fail(function( xhr, status, errorThrown ) {
            var s= "Sorry, there was a problem!</br>" +
                   "Error: " + errorThrown + "</br>" +
                   "Status: " + status + "</br>";

					$("#results").html(s);
        })
}

/*--------------------------------------------------------------------------------------------------------*/
function itemLoad() {
    var s = "";

	if (item.found==='T') {
	    s = "<span class='fieldLabel'>Barcode: </span>" + item.barcode + "</br>" +
	   		"<span class='fieldLabel'>Brand: </span>" + item.brand + "</br>" +
			"<span class='fieldLabel'>Descrip: </span>" + item.descrip + "</br>" +
			"<span class='fieldLabel'>Size: </span>" + item.size + "</br>" +
			"<span class='fieldLabel'>Price: </span>" + item.price;

			if (item.pack > 1){
				s += "</br><span class='fieldLabel'>Units/Pack: </span>" + item.pack;
			};
			if ('lastcost' in item) {
				s += "</br><span class='fieldLabel'>Last Cost: </span>" + item.lastcost;
			};
			if ('sysQoH' in item) {
				s += "</br><span class='fieldLabel'>Sys QoH: </span>" + item.sysQoH;
			};
			
	} else {
        s = "<div class='alertField'>Barcode not found, enter info.</div>" + 
		    "<span class='fieldLabel'>Barcode: </span>" + item.barcode + "</br>" +
	   		"<span class='fieldLabel'>Brand: </span><input type='text' class='itemGets' id='getBrand' /></br>" +
			"<span class='fieldLabel'>Descrip: </span><input type='text' class='itemGets' id='getDescrip' /></br>" +
			"<span class='fieldLabel'>Size: </span><input type='text' class='itemGets' id='getSize' /></br>" +
			"<span class='fieldLabel'>Price: </span><input type='number' pattern='(^\d+\.\d{2}$)' class='itemGets' id='getPrice' />";
	}

    $("#results").html(s);
    $("#results").toggle(true);

    $("#getQty").val("");
	$("#getQtyPara").toggle(true);

    $("#submit").prop( "disabled", true );

    $("#submit").toggle(true);
    $("#cancel").toggle(true);

}

/*--------------------------------------------------------------------------------------------------------*/
function postCount() {
	if ($("#manCodePara").is(":visible")) {
		sendCode();
		return;
	} else if (lEditing) {
		sendEditQty();
		return;
	}

	if ( checkConnection() !== "WiFi connection" ) {
		alert("No WiFi connection!");
		return;
	}

	var cQty = $("#getQty").val();

	var cBrand    = "";
	var cDescrip  = "";
	var cSize     = "";
	var cPrice    = "";

    $("#getQtyPara").toggle(false);
	$("#submit").toggle(false);
	$("#cancel").toggle(false);

	if ($("#getBrand").length) {
		cBrand    = $("#getBrand").val().toUpperCase();
	    cDescrip  = $("#getDescrip").val().toUpperCase();
	    cSize     = $("#getSize").val();
		cPrice    = $("#getPrice").val();

        var s= "<span class='fieldLabel'>Barcode: </span>" + item.barcode + "</br>" +
	   		                "<span class='fieldLabel'>Brand: </span>" + cBrand + "</br>" +
			                "<span class='fieldLabel'>Descrip: </span>" + cDescrip + "</br>" +
			                "<span class='fieldLabel'>Size: </span>" + cSize + "</br>" +
							"<span class='fieldLabel'>Price: </span>" + cPrice + "</br>" +
							"<span class='fieldLabel'>Last Cost: </span>0.00</br>" + 
							"<span class='fieldLabel'>Sys QoH: </span>0";
		$("#results").html(s);
	}

	var cIp = ipaddr;
/*
	var cTest = cIp.toUpperCase();
	if ( cTest.includes('DASH.') && ! cTest.includes('HTTP') ) {
		cIp = "https://" + cIp;
	} else if ( cTest.includes('DASH.') && cTest.includes('HTTP:') ) {
		cTest = cTest.replace("HTTP:", "HTTPS:");
		cIp = cTest.toLowerCase();
	} else if ( ! cTest.includes('HTTP') ) {
		cIp = "http://" + cIp;
	};
*/
	$.post( cIp + "/postCount?", 
	       {found: item.found, codenum: item.codenum, barcode: item.barcode, count: cQty, pack: item.pack, 
			cUID: cUID, brand: cBrand, descrip: cDescrip, size: cSize, price: cPrice},
		function (data, status, xhr) {
    	$("#results").append("<br><span class='fieldLabel'>Result: </span>"
		                     + data.result
							 + "&nbsp;<img id='editQtyPng' src='./img/edit.png' onclick='editQty()' width='32px' height='32px' />" );

     	$(".scanBtns").toggle(true);

		nRecNbr  = parseInt(data.recno);
		nTotRecs = parseInt(data.recno);
		item = data;

		$("#browsePara").toggle(true);
		$("#recNbrDisplay").text(nRecNbr + " / " + nTotRecs)
		if (nRecNbr > 1) {
            $("#leftBrowse").attr('src', './img/arrow_l.png');
            $("#leftBrowse").on('touchend', leftBrowse);
		}
	})
	.fail(function( xhr, status, errorThrown ) {
        var s= "<br>" +
		       "Sorry, there was a problem!</br>" +
               "Error: " + errorThrown + "</br>" +
               "Status: " + status + "</br>";

		$("#results").append(s);
     	$(".scanBtns").toggle(true);
	})
}

/*--------------------------------------------------------------------------------------------------------*/
function clearResults() {
	var nRec2Go = -1;
	
	if (lEditing) {
		nRec2Go = nRecNbr;
	};

	lEditing = false;

	$("#browsePara").toggle(true);

    $("#manCodePara").toggle(false);
	$("#manCode").val("");

    $("#getQtyPara").toggle(false);
	$("#getQty").val("");

	$("#results").html("");
	$("#results").toggle(true);

	$("#submit").toggle(false);
	$("#cancel").toggle(false);
	$(".scanBtns").toggle(true);

	moveBrowse(nRec2Go);
}

/*--------------------------------------------------------------------------------------------------------*/
function editQty() {
	lEditing = true;

    $("#editQtyPng").toggle(false);

    $("#browsePara").toggle(false);
	$(".scanBtns").toggle(false);

    $("#getQty").val("");
    $("#getQtyPara").toggle(true);

    $("#submit").toggle(true);
    $("#cancel").toggle(true);

	setTimeout( function() {
		$("#getQty").focus();
	})

}

/*--------------------------------------------------------------------------------------------------------*/
function sendEditQty() {

	if ( checkConnection() !== "WiFi connection" ) {
		alert("No WiFi connection!");
		return;
	}

	var cQty = $("#getQty").val();
    var cOldQty = item.count;

	lEditing = false;

    $("#editQtyPng").toggle(true);

    $("#browsePara").toggle(true);
	$(".scanBtns").toggle(true);

    $("#getQty").val("");
    $("#getQtyPara").toggle(false);

    $("#submit").toggle(false);
	$("#cancel").toggle(false);
	
	var cIp = ipaddr;
/*	
	var cTest = cIp.toUpperCase();
	if ( cTest.includes('DASH.') && ! cTest.includes('HTTP') ) {
		cIp = "https://" + cIp;
	} else if ( cTest.includes('DASH.') && cTest.includes('HTTP:') ) {
		cTest = cTest.replace("HTTP:", "HTTPS:");
		cIp = cTest.toLowerCase();
	} else if ( ! cTest.includes('HTTP') ) {
		cIp = "http://" + cIp;
	};
*/
	$.post( cIp + "/postCountEdit?", { codenum: item.codenum, recno: item.recno, count: cQty, uid: cUID },
		function (data, status, xhr) {
    	  var s = "";

		  if ( data.result === 'success' ) {
     		item.count = data.count;

            s += "<span class='fieldLabel'>Barcode: </span>" + item.barcode + "</br>" +
	   			 "<span class='fieldLabel'>Brand: </span>" + item.brand + "</br>" +
				 "<span class='fieldLabel'>Descrip: </span>" + item.descrip + "</br>" +
				 "<span class='fieldLabel'>Size: </span>" + item.size + "</br>" +
				 "<span class='fieldLabel'>Price: </span>" + item.price;
			     if (item.pack > 1){
				     s += "</br><span class='fieldLabel'>Units/Pack: </span>" + item.pack;
			     }

			s += "<br><span class='fieldLabel'>Count: </span>" + item.count +
                 "&nbsp;<img id='editQtyPng' src='./img/edit.png' onclick='editQty()' width='32px' height='32px' />";

		  } else {
            s= "<br>Sorry, there was a problem!"
		  }
   	      
		  $("#results").html(s);

     	  $(".scanBtns").toggle(true);
  	      
	})
	.fail(function( xhr, status, errorThrown ) {
        var s= "<br>" +
		       "Sorry, there was a problem!</br>" +
               "Error: " + errorThrown + "</br>" +
               "Status: " + status + "</br>";

		$("#results").append(s);
     	$(".scanBtns").toggle(true);
	})
}

/*--------------------------------------------------------------------------------------------------------*/
function leftBrowse() {
	if ( !lMoving && nRecNbr > 1 ) {
		lMoving = true;
		moveBrowse( nRecNbr - 1 );
	}
}

/*--------------------------------------------------------------------------------------------------------*/
function rightBrowse() {
	if ( !lMoving && nRecNbr < nTotRecs ) {
		lMoving = true;
		moveBrowse( nRecNbr + 1 );
	}
}

/*--------------------------------------------------------------------------------------------------------*/
function moveBrowse(nrec) {
/*
	if ( checkConnection() !== "WiFi connection" ) {
		return;
	}
*/
	if (nrec === -1) {
		$("#wait_p").toggle(true);
	}

	var cIp = ipaddr;
/*	
	var cTest = cIp.toUpperCase();
	if ( cTest.includes('DASH.') && ! cTest.includes('HTTP') ) {
		cIp = "https://" + cIp;
	} else if ( cTest.includes('DASH.') && cTest.includes('HTTP:') ) {
		cTest = cTest.replace("HTTP:", "HTTPS:");
		cIp = cTest.toLowerCase();
	} else if ( ! cTest.includes('HTTP') ) {
		cIp = "http://" + cIp;
	};
*/
    $.ajax( {
        url: cIp + "/browse2Item?",
		data: { recno: nrec, uid: cUID },
        timeout: 3000
    } )
    .done( function (data, status, xhr) {
			var s = "";
			item = data;

			if ( item.found === "F" && nrec === -1 ) {
		            $("#wait_p").toggle(false);
					$(".scanBtns").toggle(true);
     				$("#browsePara").toggle(true);

					s = '<br>Ready for scan/entry...';
       			    
					$("#results").html(s);

					return;

			} else if ( item.found === 'F' ) {
                	$("#leftBrowse").attr('src', './img/arrow_lD.png');
                    $("#leftBrowse").on('touchend', bogusFunc);

                	$("#rightBrowse").attr('src', './img/arrow_rD.png');
                    $("#rightBrowse").on('touchend', bogusFunc);

                    $("#recNbrDisplay").text( " 0 / 0" );

		            $("#wait_p").toggle(false);
					$(".scanBtns").toggle(true);
     				$("#browsePara").toggle(true);

					s = '<br>File cleared. Ready for scan/entry...';
       			    
					$("#results").html(s);

     			    lMoving = false;

					return;

			} else if (item.found === "T") {
			    if (nrec === -1) {
		            $("#wait_p").toggle(false);
					$(".scanBtns").toggle(true);

					s = 'Last entry:<br>';
				} else {
					s = '&nbsp;<br>';
				}
                s += "<span class='fieldLabel'>Barcode: </span>" + item.barcode + "</br>" +
	   				 "<span class='fieldLabel'>Brand: </span>" + item.brand + "</br>" +
					 "<span class='fieldLabel'>Descrip: </span>" + item.descrip + "</br>" +
					 "<span class='fieldLabel'>Size: </span>" + item.size + "</br>" +
				     "<span class='fieldLabel'>Price: </span>" + item.price;

				if (item.pack > 1){
				    s += "</br><span class='fieldLabel'>Units/Pack: </span>" + item.pack;
			    }
				if ('lastcost' in item) {
					s += "</br><span class='fieldLabel'>Last Cost: </span>" + item.lastcost;
				};
				if ('sysQoH' in item) {
					s += "</br><span class='fieldLabel'>Sys QoH: </span>" + item.sysQoH;
				};
		
			    s += "<br><span class='fieldLabel'>Count: </span>" + item.count +
                     "&nbsp;<img id='editQtyPng' src='./img/edit.png' onclick='editQty()' width='32px' height='32px' />";

				$("#results").html(s);
				$("#results").toggle(true);

				nRecNbr  = parseInt(item.recno);
				nTotRecs = parseInt(item.totrec);

                $("#recNbrDisplay").text(nRecNbr + " / " + nTotRecs);

 	            if ( nRecNbr === 1 ) {
                	$("#leftBrowse").attr('src', './img/arrow_lD.png');
                    $("#leftBrowse").on('touchend', bogusFunc);
            	}
            	if ( nRecNbr > 1 ) {
                	$("#leftBrowse").attr('src', './img/arrow_l.png');
                    $("#leftBrowse").on('touchend', leftBrowse);					
            	}
            	if ( nRecNbr < nTotRecs ) {
                	$("#rightBrowse").attr('src', './img/arrow_r.png');
                    $("#rightBrowse").on('touchend', rightBrowse);
            	}
            	if ( nRecNbr === nTotRecs ) {
                	$("#rightBrowse").attr('src', './img/arrow_rD.png');
                    $("#rightBrowse").on('touchend', bogusFunc);
            	}
            	
				$("#browsePara").toggle(true);
     			lMoving = false;
	}
	})
	.fail(function( xhr, status, errorThrown ) {
        var s= "<br>" +
		       "Sorry, there was a problem!</br>" +
               "Error: " + errorThrown + "</br>" +
               "Status: " + status + "</br>";

		if (nrec === -1) {
		    $("#ipFeedback").attr('src','./img/x24.png');
		}

		$("#wait_p").toggle(false);
		
		$("#results").append(s);
	})
}

/*--------------------------------------------------------------------------------------------------------*/
function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    return states[networkState];
}

/*--------------------------------------------------------------------------------------------------------*/
function goToSettings() {
	$("#countDiv").toggle(false);
	$(".scanBtns").toggle(false);
	$("#loginDiv").toggle(false);
	$("#settingsDiv").toggle(true);
	$('#settingsIcon').toggle(false);
	$('#closeSettingsIcon').toggle(true);
}

/*--------------------------------------------------------------------------------------------------------*/
function backToMain() {
	$('#closeSettingsIcon').toggle(false);
	$('#settingsIcon').toggle(true);
	$("#settingsDiv").toggle(false);
	$("#loginDiv").toggle(false);
	$("#countDiv").toggle(true);
	$(".scanBtns").toggle(true);
}

/*--------------------------------------------------------------------------------------------------------*/
function settingSave() {
	var cImg = $("#ipFeedback").attr('src');

	if ( cImg.includes('check24.png') ) {
		ipaddr = $("#getIPaddr").val();
		window.localStorage.setItem( 'ipaddr', ipaddr );
	}
	
	if (cUID==="") {
		doLogin();
	} else {
		backToMain();
	    moveBrowse(-1);
	}
}

/*--------------------------------------------------------------------------------------------------------*/
function testIpEntered() {
	var cIp = $("#getIPaddr").val();
	var cTest = cIp.toUpperCase();
	//var cState = checkConnection();

	if ( cTest.includes('DASH.') && ! cTest.includes('HTTP') ) {
		cIp = "https://" + cIp;
		$("#getIPaddr").val( cIp );
	
	} else if ( cTest.includes('DASH.') && cTest.includes('HTTP:') ) {
		cTest = cTest.replace("HTTP:", "HTTPS:");
		cIp = cTest.toLowerCase();
		$("#getIPaddr").val( cIp );
	
	} else if ( cTest.includes('DASH.') ) {
		$("#getIPaddr").val( cIp );
	
	} else if ( ! cTest.includes('HTTP') ) {
		//cIp = "http://" + cIp;
	};

	if ( cIp.substr( cIp.length - 1 ) == '/' || cIp.substr( cIp.length - 1 ) == '\\' ) {
	   cIp = cIp.slice(0, -1);
	}

	$("#testIpButton").toggle(false);
	$("#testIpSpin").toggle(true);

//  console.log("before post, cIp:", $("#getIPaddr").val());	

    $.post( cIp + "/checkForServer?", function() {
//	    console.log("after post, cIp:", $("#getIPaddr").val());
		$("#testIpSpin").toggle(false);
	    $("#testIpButton").toggle(true);

		$("#ipFeedback").attr('src','./img/check24.png')
//        $("#setCancel").prop("disabled",false);
//        $("#setSubmit").prop("disabled",false);
		$("#loginoutButton").prop( "disabled", false );
		
        ipaddr = cIp;
		window.localStorage.setItem( 'ipaddr', cIp );
		//alert( "Success!  Server located." );
		customAlert.alert("Server successfully located.", "Success!");
		setTimeout( function(){$("#getIPaddr").val( cIp );}, 250 );
		

	} )
	.fail( function(xhr, status, error) {
		//var err = JSON.parse( xhr );

    	$("#testIpSpin").toggle(false);
	    $("#testIpButton").toggle(true);

		$("#ipFeedback").attr('src','./img/x24.png')
		alert( "Error. Unable to connect to server." );
	} );
}

/*--------------------------------------------------------------------------------------------------------*/
function testIpAddr() {
	var cIp = ipaddr;
	var cTest = cIp.toUpperCase();

	if ( cTest.includes('DASH.') && ! cTest.includes('HTTP') ) {
		cIp = "https://" + cIp;
	
	} else if ( cTest.includes('DASH.') && cTest.includes('HTTP:') ) {
		cTest = cTest.replace("HTTP:", "HTTPS:");
		cIp = cTest.toLowerCase();
	
	} else if ( ! cTest.includes('HTTP') ) {
		cIp = "http://" + cIp;
	};

	$.ajax({
        url: cIp + "/checkForServer?",
        timeout: 2000
    } )
    .done(function() {
		ipaddr = cIp;
        window.localStorage.setItem( 'ipaddr', ipaddr );
		$("#getIPaddr").val( ipaddr );
		$("#ipFeedback").attr('src','./img/check24.png')
		return true;
	} )
	.fail(function() {
		$("#ipFeedback").attr('src','./img/x24.png')
		return false;
	} )
}

/*--------------------------------------------------------------------------------------------------------*/
function doLogin() {
	$('#closeSettingsIcon').toggle(false);
	$('#settingsIcon').toggle(true);
	$("#countDiv").toggle(false);
	$("#settingsDiv").toggle(false);
	$("#loginDiv").toggle(true);
}

/*--------------------------------------------------------------------------------------------------------*/
function sendLogin() {
	var cUser = $("#userID").val();
	var cPWD = $("#pswd").val();
	var cIp;

	cUser = cUser.trim();
	cPWD  = cPWD.trim();

	if ( ipaddr === "" ) {
		cIp = $("#getIPaddr").val();
	} else {
		cIp = ipaddr;
	}

	var cTest = cIp.toUpperCase();
	if ( cTest.includes('DASH.') && ! cTest.includes('HTTP') ) {
		cIp = "https://" + cIp;
	} else if ( cTest.includes('DASH.') && cTest.includes('HTTP:') ) {
		cTest = cTest.replace("HTTP:", "HTTPS:");
		cIp = cTest.toLowerCase();
	} else if ( ! cTest.includes('HTTP') ) {
		cIp = "http://" + cIp;
	};

    $.ajax({
        url: cIp + "/mobiLogin?",
		data: { uid: cUser, pwd: cPWD, proc: "count" },
        timeout: 3000
    } )
    .done(function( data ) {
		if ( data.result === "success" ) {
	        cUID = cUser;
	        $("#userNameLabel").html( "You are logged in as:&nbsp;" );
	        $("#userNameSpan").text( cUID );

	        $("#loginoutButton").text("Logout");
	        $("#loginoutButton").attr("onclick","logout()");

//			$("#setCancel").prop("disabled",false);

            window.localStorage.setItem('userID', cUID);

			ipaddr = cIp;
			window.localStorage.setItem( 'ipaddr', ipaddr );
			$("#getIPaddr").val( ipaddr );
	
			setTimeout(function() {
				backToMain();
				if (!$("#getQtyPara").is(":visible")) {
					moveBrowse(-1);
				}
			}, 1000);

		} else {
			alert("Login failed! " + data.msg);
		}
	} )
	.fail(function() {
		alert( "Error, unable to login." )
	} )

}

/*--------------------------------------------------------------------------------------------------------*/
function logout() {
	cUID = "";

	$("#userNameLabel").text( "You are not logged in." );
	$("#userNameSpan").text( "" );
	$("#pswd").val("");

    window.localStorage.setItem('userID', "");

	$("#loginoutButton").text("Login");
	$("#loginoutButton").attr("onclick","doLogin()");

//	$("#setCancel").prop("disabled",true);
//	$("#setSubmit").prop("disabled",true);

	goToSettings();
}

function ipImageX() {
	$("#ipFeedback").attr('src','./img/x24.png')
}

/*--------------------------------------------------------------------------------------------------------*/
function alertDismissed() {
	console.log('alert dismissed');
	return;
}

/*--------------------------------------------------------------------------------------------------------*/
function bogusFunc() {
	return;
}

function CustomAlert(){
	this.alert = function(message,title){
		let txtArr = $("input[type=text]");
		let chkArr = $("input[type=checkbox]");
		let txtVal = [];
		let chkVal = [];
		$.each(txtArr, function(ind,el) {let x = el.value; txtVal.push(x);});
		$.each(chkArr, function(ind,el) {let y = el.checked; chkVal.push(y);});

	  document.body.innerHTML = document.body.innerHTML + '<div id="dialogoverlay"></div><div id="dialogbox" class="slit-in-vertical"><div><div id="dialogboxhead"></div><div id="dialogboxbody"></div><div id="dialogboxfoot"></div></div></div>';
  
	  let dialogoverlay = document.getElementById('dialogoverlay');
	  let dialogbox = document.getElementById('dialogbox');
	  
	  let winH = window.innerHeight;
	  dialogoverlay.style.height = winH+"px";
	  
	  dialogbox.style.top = "150px";
  
	  dialogoverlay.style.display = "block";
	  dialogbox.style.display = "block";
	  
	  document.getElementById('dialogboxhead').style.display = 'block';
  
	  if(typeof title === 'undefined') {
		document.getElementById('dialogboxhead').style.display = 'none';
	  } else {
		document.getElementById('dialogboxhead').innerHTML = title;
	  }
	  document.getElementById('dialogboxbody').innerHTML = message;
	  document.getElementById('dialogboxfoot').innerHTML = '<button class="pure-material-button-contained active" onclick="customAlert.ok()">OK</button>';

	  $.each(txtArr, function(ind,el) {el.value = txtVal[ind];});
	  $.each(chkArr, function(ind,el) {el.checked = chkVal[ind];});
	}
	
	this.ok = function(){
	  document.getElementById('dialogbox').style.display = "none";
	  document.getElementById('dialogoverlay').style.display = "none";
	}
  }

function togglePswd(chkbox) {
	// Note: jQuery won't change input type, use vanilla js
	let chkd = chkbox.checked;
	let inp = document.getElementById("pswd")

//  console.log("#togglePswd is " + (chkd ? "checked" : "not checked"));

	if (chkd) {
		inp.type = "text";
	} else {
		inp.type = "password";
	}
	inp.focus();
}