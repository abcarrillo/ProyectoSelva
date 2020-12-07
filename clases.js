String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

//Funcion para coger elementos hijos de un contenedor, ambos por id
function GetElementInsideContainer(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : {};
}


class Config {
    constructor(canvas_id) {
        this.PI2 = 2 * Math.PI;
        this.selva = document.getElementById(canvas_id);
        this.SELVA_WIDTH = this.selva.width;
        this.SELVA_HEIGHT = this.selva.height;
        this.CTX = this.selva.getContext("2d");
        this.VELOCIDAD_X = Math.round(Math.random() * 10) + 4;
        this.VELOCIDAD_Y = Math.round(Math.random() * 10) + 4;
        this.BORDE_MACHO = "yellow";
        this.BORDE_HEMBRA = "pink";
        this.LIMITE_ELEMENTOS = 18;
        this.ATAQUE = 30;
        this.ALIMENTARSE = 10;
        this.LIMITE_MASA = 45;
        this.LIMITE_MUERTE = 5;
        this.LIMITE_EDAD = 10;
        this.MASA_INICIAL = 20;
        this.PORCENTAJE_ALIMENTO_CARNIVORO = 0.5;
        this.fechaInicio = new Date().getTime();
        this.RATIO_CRECIMIENTO_PLANTA = 0.23;
    }
};





var config = new Config('selva');
var intervalo1;
var intervalo2;
var pausa1;
var pausa2;


var stat_vivos_plant;
var stat_vivos_herb;
var stat_vivos_carn;
var stat_vivos_total;

var stat_muertos_plant = 0;
var stat_muertos_herb = 0;
var stat_muertos_carn = 0;
var stat_muertos_total = 0;

var stat_iniciales_plant;
var stat_iniciales_herb;
var stat_iniciales_carn;
var stat_iniciales_total;

var stat_nuevos_plant = 0;
var stat_nuevos_herb = 0;
var stat_nuevos_carn = 0;
var stat_nuevos_total = 0;

var stat_masa_plant = 0;
var stat_masa_herb = 0;
var stat_masa_carn = 0;
var stat_masa_total = 0;

var contadorCampos = 0;





class Punto {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Escenario {
    constructor() {
        this.arrayElementos = [];
        this.alto = config.SELVA_HEIGHT;
        this.ancho = config.SELVA_WIDTH;
    }

    //edad, sexo, masa, posicion.x, posicion.y
    interaccion(animal1, animal2) {

        if (animal1 instanceof Herviboro && animal2 instanceof Planta) {
            animal1.alimentarse(animal2);
        }

        if (animal2 instanceof Herviboro && animal1 instanceof Planta) {
            animal2.alimentarse(animal1);
        }

        if (animal1 instanceof Carnivoro && animal2 instanceof Carnivoro) {
            if (animal1.sexo != animal2.sexo) {
                let edad = Math.round(Math.random() * 4);

                let numSexo = Math.round(Math.random());
                let sexo;
                if (numSexo == 1) {
                    sexo = "M";
                } else {
                    sexo = "H";
                }

                let masa = config.MASA_INICIAL;
                let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
                let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

                let animal = new Carnivoro(edad, sexo, masa, posx, posy);
                this.agregarSerVivo(animal, "C");


            } else {
                animal1.morder(animal2);
                animal2.sobrevivir();
            }
        }

        if (animal1 instanceof Carnivoro && animal2 instanceof Herviboro) {
            animal1.morder(animal2);

            animal2.sobrevivir();
        }
        if (animal1 instanceof Herviboro && animal2 instanceof Carnivoro) {
            animal2.morder(animal1);

            animal1.sobrevivir();
        }


        if (animal1 instanceof Herviboro && animal2 instanceof Herviboro) {
            if (animal1.sexo != animal2.sexo) {
                let edad = Math.round(Math.random() * 4);

                let numSexo = Math.round(Math.random());
                let sexo;
                if (numSexo == 1) {
                    sexo = "M";
                } else {
                    sexo = "H";
                }

                let masa = config.MASA_INICIAL;
                let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
                let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

                let animal = new Herviboro(edad, sexo, masa, posx, posy);

                this.agregarSerVivo(animal, "H");

            }
        }
    }

