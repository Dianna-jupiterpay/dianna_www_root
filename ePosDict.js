/*==========================================================================*\
|| ######################################################################## ||
|| # encorePOS 1.3.100.105                                                # ||
|| # ePosDict.js                                                          # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
\*==========================================================================*/

function setDictionary() {
	var oDict = {
		'Payment': {
			es: 'pago',
			en: 'Payment'
		},
		'<span class="material-icons tenderIcon">monetization_on</span> Cash': {
			es: '<span class="material-icons tenderIcon">monetization_on</span> efectivo',
			en: '<span class="material-icons tenderIcon">monetization_on</span> Cash'
		},
		'<span class="material-icons tenderIcon">create</span> Check': {
			es: '<span class="material-icons tenderIcon">create</span> cheque',
			en: '<span class="material-icons tenderIcon">create</span> Check'
		},
		'<span class="material-icons tenderIcon">credit_card</span> Card': {
			es: '<span class="material-icons tenderIcon">credit_card</span> tarjeta',
			en: '<span class="material-icons tenderIcon">credit_card</span> Card'
		},
		'<span class="material-icons tenderIcon">folder_shared</span> Account': {
			es: '<span class="material-icons tenderIcon">folder_shared</span> cuenta',
			en: '<span class="material-icons tenderIcon">folder_shared</span> Account'
		},
		'<span class="material-icons tenderIcon">card_giftcard</span> Gift': {
			es: '<span class="material-icons tenderIcon">card_giftcard</span> regalo',
			en: '<span class="material-icons tenderIcon">card_giftcard</span> Gift'
		},
		'<span class="material-icons tenderIcon">backspace</span> Backspace': {
			es: '<span class="material-icons tenderIcon">backspace</span> retroceso',
			en: '<span class="material-icons tenderIcon">backspace</span> Backspace'
		},
		'<span class="material-icons tenderIcon">keyboard_return</span> Enter': {
			es: '<span class="material-icons tenderIcon">keyboard_return</span> entrar',
			en: '<span class="material-icons tenderIcon">keyboard_return</span> Enter'
		},
		"nicknameErrMsg": {
			es: "Por favor ingrese el apodo",
			en: "Please enter nickname"
		},
		"nickname": {
			es: "Apodo para la venta",
			en: "Nickname for sale"
		},
		"createPT": {
			es: "Crear una transacción pendiente",
			en: "Create Pending Transaction"
		},
		"pendingSaved": {
			es: "Transacción guardada en el archivo pendiente.",
			en: "Transaction saved to the pending file."
		},
		"checksOK": {
			es: "Cheques bien",
			en: "Checks OK"
		},
		"noChecks": {
			es: "No hay cheques!",
			en: "NO Checks!"
		},
		"cashChkSuccess": {
			es: "Cheque grabado. Devolución de dinero = ",
			en: "Check recorded. Cash back = "
		},
		"cashBack": {
			es: "Retirar dinero",
			en: "Cash Back"
		},
		"cashChkFee": {
			es: "Cuota",
			en: "Fee"
		},
		"cashChkNbr": {
			es: "Compruebe No.",
			en: "Check Nbr"
		},
		"cashChk": {
			es: "Comprobar dinero",
			en: "Cash Check"
		},
		"expenseSuccess": {
			es: "El pago ha sido registrado.",
			en: "The payment has been recorded."
		},
		"expensePayment": {
			es: "Pago de gastos",
			en: "Expense Payment"
		},

		"amountZero": {
			es: "Por favor ingrese una cantidad.",
			en: "Please enter an amount."
		},
		"Note": {
			es: "Nota",
			en: "Note"
		},
		"userID": {
			es: "ID de usuario",
			en: "User ID"
		},
		"scanItem": {
			es: "Escanear producto",
			en: "Scan Item"
		},
		"dollarOff": {
			es: "$ descuento",
			en: "$ Off"
		},
		"coupon": {
			es: "Cupón",
			en: "Coupon"
		},
		"acctPayment": {
			es: "Pago de cuenta",
			en: "Account Payment"
		},
		"saleNote": {
			es: "Nota de venta",
			en: "Sale Note"
		},
		"mode": {
			es: "Modo",
			en: "Mode"
		},
		"depAmt": {
			es: "$ monto:",
			en: "$ Amount:"
		},
		"depNbr": {
			es: "No. Artículos:",
			en: "Nbr items:"
		},
		"depositCount": {
			es: "Número de items",
			en: "Number of items"
		},
		"depositDollars": {
			es: "Monto en dólares",
			en: "Dollar amount"
		},
		"depositReturn": {
			es: "Deposito de devolucion",
			en: "Deposit Return"
		},
		"exemptAlert": {
			es: "¿Exenta el impuesto de venta?",
			en: "Make sale tax exempt?"
		},
		"exemptPrompt": {
			es: "Compruebe qué impuestos están exentos:",
			en: "Check which taxes are exempt:"
		},
		"exemptTitle": {
			es: "Exento de impuestos",
			en: "Tax Exempt"
		},
		"lottoTitle": {
			es: "Lotería",
			en: "Lottery"
		},
		"lottoSale": {
			es: "Venta de loteria",
			en: "Lottery Sale"
		},
		"instantSale": {
			es: "Venta instantánea",
			en: "Instant Sale"
		},
		"lottoPayout": {
			es: "Pago de lotería",
			en: "Lottery Payout"
		},
		"instantPayout": {
			es: "Pago instantáneo",
			en: "Instant Payout"
		},
		"ageNotOK": {
			es: "Cliente no mayor de edad.",
			en: "Customer not legal age."
		},
		"ageOK1Only": {
			es: "La edad del cliente está bien solo para: ",
			en: "Customer's age OK only for: "
		},
		"ageOKAll": {
			es: "La edad del cliente está bien para todos los productos.",
			en: "Customer's age OK for all products."
		},
		"Yes": {
			es: "Sí",
			en: "Yes"
		},
		"No": {
			es: "No",
			en: "No"
		},
		"State": {
			es: "Estado",
			en: "State"
		},
		"City": {
			es: "Ciudad",
			en: "City"
		},
		"Sex": {
			es: "Sexo",
			en: "Sex"
		},
		"LicenseNbr": {
			es: "No. Licencia",
			en: "License Nbr"
		},
		"Address2": {
			es: "Dirección2",
			en: "Address2"
		},
		"Address": {
			es: "Dirección",
			en: "Address"
		},
		"FirstName": {
			es: "Nombre de pila",
			en: "First Name"
		},
		"LastName": {
			es: "Apellido",
			en: "Last Name"
		},
		"BirthDate": {
			es: "Nacimiento",
			en: "Birth Date"
		},
		"Tobacco": {
			es: "Tabaco",
			en: "Tobacco"
		},
		"badDL": {
			es: "¡El escaneo de identificación no ha tenido éxito!",
			en: "Identification scan unsuccessful!"
		},
		"qwikDiscAllMsg": {
			es: "Descuento aplicado a todas las líneas.",
			en: "Discount applied to all lines."
		},
		"qwikDiscLineMsg": {
			es: "Descuento aplicado a la línea",
			en: "Discount applied line"
		},
		"discPoolMsg": { 
			es: "Grupo de descuento aplicado a la fila",
			en: "Discount pool applied to row"
		},
		"minPriceTitle": {
			es: "Mínimo Precio",
			en: "Minimum Price"
		},
		"minPriceMsg": {
			es: "debajo del precio mínimo. Precio/descuento ajustado.",
			en: "below minimum price. Price/discount adjusted."
		},
		"limit2CostTitle": {
			es: "Límite al costo",
			en: "Limit to Cost"
		},
		"limit2CostMsg": {
			es: "debajo del costo. Precio/descuento ajustado.",
			en: "below cost. Price/discount adjusted."
		},
		"groupEm": {
			es: "Añadido a la línea",
			en: "Added to line"
		},
		"Hold": {
			es: "Pausa",
			en: "Hold"
		},
		"PAY": {
			es: "PAGA",
			en: "PAY"
		},
		"change": {
			es: "Cambiar debido a",
			en: "Change Due"
		},
		"delUndoSingle": {
			es: "ha sido eliminado",
			en: "has been deleted"
		},
		"delUndoMulti": {
			es: "líneas han sido eliminadas",
			en: "lines have been deleted"
		},
		"gBarDiscUndo": {
			es: "Acción de descuento invertida",
			en: "Discount action reversed"
		},
		"delUndone": {
			es: "Borrar la acción invertida",
			en: "Delete action reversed"
		},
		"refUndoSingle": {
			es: "reembolsada",
			en: "marked for refund"
		},
		"refUndoMulti": {
			es: "lineas devueltas",
			en: "lines marked for refund"
		},
		"refUndone": {
			es: "Acción de reembolso invertida",
			en: "Refund action reversed"
		},
		"UNDO": {
			es: "CANCELAR",
			en: "UNDO"
		},
		"removeCust": {
			es: "Eliminar cliente",
			en: "Remove customer"
		},
		"backspace": {
			es: "Retroceso",
			en: "Backspace"
		},
		"enter": {
			es: "ENTRAR",
			en: "ENTER"
		},
		"saleEnter": {
			es: "Entrar",
			en: "Enter"
		},
		"totalDue": {
			es: "Total a pagar",
			en: "Total Due"
		},
		"balance": {
			es: "Saldo deudor",
			en: "Balance Due"
		},
		"change": {
			es: "Cambio debido",
			en: "Change Due"
		},
		"Cash": {
			es: "Efectivo",
			en: "Cash"
		},
		"Check": {
			es: "Cheque",
			en: "Check"
		},
		"Account": {
			es: "Cuenta",
			en: "Account"
		},
		"Card": {
			es: "Tarjeta",
			en: "Card"
		},
		"Gift": {
			es: "Regalo",
			en: "Gift"
		},
		"Foreign": {
			es: "Extranjera",
			en: "Foreign"
		},
		"processing": {
			es: "en proceso",
			en: "Processing"
		},
		"miscTitle": {
			es: "Venta miscelánea",
			en: "Miscellaneous Sale"
		},
		"miscBeer": {
			es: "Cerveza",
			en: "Beer"
		},
		"miscLiquor": {
			es: "Espíritu",
			en: "Liquor"
		},
		"miscMisc": {
			es: "Miscelánea",
			en: "Miscellaneous"
		},
		"miscSnacks": {
			es: "Tentempié",
			en: "Snacks"
		},
		"miscWine": {
			es: "Vino",
			en: "Wine"
		},
		"Misc Sale": {
			es: "Venta misc",
			en: "Misc Sale"
		},
		"Refunds": {
			es: "Reembolsos",
			en: "Refunds"
		},
		"refundSingleLine": {
			es: "Reembolsar un artículo",
			en: "Refund one item"
		},
		"refundAllLines": {
			es: "Reembolsar todos los artículos",
			en: "Refund ALL items"
		},
		"emptyText": {
			es: "No hay artículos en venta.",
			en: "No items in sale."
		},
		"emptyOrder": {
			es: "No hay artículos en orden.",
			en: "No items in order."
		},
		"No items in sale.": {
			es: "No hay artículos en venta.",
			en: "No items in sale."
		},
		"errorMsg": {
			es: "Se ha producido un error.",
			en: "An error has occurred."
		},
		"Records": {
			es: "Registros",
			en: "Records"
		},
		"saleRow": {
			es: "Fila",
			en: "Line"
		},
		"saleItem": {
			es: "Artículos",
			en: "Item"
		},
		"salePack": {
			es: "Env.",
			en: "Pack"
		},
		"saleQty": {
			es: "Cant.",
			en: "Qty"
		},
		"saleDisc": {
			es: "%DTO",
			en: "Disc%"
		},
		"salePrice": {
			es: "Precio",
			en: "Price"
		},
		"saleTotal": {
			es: "Total",
			en: "Total"
		},
		"salePromo": {
			es: "Prom",
			en: "Sale"
		},
		"doFerPrompt": {
			es: "¿Número de línea?:",
			en: "Line number:"
		},
		"f6PermanentTitle": {
			es: "¿Cambio permanente?",
			en: "Permanent Change?"
		},
		"f6PermanentPrompt": {
			es: "¿Desea hacer este cambio permanente?",
			en: "Do you want to make this change permanent?"
		},
		"f3Barcode": {
			es: "Codigo de <u>b</u>arras",
			en: "<u>B</u>arcode"
		},
		"f3Brand": {
			es: "Ma<u>r</u>ca",
			en: "B<u>r</u>and"
		},
		"f3Descrip": {
			es: "<u>D</u>escrip",
			en: "<u>D</u>escrip"
		},
		"f3Size": {
			es: "T<u>a</u>maño",
			en: "S<u>i</u>ze"
		},
		"f3Type": {
			es: "<u>T</u>ipo",
			en: "<u>T</u>ype"
		},
		"f3Price": {
			es: "<u>P</u>recio",
			en: "<u>P</u>rice"
		},
		"f8Number": {
			es: "Nú<u>m</u>ero",
			en: "Nu<u>m</u>ber"
		},
		"f8Name": {
			es: "<u>N</u>ombre",
			en: "<u>N</u>ame"
		},
		"f8Phone": {
			es: "Teléf<u>o</u>no",
			en: "Ph<u>o</u>ne"
		},
		"f8Purchases": {
			es: "Com<u>p</u>ras",
			en: "<u>P</u>urchases"
		},
		"f8LastOrder": {
			es: "Ú<u>l</u>timo pedido",
			en: "<u>L</u>ast Order"
		},
		"f8CityST": {
			es: "<u>C</u>iudad, Estado",
			en: "<u>C</u>ity, ST"
		},
		"f8Zip": {
			es: "<u>Z</u>ip",
			en: "<u>Z</u>ip"
		},
		"Product List": {
			es: "Lista de productos",
			en: "Product List"
		},
		"Customer List": {
			es: "Lista de clientes",
			en: "Customer List"
		},
		"Barcode": {
			es: "Código de barras",
			en: "Barcode"
		},
		"Brand": {
			es: "Marca",
			en: "Brand"
		},
		"Descrip": {
			es: "Descrip",
			en: "Descrip"
		},
		"Size": {
			es: "Tamaño",
			en: "Size"
		},
		"Type": {
			es: "Tipo",
			en: "Type"
		},
		"custEx": {
			es: "¿Desea eliminar al cliente de esta venta?",
			en: "Remove customer from this sale?"
		},
		"Discount Item": {
			es: "Aplicar descuento",
			en: "Discount Item"
		},
		"editItem": {
			es: "Línea de edición",
			en: "Edit Item"
		},
		"editQty": {
			es: "Editar cantidad",
			en: "Edit Qty"
		},
		"editDiscount": {
			es: "Editar descuento",
			en: "Edit Discount"
		},
		"editPrice": {
			es: "Editar precio",
			en: "Edit Price"
		},
		"editTotal": {
			es: "Editar total",
			en: "Edit Total"
		},
		"editTax": {
			es: "Editar impuesto",
			en: "Edit Tax"
		},
		"editDepo": {
			es: "Editar deposito",
			en: "Edit Deposit"
		},
		"Delete Item": {
			es: "Eliminar elemento",
			en: "Delete Item"
		},
		"Return Item": {
			es: "Devolver objeto",
			en: "Return Item"
		},
		"Case Qty Sale": {
			es: "Venta de cajas",
			en: "Case Qty Sale"
		},
		"At Case Price": {
			es: "Al precio del caso",
			en: "At Case Price"
		},
		"Pop Item": {
			es: "Detalle del articulo",
			en: "Pop Item"
		},
		"SalesTax": {
			es: "Impuesto",
			en: "Sales Tax"
		},
		"Taxes": {
			es: "Impuestos",
			en: "Taxes"
		},
		"Subtotal": {
			es: "Total parcial",
			en: "Subtotal"
		},
		"Deposit": {
			es: "Deposito",
			en: "Deposit"
		},
		"Returns": {
			es: "Devoluciones",
			en: "Returns"
		},
		"custNum": {
			es: "Cliente No",
			en: "Customer Nbr"
		},
		"ok": {
			es: "SÍ",
			en: "OK"
		},
		"cancel": {
			es: "CANCELAR",
			en: "CANCEL"
		},
		"unknownItemTitle": {
			es: "Artículos desconocidos",
			en: "Unknown Items"
		},
		"unknownItemPrompt": {
			es: "Hay artículos desconocidos en este orden. ¿Seguir?",
			en: "There are unknown items in this order. Continue?"
		},
		"f3QtyTitle": {
			es: "Cantidad de venta",
			en: "Sale Quantity"
		},
		"f3QtyPrompt": {
			es: "Ingrese la cantidad de ",
			en: "Enter qty of "
		},
		"f4Title": {
			es: "¿Venta nula?",
			en: "Void Sale?"
		},
		"f4Prompt": {
			es: "¿Desea eliminar todas las filas?",
			en: "Proceed to delete all rows?"
		},
		"f4poTitle": {
			es: "Void Purchase Order?",
			en: "Void Purchase Order?"
		},
		"f4poPrompt": {
			es: "Proceed to delete all rows?",
			en: "Proceed to delete all rows?"
		},
		"f5Title": {
			es: "Eliminar línea",
			en: "Line Delete"
		},
		"f5Prompt": {
			es: "¿Estás seguro de que quieres eliminar la fila",
			en: "Are you sure you want to delete row"
		},
		"f6Title": {
			es: "Edición de línea",
			en: "Line Edit"
		},
		"f6Qty": {
			es: "Cantidad",
			en: "Quantity"
		},
		"f6Disc": {
			es: "% Descuento",
			en: "% Discount"
		},
		"f6cases": {
			es: "Cases",
			en: "Cases"
		},
		"f6units": {
			es: "Units",
			en: "Units"
		},
		"f6caseCost": {
			es: "Case Cost",
			en: "Case Cost"
		},
		"f6unitCost": {
			es: "Unit Cost",
			en: "Unit Cost"
		},
		"gBarDiscPrompt": {
			es: "Descuento por lineas seleccionadas",
			en: "Discount for selected lines"
		},
		"gBarDiscMsg": {
			es: "líneas de descuento",
			en: "lines discounted"
		},
		"gBarDiscMsg1": {
			es: "Una línea de descuento",
			en: "One line discounted"
		},
		"discounted": {
			es: "con descuento",
			en: "discounted"
		},
		"allDiscounted": {
			es: "Todas las filas con descuento.",
			en: "All rows discounted."
		},
		"f7Title": {
			es: "Porcentaje de descuento",
			en: "Percent Discount"
		},
		"Mode": {
			es: "Modo",
			en: "Mode"
		},
		"f7SingleLine": {
			es: "Aplicar a una sola línea",
			en: "Apply to single line"
		},
		"f7AllLines": {
			es: "Aplicar a todos los artículos",
			en: "Apply to ALL lines"
		},
		"Percent": {
			es: "Por ciento",
			en: "Percent"
		},
		"LineNbr": {
			es: "Línea No.",
			en: "Line Nbr"
		},
		"f10Title": {
			es: "Venta de cajas",
			en: "Case Sale"
		},
		"f10Prompt": {
			es: "No. de casos",
			en: "Nbr of cases"
		},
		"scanError": {
			es: "¡Ha habido un problema!",
			en: "Sorry, there was a problem!"
		},
		"Help": {
			es: "Ayuda",
			en: "Help"
		},
		"Logout": {
			es: "Cerrar",
			en: "Logout"
		},
		"Items": {
			es: "Artículos",
			en: "Items"
		},
		"Void": {
			es: "Invalidar",
			en: "Void"
		},
		"VOID": {
			es: "Inval",
			en: "VOID"
		},
		"Refund": {
			es: "Reembolso",
			en: "Refund"
		},
		"Delete": {
			es: "Borrar",
			en: "Delete"
		},
		"Edit": {
			es: "Editar",
			en: "Edit Item(s)"
		},
		"Info": {
			es: "Información",
			en: "Info"
		},
		"Item":	{
			es: "Artículo",
			en: "Item"
		},
		"Void": {
			es: "Invalidar",
			en: "Void"
		},
		"Discount": {
			es: "Descuento",
			en: "Discount"
		},
		"Customers": {
			es: "Clientes",
			en: "Customers"
		},
		"Tender": {
			es: "Ofertar",
			en: "Tender"
		},
		"Case Sale": {
			es: "Cajas",
			en: "Case Sale"
		},
		"@Case": {
			es: "en Caso",
			en: "@Case"
		},
		"Cash Sale": {
			es: "Venta en efectivo",
			en: "Cash Sale"
		},
		"itemCode": {
			es: "Código",
			en: "Item Code"
		},
		"Item Code": {
			es: "Código",
			en: "Item Code"
		},
		"Go": {
			es: "Vamos",
			en: "Go"
		},
		"Line": {
			es: "Fila",
			en: "Line"
		},
		"Item": {
			es: "Artículos",
			en: "Item"
		},
		"Pack": {
			es: "Env.",
			en: "Pack"
		},
		"Qty": {
			es: "Cant",
			en: "Qty"
		},
		"Disc%": {
			es: "%DTO",
			en: "Disc%"
		},
		"Price": {
			es: "Precio",
			en: "Price"
		},
		"Total": {
			es: "Total",
			en: "Total"
		},
		"Tax": {
			es: "Imp",
			en: "Tax"
		},
		"Dep": {
			es: "Dep",
			en: "Dep"
		},
		"Sale": {
			es: "Venta",
			en: "Sale"
		},
		"qtySoldTitle": {
			es: "Cantidad Vendida",
			en: "Quantity Sold"
		},
		"qtySoldPrompt": {
			es: "Ingrese la cantidad vendida",
			en: "Enter quantity sold"
		},
		"noOrders": {
			es: "No se encontraron pedidos.",
			en: "No orders found."
		},
		"ordDeleteTitle": {
			es: "¿Eliminar pedido?",
			en: "Delete Order?"
		},
		"ordDeletePrompt": {
			es: "¿Eliminar permanentemente la orden # ",
			en: "Permanently delete order # "
		},
		"OrderDeleted": {
			es: "Orden eliminada",
			en: "Order deleted"
		},
		"Delete Order": {
			es: "Eliminar pedido",
			en: "Delete Order"
		},
		"approved": {
			es: "¡APROBADO!",
			en: "APPROVED!"
		},
		"actionDenied": {
			es: "Acción no permitida.",
			en: "Action not allowed."
		},
		"invRecall": {
			es: "Recuperar factura",
			en: "Invoice Recall"
		},
		"foundInv": {
			es: "Factura encontrada",
			en: "Invoice located"
		},
		"invNbr": {
			es: "Número",
			en: "Number"
		},
		"invSta": {
			es: "Estación",
			en: "Station"
		},
		"invDate": {
			es: "Fecha",
			en: "Date"
		},
		"invRecallPrompt": {
			es: "¿Es esta la factura a recuperar?",
			en: "Is this the invoice to recall?"
		},
		"noSaleLog": {
			es: "Motivo de no venta",
			en: "No Sale Reason"
		},
		"enterReceiptNbr": {
			es: "Ingrese el número de recibo",
			en: "Enter receipt number"
		}
	}

	return oDict;
}
