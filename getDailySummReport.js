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
            var aNumCols = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
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
            var colCount = $("#dailySummHdrRow").children().length;

            for (i = 0; i < nDept; i++) {
                if (colCount === 30 ) {
                    $("#dailySummHdrRow").append("<th>" + data.aDept[i] + "</th>");
                }
                nCol = 30 + i;
                aNumCols.push(nCol);
                aDeptCols.push(nCol);
                cDept = 'Dept_' + parseInt(i + 1);
                colArray.push({ data: cDept });
            }
            if (colCount === 30 ) {                
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
                        if (dailyDeptToggle === 'SHOW') {
                            for (var i = 0; i < nDept; i++) {
                                dailySummTable.column(30 + i).visible(false, true);
                            }
                            dailySummTable.columns.adjust().draw(false);
                            this.text(svgShow);
                            $('#svgHideShow').parent().parent().attr('title','  Show Depts  ');
                            dailyDeptToggle = 'HIDE';
                        } else {
                            for (var i = 0; i < nDept; i++) {
                                dailySummTable.column(30 + i).visible(true, true);
                            }
                            dailySummTable.columns.adjust().draw(false);
                            this.text(svgHide);
                            $('#svgHideShow').parent().parent().attr('title','  Hide Depts  ');
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
                    { className: 'iconCell', targets: [0] }, // { visible: (dailyDeptToggle === 'SHOW'), targets: aDeptCols },
                    { targets: [30 + nDept, 31 + nDept], visible: false, searchable: false, orderable: false }
                ],
                order: [[31 + nDept, 'asc']],
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
                        for (var i = 0; i < nDept; i++) {
                            $("#dailySummTable").DataTable().column(30 + i).visible(false, true);
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
                if ($(this).index() == 12 && cellText != '**WEEK**' && cellText != '**PERIOD**' && cellText != '**MONTH**') {
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