    choquesElementos() {

        for (let i = 0; i < this.arrayElementos.length; i++) {
            for (let j = i + 1; j < this.arrayElementos.length; j++) {

                let disX = this.arrayElementos[i].posicion.x - this.arrayElementos[j].posicion.x;
                let disY = this.arrayElementos[i].posicion.y - this.arrayElementos[j].posicion.y;

                let distancia = Math.sqrt((disX * disX) + (disY * disY));

                if (distancia <= this.arrayElementos[i].masa + this.arrayElementos[j].masa) {
                    if (this.arrayElementos[i] instanceof Animal) {
                        this.arrayElementos[i].velocidad.x *= -1;
                        this.arrayElementos[i].velocidad.y *= -1;
                        this.arrayElementos[i].mover();
                    }
                    if (this.arrayElementos[j] instanceof Animal) {
                        this.arrayElementos[j].velocidad.x *= -1;
                        this.arrayElementos[j].velocidad.y *= -1;
                        this.arrayElementos[j].mover();
                    }

                    this.interaccion(this.arrayElementos[i], this.arrayElementos[j]);
                }
            }
        }
    }

    agregarSerVivo(elem, string) {
        if (this.arrayElementos.length < config.LIMITE_ELEMENTOS) {
            this.arrayElementos.push(elem);
            if (string == "H") {
                stat_vivos_herb += 1;
                stat_vivos_total += 1;
                stat_nuevos_herb += 1;
            } else if (string == "C") {
                stat_vivos_carn += 1;
                stat_vivos_total += 1;
                stat_nuevos_carn += 1;
            }
        } else {
            hacerRegistros("No caben más elementos en pantalla", "bg-danger");
        }
    }

    crearArrayElementos(numPlantas, numHerviborosMacho, numHerviborosHembra, numCarnivorosMacho, numCarnivorosHembra) {

        //edad, sexo, masa, posicion.x, posicion.y
        for (let i = 0; i < numPlantas; i++) {
            let masa = config.MASA_INICIAL;
            let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
            let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;
            let planta = new Planta(masa, posx, posy);
            this.agregarSerVivo(planta);
        }

        for (let i = 0; i < numHerviborosMacho; i++) {
            let edad = Math.round(Math.random() * 4);
            let sexo = "M";
            let masa = config.MASA_INICIAL;
            let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
            let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

            let animal = new Herviboro(edad, sexo, masa, posx, posy);
            this.agregarSerVivo(animal);
        }

        for (let i = 0; i < numHerviborosHembra; i++) {
            let edad = Math.round(Math.random() * 4);
            let sexo = "H";
            let masa = config.MASA_INICIAL;
            let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
            let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

            let animal = new Herviboro(edad, sexo, masa, posx, posy);
            this.agregarSerVivo(animal);
        }

        for (let i = 0; i < numCarnivorosMacho; i++) {
            let edad = Math.round(Math.random() * 4);
            let sexo = "M";
            let masa = config.MASA_INICIAL;
            let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
            let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

            let animal = new Carnivoro(edad, sexo, masa, posx, posy);
            this.agregarSerVivo(animal);
        }

        for (let i = 0; i < numCarnivorosHembra; i++) {
            let edad = Math.round(Math.random() * 4);
            let sexo = "H";
            let masa = config.MASA_INICIAL;
            let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
            let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

            let animal = new Carnivoro(edad, sexo, masa, posx, posy);
            this.agregarSerVivo(animal);
        }
    }
}


var escenario = new Escenario();



class SerVivo {
    constructor(masa, x, y) {
        this.masa = masa;
        this.posicion = new Punto(x, y);
        this.colorPrimario = "";
        this.colorSecundario = "";
    }

    pintar() {
        try {
            var ctx = config.CTX;
            ctx.beginPath();
            ctx.fillStyle = this.colorPrimario;
            ctx.arc(this.posicion.x, this.posicion.y, this.masa, 0, config.PI2);
            ctx.fill();

            ctx.strokeStyle = this.colorSecundario;
            ctx.arc(this.posicion.x, this.posicion.y, this.masa + 1, 0, config.PI2);
            ctx.lineWidth = 3;
            ctx.stroke();
        } catch (ex) {

        }

    }
}

class Fosil extends SerVivo {
    constructor(...param) {
        super(...param);
        this.colorPrimario = "brown";
        this.colorSecundario = "grey";
    }
}

class Planta extends SerVivo {
    constructor(...param) {
        super(...param);
        this.colorPrimario = "green";
        this.colorSecundario = "lime";
    }

