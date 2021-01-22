var aLogin = [];

function Login() {
    var email = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            window.location.href = "naslovnica.html";
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            window.alert("Unijeli ste pogrešnu email adresu ili lozinku!");
        });
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var user = firebase.auth().currentUser;
        var uid;
        if (user != null) {
            uid = user.uid;
        }
        aLogin.push({
            Uid: user.uid
        });
    } else {
        // No user is signed in.

    }
});

function Logout() {
    firebase.auth().signOut().then(() => {
        window.alert("Odjavljeni ste!");
        window.location.href = "index.html";
    }).catch((error) => {
        // An error happened.
    });
}

var aSpremnik_diesel = [];
var oDb = firebase.database();
var oDbSpremnik_diesel = oDb.ref('Spremnik').orderByChild('Naziv').equalTo('Diesel');
oDbSpremnik_diesel.on('value', function (oOdgovorPosluzitelja) {
    aSpremnik_diesel = [];
    oOdgovorPosluzitelja.forEach(function (oSpremnik_dieselSnapshot) {
        var oSpremnik_diesel = oSpremnik_dieselSnapshot.val();
        aSpremnik_diesel.push({
            Cijena: oSpremnik_diesel.Cijena,
            Stanje: oSpremnik_diesel.Stanje
        });
    });
    UcitajCijenaDiesel();
});

var aSpremnik_benzin = [];
var oDb = firebase.database();
var oDbSpremnik_benzin = oDb.ref('Spremnik').orderByChild('Naziv').equalTo('Benzin');
oDbSpremnik_benzin.on('value', function (oOdgovorPosluzitelja) {
    aSpremnik_benzin = [];
    oOdgovorPosluzitelja.forEach(function (oSpremnik_benzinSnapshot) {
        var oSpremnik_benzin = oSpremnik_benzinSnapshot.val();
        aSpremnik_benzin.push({
            Cijena: oSpremnik_benzin.Cijena,
            Stanje: oSpremnik_benzin.Stanje

        });
    });
    UcitajCijenaBenzin();
});

var aRacuni = [];
var oDb = firebase.database();
var oDbRacuni = oDb.ref('Racun');
oDbRacuni.on('value', function (oOdgovorPosluzitelja) {
    aRacuni = [];
    oOdgovorPosluzitelja.forEach(function (oRacuniSnapshot) {
        var oRacuni = oRacuniSnapshot.val();
        aRacuni.push({
            DatumVrijeme: oRacuni.Datumvrijeme,
            Zaposlenik: oRacuni.Zaposlenik_izdao,
            Kolicina: oRacuni.Kolicina,
            VrstaGoriva: oRacuni.Id_goriva,
            Cijena: oRacuni.Cijena,
            Storno: oRacuni.Storno
        });
    });
    PopuniTablicuRacuni();
});

var aSpremnici = [];
var oDb = firebase.database();
var oDbSpremnici = oDb.ref('Spremnik');
oDbSpremnici.on('value', function (oOdgovorPosluzitelja) {
    aSpremnici = [];
    oOdgovorPosluzitelja.forEach(function (oRacuniSnapshot) {
        var oSpremnik = oRacuniSnapshot.val();
        aSpremnici.push({
            idSpremnika: oSpremnik.Id_spremnika,
            Naziv: oSpremnik.Naziv,
            Stanje: oSpremnik.Stanje,
            Cijena: oSpremnik.Cijena
        });
    });
    UcitajSpremnik();
    var Diesel_spremnik = 0;
    var Benzin_spremnik = 0;
    aSpremnici.forEach(function (oSpremnik) {
        if (oSpremnik.idSpremnika == 1) {
            Diesel_spremnik = parseInt(oSpremnik.Stanje);
        } else if (oSpremnik.idSpremnika == 2) {
            Benzin_spremnik = parseInt(oSpremnik.Stanje);
        }

    });
    var data = [{
            domain: {
                row: 0,
                column: 0
            },
            value: Diesel_spremnik,
            title: {
                text: "DIESEL SPREMNIK"
            },
            type: "indicator",
            mode: "gauge+number",
            delta: {
                reference: 400
            },
            gauge: {
                axis: {
                    range: [1000, 20000]
                }
            }
        },

        {
            domain: {
                row: 0,
                column: 1
            },
            value: Benzin_spremnik,
            title: {
                text: "BENZIN SPREMNIK"
            },
            type: "indicator",
            mode: "gauge+number",
            delta: {
                reference: 400
            },
            gauge: {
                axis: {
                    range: [1000, 20000]
                }
            }
        }
    ];
    var layout = {
        width: "100%",
        height: 300,
        margin: {
            t: 50,
            b: 25,
            l: 25,
            r: 30
        },
        grid: {
            rows: 1,
            columns: 2,
            pattern: "independent"
        },
    };

    if ($('#myDiv2').length > 0) {
        Plotly.newPlot('myDiv2', data, layout, {
            displaylogo: false,
            modeBarButtonsToRemove: ['toImage'],
            responsive: true
        });
    }
});

