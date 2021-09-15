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
        let fav = this.id.replace('fav-','');
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
    constructor(name, price) {
        this.name = name;
        this.price = parseFloat(price);
        this.displayed = false;
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


// INIT

const token1 = new Token("btc", 40000);
const token2 = new Token("eth", 3000);
const token3 = new Token("zil", 0.13);

let tokens = [token1, token2, token3];

const favs = new Favorites();



let prices = document.getElementById("tblPrice");

$(function() {
    $("#resetBtn").on('click', function (){
        const parent = prices;
        while (parent.firstChild) {
            parent.firstChild.remove()
        }
        clearTokenDisplay();
    });

    $("#loadBtn").click(function(){
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


});