    fotosintesis() {
        if (this.masa < config.LIMITE_MASA) {
            this.masa += config.RATIO_CRECIMIENTO_PLANTA;
        }

    }
}

class Animal extends SerVivo {
    constructor(edad, sexo, ...param) {
        super(...param);
        this.edad = edad;
        this.sexo = sexo;
        this.velocidad = new Punto(config.VELOCIDAD_X, config.VELOCIDAD_Y);
        this.muerte = false;

        if (this.sexo === "M") {
            this.colorSecundario = config.BORDE_MACHO;
        } else {
            this.colorSecundario = config.BORDE_HEMBRA;
        }
    }

    envejecer() {
        if (this.edad < config.LIMITE_EDAD) {
            this.edad += 1;
            this.masa -= 5;
        } else {
            this.muerte = true;
        }
        return this.muerte;
    }


    mover() {

        this.posicion.x += this.velocidad.x;
        this.posicion.y += this.velocidad.y;
        this.pintar(config.CTX);
    }

    comprobarChoque() {
        if (((this.posicion.x + this.velocidad.x + this.masa) > config.SELVA_WIDTH) || (this.posicion.x + this.velocidad.x - this.masa) < 0) {
            this.velocidad.x = -this.velocidad.x;
        }
        if ((this.posicion.y + this.velocidad.y + this.masa) > config.SELVA_HEIGHT || (this.posicion.y + this.velocidad.y - this.masa) < 0) {
            this.velocidad.y = -this.velocidad.y;
        }

    }

    sobrevivir() {
        if (this.masa <= config.LIMITE_MUERTE) {
            this.muerte = true;
        }
        return this.muerte;
    }
}


class Carnivoro extends Animal {
    constructor(...param) {
        super(...param);
        this.colorPrimario = "red";

    }

    morder(animal) {
        if (this.masa < config.LIMITE_MASA) {
            this.masa += (animal.masa * config.PORCENTAJE_ALIMENTO_CARNIVORO);
        }
        if (animal.masa <= config.LIMITE_MUERTE) {
            animal.masa = config.LIMITE_MUERTE;
        } else {
            animal.masa -= config.ATAQUE;
        }
    }
}

class Herviboro extends Animal {
    constructor(...param) {
        super(...param);
        this.colorPrimario = "blue";
    }

    alimentarse(planta) {
        if (planta.masa > config.LIMITE_MUERTE) {
            planta.masa -= config.ALIMENTARSE;
            if (this.masa < config.LIMITE_MASA) {
                this.masa += config.ALIMENTARSE;
            }
        }

    }
}





function actualizarEstadisticas() {
    document.getElementById("stat_iniciales_plant").innerText = stat_iniciales_plant;
    document.getElementById("stat_iniciales_plant").dataset.dato = stat_iniciales_plant;
    document.getElementById("stat_iniciales_herb").innerText = stat_iniciales_herb;
    document.getElementById("stat_iniciales_herb").dataset.dato = stat_iniciales_herb;
    document.getElementById("stat_iniciales_carn").innerText = stat_iniciales_carn;
    document.getElementById("stat_iniciales_carn").dataset.dato = stat_iniciales_carn;
    document.getElementById("stat_iniciales_total").innerText = stat_iniciales_total;
    document.getElementById("stat_iniciales_total").dataset.dato = stat_iniciales_total;

    document.getElementById("stat_vivos_plant").innerText = stat_vivos_plant;
    document.getElementById("stat_vivos_plant").dataset.dato = stat_vivos_plant;
    document.getElementById("stat_vivos_carn").innerText = stat_vivos_carn;
    document.getElementById("stat_vivos_carn").dataset.dato = stat_vivos_carn;
    document.getElementById("stat_vivos_herb").innerText = stat_vivos_herb;
    document.getElementById("stat_vivos_herb").dataset.dato = stat_vivos_herb;
    document.getElementById("stat_vivos_total").innerText = stat_vivos_total;
    document.getElementById("stat_vivos_total").dataset.dato = stat_vivos_total;

    document.getElementById("stat_muertos_plant").innerText = stat_muertos_plant;
    document.getElementById("stat_muertos_plant").dataset.dato = stat_muertos_plant;
    document.getElementById("stat_muertos_carn").innerText = stat_muertos_carn;
    document.getElementById("stat_muertos_carn").dataset.dato = stat_muertos_carn;
    document.getElementById("stat_muertos_herb").innerText = stat_muertos_herb;
    document.getElementById("stat_muertos_herb").dataset.dato = stat_muertos_herb;
    document.getElementById("stat_muertos_total").innerText = stat_muertos_total;
    document.getElementById("stat_muertos_total").dataset.dato = stat_muertos_total;

    document.getElementById("stat_nuevos_plant").innerText = stat_nuevos_plant;
    document.getElementById("stat_nuevos_plant").dataset.dato = stat_nuevos_plant;
    document.getElementById("stat_nuevos_carn").innerText = stat_nuevos_carn;
    document.getElementById("stat_nuevos_carn").dataset.dato = stat_nuevos_carn;
    document.getElementById("stat_nuevos_herb").innerText = stat_nuevos_herb;
    document.getElementById("stat_nuevos_herb").dataset.dato = stat_nuevos_herb;
    document.getElementById("stat_nuevos_total").innerText = stat_nuevos_total;
    document.getElementById("stat_nuevos_total").dataset.dato = stat_nuevos_total;

    document.getElementById("stat_masa_plant").innerText = stat_masa_plant;
    document.getElementById("stat_masa_plant").dataset.dato = stat_masa_plant;
    document.getElementById("stat_masa_carn").innerText = stat_masa_carn;
    document.getElementById("stat_masa_carn").dataset.dato = stat_masa_carn;
    document.getElementById("stat_masa_herb").innerText = stat_masa_herb;
    document.getElementById("stat_masa_herb").dataset.dato = stat_masa_herb;
    document.getElementById("stat_masa_total").innerText = stat_masa_total;
    document.getElementById("stat_masa_total").dataset.dato = stat_masa_total;
}


function reiniciar() {
    var ctx = config.CTX;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, config.SELVA_WIDTH - 1, config.SELVA_HEIGHT - 1);
}

