// Settings

const URL_BLUE = "https://api.bluelytics.com.ar/v2/latest";
const TOKEN_API = "https://api.ethplorer.io/getAddressInfo/";
const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets?'
const API_KEY = "freekey";
//const API_KEY = "EK-rWV3K-2edNdjh-LbjbJ";

// Functions

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
function clearTokenDisplay() {
    for (let token of wallet_tokens) {
        token.displayed = false;
    }
}
function printToken(token, dollar) {
    $("#tblPrice").append(`
                <tr>
                <td>${token.name}</td>
                <td>U$S ${token.priceStr()}</td>
                <td class="ars">ARS ${numberWithCommas(token.inCurrency(dollar))}</td>
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
function metaConnect(chainId){
    chainId = parseInt(chainId);
    signer = provider.getSigner();

    //Fetch default account
    provider.listAccounts().then(async (accounts) => {
        let wallet_address = accounts[0];
        if (wallet_address) {
            console.log("Connected account:", wallet_address);
            setAddress(wallet_address);
            let balance = await provider.getBalance(await signer.getAddress())
            console.log("ETH Balance: " + ethers.utils.formatEther(balance));

            //Logic for ERC20

            $("#walletConnect button").removeClass('btn-danger').addClass('btn-success');
        }
    });
}
function setAddress(wallet_address){
    if (wallet_address){
        $("#walletAddress").html(wallet_address.slice(0, 6) + "..." + wallet_address.slice(-4));
    }
    else {
        $("#walletAddress").html();
    }
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
    constructor(name, symbol , price = 0, contract = 0, balance = 0) {
        this.name = name;
        this.symbol = symbol;
        this.price = parseFloat(price);
        this.contract = contract;
        this.displayed = false;
        this.balance = balance;
    }
    priceStr(){
        return numberWithCommas(this.price);
    }
    inCurrency(currency){
        return (this.price * currency).toFixed(2);
    }
}




// INIT

let wallet_tokens = []
let gecko_tokens = [];
let chainId, signer;
let per_page = 25;
let page = 1;

const favs = new Favorites();

// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum);
// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...

let prices = document.getElementById("tblPrice");

//res.blue.value_avg
let valorDolar = document.getElementById('valorDolar');


$(function() {

    $("#resetBtn").on('click', function (){
        const parent = prices;
        while (parent.firstChild) {
            parent.firstChild.remove()
        }
        clearTokenDisplay();
    });

    $("#loadBtn").on('click', async function () {
        $("#resetBtn").trigger('click');
        fetch(COINGECKO_API + new URLSearchParams({
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": per_page,
            "page": page,
            "sparkline": false,
            "price_change_percentage": "24h"
        }))
            .then(response => response.json())
            .then(data => {
                console.log(data);
                for (let coin of data) {
                    gecko_tokens.push(new Token(
                        coin.name,
                        coin.symbol,
                        coin.current_price)
                    )
                }
            })

        //get dollar price
        fetch(URL_BLUE)
            .then(response => response.json())
            .then(data => {
                console.log(data.blue.value_avg);
                let dollar = data.blue.value_avg;
                valorDolar.innerHTML = dollar;
                //get tokens
                for (let token of gecko_tokens) {
                    if (!token.displayed) {
                        //pass dollar value to tokens
                        printToken(token, dollar);
                    }
                }
            });


    });
    $(".navbar-search").submit(function(e) {
        e.preventDefault();
        let formValues = new FormData(e.target);
        let coin = formValues.get("coin");
        for (let token of wallet_tokens){
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
        $("#resetBtn").trigger('click');
        signer = provider.getSigner();
        chainId = parseInt(window.ethereum.request({ method: 'eth_chainId' }));

        await provider.send("eth_requestAccounts", []);
        let wallet_address = await signer.getAddress()
        setAddress(wallet_address);
        // log
        console.log("Connected account:", wallet_address);
        let balance = await provider.getBalance(await signer.getAddress())
        console.log("ETH Balance: " + ethers.utils.formatEther(balance));



        //Logic for ERC20
        fetch(TOKEN_API + wallet_address + '\/?' + new URLSearchParams(
            {'apiKey': API_KEY})
            )
            .then(response => response.json())
            .then(data => {
                if (data.ETH.balance > 0){
                    wallet_tokens.push(new Token(
                        "Ethereum",
                        "ETH",
                        data.ETH.price.rate,
                        0,
                        data.ETH.balance
                    ));
                }
                //console.log(data.tokens);
                if (data.tokens){
                    for (let tok of data.tokens) {
                        wallet_tokens.push(new Token(
                            tok.tokenInfo.name,
                            tok.tokenInfo.symbol,
                            tok.tokenInfo.price.rate,
                            tok.tokenInfo.address,
                            tok.tokenInfo.balance
                            ))
                    }
                }
                fetch(URL_BLUE)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.blue.value_avg);
                        let dollar = data.blue.value_avg;
                        valorDolar.innerHTML = dollar;
                        //get tokens
                        for (let token of wallet_tokens) {
                            if (!token.displayed){
                                //pass dollar value to tokens
                                printToken(token, dollar);
                            }
                        }
                    });

            })


        //$("#walletDisconnect").removeClass('d-none');
        $("#walletConnect button").removeClass('btn-danger').addClass('btn-success');
        chainId = parseInt(window.ethereum.request({ method: 'eth_chainId' }));
        //metaConnect(chainId);
        // TODO: warn when network is not ethereum


    });
    $('#walletDisconnect').on('click', async () =>{
        // disconnect from metamask. not implemented by extension
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
    $("#walletConnect button").removeClass('btn-info').addClass('btn-danger');
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
    metaConnect(response.chainId);
});

window.ethereum.addListener('disconnect', () => {
    console.log("Wallet disconnected");
    $("#walletConnect button").removeClass('btn-success').addClass('btn-info');
});
window.ethereum.addListener('accountsChanged', async (response) => {
    metaConnect(response.chainId);
});