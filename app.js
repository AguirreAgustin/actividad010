const express = require('express')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const app = express()
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();
var msj = process.env.MENSAJE;
var db = mysql.createConnection({
    host     : process.env.DBSERVER,
    user     : process.env.DBUSER,
    password : process.env.DBPASSWORD,
    database : process.env.DBNAME,
    ssl:true
  });
   
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectada a la base de datos!');
});

var list = {
    elementos: []
};
//list.elementos.push({descripcion:'Demostración'});
list.elementos.push({descripcion:'Demostración1',posicion:0});
list.elementos.push({descripcion:'Demostración2',posicion:1});
list.elementos.push({descripcion:'Demostración3',posicion:2});

app.engine('html', mustacheExpress());

app.set('view engine', 'html');

app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }))
 
app.use(express.static(__dirname + '/wwwroot'))

app.use(bodyParser.json());
//+---------------------------------------- AJAX -----------------
app.get('/ajax', function (req, res) {
    res.render("homeAjax.html")
})

//-------------------------------------------------------------------------

app.get('/', function (req, res) {
    //res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    //res.setHeader('Clase', 'UCP');
    res.render("agus2.html", list)
})

// ------------------ BORRAR EN BDD ---------------------------

app.delete('/api/tareas/:tareaId', function (req,res) {

    if (typeof req.params.tareaId == 'undefined'){
        res.send({error: true});
    }

    let query = "DELETE FROM tareasdb.tareas WHERE tareaId = " + req.params.tareaId;

    db.query(query, (err,result) =>{

        if(err){
            res.redirect('/error');
        }

        res.send(result);
    })

})
// ----------------- GET BDD -----------------------------------------------
app.get('/api/tareas', function (req, res) {
    //res.render("agus2.html", list)
    let query = "SELECT tareaId, descripcion, orden FROM tareasdb.tareas ORDER BY orden ASC"

    db.query(query, (err,result) =>{

        if(err){
            res.redirect('/error');
        }

        res.send(result);
    })

    //res.send(list.elementos);

})

app.get('/api/tareas/:posicion', function (req, res) {

    res.send(list.elementos[req.params.posicion]);

})


app.post('/api/tareas', function (req, res) {
        if(typeof req.body.descripcion == 'undefined'){
            res.send({error:true});
        }
        var nuevaTarea = {
            descripcion: req.body.descripcion
        }
        list.elementos.push(nuevaTarea);
        res.send({exito:true});
})

app.delete('/api/tareas/:posicion', function (req,res) {

    if (typeof req.params.posicion == 'undefined'){
        res.send({error: true});
    }

    list.elementos.splice(req.params.posicion, 1);

    res.send({exito: true});

})


//--------------------------    TP1    ----------------------------------------------------------------------------------------------------

app.post('/', function (req, res) {
    var largo = list.elementos.length;
 //  list.elementos.splice({descripcion:req.body.descripcion}, 0);
    if(req.body.descripcion == "eliminar"){
        list.elementos.splice(req.body.posicion,1);
        for(var i=0; i<list.elementos.length; i++){
            list.elementos[i].posicion = i;
        }
    }
    if(req.body.descripcion == "subir" && req.body.posicion >0){
        var aux = list.elementos[req.body.posicion].descripcion;
        list.elementos[req.body.posicion].descripcion = list.elementos[req.body.posicion-1].descripcion ; 
        list.elementos[req.body.posicion-1].descripcion = aux;
        for(var i=0; i<list.elementos.length; i++){
            list.elementos[i].posicion = i;
        }
    }
    if(req.body.descripcion == "bajar" && req.body.posicion != list.elementos.length-1){
    
        var aux2 = list.elementos[parseInt(req.body.posicion)+parseInt(1)].descripcion;
        list.elementos[parseInt(req.body.posicion)+parseInt(1)].descripcion = list.elementos[req.body.posicion].descripcion ; 
        list.elementos[req.body.posicion].descripcion = aux2;
        for(var i=0; i<list.elementos.length; i++){
            list.elementos[i].posicion = i;
        }
    

    }
    if(req.body.descripcion == "darVuelta"){
        list.elementos.reverse();
        for(var i=0; i<list.elementos.length; i++){
            list.elementos[i].posicion = i;
        }
    }
    if(req.body.descripcion != "eliminar" && req.body.descripcion != "subir" && req.body.descripcion != "bajar" && req.body.descripcion != "darVuelta"){
        list.elementos.push({descripcion:req.body.descripcion, posicion:list.elementos.length});

    }

    res.render("agus2.html", armarLista(list))
})

function armarLista(unaLista){
    
    var nuevaLista = {
        elementos: []
    };

    for(var i=0; i<unaLista.elementos.length; i++){
    
        
        var item = unaLista.elementos[i];
        nuevaLista.elementos.push({descripcion: item.descripcion, 
        posicion:item.posicion, 
        visualizarsubir: (i!=0),
        visualizarbajar: (i != unaLista.elementos.length-1)})
    
    }
    return nuevaLista;
}
/*app.delete('/',function(req,res){

    list.elementos.splice(2,0);
    res.render("agus.html", list);
});
*/
app.listen(process.env.PORT || 8080);