function configurar() {
    config.LIMITE_MASA = +document.getElementById("max_masa").value;
    config.LIMITE_MUERTE = +document.getElementById("min_masa").value;
    config.MASA_INICIAL = +document.getElementById("masa_inicial").value;
    config.RATIO_CRECIMIENTO_PLANTA = +document.getElementById("ratio_planta").value;
    config.PORCENTAJE_ALIMENTO_CARNIVORO = +document.getElementById("porcentaje").value;
}

function funcionamiento(escenario) {
    reiniciar();
    let objTiempo = Math.round((new Date().getTime() - config.fechaInicio) / 1000) + "";
    document.getElementById("tiempo_real").innerText = objTiempo.toHHMMSS();

    escenario.arrayElementos.forEach(function (element, index, array) {
        if (element instanceof Animal) {
            if (element.sobrevivir()) {
                if (element instanceof Carnivoro) {
                    stat_vivos_carn -= 1;
                    stat_muertos_carn += 1;
                } else {
                    stat_vivos_herb -= 1;
                    stat_muertos_herb += 1;
                }
                stat_vivos_total -= 1;
                stat_muertos_total += 1;
                array.splice(index, 1);
            }
        } else {
            element.pintar();
            if (element instanceof Planta) {
                element.fotosintesis();
            }

        }
    });


    escenario.arrayElementos.forEach(element => {
        if (element instanceof Animal) {
            element.mover();
        } else {
            element.pintar();
        }
    });

    escenario.arrayElementos.forEach(element => {
        if (element instanceof Animal) {
            element.comprobarChoque();
        } else {
            element.pintar();
        }
    });

    escenario.arrayElementos.forEach(element => {
        if (element instanceof Animal) {
            escenario.choquesElementos();
        } else {
            element.pintar();
        }
    });

    var masa_p = 0;
    var masa_c = 0;
    var masa_h = 0;
    var masa_t = 0;
    escenario.arrayElementos.forEach(element => {
        if (element instanceof Planta) {
            masa_p += element.masa;
        }
        if (element instanceof Carnivoro) {
            masa_c += element.masa;
        }
        if (element instanceof Herviboro) {
            masa_h += element.masa
        }

        if (!(element instanceof Fosil)) {
            masa_t += element.masa;
        }


    });

    stat_masa_plant = Math.round(masa_p / stat_vivos_plant);
    stat_masa_carn = Math.round(masa_c / stat_vivos_carn);
    stat_masa_herb = Math.round(masa_h / stat_vivos_herb);
    stat_masa_total = Math.round(masa_t / stat_vivos_total);

    actualizarEstadisticas();
}




