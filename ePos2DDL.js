/*==========================================================================*\
|| ######################################################################## ||
|| # encorePOS 1.0.000                                                    # ||
|| # ePos2DDL.js                                                             # ||
|| # -------------------------------------------------------------------- # ||
|| # Copyright ©2016-2026 Jupiter Software, LLC  All Rights Reserved.     # ||
|| # This file may not be redistributed in whole or significant part.     # ||
|| # ------------------ encorePOS IS NOT FREE SOFTWARE ------------------ # ||
|| # http://www.getproofpos.com | http://www.getproofpos.com/legal        # ||
|| ######################################################################## ||
\*==========================================================================*/

/*======= Functions to read PDF417 2D barcode on identifcation cards =======*/

function decode2D(str) {
	const lineSeparator = "\n";
	const props = {};
	const rawLines = str.trim().split(lineSeparator);
	const lines = rawLines.map(rawLine => sanitizeData(rawLine));

	let line1 = lines[1];
	// look for embedded data in this first line
	Object.keys(DLKeys).forEach(key => {
		if (line1.indexOf(key) > -1) {
			let nuLine = line1.slice(line1.indexOf(key));
			lines.push(nuLine);
		}
	});

	let started;
	lines.forEach(line => {
		if (!started) {
			if (line.indexOf("ANSI ") === 0 || line.indexOf("AAMVA") === 0) {
				started = true;
				let iin = getIIN(line);
				let dlST = getState(iin);
				if (dlST) {
					props["issueState"] = dlST;
				}
			}
			return;
		}

		let code = getCode(line);
		let value = getValue(line);
		let key = getKey(code);
		if (!key) {
			return;
		}

		// handle old full name field
		if (code === 'DAA') {
			key = getKey('DCS');
			props[key.label] = { value: getLast(value), prefix: key.prefix, element: key.element };

			key = getKey('DAC');
			props[key.label] = { value: getFirst(value), prefix: key.prefix, element: key.element };
			return;
		}

		// handle old first name field
		if (code === 'DCT') value = getFirstFormat(value);

		// if full ZIP+4, hyphenate the +4
		if (isZip(code)) value = getZipFormat(value);

		// convert 1/2 to M/F
		if (isSexField(code)) value = getSex(code, value);

		// see if this is a veteran
		if (isVetField(code)) value = getVetStatus(value);

		// some states fill empty fields with "NONE"
		if (value.toUpperCase() === "NONE") return;

		// format dates
		props[key.label] = { value: isDateField(key.label) ? getDateFormat(value) : value, prefix: key.prefix, element: key.element };

	});

	// some states put full name in last name field!
	if (props["lastName"] && props["firstName"] && props["firstName"].value.trim().length === 0) {
		props["firstName"].value = getFirst(props["lastName"].value);
		props["lastName"].value = getLast(props["lastName"].value);
	}

	console.log(props);

	return props;
};

const sanitizeData = rawLine => rawLine.match(/[\011\012\015\040-\177]*/g).join('').trim();

const getCode = line => line.slice(0, 3);
const getValue = line => line.slice(3);
const getKey = code => DLKeys[code];

const getIIN = line => line.slice(5, 11);
const getState = iin => DLStates[iin];

const getLast = value => {
	let comma = value.indexOf(',');
	let space = value.indexOf(' ');
	let name = value;

	// comma delimited name will be: last,first,middle
	if (comma > -1) {
		name = value.slice(0, value.indexOf(','));

		// space delimited will be: first middle last
	} else if (space > -1) {
		let space2 = value.indexOf(' ', space + 1);
		if (space2 > -1) space = space2;
		name = value.slice(space+1);
	}
	return name;
};

const getFirst = value => {
	let comma = value.indexOf(',');
	let space = value.indexOf(' ');
	let name = value;

	// comma delimited name will be: last,first,middle
	if (comma > -1) {
		name = value.slice(comma + 1);
		if (name.charAt(name.length - 1) === ',') {
			name = name.slice(0, name.length - 1);
		}
		name = name.replace(',', ' ');
		name = name.replace(String.fromCharCode(188), ' ');
		if (name.slice(0,1)===' ') name = name.slice(1);

		// space delimited will be: first middle last
	} else if (space > -1) {
		let space2 = value.indexOf(' ', space + 1);
		if (space2 > -1) space = space2;
		name = value.slice(0, space);
	}
	return name;
};