var aZaposlenici = [];
var oDb = firebase.database();
var oDbZaposlenici = oDb.ref('Zaposlenik');
oDbZaposlenici.on('value', function (oOdgovorPosluzitelja) {
    aZaposlenici = [];
    oOdgovorPosluzitelja.forEach(function (oZaposleniciSnapshot) {
        var oZaposlenici = oZaposleniciSnapshot.val();
        aZaposlenici.push({
            Ime_prezime: oZaposlenici.Ime_prezime,
            Id_zap: oZaposlenici.Id_zaposlenika
        });
    });
});

function IzdajRacun() {
    var provjera = false;
    var sZaposlenik;
    var nKolicina_goriva = document.getElementById('Amount').value;
    var sVrsta_goriva_diesel = document.getElementById('diesel');
    var sVrsta_goriva_benzin = document.getElementById('benzin');
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/" +
        (currentdate.getMonth() + 1) + "/" +
        currentdate.getFullYear() + " " +
        currentdate.getHours() + ":" +
        currentdate.getMinutes() + ":" +
        currentdate.getSeconds();
    var nId_goriva = 0;
    var sCijena = 0;
    var fCijena = 0;
    var defaultStorno = 0;
    if (nKolicina_goriva < 5) {
        window.alert("Minimalna količina je 5 litara!");
        provjera = true;
    } else {
        if (sVrsta_goriva_diesel.checked) {
            aSpremnik_diesel.forEach(function (oSpremnikdiesel) {
                if (nKolicina_goriva > oSpremnikdiesel.Stanje) {
                    window.alert("Nedovoljna količina goriva u spremniku!");
                    provjera = true;
                } else {
                    var Stanje = +oSpremnikdiesel.Stanje - +nKolicina_goriva;
                    const fb = firebase.database().ref()
                    data = {
                        Stanje
                    }
                    fb.child("Spremnik/0").update(data)
                    sCijena = (nKolicina_goriva * oSpremnikdiesel.Cijena);
                    fCijena = sCijena.toFixed(2);
                    nId_goriva = 1;
                }
            });
        } else if (sVrsta_goriva_benzin.checked) {
            aSpremnik_benzin.forEach(function (oSpremnikbenzin) {
                if (nKolicina_goriva > oSpremnikbenzin.Stanje) {
                    window.alert("Nedovoljna količina goriva u spremniku!");
                    provjera = true;
                } else {
                    var Stanje = +oSpremnikbenzin.Stanje - +nKolicina_goriva;
                    const fb = firebase.database().ref()
                    data = {
                        Stanje
                    }
                    fb.child("Spremnik/1").update(data)
                    sCijena = (nKolicina_goriva * oSpremnikbenzin.Cijena);
                    fCijena = sCijena.toFixed(2);
                    nId_goriva = 2;
                }
            });

        } else {
            window.alert("Niste odabrali vrstu goriva!");
            provjera = true;
        }
    }
    if (provjera == false) {
        var sKey = firebase.database().ref().child('Racun').push().key;
        aLogin.forEach(function (oLogin) {
            aZaposlenici.forEach(function (oZaposlenici) {
                if (oLogin.Uid == oZaposlenici.Id_zap) {
                    sZaposlenik = oZaposlenici.Ime_prezime;
                }
            });

        });
        var oRacun = {

            Cijena: fCijena,
            Datumvrijeme: datetime,
            Id_goriva: nId_goriva,
            Kolicina: nKolicina_goriva,
            Zaposlenik_izdao: sZaposlenik,
            Storno: defaultStorno
        };

        // Zapiši u Firebase
        var oZapis = {};
        oZapis[sKey] = oRacun;
        oDbRacuni.update(oZapis);
        location.reload();
    }
}

function AzurirajCijenaDiesel() {
    const fb = firebase.database().ref()
    var Nova_cijena = document.getElementById("azuriraj_cijenad").value
    var Cijena = +Nova_cijena;
    data = {
        Cijena
    }
    fb.child("Spremnik/0").update(data)
    window.location.reload();
}

function AzurirajCijenaBenzin() {
    const fb = firebase.database().ref()
    var Nova_cijena = document.getElementById("azuriraj_cijenab").value
    var Cijena = +Nova_cijena;
    data = {
        Cijena
    }
    fb.child("Spremnik/1").update(data)
    window.location.reload();
}

function AzurirajDiesel() {
    const fb = firebase.database().ref()
    var Novo_stanje = document.getElementById("azuriraj_spremnik1").value
    aSpremnik_diesel.forEach(function (oSpremnikdiesel) {
        var Stanje = +oSpremnikdiesel.Stanje + +Novo_stanje;
        if (Novo_stanje < 1000) {
            window.alert("Minimalna količina je 1000 litara!")
        } else if (Stanje > 20000) {
            window.alert("Maksimalni kapacitet spremnika je 20000 litara!")
        } else {
            data = {
                Stanje
            }
            fb.child("Spremnik/0").update(data)
            window.location.reload()
        }
    });
}