function simular() {
    hacerRegistros("El juego ha comenzado", "bg-info");
    config.fechaInicio = new Date().getTime();

    configurar();
    let numPlantas = +document.getElementById("num_plantas").value;
    let numHerviborosMacho = +document.getElementById("num_herb_m").value;
    let numHerviborosHembra = +document.getElementById("num_herb_h").value;
    let numCarnivorosMacho = +document.getElementById("num_carn_m").value;
    let numCarnivorosHembra = +document.getElementById("num_carn_h").value;

    stat_iniciales_plant = numPlantas;
    stat_iniciales_herb = numHerviborosHembra + numHerviborosMacho;
    stat_iniciales_carn = numCarnivorosHembra + numCarnivorosMacho;
    stat_iniciales_total = stat_iniciales_carn + stat_iniciales_herb + stat_iniciales_plant;

    stat_vivos_plant = numPlantas;
    stat_vivos_carn = stat_iniciales_carn;
    stat_vivos_herb = stat_iniciales_herb;
    stat_vivos_total = stat_vivos_carn + stat_vivos_herb + stat_vivos_plant;


    let boton = document.getElementById("btn_simular");
    boton.innerText = "Pausar";
    boton.onclick = pausarJuego;
    escenario = new Escenario();
    config.LIMITE_ELEMENTOS = +document.getElementById("rango_limite").value;




    //PLANTAS, HERBIVOROS MACHO, HERBIVOROS HEMBRA, CARNIVOROS MACHO, CARNIVOROS HEMBRA
    escenario.crearArrayElementos(numPlantas, numHerviborosMacho, numHerviborosHembra, numCarnivorosMacho, numCarnivorosHembra);


    intervalo1 = setInterval(funcionamiento, 28, escenario);

    intervalo2 = setInterval(function () {
        escenario.arrayElementos.forEach(function (element, index, array) {
            if (element instanceof Animal) {
                if (element.envejecer()) {
                    array.splice(index, 1);
                    if (element instanceof Carnivoro) {
                        stat_vivos_carn -= 1;
                        stat_muertos_carn += 1;
                    } else {
                        stat_vivos_herb -= 1;
                        stat_muertos_herb += 1;
                    }
                    stat_vivos_total -= 1;
                    stat_muertos_total += 1;
                }
            } else {
                element.pintar();
            }
        });
    }, 10000);


}

function pausarJuego() {
    hacerRegistros("El juego se ha pausado", "bg-info");

    clearInterval(intervalo1);
    clearInterval(intervalo2);

    let boton = document.getElementById("btn_simular");
    boton.innerText = "Reanudar";
    boton.onclick = () => reanudarJuego(pausa1, pausa2);
}

function reanudarJuego(pausa1, pausa2) {
    hacerRegistros("El juego se ha reanudado", "bg-info");

    intervalo1 = setInterval(funcionamiento, 28, escenario);
    intervalo2 = setInterval(function () {
        escenario.arrayElementos.forEach(function (element, index, array) {
            if (element instanceof Animal) {
                if (element.envejecer()) {
                    array.splice(index, 1);
                }
            } else {
                element.pintar();
            }
        });
    }, 10000);

    let boton = document.getElementById("btn_simular");
    boton.innerText = "Pausar";
    boton.onclick = pausarJuego;
}


function reinicio_intervalo() {
    hacerRegistros("El juego ha reiniciado", "bg-info");

    config.fechaInicio = this.fechaInicio = new Date().getTime();
    let boton = document.getElementById("btn_simular");
    boton.innerText = "Simular";
    boton.onclick = simular;
    clearInterval(intervalo1);
    clearInterval(intervalo2);
    escenario = new Escenario();

    stat_vivos_plant = 0;
    stat_vivos_herb = 0;
    stat_vivos_carn = 0;
    stat_vivos_total = 0;

    stat_muertos_plant = 0;
    stat_muertos_herb = 0;
    stat_muertos_carn = 0;
    stat_muertos_total = 0;

    stat_iniciales_plant = 0;
    stat_iniciales_herb = 0;
    stat_iniciales_carn = 0;
    stat_iniciales_total = 0;

    stat_nuevos_plant = 0;
    stat_nuevos_herb = 0;
    stat_nuevos_carn = 0;
    stat_nuevos_total = 0;

    stat_masa_plant = 0;
    stat_masa_herb = 0;
    stat_masa_carn = 0;
    stat_masa_total = 0;

    actualizarEstadisticas();


    while (document.getElementById("campos_fosiles").firstChild) {
        document.getElementById("campos_fosiles").firstChild.remove();
    }

    reiniciar();
}