const getFirstFormat = value => {
	value = value.replace(',', ' ');
	value = value.replace(String.fromCharCode(188), ' ');
	return value;
};

const isZip = code => code === "DAK";
const getZipFormat = value => {
	if (value.length === 9) {
		return value.slice(0, 5) + '-' + value.slice(5);
	} else {
		return value;
	}
};

const isSexField = code => code === "DBC";
const getSex = (code, value) => (value === "1" ? "M" : "F");

const isVetField = code => code === 'DDL';
const getVetStatus = value => (value === "1" ? "YES" : "NO");

const isDateField = label => label.indexOf("date") === 0;
const getDateFormat = value => {
	let parts;
	if (Number(value.substring(0, 4) <= 1231)) {
		parts = [value.slice(0, 2), value.slice(2, 4), value.slice(4)];
	} else {
		parts = [value.slice(4, 6), value.slice(6), value.slice(0, 4)];
	}
	return parts.join("/");
};

const DLKeys = {
	DBA: { label: 'dateOfExpiry', element: 'idExpire', prefix: '' },
	DAA: { label: 'fullName', element: '', prefix: '' },   // older format
	DCS: { label: 'lastName', element: 'idLast', prefix: 'Last Name:' },
	DAC: { label: 'firstName', element: 'idFirst', prefix: 'First Name:' },
	DAD: { label: 'middleName', element: '', prefix: 'Middle:' },
	DCT: { label: 'firstName', element: 'idFirst', prefix: 'First Name:' },  // older format
	DBB: { label: 'dateOfBirth', element: 'idDOB', prefix: 'Birth Date:' },
	DBC: { label: 'sex', element: 'idSex', prefix: 'Sex:' },
	DAG: { label: 'addressStreet', element: 'idStreet', prefix: 'Address:' },
	DAI: { label: 'addressCity', element: 'idCity', prefix: 'City:' },
	DAJ: { label: 'addressState', element: 'idState', prefix: 'State:' },
	DAK: { label: 'addressPostalCode', element: 'idZip', prefix: 'Zipcode:' },
	DAQ: { label: 'documentNumber', element: 'idNbr', prefix: 'License Nbr:' },
	DAH: { label: 'addressStreet2', element: 'idStreet2', prefix: 'Address2:' },
	DCU: { label: 'nameSuffix', element: 'idSuffix', prefix: '' }, // e.g. jr, sr
	DDL: { label: 'veteran', element: 'idVet', prefix: 'Veteran:' }
};

const DLStates = {
	636033: "AL",
	636059: "AK",
	604432: "AB",
	604427: "AS",
	636026: "AZ",
	636021: "AR",
	636028: "BC",
	636014: "CA",
	636056: "CU",
	636020: "CO",
	636006: "CT",
	636011: "DE",
	636043: "DC",
	636010: "FL",
	636055: "GA",
	636019: "GU",
	636047: "HI",
	636057: "HL",
	636050: "ID",
	636035: "IL",
	636037: "IN",
	636018: "IA",
	636022: "KS",
	636046: "KY",
	636007: "LA",
	636041: "ME",
	636048: "MB",
	636003: "MD",
	636002: "MA",
	636032: "MI",
	636038: "MN",
	636051: "MS",
	636030: "MO",
	636008: "MT",
	636054: "NE",
	636049: "NV",
	636017: "NB",
	636039: "NH",
	636036: "NJ",
	636009: "NM",
	636001: "NY",
	636016: "NF",
	636004: "NC",
	636034: "ND",
	604430: "MP",
	636013: "NS",
	604433: "NU",
	636023: "OH",
	636058: "OK",
	636012: "ON",
	636029: "OR",
	636025: "PA",
	604426: "PE",
	604431: "PR",
	604428: "QC",
	636052: "RI",
	636044: "SK",
	636005: "SC",
	636042: "SD",
	636027: "DP",
	636053: "TN",
	636015: "TX",
	636040: "UT",
	636024: "VT",
	636062: "VI",
	636000: "VA",
	636045: "WA",
	636061: "WV",
	636031: "WI",
	636060: "WY",
	604429: "YT"
};
