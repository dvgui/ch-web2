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
                <td>AR$ ${token.inPesosStr()}</td>
                <td><a class="fav" id="fav-${token.name}"><i class="fas fa-star"></i></a></td>
                </tr>
                `);
    //avoid repeating
    token.displayed = true;
}

class Favorites {
    constructor(){
        this.tokens = [];
        this.restore();
    }
    add(token){
        if (!this.tokens.includes(token)) {
            this.tokens.push(token.toString());
            this.save();
        }
    }
    remove(token){
        if (this.tokens.includes(token)) {
            const index = this.tokens.indexOf(token);
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
}



class Token{
    constructor(token) {
        this.name = token.name;
        this.price = parseFloat(token.price);
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
}


token1 = new Token({name:"btc", price: 40000});
token2 = new Token({name:"eth", price: 3000});
token3 = new Token({name:"zil", price:0.13});

let tokens = [token1, token2, token3];

const favs = new Favorites();

let prices = document.getElementById("tblPrice");
//Example without jQuery
//let loadBtn = document.getElementById("loadBtn");
/*


loadBtn.addEventListener('click', function (){
    for (let token of tokens){
        console.log(token);
        let parrafo = document.createElement("tr");
        parrafo.id = token.name;
        parrafo.innerHTML = `
         <td>${token.name}</td>
         <td>U$S ${token.priceStr()}</td>
         <td>AR$ ${token.inPesosStr()}</td>
         <td><i class="fas fa-star"></i></td>
        `;
        cotizaciones.appendChild(parrafo);
    }
})*/

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
            $(`#fav-${token.name}`).on('click', function() {
                //TODO click not working. dynamically generated html ?
                let fav = this.id.replace('fav-','');
                favs.add(fav);
                $(`#fav-${token.name} .fas`).css('color','gold');
            });
        }
    });
    $(".navbar-search").submit(function(e) {
        e.preventDefault();
        let formValues = new FormData(e.target);
        for (let token of tokens){
            if (formValues.get("coin") === token.name && !token.displayed) {
                    printToken(token);
            }
            $(`#fav-${token.name}`).on('click', function() {
                //TODO click not working. dynamically generated html ?
                let fav = this.id.replace('fav-','');
                favs.add(fav);
                $(`#fav-${token.name} .fas`).css('color','gold');
            });
        }
    });

});