function agregarPlanta() {
    hacerRegistros("Se ha agregado una planta", "bg-success");

    let masa = config.MASA_INICIAL;
    let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
    let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;
    let planta = new Planta(masa, posx, posy);

    escenario.agregarSerVivo(planta);
    stat_vivos_plant += 1;
    stat_vivos_total += 1;
    stat_nuevos_plant += 1;
}

function quitarPlanta() {
    hacerRegistros("Se ha quitado una planta", "bg-success");

    let comprobante = false;
    escenario.arrayElementos.forEach(function (element, index, array) {
        if (element instanceof Planta) {
            if (!comprobante) {
                array.splice(index, 1);
                comprobante = true;
                stat_vivos_plant -= 1;
                stat_vivos_total -= 1;
                stat_muertos_plant += 1;
            }
        }
    });
}

function agregarHerbivoro(sexo) {
    hacerRegistros("Se ha agregado un herbivoro", "bg-success");

    let edad = Math.round(Math.random() * 4);
    let masa = config.MASA_INICIAL;
    let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
    let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

    let animal = new Herviboro(edad, sexo, masa, posx, posy);
    escenario.agregarSerVivo(animal);
    stat_vivos_herb += 1;
    stat_vivos_total += 1;
    stat_nuevos_herb += 1;
}


function quitarHerbivoro(sexo_elim) {
    hacerRegistros("Se ha quitado un herbivoro", "bg-success");

    let comprobante = false;
    escenario.arrayElementos.forEach(function (element, index, array) {
        if (element instanceof Herviboro) {
            if (!comprobante && element.sexo == sexo_elim) {
                array.splice(index, 1);
                comprobante = true;
                stat_vivos_herb -= 1;
                stat_vivos_total -= 1;
                stat_muertos_herb += 1;
            }
        }
    });
}

function agregarCarnivoro(sexo) {
    hacerRegistros("Se ha agregado un carnivoro", "bg-success");

    let edad = Math.round(Math.random() * 4);
    let masa = config.MASA_INICIAL;
    let posx = Math.round(Math.random() * ((+config.SELVA_WIDTH - 100) - 100)) + 100;
    let posy = Math.round(Math.random() * ((+config.SELVA_HEIGHT - 100) - 100)) + 100;

    let animal = new Carnivoro(edad, sexo, masa, posx, posy);
    escenario.agregarSerVivo(animal);
    stat_vivos_carn += 1;
    stat_vivos_total += 1;
    stat_nuevos_carn += 1;
}

function quitarCarnivoro(sexo_elim) {
    hacerRegistros("Se ha quitado un carnivoro", "bg-success");

    let comprobante = false;
    escenario.arrayElementos.forEach(function (element, index, array) {
        if (element instanceof Carnivoro) {
            if (!comprobante && element.sexo == sexo_elim) {
                array.splice(index, 1);
                comprobante = true;
                stat_vivos_carn -= 1;
                stat_vivos_total -= 1;
                stat_muertos_carn += 1;
            }
        }
    });
}

function agregarFosil(fieldset, div) {
    let mensaje = "Se ha agregado un fosil";
    hacerRegistros(mensaje, "bg-success");

    let masa = +GetElementInsideContainer(fieldset.id + "", ("masa_fosil_" + fieldset.id)).value;
    let x_fosil = +GetElementInsideContainer(fieldset.id + "", ("x_fosil_" + fieldset.id)).value;
    let y_fosil = +GetElementInsideContainer(fieldset.id + "", ("y_fosil_" + fieldset.id)).value;

    GetElementInsideContainer(fieldset.id + "", ("masa_fosil_" + fieldset.id)).disabled = true;
    GetElementInsideContainer(fieldset.id + "", ("x_fosil_" + fieldset.id)).disabled = true;
    GetElementInsideContainer(fieldset.id + "", ("y_fosil_" + fieldset.id)).disabled = true;

    let fosil = new Fosil(masa, x_fosil, y_fosil);
    escenario.agregarSerVivo(fosil);

    GetElementInsideContainer(fieldset.id + "", ("masFosil_" + fieldset.id)).remove();
    GetElementInsideContainer(fieldset.id + "", ("cancelFosil_" + fieldset.id)).remove();

    let button = document.createElement("button");
    button.innerText = "X";
    button.setAttribute("type", "button");
    button.onclick = () => {
        quitarFosil(fieldset, masa, x_fosil, y_fosil);
    };

    fieldset.appendChild(button);


}

