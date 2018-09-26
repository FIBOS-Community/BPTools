var FIBOS = require('fibos.js');
var config = require('./config.js');
//asciitable
var AsciiTable = require('ascii-table')

var producername = config.producername;
var proposer = config.proposer;
var httpEndpoint = config.httpEndpoint;


var fibos = FIBOS({
	chainId: config.chainId,
	keyProvider: config.privatekey,
	httpEndpoint: httpEndpoint,
	logger: {
		log: null,
		error: null
	}
});
var ctx = fibos.contractSync("eosio.msig");
console.log("-------connect to " + httpEndpoint + "-------");
console.log("-------welcome " + producername + "-------");


showApprovals(proposer);

//1.show approvals name
function showApprovals(pname) {
	console.notice("-------show " + pname + "`s approvals-------")
	var a = fibos.getTableRowsSync(true, "eosio.msig", pname, "approvals");
	var appr = [];
	var table = new AsciiTable();
	table.setHeading('', 'Name')
	a.rows.forEach(function(d, index) {
		table.addRow(index + 1, d.proposal_name)
	});

	while (true) {
		console.notice(table.toString());
		var index = Number(console.readLine("choice NO:\n"));
		if (index && a.rows[index - 1]) break;
	}
	showApprovalsInfo(pname, index - 1);
}

function showApprovalsInfo(pname, pindex) {
	var a = fibos.getTableRowsSync(true, "eosio.msig", pname, "approvals");
	var appr = [];
	var appinfo = a.rows[pindex];
	if (!appinfo) {
		showApprovals(pname)
		return;
	}
	var table = new AsciiTable(appinfo.proposal_name);

	table.setHeading('', 'actor', 'permission', 'approve');
	console.log(appinfo)
	var providedarr = [];
	appinfo.provided_approvals.map(function(d) {
		d.provided = true;
		return d;
	});
	var arr = appinfo.provided_approvals.concat(appinfo.requested_approvals);
	arr.forEach(function(dd, index) {
		table.addRow(index + 1, dd.actor, dd.permission, dd.provided ? "ok" : "");
	});
	console.notice(table.toString());
	while (true) {
		console.notice('1. approve \n2. unapprove\n3. back\n4. refresh\n5. exit\n');
		var cnum = Number(console.readLine("choice:\n"));
		if (cnum) break;
	}
	if (cnum == 3) {
		showApprovals(pname);
	} else if (cnum == 1) {
		try {
			approve(appinfo.proposal_name);
		} catch (e) {
			console.error(e);
		}
	} else if (cnum == 2) {
		try {
			unapprove();
		} catch (e) {
			console.error(e);
		}

	} else if (cnum == 4) {
		showApprovalsInfo(pname, pindex);
	}
}

function approve(proposal_name) {
	var ctx = fibos.contractSync("eosio.msig");
	var a = ctx.approveSync({
		"proposer": proposer,
		"proposal_name": proposal_name,
		"level": {
			"actor": producername,
			"permission": "active"
		}
	}, {
		"authorization": producername
	})
}

function unapprove() {
	var proposal_name = console.readLine("proposal_name:");
	if (!proposal_name) {
		console.notice('no proposal_name');
		return;
	}
	console.log(proposal_name, proposer, producername)
	var ctx = fibos.contractSync("eosio.msig");
	var a = ctx.unapproveSync({
		"proposer": proposer,
		"proposal_name": proposal_name,
		"level": {
			"actor": producername,
			"permission": "active"
		}
	}, {
		"authorization": producername
	})
}

function approvals() {
	var a = fibos.getTableRowsSync(true, "eosio.msig", proposer, "approvals");
	a.rows.forEach(function(d) {
		console.notice('proposal_name: ', d.proposal_name);
		console.notice('approve / all : ' + d.provided_approvals.length + "/" + (d.requested_approvals.length + d.provided_approvals.length));
		console.notice('requested:');
		d.requested_approvals.forEach(function(dd, index) {
			console.log(index + 1, '. actor: ', dd.actor, 'permission: ', dd.permission);
		});

		console.notice('approve:');
		d.provided_approvals.forEach(function(dd, index) {
			console.log(index + 1, '. actor: ', dd.actor, 'permission: ', dd.permission);
		});
	});
}



function choice() {
	console.notice("----------start------------")
	console.log("1.approvals list \n2.approve");
	var index = Number(console.readLine("choice:"));

	switch (index) {
		case 1:
			approvals();
			break;
		case 2:
			approve();
			break;

	}
	console.notice("------------end------------")
	choice();
}