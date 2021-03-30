// funkcija za logiranje u sistem putem firebase autentifikacije

let aLogin = [];

function Login() {
    let email = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            window.location.href = "naslovnica.html";
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            window.alert("Unijeli ste pogrešnu email adresu ili lozinku!");
        });
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        let user = firebase.auth().currentUser;
        let uid;
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

// odjavljivanje iz aplikacija putem firebase funkcije

function Logout() {
    firebase.auth().signOut().then(() => {
        window.alert("Odjavljeni ste!");
        window.location.href = "index.html";
    }).catch((error) => {
        // An error happened.
    });
}

// ucitavanje podataka iz firebase baze podataka u array

let oDb = firebase.database();
let aSpremnik_diesel = [];
let oDbSpremnik_diesel = oDb.ref('Spremnik').orderByChild('Naziv').equalTo('Diesel');
oDbSpremnik_diesel.on('value', function (oOdgovorPosluzitelja) {
    aSpremnik_diesel = [];
    oOdgovorPosluzitelja.forEach(function (oSpremnik_dieselSnapshot) {
        let oSpremnik_diesel = oSpremnik_dieselSnapshot.val();
        aSpremnik_diesel.push({
            Cijena: oSpremnik_diesel.Cijena,
            Stanje: oSpremnik_diesel.Stanje
        });
    });
    UcitajCijenaDiesel();
});

let aSpremnik_benzin = [];
let oDbSpremnik_benzin = oDb.ref('Spremnik').orderByChild('Naziv').equalTo('Benzin');
oDbSpremnik_benzin.on('value', function (oOdgovorPosluzitelja) {
    aSpremnik_benzin = [];
    oOdgovorPosluzitelja.forEach(function (oSpremnik_benzinSnapshot) {
        let oSpremnik_benzin = oSpremnik_benzinSnapshot.val();
        aSpremnik_benzin.push({
            Cijena: oSpremnik_benzin.Cijena,
            Stanje: oSpremnik_benzin.Stanje

        });
    });
    UcitajCijenaBenzin();
});

