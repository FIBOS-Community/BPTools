var FIBOS = require('fibos.js');
var config = require('./config.js');

var producername = config.producername;
var proposer = config.proposer; //提案提出人名字
var httpEndpoint = config.httpEndpoint;
//联系
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
console.notice("---------connect to " + httpEndpoint + "----welcome " + producername + "--------");
choice();

//提案列表
function approvals() {
	var a = fibos.getTableRowsSync(true, "eosio.msig", proposer, "approvals");
	console.log(a)
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

function approve() {
	var proposal_name = console.readLine("proposal_name:");
	if (!proposal_name) {
		console.notice('no proposal_name');
		return;
	}
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
	approvals();
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
console.notice("--------------------------------------Account end--------------------------------------");