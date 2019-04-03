const FIBOS = require('fibos.js');
const config = {
	httpEndpoint: "http://to-rpc.fibos.io:8870",
	privatekey: '', //私钥
	publickey: '', //公钥
	account_name: '', //账户名,
	url: '', //官网，
	location: 1 //服务器地区码
};


const fibos = FIBOS({
	chainId: "6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a",
	keyProvider: config.privatekey,
	httpEndpoint: config.httpEndpoint,
	logger: {
		log: null,
		error: null
	}
});

const ctx = fibos.contractSync("eosio");
const a = ctx.regproducerSync(config.account_name, config.publickey, config.url, config.location, {
	"authorization": config.account_name
});
console.log(a);