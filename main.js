function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
class Token{
    constructor(token) {
        this.name = token.name;
        this.price = parseFloat(token.price);
    }
    inPesos(){
        return this.price * 185;
    }
}

token1 = new Token({name:"btc", price: 40000});
token2 = new Token({name:"eth", price: 3000});
token3 = new Token({name:"zil", price:0.13});

let tokens = [token1, token2, token3];

let cotizaciones = document.getElementById("tblPrice");
let botonCargar = document.getElementById("botonCargar");
let botonReset = document.getElementById("botonReset");

botonCargar.addEventListener('click', function (){
    for (let token of tokens){
        console.log(token);
        let parrafo = document.createElement("tr");
        parrafo.id = token.name;
        parrafo.innerHTML = `
         <td>${token.name}</td>
         <td>U$S ${token.price}</td>
         <td>AR$ ${token.inPesos()}</td>
        `;
        cotizaciones.appendChild(parrafo);
    }
})

botonReset.addEventListener('click', function(){

})

let inputSearch = document.getElementById("searchField");
let form = document.getElementById("formu");

form.addEventListener('submit', function(e){
    e.preventDefault();
    let formValues = new FormData(e.target);
    for (let token of tokens){

        if (formValues.get("coin") === token.name) {
            let parrafo = document.createElement("tr");
            parrafo.id = token.name;
            parrafo.innerHTML = `
         <td>${token.name}</td>
         <td>U$S ${token.price}</td>
         <td>AR$ ${token.inPesos()}</td>
            `;
            cotizaciones.appendChild(parrafo);
        }
    }
})

/*
console.log(token);
console.log(token_precio);
 */