function AzurirajBenzin() {
    const fb = firebase.database().ref()
    var Novo_stanje = document.getElementById("azuriraj_spremnik2").value
    aSpremnik_benzin.forEach(function (oSpremnikbenzin) {
        var Stanje = +oSpremnikbenzin.Stanje + +Novo_stanje;
        if (Novo_stanje < 1000) {
            window.alert("Minimalna količina je 1000 litara!")
        } else if (Stanje > 20000) {
            window.alert("Maksimalni kapacitet spremnika je 20000 litara!")
        } else {
            data = {
                Stanje
            }
            fb.child("Spremnik/1").update(data)
            window.location.reload()
        }
    });
}


function UcitajCijenaDiesel() {

    aSpremnik_diesel.forEach(function (oSpremnik_diesel) {

        $(".cijenad").append("<h3>" + oSpremnik_diesel.Cijena + " HRK/L</h3>");

    });

}

function UcitajCijenaBenzin() {

    aSpremnik_benzin.forEach(function (oSpremnik_benzin) {

        $(".cijenab").append("<h3>" + oSpremnik_benzin.Cijena + " HRK/L</h3>");

    });

}

function UcitajSpremnik() {

    aSpremnici.forEach(function (oSpremnik) {
        var VrstaGor = "";
        if (oSpremnik.VrstaGoriva == 1) {
            VrstaGor = "Diesel";
        } else if (oSpremnik.VrstaGoriva == 2) {
            VrstaGor = "Benzin";
        }
        $("#live").append("<div class=live>Stanje " + oSpremnik.Naziv + " / Maximum:</br>" + oSpremnik.Stanje + " L / 20000 L" + "</div></br>");
        $(document).ready(function () {});
    });
}
var data;
var _storno;

function PopuniTablicuRacuni() {
    var table;
    aRacuni.forEach(function (oRacuni) {
        var VrstaGor = "";
        if (oRacuni.VrstaGoriva == 1) {
            VrstaGor = "Diesel";
        } else if (oRacuni.VrstaGoriva == 2) {
            VrstaGor = "Benzin";
        }
        if (oRacuni.Storno == 1) {
            $("#table_body_storno").append("<tr><td>" + oRacuni.Kolicina + "</td><td>" + VrstaGor + "</td><td>" + oRacuni.DatumVrijeme + "</td><td>" + oRacuni.Zaposlenik + "</td><td>" + oRacuni.Cijena + "</td></tr>");
        } else {
            $("#table_body").append("<tr><td>" + oRacuni.Kolicina + "</td><td>" + VrstaGor + "</td><td>" + oRacuni.DatumVrijeme + "</td><td>" + oRacuni.Zaposlenik + "</td><td>" + oRacuni.Cijena + "</td></tr>");
        }
        $(document).ready(function () {
            table = $('#TablicaRacuni').DataTable();
            console.log(table);
        });
    });

    $(document).ready(function () {
        $('#TablicaRacuni tbody#table_body').on('click', 'tr', function () {
            data = table.row(this).data();
            $('#Storno').modal("show");
        });

        $('#TablicaRacuni tbody#table_body_storno').on('click', 'tr', function () {
            alert("Ovaj račun je već storniran.")
        });
    });
}

function Storno() {
    const fb = firebase.database().ref()
    var VrstaGoriva = data[1];
    var KolicinaGoriva = data[0];
    var Vrijeme = data[2];
    var _key;
    var childData;

    if (VrstaGoriva == 'Diesel') {
        aSpremnik_diesel.forEach(function (oSpremnikdiesel) {
            var Stanje = +oSpremnikdiesel.Stanje + +KolicinaGoriva;
            if (Stanje > 20000) {
                window.alert("Maksimalna količina u spremniku je 20000L, nemoguće stornirati.")
            } else {
                data = {
                    Stanje
                }
                fb.child("Spremnik/0").update(data)
                fb.child('Racun').orderByChild('Datumvrijeme').equalTo(Vrijeme).on("value", function (snapshot) {
                    //console.log(snapshot.val());
                    snapshot.forEach(function (data) {
                        _key = data.key;
                        childData = data.val();
                        var Storno = childData.Storno = 1
                        data2 = {
                            Storno
                        }
                        fb.child('Racun/' + _key).update(data2)
                    });
                });
                window.location.reload()
            }
        });
    } else if (VrstaGoriva == 'Benzin') {
        aSpremnik_benzin.forEach(function (oSpremnikbenzin) {
            var Stanje = +oSpremnikbenzin.Stanje + +KolicinaGoriva;
            if (Stanje > 20000) {
                window.alert("Maksimalna količina u spremniku je 20000L, nemoguće stornirati.")
            } else {
                data = {
                    Stanje
                }
            }
            fb.child("Spremnik/1").update(data)
            fb.child('Racun').orderByChild('Datumvrijeme').equalTo(Vrijeme).on("value", function (snapshot) {
               // console.log(snapshot.val());
                snapshot.forEach(function (data) {
                    _key = data.key;
                    childData = data.val();
                    var Storno = childData.Storno = 1
                    data2 = {
                        Storno
                    }
                    fb.child('Racun/' + _key).update(data2)
                });
            });
            window.location.reload()
        });
    }
}