let aRacuni = [];
let oDbRacuni = oDb.ref('Racun');
oDbRacuni.on('value', function (oOdgovorPosluzitelja) {
    aRacuni = [];
    oOdgovorPosluzitelja.forEach(function (oRacuniSnapshot) {
        let oRacuni = oRacuniSnapshot.val();
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

let aSpremnici = [];
let oDbSpremnici = oDb.ref('Spremnik');
oDbSpremnici.on('value', function (oOdgovorPosluzitelja) {
    aSpremnici = [];
    oOdgovorPosluzitelja.forEach(function (oRacuniSnapshot) {
        let oSpremnik = oRacuniSnapshot.val();
        aSpremnici.push({
            idSpremnika: oSpremnik.Id_spremnika,
            Naziv: oSpremnik.Naziv,
            Stanje: oSpremnik.Stanje,
            Cijena: oSpremnik.Cijena
        });
    });
    UcitajSpremnik(); // pozivamo funkciju za ucitavanje spremnika, "live" prikaz stanja spremnika u svakom dijelu aplikacije (sidebar)
    // prikaz stanja spremnika putem grafa koristeci Plotly
    let Diesel_spremnik = 0;
    let Benzin_spremnik = 0;
    aSpremnici.forEach(function (oSpremnik) {
        if (oSpremnik.idSpremnika == 1) {
            Diesel_spremnik = parseInt(oSpremnik.Stanje);
        } else if (oSpremnik.idSpremnika == 2) {
            Benzin_spremnik = parseInt(oSpremnik.Stanje);
        }

    });
    let data = [{
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
    let layout = {
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

let aZaposlenici = [];
let oDbZaposlenici = oDb.ref('Zaposlenik');
oDbZaposlenici.on('value', function (oOdgovorPosluzitelja) {
    aZaposlenici = [];
    oOdgovorPosluzitelja.forEach(function (oZaposleniciSnapshot) {
        let oZaposlenici = oZaposleniciSnapshot.val();
        aZaposlenici.push({
            Ime_prezime: oZaposlenici.Ime_prezime,
            Id_zap: oZaposlenici.Id_zaposlenika
        });
    });
});

// funkcija za dodavanje nule u vrijeme ukoliko je npr 13:03:06, bez ovoga bi bio zapis 13:3:6

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// funkcija za izdavanje računa

function IzdajRacun() {
    let provjera = false;
    let sZaposlenik;
    let nKolicina_goriva = document.getElementById('Amount').value;
    let sVrsta_goriva_diesel = document.getElementById('diesel');
    let sVrsta_goriva_benzin = document.getElementById('benzin');
    let currentdate = new Date();
    let datetime = currentdate.getDate() + "/" +
        (currentdate.getMonth() + 1) + "/" +
        currentdate.getFullYear() + " " +
        currentdate.getHours() + ":" +
        addZero(currentdate.getMinutes()) + ":" +
        addZero(currentdate.getSeconds());
    let nId_goriva = 0;
    let sCijena = 0;
    let fCijena = 0;
    let defaultStorno = 0;
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
                    let Stanje = +oSpremnikdiesel.Stanje - +nKolicina_goriva;
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
                    let Stanje = +oSpremnikbenzin.Stanje - +nKolicina_goriva;
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
        let sKey = firebase.database().ref().child('Racun').push().key;
        aLogin.forEach(function (oLogin) {
            aZaposlenici.forEach(function (oZaposlenici) {
                if (oLogin.Uid == oZaposlenici.Id_zap) {
                    sZaposlenik = oZaposlenici.Ime_prezime;
                }
            });

        });
        let oRacun = {

            Cijena: fCijena,
            Datumvrijeme: datetime,
            Id_goriva: nId_goriva,
            Kolicina: nKolicina_goriva,
            Zaposlenik_izdao: sZaposlenik,
            Storno: defaultStorno
        };

        // Zapiši u Firebase
        let oZapis = {};
        oZapis[sKey] = oRacun;
        oDbRacuni.update(oZapis);
        location.reload();
    }
}

// u iduće dvije funkcije ažuriramo cijenu goriva

function AzurirajCijenaDiesel() {
    const fb = firebase.database().ref()
    let Nova_cijena = document.getElementById("azuriraj_cijenad").value
    let Cijena = +Nova_cijena;
    data = {
        Cijena
    }
    fb.child("Spremnik/0").update(data)
    window.location.reload();
}

function AzurirajCijenaBenzin() {
    const fb = firebase.database().ref()
    let Nova_cijena = document.getElementById("azuriraj_cijenab").value
    let Cijena = +Nova_cijena;
    data = {
        Cijena
    }
    fb.child("Spremnik/1").update(data)
    window.location.reload();
}

// u iduće dvije funkcije ažuriramo stanje spremnika goriva

function AzurirajDiesel() {
    const fb = firebase.database().ref()
    let Novo_stanje = document.getElementById("azuriraj_spremnik1").value
    aSpremnik_diesel.forEach(function (oSpremnikdiesel) {
        let Stanje = +oSpremnikdiesel.Stanje + +Novo_stanje;
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
    let Novo_stanje = document.getElementById("azuriraj_spremnik2").value
    aSpremnik_benzin.forEach(function (oSpremnikbenzin) {
        let Stanje = +oSpremnikbenzin.Stanje + +Novo_stanje;
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

// u iduće dvije funkcije učitavamo cijene goriva za tablicu na naslovnici


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

// u funkciji ucitavamo stanje spremnika za "live" pregled stanja spremnika koji se nalazi na svakoj stranici (sidebar)

function UcitajSpremnik() {
    aSpremnici.forEach(function (oSpremnik) {
        /*let VrstaGor = "";
        if (oSpremnik.VrstaGoriva == 1) {
            VrstaGor = "Diesel";
        } else if (oSpremnik.VrstaGoriva == 2) {
            VrstaGor = "Benzin";
        }
        if (oSpremnik.Stanje < 3000) {
            $("#live").append("<div class=achtung> Imate manje od 3000L goriva u "+ oSpremnik.Naziv +" spremniku!</div>")
        }*/
        $("#live").append("<div class=live>Stanje " + oSpremnik.Naziv + " / Maximum:</br>" + oSpremnik.Stanje + " L / 20000 L" + "</div></br>");
    });
}

// funkcija za ispis, sortiranje, filtriranje te storniranje svih izdanih računa

let data;

function PopuniTablicuRacuni() {
    let table;
    aRacuni.forEach(function (oRacuni) {
        let VrstaGor = "";
        if (oRacuni.VrstaGoriva == 1) {
            VrstaGor = "Diesel";
        } else if (oRacuni.VrstaGoriva == 2) {
            VrstaGor = "Benzin";
        }
        if (oRacuni.Storno == 1) {
            $("#table_body").append("<tr style='color:#ff0000;' data-storno=\"" + oRacuni.Storno + "\"><td>" + oRacuni.Kolicina + "</td><td>" + VrstaGor + "</td><td>" + oRacuni.DatumVrijeme + "</td><td>" + oRacuni.Zaposlenik + "</td><td>" + oRacuni.Cijena + "</td></tr>");
        } else {
            $("#table_body").append("<tr data-storno=\"" + oRacuni.Storno + "\"><td>" + oRacuni.Kolicina + "</td><td>" + VrstaGor + "</td><td>" + oRacuni.DatumVrijeme + "</td><td>" + oRacuni.Zaposlenik + "</td><td>" + oRacuni.Cijena + "</td></tr>");
        }
    });

    $(document).ready(function () {
        table = $('#TablicaRacuni').DataTable();

        $.fn.dataTable.ext.search.push(
            function (settings, searchData, index, rowData, counter) {
                var match = false;
                var searchTerm = settings.oPreviousSearch.sSearch.toLowerCase();
                searchData.forEach(function (item, index) {
                    if (item.toLowerCase().startsWith(searchTerm)) {
                        match = true;
                    }
                });
                return match;
            }
        );

        $('#TablicaRacuni tbody#table_body').on('click', 'tr', function () {
            let dataAttr = parseInt($(this).data('storno'), 10);
            switch (dataAttr) {
                case 1:
                    alert("Ovaj račun je već storniran");
                    break;

                default:
                    data = table.row(this).data();
                    $('#Storno').modal("show");
                    break;
            }

        });

    });
}

// funkcija koja se poziva prilikom klika na određeni redak u ispisu računa, služi za storniranje računa

function Storno() {
    const fb = firebase.database().ref()
    let VrstaGoriva = data[1];
    let KolicinaGoriva = data[0];
    let Vrijeme = data[2];
    let _key;
    let childData;

    if (VrstaGoriva == 'Diesel') {
        aSpremnik_diesel.forEach(function (oSpremnikdiesel) {
            let Stanje = +oSpremnikdiesel.Stanje + +KolicinaGoriva;
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
                        let Storno = childData.Storno = 1
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
            let Stanje = +oSpremnikbenzin.Stanje + +KolicinaGoriva;
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
                    let Storno = childData.Storno = 1
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