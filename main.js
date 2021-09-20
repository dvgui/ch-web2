// Settings

const URL_BLUE = "https://api.bluelytics.com.ar/v2/latest";

// Functions

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function clearTokenDisplay() {
    for (let token of tokens) {
        token.displayed = false;
    }
}
function printToken(token) {
    $("#tblPrice").append(`
                <tr>
                <td>${token.name}</td>
                <td>U$S ${token.priceStr()}</td>
                <td class="ars">ARS ${token.inPesosStr()}</td>
                <td><a class="fav" id="fav-${token.name}"><i class="fas fa-star"></i></a></td>
                </tr>
                `);
    if (favs.isFavorite(token.name)) {
        $(`#fav-${token.name} .fas`).css('color','gold');
    }
    else {
        $(`#fav-${token.name} .fas`).css('color','grey');
    }
    token.displayed = true;

    $(`#fav-${token.name}`).on('click', function() {
        if (favs.isFavorite(token.name)) {
            favs.remove(token.name);
            $(`#fav-${token.name} .fas`).css('color','grey');
        }
        else {
            favs.add(token.name);
            $(`#fav-${token.name} .fas`).css('color','gold');
        }
    });
}

function metaConnect(response){
    chainId = parseInt(response.chainId);
    signer = provider.getSigner();

    //Fetch default account
    provider.listAccounts().then(async (accounts) => {
        wallet_address = accounts[0];
        if (wallet_address) {
            console.log("Reconnected account:", wallet_address);
            let balance = await provider.getBalance(await signer.getAddress())
            console.log("ETH Balance: " + ethers.utils.formatEther(balance));
            $("#walletConnect button").removeClass('btn-danger').addClass('btn-success');
        }
    });
}

// Classes

class Favorites {
    constructor(){
        this.tokens = [];
        this.restore();
    }
    add(token_name){
        //receives name
        if (!this.tokens.includes(token_name)) {
            this.tokens.push(token_name);
            this.save();
        }
    }
    remove(token_name){
        //receives name
        if (this.tokens.includes(token_name)) {
            const index = this.tokens.indexOf(token_name);
            if (index > -1) {
                this.tokens.splice(index, 1);
            }
            this.save();
        }
    }
    save(){
        localStorage.clear();
        localStorage.setItem("tokens",JSON.stringify(this.tokens));
    }
    restore(){
        const restored = localStorage.getItem("tokens");
        if (restored) {
            this.tokens = JSON.parse(restored);
        }
    }
    isFavorite(token_name) {
        //receives token name
        if (this.tokens.includes(token_name)){
            return true;
        }
    }
}



class Token{
    constructor(name, price, contract) {
        this.name = name;
        this.price = parseFloat(price);
        this.contract = new Contract(contract.network, contract.address)
        this.displayed = false;
        this.balance = 0;
    }
    inPesos(){
        return this.price * 185;
    }
    inPesosStr(){
        return numberWithCommas(this.inPesos()*185);
    }
    priceStr(){
        return numberWithCommas(this.price);
    }
    inCurrency(currency){
        return this.price * currency;
    }
}

class Contract {
    constructor (network, address) {
        this.network = network;
        this.address = address;
    }
}


// INIT

const token1 = new Token("btc", 40000,{
    network :'eth',
    address : '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
});
const token2 = new Token("eth", 3000,{
    network : 'eth',
    address : ''
});
const token3 = new Token("zil", 0.13,{
    network : 'zil',
    address : ''
});

let tokens = [token1, token2, token3];
let wallet_address, chainId, signer;


const favs = new Favorites();

// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum);

// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...


let prices = document.getElementById("tblPrice");




$(function() {
    $("#resetBtn").on('click', function (){
        const parent = prices;
        while (parent.firstChild) {
            parent.firstChild.remove()
        }
        clearTokenDisplay();
    });

    $("#loadBtn").on('click', function(){
        for (let token of tokens) {
            if (!token.displayed){
                printToken(token);
            }
        }
    });
    $(".navbar-search").submit(function(e) {
        e.preventDefault();
        let formValues = new FormData(e.target);
        let coin = formValues.get("coin");
        for (let token of tokens){
            if (coin === token.name && !token.displayed) {
                    $("#resetBtn").trigger('click');
                    printToken(token);
            }
        }
    });


    $('body').ready(() => {
        $("#loadBtn").trigger('click');

    });
    //initial connect
    $('#walletConnect').on('click', async () => {
        signer = provider.getSigner()
        await provider.send("eth_requestAccounts", []);
        wallet_address = await signer.getAddress()
        // log
        console.log("Connected account:", wallet_address);
        let balance = await provider.getBalance(await signer.getAddress())
        console.log("ETH Balance: " + ethers.utils.formatEther(balance));
        //$("#walletDisconnect").removeClass('d-none');
        $("#walletConnect button").removeClass('btn-danger').addClass('btn-success');
        // TODO: detect when wallet is available & change icon to green.
        // TODO: warn when network is not ethereum
        // TODO: list tokens


    });
    $('#walletDisconnect').on('click', async () =>{
        // TODO desconect from metamask
        // ethereum.on('accountsChanged', handler: (accounts: Array<string>) => void);

        $('#walletDisconnect').hide();
    });




});
// detect if metamask is available
//log
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}
else {
    console.log('Metamask is not installed');
    $('#walletDisconnect').hide();
}

window.ethereum.on('chainChanged', () => {
    window.location.reload();
});
window.ethereum.on('disconnect', () => {
    window.location.reload();
});
/*
TODO: añadir evento a conexion en vez de al click del boton. para que se dispare cuando metamask engancha.
*/

//reconnect
window.ethereum.addListener('connect', async (response) => {
    metaConnect(response);
});

window.ethereum.addListener('disconnect', () => {
    console.log("Wallet disconnected");
    $("#walletConnect button").removeClass('btn-success').addClass('btn-info');
});
window.ethereum.addListener('accountsChanged', async (response) => {
    metaConnect(response);
});