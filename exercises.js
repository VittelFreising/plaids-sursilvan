window.PLAIDS_EXERCISES = [
[1,"Jeu sun da Cuera.","Ich komme aus Chur.","Herkunft: esser da + Ort."],
[1,"Nua habites ti?","Wo wohnst du?","Bei der Frage steht ti hinter dem Verb."],
[1,"Jeu hai ina sora.","Ich habe eine Schwester.","haver: jeu hai; sora ist feminin."],
[1,"Vus essas da Glion.","Sie kommen aus Ilanz.","Vus mit Grossbuchstaben bezeichnet die Höflichkeitsform."],
[1,"Ella studegia a Turitg.","Sie studiert in Zürich.","Bei Städten steht häufig a."],
[1,"Tgei fas ti oz?","Was machst du heute?","far: ti fas; oz bedeutet heute."],
[2,"Jeu prendel ina suppa.","Ich nehme eine Suppe.","prender: jeu prendel."],
[2,"La suppa ei buna.","Die Suppe ist gut.","Das Adjektiv richtet sich nach dem femininen Subjekt."],
[2,"Nus mein all’ustria.","Wir gehen ins Restaurant.","a + l’ustria → all’ustria."],
[2,"Vuleis vus aua?","Wollt ihr Wasser?","vuler: vus vuleis."],
[2,"Jeu beibel buc vin.","Ich trinke keinen Wein.","buc folgt der konjugierten Verbform."],
[2,"Portei a nus la carta!","Bringen Sie uns die Karte!","Der Imperativ Portei passt zu Vus."],
[3,"Jeu hai reservau duas combras.","Ich habe zwei Zimmer reserviert.","duas steht bei femininen Nomen."],
[3,"Dat ei ina combra libra?","Gibt es ein freies Zimmer?","Frage: Dat ei …? Aussage: Ei dat …"],
[3,"La combra ei el secund plaun.","Das Zimmer ist im zweiten Stock.","secund ist eine Ordnungszahl; el = en + il."],
[3,"Con cuosta la combra?","Wie viel kostet das Zimmer?","custar → cuosta."],
[3,"Nus vulein star treis notgs.","Wir möchten drei Nächte bleiben.","vulein + Infinitiv."],
[3,"Haveis Vus ina combra cun bogn?","Haben Sie ein Zimmer mit Bad?","Höfliche Frage mit Haveis Vus …?"],
[4,"Nus mein a pei entochen la posta.","Wir gehen zu Fuss bis zur Post.","a pei = zu Fuss; entochen = bis."],
[4,"L’apoteca ei sper il kiosc.","Die Apotheke ist neben dem Kiosk.","sper bezeichnet die Lage neben etwas."],
[4,"Jeu hai ina carta e jeu prendel ella.","Ich habe eine Karte und nehme sie.","ella ersetzt das feminine direkte Objekt ina carta."],
[4,"Nus prendin il tren e turnein la sera.","Wir nehmen den Zug und kommen am Abend zurück.","turnar → nus turnein; la sera = am Abend."],
[4,"Per vegnir alla posta stueis Vus ir a dretg.","Um zur Post zu kommen, müssen Sie nach rechts gehen.","per + Infinitiv drückt den Zweck aus; stueis Vus nach dem Vorfeld."],
[4,"Jeu vi dar in cudisch ad ella.","Ich will ihr ein Buch geben.","in cudisch ist direktes Objekt; ad ella bezeichnet die Empfängerin."],
[4,"La biblioteca ei serrada sur miezdi.","Die Bibliothek ist über Mittag geschlossen.","serrada stimmt mit la biblioteca überein."],
[4,"Quel kiosc ei aviarts, mo tschel ei serraus.","Dieser Kiosk ist offen, der andere aber geschlossen.","quel kann vor einem Nomen stehen; tschel kann ein Nomen ersetzen."],
[4,"Ella frestgera ha ei latg.","Im Kühlschrank gibt es Milch.","en + la → ella; nach der Ortsangabe folgt ha ei."],
[4,"Saveis Vus mussar a mi la via?","Können Sie mir den Weg zeigen?","saveis + Infinitiv; a mi = mir."]
];

(() => {
  const $ = id => document.getElementById(id);
  const all = window.PLAIDS_EXERCISES;
  let selected = [], index = 0;
  const normalize = s => s.normalize('NFC').toLowerCase().replace(/ß/g,'ss').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const render = () => {
    const [lesson, rm, de] = selected[index];
    $('exercise-position').textContent = 'Lecziun '+lesson+' · '+(index+1)+' / '+selected.length;
    $('exercise-prompt').textContent = $('exercise-direction').value === 'de-rm' ? de : rm;
    $('exercise-answer').value = '';
    $('exercise-result').hidden = true;
  };
  const reset = () => {
    const lesson = Number($('exercise-lesson').value);
    selected = all.filter(row => !lesson || row[0] === lesson);
    index = 0; render();
  };
  $('exercise-lesson').onchange = reset;
  $('exercise-direction').onchange = reset;
  $('exercise-next').onclick = () => { index = (index+1)%selected.length; render(); $('exercise-answer').focus(); };
  $('exercise-check').onclick = () => {
    const [, rm, de, hint] = selected[index];
    const model = $('exercise-direction').value === 'de-rm' ? rm : de;
    const answer = $('exercise-answer').value.trim();
    $('exercise-feedback').textContent = !answer ? 'Hier ist die Musterlösung.' : normalize(answer) === normalize(model) ? 'Stimmt mit der Musterlösung überein.' : 'Vergleiche deine Übersetzung mit der Musterlösung.';
    $('exercise-model').textContent = model;
    $('exercise-hint').textContent = hint;
    $('exercise-result').hidden = false;
  };
  reset();
})();
