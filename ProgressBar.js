/*********************************************************************************************/
//  PROGRESSBAR.PRG
//
//  Copyright (C) 2004, ACTI-$OFT(r) - 23296684 QUEBEC INC.
//  All rights reserved.
//
//  Author:        Alain Boucher
//  E-mail:        alain.boucher@acti-soft.com
//
//  Date Created : Nov 20, 2004
//  Last Modified: Nov 22, 2004
/*********************************************************************************************/

function ProgressBar(TableId,ColrStandard,ColrHilite,nProgress) {
  var tbl  = document.getElementById(TableId);
  var rows = tbl.getElementsByTagName('tr');
  var cels = rows[0].getElementsByTagName('td');
  cels[0].innerHTML=nProgress+"0%";
  for (var nColn=1; nColn<cels.length;nColn++) {
    if (nColn>nProgress) {
      cels[nColn].style.background=ColrStandard;
    } else {
    	  cels[nColn].style.background=ColrHilite;
    }
  }
}

function ReplaceBodyContent(TableId,cContent) {
  var tbl  = document.getElementById(TableId);
  var rows = tbl.getElementsByTagName('tr');
  var cels = rows[0].getElementsByTagName('td');
  cels[0].innerHTML=cContent;
}