function quitarFosil(fieldset, masa, x_fosil, y_fosil) {
    let mensaje = "Se ha quitado un fosil";
    hacerRegistros(mensaje, "bg-success");

    escenario.arrayElementos.forEach(function (element, index, array) {
        if (element instanceof Fosil) {
            if (element.masa == masa && element.posicion.x == x_fosil && element.posicion.y == y_fosil) {
                array.splice(index, 1);
            }
        }
    });

    fieldset.remove();
}

function agregarCampoFosil() {
    let contenedor = document.getElementById("campos_fosiles");
    let div = document.createElement("div");

    let fieldset = document.createElement("fieldset");

    let label = document.createElement("label");
    label.innerText = "Masa/radio:";

    let input = document.createElement("input");
    input.id = "masa_fosil_" + contadorCampos;
    input.setAttribute("type", "number");
    input.setAttribute("max", config.LIMITE_MASA);

    let label2 = document.createElement("label");
    label2.innerText = "X";

    let input2 = document.createElement("input");
    input2.id = "x_fosil_" + contadorCampos;
    input2.setAttribute("type", "number");
    input2.setAttribute("max", config.SELVA_WIDTH);

    let label3 = document.createElement("label");
    label3.innerText = "y";

    let input3 = document.createElement("input");
    input3.id = "y_fosil_" + contadorCampos;
    input3.setAttribute("type", "number");
    input3.setAttribute("max", config.SELVA_HEIGHT);

    let button = document.createElement("button");
    button.id = "masFosil_" + contadorCampos;
    button.setAttribute("type", "button");
    button.onclick = () => {
        agregarFosil(fieldset, div)
    };
    button.innerText = "OK";

    let button2 = document.createElement("button");
    button2.id = "cancelFosil_" + contadorCampos;
    button2.setAttribute("type", "button");
    button2.onclick = () => {
        cancelarCampoFosil(fieldset)
    };
    button2.innerText = "Cancelar";

    fieldset.appendChild(label);
    fieldset.appendChild(input);
    fieldset.appendChild(label2);
    fieldset.appendChild(input2);
    fieldset.appendChild(label3);
    fieldset.appendChild(input3);
    fieldset.appendChild(button);
    fieldset.appendChild(button2);

    fieldset.id = contadorCampos++;

    div.appendChild(fieldset);

    contenedor.appendChild(div);
}


function cancelarCampoFosil(fieldset) {
    let mensaje = "Se ha cancelado la creacion de un fosil";
    hacerRegistros(mensaje, "bg-danger");

    document.getElementById(fieldset.id).remove();
}




window.onload = function () {
    document.getElementById("btn_simular").onclick = simular;
    document.getElementById("btn_reinicio").onclick = reinicio_intervalo;
    document.getElementById("masPlanta").onclick = agregarPlanta;
    document.getElementById("menosPlanta").onclick = quitarPlanta;
    document.getElementById("masHerbivoro").onclick = () => {
        let sexos = this.document.getElementById("form_c").elements["sexo_herb"];
        let valor = "";
        for (let i = 0; i < sexos.length; i++) {
            if (sexos[i].checked) {
                valor += sexos[i].value;
            }
        }
        agregarHerbivoro(valor);

    };
    this.document.getElementById("menosHerbivoro").onclick = () => {
        let sexos = this.document.getElementById("form_c").elements["sexo_herb"];
        let valor = "";
        for (let i = 0; i < sexos.length; i++) {
            if (sexos[i].checked) {
                valor += sexos[i].value;
            }
        }
        quitarHerbivoro(valor);
    };

    document.getElementById("masCarnivoro").onclick = () => {
        let sexos = this.document.getElementById("form_c").elements["sexo_carn"];
        let valor = "";
        for (let i = 0; i < sexos.length; i++) {
            if (sexos[i].checked) {
                valor += sexos[i].value;
            }
        }
        agregarCarnivoro(valor);

    };
    this.document.getElementById("menosCarnivoro").onclick = () => {
        let sexos = this.document.getElementById("form_c").elements["sexo_carn"];
        let valor = "";
        for (let i = 0; i < sexos.length; i++) {
            if (sexos[i].checked) {
                valor += sexos[i].value;
            }
        }
        quitarCarnivoro(valor);
    };

    this.document.getElementById("rango_limite").onchange = () => this.document.getElementById("num_range").innerText = this.document.getElementById("rango_limite").value;

    document.getElementById("add_campo_fosil").onclick = agregarCampoFosil;


    document.getElementById("ch_info").onchange = () => {
        let lis = document.getElementById("registro").getElementsByClassName("bg-info");
        for (let item of lis) {
            item.classList.toggle("invisible");
        }
    };

    document.getElementById("ch_avisos").onchange = () => {
        let lis = document.getElementById("registro").getElementsByClassName("bg-success");
        for (let item of lis) {
            item.classList.toggle("invisible");
        }
    };

    document.getElementById("ch_errores").onchange = () => {
        let lis = document.getElementById("registro").getElementsByClassName("bg-danger");
        for (let item of lis) {
            item.classList.toggle("invisible");
        }
    };


    document.getElementById("cargar_url").onclick = cargarURL;
    document.getElementById("ver_url").onclick = verURL;

    document.getElementById("export_json").onclick = guardarEstadoApp;
    document.getElementById("clean_json").onclick = limpiarEstadoApp;

    reiniciar();
};

function cargarURL() {
    let url = window.location.href;
    url += "?";

    let num_plantas = +document.getElementById("num_plantas").value;
    let num_herb_m = +document.getElementById("num_herb_m").value;
    let num_herb_h = +document.getElementById("num_herb_h").value;
    let num_carn_m = +document.getElementById("num_carn_m").value;
    let num_carn_h = +document.getElementById("num_carn_h").value;
    let rango_limite = +document.getElementById("rango_limite").value;

    let tiempo_real = document.getElementById("tiempo_real").innerText;

    let max_masa = +document.getElementById("max_masa").value;
    let min_masa = +document.getElementById("min_masa").value;
    let masa_inicial = +document.getElementById("masa_inicial").value;
    let ratio_planta = +document.getElementById("ratio_planta").value;
    let porcentaje = +document.getElementById("porcentaje").value;

    let mapa = new Map();
    mapa.set("num_plantas", num_plantas);
    mapa.set("num_herb_m", num_herb_m);
    mapa.set("num_herb_h", num_herb_h);
    mapa.set("num_carn_m", num_carn_m);
    mapa.set("num_herb_h", num_herb_h);
    mapa.set("num_carn_h", num_carn_h);
    mapa.set("rango_limite", rango_limite);
    mapa.set("tiempo_real", tiempo_real);
    mapa.set("max_masa", max_masa);
    mapa.set("min_masa", min_masa);
    mapa.set("masa_inicial", masa_inicial);
    mapa.set("ratio_planta", ratio_planta);
    mapa.set("porcentaje", porcentaje);

    for (let [key, value] of mapa.entries()) {
        url += key + "=" + value + "&";
    }

    url = url.slice(0, -1);

    document.getElementById("url").value = url;

}

function verURL() {
    cargarURL();
    let url = document.getElementById("url").value;
    let params = url.split("?");
    window.open("bloqueK.html?" + params[1]);

}


function hacerRegistros(mensaje, clase) {
    let fecha = new Date();
    let registro = document.getElementById("registro");

    let li = document.createElement("li");
    li.classList.add("border", "border-dark", clase, "text-white", "px-2");
    li.innerText = (fecha.getDay() + 1) + "-" + (fecha.getMonth() + 1) + "-" + fecha.getFullYear() + " | " + mensaje;

    registro.appendChild(li);
}

function guardarEstadoApp() {
    let json_config = JSON.stringify(config);
    let json_elementos = JSON.stringify(escenario.arrayElementos);

    document.getElementById("json").innerText = json_config + "\n \n \n \n" + json_elementos;
}

function limpiarEstadoApp() {
    document.getElementById("json").innerText = "";
}